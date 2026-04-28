/**
 * **Protected API layer** — sends Bearer access token and refreshes once on 401.
 * Use for owner/dashboard calls: businesses CRUD, payments, `/auth/me/`, etc.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { apiBaseUrl, authRefreshPath } from '@/config/env';
import { primeProfileCache } from '../profileCacheStorage';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
  clearTokens,
} from '../tokens';

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Coalesce concurrent 401 recoveries so parallel requests share one `POST /auth/refresh/` call. */
let accessTokenRefreshInFlight: Promise<string> | null = null;

async function refreshAccessTokenShared(): Promise<string> {
  if (accessTokenRefreshInFlight) return accessTokenRefreshInFlight;

  accessTokenRefreshInFlight = (async (): Promise<string> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw new Error('No refresh token');
    }
    const { data } = await axios.post(
      `${apiBaseUrl}${authRefreshPath}`,
      { refresh: refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const newAccessToken = data.access ?? data.access_token ?? data.accessToken ?? data.token;
    if (!newAccessToken) {
      clearTokens();
      throw new Error('No access token in refresh response');
    }

    setAccessToken(newAccessToken);
    const newRefresh = data.refresh ?? data.refresh_token ?? data.refreshToken;
    if (newRefresh) {
      setTokens(newAccessToken, newRefresh);
    }

    const refreshedCustomer = data.customer;
    if (refreshedCustomer && typeof refreshedCustomer === 'object') {
      primeProfileCache(refreshedCustomer as object);
    }

    return newAccessToken;
  })();

  try {
    return await accessTokenRefreshInFlight;
  } finally {
    accessTokenRefreshInFlight = null;
  }
}

export const protectedApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

protectedApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Instance default is `application/json`. That forces JSON serialization of the body, which turns
     * `FormData` into useless objects like `{ file: {}, asset_type: "gallery" }` and breaks uploads.
     * Omit Content-Type so the runtime sets `multipart/form-data` with the correct boundary.
     */
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

protectedApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retried) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    if (!getRefreshToken()) {
      clearTokens();
      return Promise.reject(error);
    }

    try {
      const newAccessToken = await refreshAccessTokenShared();
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return protectedApi(originalRequest);
    } catch {
      clearTokens();
      return Promise.reject(error);
    }
  }
);
