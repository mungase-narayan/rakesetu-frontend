import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, RefreshIcon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { useNextEvents } from '@/api/terminal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared';
import { formatIst } from '@/lib/ist';
import { ATTRIBUTION_LABELS, EXCEPTION_REASONS } from '@/constants';
import type { RakeEventType } from '@/types/rake-event.types';

import TerminalPicker from '../components/terminal-picker';
import useSelectedTerminal from '../components/use-selected-terminal';
import OutboxBanner from '../log/components/outbox-banner';
import RakeLogCard from '../log/components/rake-log-card';

/** What may be raised, and what may clear each of them. */
const RAISE: RakeEventType[] = ['DETAINED', 'MARKED_SICK', 'HELD_FOR_ORDER'];
const CLEAR: RakeEventType[] = [
  'DETENTION_CLEARED',
  'SICK_CLEARED',
  'HOLD_RELEASED',
  'DIVERSION_CLEARED',
];

/**
 * Exception reporting — why a rake is not moving, in a vocabulary that survives.
 *
 * **The reason codes are the point of this screen.** Phase 10 adjudicates
 * waiver claims by matching them: a claim for a rain stoppage can only be
 * weighed against a rule about rain stoppages if the event said
 * `rain_stoppage`. So the list is closed, it is the same constant the API
 * validates against, and free text goes in a note beside the code rather than
 * instead of it. An ad-hoc list here would be a pile of unmappable claims five
 * phases from now.
 *
 * The attribution beside each code — railway, customer, force majeure — is
 * shown rather than hidden until Phase 10, because it is what the supervisor's
 * choice actually decides, and a choice whose consequence is invisible is a
 * choice made carelessly.
 */
const TerminalExceptionsPage = () => {
  const {
    options,
    terminalId,
    choose,
    isLoading: optionsLoading,
  } = useSelectedTerminal();

  const { terminal, rakes, asOf, isLoading, isFetching, isError } =
    useNextEvents(terminalId ?? '');

  const held = rakes?.filter((entry) => entry.clearing.length > 0) ?? [];
  const clear =
    rakes?.filter(
      (entry) =>
        entry.clearing.length === 0 &&
        entry.legal.some((event) => RAISE.includes(event))
    ) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exceptions"
        description="Raise and clear the reasons a rake is not moving. The reason code is what a waiver claim is later weighed against."
        actions={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              strokeWidth={2}
              className={cn(isFetching && 'animate-spin')}
            />
            {asOf ? (
              <span className="tabular-nums">
                Last updated {formatIst(asOf)}
              </span>
            ) : (
              <span>Waiting for the first update…</span>
            )}
          </div>
        }
      />

      <TerminalPicker
        options={options}
        value={terminalId}
        onChange={choose}
        isLoading={optionsLoading}
      />

      <OutboxBanner />

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            The list of rakes could not be reached. Anything you record now will
            be saved on this device and sent when the connection returns.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && !rakes ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : terminal ? (
        <>
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold">
                Currently held
                <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
                  {held.length}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                A rake in an exception returns to whatever it was doing before —
                which is why only the matching clearing event is offered.
              </p>
            </div>

            {held.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                Nothing is held at this terminal.
              </p>
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {held.map((entry) => (
                  <RakeLogCard
                    key={entry.rakeId}
                    entry={entry}
                    terminalId={terminal.id}
                    stationCode={terminal.stationCode}
                    only={CLEAR}
                  />
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold">
                Raise an exception
                <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
                  {clear.length}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                An exception can interrupt any operational state — but not
                another exception, because a rake has one state to return to.
              </p>
            </div>

            {clear.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                No rakes here are in a state an exception can interrupt.
              </p>
            ) : (
              <ul className="grid gap-3 lg:grid-cols-2">
                {clear.map((entry) => (
                  <RakeLogCard
                    key={entry.rakeId}
                    entry={entry}
                    terminalId={terminal.id}
                    stationCode={terminal.stationCode}
                    only={RAISE}
                  />
                ))}
              </ul>
            )}
          </section>

          <ReasonReference />
        </>
      ) : null}
    </div>
  );
};

/**
 * The six codes, spelled out.
 *
 * On the page rather than buried in a dropdown because the choice has a
 * consequence a supervisor should be able to read before making it: these are
 * the categories a waiver is granted or refused under, and "customer delay" and
 * "railway delay" are the same number of hours and opposite outcomes.
 */
const ReasonReference = () => (
  <section className="space-y-3">
    <div>
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <HugeiconsIcon icon={Alert02Icon} size={15} strokeWidth={2} />
        The six reason codes
      </h2>
      <p className="text-xs text-muted-foreground">
        These exact codes are what a waiver claim is matched against. Anything
        the list does not cover goes in the note.
      </p>
    </div>

    <ul className="grid gap-2 sm:grid-cols-2">
      {EXCEPTION_REASONS.map((reason) => (
        <li
          key={reason.code}
          className="rounded-lg border border-border/60 px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{reason.label}</p>
            <Badge variant="outline">
              {ATTRIBUTION_LABELS[reason.attribution]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {reason.description}
          </p>
          <code className="mt-1 block font-mono text-[11px] text-muted-foreground">
            {reason.code}
          </code>
        </li>
      ))}
    </ul>
  </section>
);

export default TerminalExceptionsPage;
