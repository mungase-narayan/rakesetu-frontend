import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, PackageIcon } from '@hugeicons/core-free-icons';

import { useCommodityList, useCommodityMutations } from '@/api/commercial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CsvExport } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import { COMMODITY_GROUP_LABELS } from '@/constants';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type { Commodity } from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import { SelectField, SwitchField, TextField } from './form-fields';
import { optionsFrom } from './form-options';
import { commoditySchema, type CommodityFormValues } from '../schema';

const helper = columnHelper<Commodity>();

const columns = [
  helper.accessor('code', {
    header: 'Code',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
    meta: { className: 'w-24' },
  }),
  helper.accessor('name', { header: 'Name', meta: { className: 'w-64' } }),
  helper.accessor('group', {
    header: 'Group',
    cell: (info) => (
      <Badge variant="secondary">
        {COMMODITY_GROUP_LABELS[info.getValue()]}
      </Badge>
    ),
    meta: { className: 'w-36' },
  }),
  helper.accessor('class', {
    header: 'IRCA class',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    meta: { className: 'w-28' },
  }),
  helper.accessor('minWeightCondition', {
    header: 'Min weight',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    meta: { className: 'w-32' },
  }),
  helper.accessor('isHazardous', {
    header: 'Hazardous',
    cell: (info) =>
      info.getValue() ? (
        <Badge variant="destructive">Hazardous</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
    meta: { className: 'w-28' },
  }),
];

const EMPTY: CommodityFormValues = {
  code: '',
  name: '',
  group: 'other',
  class: '',
  minWeightCondition: '',
  isHazardous: false,
};

/**
 * Commodities.
 *
 * `class` and `minWeightCondition` are required and have no default, and the
 * form says why: a commodity without a class prices at nothing in the rating
 * engine, which is a revenue error that no screen shows as an error.
 */
const CommoditiesTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Commodity | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { commodities, pagination, isLoading } = useCommodityList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
  });

  const {
    createCommodity,
    updateCommodity,
    isLoading: saving,
  } = useCommodityMutations();

  const form = useForm<CommodityFormValues>({
    resolver: zodResolver(commoditySchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.code,
        name: editing.name,
        group: editing.group,
        class: editing.class,
        minWeightCondition: editing.minWeightCondition,
        isHazardous: editing.isHazardous,
      });
    } else if (createOpen) {
      form.reset(EMPTY);
    }
  }, [editing, createOpen, form]);

  const onCreate = (values: CommodityFormValues) =>
    createCommodity(
      { data: values },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: `Commodity ${values.code} added.` });
        },
      }
    );

  const onEdit = (values: CommodityFormValues) => {
    if (!editing) return;
    updateCommodity(
      { code: editing.code, data: values },
      {
        onSuccess: () => {
          setEditing(null);
          successToast({ message: `Commodity ${editing.code} updated.` });
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
          label="Code"
          placeholder="CEM"
          uppercase
          disabled={saving || lockCode}
        />
        <TextField
          control={form.control}
          name="name"
          label="Name"
          placeholder="Cement (bagged)"
          disabled={saving}
        />
        <SelectField
          control={form.control}
          name="group"
          label="Commodity group"
          options={optionsFrom(COMMODITY_GROUP_LABELS)}
          disabled={saving}
          description="Joins terminals and wagon types — the compatibility check."
        />
        <TextField
          control={form.control}
          name="class"
          label="IRCA class"
          placeholder="140"
          disabled={saving}
          description="Drives the per-tonne rate."
        />
        <TextField
          control={form.control}
          name="minWeightCondition"
          label="Minimum weight condition"
          placeholder="CC+8+2"
          disabled={saving}
          description="CC, CC+8+2 or permissible."
          className="sm:col-span-2"
        />
      </div>
      <SwitchField
        control={form.control}
        name="isHazardous"
        label="Hazardous"
        description="Restricts which wagons and terminals may handle it."
        disabled={saving}
      />
    </>
  );

  return (
    <>
      <ListSurface
        columns={columns}
        rows={commodities}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowClick={setEditing}
        label="commodities"
        emptyIcon={PackageIcon}
        emptyTitle="No commodities"
        emptyDescription="The rating engine and the free-time lookup both read this table."
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
            <div className="ml-auto flex items-center gap-2">
              <CsvExport
                rows={commodities ?? []}
                filename="commodities"
                columns={[
                  { header: 'code', value: (row) => row.code },
                  { header: 'name', value: (row) => row.name },
                  { header: 'group', value: (row) => row.group },
                  { header: 'class', value: (row) => row.class },
                  {
                    header: 'minWeightCondition',
                    value: (row) => row.minWeightCondition,
                  },
                  {
                    header: 'isHazardous',
                    value: (row) => String(row.isHazardous),
                  },
                ]}
              />
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
                Add commodity
              </Button>
            </div>
          </div>
        }
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a commodity"
        description="Global reference data. The class and minimum-weight condition are what price it."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add commodity"
      >
        {fields(false)}
      </RecordDialog>

      <RecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`Edit ${editing?.code ?? ''}`}
        description="The code is referenced by sidings and indents, so it cannot change here."
        form={form}
        onSubmit={onEdit}
        isLoading={saving}
      >
        {fields(true)}
      </RecordDialog>
    </>
  );
};

export default CommoditiesTab;
