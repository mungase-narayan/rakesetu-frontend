import type { RakeEventType } from '@/types/rake-event.types';

/**
 * The six exception reason codes, mirroring
 * `rakesetu-backend/src/constants/exception-reason.constants.ts`.
 *
 * **These strings are a contract, not labels.** Phase 10's waiver adjudication
 * keys off them: a claim for a rain stoppage can only be weighed against a rule
 * about rain stoppages if the event said `rain_stoppage`. A seventh code
 * invented here would be a claim nobody downstream can map, so the list is
 * mirrored verbatim and the server refuses anything outside it with a 422.
 */
export const EXCEPTION_REASON_CODES = [
  'rain_stoppage',
  'power_failure',
  'labour_unavailable',
  'wagon_defect',
  'customer_delay',
  'railway_delay',
] as const;

export type ExceptionReasonCode = (typeof EXCEPTION_REASON_CODES)[number];

/** Who the delay is charged against when Phase 10 weighs a waiver. */
export type ReasonAttribution = 'railway' | 'customer' | 'force_majeure';

export interface ExceptionReason {
  code: ExceptionReasonCode;
  label: string;
  description: string;
  attribution: ReasonAttribution;
  appliesTo: RakeEventType[];
}

export const EXCEPTION_REASONS: ExceptionReason[] = [
  {
    code: 'rain_stoppage',
    label: 'Rain stoppage',
    description: 'Handling suspended by weather.',
    attribution: 'force_majeure',
    appliesTo: ['DETAINED', 'HELD_FOR_ORDER'],
  },
  {
    code: 'power_failure',
    label: 'Power failure',
    description: 'Terminal plant or lighting down.',
    attribution: 'force_majeure',
    appliesTo: ['DETAINED', 'HELD_FOR_ORDER'],
  },
  {
    code: 'labour_unavailable',
    label: 'Labour unavailable',
    description: 'No gang at the siding to load or unload.',
    attribution: 'customer',
    appliesTo: ['DETAINED'],
  },
  {
    code: 'wagon_defect',
    label: 'Wagon defect',
    description: 'A wagon is unfit to run — hot axle, brake, body.',
    attribution: 'railway',
    appliesTo: ['MARKED_SICK', 'DETAINED'],
  },
  {
    code: 'customer_delay',
    label: 'Customer delay',
    description: 'Trucks, storage or paperwork not ready at the siding.',
    attribution: 'customer',
    appliesTo: ['DETAINED', 'HELD_FOR_ORDER'],
  },
  {
    code: 'railway_delay',
    label: 'Railway delay',
    description: 'No line, no path, or an operating restriction.',
    attribution: 'railway',
    appliesTo: ['DETAINED', 'HELD_FOR_ORDER'],
  },
];

/**
 * What the attribution means on screen.
 *
 * Shown next to the code because it is the thing a supervisor is actually
 * deciding: "labour unavailable" and "no line" are both delays, and which of
 * them was chosen decides who pays. Hiding that until Phase 10 would make the
 * choice look clerical.
 */
export const ATTRIBUTION_LABELS: Record<ReasonAttribution, string> = {
  railway: 'Railway',
  customer: 'Customer',
  force_majeure: 'Force majeure',
};

/** The three events that take a reason code. Everything else takes none. */
export const REASON_BEARING_EVENTS: RakeEventType[] = [
  'DETAINED',
  'MARKED_SICK',
  'HELD_FOR_ORDER',
];

export const takesReason = (eventType: RakeEventType): boolean =>
  REASON_BEARING_EVENTS.includes(eventType);

export const reasonsFor = (eventType: RakeEventType): ExceptionReason[] =>
  EXCEPTION_REASONS.filter((reason) => reason.appliesTo.includes(eventType));

export const reasonLabel = (code: string | null | undefined): string =>
  EXCEPTION_REASONS.find((reason) => reason.code === code)?.label ??
  code ??
  '—';
