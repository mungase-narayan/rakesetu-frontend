import { useQuery } from '@tanstack/react-query';

import { apis } from './apis';
import { invitationKeys } from './query-keys';

/**
 * Validates a link before showing a password form.
 *
 * `retry: false` matters here: a dead token is a 400, and retrying it three
 * times just makes the person wait longer to be told the same thing.
 */
export const useInvitationPreview = (token: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: invitationKeys.preview(token),
    queryFn: () => apis.previewInvitation({ token }),
    select: (res) => res.data.data,
    enabled: Boolean(token),
    retry: false,
  });

  return { preview: data, isLoading, isError, error };
};

export const useResetPreview = (token: string) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: invitationKeys.reset(token),
    queryFn: () => apis.previewReset({ token }),
    select: (res) => res.data.data,
    enabled: Boolean(token),
    retry: false,
  });

  return { preview: data, isLoading, isError, error };
};
