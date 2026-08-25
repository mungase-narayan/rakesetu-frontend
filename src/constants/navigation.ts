import type { IconSvgElement } from '@hugeicons/react';
import {
  Alert02Icon,
  Analytics01Icon,
  CalendarCheckIn01Icon,
  ChartLineData01Icon,
  ClipboardIcon,
  Coins01Icon,
  DashboardSquare01Icon,
  DatabaseIcon,
  DiscountTag01Icon,
  File01Icon,
  Invoice01Icon,
  Location01Icon,
  MapsIcon,
  Message01Icon,
  Route01Icon,
  SecurityCheckIcon,
  Settings02Icon,
  Timer02Icon,
  TruckDeliveryIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';

import { ROUTES } from '@/routes/route-paths';
import type { Permission, UserRoleType } from '@/types/user.types';

export interface NavItem {
  label: string;
  to: string;
  icon: IconSvgElement;
  /** Hidden entirely when the signed-in user lacks it. */
  permission?: Permission;
  /**
   * The phase that builds this screen. Present means the item renders disabled
   * with a "phase N" chip rather than linking somewhere that 404s.
   *
   * Seeding the tree with these now is deliberate: the information architecture
   * is visible from the first screenshot, a role's sidebar is never a single
   * lonely "Dashboard" link, and each later phase's only navigation edit is
   * deleting one `pendingPhase` and pointing `to` at the route it just built.
   */
  pendingPhase?: number;
  /** Wired by the phase that has a count to show. */
  badge?: 'count' | 'dot';
}

export interface NavSection {
  /** Omitted on the first section — a single group needs no heading. */
  title?: string;
  items: NavItem[];
}

const dashboard = (to: string): NavItem => ({
  label: 'Dashboard',
  to,
  icon: DashboardSquare01Icon,
});

/**
 * The sidebar, as data.
 *
 * Declarative rather than JSX branching for one reason that matters at this
 * scale: with six roles and roughly forty screens coming, a sidebar built from
 * conditionals becomes the file every phase edits and nobody can read. Here a
 * phase appends a row, and the permission filter and the active-route
 * highlighting are already handled.
 */
export const NAVIGATION: Record<UserRoleType, NavSection[]> = {
  freight_customer: [
    {
      items: [
        dashboard(ROUTES.customer.dashboard),
        {
          label: 'My indents',
          to: ROUTES.customer.dashboard,
          icon: ClipboardIcon,
          permission: 'indent:read',
          pendingPhase: 6,
        },
        {
          label: 'Consignments',
          to: ROUTES.customer.dashboard,
          icon: TruckDeliveryIcon,
          permission: 'rake:read',
          pendingPhase: 6,
        },
      ],
    },
    {
      title: 'Tracking',
      items: [
        {
          label: 'Live map',
          to: ROUTES.customer.dashboard,
          icon: MapsIcon,
          permission: 'rake:read',
          /*
            Still pending after Phase 5, and deliberately. The live map exists
            and is now SSE-driven — but `/network/live` and `/network/stream`
            both carry a role guard that excludes a customer, because the
            division's whole freight position is a competitor's information.
            Phase 6 gives this persona a map scoped to *their own* consignments,
            which is a different endpoint rather than a different link.
          */
          pendingPhase: 6,
        },
        {
          label: 'Charges',
          to: ROUTES.customer.dashboard,
          icon: Coins01Icon,
          permission: 'charge:read',
          pendingPhase: 9,
        },
        {
          label: 'Freight copilot',
          to: ROUTES.customer.dashboard,
          icon: Message01Icon,
          permission: 'ai:invoke',
          pendingPhase: 12,
        },
      ],
    },
  ],

  freight_controller: [
    {
      items: [
        dashboard(ROUTES.controller.dashboard),
        {
          label: 'Indent queue',
          to: ROUTES.controller.dashboard,
          icon: ClipboardIcon,
          permission: 'indent:read',
          pendingPhase: 6,
        },
        {
          label: 'Allotment board',
          to: ROUTES.controller.dashboard,
          icon: Route01Icon,
          permission: 'rake:allot',
          pendingPhase: 7,
        },
      ],
    },
    {
      title: 'Network',
      items: [
        {
          label: 'Rakes',
          to: ROUTES.controller.rakes,
          icon: TruckDeliveryIcon,
          permission: 'rake:read',
        },
        {
          // Phase 5 upgrades the transport to SSE and adds ETA and congestion
          // colour; the route does not move, so this entry does not change again.
          label: 'Network map',
          to: ROUTES.controller.network,
          icon: MapsIcon,
          permission: 'rake:read',
        },
        {
          label: 'Embargoes',
          to: ROUTES.controller.embargoes,
          icon: SecurityCheckIcon,
          permission: 'embargo:write',
        },
        // No master-data link here, for the same reason there is no audit link
        // in the zonal tree. A controller holds `masterdata:read`, so the item
        // would render — but the screen lives under `RoleLayout role="admin"`,
        // so following it lands on a 403 every time. §7 gives this persona the
        // embargo screen; a link that always fails is worse than no link.
      ],
    },
  ],

  terminal_supervisor: [
    {
      items: [
        dashboard(ROUTES.terminal.dashboard),
        {
          /*
            Phase 5. "Placements" and "Rakes on hand" were two pending entries
            pointing at the same unbuilt screen; the board answers both, so the
            second is not resurrected as a duplicate link — it is a section of
            this page.
          */
          label: 'Placements',
          to: ROUTES.terminal.placements,
          icon: CalendarCheckIn01Icon,
          permission: 'terminal:read',
        },
        {
          label: 'Log an event',
          to: ROUTES.terminal.log,
          icon: Timer02Icon,
          permission: 'terminal:log',
        },
      ],
    },
    {
      title: 'Terminal',
      items: [
        {
          label: 'Exceptions',
          to: ROUTES.terminal.exceptions,
          icon: Alert02Icon,
          permission: 'rake:event:create',
        },
        {
          label: 'Network map',
          to: ROUTES.controller.network,
          icon: MapsIcon,
          permission: 'rake:read',
          /*
            The map lives in the controller tree and `RoleLayout` guards it by
            role — a supervisor entering `/app/controller/network` would land on
            a 403. Kept pending rather than linked, for the same reason the
            controller has no master-data link: a link that always fails is
            worse than no link. Phase 8 gives this persona its own congestion
            view, which is the screen they actually want.
          */
          pendingPhase: 8,
        },
        {
          label: 'Congestion',
          to: ROUTES.terminal.dashboard,
          icon: Analytics01Icon,
          permission: 'terminal:read',
          pendingPhase: 8,
        },
      ],
    },
  ],

  commercial_officer: [
    {
      items: [
        dashboard(ROUTES.commercial.dashboard),
        {
          label: 'Charge lines',
          to: ROUTES.commercial.dashboard,
          icon: Coins01Icon,
          permission: 'charge:read',
          pendingPhase: 9,
        },
        {
          label: 'Waivers',
          to: ROUTES.commercial.dashboard,
          icon: DiscountTag01Icon,
          permission: 'charge:waive',
          pendingPhase: 10,
        },
      ],
    },
    {
      title: 'Revenue',
      items: [
        {
          label: 'Invoices',
          to: ROUTES.commercial.dashboard,
          icon: Invoice01Icon,
          permission: 'invoice:issue',
          pendingPhase: 10,
        },
        {
          label: 'Rate quotes',
          to: ROUTES.commercial.dashboard,
          icon: File01Icon,
          permission: 'rate:quote',
          pendingPhase: 10,
        },
        {
          label: 'Extraction review',
          to: ROUTES.commercial.dashboard,
          icon: SecurityCheckIcon,
          permission: 'ai:review',
          pendingPhase: 11,
        },
      ],
    },
  ],

  zonal_manager: [
    {
      items: [
        dashboard(ROUTES.zonal.dashboard),
        {
          label: 'Turnaround',
          to: ROUTES.zonal.dashboard,
          icon: Timer02Icon,
          permission: 'analytics:read',
          pendingPhase: 8,
        },
        {
          label: 'Terminal performance',
          to: ROUTES.zonal.dashboard,
          icon: Location01Icon,
          permission: 'terminal:read',
          pendingPhase: 8,
        },
      ],
    },
    {
      title: 'Insight',
      items: [
        {
          label: 'Network map',
          to: ROUTES.zonal.network,
          icon: MapsIcon,
          permission: 'rake:read',
        },
        {
          label: 'Empty-km savings',
          to: ROUTES.zonal.dashboard,
          icon: ChartLineData01Icon,
          permission: 'analytics:read',
          pendingPhase: 7,
        },
        // No audit link here. A zonal manager holds `audit:read`, so the item
        // would render — but the viewer lives in the admin tree behind
        // `RoleLayout role="admin"`, so following it lands on a 403 every time.
        // §9's matrix gives this persona its own dashboard and nothing else; a
        // link that always fails is worse than no link.
      ],
    },
  ],

  admin: [
    {
      items: [
        dashboard(ROUTES.admin.dashboard),
        {
          label: 'Users & roles',
          to: ROUTES.admin.users,
          icon: UserGroupIcon,
          permission: 'user:read',
        },
        {
          label: 'Audit log',
          to: ROUTES.admin.audit,
          icon: SecurityCheckIcon,
          permission: 'audit:read',
        },
      ],
    },
    {
      title: 'Platform',
      items: [
        {
          label: 'Master data',
          to: ROUTES.admin.masterData,
          icon: DatabaseIcon,
          permission: 'masterdata:write',
        },
        {
          label: 'Customers',
          to: ROUTES.admin.customers,
          icon: UserGroupIcon,
          permission: 'masterdata:read',
        },
        {
          label: 'Charge rules',
          to: ROUTES.admin.chargeRules,
          icon: Coins01Icon,
          permission: 'masterdata:read',
        },
        {
          label: 'Documents',
          to: ROUTES.admin.documents,
          icon: File01Icon,
          permission: 'masterdata:read',
        },
        {
          // Phase 5. The audience is an administrator asking why an ETA looks
          // wrong; the operating roles see the answer and its provenance on the
          // rake sheet instead, which is why the guard is `analytics:read`.
          label: 'ETA weights',
          to: ROUTES.admin.etaWeights,
          icon: Route01Icon,
          permission: 'analytics:read',
        },
        {
          label: 'AI jobs',
          to: ROUTES.admin.dashboard,
          icon: Settings02Icon,
          permission: 'ai:review',
          pendingPhase: 11,
        },
      ],
    },
  ],
};

/** The role trees an admin may also enter — used by the workspace switcher. */
export const ROLE_TREE_ORDER: UserRoleType[] = [
  'admin',
  'zonal_manager',
  'freight_controller',
  'terminal_supervisor',
  'commercial_officer',
  'freight_customer',
];

export default NAVIGATION;
