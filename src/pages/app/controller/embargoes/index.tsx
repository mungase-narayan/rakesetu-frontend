import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, SecurityCheckIcon } from '@hugeicons/core-free-icons';

import { useEmbargoList, useEmbargoMutations } from '@/api/terminal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ConfirmDialog,
  DataTable,
  IstTime,
  PageHeader,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { errorToast, successToast } from '@/lib/toast.lib';
import { ROUTES } from '@/routes/route-paths';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type { Embargo, EmbargoScope } from '@/types/master-data.types';

import ScopeBuilder, { ScopePreview } from './components/scope-builder';

const helper = columnHelper<Embargo>();

type Phase = 'active' | 'scheduled' | 'ended';

const phaseOf = (embargo: Embargo): Phase => {
  if (!embargo.isActive) return 'ended';
  const now = Date.now();
  if (new Date(embargo.fromTs).getTime() > now) return 'scheduled';
  if (new Date(embargo.toTs).getTime() < now) return 'ended';
  return 'active';
};

const PHASE_LABEL: Record<Phase, string> = {
  active: 'In force',
  scheduled: 'Scheduled',
  ended: 'Ended',
};

const EMPTY_SCOPE: EmbargoScope = { v: 1 };

/**
 * Embargoes — the freight controller's screen, not the administrator's.
 *
 * §7 puts this here because declaring an embargo is an operating decision: it
 * takes route, commodity or wagon capacity out of the solver's reach, and the
 * person who should make that call is the one who knows why the line is blocked.
 * The permission reflects it — a controller holds `embargo:write` and not
 * `masterdata:write`, so the same person cannot quietly edit the terminal the
 * embargo names.
 */
const EmbargoesPage = () => {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingEnd, setPendingEnd] = useState<Embargo | null>(null);

  const [scope, setScope] = useState<EmbargoScope>(EMPTY_SCOPE);
  const [fromTs, setFromTs] = useState('');
  const [toTs, setToTs] = useState('');
  const [reason, setReason] = useState('');
  const [circularRef, setCircularRef] = useState('');

  const { embargoes, pagination, isLoading } = useEmbargoList({
    page,
    limit: DEFAULT_LIMIT,
  });

  const {
    createEmbargo,
    endEmbargo,
    isLoading: saving,
  } = useEmbargoMutations();

  const resetForm = () => {
    setScope(EMPTY_SCOPE);
    setFromTs('');
    setToTs('');
    setReason('');
    setCircularRef('');
  };

  const onCreate = () => {
    if (!fromTs || !toTs) {
      errorToast({ message: 'An embargo needs a start and an end.' });
      return;
    }
    if (new Date(toTs) <= new Date(fromTs)) {
      // A window that ends before it starts is in force at no instant, which
      // makes it an embargo nobody enforces and nobody notices.
      errorToast({ message: 'The end must be after the start.' });
      return;
    }
    if (reason.trim().length < 5) {
      errorToast({ message: 'Say why — the reason is what a dispute reads.' });
      return;
    }

    createEmbargo(
      {
        data: {
          scope,
          fromTs: new Date(fromTs).toISOString(),
          toTs: new Date(toTs).toISOString(),
          reason: reason.trim(),
          circularRef: circularRef.trim() || null,
        },
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          resetForm();
          successToast({ message: 'Embargo declared.' });
        },
      }
    );
  };

  const columns = [
    helper.display({
      id: 'phase',
      header: 'Status',
      cell: ({ row }) => {
        const phase = phaseOf(row.original);
        return (
          <Badge
            variant={
              phase === 'active'
                ? 'destructive'
                : phase === 'scheduled'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {PHASE_LABEL[phase]}
          </Badge>
        );
      },
      meta: { className: 'w-28' },
    }),
    helper.accessor('summary', {
      header: 'What it blocks',
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    helper.display({
      id: 'window',
      header: 'Window',
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <IstTime value={row.original.fromTs} />
          <p className="text-muted-foreground">
            to <IstTime value={row.original.toTs} />
          </p>
        </div>
      ),
      meta: { className: 'w-48' },
    }),
    helper.accessor('circularRef', {
      header: 'Circular',
      cell: (info) => (
        <span className="font-mono text-xs">{info.getValue() ?? '—'}</span>
      ),
      meta: { className: 'w-40' },
    }),
    helper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        phaseOf(row.original) === 'ended' ? null : (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                setPendingEnd(row.original);
              }}
            >
              End
            </Button>
          </div>
        ),
      meta: { className: 'w-24', headerClassName: 'text-right' },
    }),
  ];

  const rows = embargoes ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Embargoes"
        description="Restrictions that take route, commodity or wagon capacity out of the allotment solver's reach."
        breadcrumb={[
          { label: 'Controller', to: ROUTES.controller.dashboard },
          { label: 'Embargoes' },
        ]}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
            Declare an embargo
          </Button>
        }
      />

      <Alert>
        <AlertDescription>
          A dimension you leave untouched is <strong>unrestricted</strong>, not
          excluded — an embargo naming only a commodity blocks it in every wagon
          type, through every station. The sentence under the builder is what
          the solver will actually enforce; read it before saving.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <TableSkeleton columns={columns.length} />
      ) : rows.length === 0 ? (
        <TableEmptyState
          icon={SecurityCheckIcon}
          title="No embargoes"
          description="Nothing is restricted. Every rake is feasible as far as this filter is concerned."
        />
      ) : (
        <>
          <DataTable columns={columns} data={rows} />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              label="embargoes"
            />
          )}
        </>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setCreateOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Declare an embargo</DialogTitle>
            <DialogDescription>
              Pick the dimensions to restrict, then read the sentence at the
              bottom. It is produced by the same code the solver matches with.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-0.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">From</p>
                <Input
                  type="datetime-local"
                  value={fromTs}
                  onChange={(event) => setFromTs(event.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">To</p>
                <Input
                  type="datetime-local"
                  value={toTs}
                  onChange={(event) => setToTs(event.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Circular reference
                </p>
                <Input
                  value={circularRef}
                  onChange={(event) => setCircularRef(event.target.value)}
                  placeholder="EMB-SUR-17/2026"
                  className="h-9"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Reason</p>
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Goods shed reconstruction — no open-wagon loading until the new apron is commissioned."
                  rows={2}
                />
              </div>
            </div>

            <ScopeBuilder scope={scope} onChange={setScope} />
          </div>

          {/*
            Outside the scroll container on purpose: this is the line that has
            to be read before saving, and anything inside a scrolling body can
            be below the fold.
          */}
          <ScopePreview scope={scope} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onCreate} disabled={saving}>
              {saving ? 'Declaring…' : 'Declare embargo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingEnd)}
        onOpenChange={(open) => !open && setPendingEnd(null)}
        title="End this embargo?"
        description="It stops applying immediately. The row is kept, because it is the evidence for every allotment that honoured it while it was in force."
        confirmLabel="End it"
        destructive
        loading={saving}
        onConfirm={() => {
          if (!pendingEnd) return;
          endEmbargo(
            { id: pendingEnd.id },
            {
              onSuccess: () => {
                setPendingEnd(null);
                successToast({ message: 'Embargo ended.' });
              },
            }
          );
        }}
      />
    </div>
  );
};

export default EmbargoesPage;
