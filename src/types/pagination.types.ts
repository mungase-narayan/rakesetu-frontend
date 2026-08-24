/**
 * The pagination envelope, mirroring the backend's
 * `src/types/pagination.types.ts` exactly.
 *
 * Kept in sync by hand because the two projects do not share a package. The
 * shapes have to agree — a list hook is typed from `Paginated<T>` and reads
 * `pagination.totalPages` straight out of the response, so a drift here is a
 * runtime `undefined` in a pager, not a compile error.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Query-string parameters every list endpoint accepts. */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
/** The backend clamps to this; sending more just wastes the round trip. */
export const MAX_LIMIT = 100;
