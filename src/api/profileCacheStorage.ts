/**
 * Writes `/auth/me`-shaped profile JSON without importing `auth` or `protectedApi` (avoids circular deps).
 */
import { STORAGE_USER_PROFILE_CACHE } from '../config/storageKeys';
import { getAccessToken } from './tokens';

export function primeProfileCache(data: object): void {
  if (!getAccessToken() || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_USER_PROFILE_CACHE,
      JSON.stringify({ at: Date.now(), data })
    );
  } catch {
    /* quota / private mode */
  }
}
