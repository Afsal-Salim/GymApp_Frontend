import type { PlanListApiResponse, PlanListItem } from '@/api/plans';

/**
 * Server-only plan list fetch with Next.js Data Cache (ISR).
 * Uses absolute API URL — same env as `publicApi` (`NEXT_PUBLIC_API_BASE_URL` / `VITE_API_BASE_URL`).
 */
export async function fetchPlanListForServer(): Promise<PlanListItem[]> {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '')
    .trim()
    .replace(/\/$/, '');
  if (!base) {
    return [];
  }

  const url = `${base}/plans/plan_list/`;
  const res = await fetch(url, {
    next: { revalidate: 60 },
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
