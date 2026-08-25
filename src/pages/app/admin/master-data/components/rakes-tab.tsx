import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Route01Icon } from '@hugeicons/core-free-icons';

import {
  useRakeComposition,
  useRakeList,
  useRakeMutations,
  useWagonTypeList,
} from '@/api/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CsvExport, IstTime } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import { RAKE_STATE_LABELS, WAGON_OWNER_LABELS } from '@/constants';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import {
  RAKE_STATES,
  type Rake,
  type RakeState,
} from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import { NumberField, SelectField, TextField } from './form-fields';
import { optionsFrom } from './form-options';
import { rakeSchema, type RakeFormValues } from '../schema';

const helper = columnHelper<Rake>();

const columns = [
  helper.accessor('code', {
    header: 'Rake',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
    meta: { className: 'w-28' },
  }),
  helper.accessor('wagonTypeCode', {
    header: 'Type',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    meta: { className: 'w-28' },
  }),
  helper.accessor('wagonCount', {
    header: 'Wagons',
    meta: { className: 'w-24' },
  }),
  helper.accessor('currentState', {
    header: 'State',
    cell: (info) => (
      <Badge variant="secondary">{RAKE_STATE_LABELS[info.getValue()]}</Badge>
    ),
    meta: { className: 'w-44' },
  }),
  helper.accessor('currentStation', {
    header: 'At',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue() ?? '—'}</span>
    ),
    meta: { className: 'w-24' },
  }),
  helper.accessor('homeDivision', {
    header: 'Home division',
    meta: { className: 'w-36' },
  }),
];

const EMPTY: RakeFormValues = {
  code: '',
  wagonTypeCode: '',
  wagonCount: 42,
  owner: 'IR',
  homeDivision: '',
};

/**
 * The composition **as of a moment**, in a sheet.
 *
 * The date input is the point of this panel. "Which wagons are in this rake"
 * and "which wagons were in this rake during that journey" are different
 * questions, and they return the same answer right up until a wagon is swapped
 * — at which point the constraints below change too, which is what the solver
 * actually reads.
 */
const CompositionSheet = ({
  rake,
  onClose,
}: {
  rake: Rake | null;
  onClose: () => void;
}) => {
  const [at, setAt] = useState('');
  const { composition, constraints, isLoading } = useRakeComposition(
    rake?.id ?? null,
    at ? new Date(`${at}T12:00:00+05:30`).toISOString() : undefined
  );

  return (
    <Sheet open={Boolean(rake)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{rake?.code}</SheetTitle>
          <SheetDescription>
            {rake?.wagonTypeCode} · {rake?.homeDivision} division ·{' '}
            {rake ? WAGON_OWNER_LABELS[rake.owner] : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Composition as of
            </p>
            <Input
              type="date"
              value={at}
              onChange={(event) => setAt(event.target.value)}
              className="h-9 w-48"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for now. Pick a past date to see what the rake was
              made of then — the answer can differ, and the solver reads the
              historical one when it re-evaluates a past journey.
            </p>
          </div>

          {constraints && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">
                  Earliest overhaul due
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold">
                  {constraints.earliestPohDue?.slice(0, 10) ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">
                  Earliest fitness due
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold">
                  {constraints.earliestFitnessDue?.slice(0, 10) ?? '—'}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Wagons</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {constraints.wagonCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-xs text-muted-foreground">Total length</p>
                <p className="mt-0.5 text-sm font-semibold">
                  {Math.round(constraints.totalLengthM)} m
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Wagons {isLoading ? '' : `(${composition?.length ?? 0})`}
            </p>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {(composition ?? []).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border border-border/50 px-2.5 py-1.5 text-xs"
                >
                  <span className="font-mono">
                    {entry.position}. {entry.wagonNumber}
                  </span>
                  <span className="text-muted-foreground">
                    overhaul {entry.pohDueOn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {rake && (
            <p className="text-xs text-muted-foreground">
              State since <IstTime value={rake.stateSince} />. The state is a
              projection of the event log and is written by the event spine, not
              from this screen.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const RakesTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [state, setState] = useState<RakeState | ''>('');
  const [station, setStation] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [viewing, setViewing] = useState<Rake | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { rakes, pagination, isLoading } = useRakeList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
    state: state || undefined,
    station: station.trim().toUpperCase() || undefined,
  });

  const { wagonTypes } = useWagonTypeList({ limit: 100 });
  const { createRake, isLoading: saving } = useRakeMutations();

  const form = useForm<RakeFormValues>({
    resolver: zodResolver(rakeSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (createOpen) form.reset(EMPTY);
  }, [createOpen, form]);

  const onCreate = (values: RakeFormValues) =>
    createRake(
      {
        data: {
          ...values,
          currentStation: values.currentStation || null,
        },
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: `Rake ${values.code} added.` });
        },
      }
    );

  return (
    <>
      <ListSurface
        columns={columns}
        rows={rakes}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowClick={setViewing}
        label="rakes"
        emptyIcon={Route01Icon}
        emptyTitle="No rakes"
        emptyDescription="The allotment board and the live map both draw from here."
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search rake code…"
              className="h-9 w-48"
            />
            <select
              value={state}
              onChange={(event) => {
                setState(event.target.value as RakeState | '');
                setPage(1);
              }}
              className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
            >
              <option value="">Any state</option>
              {RAKE_STATES.map((value) => (
                <option key={value} value={value}>
                  {RAKE_STATE_LABELS[value]}
                </option>
              ))}
            </select>
            <Input
              value={station}
              onChange={(event) => {
                setStation(event.target.value);
                setPage(1);
              }}
              placeholder="At station"
              className="h-9 w-32 uppercase"
            />
            <div className="ml-auto flex items-center gap-2">
              <CsvExport
                rows={rakes ?? []}
                filename="rakes"
                columns={[
                  { header: 'code', value: (row) => row.code },
                  {
                    header: 'wagonTypeCode',
                    value: (row) => row.wagonTypeCode,
                  },
                  { header: 'wagonCount', value: (row) => row.wagonCount },
                  { header: 'owner', value: (row) => row.owner },
                  { header: 'homeDivision', value: (row) => row.homeDivision },
                  { header: 'currentState', value: (row) => row.currentState },
                  {
                    header: 'currentStation',
                    value: (row) => row.currentStation,
                  },
                ]}
              />
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
                Add rake
              </Button>
            </div>
          </div>
        }
      />

      {/*
        Keyed by the rake, so opening a different one remounts the sheet and its
        as-of date starts empty again. Resetting it in an effect would work and
        would also queue a second render every time the sheet closes.
      */}
      <CompositionSheet
        key={viewing?.id ?? 'none'}
        rake={viewing}
        onClose={() => setViewing(null)}
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a rake"
        description="The state and station seed the first map render; from the next phase the event log owns them."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add rake"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="code"
            label="Rake code"
            placeholder="R-4471"
            uppercase
            disabled={saving}
          />
          <SelectField
            control={form.control}
            name="wagonTypeCode"
            label="Wagon type"
            options={(wagonTypes ?? []).map((type) => ({
              value: type.code,
              label: `${type.code} — ${type.name}`,
            }))}
            disabled={saving}
          />
          <NumberField
            control={form.control}
            name="wagonCount"
            label="Wagon count"
            step="1"
            disabled={saving}
          />
          <SelectField
            control={form.control}
            name="owner"
            label="Owner"
            options={optionsFrom(WAGON_OWNER_LABELS)}
            disabled={saving}
          />
          <TextField
            control={form.control}
            name="homeDivision"
            label="Home division"
            placeholder="Solapur"
            disabled={saving}
            description="Feeds the solver's division-balance penalty."
          />
          <TextField
            control={form.control}
            name="currentStation"
            label="Current station"
            uppercase
            disabled={saving}
          />
          <SelectField
            control={form.control}
            name="currentState"
            label="Current state"
            options={optionsFrom(RAKE_STATE_LABELS)}
            disabled={saving}
            className="sm:col-span-2"
          />
        </div>
      </RecordDialog>
    </>
  );
};

export default RakesTab;
