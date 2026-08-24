import { Link } from 'react-router';
import {
  DatabaseIcon,
  SecurityCheckIcon,
  Settings02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';

import { useUserList } from '@/api/user-admin';
import { useAuditList } from '@/api/audit';
import { ROUTES } from '@/routes/route-paths';
import { Button } from '@/components/ui/button';

import DashboardShell from '../../dashboard-shell';
import PendingPanel from '../../pending-panel';

/** Midnight IST today, as the UTC instant the API filters on. */
const istTodayStart = (): string => {
  const nowIst = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const day = nowIst.toISOString().slice(0, 10);
  return new Date(`${day}T00:00:00+05:30`).toISOString();
};

/**
 * The administrator's workspace — and the only dashboard with live tiles.
 *
 * Both numbers come from endpoints this phase ships, and both read
 * `pagination.total` off a one-row page rather than pulling the whole set to
 * count it. The other two tiles name their phase like every other dashboard,
 * because a plausible-looking zero would be indistinguishable from a real one.
 */
const AdminDashboard = () => {
  const { pagination: users, isLoading: usersLoading } = useUserList({
    page: 1,
    limit: 1,
  });

  const { pagination: audit, isLoading: auditLoading } = useAuditList({
    page: 1,
    limit: 1,
    from: istTodayStart(),
  });

  return (
    <DashboardShell
      role="admin"
      title="Administration"
      description="Who can sign in, what they may do, and a record of everything they have done."
      tiles={[
        {
          label: 'Users in this org',
          icon: UserGroupIcon,
          value: users?.total ?? null,
          isLoading: usersLoading,
          hint: 'Every account, whatever its status',
        },
        {
          label: 'Audit events today',
          icon: SecurityCheckIcon,
          value: audit?.total ?? null,
          isLoading: auditLoading,
          hint: 'Since midnight IST',
        },
        { label: 'Master-data health', icon: DatabaseIcon, pendingPhase: 3 },
        { label: 'Failed AI jobs', icon: Settings02Icon, pendingPhase: 11 },
      ]}
    >
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link to={ROUTES.admin.users}>Manage users & roles</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={ROUTES.admin.audit}>Open the audit log</Link>
        </Button>
      </div>

      <PendingPanel
        items={[
          {
            icon: DatabaseIcon,
            title: 'Master data',
            body: 'Stations, sections, wagon types, commodities and the charge rules — thirteen tables the rest of the product reads.',
            phase: 3,
          },
          {
            icon: Settings02Icon,
            title: 'AI job monitor',
            body: 'Extraction and explanation jobs, their dead letters, and what each one cost.',
            phase: 11,
          },
        ]}
      />
    </DashboardShell>
  );
};

export default AdminDashboard;
