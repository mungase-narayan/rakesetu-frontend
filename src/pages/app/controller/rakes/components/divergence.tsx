import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * How long after it happened an event was recorded — §8's tampering signal,
 * made visible.
 *
 * The design note is worth restating, because a column of small durations looks
 * like noise until you know what it is for: detention hours are money, and the
 * way they get massaged is by recording a placement or a release at a time that
 * suits the person recording it. A large gap between "when it happened" and
 * "when it was written down" is the fingerprint of that, and so is a
 * suspiciously round backdated time.
 *
 * Neither is proof of anything, which is why this **flags** rather than blocks.
 * The value of showing it is that a controller reviewing a disputed charge can
 * see it without asking anybody for a database query.
 */

/** Past this, the gap is worth a second look rather than a shrug. */
const NOTABLE_HOURS = 4;

const Divergence = ({
  occurredAt,
  recordedAt,
}: {
  occurredAt: string;
  recordedAt: string;
}) => {
  const gapMs = new Date(recordedAt).getTime() - new Date(occurredAt).getTime();

  if (!Number.isFinite(gapMs)) {
    return <span className="text-muted-foreground">—</span>;
  }

  const hours = gapMs / 3_600_000;
  const notable = Math.abs(hours) >= NOTABLE_HOURS;

  /*
    A negative gap means the event was recorded *before* it supposedly
    happened — clock skew on a siding tablet, usually, but it is also what a
    future-dated entry looks like, so it is never rounded away to zero.
  */
  const label =
    Math.abs(hours) < 1
      ? `${Math.round(gapMs / 60_000)} min`
      : `${hours > 0 ? '' : '−'}${Math.abs(hours).toFixed(1)} h`;

  const body = (
    <span
      className={cn(
        'inline-flex items-center gap-1 tabular-nums',
        notable
          ? 'font-medium text-amber-600 dark:text-amber-500'
          : 'text-muted-foreground'
      )}
    >
      {notable && (
        <HugeiconsIcon icon={Alert02Icon} size={13} strokeWidth={2} />
      )}
      {label}
    </span>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {notable
          ? `Recorded ${label} after it is said to have happened. Not proof of anything — but a gap this size is what a backdated entry looks like, and detention hours are money.`
          : `Recorded ${label} after it happened.`}
      </TooltipContent>
    </Tooltip>
  );
};

export { NOTABLE_HOURS };
export default Divergence;
