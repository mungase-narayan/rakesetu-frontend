import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Alert01Icon,
  TruckDeliveryIcon,
} from '@hugeicons/core-free-icons';

import { useWagonList, useWagonMutations, useWagonTypeList } from '@/api/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CsvExport } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import { WAGON_OWNER_LABELS, WAGON_STATUS_LABELS } from '@/constants';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import {
  WAGON_STATUSES,
  type Wagon,
  type WagonStatus,
} from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import { NumberField, SelectField, TextField } from './form-fields';
import { optionsFrom } from './form-options';
import { wagonSchema, type WagonFormValues } from '../schema';

const helper = columnHelper<Wagon>();

const DAY_MS = 24 * 60 * 60 * 1000;

/** Within 72 hours is the window the Phase 7 maintenance constraint acts on. */
const dueSoon = (date: string): boolean =>
  new Date(date).getTime() - Date.now() <= 3 * DAY_MS;

const columns = [
  helper.accessor('number', {
    header: 'Wagon',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
    meta: { className: 'w-32' },
  }),
  helper.accessor('typeCode', {
    header: 'Type',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    meta: { className: 'w-28' },
  }),
  helper.accessor('owner', {
    header: 'Owner',
    cell: (info) => WAGON_OWNER_LABELS[info.getValue()],
    meta: { className: 'w-40' },
  }),
  helper.accessor('pohDueOn', {
    header: 'Overhaul due',
    cell: (info) => (
      <span
        className={
          dueSoon(info.getValue())
            ? 'flex items-center gap-1 text-xs font-semibold text-destructive'
            : 'text-xs'
        }
      >
        {dueSoon(info.getValue()) && (
          <HugeiconsIcon icon={Alert01Icon} size={13} strokeWidth={2} />
        )}
        {info.getValue()}
      </span>
    ),
    meta: { className: 'w-36' },
  }),
  helper.accessor('fitnessDueOn', {
    header: 'Fitness due',
    cell: (info) => <span className="text-xs">{info.getValue()}</span>,
    meta: { className: 'w-32' },
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <Badge
        variant={
          info.getValue() === 'available'
            ? 'secondary'
            : info.getValue() === 'condemned'
              ? 'destructive'
              : 'outline'
        }
      >
        {WAGON_STATUS_LABELS[info.getValue()]}
      </Badge>
    ),
    meta: { className: 'w-32' },
  }),
];

const EMPTY: WagonFormValues = {
  number: '',
  typeCode: '',
  owner: 'IR',
  pohDueOn: '',
  fitnessDueOn: '',
  status: 'available',
};

/**
 * The wagon register.
 *
 * The overhaul column is the one to read: a wagon coming due inside 72 hours is
 * flagged, because that is exactly the condition the solver refuses a rake on —
 * a wagon that goes out of fitness mid-haul strands the whole rake, not itself.
 */
const WagonsTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WagonStatus | ''>('');
  /**
   * The cutoff date, computed when the filter is switched on rather than during
   * render. `Date.now()` in a render body is impure — the value would drift on
   * every re-render, which changes the query key and refetches for no reason.
   */
  const [pohDueBefore, setPohDueBefore] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Wagon | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { wagons, pagination, isLoading } = useWagonList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
    status: status || undefined,
    pohDueBefore,
  });

  const { wagonTypes } = useWagonTypeList({ limit: 100 });
  const { createWagon, updateWagon, isLoading: saving } = useWagonMutations();

  const form = useForm<WagonFormValues>({
    resolver: zodResolver(wagonSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        number: editing.number,
        typeCode: editing.typeCode,
        owner: editing.owner,
        pohDueOn: editing.pohDueOn,
        fitnessDueOn: editing.fitnessDueOn,
        status: editing.status,
        builtYear: editing.builtYear ?? undefined,
      });
    } else if (createOpen) {
      form.reset(EMPTY);
    }
  }, [editing, createOpen, form]);

  const onCreate = (values: WagonFormValues) =>
    createWagon(
      { data: values },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: `Wagon ${values.number} added.` });
        },
      }
    );

  const onEdit = (values: WagonFormValues) => {
    if (!editing) return;
    updateWagon(
      { id: editing.id, data: values },
      {
        onSuccess: () => {
          setEditing(null);
          successToast({ message: `Wagon ${editing.number} updated.` });
        },
      }
    );
  };

  const typeOptions = (wagonTypes ?? []).map((type) => ({
    value: type.code,
    label: `${type.code} — ${type.name}`,
  }));

  const fields = (lockNumber: boolean) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        control={form.control}
        name="number"
        label="Wagon number"
        uppercase
        disabled={saving || lockNumber}
      />
      <SelectField
        control={form.control}
        name="typeCode"
        label="Wagon type"
        options={typeOptions}
        disabled={saving}
      />
      <SelectField
        control={form.control}
        name="owner"
        label="Owner"
        options={optionsFrom(WAGON_OWNER_LABELS)}
        disabled={saving}
      />
      <SelectField
        control={form.control}
        name="status"
        label="Status"
        options={optionsFrom(WAGON_STATUS_LABELS)}
        disabled={saving}
      />
      <TextField
        control={form.control}
        name="pohDueOn"
        label="Overhaul due on"
        placeholder="2027-03-14"
        disabled={saving}
        description="Required — the solver reads it before allotting."
      />
      <TextField
        control={form.control}
        name="fitnessDueOn"
        label="Fitness due on"
        placeholder="2027-01-09"
        disabled={saving}
      />
      <NumberField
        control={form.control}
        name="builtYear"
        label="Built year"
        step="1"
        disabled={saving}
      />
    </div>
  );

  return (
    <>
      <ListSurface
        columns={columns}
        rows={wagons}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowClick={setEditing}
        label="wagons"
        emptyIcon={TruckDeliveryIcon}
        emptyTitle="No wagons"
        emptyDescription="Compositions are built from this register."
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search wagon number…"
              className="h-9 w-56"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as WagonStatus | '');
                setPage(1);
              }}
              className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
            >
              <option value="">Any status</option>
              {WAGON_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {WAGON_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant={pohDueBefore ? 'default' : 'outline'}
              onClick={() => {
                setPohDueBefore((current) =>
                  current
                    ? undefined
                    : new Date(Date.now() + 3 * DAY_MS)
                        .toISOString()
                        .slice(0, 10)
                );
                setPage(1);
              }}
            >
              Overhaul due within 72 h
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <CsvExport
                rows={wagons ?? []}
                filename="wagons"
                columns={[
                  { header: 'number', value: (row) => row.number },
                  { header: 'typeCode', value: (row) => row.typeCode },
                  { header: 'owner', value: (row) => row.owner },
                  { header: 'pohDueOn', value: (row) => row.pohDueOn },
                  { header: 'fitnessDueOn', value: (row) => row.fitnessDueOn },
                  { header: 'status', value: (row) => row.status },
                ]}
              />
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
                Add wagon
              </Button>
            </div>
          </div>
        }
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a wagon"
        description="A physical asset owned by this organization."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add wagon"
      >
        {fields(false)}
      </RecordDialog>

      <RecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`Edit ${editing?.number ?? ''}`}
        description="The wagon number is stencilled on the vehicle and unique across the register."
        form={form}
        onSubmit={onEdit}
        isLoading={saving}
      >
        {fields(true)}
      </RecordDialog>
    </>
  );
};

export default WagonsTab;
