import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { IstTime } from '@/components/shared';
import {
  RAKE_EVENT_TYPE_LABELS,
  EVENT_SOURCE_LABELS,
} from '@/constants/rake-event.constants';
import type { RakeEvent } from '@/types/rake-event.types';

/**
 * One line of a rake's history.
 *
 * A **rejected** attempt renders struck through with its reason. It is shown
 * rather than filtered because §5.1 requires illegal transitions to be kept —
 * and a log that only shows what succeeded is exactly the log somebody would
 * want if they had mis-keyed a detention. Striking it through is what makes
 * "this was refused" legible at a glance instead of a badge nobody reads.
 */
const EventRow = ({
  event,
  compact = false,
}: {
  event: RakeEvent;
  compact?: boolean;
}) => {
  const refused = !event.applied;

  return (
    <li
      className={cn(
        'flex items-start justify-between gap-3 rounded-md border px-2.5 py-1.5 text-sm',
        refused
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-border/50 bg-card'
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <p
          className={cn(
            'font-medium',
            refused && 'text-muted-foreground line-through decoration-1'
          )}
        >
          {RAKE_EVENT_TYPE_LABELS[event.eventType]}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          <IstTime value={event.occurredAt} />
          {event.stationCode && ` · ${event.stationCode}`}
          {!compact && ` · ${EVENT_SOURCE_LABELS[event.source]}`}
        </p>
        {refused && event.rejectionReason && (
          <p className="flex items-start gap-1.5 text-xs text-destructive">
            <HugeiconsIcon
              icon={Alert02Icon}
              size={13}
              strokeWidth={2}
              className="mt-px shrink-0"
            />
            {event.rejectionReason}
          </p>
        )}
      </div>

      {refused && (
        <Badge variant="destructive" className="shrink-0 text-[10px]">
          Refused
        </Badge>
      )}
    </li>
  );
};

export default EventRow;
