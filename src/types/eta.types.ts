/**
 * The ETA engine's shapes, mirroring `rakesetu-backend/src/modules/eta`.
 *
 * Hand-mirrored for the same reason every other type file here is: the two
 * projects do not share a package, so a drift shows up as a screen rendering
 * `undefined` rather than as a silent disagreement.
 *
 * **The one field to read carefully is `confidence`.** It is a *coverage label*
 * — how much of the estimate rests on observed running versus the timetable —
 * and it is **not a probability**. Tier 2's real p50/p80/p90 bands arrive in
 * Phase 8. Nothing in this app may render this field as a percentage
 * likelihood, an interval, or a "±"; `CONFIDENCE_LABELS` below exists so that
 * every screen says the same honest thing.
 */

export type WeightSource = 'observed' | 'nominal' | 'blended';
export type HourBand = 'night' | 'morning' | 'day' | 'evening';
export type EtaConfidence = 'low' | 'medium' | 'high';

export interface EtaLeg {
  sectionId: string;
  fromCode: string;
  toCode: string;
  distanceKm: number;
  minutes: number;
  source: WeightSource;
  samples: number;
  band: HourBand;
  elapsedMinutes: number;
}

export interface EtaResult {
  fromCode: string;
  toCode: string;
  departAt: string;
  arrivalAt: string;
  totalMinutes: number;
  totalKm: number;
  path: EtaLeg[];
  confidence: EtaConfidence;
  /** The share of the estimate's minutes that come from observed running, 0–1. */
  observedShare: number;
  wagonTypeCode: string;
}

export type EtaUnavailableReason =
  'not_in_transit' | 'no_position' | 'no_destination' | 'no_route' | 'no_cycle';

export interface EtaUnavailable {
  eta: null;
  reason: EtaUnavailableReason;
  /** A sentence written by the server. Render it; do not compose your own. */
  detail: string;
}

export interface RakeEta {
  eta: EtaResult;
  rakeId: string;
  rakeCode: string;
  state: string;
  destinationStationCode: string;
  destinationName: string | null;
  destinationTerminalId: string | null;
  isOverdue: boolean;
}

export type RakeEtaAnswer = RakeEta | EtaUnavailable;

export const isEtaAvailable = (answer: RakeEtaAnswer): answer is RakeEta =>
  answer.eta !== null;

export interface EstimateBody {
  fromCode: string;
  toCode: string;
  wagonTypeCode: string;
  departAt?: string;
}

export interface SectionWeightCell {
  sectionId: string;
  fromCode: string;
  toCode: string;
  band: HourBand;
  minutes: number;
  source: WeightSource;
  samples: number;
  nominalMinutes: number;
  observedMedianMinutes: number | null;
}

export interface SectionWeightTable {
  orgId: string;
  wagonTypeCode: string;
  asOf: string;
  windowDays: number;
  minObservations: number;
  cells: SectionWeightCell[];
  summary: { observed: number; blended: number; nominal: number };
  wagonTypeCodes: string[];
}

/**
 * What each label is allowed to say.
 *
 * The wording is deliberate and it is the product's promise: *how much of this
 * is measured*, never *how likely this is*. A screen that shortened "high" to
 * "90% confident" would be inventing a statistic the engine cannot compute
 * until Phase 8 builds the residual model.
 */
export const CONFIDENCE_LABELS: Record<
  EtaConfidence,
  { short: string; detail: string }
> = {
  high: {
    short: 'Mostly measured',
    detail:
      'Most of this estimate comes from traversals actually observed on these sections.',
  },
  medium: {
    short: 'Part measured',
    detail:
      'Some sections have enough observed running to use; the rest fall back to nominal speeds.',
  },
  low: {
    short: 'Timetable only',
    detail:
      'These sections have little or no observed running yet, so the estimate is the nominal speed.',
  },
};

export const WEIGHT_SOURCE_LABELS: Record<WeightSource, string> = {
  observed: 'Observed',
  blended: 'Blended',
  nominal: 'Nominal',
};

export const HOUR_BAND_LABELS: Record<HourBand, string> = {
  night: 'Night (22–06)',
  morning: 'Morning (06–10)',
  day: 'Day (10–18)',
  evening: 'Evening (18–22)',
};

/** Why there is no time, in words a screen can put where a time would go. */
export const ETA_REASON_LABELS: Record<EtaUnavailableReason, string> = {
  not_in_transit: 'Not in transit',
  no_position: 'Position unknown',
  no_destination: 'Destination not declared',
  no_route: 'No route',
  no_cycle: 'No turnaround open',
};

/** Re-exported so an ETA screen has one import for the shape and its rendering. */
export { formatDuration } from '@/lib/duration';
