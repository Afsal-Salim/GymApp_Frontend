/**
 * **Protected API layer** — sends Bearer access token and refreshes once on 401.
 * Use for owner/dashboard calls: businesses CRUD, payments, `/auth/me/`, etc.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { apiBaseUrl, authRefreshPath } from '../../config/env';
import { primeProfileCache } from '../profileCacheStorage';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
  clearTokens,
} from '../tokens';

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

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

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${apiBaseUrl}${authRefreshPath}`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newAccessToken =
        data.access ?? data.access_token ?? data.accessToken ?? data.token;
      if (!newAccessToken) {
        clearTokens();
        return Promise.reject(error);
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

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return protectedApi(originalRequest);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);
