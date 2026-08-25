import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';

import { appEnv } from '@/constants';
// Imported directly rather than through the barrel: this module is re-exported
// from `hooks/index.ts`, and going back through it would make the barrel import
// itself — which resolves, until the day the evaluation order changes.
import useAuth from './use-auth';
import { rakeEventKeys } from '@/api/rake-event';
import type { ApiResponse } from '@/types/shared.types';
import type { NetworkLive, RakeStateFrame } from '@/types/rake-event.types';

/**
 * How the map is currently being fed.
 *
 * Rendered on the screen rather than kept internal: "live" and "polled every
 * five seconds" are different promises, and a map that quietly degrades from
 * one to the other while still looking live is the same class of lie as an
 * unlabelled stale timestamp.
 */
export type Transport = 'connecting' | 'stream' | 'polling';

/** Consecutive failures before the stream is abandoned for polling. */
const MAX_FAILURES = 2;

/** Delay before the one retry that is attempted. */
const RETRY_MS = 3_000;

/**
 * The cached value is the **whole axios response**, not the payload.
 *
 * `useRakeLive` sets `queryFn: () => apis.getNetworkLive()` and narrows with
 * `select`, so what TanStack Query holds is `AxiosResponse<ApiResponse<…>>` and
 * a patch has to reach through both wrappers. Writing the payload shape
 * straight into the cache would type-check against `select`'s output and then
 * blank the map, because every reader goes through `select` first.
 */
type LiveCache = AxiosResponse<ApiResponse<NetworkLive>>;

const MS_PER_HOUR = 3_600_000;

/**
 * Applies one `rake.state` frame to the cached map feed, in place.
 *
 * **Patched, not invalidated.** An invalidation would refetch the whole feed on
 * every event — during a simulator run that is dozens of requests a second, and
 * the map would flicker through a loading state each time. The frame already
 * carries everything a marker needs, so the rake it names is replaced and
 * nothing else is touched.
 *
 * A frame for a rake the snapshot has never seen is **appended**: a rake
 * activated since the last full fetch is a real rake, and dropping it would let
 * the map disagree with the fleet list until somebody refreshed.
 */
const applyStateFrame = (
  previous: LiveCache,
  frame: RakeStateFrame
): LiveCache => {
  const live = previous.data.data;
  const index = live.rakes.findIndex((rake) => rake.rakeId === frame.rakeId);
  const existing = index >= 0 ? live.rakes[index] : null;

  const patched = {
    // Fields the frame does not carry — wagon type, wagon count, home division
    // — are kept from the snapshot rather than blanked. The frame is a delta.
    rakeId: frame.rakeId,
    code: frame.code,
    wagonTypeCode: existing?.wagonTypeCode ?? '',
    wagonCount: existing?.wagonCount ?? 0,
    homeDivision: existing?.homeDivision ?? '',
    state: frame.state,
    previousState: frame.previousState,
    stateGroup: frame.stateGroup,
    since: frame.since,
    hoursInState:
      Math.round(
        ((Date.now() - new Date(frame.since).getTime()) / MS_PER_HOUR) * 10
      ) / 10,
    stationCode: frame.stationCode,
    stationName: frame.stationName,
    lat: frame.lat,
    lng: frame.lng,
    terminalId: frame.terminalId,
    cycleId: existing?.cycleId ?? null,
    lastEventAt: new Date().toISOString(),
    isDirty: frame.isDirty,
  };

  const rakes =
    index >= 0
      ? live.rakes.map((rake, at) => (at === index ? patched : rake))
      : [...live.rakes, patched];

  const counts: Record<string, number> = {};
  for (const rake of rakes) counts[rake.state] = (counts[rake.state] ?? 0) + 1;

  return {
    ...previous,
    data: {
      ...previous.data,
      data: {
        ...live,
        // The server's clock still owns "as of", and a frame is newer than the
        // snapshot it patched — so the label advances rather than freezing at
        // the last full fetch.
        asOf: new Date().toISOString(),
        rakes,
        counts: counts as NetworkLive['counts'],
      },
    },
  };
};

/**
 * The live feed over Server-Sent Events, with Phase 4's polling as the floor.
 *
 * **The map keeps working when the stream does not.** Two consecutive failures
 * — a proxy that strips `text/event-stream`, a 429 because the user already has
 * five tabs open, devtools blocking the request — and this stops trying and
 * reports `polling`, which is the caller's cue to re-enable the five-second
 * refetch. That is the whole reason the transport is reported rather than
 * hidden: the fallback has to be observable, or nobody finds out it happened.
 *
 * The token rides in the query string because `EventSource` cannot set a
 * header. The server validates it exactly as it validates a header token and
 * still takes the tenant from the session, so the URL decides nothing except
 * who is asking.
 */
export const useRakeStream = ({
  enabled = true,
}: { enabled?: boolean } = {}) => {
  const queryClient = useQueryClient();
  const { tokens } = useAuth();
  const token = tokens?.accessToken;

  const [streamState, setStreamState] = useState<Transport>('connecting');

  /**
   * Derived, not stored.
   *
   * "No token, or streaming switched off" is a fact about the props, and
   * writing it into state inside an effect would mean one render reporting
   * `connecting` before a second render corrected it — a flicker on every mount
   * and a cascading render for a value that was already knowable.
   */
  const transport: Transport = !enabled || !token ? 'polling' : streamState;
  const [lastFrameAt, setLastFrameAt] = useState<number | null>(null);

  const failures = useRef(0);
  /** Survives a reconnect, so the server can replay the gap. */
  const lastEventId = useRef<string | null>(null);

  const onFrame = useCallback(
    (event: MessageEvent<string>) => {
      if (event.lastEventId) lastEventId.current = event.lastEventId;
      setLastFrameAt(Date.now());

      try {
        const frame = JSON.parse(event.data) as RakeStateFrame;
        queryClient.setQueryData<LiveCache>(
          rakeEventKeys.networkLive(),
          (previous) => (previous ? applyStateFrame(previous, frame) : previous)
        );
      } catch {
        // A frame this build cannot parse is a version skew, not a reason to
        // tear down the stream. The next full fetch corrects the map.
      }
    },
    [queryClient]
  );

  useEffect(() => {
    if (!enabled || !token) return;

    let source: EventSource | null = null;
    let retryTimer: number | undefined;
    let closed = false;

    const open = () => {
      if (closed) return;

      const url = new URL(`${appEnv.BACKEND_BASE_URL}/network/stream`);
      url.searchParams.set('token', token);
      if (lastEventId.current) {
        url.searchParams.set('lastEventId', lastEventId.current);
      }

      source = new EventSource(url.toString());

      source.onopen = () => {
        failures.current = 0;
        setStreamState('stream');
      };

      source.addEventListener('rake.state', onFrame as EventListener);

      source.addEventListener('heartbeat', () => setLastFrameAt(Date.now()));

      source.addEventListener('resync', () => {
        // The server could not replay the gap. Refetching the whole feed is the
        // only honest recovery — continuing to patch would leave the map
        // confidently wrong about the rakes that moved while we were away.
        lastEventId.current = null;
        void queryClient.invalidateQueries({
          queryKey: rakeEventKeys.networkLive(),
        });
      });

      source.onerror = () => {
        // Closed explicitly so `EventSource`'s own reconnect does not race the
        // retry policy below — two reconnect loops would double the load and
        // make the fallback threshold meaningless.
        source?.close();
        if (closed) return;

        failures.current += 1;
        if (failures.current >= MAX_FAILURES) {
          setStreamState('polling');
          return;
        }

        setStreamState('connecting');
        retryTimer = window.setTimeout(open, RETRY_MS);
      };
    };

    open();

    return () => {
      closed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      source?.close();
    };
  }, [enabled, token, onFrame, queryClient]);

  return {
    transport,
    isLive: transport === 'stream',
    lastFrameAt,
  };
};

export default useRakeStream;
