import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type { ApiResponse } from '@/types/shared.types';
import type { Paginated } from '@/types/pagination.types';
import type {
  DocumentRow,
  DocumentType,
  DownloadUrlResponse,
  ListDocumentsQuery,
} from '@/types/master-data.types';

const endpoint = {
  documents: '/documents',
  upload: '/documents/upload',
  downloadUrl: (id: string) => `/documents/${id}/download-url`,
  document: (id: string) => `/documents/${id}`,
};

export interface UploadDocumentBody {
  file: File;
  type: DocumentType;
  title: string;
  number?: string;
  issuedOn?: string;
  effectiveFrom?: string;
  isCorpus?: boolean;
}

export const apis = {
  getDocuments: ({ params }: { params: ListDocumentsQuery }) =>
    apiRequest<ApiResponse<Paginated<DocumentRow>>>({
      url: endpoint.documents,
      method: REQUEST_METHOD.GET,
      params: params as unknown as Record<string, unknown>,
    }),

  uploadDocument: ({ data }: { data: UploadDocumentBody }) => {
    const form = new FormData();
    form.append('file', data.file);
    form.append('type', data.type);
    form.append('title', data.title);
    if (data.number) form.append('number', data.number);
    if (data.issuedOn) form.append('issuedOn', data.issuedOn);
    if (data.effectiveFrom) form.append('effectiveFrom', data.effectiveFrom);
    // Multipart carries strings; the API reads `"true"` as true.
    form.append('isCorpus', String(Boolean(data.isCorpus)));

    return apiRequest<ApiResponse<DocumentRow>>({
      url: endpoint.upload,
      method: REQUEST_METHOD.POST,
      isFormData: true,
      data: form as unknown as Record<string, unknown>,
    });
  },

  /**
   * Minted per click and never cached.
   *
   * `staleTime: 0` is not enough on its own — this is deliberately not a query
   * at all. A presigned URL is a fifteen-minute capability, and holding one in
   * a query cache is how a stale link ends up being handed to somebody twenty
   * minutes later.
   */
  getDownloadUrl: ({ id }: { id: string }) =>
    apiRequest<ApiResponse<DownloadUrlResponse>>({
      url: endpoint.downloadUrl(id),
      method: REQUEST_METHOD.GET,
    }),

  deleteDocument: ({ id }: { id: string }) =>
    apiRequest<ApiResponse<DocumentRow>>({
      url: endpoint.document(id),
      method: REQUEST_METHOD.DELETE,
    }),
};
