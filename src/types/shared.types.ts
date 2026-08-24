/** The envelope every backend endpoint returns (see utils/api-response.ts). */
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}
