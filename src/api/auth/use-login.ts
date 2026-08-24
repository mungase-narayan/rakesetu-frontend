import { useMutation } from '@tanstack/react-query';

import { apis } from './apis';
import type { LoginBody } from '@/types/user.types';

export const useLogin = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }: { data: LoginBody }) => apis.login({ data }),
    retry: false,
  });

  return { isLoading: isPending, login: mutate };
};
