import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CHARGE_RULE_TYPE_LABELS } from '@/constants';
import type { ChargeRule } from '@/types/master-data.types';

const DIMENSION_LABELS: Record<string, string> = {
  commodityGroups: 'Commodity groups',
  terminalTypes: 'Terminal types',
  handlingModes: 'Handling modes',
  wagonTypeCodes: 'Wagon types',
  divisions: 'Divisions',
};

/** Renders `params` as readable rows rather than raw JSON. */
const ParamRows = ({ rule }: { rule: ChargeRule }) => {
  const params = rule.params;

  if (rule.type === 'free_time') {
    return <Row label="Free time" value={`${String(params.hours)} hours`} />;
  }

  if (rule.type === 'demurrage' || rule.type === 'base_rate') {
    const slabs = (params.slabs ?? []) as Record<string, unknown>[];
    return (
      <>
        {rule.type === 'demurrage' && (
          <Row
            label="Base rate"
            value={`₹${String(params.baseRatePerWagonHour)} per wagon-hour`}
          />
        )}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Slabs</p>
          {slabs.map((slab, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-border/50 px-2.5 py-1.5 text-xs"
            >
              <span>
                {rule.type === 'demurrage'
                  ? slab.upToHours === null
                    ? 'beyond the last slab'
                    : `up to ${String(slab.upToHours)} hours`
                  : slab.upToKm === null
                    ? 'beyond the last slab'
                    : `up to ${String(slab.upToKm)} km`}
              </span>
              <span className="font-mono">
                {rule.type === 'demurrage'
                  ? `× ${String(slab.multiplier)}`
                  : `₹${String(slab.ratePerTonne)} / t`}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (rule.type === 'wharfage') {
    return (
      <>
        <Row
          label="Rate"
          value={`₹${String(params.ratePerTonneHour)} per tonne-hour`}
        />
        <Row label="Free period" value={`${String(params.freeHours)} hours`} />
      </>
    );
  }

  if (rule.type === 'bsc') {
    return <Row label="Uplift" value={`${String(params.percentage)}%`} />;
  }

  if (rule.type === 'dev_charge') {
    return (
      <Row label="Charge" value={`₹${String(params.perTonne)} per tonne`} />
    );
  }

  return (
    <>
      <Row label="Charge" value={`₹${String(params.perWagon)} per wagon`} />
      <Row label="Levied at" value={String(params.side)} />
    </>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-md border border-border/50 px-2.5 py-2 text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

/**
 * One rule, read as prose.
 *
 * `selector` and `params` are jsonb, and a sheet that dumped them as JSON would
 * be asking a commercial officer to read a data structure. The interesting part
 * is the same either way — which cases this applies to, and what it charges —
 * so it is rendered as rows.
 */
const RuleDetailSheet = ({
  rule,
  onClose,
}: {
  rule: ChargeRule | null;
  onClose: () => void;
}) => {
  const dimensions = rule
    ? (Object.entries(rule.selector).filter(([key]) => key !== 'v') as [
        string,
        string[],
      ][])
    : [];

  return (
    <Sheet open={Boolean(rule)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {rule ? CHARGE_RULE_TYPE_LABELS[rule.type] : ''}
          </SheetTitle>
          <SheetDescription>
            {rule?.circularRef}
            {rule?.clauseRef ? ` · clause ${rule.clauseRef}` : ''}
          </SheetDescription>
        </SheetHeader>

        {rule && (
          <div className="space-y-5 px-4 pb-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                In force
              </p>
              <p className="font-mono text-sm">
                {rule.effectiveFrom} → {rule.effectiveTo ?? 'open-ended'}
              </p>
              <p className="text-xs text-muted-foreground">
                Version {rule.version}. Every lookup names the date it is asking
                about, so re-deriving an old bill finds the rule that was in
                force then — not this one.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Applies to
              </p>
              {dimensions.length === 0 ? (
                <p className="rounded-md border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                  Every case. This rule names no dimension, so it is the
                  fallback — anything more specific beats it.
                </p>
              ) : (
                <div className="space-y-1">
                  {dimensions.map(([key, values]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-3 rounded-md border border-border/50 px-2.5 py-2 text-xs"
                    >
                      <span className="text-muted-foreground">
                        {DIMENSION_LABELS[key] ?? key}
                      </span>
                      <span className="flex flex-wrap justify-end gap-1">
                        {values.map((value) => (
                          <Badge
                            key={value}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {value}
                          </Badge>
                        ))}
                      </span>
                    </div>
                  ))}
                  <p className="pt-1 text-xs text-muted-foreground">
                    All of the above must match. Within a row, any one value is
                    enough.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Charges
              </p>
              <div className="space-y-1">
                <ParamRows rule={rule} />
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default RuleDetailSheet;
