import type { EventSourceName, RakeEventType } from '@/types/rake-event.types';

/**
 * Human labels for the event vocabulary.
 *
 * `SCREAMING_SNAKE` is what the API speaks and what a log line should say; it
 * is not what a screen should. The two are kept apart here rather than by
 * `.replace(/_/g, ' ')` at the call site, because "LOADED_RELEASED" prettifies
 * to "loaded released", which reads as a mistake — the event means the rake was
 * *released after loading*, and only a written label can say so.
 */
export const RAKE_EVENT_TYPE_LABELS: Record<RakeEventType, string> = {
  ALLOTTED: 'Allotted',
  DEPARTED_EMPTY: 'Departed empty',
  ARRIVED_LOADING_YARD: 'Arrived at loading yard',
  PLACED_FOR_LOADING: 'Placed for loading',
  LOADING_STARTED: 'Loading started',
  LOADING_COMPLETE: 'Loading complete',
  LOADED_RELEASED: 'Released after loading',
  DEPARTED_ORIGIN: 'Departed origin',
  SECTION_PASSED: 'Section passed',
  ARRIVED_DEST: 'Arrived at destination',
  PLACED_FOR_UNLOADING: 'Placed for unloading',
  UNLOADING_STARTED: 'Unloading started',
  UNLOADING_COMPLETE: 'Unloading complete',
  UNLOADED_RELEASED: 'Released after unloading',
  DEPARTED_EMPTY_RETURN: 'Departed on empty return',
  EMPTY_AVAILABLE: 'Declared empty and available',
  DETAINED: 'Detained',
  DETENTION_CLEARED: 'Detention cleared',
  MARKED_SICK: 'Marked sick',
  SICK_CLEARED: 'Sick cleared',
  DIVERTED: 'Diverted',
  DIVERSION_CLEARED: 'Diversion cleared',
  HELD_FOR_ORDER: 'Held for orders',
  HOLD_RELEASED: 'Hold released',
  CORRECTION: 'Correction',
};

/**
 * Where the event came from — and therefore how much weight it carries.
 *
 * "Simulated" is spelled out rather than hidden. §14 makes the synthetic feed a
 * stated design decision, and a demo whose data is indistinguishable from
 * production data is a demo nobody can audit.
 */
export const EVENT_SOURCE_LABELS: Record<EventSourceName, string> = {
  simulator: 'Simulated',
  manual: 'Logged by a person',
  fois: 'FOIS feed',
  ai_extraction: 'AI extraction',
  correction: 'Correction',
};
