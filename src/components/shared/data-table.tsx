import { useTable, type RowData } from '@tanstack/react-table';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { TABLE_FEATURES, type RakeSetuColumnDef } from './data-table.config';

/**
 * Per-column presentation, read off `columnDef.meta`.
 *
 * Widths belong to the screen, not to this component: only the screen knows
 * that "Status" is a short badge and "Name" carries two lines. Passing them as
 * classes keeps the sizing next to the column it describes, and avoids pulling
 * in react-table's column-sizing feature to express something CSS already does.
 */
interface ColumnMeta {
  /** Applied to the header and every cell — use it for width and alignment. */
  className?: string;
  /** Header only, when it needs to differ (e.g. right-aligned numeric header). */
  headerClassName?: string;
}

const metaOf = (meta: unknown): ColumnMeta => (meta as ColumnMeta) ?? {};

interface DataTableProps<TData extends RowData> {
  columns: RakeSetuColumnDef<TData>[];
  /** Exactly one server page. */
  data: TData[];
  /** Row click — the audit viewer uses it to open the diff sheet. */
  onRowClick?: (row: TData) => void;
  /** Renders the column-visibility menu above the table. */
  showColumnToggle?: boolean;
  className?: string;
}

/** The list surface every screen from this phase on renders its rows into. */
const DataTable = <TData extends RowData>({
  columns,
  data,
  onRowClick,
  showColumnToggle = false,
  className,
}: DataTableProps<TData>) => {
  const table = useTable({ features: TABLE_FEATURES, columns, data });

  return (
    <div className={cn('space-y-3', className)}>
      {showColumnToggle && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <HugeiconsIcon
                  icon={Settings02Icon}
                  size={15}
                  strokeWidth={2}
                />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    // Only an explicit `false` hides a column; an absent entry
                    // is visible, so this must read the resolved value.
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(Boolean(value))
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border/60">
        {/*
          `table-fixed` so the widths a screen declares in `meta.className` are
          honoured. Without it the browser sizes columns by content, which is
          why "Name" used to take half the table and "Last login" floated off to
          the right with a gap in between.
        */}
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow
                key={group.id}
                className="border-b border-border/60 bg-muted/50 hover:bg-transparent dark:bg-white/3"
              >
                {group.headers.map((header) => {
                  const sortable = header.column.getCanSort();
                  const direction = header.column.getIsSorted();
                  const meta = metaOf(header.column.columnDef.meta);

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'h-11 px-3 text-xs font-semibold text-muted-foreground',
                        // The vertical rule. `last:border-r-0` so the table's
                        // own border is not doubled at the right edge.
                        'border-r border-border/50 last:border-r-0',
                        meta.className,
                        meta.headerClassName
                      )}
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          <HugeiconsIcon
                            icon={
                              direction === 'asc'
                                ? ArrowUp01Icon
                                : direction === 'desc'
                                  ? ArrowDown01Icon
                                  : ArrowUpDownIcon
                            }
                            size={13}
                            strokeWidth={2}
                            className={cn(
                              'shrink-0',
                              !direction && 'opacity-40'
                            )}
                          />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={
                  onRowClick ? () => onRowClick(row.original) : undefined
                }
                className={cn(
                  'border-b border-border/40 last:border-0',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {/* Visible cells, not all cells: a hidden column still has a
                    cell, and rendering it would leave it in the DOM. */}
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'px-3 py-3 text-sm',
                      'border-r border-border/50 last:border-r-0',
                      metaOf(cell.column.columnDef.meta).className
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
