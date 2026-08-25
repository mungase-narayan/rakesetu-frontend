import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  CreateEventBody,
  CreateEventResult,
  ListAnomaliesQuery,
  ListEventsQuery,
  ListRakeStatesQuery,
  NetworkLive,
  RakeCycle,
  RakeEvent,
  RakeStateRow,
  RakeWithState,
  ReprojectResult,
  SectionLoad,
} from '@/types/rake-event.types';

const endpoint = {
  events: (rakeId: string) => `/rakes/${rakeId}/events`,
  state: (rakeId: string) => `/rakes/${rakeId}/state`,
  cycles: (rakeId: string) => `/rakes/${rakeId}/cycles`,
  cycle: (rakeId: string, cycleId: string) =>
    `/rakes/${rakeId}/cycles/${cycleId}`,
  reproject: (rakeId: string) => `/rakes/${rakeId}/reproject`,
  networkLive: '/network/live',
  sectionLoad: '/network/section-load',
  rakeStates: '/network/rake-states',
  availableCount: '/network/available-count',
  anomalies: '/anomalies',
};

export const apis = {
  /**
   * Log one event against a rake.
   *
   * **The `Idempotency-Key` is a parameter, not something this function
   * generates.** The caller owns it for the life of a form instance and reuses
   * it across every retry — that is what stops a flaky-network double-tap from
   * writing two placements and double-counting detention hours. A key minted
   * here would be a new key on every call, which is precisely no protection.
   */
  createEvent: ({
    rakeId,
    idempotencyKey,
    data,
  }: {
    rakeId: string;
    idempotencyKey: string;
    data: CreateEventBody;
  }) =>
    apiRequest<ApiResponse<CreateEventResult>>({
      url: endpoint.events(rakeId),
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
    }),

  /**
   * The map feed.
   *
   * `Cache-Control: no-store` comes back on this one — a five-second poll
   * served from a cache is a map that lies about being live.
   */
  getNetworkLive: () =>
    apiRequest<ApiResponse<NetworkLive>>({
      url: endpoint.networkLive,
      method: REQUEST_METHOD.GET,
    }),

  /**
   * Section geometry and recent traffic.
   *
   * Its own request rather than a branch of the live feed: the live feed is
   * polled every five seconds and this changes over hours, so folding it in
   * would multiply the map's bandwidth to keep a line width fresh.
   */
  getSectionLoad: ({ hours }: { hours?: number } = {}) =>
    apiRequest<ApiResponse<SectionLoad>>({
      url: endpoint.sectionLoad,
      method: REQUEST_METHOD.GET,
      params: hours ? { hours } : undefined,
    }),

  getRakeStates: ({ params }: { params: ListRakeStatesQuery }) =>
    apiRequest<ApiResponse<Paginated<RakeWithState>>>({
      url: endpoint.rakeStates,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  getAvailableCount: () =>
    apiRequest<ApiResponse<{ count: number }>>({
      url: endpoint.availableCount,
      method: REQUEST_METHOD.GET,
    }),

  getEvents: ({
    rakeId,
    params,
  }: {
    rakeId: string;
    params: ListEventsQuery;
  }) =>
    apiRequest<ApiResponse<Paginated<RakeEvent>>>({
      url: endpoint.events(rakeId),
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  getState: ({ rakeId }: { rakeId: string }) =>
    apiRequest<ApiResponse<RakeStateRow>>({
      url: endpoint.state(rakeId),
      method: REQUEST_METHOD.GET,
    }),

  getCycles: ({ rakeId }: { rakeId: string }) =>
    apiRequest<ApiResponse<Paginated<RakeCycle>>>({
      url: endpoint.cycles(rakeId),
      method: REQUEST_METHOD.GET,
      params: { limit: 20 },
    }),

  getCycle: ({ rakeId, cycleId }: { rakeId: string; cycleId: string }) =>
    apiRequest<ApiResponse<{ cycle: RakeCycle; events: RakeEvent[] }>>({
      url: endpoint.cycle(rakeId, cycleId),
      method: REQUEST_METHOD.GET,
    }),

  getAnomalies: ({ params }: { params: ListAnomaliesQuery }) =>
    apiRequest<ApiResponse<Paginated<RakeEvent>>>({
      url: endpoint.anomalies,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  /**
   * §13.2's determinism check. Admin only, and the healthy answer is
   * `changed: false` — the projection the product is showing is exactly what a
   * fresh fold over the log produces.
   */
  reproject: ({ rakeId }: { rakeId: string }) =>
    apiRequest<ApiResponse<ReprojectResult>>({
      url: endpoint.reproject(rakeId),
      method: REQUEST_METHOD.POST,
    }),
};
