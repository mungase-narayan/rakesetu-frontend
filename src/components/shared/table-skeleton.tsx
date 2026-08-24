import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

/**
 * The loading third of the three-state list body:
 *   `isLoading ? <TableSkeleton/> : !rows.length ? <TableEmptyState/> : <DataTable/>`
 *
 * A skeleton with the real column count rather than a spinner, so the layout
 * does not jump when the data lands.
 */
const TableSkeleton = ({ columns, rows = 6 }: TableSkeletonProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border/50 bg-muted/40 hover:bg-transparent dark:bg-white/2">
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-3 w-20 rounded-full" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <TableRow
            key={rowIdx}
            className="border-b border-border/40 hover:bg-transparent"
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <TableCell key={colIdx}>
                {colIdx === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-28 rounded-full" />
                      <Skeleton className="h-2.5 w-20 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-3 w-20 rounded-full" />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
