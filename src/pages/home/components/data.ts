/**
 * Landing page content.
 *
 * Kept as data rather than inline JSX so the copy can be reviewed and edited
 * without touching layout. Every claim here traces back to docs/DESIGN.md.
 */
import {
  Analytics01Icon,
  ChartLineData01Icon,
  Invoice01Icon,
  Message01Icon,
  Route01Icon,
  TruckDeliveryIcon,
  Clock01Icon,
  Alert02Icon,
  HelpCircleIcon,
  Building03Icon,
  UserGroupIcon,
  PackageIcon,
  DashboardSquare01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';

/** The five gaps from the design doc's problem table. */
export const PROBLEMS = [
  {
    icon: HelpCircleIcon,
    title: 'Allotment is a whiteboard',
    body: 'Indents are matched to empty rakes from memory and phone calls. Customers cannot see their place in the queue, and no decision can be audited afterwards.',
  },
  {
    icon: Route01Icon,
    title: 'Rakes run empty',
    body: 'A rake finishing unloading is rarely matched to the nearest pending demand, so a large share of rake-kilometres is hauled with nothing in it.',
  },
  {
    icon: Clock01Icon,
    title: 'Turnaround is measured, never explained',
    body: 'Everyone knows the cycle is slow. Nobody can say which hours went to loading detention, yard wait or the empty return — so nobody knows what to fix.',
  },
  {
    icon: Alert02Icon,
    title: 'Demurrage ends in dispute',
    body: 'Free time varies by commodity, terminal and handling mode. With no visible derivation, every charge is arguable and waivers move on paper.',
  },
  {
    icon: Invoice01Icon,
    title: 'Nobody can quote a rate',
    body: 'Class, distance slab, minimum weight, busy-season and terminal charges are governed by circulars that change monthly. Confident quotes are rare.',
  },
];

/** The four product pillars. */
export const PILLARS = [
  {
    icon: TruckDeliveryIcon,
    title: 'Allotment intelligence',
    body: 'A constrained optimiser matches empty rakes to open indents on empty-kilometres, priority and terminal congestion — and shows the alternatives it rejected, with the cost difference.',
    points: [
      'Hard constraints filtered before scoring',
      'Every proposal carries its reasoning',
      'Overrides require a recorded reason',
    ],
  },
  {
    icon: ChartLineData01Icon,
    title: 'Turnaround digital twin',
    body: 'An append-only event stream reconstructs each rake cycle and attributes every hour to loading, transit, yard wait or empty return — benchmarked against the same route and commodity.',
    points: [
      'Replayable event history',
      'Detention leaderboard by terminal',
      'Outliers flagged automatically',
    ],
  },
  {
    icon: Invoice01Icon,
    title: 'Charges you can defend',
    body: 'Demurrage and wharfage are computed from versioned rules, and every line stores the full derivation. A dispute is answered by opening the trace, not by re-running the code.',
    points: [
      'Rules stored as dated data, not code',
      'Charges re-derivable years later',
      'Waivers mapped to exemption clauses',
    ],
  },
  {
    icon: Message01Icon,
    title: 'Copilot grounded in the rulebook',
    body: 'Ask about a rate or a rule in plain language and get an answer that cites the governing circular clause — filtered to the circular that was in force on the date that matters.',
    points: [
      'Answers carry mandatory citations',
      'Superseded circulars filtered out',
      'Refuses rather than guessing',
    ],
  },
];

/** How the freight lifecycle flows through the platform. */
export const LIFECYCLE = [
  {
    step: '01',
    title: 'Indent',
    body: 'A customer registers demand for wagons at a loading terminal, and can see exactly where it sits in the queue.',
  },
  {
    step: '02',
    title: 'Allotment',
    body: 'The solver proposes a rake for every feasible indent; a controller accepts, or overrides with a reason.',
  },
  {
    step: '03',
    title: 'Placement & loading',
    body: 'The terminal logs placement and release. Free time starts and stops against the recorded event, not a phone call.',
  },
  {
    step: '04',
    title: 'Transit',
    body: 'The customer tracks the rake on a live map with an honest confidence band instead of a fake-precise arrival time.',
  },
  {
    step: '05',
    title: 'Delivery & charges',
    body: 'Unloading closes the cycle. Freight, demurrage and wharfage are computed with a visible derivation.',
  },
  {
    step: '06',
    title: 'Empty repositioning',
    body: 'The now-empty rake re-enters the solver, matched to the nearest demand rather than sent home empty.',
  },
];

/** The six personas the platform is built for. */
export const PERSONAS = [
  {
    icon: PackageIcon,
    role: 'Freight customer',
    body: 'Place indents, watch the rake move, and see exactly what the consignment will cost.',
  },
  {
    icon: DashboardSquare01Icon,
    role: 'Freight controller',
    body: 'Work the allotment board, manage embargoes, and clear the exception queue.',
  },
  {
    icon: Building03Icon,
    role: 'Terminal supervisor',
    body: 'Log placement and release, and see when the next rake can actually be placed.',
  },
  {
    icon: Invoice01Icon,
    role: 'Commercial officer',
    body: 'Review charges, adjudicate waivers against the cited clause, and issue invoices.',
  },
  {
    icon: Analytics01Icon,
    role: 'Zonal manager',
    body: 'Track turnaround, empty kilometres saved, and where the lost hours are concentrated.',
  },
  {
    icon: Shield01Icon,
    role: 'Administrator',
    body: 'Manage circulars, rules, users and roles — with an append-only audit trail.',
  },
];

/** Headline numbers explaining the architecture stance, not fake metrics. */
export const PRINCIPLES = [
  {
    icon: Shield01Icon,
    title: 'Deterministic where it counts',
    body: 'Every number touching money or safety is computed by versioned, testable code. The model never does the arithmetic.',
  },
  {
    icon: UserGroupIcon,
    title: 'Explanations, not black boxes',
    body: 'Each allotment ships with the alternatives it beat. Each charge ships with its derivation. Each rule answer ships with a citation.',
  },
  {
    icon: Clock01Icon,
    title: 'Degrades, never breaks',
    body: 'If the AI service goes down, indents, allotment, tracking and billing keep working. Only the assistive features pause.',
  },
];
