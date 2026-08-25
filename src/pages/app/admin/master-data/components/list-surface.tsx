import type { ReactNode } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { IconSvgElement } from '@hugeicons/react';

import {
  DataTable,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import type { RakeSetuColumnDef } from '@/components/shared/data-table.config';
import type { PaginationMeta } from '@/types/pagination.types';

interface ListSurfaceProps<T extends RowData> {
  columns: RakeSetuColumnDef<T>[];
  rows: T[] | undefined;
  pagination: PaginationMeta | undefined;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  /** Filters and actions, rendered above the table. */
  toolbar?: ReactNode;
  onRowClick?: (row: T) => void;
  emptyIcon?: IconSvgElement;
  emptyTitle?: string;
  emptyDescription?: string;
  label?: string;
}

/**
 * The three-state list body, once, for all seven master-data tabs.
 *
 * Every tab renders loading, empty and populated the same way, and the three
 * are genuinely distinct — "we have not looked yet" and "we looked and found
 * nothing" are different facts, and a spinner that never resolves is how a
 * screen tells the user the wrong one. Lifting it here means a tab is a column
 * list and a filter row, which is all a tab should be.
 */
const ListSurface = <T extends RowData>({
  columns,
  rows,
  pagination,
  isLoading,
  onPageChange,
  toolbar,
  onRowClick,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  label = 'rows',
}: ListSurfaceProps<T>) => {
  return (
    <div className="space-y-4">
      {toolbar}

      {isLoading ? (
        <TableSkeleton columns={columns.length} />
      ) : !rows || rows.length === 0 ? (
        <TableEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          <DataTable columns={columns} data={rows} onRowClick={onRowClick} />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={onPageChange}
              label={label}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ListSurface;
