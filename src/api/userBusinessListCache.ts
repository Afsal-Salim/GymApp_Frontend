import { STORAGE_USER_BUSINESS_LIST_CACHE } from '@/config/storageKeys';
import type { BusinessDetail, BusinessListPaginatedResponse } from './businesses';
import { getBusinessListPaginated } from './businesses';
import { getAccessToken } from './tokens';

const MAX_AGE_MS = 10 * 60 * 1000;
const MAX_KEYS = 24;

function cacheKey(page: number, pageSize: number): string {
  return `${page}:${pageSize}`;
}

type Entry = {
  at: number;
  data: BusinessListPaginatedResponse;
};

type Store = {
  entries: Record<string, Entry>;
};

function readStore(): Store {
  if (typeof window === 'undefined') return { entries: {} };
  const raw = window.localStorage.getItem(STORAGE_USER_BUSINESS_LIST_CACHE);
  if (!raw) return { entries: {} };
  try {
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.entries || typeof parsed.entries !== 'object') return { entries: {} };
    return { entries: parsed.entries };
  } catch {
    return { entries: {} };
  }
}

function prune(entries: Record<string, Entry>): Record<string, Entry> {
  const keys = Object.keys(entries);
  if (keys.length <= MAX_KEYS) return entries;
  const sorted = keys.sort((a, b) => entries[a].at - entries[b].at);
  const drop = sorted.slice(0, keys.length - MAX_KEYS);
  const next = { ...entries };
  for (const k of drop) delete next[k];
  return next;
}

function writeEntry(key: string, data: BusinessListPaginatedResponse): void {
  if (!getAccessToken() || typeof window === 'undefined') return;
  try {
    const store = readStore();
    const entries = prune({
      ...store.entries,
      [key]: { at: Date.now(), data } satisfies Entry,
    });
    window.localStorage.setItem(STORAGE_USER_BUSINESS_LIST_CACHE, JSON.stringify({ entries } satisfies Store));
  } catch {
    /* quota */
  }
}

/** Sync read for User page first paint — no network. */
export function peekBusinessListPage(page: number, pageSize: number): BusinessListPaginatedResponse | null {
  if (!getAccessToken()) return null;
  const key = cacheKey(page, pageSize);
  const { entries } = readStore();
  const ent = entries[key];
  if (!ent || Date.now() - ent.at > MAX_AGE_MS) return null;
  return ent.data;
}

/**
 * Finds a row across all in-TTL cached list pages (same store as {@link peekBusinessListPage}).
 * Used to prefill Website settings from the profile list without waiting for detail APIs.
 */
export function peekBusinessListItemBySlug(slug: string): BusinessDetail | null {
  const key = slug.trim().toLowerCase();
  if (!key || !getAccessToken()) return null;
  const now = Date.now();
  const { entries } = readStore();
  for (const ent of Object.values(entries)) {
    if (now - ent.at > MAX_AGE_MS) continue;
    const row = ent.data.results.find((b) => (b.slug ?? '').trim().toLowerCase() === key);
    if (row) return row;
  }
  return null;
}

/**
 * Cached GET `/businesses/?page=&page_size=` (10 min TTL) while logged in.
 * Cleared when auth tokens are cleared (logout).
 */
export async function getBusinessListPaginatedCached(
  page: number,
  pageSize: number,
  options?: { force?: boolean }
): Promise<BusinessListPaginatedResponse> {
  const key = cacheKey(page, pageSize);
  const force = options?.force === true;
  if (!force) {
    const hit = peekBusinessListPage(page, pageSize);
    if (hit) return hit;
  }
  const data = await getBusinessListPaginated(page, pageSize);
  writeEntry(key, data);
  return data;
}

/** Call after creating/updating a business if you need the list fresh before TTL expires. */
export function invalidateUserBusinessListCache(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_USER_BUSINESS_LIST_CACHE);
  } catch {
    /* ignore */
  }
}
