/**
 * The event spine's shapes, mirroring `rakesetu-backend/src/schema` and the
 * rake-event module's response types.
 *
 * Hand-mirrored for the same reason `master-data.types.ts` is: the two projects
 * do not share a package. The `as const` arrays are the source of truth here,
 * exactly as the `pgEnum` arrays are on the server, so a drift surfaces as a
 * filter offering a value the API rejects rather than as a silent `undefined`.
 */
import type { RakeState } from './master-data.types';
import type { PaginationParams } from './pagination.types';

export const RAKE_EVENT_TYPES = [
  'ALLOTTED',
  'DEPARTED_EMPTY',
  'ARRIVED_LOADING_YARD',
  'PLACED_FOR_LOADING',
  'LOADING_STARTED',
  'LOADING_COMPLETE',
  'LOADED_RELEASED',
  'DEPARTED_ORIGIN',
  'SECTION_PASSED',
  'ARRIVED_DEST',
  'PLACED_FOR_UNLOADING',
  'UNLOADING_STARTED',
  'UNLOADING_COMPLETE',
  'UNLOADED_RELEASED',
  'DEPARTED_EMPTY_RETURN',
  'EMPTY_AVAILABLE',
  'DETAINED',
  'DETENTION_CLEARED',
  'MARKED_SICK',
  'SICK_CLEARED',
  'DIVERTED',
  'DIVERSION_CLEARED',
  'HELD_FOR_ORDER',
  'HOLD_RELEASED',
  'CORRECTION',
] as const;
export type RakeEventType = (typeof RAKE_EVENT_TYPES)[number];

export const EVENT_SOURCES = [
  'simulator',
  'manual',
  'fois',
  'ai_extraction',
  'correction',
] as const;
export type EventSourceName = (typeof EVENT_SOURCES)[number];

/**
 * How a state is coloured on the map and in the fleet list.
 *
 * Four groups rather than sixteen colours, because a legend with sixteen
 * entries is a legend nobody reads. The group answers the question a controller
 * actually asks of the map — *is this rake earning, moving, or stuck?*
 */
export const STATE_GROUPS = [
  'empty',
  'moving',
  'at_terminal',
  'exception',
] as const;
export type StateGroup = (typeof STATE_GROUPS)[number];

export const STATE_GROUP: Record<RakeState, StateGroup> = {
  EMPTY_AVAILABLE: 'empty',
  ALLOTTED: 'empty',
  MOVING_TO_LOADING: 'moving',
  PLACED_FOR_LOADING: 'at_terminal',
  LOADING: 'at_terminal',
  LOADED_RELEASED: 'at_terminal',
  IN_TRANSIT_LOADED: 'moving',
  AT_DEST_YARD: 'moving',
  PLACED_FOR_UNLOADING: 'at_terminal',
  UNLOADING: 'at_terminal',
  UNLOADED_RELEASED: 'at_terminal',
  EMPTY_RETURNING: 'moving',
  DETAINED: 'exception',
  SICK: 'exception',
  DIVERTED: 'exception',
  HELD_FOR_ORDER: 'exception',
};

/**
 * The legend names the **states**, not the colours.
 *
 * "Amber = moving" tells a reader nothing they could not see; "Moving —
 * in transit, running empty, approaching the yard" tells them which of sixteen
 * states the amber dot could be, which is the question the map raises.
 */
export const STATE_GROUP_LABEL: Record<StateGroup, string> = {
  empty: 'Available or allotted',
  moving: 'On the move',
  at_terminal: 'At a terminal',
  exception: 'Held, sick or diverted',
};

export const STATE_GROUP_MEMBERS: Record<StateGroup, RakeState[]> = {
  empty: ['EMPTY_AVAILABLE', 'ALLOTTED'],
  moving: [
    'MOVING_TO_LOADING',
    'IN_TRANSIT_LOADED',
    'AT_DEST_YARD',
    'EMPTY_RETURNING',
  ],
  at_terminal: [
    'PLACED_FOR_LOADING',
    'LOADING',
    'LOADED_RELEASED',
    'PLACED_FOR_UNLOADING',
    'UNLOADING',
    'UNLOADED_RELEASED',
  ],
  exception: ['DETAINED', 'SICK', 'DIVERTED', 'HELD_FOR_ORDER'],
};

export interface RakeEvent {
  id: string;
  orgId: string;
  rakeId: string;
  cycleId: string | null;
  eventType: RakeEventType;
  occurredAt: string;
  recordedAt: string;
  stationCode: string | null;
  terminalId: string | null;
  payload: Record<string, unknown>;
  source: EventSourceName;
  sourceRef: string | null;
  recordedBy: string | null;
  idempotencyKey: string;
  /** `false` = an illegal transition that was refused and kept as evidence. */
  applied: boolean;
  rejectionReason: string | null;
  correctsEventId: string | null;
  correlationId: string | null;
}

export interface RakeStateRow {
  rakeId: string;
  orgId: string;
  state: RakeState;
  previousState: RakeState | null;
  stationCode: string | null;
  terminalId: string | null;
  since: string;
  cycleId: string | null;
  lastEventId: string | null;
  lastEventAt: string | null;
  indentId: string | null;
  isDirty: boolean;
  updatedAt: string;
}

export interface RakeCycle {
  id: string;
  orgId: string;
  rakeId: string;
  startedAt: string;
  endedAt: string | null;
  /** Phase 8 fills both. Null here is the honest answer, not a missing read. */
  tatHours: number | null;
  buckets: Record<string, number> | null;
  originTerminalId: string | null;
  destTerminalId: string | null;
  commodityCode: string | null;
  indentId: string | null;
  consignmentId: string | null;
  netWeightT: number | null;
  isClosed: boolean;
  eventCount: number;
}

export interface LiveRake {
  rakeId: string;
  code: string;
  wagonTypeCode: string;
  wagonCount: number;
  homeDivision: string;
  state: RakeState;
  previousState: RakeState | null;
  stateGroup: StateGroup;
  since: string;
  hoursInState: number;
  stationCode: string | null;
  stationName: string | null;
  lat: number | null;
  lng: number | null;
  terminalId: string | null;
  cycleId: string | null;
  lastEventAt: string | null;
  isDirty: boolean;
}

export interface LiveTerminal {
  id: string;
  code: string;
  name: string;
  stationCode: string;
  lat: number;
  lng: number;
  placementLines: number;
  isMechanised: boolean;
}

export interface NetworkLive {
  /** Server time — the "last updated" label must not be the browser's opinion. */
  asOf: string;
  rakes: LiveRake[];
  terminals: LiveTerminal[];
  counts: Partial<Record<RakeState, number>>;
}

export interface RakeWithState extends Omit<LiveRake, 'lat' | 'lng'> {
  isActive: boolean;
  cycleCount: number;
  eventCount: number;
}

export interface ReprojectResult {
  rakeId: string;
  changed: boolean;
  diff: Record<string, { stored: unknown; rebuilt: unknown }>;
  eventCount: number;
  cycleCount: number;
  rejectedEventIds: string[];
}

export interface ListEventsQuery extends PaginationParams {
  from?: string;
  to?: string;
  eventType?: RakeEventType;
  includeRejected?: boolean;
}

export interface ListRakeStatesQuery extends PaginationParams {
  state?: RakeState;
  search?: string;
}

export interface ListAnomaliesQuery extends PaginationParams {
  rakeId?: string;
  from?: string;
  to?: string;
}

// ---------------------------------------------------------------------------
// Phase 5 — writing events by hand.
// ---------------------------------------------------------------------------

/**
 * What a supervisor's quick-entry form sends.
 *
 * `source` is **not** in this shape and cannot be: the server stamps every
 * event written through this route as `manual` whatever the body claims, and
 * `recordedBy` comes from the token. An identity a client can type is not an
 * identity (§8).
 */
export interface CreateEventBody {
  eventType: RakeEventType;
  /** ISO, UTC. Never in the future — the server refuses one with a 422. */
  occurredAt: string;
  stationCode?: string | null;
  terminalId?: string | null;
  payload?: Record<string, unknown>;
}

export interface CreateEventResult {
  event: RakeEvent;
  projection: RakeStateRow;
  cycle: RakeCycle | null;
  /** True when the event's `occurredAt` preceded the projection's last event. */
  wasLate: boolean;
  reprojected: boolean;
}

/**
 * A frame off `GET /network/stream`.
 *
 * The `rake.state` frame carries the projection *after* the event, which is why
 * the map can patch its cache in place instead of refetching.
 */
export interface RakeStateFrame {
  rakeId: string;
  code: string;
  state: RakeState;
  previousState: RakeState | null;
  stateGroup: StateGroup;
  stationCode: string | null;
  stationName: string | null;
  lat: number | null;
  lng: number | null;
  terminalId: string | null;
  since: string;
  isDirty: boolean;
}

export interface RakeEventFrame {
  eventId: string;
  rakeId: string;
  code: string;
  eventType: RakeEventType;
  occurredAt: string;
  recordedAt: string;
  stationCode: string | null;
  terminalId: string | null;
  applied: boolean;
}

/** One section, with how much traffic it carried and where to draw it. */
export interface SectionLoadRow {
  sectionId: string;
  fromCode: string;
  toCode: string;
  distanceKm: number;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  /** `SECTION_PASSED` events in the window. Zero is a real answer, not a gap. */
  traversals: number;
}

export interface SectionLoad {
  asOf: string;
  windowHours: number;
  /** The busiest section, so line widths scale against the whole network. */
  maxTraversals: number;
  sections: SectionLoadRow[];
}
