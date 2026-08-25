import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert01Icon,
  CheckmarkCircle02Icon,
  SearchRemoveIcon,
} from '@hugeicons/core-free-icons';

import { useResolveRule } from '@/api/charge-rule';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CHARGE_RULE_TYPE_LABELS,
  COMMODITY_GROUP_LABELS,
  HANDLING_MODE_LABELS,
  TERMINAL_TYPE_LABELS,
} from '@/constants';
import {
  CHARGE_RULE_TYPES,
  COMMODITY_GROUPS,
  HANDLING_MODES,
  TERMINAL_TYPES,
  type ChargeRuleType,
  type CommodityGroup,
  type HandlingMode,
  type TerminalType,
} from '@/types/master-data.types';

const REASON_LABELS: Record<string, string> = {
  out_of_window: 'Not in force on that date',
  selector_mismatch: 'Does not apply to this case',
  unknown_version: 'Unreadable selector version',
  less_specific: 'Less specific than the winner',
  lower_version: 'Same specificity, older version',
};

interface PickerProps<T extends string> {
  label: string;
  value: T | '';
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T | '') => void;
}

const Picker = <T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: PickerProps<T>) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T | '')}
      className="h-9 w-full rounded-md border border-border/60 bg-background px-2 text-sm"
    >
      <option value="">Not specified</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Test this rule.
 *
 * Pick a case and a date, and see which rule wins **and why the others lost**.
 * That second half is the reason this panel exists: "the bill says nine free
 * hours and I expected six" is otherwise a database session, and here it is one
 * question that names the losing circular and the dimension that excluded it.
 *
 * There is no "today" shortcut, deliberately. Every lookup in the product names
 * its date, because "current" is the wrong answer to every question asked about
 * a past shipment.
 */
const RuleTester = () => {
  const [type, setType] = useState<ChargeRuleType>('free_time');
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [commodityGroup, setCommodityGroup] = useState<CommodityGroup | ''>(
    'cement'
  );
  const [terminalType, setTerminalType] = useState<TerminalType | ''>(
    'private_siding'
  );
  const [handlingMode, setHandlingMode] = useState<HandlingMode | ''>(
    'mechanised'
  );
  const [division, setDivision] = useState('');

  const { resolution, isLoading } = useResolveRule({
    type,
    asOf,
    commodityGroup: commodityGroup || undefined,
    terminalType: terminalType || undefined,
    handlingMode: handlingMode || undefined,
    division: division.trim() || undefined,
  });

  return (
    <div className="space-y-4 rounded-xl border border-border/60 p-4">
      <div>
        <p className="text-sm font-semibold">Test a rule</p>
        <p className="text-xs text-muted-foreground">
          Describe a case and a date. The winner is what the charge engine would
          use; everything else is listed with the reason it lost.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Picker
          label="Charge type"
          value={type}
          options={CHARGE_RULE_TYPES}
          labels={CHARGE_RULE_TYPE_LABELS}
          onChange={(value) => value && setType(value)}
        />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">As of</p>
          <Input
            type="date"
            value={asOf}
            onChange={(event) => setAsOf(event.target.value)}
            className="h-9"
          />
        </div>
        <Picker
          label="Commodity group"
          value={commodityGroup}
          options={COMMODITY_GROUPS}
          labels={COMMODITY_GROUP_LABELS}
          onChange={setCommodityGroup}
        />
        <Picker
          label="Terminal type"
          value={terminalType}
          options={TERMINAL_TYPES}
          labels={TERMINAL_TYPE_LABELS}
          onChange={setTerminalType}
        />
        <Picker
          label="Handling mode"
          value={handlingMode}
          options={HANDLING_MODES}
          labels={HANDLING_MODE_LABELS}
          onChange={setHandlingMode}
        />
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Division</p>
          <Input
            value={division}
            onChange={(event) => setDivision(event.target.value)}
            placeholder="Solapur"
            className="h-9"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Resolving…</p>
      ) : !resolution ? null : (
        <div className="space-y-3">
          {resolution.ambiguity && (
            <Alert variant="destructive">
              <AlertDescription>
                Two rules are equally specific at the same version. The charge
                engine refuses to choose between them — this is a data bug, not
                a tie to be broken.
              </AlertDescription>
            </Alert>
          )}

          {resolution.winner ? (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
              <div className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={16}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {resolution.winner.rule.circularRef}
                    {resolution.winner.rule.clauseRef
                      ? ` · clause ${resolution.winner.rule.clauseRef}`
                      : ''}
                  </p>
                  <p className="font-mono text-xs">
                    {JSON.stringify(resolution.winner.rule.params)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    In force {resolution.winner.rule.effectiveFrom} →{' '}
                    {resolution.winner.rule.effectiveTo ?? 'open-ended'} ·
                    matched {resolution.winner.specificity} selector dimension
                    {resolution.winner.specificity === 1 ? '' : 's'} · version{' '}
                    {resolution.winner.rule.version}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-border/60 p-3">
              <HugeiconsIcon
                icon={SearchRemoveIcon}
                size={16}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <p className="text-sm">
                No rule is in force for this case on {resolution.asOf}. The rule
                book has a hole here, and the charge engine would refuse rather
                than guess.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Rejected candidates ({resolution.rejected.length})
            </p>
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {resolution.rejected.map((entry) => (
                <div
                  key={entry.rule.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border/50 px-2.5 py-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {entry.rule.circularRef}
                      {entry.rule.clauseRef ? ` · ${entry.rule.clauseRef}` : ''}
                    </p>
                    <p className="text-muted-foreground">
                      {entry.reason.detail}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    <HugeiconsIcon
                      icon={Alert01Icon}
                      size={11}
                      strokeWidth={2}
                      className="mr-1"
                    />
                    {REASON_LABELS[entry.reason.kind] ?? entry.reason.kind}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleTester;
