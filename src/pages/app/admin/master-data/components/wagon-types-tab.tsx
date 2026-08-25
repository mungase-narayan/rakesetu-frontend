import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, TruckDeliveryIcon } from '@hugeicons/core-free-icons';

import { useWagonTypeList, useWagonTypeMutations } from '@/api/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CsvExport } from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import { COMMODITY_GROUP_LABELS } from '@/constants';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type { WagonType } from '@/types/master-data.types';

import ListSurface from './list-surface';
import RecordDialog from './record-dialog';
import {
  CheckboxGroupField,
  NumberField,
  SwitchField,
  TextField,
} from './form-fields';
import { optionsFrom } from './form-options';
import { wagonTypeSchema, type WagonTypeFormValues } from '../schema';

const helper = columnHelper<WagonType>();

const columns = [
  helper.accessor('code', {
    header: 'Code',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
    meta: { className: 'w-28' },
  }),
  helper.accessor('name', { header: 'Name', meta: { className: 'w-64' } }),
  helper.accessor('ccT', {
    header: 'Carrying capacity',
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.ccT} t
        <span className="text-muted-foreground">
          {' '}
          / {row.original.ccPlus82T} t
        </span>
      </span>
    ),
    meta: { className: 'w-40' },
  }),
  helper.accessor('lengthM', {
    header: 'Length',
    cell: (info) => `${info.getValue()} m`,
    meta: { className: 'w-24' },
  }),
  helper.accessor('commodityGroups', {
    header: 'Carries',
    cell: (info) => (
      <div className="flex flex-wrap gap-1">
        {info.getValue().map((group) => (
          <Badge key={group} variant="outline" className="text-[10px]">
            {COMMODITY_GROUP_LABELS[group]}
          </Badge>
        ))}
      </div>
    ),
  }),
  helper.accessor('isCovered', {
    header: 'Covered',
    cell: (info) =>
      info.getValue() ? (
        <Badge variant="secondary">Covered</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Open</span>
      ),
    meta: { className: 'w-28' },
  }),
];

const EMPTY: WagonTypeFormValues = {
  code: '',
  name: '',
  tareT: 0,
  ccT: 0,
  ccPlus82T: 0,
  commodityGroups: [],
  lengthM: 0,
  isCovered: false,
};

/** The global wagon catalogue: what a type weighs, carries and measures. */
const WagonTypesTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<WagonType | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { wagonTypes, pagination, isLoading } = useWagonTypeList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
  });

  const {
    createWagonType,
    updateWagonType,
    isLoading: saving,
  } = useWagonTypeMutations();

  const form = useForm<WagonTypeFormValues>({
    resolver: zodResolver(wagonTypeSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.code,
        name: editing.name,
        tareT: editing.tareT,
        ccT: editing.ccT,
        ccPlus82T: editing.ccPlus82T,
        commodityGroups: editing.commodityGroups,
        lengthM: editing.lengthM,
        isCovered: editing.isCovered,
      });
    } else if (createOpen) {
      form.reset(EMPTY);
    }
  }, [editing, createOpen, form]);

  const onCreate = (values: WagonTypeFormValues) =>
    createWagonType(
      { data: values },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: `Wagon type ${values.code} added.` });
        },
      }
    );

  const onEdit = (values: WagonTypeFormValues) => {
    if (!editing) return;
    updateWagonType(
      { code: editing.code, data: values },
      {
        onSuccess: () => {
          setEditing(null);
          successToast({ message: `Wagon type ${editing.code} updated.` });
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
          placeholder="BOXNHL"
          uppercase
          disabled={saving || lockCode}
        />
        <TextField
          control={form.control}
          name="name"
          label="Name"
          disabled={saving}
        />
        <NumberField
          control={form.control}
          name="tareT"
          label="Tare weight (t)"
          step="0.01"
          disabled={saving}
        />
        <NumberField
          control={form.control}
          name="lengthM"
          label="Length (m)"
          step="0.01"
          disabled={saving}
          description="Summed across a rake, against the terminal's limit."
        />
        <NumberField
          control={form.control}
          name="ccT"
          label="Carrying capacity (t)"
          step="0.01"
          disabled={saving}
        />
        <NumberField
          control={form.control}
          name="ccPlus82T"
          label="CC + 8 + 2 (t)"
          step="0.01"
          disabled={saving}
        />
      </div>
      <CheckboxGroupField
        control={form.control}
        name="commodityGroups"
        label="Commodity groups"
        description="What this type may carry — the solver's compatibility check."
        options={optionsFrom(COMMODITY_GROUP_LABELS)}
        disabled={saving}
      />
      <SwitchField
        control={form.control}
        name="isCovered"
        label="Covered wagon"
        disabled={saving}
      />
    </>
  );

  return (
    <>
      <ListSurface
        columns={columns}
        rows={wagonTypes}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={setPage}
        onRowClick={setEditing}
        label="wagon types"
        emptyIcon={TruckDeliveryIcon}
        emptyTitle="No wagon types"
        emptyDescription="Rakes and wagons both point at this catalogue."
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
                rows={wagonTypes ?? []}
                filename="wagon-types"
                columns={[
                  { header: 'code', value: (row) => row.code },
                  { header: 'name', value: (row) => row.name },
                  { header: 'tareT', value: (row) => row.tareT },
                  { header: 'ccT', value: (row) => row.ccT },
                  { header: 'ccPlus82T', value: (row) => row.ccPlus82T },
                  { header: 'lengthM', value: (row) => row.lengthM },
                  {
                    header: 'commodityGroups',
                    value: (row) => row.commodityGroups.join('|'),
                  },
                ]}
              />
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setCreateOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
                Add wagon type
              </Button>
            </div>
          </div>
        }
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a wagon type"
        description="A catalogue entry, shared by every tenant."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add wagon type"
      >
        {fields(false)}
      </RecordDialog>

      <RecordDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`Edit ${editing?.code ?? ''}`}
        description="Wagons and rakes reference this code, so it cannot change here."
        form={form}
        onSubmit={onEdit}
        isLoading={saving}
      >
        {fields(true)}
      </RecordDialog>
    </>
  );
};

export default WagonTypesTab;
