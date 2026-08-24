import { useMemo, useState } from 'react';
import { SecurityCheckIcon } from '@hugeicons/core-free-icons';

import { useAuditFilters } from '@/api/audit';
import { useUserList } from '@/api/user-admin';
import { ROUTES } from '@/routes/route-paths';
import { USER_ROLE_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  CsvExport,
  DataTable,
  IstTime,
  PageHeader,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { formatIst } from '@/lib/ist';
import {
  columnHelper,
  type RakeSetuColumnDef,
} from '@/components/shared/data-table.config';
import type { AuditEntry } from '@/types/audit.types';

import AuditFilters from './components/audit-filters';
import CorrelationId from './components/correlation-id';
import AuditDetailSheet from './components/audit-detail-sheet';
import { actionMeta } from './constants';

const helper = columnHelper<AuditEntry>();

/**
 * The audit log viewer — the screen that makes DESIGN.md §8's repudiation
 * control real rather than merely implemented.
 *
 * The table is append-only at the database level: migration 0001 installs
 * `DO INSTEAD NOTHING` rules so an UPDATE or DELETE against `audit_log` is a
 * silent no-op for every role, superuser included. There is therefore no write
 * path on this screen and never will be — the only affordances are reading,
 * filtering and exporting.
 */
const AuditPage = () => {
  const filters = useAuditFilters();
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const rows = filters.entries ?? [];

  /**
   * Actor ids resolved to names.
   *
   * `audit_log` stores the actor as a bare id — denormalising a name onto an
   * append-only row would freeze a person's name at the moment they acted,
   * which is a different (and mostly wrong) thing to show. Resolving it here
   * keeps the trail honest and still readable. This screen sits behind the
   * admin guard, so `user:read` is always held; if the request fails the sheet
   * falls back to the id.
   */
  const { users } = useUserList({ page: 1, limit: 100 });
  const actorNames = useMemo(
    () =>
      new Map(
        (users ?? []).map((user) => [user.id, user.fullName ?? user.email])
      ),
    [users]
  );

  const columns = useMemo<RakeSetuColumnDef<AuditEntry>[]>(
    () =>
      helper.columns([
        helper.accessor('at', {
          header: 'When',
          meta: { className: 'w-[20%] min-w-[190px]' },
          cell: ({ row }) => (
            <IstTime value={row.original.at} className="text-xs" />
          ),
        }),
        helper.accessor('action', {
          header: 'Action',
          meta: { className: 'w-[24%] min-w-[190px]' },
          cell: ({ row }) => {
            const meta = actionMeta(row.original.action);
            return (
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    meta.kind === 'create' && 'bg-emerald-500',
                    meta.kind === 'update' && 'bg-sky-500',
                    meta.kind === 'delete' && 'bg-destructive',
                    meta.kind === 'auth' && 'bg-muted-foreground/40'
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{meta.title}</p>
                  <code className="font-mono text-[11px] text-muted-foreground">
                    {row.original.action}
                  </code>
                </div>
              </div>
            );
          },
        }),
        helper.accessor('actorRole', {
          header: 'Actor',
          meta: { className: 'w-[18%] min-w-[150px]' },
          cell: ({ row }) =>
            row.original.actorRole ? (
              <Badge variant="secondary" className="text-[11px]">
                {USER_ROLE_LABELS[row.original.actorRole]}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">System</span>
            ),
        }),
        helper.accessor('entityType', {
          header: 'Entity',
          meta: { className: 'w-[22%] min-w-[180px]' },
          cell: ({ row }) => (
            <span className="font-mono text-xs">
              {row.original.entityType}
              <span className="text-muted-foreground">
                :{row.original.entityId.slice(0, 8)}…
              </span>
            </span>
          ),
        }),
        helper.display({
          id: 'correlationId',
          header: 'Correlation',
          meta: { className: 'w-[16%] min-w-[150px]' },
          cell: ({ row }) => (
            <CorrelationId
              value={row.original.correlationId}
              onFilter={filters.onCorrelationChange}
            />
          ),
        }),
      ]) as RakeSetuColumnDef<AuditEntry>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit log"
        description="Every write, with the actor, the role in force, the source address and the correlation id of the request that made it. The table is append-only in Postgres — nothing on this screen can change a row, and neither can anything else."
        breadcrumb={[
          { label: 'Administration', to: ROUTES.admin.dashboard },
          { label: 'Audit log' },
        ]}
        actions={
          <CsvExport
            rows={rows}
            filename="rakesetu-audit"
            columns={[
              { header: 'When (IST)', value: (e) => formatIst(e.at) },
              { header: 'Action', value: (e) => e.action },
              { header: 'Actor id', value: (e) => e.actorId },
              { header: 'Actor role', value: (e) => e.actorRole },
              { header: 'Entity type', value: (e) => e.entityType },
              { header: 'Entity id', value: (e) => e.entityId },
              { header: 'IP', value: (e) => e.ip },
              { header: 'Correlation id', value: (e) => e.correlationId },
            ]}
          />
        }
      />

      <AuditFilters
        entityType={filters.entityType}
        action={filters.action}
        entityId={filters.entityId}
        correlationId={filters.correlationId}
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        hasFilters={filters.hasFilters}
        onEntityTypeChange={filters.onEntityTypeChange}
        onActionChange={filters.onActionChange}
        onEntityIdChange={filters.onEntityIdChange}
        onCorrelationChange={filters.onCorrelationChange}
        onFromChange={filters.onFromChange}
        onToChange={filters.onToChange}
        onClearFilters={filters.onClearFilters}
      />

      {filters.isLoading ? (
        <TableSkeleton columns={5} rows={8} />
      ) : rows.length === 0 ? (
        <TableEmptyState
          icon={SecurityCheckIcon}
          title={
            filters.hasFilters ? 'No matching entries' : 'Nothing recorded yet'
          }
          description={
            filters.hasFilters
              ? 'Widen the date range, or clear the correlation id.'
              : 'Every sign-in and every write lands here. Sign in as another account to see the first rows.'
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            onRowClick={(entry) => setSelected(entry)}
          />
          {filters.pagination && (
            <TablePagination
              page={filters.pagination.page}
              totalPages={filters.pagination.totalPages}
              total={filters.pagination.total}
              limit={filters.pagination.limit}
              onPageChange={filters.onPageChange}
              label="events"
            />
          )}
        </>
      )}

      <AuditDetailSheet
        entry={selected}
        actorNames={actorNames}
        onOpenChange={(open) => !open && setSelected(null)}
        onFilterByCorrelation={filters.onCorrelationChange}
      />
    </div>
  );
};

export default AuditPage;
