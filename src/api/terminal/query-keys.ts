import type {
  EmbargoScope,
  ListEmbargoesQuery,
  ListTerminalsQuery,
} from '@/types/master-data.types';

export const terminalKeys = {
  all: ['terminal'] as const,

  terminals: () => [...terminalKeys.all, 'terminals'] as const,
  terminalList: (params: ListTerminalsQuery) =>
    [...terminalKeys.terminals(), params] as const,

  embargoes: () => [...terminalKeys.all, 'embargoes'] as const,
  embargoList: (params: ListEmbargoesQuery) =>
    [...terminalKeys.embargoes(), params] as const,

  preview: (scope: EmbargoScope) =>
    [...terminalKeys.embargoes(), 'preview', scope] as const,

  /**
   * The board's key carries the terminal but **not** `asOf`.
   *
   * A screen never sets `asOf` — it is a demonstration parameter — and folding
   * an always-undefined value into the key would only make it harder to
   * invalidate the board after logging an event, which is the one thing the
   * quick-entry screen has to do.
   */
  board: (terminalId: string) =>
    [...terminalKeys.all, 'board', terminalId] as const,
  nextEvents: (terminalId: string, rakeId?: string) =>
    [...terminalKeys.all, 'next-events', terminalId, rakeId ?? 'all'] as const,
  boardOptions: () => [...terminalKeys.all, 'board-options'] as const,
};
