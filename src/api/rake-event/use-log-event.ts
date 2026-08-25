import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { apis } from './apis';
import { rakeEventKeys } from './query-keys';
import { etaKeys } from '@/api/eta';
import { terminalKeys } from '@/api/terminal';
import { successToast, warningToast } from '@/lib/toast.lib';
import {
  dequeue,
  enqueue,
  isAlreadyRecorded,
  isRetriable,
  readOutbox,
  recordFailure,
  subscribeToOutbox,
  type QueuedEvent,
} from '@/lib/offline-queue';
import type { CreateEventBody } from '@/types/rake-event.types';

/** How often a browser that believes it is online retries the outbox. */
const FLUSH_INTERVAL_MS = 30_000;

export interface LogEventVariables {
  rakeId: string;
  rakeCode: string;
  /**
   * **Generated once per form instance and reused across every retry.**
   *
   * This is the single most important value in the write path. A key minted per
   * *attempt* would make the header decorative: two taps on a flaky connection
   * would be two placements, and detention hours are money. The quick-entry
   * form holds one key from the moment the card opens until the submission
   * lands, and the outbox carries it for as long as it takes after that.
   */
  key: string;
  data: CreateEventBody;
}

/**
 * Everything that has to be re-read after an event lands.
 *
 * Listed once rather than at each call site: the event moves the rake, so the
 * board, the legal-events list, the map feed and that rake's ETA are all now
 * describing a world that has changed. Missing one of them is how a screen ends
 * up showing a rake as still placed after somebody released it.
 */
const invalidateAfterWrite = (client: QueryClient, rakeId: string): void => {
  void client.invalidateQueries({ queryKey: terminalKeys.all });
  void client.invalidateQueries({ queryKey: rakeEventKeys.networkLive() });
  void client.invalidateQueries({ queryKey: rakeEventKeys.events(rakeId) });
  void client.invalidateQueries({ queryKey: rakeEventKeys.state(rakeId) });
  void client.invalidateQueries({ queryKey: etaKeys.rake(rakeId) });
};

/**
 * Logs one event.
 *
 * **No optimistic update** — §7's convention, and it is not a style choice. An
 * optimistic placement would show the rake as placed, start the free-time clock
 * on screen, and then have to be silently withdrawn if the server refused the
 * transition. These events move money; the card stays pending until the server
 * has said yes.
 *
 * A transport failure is not a failure of the submission: the entry goes to the
 * outbox with its key and is retried. Anything the server actually answered —
 * a 422 for a future timestamp, a 409 for an illegal transition — is a real
 * refusal and is surfaced, not queued.
 */
export const useLogEvent = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ rakeId, key, data }: LogEventVariables) =>
      apis.createEvent({ rakeId, idempotencyKey: key, data }),

    onSuccess: (_result, variables) => {
      dequeue(variables.key);
      invalidateAfterWrite(queryClient, variables.rakeId);
    },

    onError: (error, variables) => {
      if (isAlreadyRecorded(error)) {
        // The durable key already holds this submission. That is the guard
        // working, not a failure — the event is recorded exactly once.
        dequeue(variables.key);
        invalidateAfterWrite(queryClient, variables.rakeId);
        return;
      }

      if (!isRetriable(error)) return;

      enqueue({
        key: variables.key,
        rakeId: variables.rakeId,
        rakeCode: variables.rakeCode,
        body: variables.data,
        queuedAt: new Date().toISOString(),
      });

      warningToast({
        message: `Saved offline — ${variables.rakeCode} ${variables.data.eventType} will be sent when the connection returns.`,
      });
    },

    // The outbox is the retry mechanism; a second one inside the mutation would
    // fire three requests before the entry was ever queued.
    retry: false,
  });

  return {
    logEvent: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    pendingKey: mutation.variables?.key,
  };
};

/**
 * Sends one queued entry. Resolves to whether it is now gone from the outbox.
 *
 * The key is taken from the entry, never regenerated — the whole guarantee
 * rests on that, so it is worth saying twice.
 */
const flushOne = async (
  entry: QueuedEvent,
  client: QueryClient
): Promise<boolean> => {
  try {
    await apis.createEvent({
      rakeId: entry.rakeId,
      idempotencyKey: entry.key,
      data: entry.body,
    });
    dequeue(entry.key);
    invalidateAfterWrite(client, entry.rakeId);
    return true;
  } catch (error) {
    if (isAlreadyRecorded(error)) {
      dequeue(entry.key);
      invalidateAfterWrite(client, entry.rakeId);
      return true;
    }

    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ??
      (error as Error)?.message ??
      'Unknown error';

    recordFailure(entry.key, message);
    return false;
  }
};

const emptyOutbox: QueuedEvent[] = [];
let snapshot: QueuedEvent[] = readOutbox();

/**
 * `useSyncExternalStore` needs a stable snapshot, and `readOutbox()` parses
 * fresh JSON every call — a new array every render, which React reads as an
 * infinite change. The cached copy is replaced only when the store actually
 * notifies.
 */
const getSnapshot = (): QueuedEvent[] => snapshot;

const subscribe = (onChange: () => void): (() => void) =>
  subscribeToOutbox((queue) => {
    snapshot = queue;
    onChange();
  });

/**
 * The outbox, as a hook: what is waiting, and the drain that empties it.
 *
 * Retried on reconnect and on a slow interval, and **only while the browser
 * believes it is online** — a device with no signal would otherwise spend its
 * battery firing requests that cannot leave, and every one of them would raise
 * a toast.
 */
export const useOutbox = () => {
  const queryClient = useQueryClient();
  const queue = useSyncExternalStore(subscribe, getSnapshot, () => emptyOutbox);

  const flush = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

    const pending = readOutbox().filter((entry) => !entry.dead);
    if (pending.length === 0) return;

    let sent = 0;
    for (const entry of pending) {
      // Sequentially, not in parallel: two events for the same rake have an
      // order, and firing them together would let the second be judged against
      // a projection the first has not moved yet.
      if (await flushOne(entry, queryClient)) sent += 1;
    }

    if (sent > 0) {
      successToast({
        message: `${sent} queued event${sent === 1 ? '' : 's'} sent.`,
      });
    }
  }, [queryClient]);

  useEffect(() => {
    void flush();

    const onOnline = () => void flush();
    window.addEventListener('online', onOnline);
    const timer = window.setInterval(() => void flush(), FLUSH_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(timer);
    };
  }, [flush]);

  return {
    queue,
    pending: queue.filter((entry) => !entry.dead),
    dead: queue.filter((entry) => entry.dead),
    flush,
  };
};
