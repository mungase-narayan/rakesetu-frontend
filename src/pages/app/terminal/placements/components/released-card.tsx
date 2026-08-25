import { Badge } from '@/components/ui/badge';
import { IstTime } from '@/components/shared';
import { formatHours } from '@/lib/duration';
import { RAKE_EVENT_TYPE_LABELS } from '@/constants/rake-event.constants';
import type { BoardReleased } from '@/types/terminal-board.types';

/**
 * A rake that left the line today.
 *
 * `detentionHours` is **placement to release**, with nothing subtracted — not
 * the free time, not a slab, not a waiver. It is called that because it is what
 * a supervisor calls it, and the caption says what it is not, because the same
 * words will mean something narrower once Phase 9's charge engine is computing
 * against them.
 */
const ReleasedCard = ({ row }: { row: BoardReleased }) => (
  <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
    <div>
      <p className="text-sm font-medium">{row.code}</p>
      <p className="text-xs text-muted-foreground">
        {RAKE_EVENT_TYPE_LABELS[row.eventType]} ·{' '}
        <IstTime value={row.releasedAt} />
      </p>
    </div>

    <Badge variant="outline" className="tabular-nums">
      {row.detentionHours === null
        ? 'No placement on record'
        : `${formatHours(row.detentionHours)} on the line`}
    </Badge>
  </li>
);

export default ReleasedCard;
