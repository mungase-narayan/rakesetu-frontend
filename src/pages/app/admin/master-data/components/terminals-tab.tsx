import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Alert01Icon,
  Location01Icon,
} from '@hugeicons/core-free-icons';

import { useTerminalList, useTerminalMutations } from '@/api/terminal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CsvExport } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import {
  COMMODITY_GROUP_LABELS,
  HANDLING_MODE_LABELS,
  TERMINAL_TYPE_LABELS,
} from '@/constants';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import {
  TERMINAL_TYPES,
  type Terminal,
  type TerminalType,
} from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import {
  CheckboxGroupField,
  NumberField,
  SelectField,
  SwitchField,
  TextField,
} from './form-fields';
import { optionsFrom } from './form-options';
import { terminalSchema, type TerminalFormValues } from '../schema';

const helper = columnHelper<Terminal>();

/** One line and a long service time is where a queue forms. */
const isCongested = (terminal: Terminal): boolean =>
  terminal.placementLines === 1 && terminal.avgPlacementMinutes >= 180;

const columns = [
  helper.accessor('code', {
    header: 'Code',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
    meta: { className: 'w-32' },
  }),
  helper.accessor('name', { header: 'Name', meta: { className: 'w-56' } }),
  helper.accessor('stationCode', {
    header: 'Station',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    meta: { className: 'w-24' },
  }),
  helper.accessor('type', {
    header: 'Type',
    cell: (info) => TERMINAL_TYPE_LABELS[info.getValue()],
    meta: { className: 'w-44' },
  }),
  helper.display({
    id: 'capacity',
    header: 'Capacity',
    cell: ({ row }) => (
      <span
        className={
          isCongested(row.original)
            ? 'flex items-center gap-1 text-xs font-semibold text-destructive'
            : 'text-xs'
        }
      >
        {isCongested(row.original) && (
          <HugeiconsIcon icon={Alert01Icon} size={13} strokeWidth={2} />
        )}
        {row.original.placementLines} line
        {row.original.placementLines === 1 ? '' : 's'} ·{' '}
        {row.original.avgPlacementMinutes} min
      </span>
    ),
    meta: { className: 'w-40' },
  }),
  helper.accessor('handlingMode', {
    header: 'Handling',
    cell: (info) => (
      <Badge variant="outline">{HANDLING_MODE_LABELS[info.getValue()]}</Badge>
    ),
    meta: { className: 'w-32' },
  }),
];

const EMPTY: TerminalFormValues = {
  code: '',
  name: '',
  stationCode: '',
  type: 'goods_shed',
  placementLines: 2,
  handlingMode: 'manual',
  commodityGroups: [],
  maxRakeLength: 42,
  avgPlacementMinutes: 90,
  isMechanised: false,
};

/**
 * Terminals.
 *
 * `placementLines` and `avgPlacementMinutes` are the two numbers that matter
 * beyond this screen: they are the servers and the service time in the Phase 8
 * queue model, which is why a single-line terminal with a long placement is
 * flagged here rather than left to be discovered when the congestion twin runs.
 */
const TerminalsTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TerminalType | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Terminal | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { terminals, pagination, isLoading } = useTerminalList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
    type: type || undefined,
  });

  const {
    createTerminal,
    updateTerminal,
    isLoading: saving,
  } = useTerminalMutations();

  const form = useForm<TerminalFormValues>({
    resolver: zodResolver(terminalSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.code,
        name: editing.name,
        stationCode: editing.stationCode,
        type: editing.type,
        placementLines: editing.placementLines,
        handlingMode: editing.handlingMode,
        commodityGroups: editing.commodityGroups,
        maxRakeLength: editing.maxRakeLength,
        avgPlacementMinutes: editing.avgPlacementMinutes,
        isMechanised: editing.isMechanised,
      });
    } else if (createOpen) {
      form.reset(EMPTY);
    }
  }, [editing, createOpen, form]);

  const onCreate = (values: TerminalFormValues) =>
    createTerminal(
      { data: values },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: `Terminal ${values.code} added.` });
        },
      }
    );

  const onEdit = (values: TerminalFormValues) => {
    if (!editing) return;
    updateTerminal(
      { id: editing.id, data: values },
      {
        onSuccess: () => {
          setEditing(null);
          successToast({ message: `Terminal ${editing.code} updated.` });
        },
      }
    );
  };

  const fields = (lockCode: boolean) => (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          control={form.control}
          name="code"
          label="Terminal code"
          uppercase
          disabled={saving || lockCode}
        />
        <TextField
          control={form.control}
          name="name"
          label="Name"
          disabled={saving}
        />
        <TextField
          control={form.control}
          name="stationCode"
          label="Station"
          uppercase
          disabled={saving}
        />
        <SelectField
          control={form.control}
          name="type"
          label="Type"
          options={optionsFrom(TERMINAL_TYPE_LABELS)}
          disabled={saving}
        />
        <NumberField
          control={form.control}
          name="placementLines"
          label="Placement lines"
          step="1"
          disabled={saving}
          description="The servers in the congestion model."
        />
        <NumberField
          control={form.control}
          name="avgPlacementMinutes"
          label="Average placement (min)"
          step="1"
          disabled={saving}
        />
        <SelectField
          control={form.control}
          name="handlingMode"
          label="Handling mode"
          options={optionsFrom(HANDLING_MODE_LABELS)}
          disabled={saving}
          description="Feeds the free-time lookup."
        />
        <NumberField
          control={form.control}
          name="maxRakeLength"
          label="Max rake length (wagons)"
          step="1"
          disabled={saving}
        />
      </div>
      <CheckboxGroupField
        control={form.control}
        name="commodityGroups"
        label="Commodity groups handled"
        options={optionsFrom(COMMODITY_GROUP_LABELS)}
        disabled={saving}
      />
      <SwitchField
        control={form.control}
        name="isMechanised"
        label="Mechanised handling"
        disabled={saving}
      />
    </>
  );

  return (
    <>
      <ListSurface
        columns={columns}
        rows={terminals}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowClick={setEditing}
        label="terminals"
        emptyIcon={Location01Icon}
        emptyTitle="No terminals"
        emptyDescription="Sidings, indents and placements all hang off a terminal."
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search code or name…"
              className="h-9 w-56"
            />
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value as TerminalType | '');
                setPage(1);
              }}
              className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
            >
              <option value="">Any type</option>
              {TERMINAL_TYPES.map((value) => (
                <option key={value} value={value}>
                  {TERMINAL_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2">
              <CsvExport
                rows={terminals ?? []}
                filename="terminals"
                columns={[
                  { header: 'code', value: (row) => row.code },
                  { header: 'name', value: (row) => row.name },
                  { header: 'stationCode', value: (row) => row.stationCode },
                  { header: 'type', value: (row) => row.type },
                  {
                    header: 'placementLines',
                    value: (row) => row.placementLines,
                  },
                  {
                    header: 'avgPlacementMinutes',
                    value: (row) => row.avgPlacementMinutes,
                  },
                  { header: 'handlingMode', value: (row) => row.handlingMode },
                  {
                    header: 'maxRakeLength',
                    value: (row) => row.maxRakeLength,
                  },
                ]}
              />
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
                Add terminal
              </Button>
            </div>
          </div>
        }
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a terminal"
        description="Owned by this organization, unlike the network itself."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add terminal"
      >
        {fields(false)}
      </RecordDialog>

      <RecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`Edit ${editing?.code ?? ''}`}
        description="Sidings and embargoes point at this terminal by id, so the code is fixed."
        form={form}
        onSubmit={onEdit}
        isLoading={saving}
      >
        {fields(true)}
      </RecordDialog>
    </>
  );
};

export default TerminalsTab;
