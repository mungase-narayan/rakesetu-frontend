import { useState } from 'react';

import { useChargeRuleList } from '@/api/charge-rule';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CsvExport,
  DataTable,
  PageHeader,
  TableEmptyState,
  TablePagination,
  TableSkeleton,
} from '@/components/shared';
import { columnHelper } from '@/components/shared/data-table.config';
import { CHARGE_RULE_TYPE_LABELS } from '@/constants';
import { ROUTES } from '@/routes/route-paths';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import {
  CHARGE_RULE_TYPES,
  type ChargeRule,
  type ChargeRuleType,
} from '@/types/master-data.types';

import RuleTester from './components/rule-tester';
import RuleDetailSheet from './components/rule-detail-sheet';

const helper = columnHelper<ChargeRule>();

const columns = [
  helper.accessor('type', {
    header: 'Type',
    cell: (info) => (
      <Badge variant="secondary">
        {CHARGE_RULE_TYPE_LABELS[info.getValue()]}
      </Badge>
    ),
    meta: { className: 'w-44' },
  }),
  helper.accessor('circularRef', {
    header: 'Circular',
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="font-mono text-xs font-semibold">
          {row.original.circularRef}
        </p>
        {row.original.clauseRef && (
          <p className="text-xs text-muted-foreground">
            clause {row.original.clauseRef}
          </p>
        )}
      </div>
    ),
    meta: { className: 'w-48' },
  }),
  helper.display({
    id: 'window',
    header: 'In force',
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.effectiveFrom} →{' '}
        {row.original.effectiveTo ?? (
          <span className="text-muted-foreground">open</span>
        )}
      </span>
    ),
    meta: { className: 'w-56' },
  }),
  helper.display({
    id: 'applies',
    header: 'Applies to',
    cell: ({ row }) => {
      const dimensions = Object.entries(row.original.selector).filter(
        ([key]) => key !== 'v'
      );
      if (dimensions.length === 0) {
        return (
          <span className="text-xs text-muted-foreground">
            Everything (fallback)
          </span>
        );
      }
      return (
        <div className="flex flex-wrap gap-1">
          {dimensions.map(([key, values]) => (
            <Badge key={key} variant="outline" className="text-[10px]">
              {(values as string[]).join(', ')}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  helper.accessor('version', {
    header: 'Version',
    cell: (info) => (
      <span className="font-mono text-xs">v{info.getValue()}</span>
    ),
    meta: { className: 'w-24' },
  }),
];

/**
 * Charge rules — the temporal screen.
 *
 * The **as-of** picker in the header is the point of it. Move it across a
 * supersession and the winning rule changes, because the filter is a SQL date
 * predicate and not a client-side convenience. That is the same mechanism the
 * charge engine uses in Phase 9, made visible here before any of it exists.
 */
const ChargeRulesPage = () => {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<ChargeRuleType | ''>('');
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [asOfEnabled, setAsOfEnabled] = useState(true);
  const [selected, setSelected] = useState<ChargeRule | null>(null);

  const { rules, pagination, isLoading } = useChargeRuleList({
    page,
    limit: DEFAULT_LIMIT,
    type: type || undefined,
    effectiveAt: asOfEnabled ? asOf : undefined,
  });

  const rows = rules ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Charge rules"
        description="The commercial rule book as versioned data. Every lookup names the date it is asking about."
        breadcrumb={[
          { label: 'Admin', to: ROUTES.admin.dashboard },
          { label: 'Charge rules' },
        ]}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">In force on</p>
              <Input
                type="date"
                value={asOf}
                onChange={(event) => {
                  setAsOf(event.target.value);
                  setPage(1);
                }}
                disabled={!asOfEnabled}
                className="h-9 w-40"
              />
            </div>
            <Button
              size="sm"
              variant={asOfEnabled ? 'default' : 'outline'}
              onClick={() => {
                setAsOfEnabled((current) => !current);
                setPage(1);
              }}
            >
              {asOfEnabled ? 'Filtering by date' : 'Showing every version'}
            </Button>
          </div>
        }
      />

      <Alert>
        <AlertDescription>
          Move the <strong>in force on</strong> date across a supersession and
          the rules below change. A rule that expired last June is not
          &ldquo;old&rdquo; — it is the correct rule for a bill dated last May,
          and re-deriving that bill still finds it.
        </AlertDescription>
      </Alert>

      <RuleTester />

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value as ChargeRuleType | '');
            setPage(1);
          }}
          className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
        >
          <option value="">Every charge type</option>
          {CHARGE_RULE_TYPES.map((value) => (
            <option key={value} value={value}>
              {CHARGE_RULE_TYPE_LABELS[value]}
            </option>
          ))}
        </select>
        <div className="ml-auto">
          <CsvExport
            rows={rows}
            filename="charge-rules"
            columns={[
              { header: 'type', value: (row) => row.type },
              { header: 'circularRef', value: (row) => row.circularRef },
              { header: 'clauseRef', value: (row) => row.clauseRef },
              { header: 'effectiveFrom', value: (row) => row.effectiveFrom },
              { header: 'effectiveTo', value: (row) => row.effectiveTo },
              { header: 'version', value: (row) => row.version },
              {
                header: 'selector',
                value: (row) => JSON.stringify(row.selector),
              },
              { header: 'params', value: (row) => JSON.stringify(row.params) },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={columns.length} />
      ) : rows.length === 0 ? (
        <TableEmptyState
          title="No rules in force on this date"
          description="That is a real answer, not an empty screen — try another date, or clear the filter to see every version."
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
              label="rules"
            />
          )}
        </>
      )}

      <RuleDetailSheet rule={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default ChargeRulesPage;
