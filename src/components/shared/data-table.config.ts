import {
  columnVisibilityFeature,
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';

/**
 * The feature set every list screen in RakeSetu gets.
 *
 * v9 makes features opt-in, and the omissions are the interesting part.
 * There is **no pagination feature**: the rows handed to this component are one
 * server page, and a client pager would count the twenty rows in memory rather
 * than the four thousand in the tenant — wrong in a way that looks right until
 * someone reaches page two. `<TablePagination>` reads the server's envelope
 * instead. Filtering is absent for the same reason: filters are query
 * parameters, answered by Postgres over the whole set.
 *
 * Sorting **is** here, and is honestly scoped: it reorders the page in hand.
 * A screen that needs the whole result set ordered passes `sort`/`order` to
 * its query and lets the backend's validated ORDER BY do it.
 */
export const TABLE_FEATURES = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnVisibilityFeature,
});

export type TableFeaturesType = typeof TABLE_FEATURES;

/** The column-definition type screens declare. */
export type RakeSetuColumnDef<TData extends RowData> = ColumnDef<
  TableFeaturesType,
  TData,
  // Column values are heterogeneous by construction — a name cell renders a
  // string, a roles cell an array. `unknown` here would force a cast at every
  // accessor; the type safety that matters is on TData, which is preserved.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>;

/** Bound helper so screens get inference without repeating the feature type. */
export const columnHelper = <TData extends RowData>() =>
  createColumnHelper<TableFeaturesType, TData>();
