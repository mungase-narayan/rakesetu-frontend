import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Alert01Icon,
  Coins01Icon,
  Upload04Icon,
} from '@hugeicons/core-free-icons';

import {
  useChargeableDistanceList,
  useChargeableDistanceMutations,
  useDistance,
} from '@/api/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CsvExport } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type { ChargeableDistance } from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import CsvImportDialog from './csv-import-dialog';
import { NumberField, TextField } from './form-fields';
import {
  chargeableDistanceSchema,
  type ChargeableDistanceFormValues,
} from '../schema';

const helper = columnHelper<ChargeableDistance>();

const columns = [
  helper.display({
    id: 'pair',
    header: 'Pair',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold">
        {row.original.fromCode} → {row.original.toCode}
      </span>
    ),
    meta: { className: 'w-36' },
  }),
  helper.accessor('km', {
    header: 'Tariff distance',
    cell: (info) => `${info.getValue()} km`,
    meta: { className: 'w-36' },
  }),
  helper.accessor('sourceRef', {
    header: 'Source',
    cell: (info) => (
      <span className="text-xs text-muted-foreground">
        {info.getValue() ?? '—'}
      </span>
    ),
  }),
];

const EMPTY: ChargeableDistanceFormValues = {
  fromCode: '',
  toCode: '',
  km: 0,
  sourceRef: '',
};

/**
 * A side-by-side comparison of the two distances for one pair.
 *
 * This little panel is the clearest statement the product makes about why there
 * are two of them: the same origin and destination, two different numbers, and
 * a **422 rather than a guess** when the tariff table has no row. A quotation
 * built on the operational figure is wrong in a way nobody notices until a
 * customer disputes the bill.
 */
const DistanceComparison = () => {
  const [from, setFrom] = useState('KWV');
  const [to, setTo] = useState('PUNE');

  const tariff = useDistance(from, to, 'tariff');
  const operational = useDistance(from, to, 'operational');

  return (
    <div className="space-y-3 rounded-xl border border-border/60 p-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">From</p>
          <Input
            value={from}
            onChange={(event) => setFrom(event.target.value.toUpperCase())}
            className="h-9 w-28 uppercase"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">To</p>
          <Input
            value={to}
            onChange={(event) => setTo(event.target.value.toUpperCase())}
            className="h-9 w-28 uppercase"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Tariff distance
          </p>
          {tariff.isLoading ? (
            <p className="mt-1 text-sm text-muted-foreground">Checking…</p>
          ) : tariff.isError ? (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-destructive">
              <HugeiconsIcon
                icon={Alert01Icon}
                size={15}
                strokeWidth={2}
                className="mt-0.5 shrink-0"
              />
              Not on record — and deliberately not guessed.
            </p>
          ) : (
            <p className="mt-1 text-2xl font-semibold">
              {tariff.distance?.km}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                km
              </span>
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Looked up, never computed. This is the number that prices freight.
          </p>
        </div>

        <div className="rounded-lg border border-border/60 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            Operational distance
          </p>
          {operational.isLoading ? (
            <p className="mt-1 text-sm text-muted-foreground">Computing…</p>
          ) : operational.isError ? (
            <p className="mt-1 text-sm text-destructive">No route on record.</p>
          ) : (
            <p className="mt-1 text-2xl font-semibold">
              {operational.distance?.km}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                km
              </span>
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Shortest path over the sections
            {operational.distance?.path
              ? ` — ${operational.distance.path.stations.length} stations, ${Math.round(operational.distance.path.totalMinutes)} min free running`
              : ''}
            .
          </p>
        </div>
      </div>
    </div>
  );
};

/** The tariff table: bulk-loaded, never computed, and never back-filled by guess. */
const DistancesTab = () => {
  const [page, setPage] = useState(1);
  const [fromCode, setFromCode] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { distances, pagination, isLoading } = useChargeableDistanceList({
    page,
    limit: DEFAULT_LIMIT,
    fromCode: fromCode.trim().toUpperCase() || undefined,
  });

  const { createChargeableDistances, isLoading: saving } =
    useChargeableDistanceMutations();

  const form = useForm<ChargeableDistanceFormValues>({
    resolver: zodResolver(chargeableDistanceSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (createOpen) form.reset(EMPTY);
  }, [createOpen, form]);

  const onCreate = (values: ChargeableDistanceFormValues) =>
    createChargeableDistances(
      { data: { ...values, sourceRef: values.sourceRef || null } },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: 'Tariff distance recorded.' });
        },
      }
    );

  const onImport = (rows: ChargeableDistanceFormValues[]) =>
    createChargeableDistances(
      {
        data: rows.map((row) => ({ ...row, sourceRef: row.sourceRef || null })),
      },
      {
        onSuccess: () => {
          setImportOpen(false);
          successToast({
            message: `Imported ${rows.length} tariff distances.`,
          });
        },
      }
    );

  return (
    <>
      <div className="space-y-4">
        <Alert>
          <AlertDescription>
            These are <strong>official</strong> distances from the published
            tariff. They are looked up and never computed — a pair that is
            missing returns an error rather than falling back to the shortest
            path, because a plausible wrong number on an invoice is worse than a
            visible failure.
          </AlertDescription>
        </Alert>

        <DistanceComparison />

        <ListSurface
          columns={columns}
          rows={distances}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={setPage}
          label="pairs"
          emptyIcon={Coins01Icon}
          emptyTitle="No tariff distances"
          emptyDescription="Import the published table; every quotation depends on it."
          toolbar={
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={fromCode}
                onChange={(event) => {
                  setFromCode(event.target.value);
                  setPage(1);
                }}
                placeholder="From"
                className="h-9 w-28 uppercase"
              />
              <div className="ml-auto flex items-center gap-2">
                <CsvExport
                  rows={distances ?? []}
                  filename="chargeable-distances"
                  columns={[
                    { header: 'fromCode', value: (row) => row.fromCode },
                    { header: 'toCode', value: (row) => row.toCode },
                    { header: 'km', value: (row) => row.km },
                    { header: 'sourceRef', value: (row) => row.sourceRef },
                  ]}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setImportOpen(true)}
                >
                  <HugeiconsIcon
                    icon={Upload04Icon}
                    size={15}
                    strokeWidth={2}
                  />
                  Import CSV
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setCreateOpen(true)}
                >
                  <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
                  Add pair
                </Button>
              </div>
            </div>
          }
        />
      </div>

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a tariff distance"
        description="One pair, one direction, from a published table."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add pair"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="fromCode"
            label="From station"
            uppercase
            disabled={saving}
          />
          <TextField
            control={form.control}
            name="toCode"
            label="To station"
            uppercase
            disabled={saving}
          />
          <NumberField
            control={form.control}
            name="km"
            label="Tariff kilometres"
            step="1"
            disabled={saving}
            description="A whole number, as published."
          />
          <TextField
            control={form.control}
            name="sourceRef"
            label="Source reference"
            placeholder="Goods Tariff No. 45 Part II"
            disabled={saving}
          />
        </div>
      </RecordDialog>

      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import tariff distances"
        description="A tariff table arrives as a table. The whole file goes in one request."
        headers={['fromCode', 'toCode', 'km']}
        parseRow={(row) => {
          const parsed = chargeableDistanceSchema.safeParse({
            fromCode: (row.fromCode ?? '').trim().toUpperCase(),
            toCode: (row.toCode ?? '').trim().toUpperCase(),
            km: Number(row.km),
            sourceRef: (row.sourceRef ?? '').trim() || undefined,
          });
          return parsed.success
            ? parsed.data
            : (parsed.error.issues[0]?.message ?? 'Invalid row');
        }}
        previewColumns={[
          { header: 'fromCode', value: (row) => row.fromCode },
          { header: 'toCode', value: (row) => row.toCode },
          { header: 'km', value: (row) => String(row.km) },
        ]}
        onConfirm={onImport}
        isLoading={saving}
      />
    </>
  );
};

export default DistancesTab;
