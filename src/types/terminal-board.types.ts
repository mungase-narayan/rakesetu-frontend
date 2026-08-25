/**
 * The terminal supervisor's board and quick-entry shapes, mirroring
 * `rakesetu-backend/src/modules/terminal/types/terminal.types.ts`.
 */
import type { EtaConfidence } from './eta.types';
import type {
  CommodityGroup,
  HandlingMode,
  RakeState,
  TerminalType,
} from './master-data.types';
import type { RakeEventType, StateGroup } from './rake-event.types';

/**
 * Which free-time rule answered, and **on what date it was asked**.
 *
 * `resolvedAsOf` is on the wire so a screen can show it. The board's entire
 * claim is that it resolved the rule as of the *placement*, not as of now, and
 * a claim nobody can check is a claim nobody should believe.
 */
export interface FreeTimeResolution {
  hours: number | null;
  circularRef: string | null;
  clauseRef: string | null;
  effectiveFrom: string | null;
  resolvedAsOf: string;
}

export interface BoardTerminal {
  id: string;
  code: string;
  name: string;
  type: TerminalType;
  handlingMode: HandlingMode;
  placementLines: number;
  isMechanised: boolean;
  stationCode: string;
  stationName: string;
  division: string;
  commodityGroups: CommodityGroup[];
}

export interface BoardOnHand {
  rakeId: string;
  code: string;
  wagonTypeCode: string;
  wagonCount: number;
  state: RakeState;
  previousState: RakeState | null;
  stateGroup: StateGroup;
  since: string;
  hoursInState: number;
  cycleId: string | null;
  commodityGroup: CommodityGroup | null;
  lineNumber: string | null;
  placedAt: string | null;
  hoursOnHand: number | null;
  freeTime: FreeTimeResolution;
  hoursOverFree: number | null;
  status: 'ok' | 'approaching' | 'over' | 'unknown';
}

export interface BoardInbound {
  rakeId: string;
  code: string;
  wagonTypeCode: string;
  state: RakeState;
  fromCode: string;
  arrivalAt: string;
  totalMinutes: number;
  totalKm: number;
  legs: number;
  confidence: EtaConfidence;
  observedShare: number;
  isOverdue: boolean;
}

export interface BoardReleased {
  rakeId: string;
  code: string;
  wagonCount: number;
  eventType: RakeEventType;
  releasedAt: string;
  placedAt: string | null;
  /** Placement to release. **Not a charge** — Phase 9 owns the money. */
  detentionHours: number | null;
  cycleId: string | null;
}

export interface TerminalBoard {
  terminal: BoardTerminal;
  asOf: string;
  occupancy: { onHand: number; placementLines: number; ratio: number };
  inbound: BoardInbound[];
  onHand: BoardOnHand[];
  releasedToday: BoardReleased[];
  totals: {
    inbound: number;
    onHand: number;
    releasedToday: number;
    detentionHoursToday: number;
    overFreeTime: number;
  };
}

/** A terminal in the picker, with what is standing on it right now. */
export interface BoardOption {
  id: string;
  code: string;
  name: string;
  type: TerminalType;
  stationCode: string;
  placementLines: number;
  onHand: number;
}

/**
 * What the quick-entry screen may offer for one rake.
 *
 * `legal` comes from the server's transition table, so a button that would be
 * refused is never rendered. Nothing in this app may compute this list itself —
 * a second copy of the state machine in the browser is a copy that drifts.
 */
export interface NextEvents {
  rakeId: string;
  code: string;
  state: RakeState;
  previousState: RakeState | null;
  since: string;
  hoursInState: number;
  terminalId: string | null;
  legal: RakeEventType[];
  primary: RakeEventType | null;
  clearing: RakeEventType[];
}

export interface NextEventsResponse {
  terminal: BoardTerminal;
  asOf: string;
  rakes: NextEvents[];
}
