import type { PlanListApiResponse, PlanListItem } from '@/api/plans';
import { apiBaseUrl } from '@/config/env';

/**
 * Client-side plan list fetch.
 *
 * Originally a server function with Next.js ISR caching; in the Vite SPA it's a regular
 * `fetch()` to the same backend URL, and pages call it during render (the React component then
 * caches the result in state).
 */
export async function fetchPlanListForServer(): Promise<PlanListItem[]> {
  const base = apiBaseUrl.replace(/\/$/, '');
  if (!base) {
    return [];
  }

  const url = `${base}/plans/plan_list/`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Plans fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as PlanListApiResponse | PlanListItem[];
  if (Array.isArray((data as PlanListApiResponse).results)) {
    return (data as PlanListApiResponse).results ?? [];
  }
  if (Array.isArray(data)) {
    return data as PlanListItem[];
  }
  return [];
}
