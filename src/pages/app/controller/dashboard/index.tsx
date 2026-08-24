import {
  Alert02Icon,
  ClipboardIcon,
  Route01Icon,
  Timer02Icon,
  TruckDeliveryIcon,
  MapsIcon,
} from '@hugeicons/core-free-icons';

import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';

/** The freight controller's workspace: supply, demand, and the match between. */
const ControllerDashboard = () => (
  <DashboardShell
    role="freight_controller"
    title="Freight control"
    description="Empty rakes on one side, open indents on the other, and the allotment that reconciles them."
    tiles={[
      {
        label: 'Empty rakes available',
        icon: TruckDeliveryIcon,
        pendingPhase: 4,
      },
      { label: 'Open indents', icon: ClipboardIcon, pendingPhase: 6 },
      { label: 'Unallotted > 24 h', icon: Timer02Icon, pendingPhase: 7 },
      { label: 'Detention flags', icon: Alert02Icon, pendingPhase: 8 },
    ]}
  >
    <PendingPanel
      items={[
        {
          icon: TruckDeliveryIcon,
          title: 'Digital twin of the fleet',
          body: 'Every rake as an event stream — the position, the state and how it got there.',
          phase: 4,
        },
        {
          icon: MapsIcon,
          title: 'Network view',
          body: 'Rake positions, section state and embargoes on one map.',
          phase: 5,
        },
        {
          icon: Route01Icon,
          title: 'Allotment board',
          body: 'The solver proposes, you accept or override — and the override is audited as its own act.',
          phase: 7,
        },
      ]}
    />
  </DashboardShell>
);

export default ControllerDashboard;
