import {
  Coins01Icon,
  DiscountTag01Icon,
  File01Icon,
  Invoice01Icon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons';

import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';

/** The commercial officer's workspace: what is owed, waived and disputed. */
const CommercialDashboard = () => (
  <DashboardShell
    role="commercial_officer"
    title="Commercial desk"
    description="Charge lines, waivers and invoices — every figure computed by versioned rules, never by a model."
    tiles={[
      { label: 'Charge lines to review', icon: Coins01Icon, pendingPhase: 9 },
      { label: 'Open waivers', icon: DiscountTag01Icon, pendingPhase: 10 },
      { label: 'Invoices due', icon: Invoice01Icon, pendingPhase: 10 },
      { label: 'Disputed value', icon: File01Icon, pendingPhase: 10 },
    ]}
  >
    <PendingPanel
      items={[
        {
          icon: Coins01Icon,
          title: 'Charge explainer',
          body: 'The demurrage calculation as a trace: which clock ran, which free time applied, which circular set the rate.',
          phase: 9,
        },
        {
          icon: DiscountTag01Icon,
          title: 'Waiver workflow',
          body: 'A waiver is a decision with a reason and an approver, recorded as one — not a number quietly edited.',
          phase: 10,
        },
        {
          icon: SecurityCheckIcon,
          title: 'Extraction review',
          body: 'Low-confidence extractions routed to a person. The model proposes; this desk decides.',
          phase: 11,
        },
      ]}
    />
  </DashboardShell>
);

export default CommercialDashboard;
