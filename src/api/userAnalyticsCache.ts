import { STORAGE_USER_ANALYTICS_CACHE } from '@/config/storageKeys';
import type { AnalyticsRangePreset, WebsiteAnalytics } from './businesses';
import { getAllWebsitesAnalytics, getBusinessWebsiteAnalytics } from './businesses';
import { getAccessToken } from './tokens';

const MAX_AGE_MS = 10 * 60 * 1000;
const MAX_KEYS = 32;

type EntryAll = { at: number; kind: 'all'; data: WebsiteAnalytics[] };
type EntrySite = { at: number; kind: 'site'; data: WebsiteAnalytics };
type Entry = EntryAll | EntrySite;

type Store = { entries: Record<string, Entry> };

function readStore(): Store {
  if (typeof window === 'undefined') return { entries: {} };
  const raw = window.localStorage.getItem(STORAGE_USER_ANALYTICS_CACHE);
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

function writeEntry(key: string, entry: Entry): void {
  if (!getAccessToken() || typeof window === 'undefined') return;
  try {
    const store = readStore();
    const entries = prune({
      ...store.entries,
      [key]: entry,
    });
    window.localStorage.setItem(STORAGE_USER_ANALYTICS_CACHE, JSON.stringify({ entries } satisfies Store));
  } catch {
    /* quota */
  }
}

function rangeKey(range: AnalyticsRangePreset | undefined): string {
  return range ?? 'default';
}

function keyAll(range: AnalyticsRangePreset | undefined): string {
  return `all:${rangeKey(range)}`;
}

function keySite(slug: string, range: AnalyticsRangePreset | undefined): string {
  return `site:${slug.trim().toLowerCase()}:${rangeKey(range)}`;
}

function isFresh(ent: Entry | undefined): ent is Entry {
  return Boolean(ent && Date.now() - ent.at <= MAX_AGE_MS);
}

/** Sync read for first paint on Analytics tab — no network. */
export function peekAllWebsitesAnalytics(range?: AnalyticsRangePreset): WebsiteAnalytics[] | null {
  if (!getAccessToken()) return null;
  const ent = readStore().entries[keyAll(range)];
  if (!isFresh(ent) || ent.kind !== 'all') return null;
  return ent.data;
}

/** Sync read for Manage page first paint. */
export function peekBusinessWebsiteAnalytics(
  slug: string,
  range?: AnalyticsRangePreset
): WebsiteAnalytics | null {
  if (!getAccessToken()) return null;
  const ent = readStore().entries[keySite(slug, range)];
  if (!isFresh(ent) || ent.kind !== 'site') return null;
  return ent.data;
}

/**
 * Cached GET `/businesses/analytics/?range=` (10 min TTL) while logged in.
 * Cleared on logout with {@link invalidateUserAnalyticsCache}.
 */
export async function getAllWebsitesAnalyticsCached(
  range?: AnalyticsRangePreset,
  options?: { force?: boolean }
): Promise<WebsiteAnalytics[]> {
  const k = keyAll(range);
  const force = options?.force === true;
  if (!force) {
    const ent = readStore().entries[k];
    if (isFresh(ent) && ent.kind === 'all') return ent.data;
  }
  const data = await getAllWebsitesAnalytics(range);
  writeEntry(k, { at: Date.now(), kind: 'all', data });
  return data;
}

/**
 * Cached GET `/businesses/<slug>/analytics/?range=` (10 min TTL) while logged in.
 */
export async function getBusinessWebsiteAnalyticsCached(
  slug: string,
  options?: { range?: AnalyticsRangePreset; force?: boolean }
): Promise<WebsiteAnalytics> {
  const range = options?.range;
  const force = options?.force === true;
  const k = keySite(slug, range);
  if (!force) {
    const ent = readStore().entries[k];
    if (isFresh(ent) && ent.kind === 'site') return ent.data;
  }
  const data = await getBusinessWebsiteAnalytics(slug, { range });
  writeEntry(k, { at: Date.now(), kind: 'site', data });
  return data;
}

export function invalidateUserAnalyticsCache(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_USER_ANALYTICS_CACHE);
  } catch {
    /* ignore */
  }
}
