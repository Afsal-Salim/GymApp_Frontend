import { API_BASE_URL } from './config';
import { privateApi } from './interceptor';

const BASE = '/businesses';

/** Dummy slug for now – use this when calling the business detail API. */
export const DUMMY_BUSINESS_SLUG = 'qagym';

export type BusinessSubscription = {
  id: number;
  plan: number;
  plan_name: string;
  payment_id: string;
  subscription_start_date: string;
  subscription_end_date: string;
};

export type BusinessDetail = {
  id?: number;
  owner?: number;
  owner_email?: string;
  owner_username?: string;
  name?: string;
  slug?: string;
  description?: string;
  phone?: string;
  address?: string;
  subscriptions?: BusinessSubscription[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type BusinessListItem = BusinessDetail;

/** Backend paginated response: results + meta. */
export type BusinessListMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type BusinessListPaginatedResponse = {
  results: BusinessListItem[];
  meta: BusinessListMeta;
  /** Total count (same as meta.total) for compatibility. */
  count: number;
};

/** Raw API response shape. */
type BusinessListApiResponse = {
  results?: BusinessListItem[];
  meta?: Partial<BusinessListMeta>;
  count?: number;
  next?: string | null;
  previous?: string | null;
};

/** Fetch a page of businesses. Uses ?page= & page_size= query params. */
export async function getBusinessListPaginated(
  page: number,
  pageSize: number
): Promise<BusinessListPaginatedResponse> {
  const { data } = await privateApi.get<BusinessListApiResponse>(BASE + '/', {
    params: { page, page_size: pageSize },
  });
  const raw = data as BusinessListApiResponse;
  const results = Array.isArray(raw.results) ? raw.results : Array.isArray(data) ? (data as BusinessListItem[]) : [];
  const meta = raw.meta;
  const total = typeof meta?.total === 'number' ? meta.total : typeof raw.count === 'number' ? raw.count : results.length;
  const totalPages = typeof meta?.total_pages === 'number' ? meta.total_pages : Math.ceil(total / pageSize) || 1;
  const metaNormalized: BusinessListMeta = {
    page: typeof meta?.page === 'number' ? meta.page : page,
    page_size: typeof meta?.page_size === 'number' ? meta.page_size : pageSize,
    total,
    total_pages: totalPages,
    has_next: typeof meta?.has_next === 'boolean' ? meta.has_next : page < totalPages,
    has_previous: typeof meta?.has_previous === 'boolean' ? meta.has_previous : page > 1,
  };
  return { results, meta: metaNormalized, count: total };
}

/** List businesses for the current user (first page, 100 items). For full pagination use getBusinessListPaginated. */
export async function getBusinessList(): Promise<BusinessListItem[]> {
  const { results } = await getBusinessListPaginated(1, 100);
  return results;
}

export async function getBusinessDetail(slug: string): Promise<BusinessDetail> {
  const { data } = await privateApi.get<BusinessDetail>(`${BASE}/${slug}/`);
  return data;
}

/** Response from GET /businesses/:slug/active-subscription/ (no auth). */
export type ActiveSubscriptionResponse = {
  slug: string;
  has_active_subscription: boolean;
  subscription?: {
    id: number;
    plan_name: string;
    subscription_start_date: string;
    subscription_end_date: string;
  };
};

/** Check if a business has an active subscription. Public endpoint, no auth. */
export async function getActiveSubscription(slug: string): Promise<ActiveSubscriptionResponse> {
  const res = await fetch(`${API_BASE_URL}${BASE}/${encodeURIComponent(slug)}/active-subscription/`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? 'Failed to check subscription');
  }
  return res.json();
}
