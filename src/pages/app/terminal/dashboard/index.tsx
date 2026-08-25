import { Link } from 'react-router';
import {
  Analytics01Icon,
  CalendarCheckIn01Icon,
  Timer02Icon,
  TruckDeliveryIcon,
} from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/route-paths';
import { useTerminalBoard } from '@/api/terminal';

import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';
import TerminalPicker from '../components/terminal-picker';
import useSelectedTerminal from '../components/use-selected-terminal';

/**
 * The terminal supervisor's workspace: what is on the ground, right now.
 *
 * **Phase 5 turns three of these tiles into numbers.** They come from
 * `/terminals/:id/board` — the same read the placements screen makes, cached
 * under the same key — rather than from a dashboard-shaped endpoint that would
 * be a second implementation of the same counting. The two that remain pending
 * name Phase 8, which is where the queue model and the attributed detention
 * hours are built; a plausible figure in either would be a number nobody could
 * trace.
 */
const TerminalDashboard = () => {
  const {
    options,
    terminalId,
    choose,
    isLoading: optionsLoading,
  } = useSelectedTerminal();
  const { board, isLoading } = useTerminalBoard(terminalId ?? '');

  return (
    <DashboardShell
      role="terminal_supervisor"
      title="Terminal operations"
      description="Placements, releases and the hours between them — the events every downstream number is computed from."
      tiles={[
        {
          label: 'Released today',
          icon: CalendarCheckIn01Icon,
          value: board?.totals.releasedToday ?? null,
          hint: board
            ? `${board.totals.detentionHoursToday} h on the line in total`
            : undefined,
          isLoading,
        },
        {
          label: 'Rakes on hand',
          icon: TruckDeliveryIcon,
          value: board
            ? `${board.occupancy.onHand} / ${board.occupancy.placementLines}`
            : null,
          hint: 'Standing over placement lines',
          isLoading,
        },
        {
          label: 'Past free time',
          icon: Timer02Icon,
          value: board?.totals.overFreeTime ?? null,
          hint: 'Detention accruing against these placements',
          isLoading,
        },
        { label: 'Queue depth', icon: Analytics01Icon, pendingPhase: 8 },
      ]}
    >
      <div className="flex flex-wrap items-center gap-3">
        <TerminalPicker
          options={options}
          value={terminalId}
          onChange={choose}
          isLoading={optionsLoading}
        />
        <Button asChild variant="outline">
          <Link to={ROUTES.terminal.placements}>Open the board</Link>
        </Button>
        <Button asChild>
          <Link to={ROUTES.terminal.log}>Log an event</Link>
        </Button>
      </div>

      <PendingPanel
        items={[
          {
            icon: Analytics01Icon,
            title: 'Congestion twin',
            body: 'Where this terminal sits against the zone, and which hours are being lost to the queue.',
            phase: 8,
          },
          {
            icon: Timer02Icon,
            title: 'Attributed detention',
            body: 'Which side of the fence each held hour falls on, and what it will cost — the charge engine and its trace.',
            phase: 9,
          },
        ]}
      />
    </DashboardShell>
  );
};

export default TerminalDashboard;
