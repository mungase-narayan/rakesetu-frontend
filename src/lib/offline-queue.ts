/**
 * A durable outbox for events logged at a siding.
 *
 * **Why this exists.** Sidings have bad signal. A supervisor logs a placement,
 * the request never leaves the phone, and the only honest options are to lose
 * the event or to keep it. Losing it means the demurrage clock starts whenever
 * somebody next remembers — which is a number on an invoice. So it is kept, in
 * `localStorage`, and retried.
 *
 * **Why this is safe.** Every queued submission carries the
 * `Idempotency-Key` it was *first* created with, and that key is never
 * regenerated on a retry. That single rule is what turns "retry until it lands"
 * from a double-counting bug into a guarantee: the server's `rake_event_keys`
 * table has a primary key on it, so the second arrival of the same key writes
 * nothing whatever happens to the network in between. This is the whole reason
 * idempotency was built in Phase 1 rather than bolted on here.
 *
 * The queue is per browser, not per user — `localStorage` is origin-scoped. A
 * shared tablet at a siding is the normal case, and the entries carry the rake
 * they belong to, so the banner is honest about what is outstanding no matter
 * who is signed in when it drains.
 */
import type { RakeEventType } from '@/types/rake-event.types';

const STORAGE_KEY = 'rakesetu:event-outbox:v1';

/**
 * Give up after this many failures.
 *
 * Not because the event stops mattering, but because an entry that has failed
 * eight times is failing for a reason a retry will not fix — a 422, a rake that
 * has since moved on — and a queue that retries forever is a queue that hides a
 * broken submission behind an always-spinning badge. A dead entry stays visible
 * and says why.
 */
export const MAX_ATTEMPTS = 8;

export interface QueuedEventBody {
  eventType: RakeEventType;
  occurredAt: string;
  stationCode?: string | null;
  terminalId?: string | null;
  payload?: Record<string, unknown>;
}

export interface QueuedEvent {
  /** **The idempotency key, and the queue id.** One value, never regenerated. */
  key: string;
  rakeId: string;
  rakeCode: string;
  body: QueuedEventBody;
  queuedAt: string;
  attempts: number;
  lastError: string | null;
  /** True once `MAX_ATTEMPTS` is reached — kept, shown, no longer retried. */
  dead: boolean;
}

type Listener = (queue: QueuedEvent[]) => void;

const listeners = new Set<Listener>();

/**
 * Reads the outbox, tolerating anything.
 *
 * A parse failure returns an empty queue rather than throwing. This runs on
 * every render of the banner; a corrupted value — a half-written entry from a
 * browser killed mid-write, a key some other tab wrote — must not be able to
 * take the logging screen down, because the logging screen is the thing that
 * would let a supervisor recover.
 */
export const readOutbox = (): QueuedEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is QueuedEvent =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as QueuedEvent).key === 'string' &&
        typeof (entry as QueuedEvent).rakeId === 'string'
    );
  } catch {
    return [];
  }
};

const write = (queue: QueuedEvent[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Quota, a private window, storage disabled. The submission is already in
    // flight or already failed; losing the durable copy is bad but silent
    // failure here is better than an exception inside a mutation's onError.
  }
  for (const listener of listeners) listener(queue);
};

/**
 * Adds a submission, or refreshes the one already there.
 *
 * Keyed on the idempotency key, so enqueueing the same submission twice — a
 * double tap while offline — produces one entry, not two.
 */
export const enqueue = (
  entry: Omit<QueuedEvent, 'attempts' | 'lastError' | 'dead'>
): void => {
  const queue = readOutbox();
  const existing = queue.findIndex((item) => item.key === entry.key);

  if (existing >= 0) {
    queue[existing] = { ...queue[existing], ...entry };
  } else {
    queue.push({ ...entry, attempts: 0, lastError: null, dead: false });
  }

  write(queue);
};

export const dequeue = (key: string): void => {
  write(readOutbox().filter((entry) => entry.key !== key));
};

/** Records a failed attempt, marking the entry dead at the ceiling. */
export const recordFailure = (key: string, message: string): void => {
  const queue = readOutbox().map((entry) => {
    if (entry.key !== key) return entry;
    const attempts = entry.attempts + 1;
    return {
      ...entry,
      attempts,
      lastError: message,
      dead: attempts >= MAX_ATTEMPTS,
    };
  });
  write(queue);
};

/** Drops the entries that will never be retried again. The banner's "dismiss". */
export const clearDead = (): void => {
  write(readOutbox().filter((entry) => !entry.dead));
};

export const subscribeToOutbox = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Whether a failure is worth retrying.
 *
 * **Only a transport failure is.** Axios reports one as an error with no
 * `response` — the request never reached a server that could form an opinion.
 * Anything with a status is the server's answer: a 422 will be 422 forever, and
 * a 409 means the event is already recorded, which is a *success* as far as the
 * outbox is concerned. Retrying either would be a queue that never drains and a
 * banner that never clears.
 */
export const isRetriable = (error: unknown): boolean => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status === undefined) return true;
  // 5xx is the server failing to answer rather than answering "no".
  return status >= 500;
};

/** A 409 on a queued submission means it already landed. Drop it, quietly. */
export const isAlreadyRecorded = (error: unknown): boolean =>
  (error as { response?: { status?: number } })?.response?.status === 409;

/**
 * A fresh idempotency key.
 *
 * `crypto.randomUUID()` is only defined in a **secure context** — https, or
 * localhost. A tablet at a siding reached over plain http on the yard LAN is
 * not one, and there the call throws. That would take out the single mechanism
 * this whole module rests on, on exactly the device it was written for, so the
 * fallback is not defensive padding: without it the offline screen is broken in
 * precisely the deployment that needs it.
 *
 * The fallback does not have to be a v4 UUID and does not pretend to be one. It
 * has to be unique enough that two submissions from one device never collide,
 * and `getRandomValues` — available without a secure context — supplies that.
 */
export const newIdempotencyKey = (): string => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    try {
      return crypto.randomUUID();
    } catch {
      // Falls through to the bytes below.
    }
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  // The timestamp prefix is not for uniqueness — it makes an entry sitting in
  // the outbox readable in devtools when somebody is working out why it is
  // stuck.
  return `k${Date.now().toString(36)}-${hex}`;
};
