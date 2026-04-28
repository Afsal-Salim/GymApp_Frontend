/**
 * Legacy barrel: HTTP base URL and auth paths for modules that predate `src/config/env`.
 * Prefer importing from `src/config/env` in new code.
 */
export { apiBaseUrl as API_BASE_URL, authRefreshPath as REFRESH_ENDPOINT } from '@/config/env';
