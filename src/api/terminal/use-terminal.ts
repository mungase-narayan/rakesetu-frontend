import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { terminalKeys } from './query-keys';
import type { CreateEmbargoBody, CreateTerminalBody } from './apis';
import type {
  EmbargoScope,
  ListEmbargoesQuery,
  ListTerminalsQuery,
} from '@/types/master-data.types';

export const useTerminalList = (params: ListTerminalsQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: terminalKeys.terminalList(params),
    queryFn: () => apis.getTerminals({ params }),
    select: (res) => res.data.data,
  });

  return {
    terminals: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useEmbargoList = (params: ListEmbargoesQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: terminalKeys.embargoList(params),
    queryFn: () => apis.getEmbargoes({ params }),
    select: (res) => res.data.data,
  });

  return {
    embargoes: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

/**
 * The plain-English reading of a scope being built.
 *
 * `enabled` is always true — even an empty scope has a meaning ("all traffic,
 * everywhere"), and that is precisely the case worth showing before somebody
 * saves it by accident.
 */
export const useScopePreview = (scope: EmbargoScope) => {
  const { data, isLoading } = useQuery({
    queryKey: terminalKeys.preview(scope),
    queryFn: () => apis.previewScope({ scope }),
    select: (res) => res.data.data.summary,
    retry: false,
  });

  return { summary: data, isLoading };
};

export const useTerminalMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: terminalKeys.terminals() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateTerminalBody }) =>
      apis.createTerminal({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateTerminalBody>;
    }) => apis.updateTerminal({ id, data }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createTerminal: create.mutate,
    updateTerminal: update.mutate,
    isLoading: create.isPending || update.isPending,
  };
};

export const useEmbargoMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: terminalKeys.embargoes() });

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateEmbargoBody }) =>
      apis.createEmbargo({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const end = useMutation({
    mutationFn: ({ id }: { id: string }) => apis.endEmbargo({ id }),
    onSuccess: invalidate,
    retry: false,
  });

  return {
    createEmbargo: create.mutate,
    endEmbargo: end.mutate,
    isLoading: create.isPending || end.isPending,
  };
};

// ---------------------------------------------------------------------------
// Phase 5 — the supervisor's board and quick entry.
// ---------------------------------------------------------------------------

/**
 * How often the board re-reads itself.
 *
 * Fifteen seconds, which is slower than the map's five. The board's numbers are
 * hours, not positions: a refresh three times a minute is already faster than
 * anything on it can change, and the *ticking* a supervisor watches — time in
 * state, hours over free time — is computed in the browser from `placedAt`
 * rather than waiting for a round trip.
 */
export const BOARD_POLL_MS = 15_000;

export const useTerminalBoard = (terminalId: string, enabled = true) => {
  const { data, isLoading, isError, isFetching, dataUpdatedAt } = useQuery({
    queryKey: terminalKeys.board(terminalId),
    queryFn: () => apis.getBoard({ terminalId }),
    select: (res) => res.data.data,
    enabled: Boolean(terminalId) && enabled,
    refetchInterval: enabled ? BOARD_POLL_MS : false,
    refetchOnWindowFocus: true,
    // A blink to "loading" every fifteen seconds would make the board unusable.
    placeholderData: (previous) => previous,
  });

  return { board: data, isLoading, isFetching, isError, dataUpdatedAt };
};

/** The terminals in the picker. Rarely changes; polled only for the occupancy. */
export const useBoardOptions = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: terminalKeys.boardOptions(),
    queryFn: () => apis.getBoardOptions(),
    select: (res) => res.data.data,
    refetchInterval: BOARD_POLL_MS,
  });

  return { options: data, isLoading, isError };
};

/**
 * The legal next events for every rake this terminal can log against.
 *
 * Refetched after every successful write, because the answer *changes* with the
 * write — that is the whole point of a transition table driving the UI.
 */
export const useNextEvents = (terminalId: string, rakeId?: string) => {
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: terminalKeys.nextEvents(terminalId, rakeId),
    queryFn: () => apis.getNextEvents({ terminalId, rakeId }),
    select: (res) => res.data.data,
    enabled: Boolean(terminalId),
    refetchInterval: BOARD_POLL_MS,
    placeholderData: (previous) => previous,
  });

  return {
    terminal: data?.terminal,
    rakes: data?.rakes,
    asOf: data?.asOf,
    isLoading,
    isFetching,
    isError,
  };
};
