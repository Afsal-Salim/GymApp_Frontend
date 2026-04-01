import { STORAGE_USER_PROFILE_CACHE } from '../config/storageKeys';
import type { UserProfile } from './auth';
import { getProfile } from './auth';
import { getAccessToken } from './tokens';

const MAX_AGE_MS = 10 * 60 * 1000;

type CachedPayload = {
  at: number;
  data: UserProfile;
};

/** Synchronous read for initial UI (e.g. User page) — same rules as cached fetch, no network. */
export function peekProfileCache(): UserProfile | null {
  return readCache();
}

function readCache(): UserProfile | null {
  if (!getAccessToken()) return null;
  const raw = localStorage.getItem(STORAGE_USER_PROFILE_CACHE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedPayload;
    if (typeof parsed.at !== 'number' || !parsed.data || typeof parsed.data !== 'object') return null;
    if (Date.now() - parsed.at > MAX_AGE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: UserProfile): void {
  if (!getAccessToken()) return;
  try {
    localStorage.setItem(STORAGE_USER_PROFILE_CACHE, JSON.stringify({ at: Date.now(), data } satisfies CachedPayload));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Returns cached `/auth/me/` when fresh (10 min) and a session exists; otherwise fetches and updates cache.
 * Use `{ force: true }` after login/signup. Cache is cleared when auth tokens are cleared (logout).
 */
export async function getProfileCached(options?: { force?: boolean }): Promise<UserProfile> {
  const force = options?.force === true;
  if (!force) {
    const hit = readCache();
    if (hit) return hit;
  }
  const data = await getProfile();
  writeCache(data);
  return data;
}
