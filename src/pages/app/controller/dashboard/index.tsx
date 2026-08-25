import {
  Alert02Icon,
  ClipboardIcon,
  Route01Icon,
  Timer02Icon,
  TruckDeliveryIcon,
  MapsIcon,
} from '@hugeicons/core-free-icons';

import { useAvailableRakeCount } from '@/api/rake-event';
import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';

/** The freight controller's workspace: supply, demand, and the match between. */
const ControllerDashboard = () => {
  // The first tile on any dashboard to carry a real number. Everything else
  // still names the phase that will fill it — a hardcoded figure dressed as
  // data is the one thing `StatTile` exists to prevent.
  const { count, isLoading } = useAvailableRakeCount();

  return (
    <DashboardShell
      role="freight_controller"
      title="Freight control"
      description="Empty rakes on one side, open indents on the other, and the allotment that reconciles them."
      tiles={[
        {
          label: 'Empty rakes available',
          icon: TruckDeliveryIcon,
          value: count ?? null,
          isLoading,
          hint: 'projected from the event log',
        },
        { label: 'Open indents', icon: ClipboardIcon, pendingPhase: 6 },
        { label: 'Unallotted > 24 h', icon: Timer02Icon, pendingPhase: 7 },
        { label: 'Detention flags', icon: Alert02Icon, pendingPhase: 8 },
      ]}
    >
      <PendingPanel
        items={[
          {
            icon: MapsIcon,
            title: 'Live network stream',
            body: 'The map polls every five seconds today. Phase 5 replaces that with a stream, adds ETAs and colours the network by congestion.',
            phase: 5,
          },
          {
            icon: Route01Icon,
            title: 'Allotment board',
            body: 'The solver proposes, you accept or override — and the override is audited as its own act.',
            phase: 7,
          },
          {
            icon: Alert02Icon,
            title: 'Exception queue',
            body: 'Refused events and detention outliers, triaged. The anomalies are already being captured.',
            phase: 8,
          },
        ]}
      />
    </DashboardShell>
  );
};

export default ControllerDashboard;
