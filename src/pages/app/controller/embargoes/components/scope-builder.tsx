import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';

import { useScopePreview } from '@/api/terminal';
import { useCommodityList } from '@/api/commercial';
import { useWagonTypeList } from '@/api/asset';
import { useTerminalList } from '@/api/terminal';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { EmbargoScope } from '@/types/master-data.types';

interface ScopeBuilderProps {
  scope: EmbargoScope;
  onChange: (scope: EmbargoScope) => void;
}

/** Toggles one value in one dimension, deleting the key when it empties. */
const toggle = (
  scope: EmbargoScope,
  key:
    | 'commodityCodes'
    | 'wagonTypeCodes'
    | 'terminalIds'
    | 'stations'
    | 'divisions',
  value: string
): EmbargoScope => {
  const current = scope[key] ?? [];
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];

  const updated = { ...scope };
  // An empty array and an absent key mean different things — absent is "no
  // restriction on this dimension", empty would be a restriction matching
  // nothing. Removing the key is the only correct way to clear a dimension.
  if (next.length === 0) delete updated[key];
  else updated[key] = next;
  return updated;
};

const Dimension = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2 rounded-lg border border-border/60 p-3">
    <div>
      <p className="text-xs font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
    {children}
  </div>
);

/**
 * The scope builder, and the sentence it produces.
 *
 * Two rules govern every dimension below, and the empty state of each is the
 * one people get wrong: **leaving a dimension untouched means "no restriction
 * on it"**, not "restrict it to nothing". So an embargo with only a commodity
 * ticked blocks that commodity in every wagon type, through every station.
 *
 * The preview sentence is asked of the server rather than assembled here. That
 * is deliberate: the same module that writes the sentence is the one Phase 7's
 * solver will match with, so a preview cannot drift from the thing it describes
 * — and a wrong scope silently makes the solver infeasible, which is a failure
 * with no error message attached to it.
 */
const ScopeBuilder = ({ scope, onChange }: ScopeBuilderProps) => {
  const { commodities } = useCommodityList({ limit: 100 });
  const { wagonTypes } = useWagonTypeList({ limit: 100 });
  const { terminals } = useTerminalList({ limit: 100 });

  const stationsText = (scope.stations ?? []).join(', ');
  const divisionsText = (scope.divisions ?? []).join(', ');

  const setCsv = (key: 'stations' | 'divisions', text: string): void => {
    const values = text
      .split(',')
      .map((entry) => entry.trim().toUpperCase())
      .filter(Boolean);
    const updated = { ...scope };
    if (values.length === 0) delete updated[key];
    else
      updated[key] =
        key === 'divisions'
          ? values.map(
              (value) => value.charAt(0) + value.slice(1).toLowerCase()
            )
          : values;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Dimension
          title="Commodities"
          hint="Leave empty to block every commodity."
        >
          <div className="flex flex-wrap gap-1.5">
            {(commodities ?? []).map((commodity) => (
              <label
                key={commodity.code}
                className="flex items-center gap-1.5 rounded-md border border-border/60 px-2 py-1.5 text-xs"
              >
                <Checkbox
                  checked={(scope.commodityCodes ?? []).includes(
                    commodity.code
                  )}
                  onCheckedChange={() =>
                    onChange(toggle(scope, 'commodityCodes', commodity.code))
                  }
                />
                {commodity.code}
              </label>
            ))}
          </div>
        </Dimension>

        <Dimension
          title="Wagon types"
          hint="Leave empty to block every wagon type."
        >
          <div className="flex flex-wrap gap-1.5">
            {(wagonTypes ?? []).map((type) => (
              <label
                key={type.code}
                className="flex items-center gap-1.5 rounded-md border border-border/60 px-2 py-1.5 text-xs"
              >
                <Checkbox
                  checked={(scope.wagonTypeCodes ?? []).includes(type.code)}
                  onCheckedChange={() =>
                    onChange(toggle(scope, 'wagonTypeCodes', type.code))
                  }
                />
                {type.code}
              </label>
            ))}
          </div>
        </Dimension>

        <Dimension
          title="Stations"
          hint="Comma-separated codes. Empty means every station."
        >
          <Input
            value={stationsText}
            onChange={(event) => setCsv('stations', event.target.value)}
            placeholder="KWV, SUR"
            className="h-9 uppercase"
          />
        </Dimension>

        <Dimension
          title="Divisions"
          hint="Comma-separated. Empty means every division."
        >
          <Input
            value={divisionsText}
            onChange={(event) => setCsv('divisions', event.target.value)}
            placeholder="Solapur"
            className="h-9"
          />
        </Dimension>

        <Dimension
          title="Terminals"
          hint="Leave empty to block at every terminal."
        >
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {(terminals ?? []).map((terminal) => (
              <label
                key={terminal.id}
                className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1.5 text-xs"
              >
                <Checkbox
                  checked={(scope.terminalIds ?? []).includes(terminal.id)}
                  onCheckedChange={() =>
                    onChange(toggle(scope, 'terminalIds', terminal.id))
                  }
                />
                {terminal.code}
              </label>
            ))}
          </div>
        </Dimension>
      </div>
    </div>
  );
};

/**
 * The sentence, on its own so the dialog can pin it **outside** the scrolling
 * body.
 *
 * Inside the scroll area it sat below the fold — which is the one place it
 * cannot be. It is the whole safeguard: a wrong scope makes Phase 7's solver
 * quietly infeasible, and this line is where a person catches that before
 * saving. Something you have to scroll to find is something you save without
 * reading.
 */
export const ScopePreview = ({ scope }: { scope: EmbargoScope }) => {
  const { summary, isLoading } = useScopePreview(scope);
  const restrictsNothing = Object.keys(scope).length === 1;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start gap-2">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          size={16}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-primary"
        />
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            What this embargo means
          </p>
          <p className="text-sm font-medium">
            {isLoading ? 'Reading the scope…' : summary}
          </p>
          {restrictsNothing && (
            <Badge variant="destructive" className="text-[10px]">
              No dimension restricted — this stops everything
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeBuilder;
