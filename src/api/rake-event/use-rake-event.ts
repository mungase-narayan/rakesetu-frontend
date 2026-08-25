import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { rakeEventKeys } from './query-keys';
import type {
  ListAnomaliesQuery,
  ListEventsQuery,
  ListRakeStatesQuery,
} from '@/types/rake-event.types';

/** How often the map asks again. Phase 5 replaces this with SSE. */
export const NETWORK_POLL_MS = 5_000;

/**
 * The map feed, polled.
 *
 * Deliberately polling and not a stream: Phase 5 owns the transport, and
 * shipping the §11 vertical slice must not wait on SSE plumbing. Five seconds
 * is chosen against the demo, where the simulator at `--speed 500` moves a
 * marker roughly that often — slower and the map looks static, faster and it is
 * forty requests a minute for a network that changes once.
 *
 * `asOf` comes from the server, and the screen renders it. An unlabelled stale
 * map is worse than no map: it is a wrong answer that looks like a right one.
 */
export const useRakeLive = ({
  enabled = true,
  /**
   * Whether to keep polling.
   *
   * Set to `false` by a screen whose SSE stream is up — the frames patch this
   * exact cache entry in place, so a poll alongside them would be five seconds
   * of redundant traffic and a periodic flicker as a full snapshot replaced the
   * patched one. It flips back to `true` the moment `useRakeStream` reports
   * that it has fallen back, which is what keeps the map working when the
   * stream does not.
   */
  poll = true,
}: { enabled?: boolean; poll?: boolean } = {}) => {
  const { data, isLoading, isError, dataUpdatedAt, isFetching } = useQuery({
    queryKey: rakeEventKeys.networkLive(),
    queryFn: () => apis.getNetworkLive(),
    select: (res) => res.data.data,
    refetchInterval: enabled && poll ? NETWORK_POLL_MS : false,
    // The point of a live map is that it catches up when you come back to it.
    refetchOnWindowFocus: true,
    // A blink to "loading" every five seconds would make the map unreadable.
    placeholderData: (previous) => previous,
    enabled,
  });

  return {
    live: data,
    rakes: data?.rakes,
    terminals: data?.terminals,
    counts: data?.counts,
    asOf: data?.asOf,
    isLoading,
    isFetching,
    isError,
    dataUpdatedAt,
  };
};

export const useRakeStateList = (params: ListRakeStatesQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: rakeEventKeys.rakeStateList(params),
    queryFn: () => apis.getRakeStates({ params }),
    select: (res) => res.data.data,
  });

  return {
    rakes: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

/**
 * Section geometry and how busy each one has been.
 *
 * Five minutes stale, because a traversal count over a 24-hour window does not
 * move perceptibly faster than that — and the same response supplies the
 * coordinates the selected rake's path is drawn from, so it must be present
 * before a selection can be rendered rather than fetched on click.
 */
export const useSectionLoad = (hours = 24) => {
  const { data, isLoading } = useQuery({
    queryKey: rakeEventKeys.sectionLoad(hours),
    queryFn: () => apis.getSectionLoad({ hours }),
    select: (res) => res.data.data,
    staleTime: 5 * 60_000,
  });

  return {
    sections: data?.sections,
    maxTraversals: data?.maxTraversals ?? 0,
    isLoading,
  };
};

/** The controller dashboard's "Empty rakes available" tile. */
export const useAvailableRakeCount = () => {
  const { data, isLoading } = useQuery({
    queryKey: rakeEventKeys.availableCount(),
    queryFn: () => apis.getAvailableCount(),
    select: (res) => res.data.data.count,
  });

  return { count: data, isLoading };
};

export const useRakeEvents = (rakeId: string, params: ListEventsQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: rakeEventKeys.eventList(rakeId, params),
    queryFn: () => apis.getEvents({ rakeId, params }),
    select: (res) => res.data.data,
    enabled: Boolean(rakeId),
  });

  return {
    events: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useRakeState = (rakeId: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: rakeEventKeys.state(rakeId),
    queryFn: () => apis.getState({ rakeId }),
    select: (res) => res.data.data,
    enabled: Boolean(rakeId),
    // A rake with no events answers 404, which is a real answer about a real
    // rake rather than a failure worth retrying three times.
    retry: false,
  });

  return { state: data, isLoading, isError };
};

export const useRakeCycles = (rakeId: string) => {
  const { data, isLoading } = useQuery({
    queryKey: rakeEventKeys.cycles(rakeId),
    queryFn: () => apis.getCycles({ rakeId }),
    select: (res) => res.data.data,
    enabled: Boolean(rakeId),
  });

  return { cycles: data?.data, pagination: data?.pagination, isLoading };
};

export const useAnomalyList = (params: ListAnomaliesQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: rakeEventKeys.anomalyList(params),
    queryFn: () => apis.getAnomalies({ params }),
    select: (res) => res.data.data,
  });

  return {
    anomalies: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

/** The determinism check. Invalidates everything it could have rewritten. */
export const useReproject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ rakeId }: { rakeId: string }) => apis.reproject({ rakeId }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: rakeEventKeys.all }),
    retry: false,
  });

  return {
    reproject: mutation.mutate,
    reprojectAsync: mutation.mutateAsync,
    result: mutation.data?.data.data,
    isLoading: mutation.isPending,
  };
};
