/**
 * Axios instance for authenticated requests.
 * Uses access token from localStorage (set on login) as Bearer token.
 * On 401, retries once after refreshing the access token using the refresh token from localStorage.
 */
import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, REFRESH_ENDPOINT } from './config';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokens,
  clearTokens,
} from './tokens';

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const privateApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

privateApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateApi.interceptors.response.use(
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
        `${API_BASE_URL}${REFRESH_ENDPOINT}`,
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

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return privateApi(originalRequest);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);
