import {
  Analytics01Icon,
  ChartLineData01Icon,
  Location01Icon,
  Message01Icon,
  Timer02Icon,
} from '@hugeicons/core-free-icons';

import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';

/** The zonal manager's workspace: read-only, and about where the hours go. */
const ZonalDashboard = () => (
  <DashboardShell
    role="zonal_manager"
    title="Zonal performance"
    description="Turnaround, empty running and terminal congestion across the zone. Read-only by design — this desk measures, it does not operate."
    tiles={[
      { label: 'Mean TAT', icon: Timer02Icon, pendingPhase: 8 },
      { label: 'Empty km saved', icon: ChartLineData01Icon, pendingPhase: 7 },
      { label: 'Terminals over p90', icon: Location01Icon, pendingPhase: 8 },
      { label: 'GenAI spend', icon: Message01Icon, pendingPhase: 13 },
    ]}
  >
    <PendingPanel
      items={[
        {
          icon: Timer02Icon,
          title: 'Turnaround attribution',
          body: 'Every lost hour assigned to loading, transit, yard or empty return — so the argument is about the fix, not the number.',
          phase: 8,
        },
        {
          icon: ChartLineData01Icon,
          title: 'Empty-km savings',
          body: 'What the solver saved against the naive allotment, per week and per section.',
          phase: 7,
        },
        {
          icon: Analytics01Icon,
          title: 'Terminal league',
          body: 'Which terminals sit above the zone p90, and for how long they have.',
          phase: 8,
        },
      ]}
    />
  </DashboardShell>
);

export default ZonalDashboard;
