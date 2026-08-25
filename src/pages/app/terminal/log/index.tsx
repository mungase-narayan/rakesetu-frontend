import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon } from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { useNextEvents } from '@/api/terminal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared';
import { formatIst } from '@/lib/ist';

import TerminalPicker from '../components/terminal-picker';
import useSelectedTerminal from '../components/use-selected-terminal';
import OutboxBanner from './components/outbox-banner';
import RakeLogCard from './components/rake-log-card';

/**
 * Quick entry — the most-used screen in the product for this persona.
 *
 * A supervisor is the human `EventSource`. Everything downstream — the map, the
 * ETA engine's observed weights, the turnaround attribution, the demurrage bill
 * — is a fold over events, and on the ground most of those events are typed
 * here, on a phone, next to a siding, often with no signal.
 *
 * So the screen is built for that: one rake per card, the next legal event as a
 * full-width primary button, times defaulting to now and capped at now,
 * event-specific fields only, and a submission that survives the network going
 * away. What it deliberately does **not** do is guess — no optimistic update,
 * no illegal option offered, no reason code outside the six Phase 10 can map.
 */
const TerminalLogPage = () => {
  const {
    options,
    terminalId,
    choose,
    isLoading: optionsLoading,
  } = useSelectedTerminal();

  const { terminal, rakes, asOf, isLoading, isFetching, isError } =
    useNextEvents(terminalId ?? '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log an event"
        description="Placement, release and everything between. These events are the source of every downstream number, so they are logged once and never edited."
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
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : rakes && rakes.length > 0 && terminal ? (
        <ul className="grid gap-3 lg:grid-cols-2">
          {rakes.map((entry) => (
            <RakeLogCard
              key={entry.rakeId}
              entry={entry}
              terminalId={terminal.id}
              stationCode={terminal.stationCode}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
          No rakes are standing at this terminal or its station right now.
        </p>
      )}
    </div>
  );
};

export default TerminalLogPage;
