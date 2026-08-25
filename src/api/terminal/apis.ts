import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  Embargo,
  EmbargoScope,
  ListEmbargoesQuery,
  ListTerminalsQuery,
  Terminal,
} from '@/types/master-data.types';
import type {
  BoardOption,
  NextEventsResponse,
  TerminalBoard,
} from '@/types/terminal-board.types';

const endpoint = {
  terminals: '/terminals',
  terminal: (id: string) => `/terminals/${id}`,
  embargoes: '/embargoes',
  embargo: (id: string) => `/embargoes/${id}`,
  preview: '/embargoes/preview',
  board: (id: string) => `/terminals/${id}/board`,
  nextEvents: (id: string) => `/terminals/${id}/next-events`,
  boardOptions: '/terminals/board-options',
};

export type CreateTerminalBody = Omit<
  Terminal,
  | 'id'
  | 'orgId'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'isMechanised'
  | 'avgPlacementMinutes'
  | 'operatorOrgId'
> & {
  isActive?: boolean;
  isMechanised?: boolean;
  avgPlacementMinutes?: number;
  operatorOrgId?: string | null;
};

export interface CreateEmbargoBody {
  scope: EmbargoScope;
  fromTs: string;
  toTs: string;
  reason: string;
  circularRef?: string | null;
  documentId?: string | null;
}

export const apis = {
  /**
   * The supervisor's board: inbound, on hand, released today.
   *
   * `asOf` exists so the temporal behaviour is demonstrable — the free time on
   * each row is resolved as of that rake's *placement*, and asking for the
   * board as it stood before a circular changed is how that is shown rather
   * than asserted. Screens leave it unset.
   */
  getBoard: ({ terminalId, asOf }: { terminalId: string; asOf?: string }) =>
    apiRequest<ApiResponse<TerminalBoard>>({
      url: endpoint.board(terminalId),
      method: REQUEST_METHOD.GET,
      params: asOf ? { asOf } : undefined,
    }),

  /**
   * What may legally be logged, per rake. **The buttons come from here.**
   *
   * The browser never decides what a rake may do next — that is the server's
   * transition table, and a second copy of it in a component is a copy that
   * drifts into offering an event the API refuses.
   */
  getNextEvents: ({
    terminalId,
    rakeId,
  }: {
    terminalId: string;
    rakeId?: string;
  }) =>
    apiRequest<ApiResponse<NextEventsResponse>>({
      url: endpoint.nextEvents(terminalId),
      method: REQUEST_METHOD.GET,
      params: rakeId ? { rakeId } : undefined,
    }),

  /** The terminals this supervisor may pick between, with live occupancy. */
  getBoardOptions: () =>
    apiRequest<ApiResponse<BoardOption[]>>({
      url: endpoint.boardOptions,
      method: REQUEST_METHOD.GET,
    }),

  getTerminals: ({ params }: { params: ListTerminalsQuery }) =>
    apiRequest<ApiResponse<Paginated<Terminal>>>({
      url: endpoint.terminals,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createTerminal: ({ data }: { data: CreateTerminalBody }) =>
    apiRequest<ApiResponse<Terminal>>({
      url: endpoint.terminals,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateTerminal: ({
    id,
    data,
  }: {
    id: string;
    data: Partial<CreateTerminalBody>;
  }) =>
    apiRequest<ApiResponse<Terminal>>({
      url: endpoint.terminal(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  getEmbargoes: ({ params }: { params: ListEmbargoesQuery }) =>
    apiRequest<ApiResponse<Paginated<Embargo>>>({
      url: endpoint.embargoes,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  createEmbargo: ({ data }: { data: CreateEmbargoBody }) =>
    apiRequest<ApiResponse<Embargo>>({
      url: endpoint.embargoes,
      method: REQUEST_METHOD.POST,
      data: data as unknown as Record<string, unknown>,
    }),

  updateEmbargo: ({
    id,
    data,
  }: {
    id: string;
    data: Partial<CreateEmbargoBody> & { isActive?: boolean };
  }) =>
    apiRequest<ApiResponse<Embargo>>({
      url: endpoint.embargo(id),
      method: REQUEST_METHOD.PATCH,
      data: data as unknown as Record<string, unknown>,
    }),

  /** Ends it. Soft — the row is the evidence for every solver run that honoured it. */
  endEmbargo: ({ id }: { id: string }) =>
    apiRequest<ApiResponse<Embargo>>({
      url: endpoint.embargo(id),
      method: REQUEST_METHOD.DELETE,
    }),

  /**
   * The scope builder's live preview.
   *
   * Asked of the server rather than computed in the browser, so the sentence
   * shown before saving comes from the same module that will describe it
   * afterwards — and from the same module Phase 7's matcher lives in. A second
   * implementation here would be a second opinion about what an embargo means.
   */
  previewScope: ({ scope }: { scope: EmbargoScope }) =>
    apiRequest<ApiResponse<{ summary: string }>>({
      url: endpoint.preview,
      method: REQUEST_METHOD.POST,
      data: { scope } as unknown as Record<string, unknown>,
    }),
};
