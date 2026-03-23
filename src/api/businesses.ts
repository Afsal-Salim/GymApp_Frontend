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

/** Public gym profile from GET /businesses/public/<slug>/ (no auth). */
export type PublicBusinessDetail = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  address?: string;
  /** Public logo URL when the backend provides one; otherwise the client uses a bundled fallback. */
  logo_url?: string;
  created_at: string;
  updated_at: string;
};

export class PublicBusinessNotFoundError extends Error {
  slug: string;

  constructor(slug: string, message?: string) {
    super(message ?? 'No business found for this slug.');
    this.name = 'PublicBusinessNotFoundError';
    this.slug = slug;
  }
}

/** Load basic business profile for the public client site. No owner or subscription fields. */
export async function getPublicBusinessBySlug(slug: string): Promise<PublicBusinessDetail> {
  const res = await fetch(`${API_BASE_URL}${BASE}/public/${encodeURIComponent(slug)}/`);
  if (res.status === 404) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new PublicBusinessNotFoundError(slug, typeof body.detail === 'string' ? body.detail : undefined);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? 'Failed to load business');
  }
  return res.json() as Promise<PublicBusinessDetail>;
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

/** Response from GET /businesses/check-slug/?slug= (public, no auth). */
export type PublicCheckSlugResponse = {
  slug: string;
  exists: boolean;
  available: boolean;
};

/**
 * Public slug check for create-business / create-website flows.
 * GET {API_BASE_URL}/businesses/check-slug/?slug=&lt;value&gt;
 */
export async function getPublicCheckSlug(slug: string): Promise<PublicCheckSlugResponse> {
  const normalized = slug.trim().toLowerCase();
  const url = `${API_BASE_URL}${BASE}/check-slug/?slug=${encodeURIComponent(normalized)}`;
  const res = await fetch(url);
  if (res.status === 400) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
    const msg = body.error ?? body.detail ?? 'Invalid slug';
    throw new Error(msg);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error ??
        (err as { detail?: string }).detail ??
        `Slug check failed (${res.status})`
    );
  }
  return res.json() as Promise<PublicCheckSlugResponse>;
}

/**
 * Whether `slug` is free for a new gym Crystal URL (`/crystal/:slug/`).
 *
 * 1) GET /businesses/check-slug/?slug= (public).
 * 2) On failure, falls back to GET /businesses/public/:slug/ (404 ⇒ available).
 */
export async function checkBusinessSlugAvailability(slug: string): Promise<{
  available: boolean;
  message?: string;
}> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return { available: false, message: 'Enter a site address.' };
  }
  if (!/^([a-z0-9]+(?:-[a-z0-9]+)*)$/.test(normalized)) {
    return {
      available: false,
      message: 'Use lowercase letters, numbers, and hyphens only (no spaces or special characters).',
    };
  }
  if (normalized.length < 2 || normalized.length > 48) {
    return { available: false, message: 'Use between 2 and 48 characters.' };
  }

  try {
    const data = await getPublicCheckSlug(normalized);
    return {
      available: Boolean(data.available),
      message: data.available ? undefined : 'This address is already taken.',
    };
  } catch (e) {
    const apiMsg = e instanceof Error ? e.message : '';
    if (apiMsg.includes('slug query parameter')) {
      return { available: false, message: apiMsg };
    }

    try {
      await getPublicBusinessBySlug(normalized);
      return { available: false, message: 'This URL is already taken by another gym.' };
    } catch (err) {
      if (err instanceof PublicBusinessNotFoundError) {
        return { available: true };
      }
      return {
        available: false,
        message: 'Could not verify availability. Try again.',
      };
    }
  }
}

/** Optional: persist setup wizard payload. Backend should accept the same shape as the session draft. */
export async function submitWebsiteSetupDraft(payload: unknown): Promise<void> {
  await privateApi.post(`${BASE}/website-setup/`, payload);
}
