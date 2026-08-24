import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  TruckDeliveryIcon,
  ChartLineData01Icon,
  Invoice01Icon,
  Route01Icon,
  Message01Icon,
  Building03Icon,
} from '@hugeicons/core-free-icons';

import { useAuth } from '@/hooks';
import { useMe } from '@/api/auth';
import { syncProfile } from '@/store';
import { USER_ROLE_LABELS } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Placeholder workspace.
 *
 * Its job right now is to prove the full auth loop end to end: the persisted
 * session rehydrates, GET /users/me re-validates it against the server, and
 * the identity the backend returns is what renders. The freight modules
 * listed below replace this in later passes.
 */
const UPCOMING = [
  {
    icon: TruckDeliveryIcon,
    title: 'Indents & allotment',
    body: 'Place freight indents and watch the solver match them to empty rakes.',
  },
  {
    icon: Route01Icon,
    title: 'Live rake tracking',
    body: 'Network map with rake positions and an ETA band you can trust.',
  },
  {
    icon: ChartLineData01Icon,
    title: 'Turnaround analytics',
    body: 'Every lost hour attributed to loading, transit, yard or empty return.',
  },
  {
    icon: Invoice01Icon,
    title: 'Charges & waivers',
    body: 'Demurrage with a full calculation trace and the circular behind it.',
  },
  {
    icon: Message01Icon,
    title: 'Freight copilot',
    body: 'Rate and rule answers grounded in the circular corpus, with citations.',
  },
];

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user, organization, roles } = useAuth();
  const { profile } = useMe();

  // Refresh the persisted profile whenever the server answers, so a role
  // change or a rename shows up without forcing a re-login.
  useEffect(() => {
    if (profile) dispatch(syncProfile(profile));
  }, [profile, dispatch]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {roles.map((role) => (
            <Badge key={role.userRoleId} variant="secondary">
              {USER_ROLE_LABELS[role.name]}
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {user?.firstName}
        </h1>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={Building03Icon} size={15} />
          {organization?.name}
          {organization?.code && (
            <span className="text-muted-foreground/60">
              ({organization.code})
            </span>
          )}
        </p>
      </header>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="text-base">
            Authentication is wired end to end
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>
            You are signed in as{' '}
            <span className="font-medium text-foreground">{user?.email}</span>.
            This session survives a page reload and re-validates itself against{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              GET /users/me
            </code>{' '}
            on every visit.
          </p>
          <p>The freight modules below are designed and land next.</p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Coming next
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UPCOMING.map((item) => (
            <Card
              key={item.title}
              className="transition-colors hover:bg-muted/40"
            >
              <CardHeader className="space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
