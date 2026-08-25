import { HugeiconsIcon } from '@hugeicons/react';
import {
  Alert02Icon,
  CalendarCheckIn01Icon,
  RefreshIcon,
  Timer02Icon,
  TruckDeliveryIcon,
} from '@hugeicons/core-free-icons';

import { cn } from '@/lib/utils';
import { useTerminalBoard } from '@/api/terminal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, StatTile } from '@/components/shared';
import { formatIst } from '@/lib/ist';

import TerminalPicker from '../components/terminal-picker';
import useSelectedTerminal from '../components/use-selected-terminal';
import useTicker from '../components/use-ticker';
import InboundCard from './components/inbound-card';
import OnHandCard from './components/on-hand-card';
import ReleasedCard from './components/released-card';

/**
 * Today's placements — the terminal supervisor's shift, on one screen.
 *
 * **Grouped, not tabulated.** A table sorted by rake code answers "where is
 * R-4412"; this persona's question is "what needs doing next", and the answer
 * is a shape: what is coming, what is standing on my lines, what has gone. The
 * three groups are that shape, and the middle one carries the clock.
 *
 * Everything on this page is a fold over `rake_events`. The free time on each
 * on-hand row is resolved by `lookupRule` **as of that rake's placement** — not
 * as of now — which is the whole reason Phase 3 moved `charge_rules` earlier
 * than a naive reading would have put it. No charge is computed here; the tint
 * is an operational warning and Phase 9 owns the money.
 */
const TerminalPlacementsPage = () => {
  const {
    options,
    terminalId,
    choose,
    isLoading: optionsLoading,
  } = useSelectedTerminal();
  const { board, isLoading, isFetching, isError } = useTerminalBoard(
    terminalId ?? ''
  );
  const now = useTicker();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's placements"
        description="What is arriving, what is standing on the line, and what left today — with the free time that was in force when each rake was placed."
        actions={
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              strokeWidth={2}
              className={cn(isFetching && 'animate-spin')}
            />
            {board ? (
              <span className="tabular-nums">
                Last updated {formatIst(board.asOf)}
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

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            The board could not be reached. Anything shown below is the last
            snapshot that arrived, not the current state.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && !board ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : board ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="On hand"
              value={`${board.occupancy.onHand} / ${board.occupancy.placementLines}`}
              icon={TruckDeliveryIcon}
              hint={
                board.occupancy.onHand > board.occupancy.placementLines
                  ? 'More rakes than lines — some are waiting in the yard'
                  : 'Rakes standing over placement lines'
              }
            />
            <StatTile
              label="Inbound (24 h)"
              value={board.totals.inbound}
              icon={CalendarCheckIn01Icon}
              hint="Estimated arrivals, including any already overdue"
            />
            <StatTile
              label="Past free time"
              value={board.totals.overFreeTime}
              icon={Alert02Icon}
              hint="Detention is accruing against these placements"
            />
            <StatTile
              label="Released today"
              value={board.totals.releasedToday}
              icon={Timer02Icon}
              hint={`${board.totals.detentionHoursToday} h on the line in total`}
            />
          </div>

          <Section
            title="On hand"
            caption="Standing on this terminal's lines right now. The clock runs from the placement."
            count={board.onHand.length}
            empty="Nothing is standing on a line."
          >
            <ul className="grid gap-3 lg:grid-cols-2">
              {board.onHand.map((row) => (
                <OnHandCard key={row.rakeId} row={row} now={now} />
              ))}
            </ul>
          </Section>

          <Section
            title="Inbound"
            caption="Estimated to arrive within 24 hours, from the deterministic ETA engine."
            count={board.inbound.length}
            empty="Nothing is estimated to arrive in the next 24 hours."
          >
            <ul className="grid gap-3 lg:grid-cols-2">
              {board.inbound.map((row) => (
                <InboundCard key={row.rakeId} row={row} />
              ))}
            </ul>
          </Section>

          <Section
            title="Released today"
            caption="Placement to release. Not a charge — no free time has been subtracted."
            count={board.releasedToday.length}
            empty="Nothing has been released today."
          >
            <ul className="space-y-2">
              {board.releasedToday.map((row) => (
                <ReleasedCard
                  key={`${row.rakeId}-${row.releasedAt}`}
                  row={row}
                />
              ))}
            </ul>
          </Section>
        </>
      ) : null}
    </div>
  );
};

const Section = ({
  title,
  caption,
  count,
  empty,
  children,
}: {
  title: string;
  caption: string;
  count: number;
  empty: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <div>
      <h2 className="text-sm font-semibold">
        {title}
        <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
          {count}
        </span>
      </h2>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>

    {count === 0 ? (
      <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
        {empty}
      </p>
    ) : (
      children
    )}
  </section>
);

export default TerminalPlacementsPage;
