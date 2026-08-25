import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Add01Icon,
  Route01Icon,
  Upload04Icon,
} from '@hugeicons/core-free-icons';

import { useSectionList, useSectionMutations } from '@/api/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CsvExport } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { LINE_TYPE_LABELS } from '@/constants';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type { Section } from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import CsvImportDialog from './csv-import-dialog';
import {
  NumberField,
  SelectField,
  SwitchField,
  TextField,
} from './form-fields';
import { optionsFrom } from './form-options';
import { sectionSchema, type SectionFormValues } from '../schema';

const helper = columnHelper<Section>();

const columns = [
  helper.display({
    id: 'edge',
    header: 'Section',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold">
        {row.original.fromCode} → {row.original.toCode}
      </span>
    ),
    meta: { className: 'w-36' },
  }),
  helper.accessor('distanceKm', {
    header: 'Distance',
    cell: (info) => `${info.getValue()} km`,
    meta: { className: 'w-28' },
  }),
  helper.accessor('lineType', {
    header: 'Line',
    cell: (info) => LINE_TYPE_LABELS[info.getValue()],
    meta: { className: 'w-32' },
  }),
  helper.accessor('nominalSpeedKmph', {
    header: 'Nominal speed',
    cell: (info) => `${info.getValue()} km/h`,
    meta: { className: 'w-32' },
  }),
  helper.accessor('maxAxleLoadT', {
    header: 'Max axle load',
    cell: (info) => `${info.getValue()} t`,
    meta: { className: 'w-32' },
  }),
  helper.accessor('isElectrified', {
    header: 'Traction',
    cell: (info) =>
      info.getValue() ? (
        <Badge variant="secondary">Electrified</Badge>
      ) : (
        <Badge variant="outline">Diesel</Badge>
      ),
    meta: { className: 'w-32' },
  }),
];

const EMPTY: SectionFormValues = {
  fromCode: '',
  toCode: '',
  distanceKm: 0,
  lineType: 'double',
  maxAxleLoadT: 22.9,
  isElectrified: true,
  nominalSpeedKmph: 60,
};

const SectionFields = ({
  form,
  disabled,
  lockEndpoints,
}: {
  form: ReturnType<typeof useForm<SectionFormValues>>;
  disabled: boolean;
  lockEndpoints?: boolean;
}) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        control={form.control}
        name="fromCode"
        label="From station"
        uppercase
        disabled={disabled || lockEndpoints}
      />
      <TextField
        control={form.control}
        name="toCode"
        label="To station"
        uppercase
        disabled={disabled || lockEndpoints}
      />
      <NumberField
        control={form.control}
        name="distanceKm"
        label="Distance (km)"
        step="0.01"
        disabled={disabled}
        description="Geographic, not tariff."
      />
      <SelectField
        control={form.control}
        name="lineType"
        label="Line type"
        options={optionsFrom(LINE_TYPE_LABELS)}
        disabled={disabled}
      />
      <NumberField
        control={form.control}
        name="maxAxleLoadT"
        label="Max axle load (t)"
        step="0.1"
        disabled={disabled}
      />
      <NumberField
        control={form.control}
        name="nominalSpeedKmph"
        label="Nominal speed (km/h)"
        step="0.1"
        disabled={disabled}
        description="The ETA fallback until this section has enough observed events."
      />
    </div>
    <SwitchField
      control={form.control}
      name="isElectrified"
      label="Electrified"
      disabled={disabled}
    />
  </>
);

/**
 * Sections — the graph edges.
 *
 * Both directions are separate rows, so importing a corridor means importing it
 * twice. That is not an oversight: a single-line section can carry a different
 * nominal speed by direction, and the shortest-path search stays a plain
 * adjacency walk because of it.
 */
const SectionsTab = () => {
  const [page, setPage] = useState(1);
  const [fromCode, setFromCode] = useState('');
  const [toCode, setToCode] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);

  const { sections, pagination, isLoading } = useSectionList({
    page,
    limit: DEFAULT_LIMIT,
    fromCode: fromCode.trim().toUpperCase() || undefined,
    toCode: toCode.trim().toUpperCase() || undefined,
  });

  const {
    createSections,
    updateSection,
    isLoading: saving,
  } = useSectionMutations();

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        fromCode: editing.fromCode,
        toCode: editing.toCode,
        distanceKm: editing.distanceKm,
        lineType: editing.lineType,
        maxAxleLoadT: editing.maxAxleLoadT,
        isElectrified: editing.isElectrified,
        nominalSpeedKmph: editing.nominalSpeedKmph,
      });
    } else if (createOpen) {
      form.reset(EMPTY);
    }
  }, [editing, createOpen, form]);

  const onCreate = (values: SectionFormValues) =>
    createSections(
      { data: values },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({
            message: `Section ${values.fromCode}→${values.toCode} added. The cached network graph was invalidated.`,
          });
        },
      }
    );

  const onEdit = (values: SectionFormValues) => {
    if (!editing) return;
    updateSection(
      {
        id: editing.id,
        data: {
          distanceKm: values.distanceKm,
          lineType: values.lineType,
          maxAxleLoadT: values.maxAxleLoadT,
          isElectrified: values.isElectrified,
          nominalSpeedKmph: values.nominalSpeedKmph,
        },
      },
      {
        onSuccess: () => {
          setEditing(null);
          successToast({ message: 'Section updated.' });
        },
      }
    );
  };

  /** One request for the whole file — see the bulk endpoint. */
  const onImport = (rows: SectionFormValues[]) =>
    createSections(
      { data: rows },
      {
        onSuccess: () => {
          setImportOpen(false);
          successToast({ message: `Imported ${rows.length} sections.` });
        },
      }
    );

  return (
    <>
      <ListSurface
        columns={columns}
        rows={sections}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowClick={setEditing}
        label="sections"
        emptyIcon={Route01Icon}
        emptyTitle="No sections"
        emptyDescription="Without sections there is no graph, and no operational distance to compute."
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
            <Input
              value={toCode}
              onChange={(event) => {
                setToCode(event.target.value);
                setPage(1);
              }}
              placeholder="To"
              className="h-9 w-28 uppercase"
            />
            <div className="ml-auto flex items-center gap-2">
              <CsvExport
                rows={sections ?? []}
                filename="sections"
                columns={[
                  { header: 'fromCode', value: (row) => row.fromCode },
                  { header: 'toCode', value: (row) => row.toCode },
                  { header: 'distanceKm', value: (row) => row.distanceKm },
                  { header: 'lineType', value: (row) => row.lineType },
                  { header: 'maxAxleLoadT', value: (row) => row.maxAxleLoadT },
                  {
                    header: 'nominalSpeedKmph',
                    value: (row) => row.nominalSpeedKmph,
                  },
                  {
                    header: 'isElectrified',
                    value: (row) => String(row.isElectrified),
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
                Add section
              </Button>
            </div>
          </div>
        }
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a section"
        description="One direction. Add the reverse separately — speeds can differ by direction."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add section"
      >
        <SectionFields form={form} disabled={saving} />
      </RecordDialog>

      <RecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`Edit ${editing?.fromCode ?? ''} → ${editing?.toCode ?? ''}`}
        description="Saving invalidates the cached network graph, so the next distance query reads the new value."
        form={form}
        onSubmit={onEdit}
        isLoading={saving}
      >
        <SectionFields form={form} disabled={saving} lockEndpoints />
      </RecordDialog>

      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import sections"
        description="Ninety sections in one request. Remember both directions — the file needs a row for each."
        headers={[
          'fromCode',
          'toCode',
          'distanceKm',
          'lineType',
          'maxAxleLoadT',
          'nominalSpeedKmph',
        ]}
        parseRow={(row) => {
          const parsed = sectionSchema.safeParse({
            fromCode: (row.fromCode ?? '').trim().toUpperCase(),
            toCode: (row.toCode ?? '').trim().toUpperCase(),
            distanceKm: Number(row.distanceKm),
            lineType: (row.lineType ?? '').trim(),
            maxAxleLoadT: Number(row.maxAxleLoadT),
            nominalSpeedKmph: Number(row.nominalSpeedKmph),
            isElectrified: !['false', '0', 'no'].includes(
              (row.isElectrified ?? 'true').trim().toLowerCase()
            ),
          });
          return parsed.success
            ? parsed.data
            : (parsed.error.issues[0]?.message ?? 'Invalid row');
        }}
        previewColumns={[
          { header: 'fromCode', value: (row) => row.fromCode },
          { header: 'toCode', value: (row) => row.toCode },
          { header: 'distanceKm', value: (row) => String(row.distanceKm) },
        ]}
        onConfirm={onImport}
        isLoading={saving}
      />
    </>
  );
};

export default SectionsTab;
