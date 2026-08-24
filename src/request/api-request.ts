import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';

import store, { logout, setAccessToken } from '@/store';
import { errorToast } from '@/lib/toast.lib';
import { appEnv, ERROR_MESSAGE } from '@/constants';
import { ROUTES } from '@/routes/route-paths';
import type { APIRequestMethodType } from '@/types/api-request.types';
import type { ApiResponse } from '@/types/shared.types';
import type { RefreshResponse } from '@/types/user.types';

export const performLogout = (): void => {
  store.dispatch(logout());
  // A full document load, not a router navigate: this runs from an axios
  // interceptor that has no router context, and a hard reload is also the
  // surest way to drop any component state built on the dead session.
  window.location.href = ROUTES.auth.login;
};

export const axiosInstance = axios.create({
  baseURL: appEnv.BACKEND_BASE_URL,
  // Required: the refresh token lives in an httpOnly cookie and is the only
  // copy that exists. Without this the browser never sends it and every
  // session ends at the first expiry.
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = store.getState().auth.tokens?.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type ApiErrorBody = {
  message?: string;
  errors?: Array<Record<string, string>>;
};

/** Marks a request that has already been retried, so a loop is impossible. */
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

const formatFieldErrors = (errors?: Array<Record<string, string>>): string => {
  if (!Array.isArray(errors) || errors.length === 0) return '';
  return errors
    .map((entry) => {
      const [field, msg] = Object.entries(entry)[0] ?? [];
      if (!field || !msg) return '';
      return field === 'error' ? `• ${msg}` : `• ${field}: ${msg}`;
    })
    .filter(Boolean)
    .join('\n');
};

/**
 * The in-flight refresh, if there is one.
 *
 * A dashboard fires six queries at once. When the access token expires they all
 * 401 together, and without this every one of them would start its own refresh:
 * six round trips, and — once rotation lands in Phase 13 — five of them
 * presenting a token the first has already rotated away, which reuse detection
 * would correctly read as a stolen token and respond to by killing the session.
 * Single-flight is not an optimisation here; it is what keeps the session alive.
 */
let refreshInFlight: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  refreshInFlight ??= axios
    .post<ApiResponse<RefreshResponse>>(
      `${appEnv.BACKEND_BASE_URL}/users/refresh`,
      {},
      // A bare axios call, not axiosInstance: going through the instance would
      // put this response back through the interceptor below, so a failed
      // refresh would try to refresh itself.
      { withCredentials: true }
    )
    .then((response) => {
      const accessToken = response.data.data.accessToken;
      store.dispatch(setAccessToken(accessToken));
      return accessToken;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    if (!error.response) {
      errorToast({ message: ERROR_MESSAGE.NETWORK_ERROR });
      return Promise.reject(error);
    }

    if (error.response.status === 401 && config && !config._retried) {
      config._retried = true;

      try {
        const accessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
        // Replay the original request. From the caller's point of view the
        // expiry never happened — no toast, no redirect, no lost page state.
        return axiosInstance(config);
      } catch {
        // The refresh itself failed, so the session is genuinely over.
        performLogout();
        errorToast({ message: ERROR_MESSAGE.JWT_EXPIRED });
        return Promise.reject(error);
      }
    }

    if (error.response.status === 401) {
      performLogout();
      errorToast({ message: ERROR_MESSAGE.JWT_EXPIRED });
      return Promise.reject(error);
    }

    // 403 is deliberately NOT refreshed. The token is fine; the permission is
    // missing. Refreshing it would produce an identical token and a second 403.
    const body = (error.response.data as ApiErrorBody) ?? {};
    const baseMessage = body.message || ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    const fieldDetails = formatFieldErrors(body.errors);
    const message = fieldDetails
      ? `${baseMessage}\n${fieldDetails}`
      : baseMessage;
    errorToast({ message });

    return Promise.reject(error);
  }
);

interface RequestConfig extends Omit<AxiosRequestConfig, 'url' | 'method'> {
  url: string;
  method: APIRequestMethodType;
  data?: Record<string, unknown> | FormData;
  params?: Record<string, unknown>;
  isFormData?: boolean;
}

export const apiRequest = <T = unknown>({
  url,
  data = {},
  params = {},
  isFormData,
  method,
  ...rest
}: RequestConfig): Promise<AxiosResponse<T>> => {
  return axiosInstance({
    url,
    method,
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
    params,
    data,
    ...rest,
  });
};

/**
 * Axios instance for PUBLIC (unauthenticated) endpoints. It still forwards a
 * token when one happens to exist, but deliberately has NO response
 * interceptor — so an expected error does not fire a global error toast, force
 * a logout redirect, or start a refresh. Callers handle those errors locally.
 */
export const publicAxiosInstance = axios.create({
  baseURL: appEnv.BACKEND_BASE_URL,
  withCredentials: true,
});

publicAxiosInstance.interceptors.request.use((config) => {
  const accessToken = store.getState().auth.tokens?.accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const publicApiRequest = <T = unknown>({
  url,
  data = {},
  params = {},
  isFormData,
  method,
  ...rest
}: RequestConfig): Promise<AxiosResponse<T>> => {
  return publicAxiosInstance({
    url,
    method,
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
    params,
    data,
    ...rest,
  });
};
