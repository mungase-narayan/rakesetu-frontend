import { useState } from 'react';

import { useDebounce } from '@/hooks';
import { DEFAULT_LIMIT } from '@/types/pagination.types';
import type { ListAuditQuery } from '@/types/audit.types';

import { useAuditList } from './use-audit-list';

/** `2026-08-24` from a date input → the instant that day begins/ends in IST. */
const istDayStart = (date: string): string | undefined =>
  date ? new Date(`${date}T00:00:00+05:30`).toISOString() : undefined;

const istDayEnd = (date: string): string | undefined =>
  date ? new Date(`${date}T23:59:59.999+05:30`).toISOString() : undefined;

/**
 * The audit viewer's filter state.
 *
 * The date inputs are IST days converted to UTC instants before they reach the
 * API, which is the same discipline `IstTime` applies on the way out: the
 * product reads and writes IST, the wire and the database are UTC. Filtering
 * "today" against a UTC midnight would silently drop the first five and a half
 * hours of the Indian working day.
 */
export const useAuditFilters = () => {
  const [params, setParams] = useState<ListAuditQuery>({
    page: 1,
    limit: DEFAULT_LIMIT,
  });
  const [entityIdInput, setEntityIdInput] = useState('');
  const [correlationInput, setCorrelationInput] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const debouncedEntityId = useDebounce(entityIdInput, 350);
  const debouncedCorrelation = useDebounce(correlationInput, 350);

  const query: ListAuditQuery = {
    ...params,
    entityId: debouncedEntityId.trim() || undefined,
    correlationId: debouncedCorrelation.trim() || undefined,
    from: istDayStart(fromDate),
    to: istDayEnd(toDate),
  };

  const { entries, pagination, isLoading, isError } = useAuditList(query);

  const onEntityTypeChange = (entityType: string) =>
    setParams((p) => ({ ...p, entityType: entityType || undefined, page: 1 }));

  const onActionChange = (action: string) =>
    setParams((p) => ({ ...p, action: action || undefined, page: 1 }));

  const onActorChange = (actorId: string) =>
    setParams((p) => ({ ...p, actorId: actorId || undefined, page: 1 }));

  const onEntityIdChange = (entityId: string) => {
    setEntityIdInput(entityId);
    setParams((p) => ({ ...p, page: 1 }));
  };

  /** Set by the click-to-filter button on a correlation-id cell. */
  const onCorrelationChange = (correlationId: string) => {
    setCorrelationInput(correlationId);
    setParams((p) => ({ ...p, page: 1 }));
  };

  const onFromChange = (date: string) => {
    setFromDate(date);
    setParams((p) => ({ ...p, page: 1 }));
  };

  const onToChange = (date: string) => {
    setToDate(date);
    setParams((p) => ({ ...p, page: 1 }));
  };

  const onPageChange = (page: number) => setParams((p) => ({ ...p, page }));

  const onClearFilters = () => {
    setEntityIdInput('');
    setCorrelationInput('');
    setFromDate('');
    setToDate('');
    setParams({ page: 1, limit: DEFAULT_LIMIT });
  };

  const hasFilters = Boolean(
    params.entityType ||
    params.action ||
    params.actorId ||
    debouncedEntityId.trim() ||
    debouncedCorrelation.trim() ||
    fromDate ||
    toDate
  );

  return {
    entries,
    pagination,
    isLoading,
    isError,
    entityType: params.entityType ?? '',
    action: params.action ?? '',
    actorId: params.actorId ?? '',
    entityId: entityIdInput,
    correlationId: correlationInput,
    fromDate,
    toDate,
    hasFilters,
    onEntityTypeChange,
    onActionChange,
    onActorChange,
    onEntityIdChange,
    onCorrelationChange,
    onFromChange,
    onToChange,
    onClearFilters,
    onPageChange,
  };
};
