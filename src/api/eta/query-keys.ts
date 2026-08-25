export const etaKeys = {
  all: ['eta'] as const,

  rake: (rakeId: string) => [...etaKeys.all, 'rake', rakeId] as const,
  sectionWeights: (wagonTypeCode?: string) =>
    [...etaKeys.all, 'section-weights', wagonTypeCode ?? 'default'] as const,
};
