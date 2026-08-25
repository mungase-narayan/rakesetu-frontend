import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, MapsIcon, Upload04Icon } from '@hugeicons/core-free-icons';

import { useStationList, useStationMutations } from '@/api/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CsvExport } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type { Station } from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import CsvImportDialog from './csv-import-dialog';
import { NumberField, SwitchField, TextField } from './form-fields';
import { stationSchema, type StationFormValues } from '../schema';

const helper = columnHelper<Station>();

const columns = [
  helper.accessor('code', {
    header: 'Code',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
    meta: { className: 'w-24' },
  }),
  helper.accessor('name', { header: 'Name', meta: { className: 'w-64' } }),
  helper.accessor('division', {
    header: 'Division',
    meta: { className: 'w-32' },
  }),
  helper.accessor('zone', { header: 'Zone', meta: { className: 'w-20' } }),
  helper.display({
    id: 'coordinates',
    header: 'Coordinates',
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.lat.toFixed(4)}, {row.original.lng.toFixed(4)}
      </span>
    ),
    meta: { className: 'w-40' },
  }),
  helper.accessor('isJunction', {
    header: 'Junction',
    cell: (info) =>
      info.getValue() ? (
        <Badge variant="secondary">Junction</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
    meta: { className: 'w-28' },
  }),
];

const EMPTY: StationFormValues = {
  code: '',
  name: '',
  division: '',
  zone: '',
  lat: 0,
  lng: 0,
  isJunction: false,
};

/**
 * Stations.
 *
 * Keyed by code rather than a uuid, which is why the edit form has no code
 * field: half the foreign keys in the schema point at that string, so renaming
 * a station is a data migration and not a form.
 */
const StationsTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [division, setDivision] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { stations, pagination, isLoading } = useStationList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
    division: division.trim() || undefined,
  });

  const {
    createStation,
    updateStation,
    isLoading: saving,
  } = useStationMutations();

  const form = useForm<StationFormValues>({
    resolver: zodResolver(stationSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.code,
        name: editing.name,
        division: editing.division,
        zone: editing.zone,
        lat: editing.lat,
        lng: editing.lng,
        isJunction: editing.isJunction,
      });
    } else if (createOpen) {
      form.reset(EMPTY);
    }
  }, [editing, createOpen, form]);

  const onCreate = (values: StationFormValues) =>
    createStation(
      { data: values },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: `Station ${values.code} added.` });
        },
      }
    );

  const onEdit = (values: StationFormValues) => {
    if (!editing) return;
    updateStation(
      { code: editing.code, data: values },
      {
        onSuccess: () => {
          setEditing(null);
          successToast({ message: `Station ${editing.code} updated.` });
        },
      }
    );
  };

  const onImport = (rows: StationFormValues[]) => {
    // The stations endpoint takes one row at a time, so a bulk import is a
    // sequence of calls. The dialog has already validated every row, so a
    // failure here is a server-side conflict — a code that already exists —
    // rather than a malformed file.
    let landed = 0;
    rows.forEach((row, index) =>
      createStation(
        { data: row },
        {
          onSuccess: () => {
            landed += 1;
            if (index === rows.length - 1) {
              setImportOpen(false);
              successToast({ message: `Imported ${landed} stations.` });
            }
          },
        }
      )
    );
  };

  return (
    <>
      <ListSurface
        columns={columns}
        rows={stations}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowClick={setEditing}
        label="stations"
        emptyIcon={MapsIcon}
        emptyTitle="No stations"
        emptyDescription="Run the seed, import a CSV, or add one by hand."
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
            <Input
              value={division}
              onChange={(event) => {
                setDivision(event.target.value);
                setPage(1);
              }}
              placeholder="Division"
              className="h-9 w-40"
            />
            <div className="ml-auto flex items-center gap-2">
              <CsvExport
                rows={stations ?? []}
                filename="stations"
                columns={[
                  { header: 'code', value: (row) => row.code },
                  { header: 'name', value: (row) => row.name },
                  { header: 'division', value: (row) => row.division },
                  { header: 'zone', value: (row) => row.zone },
                  { header: 'lat', value: (row) => row.lat },
                  { header: 'lng', value: (row) => row.lng },
                  {
                    header: 'isJunction',
                    value: (row) => String(row.isJunction),
                  },
                ]}
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setImportOpen(true)}
              >
                <HugeiconsIcon icon={Upload04Icon} size={15} strokeWidth={2} />
                Import CSV
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
                Add station
              </Button>
            </div>
          </div>
        }
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a station"
        description="Global reference data — every tenant runs trains over the same network."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add station"
      >
        <StationFields form={form} disabled={saving} />
      </RecordDialog>

      <RecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`Edit ${editing?.code ?? ''}`}
        description="The code is the primary key half the schema points at, so it cannot be changed here."
        form={form}
        onSubmit={onEdit}
        isLoading={saving}
      >
        <StationFields form={form} disabled={saving} lockCode />
      </RecordDialog>

      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import stations"
        description="Sixty stations is a spreadsheet, not a form. Every row is validated before anything is sent."
        headers={['code', 'name', 'division', 'zone', 'lat', 'lng']}
        parseRow={(row) => {
          const parsed = stationSchema.safeParse({
            code: (row.code ?? '').trim().toUpperCase(),
            name: (row.name ?? '').trim(),
            division: (row.division ?? '').trim(),
            zone: (row.zone ?? '').trim(),
            lat: Number(row.lat),
            lng: Number(row.lng),
            isJunction: ['true', '1', 'yes'].includes(
              (row.isJunction ?? '').trim().toLowerCase()
            ),
          });
          return parsed.success
            ? parsed.data
            : (parsed.error.issues[0]?.message ?? 'Invalid row');
        }}
        previewColumns={[
          { header: 'code', value: (row) => row.code },
          { header: 'name', value: (row) => row.name },
          { header: 'division', value: (row) => row.division },
        ]}
        onConfirm={onImport}
        isLoading={saving}
      />
    </>
  );
};

const StationFields = ({
  form,
  disabled,
  lockCode,
}: {
  form: ReturnType<typeof useForm<StationFormValues>>;
  disabled: boolean;
  lockCode?: boolean;
}) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        control={form.control}
        name="code"
        label="Station code"
        placeholder="KWV"
        uppercase
        disabled={disabled || lockCode}
      />
      <TextField
        control={form.control}
        name="name"
        label="Name"
        placeholder="Kurduvadi Junction"
        disabled={disabled}
      />
      <TextField
        control={form.control}
        name="division"
        label="Division"
        placeholder="Solapur"
        disabled={disabled}
      />
      <TextField
        control={form.control}
        name="zone"
        label="Zone"
        placeholder="CR"
        uppercase
        disabled={disabled}
      />
      <NumberField
        control={form.control}
        name="lat"
        label="Latitude"
        step="0.000001"
        disabled={disabled}
      />
      <NumberField
        control={form.control}
        name="lng"
        label="Longitude"
        step="0.000001"
        disabled={disabled}
        description="Plotted on the network map from Phase 4."
      />
    </div>
    <SwitchField
      control={form.control}
      name="isJunction"
      label="Junction"
      description="More than two lines meet here."
      disabled={disabled}
    />
  </>
);

export default StationsTab;
