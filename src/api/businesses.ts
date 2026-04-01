import axios from 'axios';
import type { CrystalWebsiteSetupPayload } from '../pages/crystal/gymClientSiteContent';
import { privateApi } from './interceptor';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';

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
  /** Maps link (e.g. Google Maps) when the API stores it separately from address. */
  location_map_url?: string;
  /** Crystal theme from GET (same shape as PATCH `website_theme`; may use accent_hex / dark_hex / text_hex). */
  website_theme?: CrystalWebsiteSetupPayload['theme'] | Record<string, unknown>;
  /** Crystal page JSON from GET (same shape as PATCH `website_content`). */
  website_content?: CrystalWebsiteSetupPayload['content'] | Record<string, unknown>;
  /** When the API exposes it, toggles listing / operational state (separate from subscription). */
  is_active?: boolean;
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

// —— Owner website analytics (Bearer; must own the business) ——

/** Per–lead-type counts: `events` = row count, `units` = sum of quantities. */
export type WebsiteLeadTypeStats = {
  events?: number;
  units?: number;
};

/**
 * Query preset for GET `/businesses/.../analytics/?range=` and `/businesses/analytics/?range=`.
 * Omit `range` for server default (10 days). Invalid preset → 400 with `allowed_presets`.
 */
export type AnalyticsRangePreset = '1d' | '3d' | '5d' | '10d' | '1m' | '3m';

export const ANALYTICS_RANGE_PRESETS: readonly AnalyticsRangePreset[] = ['1d', '3d', '5d', '10d', '1m', '3m'] as const;

export const ANALYTICS_RANGE_OPTIONS: { value: AnalyticsRangePreset; label: string }[] = [
  { value: '1d', label: '1 day (hourly)' },
  { value: '3d', label: '3 days' },
  { value: '5d', label: '5 days' },
  { value: '10d', label: '10 days' },
  { value: '1m', label: '30 days' },
  { value: '3m', label: '90 days' },
];

/**
 * WhatsApp block from `website_analytics_for_business`: period totals (today / 7d / 30d / 90d)
 * plus optional day/week/month series for 90d. Keys may be camelCase or snake_case.
 */
export type WebsiteAnalyticsWhatsapp = Record<string, unknown>;

/** One point in `line_graph` (gaps filled with zeros on the server). */
export type WebsiteAnalyticsLineGraphPoint = {
  period_start: string;
  events: number;
  units: number;
  /** Optional per–lead-type units (or nested stats) for multi-series lines. */
  by_lead_type?: Record<string, unknown>;
};

export type WebsiteAnalyticsTimeRange = {
  preset?: string;
  label?: string;
  start?: string;
  end?: string;
  bucket?: string;
  allowed_presets?: string[];
};

/** One site’s analytics payload from GET `/businesses/<slug>/analytics/?range=`. */
export type WebsiteAnalytics = {
  business: { slug: string; name?: string };
  whatsapp: WebsiteAnalyticsWhatsapp;
  /** All-time (unchanged by range). */
  leads_by_type: Record<string, unknown>;
  /** All-time (unchanged by range). */
  totals: { lead_events?: number; units?: number };
  computed_at: string;
  /** Window metadata when `range` is applied. */
  time_range?: WebsiteAnalyticsTimeRange;
  line_graph?: WebsiteAnalyticsLineGraphPoint[];
  totals_in_range?: { lead_events?: number; units?: number };
  leads_by_type_in_range?: Record<string, unknown>;
};

/** GET `/businesses/analytics/?range=` — one entry per owned business. */
export type AllWebsitesAnalyticsResponse = {
  websites: WebsiteAnalytics[];
  /** Echo of applied preset for the whole response. */
  range_applied?: string;
};

function analyticsAxiosError(e: unknown, fallback: string): Error {
  if (axios.isAxiosError(e) && e.response?.status === 400) {
    const body = e.response?.data;
    if (body && typeof body === 'object') {
      const allowed = (body as { allowed_presets?: unknown }).allowed_presets;
      if (Array.isArray(allowed) && allowed.length) {
        return new Error(`Invalid range. Allowed: ${allowed.join(', ')}`);
      }
    }
  }
  return new Error(getAxiosErrorMessage(e, fallback));
}

/**
 * All owned websites’ analytics. **GET** `/api/businesses/analytics/?range=<preset>` (same window for every site).
 */
export async function getAllWebsitesAnalytics(range?: AnalyticsRangePreset): Promise<WebsiteAnalytics[]> {
  try {
    const { data } = await privateApi.get<AllWebsitesAnalyticsResponse>(`${BASE}/analytics/`, {
      params: range ? { range } : {},
    });
    return Array.isArray(data?.websites) ? data.websites : [];
  } catch (e) {
    throw analyticsAxiosError(e, 'Failed to load analytics');
  }
}

/**
 * Single-site analytics. **GET** `/api/businesses/<slug>/analytics/?range=<preset>` — 404 if slug missing or not yours.
 */
export async function getBusinessWebsiteAnalytics(
  slug: string,
  options?: { range?: AnalyticsRangePreset }
): Promise<WebsiteAnalytics> {
  const key = slug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.get<WebsiteAnalytics>(`${BASE}/${encodeURIComponent(key)}/analytics/`, {
      params: options?.range ? { range: options.range } : {},
    });
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Business not found or you do not have access.');
    }
    throw analyticsAxiosError(e, 'Failed to load analytics');
  }
}

/** Public gym profile from GET /businesses/public/<slug>/ (no auth). */
export type PublicBusinessDetail = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  address?: string;
  /** Google Maps (or other) directions URL for the public client page. */
  location_map_url?: string;
  /** Public logo URL when the backend provides one; otherwise the client uses a bundled fallback. */
  logo_url?: string;
  /** When the API returns it, Crystal theme for the public page (accent / dark / text / light hex). */
  website_theme?: CrystalWebsiteSetupPayload['theme'] | Record<string, unknown>;
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
  try {
    const { data } = await publicApi.get<PublicBusinessDetail>(`${BASE}/public/${encodeURIComponent(slug)}/`);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      const body = e.response?.data as { detail?: string } | undefined;
      throw new PublicBusinessNotFoundError(slug, typeof body?.detail === 'string' ? body.detail : undefined);
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to load business'));
  }
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
  try {
    const { data } = await publicApi.get<ActiveSubscriptionResponse>(
      `${BASE}/${encodeURIComponent(slug)}/active-subscription/`
    );
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Failed to check subscription'));
  }
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
  try {
    const { data } = await publicApi.get<PublicCheckSlugResponse>(`${BASE}/check-slug/`, {
      params: { slug: normalized },
    });
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 400) {
      const body = e.response?.data as { error?: string; detail?: string } | undefined;
      throw new Error(body?.error ?? body?.detail ?? 'Invalid slug');
    }
    throw new Error(getAxiosErrorMessage(e, 'Slug check failed'));
  }
}

/**
 * Whether `slug` is free for a new gym public URL (`/:slug/`).
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

export type { CrystalWebsiteSetupPayload };

/**
 * Save the full Crystal website builder payload for the logged-in user.
 *
 * **POST** `/api/businesses/website-setup/` (see `VITE_API_BASE_URL`) — **Authorization: Bearer** required.
 * Request JSON body: {@link CrystalWebsiteSetupPayload}.
 */
export async function submitWebsiteSetupDraft(payload: CrystalWebsiteSetupPayload): Promise<void> {
  try {
    await privateApi.post(`${BASE}/website-setup/`, payload);
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Failed to save website setup'));
  }
}

/**
 * Partial update for a business owned by the current user.
 * JSON merge: omit keys you do not want to change.
 */
export type PatchBusinessRequest = {
  name?: string;
  slug?: string;
  description?: string;
  phone?: string;
  address?: string;
  location_map_url?: string;
  logo_url?: string;
  /** If the API supports toggling listing/subscription state separately from subscriptions */
  is_active?: boolean;
  /** Crystal theme JSON (accent / dark / text hex), same shape as website-setup `theme`. */
  website_theme?: CrystalWebsiteSetupPayload['theme'];
  /** Crystal public page model, same shape as website-setup `content`. */
  website_content?: CrystalWebsiteSetupPayload['content'];
};

/**
 * **PATCH** `/api/businesses/<slug>/` — Bearer required; must own the business.
 * Body: any subset of editable fields (merge). Returns the full business (e.g. incl. `subscriptions`) on **200**.
 */
export async function patchBusiness(businessSlug: string, body: PatchBusinessRequest): Promise<BusinessDetail> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.patch<BusinessDetail>(`${BASE}/${encodeURIComponent(key)}/`, body);
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Failed to update business'));
  }
}

/**
 * **PATCH** `/api/businesses/website-setup/` — same body as POST; updates existing Crystal setup (slug in payload identifies the business).
 */
export async function patchWebsiteSetupDraft(payload: CrystalWebsiteSetupPayload): Promise<void> {
  try {
    await privateApi.patch(`${BASE}/website-setup/`, payload);
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Failed to update website setup'));
  }
}
