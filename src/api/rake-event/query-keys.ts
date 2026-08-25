import type {
  ListAnomaliesQuery,
  ListEventsQuery,
  ListRakeStatesQuery,
} from '@/types/rake-event.types';

export const rakeEventKeys = {
  all: ['rake-event'] as const,

  /**
   * The live feed's key carries no parameters — there is exactly one network
   * and one tenant per session, so a parameterised key would produce a cache
   * entry per render and defeat the polling window.
   */
  networkLive: () => [...rakeEventKeys.all, 'network-live'] as const,
  availableCount: () => [...rakeEventKeys.all, 'available-count'] as const,
  sectionLoad: (hours: number) =>
    [...rakeEventKeys.all, 'section-load', hours] as const,

  rakeStates: () => [...rakeEventKeys.all, 'rake-states'] as const,
  rakeStateList: (params: ListRakeStatesQuery) =>
    [...rakeEventKeys.rakeStates(), params] as const,

  events: (rakeId: string) => [...rakeEventKeys.all, 'events', rakeId] as const,
  eventList: (rakeId: string, params: ListEventsQuery) =>
    [...rakeEventKeys.events(rakeId), params] as const,

  state: (rakeId: string) => [...rakeEventKeys.all, 'state', rakeId] as const,
  cycles: (rakeId: string) => [...rakeEventKeys.all, 'cycles', rakeId] as const,

  anomalies: () => [...rakeEventKeys.all, 'anomalies'] as const,
  anomalyList: (params: ListAnomaliesQuery) =>
    [...rakeEventKeys.anomalies(), params] as const,
};
