import type {
  DistanceBasis,
  ListChargeableDistancesQuery,
  ListSectionsQuery,
  ListStationsQuery,
} from '@/types/master-data.types';

export const networkKeys = {
  all: ['network'] as const,

  stations: () => [...networkKeys.all, 'stations'] as const,
  stationList: (params: ListStationsQuery) =>
    [...networkKeys.stations(), params] as const,

  sections: () => [...networkKeys.all, 'sections'] as const,
  sectionList: (params: ListSectionsQuery) =>
    [...networkKeys.sections(), params] as const,

  distances: () => [...networkKeys.all, 'chargeable-distances'] as const,
  distanceList: (params: ListChargeableDistancesQuery) =>
    [...networkKeys.distances(), params] as const,

  distance: (from: string, to: string, basis: DistanceBasis) =>
    [...networkKeys.all, 'distance', from, to, basis] as const,
};
