import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Server-side pagination controls.
 *
 * Takes the backend's `pagination` envelope verbatim (page, totalPages, total,
 * limit) rather than deriving anything from the rows in hand — the table only
 * ever holds one page, so a client-side pager would be counting the wrong set.
 */
interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  label?: string;
}

const TablePagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  label = 'items',
}: TablePaginationProps) => {
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1 <= 5 ? i + 1 : totalPages - (6 - i);
    if (page >= totalPages - 3) return i < 2 ? i + 1 : totalPages - (6 - i);
    return i === 0 ? 1 : i === 6 ? totalPages : page - 2 + i;
  });

  return (
    // One row at all sizes: count on the left, pager on the right.
    <div className="flex items-center justify-between gap-3 pt-1">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{' '}
        of <span className="font-semibold text-foreground">{total}</span>{' '}
        {label}
      </p>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="h-8 gap-1 rounded-lg px-2 text-xs text-muted-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2.2} />
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Compact indicator — mobile only */}
        <span className="mx-1 text-xs text-muted-foreground sm:hidden">
          Page <span className="font-semibold text-foreground">{page}</span> /{' '}
          {totalPages}
        </span>

        {/* Numbered pages — desktop only */}
        <div className="mx-1 hidden items-center gap-0.5 sm:flex">
          {pages.map((p, i) => {
            const prev = pages[i - 1];
            const showEllipsis = prev !== undefined && p - prev > 1;
            return (
              <span key={p} className="flex items-center gap-0.5">
                {showEllipsis && (
                  <span className="w-7 text-center text-xs text-muted-foreground/50">
                    …
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={cn(
                    'size-8 rounded-lg text-xs font-medium transition-all duration-150',
                    p === page
                      ? 'bg-primary text-primary-foreground shadow-sm dark:shadow-primary/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {p}
                </button>
              </span>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="h-8 gap-1 rounded-lg px-2 text-xs text-muted-foreground"
        >
          <span className="hidden sm:inline">Next</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.2} />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
