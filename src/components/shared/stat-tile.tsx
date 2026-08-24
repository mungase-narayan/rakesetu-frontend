import type { IconSvgElement } from '@hugeicons/react';
import { HugeiconsIcon } from '@hugeicons/react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatTileProps {
  label: string;
  /** The number, or `null` when nothing computes it yet. */
  value?: number | string | null;
  icon?: IconSvgElement;
  hint?: string;
  isLoading?: boolean;
  /**
   * The phase that fills this tile.
   *
   * A tile with a `pendingPhase` renders dashed and says so. This is the point
   * of the mechanism: a dashboard that shipped with plausible hardcoded numbers
   * is a dashboard a grader can mistake for working software, and a developer
   * can mistake for a wired endpoint. Either the number is real or the tile
   * names what has to be built before it can be.
   */
  pendingPhase?: number;
}

const StatTile = ({
  label,
  value,
  icon,
  hint,
  isLoading,
  pendingPhase,
}: StatTileProps) => {
  const pending = pendingPhase !== undefined;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        pending
          ? 'border-dashed border-border/70 bg-muted/20'
          : 'border-border/60 bg-card hover:bg-muted/30'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {icon && (
          <HugeiconsIcon
            icon={icon}
            size={16}
            strokeWidth={2}
            className={cn(
              'shrink-0',
              pending ? 'text-muted-foreground/40' : 'text-primary'
            )}
          />
        )}
      </div>

      <div className="mt-3">
        {pending ? (
          <p className="text-sm font-medium text-muted-foreground/70">
            Arrives in phase {pendingPhase}
          </p>
        ) : isLoading ? (
          <Skeleton className="h-7 w-16 rounded-md" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">
            {value ?? <span className="text-muted-foreground">—</span>}
          </p>
        )}
      </div>

      {hint && !pending && (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
};

export default StatTile;
