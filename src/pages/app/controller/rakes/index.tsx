import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useRakeStateList } from '@/api/rake-event';
import { useDebounce } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { ROUTES } from '@/routes/route-paths';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import { RAKE_STATE_LABELS } from '@/constants/master-data.constants';
import { RAKE_STATES, type RakeState } from '@/types/master-data.types';
import type { RakeWithState, StateGroup } from '@/types/rake-event.types';

const helper = columnHelper<RakeWithState>();

/** Matches the map's four groups, so the two screens read as one system. */
const GROUP_VARIANT: Record<
  StateGroup,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  empty: 'secondary',
  moving: 'default',
  at_terminal: 'outline',
  exception: 'destructive',
};

const ALL = '__all__';

/**
 * The fleet, by where each rake stands.
 *
 * Distinct from the admin master-data rake tab, which answers "what rakes
 * exist". This one answers "where is everything right now", which is an
 * operating question — hence the controller tree and `rake:read` rather than
 * `masterdata:write`.
 */
const RakesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [state, setState] = useState<string>(ALL);

  const debouncedSearch = useDebounce(search, 300);

  const { rakes, pagination, isLoading } = useRakeStateList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch || undefined,
    state: state === ALL ? undefined : (state as RakeState),
  });

  const columns = [
    helper.accessor('code', {
      header: 'Rake',
      cell: (info) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{info.getValue()}</p>
          <p className="truncate text-xs text-muted-foreground">
            {info.row.original.wagonCount} × {info.row.original.wagonTypeCode}
          </p>
        </div>
      ),
      meta: { className: 'w-[16%]' },
    }),
    helper.accessor('state', {
      header: 'State',
      cell: (info) => (
        <Badge variant={GROUP_VARIANT[info.row.original.stateGroup]}>
          {RAKE_STATE_LABELS[info.getValue()]}
        </Badge>
      ),
      meta: { className: 'w-[18%]' },
    }),
    helper.accessor('stationName', {
      header: 'Location',
      cell: (info) => (
        <span className="truncate">
          {info.getValue() ?? (
            <span className="text-muted-foreground">Unknown</span>
          )}
          {info.row.original.stationCode && (
            <span className="text-muted-foreground">
              {' '}
              ({info.row.original.stationCode})
            </span>
          )}
        </span>
      ),
      meta: { className: 'w-[20%]' },
    }),
    helper.accessor('hoursInState', {
      header: 'In state',
      cell: (info) => <span className="tabular-nums">{info.getValue()} h</span>,
      meta: { className: 'w-[10%] text-right', headerClassName: 'text-right' },
    }),
    helper.accessor('cycleCount', {
      header: 'Cycles',
      cell: (info) => (
        <span className="tabular-nums">
          {info.getValue()}
          <span className="ml-1 text-xs text-muted-foreground">
            / {info.row.original.eventCount} events
          </span>
        </span>
      ),
      meta: { className: 'w-[14%] text-right', headerClassName: 'text-right' },
    }),
    helper.accessor('lastEventAt', {
      header: 'Last event',
      cell: (info) => (
        <IstTime value={info.getValue()} emptyLabel="No events" />
      ),
      meta: { className: 'w-[22%]' },
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rakes"
        description="Every rake's current state, projected from its event log. Open one for its full history."
      />

      <div className="flex flex-wrap gap-2">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by rake code…"
          className="max-w-xs"
        />
        <Select
          value={state}
          onValueChange={(value) => {
            setState(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All states</SelectItem>
            {RAKE_STATES.map((value) => (
              <SelectItem key={value} value={value}>
                {RAKE_STATE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : rakes && rakes.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            data={rakes}
            onRowClick={(rake) => navigate(ROUTES.controller.rake(rake.rakeId))}
          />
          {pagination && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              label="rakes"
            />
          )}
        </>
      ) : (
        <TableEmptyState
          title="No rakes match"
          description="Try a different state filter, or clear the search."
        />
      )}
    </div>
  );
};

export default RakesPage;
