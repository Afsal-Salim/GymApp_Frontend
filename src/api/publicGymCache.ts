import { STORAGE_PUBLIC_GYM_BUNDLE_CACHE } from '../config/storageKeys';
import type { ActiveSubscriptionResponse, PublicBusinessDetail } from './businesses';
import { getActiveSubscription, getPublicBusinessBySlug, normalizeActiveSubscriptionResponse } from './businesses';

const MAX_AGE_MS = 10 * 60 * 1000;
const MAX_SLUGS = 32;

type Bundle = {
  business: PublicBusinessDetail;
  subscription: ActiveSubscriptionResponse;
};

type Entry = {
  at: number;
  business: PublicBusinessDetail;
  subscription: ActiveSubscriptionResponse;
};

type Store = {
  entries: Record<string, Entry>;
};

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function readStore(): Store {
  const raw = localStorage.getItem(STORAGE_PUBLIC_GYM_BUNDLE_CACHE);
  if (!raw) return { entries: {} };
  try {
    const parsed = JSON.parse(raw) as Store;
    if (!parsed.entries || typeof parsed.entries !== 'object') return { entries: {} };
    return { entries: parsed.entries };
  } catch {
    return { entries: {} };
  }
}

function pruneOldest(entries: Record<string, Entry>): Record<string, Entry> {
  const keys = Object.keys(entries);
  if (keys.length <= MAX_SLUGS) return entries;
  const sorted = keys.sort((a, b) => entries[a].at - entries[b].at);
  const drop = sorted.slice(0, keys.length - MAX_SLUGS);
  const next = { ...entries };
  for (const k of drop) delete next[k];
  return next;
}

function writeEntry(slugKey: string, entry: Entry): void {
  try {
    const store = readStore();
    const entries = pruneOldest({ ...store.entries, [slugKey]: entry });
    localStorage.setItem(STORAGE_PUBLIC_GYM_BUNDLE_CACHE, JSON.stringify({ entries } satisfies Store));
  } catch {
    /* quota */
  }
}

/** Synchronous read for first paint — no network. */
export function peekPublicGymBundle(slug: string): Bundle | null {
  const key = normalizeSlug(slug);
  if (!key) return null;
  const { entries } = readStore();
  const ent = entries[key];
  if (!ent || Date.now() - ent.at > MAX_AGE_MS) return null;
  return {
    business: ent.business,
    subscription: normalizeActiveSubscriptionResponse(ent.subscription, key),
  };
}

/**
 * Cached public gym data: GET `/businesses/public/:slug/` + active-subscription.
 * Reuses fresh cache for 10 minutes so revisiting the same gym URL avoids duplicate requests and loading flashes.
 */
export async function fetchPublicGymBundle(slug: string, options?: { force?: boolean }): Promise<Bundle> {
  const key = normalizeSlug(slug);
  if (!key) throw new Error('Business slug is required.');
  const force = options?.force === true;
  if (!force) {
    const hit = peekPublicGymBundle(key);
    if (hit) return hit;
  }
  const business = await getPublicBusinessBySlug(key);
  const subscription = await getActiveSubscription(key);
  writeEntry(key, { at: Date.now(), business, subscription });
  return { business, subscription };
}

/** Drop one slug after owner publishes changes (optional); TTL usually enough. */
export function invalidatePublicGymBundleCache(slug: string): void {
  const key = normalizeSlug(slug);
  if (!key) return;
  try {
    const store = readStore();
    if (!store.entries[key]) return;
    const entries = { ...store.entries };
    delete entries[key];
    localStorage.setItem(STORAGE_PUBLIC_GYM_BUNDLE_CACHE, JSON.stringify({ entries } satisfies Store));
  } catch {
    /* ignore */
  }
}
