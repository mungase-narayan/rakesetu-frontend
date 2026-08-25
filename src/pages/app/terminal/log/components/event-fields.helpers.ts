/**
 * Which fields each event carries, how they become a payload, and what makes a
 * submission incomplete.
 *
 * Split out of the component file so that file exports a component and nothing
 * else — the rule the rest of the app follows and the one Fast Refresh relies
 * on. These are also the functions worth reading on their own: what a
 * `LOADING_COMPLETE` payload contains is a contract with the projector, not a
 * detail of a form.
 */
import { takesReason } from '@/constants';
import type { RakeEventType } from '@/types/rake-event.types';

export interface EventFieldValues {
  lineNumber: string;
  netWeightT: string;
  wagonsLoaded: string;
  reasonCode: string;
  note: string;
}

export const emptyFieldValues = (): EventFieldValues => ({
  lineNumber: '',
  netWeightT: '',
  wagonsLoaded: '',
  reasonCode: '',
  note: '',
});

/** Which events carry which fields. Nothing else is ever shown. */
const NEEDS_LINE: RakeEventType[] = [
  'PLACED_FOR_LOADING',
  'PLACED_FOR_UNLOADING',
];
const NEEDS_WEIGHT: RakeEventType[] = [
  'LOADING_COMPLETE',
  'UNLOADING_COMPLETE',
  'LOADED_RELEASED',
];
const NEEDS_WAGONS: RakeEventType[] = [
  'LOADING_COMPLETE',
  'UNLOADING_COMPLETE',
];

/**
 * Only the fields this event actually carries.
 *
 * **Event-specific, not a universal form.** `rake_events.payload` is `jsonb`
 * precisely because fourteen of the twenty-four event types carry nothing; a
 * form that showed net weight next to a departure would be asking a supervisor
 * to leave a box blank forty times a shift, and the one time they did not would
 * be a weight attached to an event that has no weight.
 *
 * The reason code is a **closed list**, and that is a downstream contract
 * rather than a convenience: Phase 10 adjudicates waivers by matching these
 * exact strings, and free text goes in the note beside it. The attribution is
 * shown next to each option because it is what the choice actually decides.
 */
export const eventFields = (
  eventType: RakeEventType
): (keyof EventFieldValues)[] => {
  const fields: (keyof EventFieldValues)[] = [];
  if (NEEDS_LINE.includes(eventType)) fields.push('lineNumber');
  if (NEEDS_WEIGHT.includes(eventType)) fields.push('netWeightT');
  if (NEEDS_WAGONS.includes(eventType)) fields.push('wagonsLoaded');
  if (takesReason(eventType)) fields.push('reasonCode', 'note');
  return fields;
};

/** The payload the API takes, built from whatever this event asked for. */
export const buildPayload = (
  eventType: RakeEventType,
  values: EventFieldValues
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  const fields = eventFields(eventType);

  if (fields.includes('lineNumber') && values.lineNumber.trim()) {
    payload.lineNumber = values.lineNumber.trim();
  }
  if (fields.includes('netWeightT') && values.netWeightT.trim()) {
    payload.netWeightT = Number(values.netWeightT);
  }
  if (fields.includes('wagonsLoaded') && values.wagonsLoaded.trim()) {
    payload.wagonsLoaded = Number(values.wagonsLoaded);
  }
  if (fields.includes('reasonCode')) {
    payload.reasonCode = values.reasonCode;
    if (values.note.trim()) payload.note = values.note.trim();
  }

  return payload;
};

/** What is still missing, in a sentence. Null when the form may be submitted. */
export const validateFields = (
  eventType: RakeEventType,
  values: EventFieldValues
): string | null => {
  const fields = eventFields(eventType);

  if (fields.includes('reasonCode') && !values.reasonCode) {
    return 'Choose a reason — it decides how a waiver claim is weighed later.';
  }
  if (fields.includes('netWeightT') && values.netWeightT.trim()) {
    const weight = Number(values.netWeightT);
    if (!Number.isFinite(weight) || weight <= 0) {
      return 'Net weight must be a positive number of tonnes.';
    }
  }
  if (fields.includes('wagonsLoaded') && values.wagonsLoaded.trim()) {
    const wagons = Number(values.wagonsLoaded);
    if (!Number.isInteger(wagons) || wagons <= 0) {
      return 'Wagons loaded must be a whole number.';
    }
  }
  return null;
};
