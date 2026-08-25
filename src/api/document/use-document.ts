import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apis } from './apis';
import { documentKeys } from './query-keys';
import type { UploadDocumentBody } from './apis';
import type { ListDocumentsQuery } from '@/types/master-data.types';

export const useDocumentList = (params: ListDocumentsQuery = {}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => apis.getDocuments({ params }),
    select: (res) => res.data.data,
  });

  return {
    documents: data?.data,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
};

export const useDocumentMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: documentKeys.lists() });

  const upload = useMutation({
    mutationFn: ({ data }: { data: UploadDocumentBody }) =>
      apis.uploadDocument({ data }),
    onSuccess: invalidate,
    retry: false,
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => apis.deleteDocument({ id }),
    onSuccess: invalidate,
    retry: false,
  });

  /**
   * A mutation rather than a query, on purpose. Fetching a download URL has no
   * cacheable result — the response is a short-lived capability, and the second
   * click must mint a second one rather than replay the first.
   */
  const downloadUrl = useMutation({
    mutationFn: ({ id }: { id: string }) => apis.getDownloadUrl({ id }),
    retry: false,
  });

  return {
    uploadDocument: upload.mutate,
    deleteDocument: remove.mutate,
    requestDownloadUrl: downloadUrl.mutateAsync,
    isUploading: upload.isPending,
    isLoading: upload.isPending || remove.isPending,
  };
};
