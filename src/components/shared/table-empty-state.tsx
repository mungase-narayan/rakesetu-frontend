import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchRemoveIcon } from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';

interface TableEmptyStateProps {
  icon?: IconSvgElement;
  title?: string;
  description?: string;
  action?: ReactNode;
}

/**
 * The empty third of the three-state list body.
 *
 * Distinct from the loading state on purpose: "we found nothing" and "we have
 * not looked yet" are different facts, and a spinner that never resolves is
 * how a screen tells the user the wrong one.
 */
const TableEmptyState = ({
  icon = SearchRemoveIcon,
  title = 'No results found',
  description = 'Try adjusting your search or filter criteria.',
  action,
}: TableEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm dark:bg-primary/15 dark:shadow-primary/10">
        <HugeiconsIcon
          icon={icon}
          size={24}
          className="text-primary"
          strokeWidth={1.8}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
};

export default TableEmptyState;
