import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';

import { useCustomerList, useCustomerMutations } from '@/api/commercial';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CsvExport,
  DataTable,
  PageHeader,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { successToast } from '@/lib/toast.lib';
import { useDebounce } from '@/hooks';
import { CUSTOMER_TIER_LABELS } from '@/constants';
import { ROUTES } from '@/routes/route-paths';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import {
  CUSTOMER_TIERS,
  type Customer,
  type CustomerTier,
} from '@/types/master-data.types';

import RecordDialog from '../master-data/components/record-dialog';
import {
  NumberField,
  SelectField,
  TextField,
} from '../master-data/components/form-fields';
import { optionsFrom } from '../master-data/components/form-options';
import { customerSchema, type CustomerFormValues } from '../master-data/schema';
import CustomerSheet from './components/customer-sheet';

const helper = columnHelper<Customer>();

const TIER_VARIANT: Record<CustomerTier, 'default' | 'secondary' | 'outline'> =
  {
    platinum: 'default',
    gold: 'default',
    silver: 'secondary',
    standard: 'outline',
  };

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const columns = [
  helper.accessor('code', {
    header: 'Code',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
    meta: { className: 'w-28' },
  }),
  helper.accessor('name', { header: 'Customer', meta: { className: 'w-72' } }),
  helper.accessor('tier', {
    header: 'Tier',
    cell: (info) => (
      <Badge variant={TIER_VARIANT[info.getValue()]}>
        {CUSTOMER_TIER_LABELS[info.getValue()]}
      </Badge>
    ),
    meta: { className: 'w-28' },
  }),
  helper.accessor('creditLimit', {
    header: 'Credit limit',
    cell: (info) => {
      const value = info.getValue();
      return (
        <span className="text-xs">
          {value === null ? '—' : inr.format(value)}
        </span>
      );
    },
    meta: { className: 'w-36' },
  }),
  helper.accessor('customerOrgId', {
    header: 'Portal',
    cell: (info) =>
      info.getValue() ? (
        <Badge variant="secondary">Has a login</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">No login</span>
      ),
    meta: { className: 'w-32' },
  }),
  helper.accessor('contactEmail', {
    header: 'Contact',
    cell: (info) => (
      <span className="text-xs text-muted-foreground">
        {info.getValue() ?? '—'}
      </span>
    ),
  }),
];

const EMPTY: CustomerFormValues = {
  code: '',
  name: '',
  tier: 'standard',
  gstin: '',
  contactEmail: '',
  contactPhone: '',
};

/**
 * Customers.
 *
 * The "Portal" column is the visible face of **DECISIONS D7**: a customer is a
 * row in this zone's book of business, and *sometimes* also a tenant with its
 * own login. Both facts live on the same row, in two different columns, and the
 * customer portal Phase 6 builds reads it through the second one.
 */
const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<CustomerTier | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const debouncedSearch = useDebounce(search, 350);
  const { customers, pagination, isLoading } = useCustomerList({
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch.trim() || undefined,
    tier: tier || undefined,
  });

  const { createCustomer, isLoading: saving } = useCustomerMutations();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (createOpen) form.reset(EMPTY);
  }, [createOpen, form]);

  const onCreate = (values: CustomerFormValues) =>
    createCustomer(
      {
        data: {
          ...values,
          // Empty strings mean "unset" to the API; sending them would write a
          // blank GSTIN rather than leaving the column null.
          gstin: values.gstin || null,
          contactEmail: values.contactEmail || null,
          contactPhone: values.contactPhone || null,
          creditLimit: values.creditLimit ?? null,
        },
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          successToast({ message: `Customer ${values.code} added.` });
        },
      }
    );

  const rows = customers ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="The zone's book of business. Tier cold-starts the solver's SLA risk before there is any delivery history to learn from."
        breadcrumb={[
          { label: 'Admin', to: ROUTES.admin.dashboard },
          { label: 'Customers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <CsvExport
              rows={rows}
              filename="customers"
              columns={[
                { header: 'code', value: (row) => row.code },
                { header: 'name', value: (row) => row.name },
                { header: 'tier', value: (row) => row.tier },
                { header: 'gstin', value: (row) => row.gstin },
                { header: 'creditLimit', value: (row) => row.creditLimit },
                { header: 'contactEmail', value: (row) => row.contactEmail },
              ]}
            />
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} size={15} strokeWidth={2} />
              Add customer
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search code or name…"
          className="h-9 w-64"
        />
        <select
          value={tier}
          onChange={(event) => {
            setTier(event.target.value as CustomerTier | '');
            setPage(1);
          }}
          className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
        >
          <option value="">Any tier</option>
          {CUSTOMER_TIERS.map((value) => (
            <option key={value} value={value}>
              {CUSTOMER_TIER_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns.length} />
      ) : rows.length === 0 ? (
        <TableEmptyState
          icon={UserGroupIcon}
          title="No customers"
          description="Indents, consignments and invoices all hang off a customer."
        />
      ) : (
        <>
          <DataTable columns={columns} data={rows} onRowClick={setSelected} />
          {pagination && pagination.totalPages > 1 && (
            <TablePagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
              label="customers"
            />
          )}
        </>
      )}

      <CustomerSheet
        customerId={selected?.id ?? null}
        onClose={() => setSelected(null)}
      />

      <RecordDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add a customer"
        description="Sidings are added afterwards, from the customer's detail panel."
        form={form}
        onSubmit={onCreate}
        isLoading={saving}
        submitLabel="Add customer"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="code"
            label="Code"
            uppercase
            disabled={saving}
          />
          <TextField
            control={form.control}
            name="name"
            label="Name"
            disabled={saving}
          />
          <SelectField
            control={form.control}
            name="tier"
            label="Tier"
            options={optionsFrom(CUSTOMER_TIER_LABELS)}
            disabled={saving}
            description="Cold-starts SLA risk in the solver."
          />
          <NumberField
            control={form.control}
            name="creditLimit"
            label="Credit limit (₹)"
            step="1000"
            disabled={saving}
          />
          <TextField
            control={form.control}
            name="gstin"
            label="GSTIN"
            uppercase
            disabled={saving}
          />
          <TextField
            control={form.control}
            name="contactPhone"
            label="Contact phone"
            disabled={saving}
          />
          <TextField
            control={form.control}
            name="contactEmail"
            label="Contact email"
            disabled={saving}
            className="sm:col-span-2"
          />
        </div>
      </RecordDialog>
    </div>
  );
};

export default CustomersPage;
