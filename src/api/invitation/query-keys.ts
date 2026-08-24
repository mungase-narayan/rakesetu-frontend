export const invitationKeys = {
  all: ['invitation'] as const,
  preview: (token: string) =>
    [...invitationKeys.all, 'preview', token] as const,
  reset: (token: string) => [...invitationKeys.all, 'reset', token] as const,
};
