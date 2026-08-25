import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Timer02Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatHours } from '@/lib/duration';
import { fromIstInputValue, toIstInputValue } from '@/lib/ist';
import { RAKE_STATE_LABELS } from '@/constants/master-data.constants';
import { RAKE_EVENT_TYPE_LABELS } from '@/constants/rake-event.constants';
import { useLogEvent } from '@/api/rake-event';
import { newIdempotencyKey } from '@/lib/offline-queue';
import type { NextEvents } from '@/types/terminal-board.types';
import type { RakeEventType } from '@/types/rake-event.types';

import EventFields from './event-fields';
import {
  buildPayload,
  emptyFieldValues,
  validateFields,
  type EventFieldValues,
} from './event-fields.helpers';

/** The exception entries, kept behind a second row so the happy path is one tap. */
const EXCEPTION_EVENTS: RakeEventType[] = [
  'DETAINED',
  'MARKED_SICK',
  'HELD_FOR_ORDER',
  'DIVERTED',
];

/**
 * One rake, one card, and the next legal event as the primary button.
 *
 * **The buttons come from the server's transition table.** `entry.legal` is
 * `legalEventsFrom(state)` computed by the same module the projector judges
 * against, so an illegal option is never offered — not hidden by a condition
 * somebody has to remember to update, but absent because the state machine did
 * not name it. A second copy of that table in the browser would drift the first
 * time a transition changed, and the symptom would be a button that always 409s.
 *
 * **No optimistic update.** §7's convention, and this is the screen it was
 * written for: the card shows a pending state until the server confirms.
 * Painting the new state immediately and rolling it back on refusal would mean
 * a supervisor sees "placed", starts their next task, and never learns the
 * event did not land — and the free-time clock these events start is money.
 */
const RakeLogCard = ({
  entry,
  terminalId,
  stationCode,
  only,
}: {
  entry: NextEvents;
  terminalId: string;
  stationCode: string;
  /**
   * Narrows what this card offers — the exception screen shows only the
   * exception entries and their exits.
   *
   * **Always intersected with `entry.legal`, never unioned.** A caller can hide
   * a legal event; nothing can make an illegal one appear. That asymmetry is
   * what keeps the transition table the single authority even when a screen has
   * an opinion about what it is for.
   */
  only?: RakeEventType[];
}) => {
  const [open, setOpen] = useState<RakeEventType | null>(null);

  return (
    <li className="rounded-xl border border-border/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-semibold">{entry.code}</p>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <HugeiconsIcon icon={Timer02Icon} size={13} strokeWidth={2} />
            {formatHours(entry.hoursInState)} in state
          </p>
        </div>
        <Badge
          variant={entry.clearing.length > 0 ? 'destructive' : 'secondary'}
        >
          {RAKE_STATE_LABELS[entry.state]}
        </Badge>
      </div>

      {open ? (
        <LogForm
          entry={entry}
          eventType={open}
          terminalId={terminalId}
          stationCode={stationCode}
          onDone={() => setOpen(null)}
        />
      ) : (
        <ActionButtons entry={entry} onPick={setOpen} only={only} />
      )}
    </li>
  );
};

/**
 * The legal set, arranged by how often it is the right answer.
 *
 * The forward step first and large — this is a phone held in one hand at a
 * siding — then the other lifecycle events, then the exceptions on their own
 * row. `clearing` takes the primary slot when the rake is stuck, because the
 * only thing anybody wants to do with a detained rake is un-detain it.
 */
const ActionButtons = ({
  entry,
  onPick,
  only,
}: {
  entry: NextEvents;
  onPick: (eventType: RakeEventType) => void;
  only?: RakeEventType[];
}) => {
  const legal = only
    ? entry.legal.filter((event) => only.includes(event))
    : entry.legal;

  const preferred = entry.clearing[0] ?? entry.primary;
  const primary =
    preferred && legal.includes(preferred) ? preferred : (legal[0] ?? null);

  const exceptions = legal.filter(
    (event) => EXCEPTION_EVENTS.includes(event) && event !== primary
  );
  const others = legal.filter(
    (event) =>
      event !== primary &&
      !EXCEPTION_EVENTS.includes(event) &&
      event !== 'CORRECTION'
  );

  if (!primary && others.length === 0 && exceptions.length === 0) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        Nothing can be logged against this rake from its current state.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {primary && (
        <Button
          className="h-12 w-full text-base"
          onClick={() => onPick(primary)}
        >
          {RAKE_EVENT_TYPE_LABELS[primary]}
        </Button>
      )}

      {others.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {others.map((event) => (
            <Button
              key={event}
              variant="outline"
              className="h-11 flex-1"
              onClick={() => onPick(event)}
            >
              {RAKE_EVENT_TYPE_LABELS[event]}
            </Button>
          ))}
        </div>
      )}

      {exceptions.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-2">
          {exceptions.map((event) => (
            <Button
              key={event}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onPick(event)}
            >
              {RAKE_EVENT_TYPE_LABELS[event]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const LogForm = ({
  entry,
  eventType,
  terminalId,
  stationCode,
  onDone,
}: {
  entry: NextEvents;
  eventType: RakeEventType;
  terminalId: string;
  stationCode: string;
  onDone: () => void;
}) => {
  const { logEvent, isPending } = useLogEvent();

  /**
   * **One idempotency key per form instance, held across every retry.**
   *
   * Minted once with `useState`'s lazy initialiser, so it survives every
   * re-render — including the ones a failed submit causes. If this were
   * computed inline, a second tap would carry a second key and the server would
   * have no way to tell a retry from a genuine second placement. That is the
   * whole mechanism, and it is three lines.
   */
  const [idempotencyKey] = useState(newIdempotencyKey);

  const [occurredAt, setOccurredAt] = useState(() =>
    toIstInputValue(new Date())
  );
  const [values, setValues] = useState<EventFieldValues>(emptyFieldValues);
  const [error, setError] = useState<string | null>(null);

  /**
   * Capped at now, in the input and again before submit.
   *
   * The `max` attribute is a courtesy — a mobile picker honours it, a
   * hand-typed value may not — and the server refuses a future `occurredAt`
   * with a 422 regardless. Three layers for one rule, because a placement
   * stamped in the future starts a demurrage clock before the rake arrives.
   */
  const maxValue = toIstInputValue(new Date());

  const submit = async () => {
    const fieldError = validateFields(eventType, values);
    if (fieldError) {
      setError(fieldError);
      return;
    }

    const when = fromIstInputValue(occurredAt);
    if (Number.isNaN(when.getTime())) {
      setError('That is not a valid time.');
      return;
    }
    if (when.getTime() > Date.now()) {
      setError('An event cannot have happened in the future.');
      return;
    }

    setError(null);

    try {
      await logEvent({
        rakeId: entry.rakeId,
        rakeCode: entry.code,
        key: idempotencyKey,
        data: {
          eventType,
          occurredAt: when.toISOString(),
          stationCode,
          // Every lifecycle event at this screen happens *at this terminal*, and
          // the projection reads `terminal_id` to decide which lines are
          // occupied. Omitting it would leave the board unable to see its own
          // placements.
          terminalId,
          payload: buildPayload(eventType, values),
        },
      });
      onDone();
    } catch (caught) {
      // The toast has already been raised by the request layer, and a queued
      // submission has already been put in the outbox. What is left is to keep
      // the form open with the same key, so the retry is the same event.
      const message =
        (caught as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? null;
      setError(message);
    }
  };

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-sm font-medium">{RAKE_EVENT_TYPE_LABELS[eventType]}</p>

      <div className="space-y-1.5">
        <Label htmlFor="occurredAt">
          When it happened{' '}
          <span className="font-normal text-muted-foreground">(IST)</span>
        </Label>
        <Input
          id="occurredAt"
          type="datetime-local"
          className="h-11"
          value={occurredAt}
          max={maxValue}
          disabled={isPending}
          onChange={(event) => setOccurredAt(event.target.value)}
        />
        <p className="text-[11px] text-muted-foreground">
          Defaults to now. Change it if you are catching up on something that
          happened earlier — it cannot be in the future.
        </p>
      </div>

      <EventFields
        eventType={eventType}
        values={values}
        disabled={isPending}
        onChange={(patch) => setValues((current) => ({ ...current, ...patch }))}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          className={cn('h-11 flex-1', isPending && 'pointer-events-none')}
          disabled={isPending}
          onClick={() => void submit()}
        >
          {/*
            The pending label is explicit about *why* nothing has changed yet.
            "Saving…" would be a spinner; "Waiting for the server" says the
            state on this card is not yet a fact.
          */}
          {isPending ? 'Waiting for the server…' : 'Record it'}
        </Button>
        <Button
          variant="ghost"
          className="h-11"
          disabled={isPending}
          onClick={onDone}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default RakeLogCard;
