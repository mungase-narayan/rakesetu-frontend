import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Timer02Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { IstTime } from '@/components/shared';
import { formatHours } from '@/lib/duration';
import { RAKE_STATE_LABELS } from '@/constants/master-data.constants';
import type { BoardOnHand } from '@/types/terminal-board.types';

/**
 * One rake standing on a line, with its clock running.
 *
 * **The tint is an operational warning, not a charge.** Amber means the rake is
 * inside the last fifth of its free time; red means it is past it. Neither says
 * anything about money — Phase 9 owns the demurrage engine, and a rupee figure
 * here would be a number nobody could trace to a rule. What this card *can*
 * say, and does, is which circular set the threshold and on what date that was
 * resolved: the free time was looked up as of the **placement**, so a rake
 * placed before a circular changed is still on the old hours.
 */
const STATUS_STYLE: Record<
  BoardOnHand['status'],
  {
    border: string;
    badge: 'success' | 'warning' | 'destructive' | 'secondary';
    label: string;
  }
> = {
  ok: {
    border: 'border-border/60',
    badge: 'success',
    label: 'Within free time',
  },
  approaching: {
    border: 'border-amber-500/50 bg-amber-500/[0.04]',
    badge: 'warning',
    label: 'Approaching free time',
  },
  over: {
    border: 'border-destructive/50 bg-destructive/[0.04]',
    badge: 'destructive',
    label: 'Past free time',
  },
  unknown: {
    border: 'border-border/60 border-dashed',
    badge: 'secondary',
    label: 'No threshold',
  },
};

const OnHandCard = ({ row, now }: { row: BoardOnHand; now: number }) => {
  const style = STATUS_STYLE[row.status];

  /**
   * Recomputed in the browser from `placedAt` rather than read off the row.
   *
   * The server's `hoursOnHand` was true when the board was fetched; the ticker
   * makes this one true now. They agree to within the refetch interval, and the
   * one a supervisor is watching should be the one that moves.
   */
  const hoursOnHand = row.placedAt
    ? (now - new Date(row.placedAt).getTime()) / 3_600_000
    : null;

  const overBy =
    hoursOnHand !== null && row.freeTime.hours !== null
      ? hoursOnHand - row.freeTime.hours
      : null;

  return (
    <li className={cn('rounded-xl border p-4 transition-colors', style.border)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">
            {row.code}
            {row.lineNumber && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                line {row.lineNumber}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.wagonCount} × {row.wagonTypeCode}
            {row.commodityGroup && ` · ${row.commodityGroup}`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary">{RAKE_STATE_LABELS[row.state]}</Badge>
          <Badge variant={style.badge}>{style.label}</Badge>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">On hand</dt>
          <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium tabular-nums">
            <HugeiconsIcon
              icon={Timer02Icon}
              size={14}
              strokeWidth={2}
              className="text-muted-foreground"
            />
            {hoursOnHand === null ? '—' : formatHours(hoursOnHand)}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-muted-foreground">Placed</dt>
          <dd className="mt-0.5 font-medium">
            <IstTime value={row.placedAt} emptyLabel="Not recorded" />
          </dd>
        </div>

        <div>
          <dt className="text-xs text-muted-foreground">Free time</dt>
          <dd className="mt-0.5 font-medium tabular-nums">
            {row.freeTime.hours === null ? (
              <span className="text-muted-foreground">No rule</span>
            ) : (
              `${row.freeTime.hours} h`
            )}
          </dd>
        </div>
      </dl>

      {overBy !== null && overBy > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={14}
            strokeWidth={2}
            className="mt-px shrink-0 text-destructive"
          />
          <span>
            <strong>{formatHours(overBy)} over free time.</strong> Detention is
            accruing against this placement.
          </span>
        </p>
      )}

      {/*
        The provenance of the threshold, spelled out. Phase 9's charge explainer
        shows the same three facts for the same reason: a number a supervisor
        cannot trace to a circular is a number they will be argued out of.
      */}
      {row.freeTime.circularRef && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {row.freeTime.hours} h per {row.freeTime.circularRef}
          {row.freeTime.clauseRef && ` clause ${row.freeTime.clauseRef}`} — the
          rule in force on{' '}
          <IstTime value={row.freeTime.resolvedAsOf} variant="date" />, the date
          of placement.
        </p>
      )}
    </li>
  );
};

export default OnHandCard;
