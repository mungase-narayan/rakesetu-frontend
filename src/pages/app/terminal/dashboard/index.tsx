import {
  Analytics01Icon,
  CalendarCheckIn01Icon,
  Timer02Icon,
  TruckDeliveryIcon,
} from '@hugeicons/core-free-icons';

import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';

/** The terminal supervisor's workspace: what is on the ground, right now. */
const TerminalDashboard = () => (
  <DashboardShell
    role="terminal_supervisor"
    title="Terminal operations"
    description="Placements, releases and the hours between them — the events every downstream number is computed from."
    tiles={[
      {
        label: 'Placements today',
        icon: CalendarCheckIn01Icon,
        pendingPhase: 5,
      },
      { label: 'Rakes on hand', icon: TruckDeliveryIcon, pendingPhase: 5 },
      { label: 'Queue depth', icon: Analytics01Icon, pendingPhase: 8 },
      { label: 'Detention hours', icon: Timer02Icon, pendingPhase: 8 },
    ]}
  >
    <PendingPanel
      items={[
        {
          icon: Timer02Icon,
          title: 'Event logging',
          body: 'Placement and release stamped at the terminal — the source of the demurrage clock, so it is logged once and never edited.',
          phase: 4,
        },
        {
          icon: CalendarCheckIn01Icon,
          title: 'Placement schedule',
          body: 'What is arriving, what is berthed and what is waiting for a line.',
          phase: 5,
        },
        {
          icon: Analytics01Icon,
          title: 'Congestion twin',
          body: 'Where this terminal sits against the zone, and which hours are being lost to the queue.',
          phase: 8,
        },
      ]}
    />
  </DashboardShell>
);

export default TerminalDashboard;
