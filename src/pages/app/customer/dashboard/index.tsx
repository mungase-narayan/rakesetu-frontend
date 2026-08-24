import {
  ClipboardIcon,
  Coins01Icon,
  MapsIcon,
  Message01Icon,
  Timer02Icon,
  TruckDeliveryIcon,
} from '@hugeicons/core-free-icons';

import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';

/** The freight customer's workspace: demand in, consignments out, charges due. */
const CustomerDashboard = () => (
  <DashboardShell
    role="freight_customer"
    title="Consignment overview"
    description="Your indents, the rakes carrying them, and what they will cost — with the reasoning attached."
    tiles={[
      { label: 'Open indents', icon: ClipboardIcon, pendingPhase: 6 },
      { label: 'In transit', icon: TruckDeliveryIcon, pendingPhase: 6 },
      { label: 'Arriving this week', icon: Timer02Icon, pendingPhase: 8 },
      { label: 'Outstanding charges', icon: Coins01Icon, pendingPhase: 9 },
    ]}
  >
    <PendingPanel
      items={[
        {
          icon: ClipboardIcon,
          title: 'Place an indent',
          body: 'Raise demand for a commodity, a quantity and a date, and watch the controller act on it.',
          phase: 6,
        },
        {
          icon: MapsIcon,
          title: 'Live tracking',
          body: 'Where the rake is now, and an ETA band with the confidence attached rather than a false point estimate.',
          phase: 5,
        },
        {
          icon: Coins01Icon,
          title: 'Charge explainer',
          body: 'Every demurrage rupee traced to the clock that ran and the circular that set the rate.',
          phase: 9,
        },
        {
          icon: Message01Icon,
          title: 'Freight copilot',
          body: 'Rate and rule answers grounded in the circular corpus, each with its citation.',
          phase: 12,
        },
      ]}
    />
  </DashboardShell>
);

export default CustomerDashboard;
