import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon, Train01Icon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';

/**
 * A static mock of the allotment board — the screen the product is really
 * about. Deliberately not interactive: it is a picture of the decision the
 * solver makes, shown next to the hero copy that describes it.
 */
const MATCHES = [
  {
    rake: 'R-4471',
    type: 'BOXNHL x 58',
    at: 'Wardha',
    indent: 'I-8823',
    customer: 'Aditya Cement',
    to: 'Kurduvadi',
    empty: '96 km',
    best: true,
  },
  {
    rake: 'R-3120',
    type: 'BCNA x 42',
    at: 'Nagpur',
    indent: 'I-8817',
    customer: 'Deccan Steel',
    to: 'Pune',
    empty: '214 km',
    best: false,
  },
  {
    rake: 'R-5088',
    type: 'BTPN x 50',
    at: 'Manmad',
    indent: 'I-8831',
    customer: 'Konkan Fuels',
    to: 'Panvel',
    empty: '148 km',
    best: false,
  },
];

const WorkspacePreview = () => {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl shadow-black/5">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <p className="ml-2 text-xs font-medium text-muted-foreground">
            Allotment board — Solapur division
          </p>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Proposed matches
            </p>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              458 empty km saved
            </span>
          </div>

          {MATCHES.map((m) => (
            <div
              key={m.rake}
              className={cn(
                'rounded-xl border p-3 transition-colors',
                m.best
                  ? 'border-primary/30 bg-primary/[0.04]'
                  : 'border-border/70 bg-background'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <HugeiconsIcon icon={Train01Icon} size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.rake}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.type} · empty at {m.at}
                  </p>
                </div>

                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={15}
                  className="shrink-0 text-muted-foreground"
                />

                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-sm font-semibold">{m.indent}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.customer} → {m.to}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2.5">
                <span className="text-[11px] text-muted-foreground">
                  Empty haul {m.empty}
                </span>
                {m.best && (
                  <span className="text-[11px] font-medium text-primary">
                    Beat I-8817 by 214 km — siding congested until 18:40
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePreview;
