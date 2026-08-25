import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, Alert02Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { useRakeCycles, useRakeEvents, useRakeState } from '@/api/rake-event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DataTable,
  IstTime,
  PageHeader,
  StatTile,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { formatIst } from '@/lib/ist';
import { ROUTES } from '@/routes/route-paths';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import { RAKE_STATE_LABELS } from '@/constants/master-data.constants';
import {
  EVENT_SOURCE_LABELS,
  RAKE_EVENT_TYPE_LABELS,
} from '@/constants/rake-event.constants';
import {
  RAKE_EVENT_TYPES,
  type RakeEvent,
  type RakeEventType,
} from '@/types/rake-event.types';

import Divergence from '../components/divergence';

const helper = columnHelper<RakeEvent>();
const ALL = '__all__';

/**
 * One rake's event log — the append-only truth everything else is derived from.
 *
 * Two of these columns exist because of §8 rather than because a table wanted
 * more columns. **Recorded after** is the divergence between when an event
 * happened and when it was written down. **Refused attempts** render struck
 * through with their reason, because §5.1 requires illegal transitions to be
 * kept — and a log showing only what succeeded is exactly the log somebody
 * would want if they had mis-keyed a detention.
 */
const RakeDetailPage = () => {
  const { rakeId = '' } = useParams();
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState<string>(ALL);
  const [includeRejected, setIncludeRejected] = useState(true);

  const { state, isLoading: stateLoading } = useRakeState(rakeId);
  const { cycles } = useRakeCycles(rakeId);
  const { events, pagination, isLoading } = useRakeEvents(rakeId, {
    page,
    limit: DEFAULT_LIMIT,
    includeRejected,
    eventType: eventType === ALL ? undefined : (eventType as RakeEventType),
  });

  const openCycle = cycles?.find((cycle) => !cycle.isClosed);
  const closedCount = cycles?.filter((cycle) => cycle.isClosed).length ?? 0;

  const columns = [
    helper.accessor('eventType', {
      header: 'Event',
      cell: (info) => {
        const refused = !info.row.original.applied;
        return (
          <div className="min-w-0">
            <p
              className={cn(
                'truncate font-medium',
                refused && 'text-muted-foreground line-through decoration-1'
              )}
            >
              {RAKE_EVENT_TYPE_LABELS[info.getValue()]}
            </p>
            {refused && info.row.original.rejectionReason && (
              <p className="flex items-start gap-1 text-xs text-destructive">
                <HugeiconsIcon
                  icon={Alert02Icon}
                  size={12}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0"
                />
                <span className="line-clamp-2">
                  {info.row.original.rejectionReason}
                </span>
              </p>
            )}
          </div>
        );
      },
      meta: { className: 'w-[26%]' },
    }),
    helper.accessor('occurredAt', {
      header: 'Occurred',
      cell: (info) => <IstTime value={info.getValue()} />,
      meta: { className: 'w-[20%]' },
    }),
    helper.display({
      id: 'divergence',
      header: 'Recorded after',
      cell: (info) => (
        <Divergence
          occurredAt={info.row.original.occurredAt}
          recordedAt={info.row.original.recordedAt}
        />
      ),
      meta: { className: 'w-[12%] text-right', headerClassName: 'text-right' },
    }),
    helper.accessor('stationCode', {
      header: 'At',
      cell: (info) =>
        info.getValue() ?? <span className="text-muted-foreground">—</span>,
      meta: { className: 'w-[10%]' },
    }),
    helper.accessor('source', {
      header: 'Source',
      cell: (info) => (
        <Badge variant="outline" className="font-normal">
          {EVENT_SOURCE_LABELS[info.getValue()]}
        </Badge>
      ),
      meta: { className: 'w-[16%]' },
    }),
    helper.display({
      id: 'payload',
      header: 'Detail',
      cell: (info) => {
        const entries = Object.entries(info.row.original.payload ?? {}).filter(
          ([, value]) => value !== null && value !== undefined
        );
        if (entries.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <span className="truncate text-xs text-muted-foreground">
            {entries.map(([key, value]) => `${key}: ${value}`).join(' · ')}
          </span>
        );
      },
      meta: { className: 'w-[16%]' },
    }),
  ];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link to={ROUTES.controller.rakes}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2} />
          All rakes
        </Link>
      </Button>

      <PageHeader
        title="Rake event log"
        description="Append-only. A mistake is corrected by appending a correction, never by editing a row."
        actions={
          state && (
            <Badge variant="secondary">{RAKE_STATE_LABELS[state.state]}</Badge>
          )
        }
      />

      {state?.isDirty && (
        <Alert>
          <HugeiconsIcon icon={Alert02Icon} size={16} strokeWidth={2} />
          <AlertDescription>
            An event arrived out of order. This projection is being rebuilt from
            the log and may be a few seconds behind it.
          </AlertDescription>
        </Alert>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Current state"
          value={state ? RAKE_STATE_LABELS[state.state] : null}
          isLoading={stateLoading}
          hint={state?.stationCode ? `at ${state.stationCode}` : undefined}
        />
        <StatTile
          label="In state since"
          value={state ? formatIst(state.since) : null}
          isLoading={stateLoading}
          hint={
            state?.previousState
              ? `returns to ${RAKE_STATE_LABELS[state.previousState]}`
              : undefined
          }
        />
        <StatTile label="Completed cycles" value={closedCount} />
        <StatTile
          label="Events in open cycle"
          value={openCycle?.eventCount ?? 0}
          hint={
            openCycle
              ? `opened ${formatIst(openCycle.startedAt, 'date')}`
              : 'no open cycle'
          }
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={eventType}
          onValueChange={(value) => {
            setEventType(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All event types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All event types</SelectItem>
            {RAKE_EVENT_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {RAKE_EVENT_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="include-rejected"
            checked={includeRejected}
            onCheckedChange={(checked) => {
              setIncludeRejected(checked);
              setPage(1);
            }}
          />
          <Label htmlFor="include-rejected" className="text-sm font-normal">
            Show refused attempts
          </Label>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={10} columns={6} />
      ) : events && events.length > 0 ? (
        <>
          <DataTable columns={columns} data={events} />
          {pagination && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              label="events"
            />
          )}
        </>
      ) : (
        <TableEmptyState
          title="No events"
          description="Nothing has been recorded against this rake yet. Run the simulator, or log one by hand once Phase 5 lands the entry screens."
        />
      )}
    </div>
  );
};

export default RakeDetailPage;
