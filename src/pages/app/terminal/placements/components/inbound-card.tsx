import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Route01Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { IstTime } from '@/components/shared';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CONFIDENCE_LABELS, formatDuration } from '@/types/eta.types';
import type { BoardInbound } from '@/types/terminal-board.types';

/**
 * A rake on its way here.
 *
 * The estimate is a **point estimate with its coverage stated**, never a band:
 * §5.4 Tier 2's real p50/p80/p90 needs the residual model Phase 8 builds, and
 * until then a "±40 min" printed next to this time would be a number the system
 * cannot compute. What it *can* say honestly is how much of the estimate rests
 * on running that was actually observed, which is what the confidence chip
 * carries — and the tooltip spells it out rather than leaving "medium" to be
 * read as a probability.
 */
const CONFIDENCE_VARIANT: Record<
  BoardInbound['confidence'],
  'success' | 'warning' | 'secondary'
> = {
  high: 'success',
  medium: 'warning',
  low: 'secondary',
};

const InboundCard = ({ row }: { row: BoardInbound }) => (
  <li
    className={cn(
      'rounded-xl border p-4',
      row.isOverdue
        ? 'border-amber-500/50 bg-amber-500/[0.04]'
        : 'border-border/60'
    )}
  >
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <p className="font-semibold">{row.code}</p>
        <p className="text-xs text-muted-foreground">
          {row.wagonTypeCode} · from {row.fromCode}
        </p>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={CONFIDENCE_VARIANT[row.confidence]}>
            {CONFIDENCE_LABELS[row.confidence].short}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {CONFIDENCE_LABELS[row.confidence].detail}{' '}
          {Math.round(row.observedShare * 100)}% of this estimate&rsquo;s
          minutes come from observed traversals. This is a coverage figure, not
          a probability.
        </TooltipContent>
      </Tooltip>
    </div>

    <p className="mt-3 text-sm">
      <span className="text-muted-foreground">Arrives</span>{' '}
      <span className="font-semibold">
        <IstTime value={row.arrivalAt} />
      </span>
    </p>

    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
      <HugeiconsIcon icon={Route01Icon} size={13} strokeWidth={2} />
      {formatDuration(row.totalMinutes)} · {row.totalKm} km · {row.legs} section
      {row.legs === 1 ? '' : 's'}
    </p>

    {row.isOverdue && (
      /*
        Kept on the board rather than dropped. An estimate whose arrival has
        already passed is the single most useful row here — it is the rake that
        is actually late — and hiding it because the number expired would remove
        exactly the information a supervisor is looking for.
      */
      <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={14}
          strokeWidth={2}
          className="mt-px shrink-0 text-amber-600"
        />
        <span>
          Past its estimated arrival. Either it is running late or no event has
          been recorded since it last passed a section.
        </span>
      </p>
    )}
  </li>
);

export default InboundCard;
