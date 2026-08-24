import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface PendingItem {
  icon: IconSvgElement;
  title: string;
  body: string;
  phase: number;
}

/**
 * "What lands here next", per workspace.
 *
 * Each card names the phase that builds it, for the same reason `StatTile`
 * does: during a thirteen-phase build the roadmap has to be legible from inside
 * the product, and a screen that quietly omits what it cannot do yet reads as a
 * screen that is finished.
 */
const PendingPanel = ({ items }: { items: PendingItem[] }) => {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Arriving in this workspace
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.title}
            className="border-dashed transition-colors hover:bg-muted/30"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
                </div>
                <span className="rounded-full border border-border/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Phase {item.phase}
                </span>
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default PendingPanel;
