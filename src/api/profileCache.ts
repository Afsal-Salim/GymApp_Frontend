import { STORAGE_USER_PROFILE_CACHE } from '@/config/storageKeys';
import type { LoginResponse, UserProfile } from './auth';
import { getProfile } from './auth';
import { getAccessToken } from './tokens';
import { primeProfileCache } from './profileCacheStorage';

/** Longer TTL reduces `/auth/me/` churn when moving between marketing and dashboard. */
const MAX_AGE_MS = 30 * 60 * 1000;

type CachedPayload = {
  at: number;
  data: UserProfile;
};

/** Synchronous read for initial UI (e.g. User page) — same rules as cached fetch, no network. */
export function peekProfileCache(): UserProfile | null {
  return readCache();
}

function readCache(): UserProfile | null {
  if (!getAccessToken() || typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_USER_PROFILE_CACHE);
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
  primeProfileCache(data);
}

function isCompleteCustomerPayload(v: unknown): v is UserProfile {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (typeof o.email !== 'string' || !o.email.trim()) return false;
  if (typeof o.username !== 'string' || !o.username.trim()) return false;
  if (typeof o.role !== 'number' || !Number.isFinite(o.role)) return false;
  if (typeof o.id !== 'number' || !Number.isFinite(o.id)) return false;
  return true;
}

function seedProfileCacheFromLoginCustomer(customer: unknown): boolean {
  if (!isCompleteCustomerPayload(customer)) return false;
  primeProfileCache(customer);
  return true;
}

/**
 * After `setTokens`: warm cache from `response.customer` when the API sends a full customer object,
 * otherwise fetch `/auth/me/`. **Await before navigating to `/user`** so the dashboard reads a warm
 * cache and avoids an empty-profile flash.
 */
export async function syncProfileCacheAfterLogin(
  response: Pick<LoginResponse, 'customer'>
): Promise<UserProfile | null> {
  const primed =
    response.customer != null && seedProfileCacheFromLoginCustomer(response.customer);
  try {
    return await getProfileCached({ force: !primed });
  } catch {
    return peekProfileCache();
  }
}

/**
 * Returns cached `/auth/me/` when fresh (30 min) and a session exists; otherwise fetches and updates cache.
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
