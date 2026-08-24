import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';

import { cn, initialsOf } from '@/lib/utils';
import { USER_ROLE_LABELS } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CopyButton, IstTime } from '@/components/shared';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { AuditEntry } from '@/types/audit.types';

import { actionMeta, KIND_TONE } from '../constants';
import JsonDiff from './json-diff';
import { changedFieldCount } from '../diff';

interface AuditDetailSheetProps {
  entry: AuditEntry | null;
  /** Resolved display names by user id, so the actor is a person, not a UUID. */
  actorNames?: Map<string, string>;
  onOpenChange: (open: boolean) => void;
  onFilterByCorrelation: (correlationId: string) => void;
}

const Section = ({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) => (
  <section className="space-y-2.5">
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {aside}
    </div>
    {children}
  </section>
);

/** A label above its value — the drawer is narrow, so nothing sits side by side. */
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="text-sm break-words">{children}</div>
  </div>
);

/** An opaque identifier: monospace, wrapping, and copyable. */
const Identifier = ({ value }: { value: string }) => (
  <span className="flex items-start gap-1">
    <code className="min-w-0 font-mono text-[12px] leading-5 break-all text-foreground">
      {value}
    </code>
    <CopyButton value={value} label="Copy id" className="-mt-0.5" />
  </span>
);

/**
 * One audit row in full: what happened, who did it, to what, and from where.
 *
 * The layout follows that order because it is the order the question gets
 * asked. The raw verb and every identifier stay visible and copyable — a trail
 * you cannot quote back to the API is a trail you cannot follow — but they sit
 * under plain-English headings rather than being the headings.
 */
const AuditDetailSheet = ({
  entry,
  actorNames,
  onOpenChange,
  onFilterByCorrelation,
}: AuditDetailSheetProps) => (
  <Sheet open={Boolean(entry)} onOpenChange={onOpenChange}>
    <SheetContent
      side="right"
      className="w-full gap-0 p-0 sm:max-w-md md:max-w-lg"
      /**
       * Focus the panel, not the first control inside it.
       *
       * Radix's default sends focus to the first focusable descendant, which
       * here is a `CopyButton` — and a `TooltipTrigger` opens its tooltip on
       * focus. Escape is then consumed by the tooltip, so the first press does
       * nothing visible and the sheet only closes on the second. Landing focus
       * on the panel also means a screen reader hears the heading rather than
       * "copy, button".
       */
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        (event.currentTarget as HTMLElement | null)?.focus();
      }}
    >
      {entry &&
        (() => {
          const meta = actionMeta(entry.action);
          const touched = changedFieldCount(entry.before, entry.after);
          const actorName = entry.actorId
            ? actorNames?.get(entry.actorId)
            : undefined;

          return (
            <>
              <SheetHeader className="gap-2 border-b border-border/60 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn('font-medium', KIND_TONE[meta.kind])}
                  >
                    {meta.title}
                  </Badge>
                  <code className="font-mono text-[11px] text-muted-foreground">
                    {entry.action}
                  </code>
                </div>
                <SheetTitle className="sr-only">
                  {meta.title} — {entry.action}
                </SheetTitle>
                <SheetDescription asChild>
                  <div className="text-sm">
                    <IstTime value={entry.at} />
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <Section title="Who">
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-0.5 size-9 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {actorName ? initialsOf(actorName) : 'SYS'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {actorName ??
                            (entry.actorId ? 'Unknown user' : 'System')}
                        </p>
                        {entry.actorRole && (
                          <Badge variant="secondary" className="text-[11px]">
                            {USER_ROLE_LABELS[entry.actorRole]}
                          </Badge>
                        )}
                      </div>

                      {entry.actorId ? (
                        <Identifier value={entry.actorId} />
                      ) : (
                        // A queue consumer, the simulator, a cron — no person.
                        <p className="text-xs text-muted-foreground">
                          No signed-in actor — a background job.
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        from{' '}
                        <span className="font-mono">
                          {entry.ip ?? 'unknown'}
                        </span>
                      </p>
                    </div>
                  </div>
                </Section>

                <Separator />

                <Section title="What">
                  <div className="space-y-3">
                    <Field label="Entity type">
                      <code className="font-mono text-[12px]">
                        {entry.entityType}
                      </code>
                    </Field>
                    <Field label="Entity id">
                      <Identifier value={entry.entityId} />
                    </Field>
                  </div>
                </Section>

                <Separator />

                <Section
                  title="Changes"
                  aside={
                    <span className="text-[11px] text-muted-foreground">
                      {touched === 0
                        ? 'no fields'
                        : `${touched} field${touched === 1 ? '' : 's'}`}
                    </span>
                  }
                >
                  <JsonDiff before={entry.before} after={entry.after} />
                </Section>

                <Separator />

                <Section title="Request">
                  {entry.correlationId ? (
                    <div className="space-y-2">
                      <Identifier value={entry.correlationId} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() => {
                          onFilterByCorrelation(entry.correlationId as string);
                          onOpenChange(false);
                        }}
                      >
                        <HugeiconsIcon
                          icon={FilterIcon}
                          size={14}
                          strokeWidth={2}
                        />
                        Show this request&apos;s whole trail
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No correlation id — written outside a request.
                    </p>
                  )}
                </Section>
              </div>
            </>
          );
        })()}
    </SheetContent>
  </Sheet>
);

export default AuditDetailSheet;
