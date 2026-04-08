import axios from 'axios';
import type { CrystalWebsiteSetupPayload } from '../ui-pages/crystal/gymClientSiteContent';
import { privateApi } from './interceptor';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';

const BASE = '/businesses';

/**
 * Owner list endpoints accept `search` or `q` with identical behavior (case-insensitive OR across
 * documented fields). We always send `search` after normalizing.
 */
function ownerListSearchQuery(params: { search?: string; q?: string }): { search: string } | Record<string, never> {
  const term = params.search?.trim() || params.q?.trim();
  return term ? { search: term } : {};
}

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
  /**
   * From `GET`/`POST .../record-status/` — soft delete vs live. Use remove/restore actions in the UI;
   * do not show this as a user-facing “record status” label.
   */
  record_status?: 'active' | 'inactive';
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

const OWNER_LIST_PAGE_SIZE_MAX = 100;

function clampOwnerListPageSize(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 10;
  return Math.min(Math.floor(n), OWNER_LIST_PAGE_SIZE_MAX);
}

/** Parses `{ results, meta: { page, page_size, total, ... } }` (owner list endpoints). */
function parseMetaResultsList<T>(
  data: unknown,
  page: number,
  pageSize: number
): { results: T[]; meta: BusinessListMeta; count: number } {
  const raw = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const results = Array.isArray(raw.results) ? (raw.results as T[]) : [];
  const meta = raw.meta as Partial<BusinessListMeta> | undefined;
  const total =
    typeof meta?.total === 'number' ? meta.total
    : typeof raw.count === 'number' ? raw.count
    : results.length;
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

// —— Owner modal crystal leads (join_now, book_free_trial, plan_visit only on list) ——

export type ModalCrystalLeadType = 'join_now' | 'book_free_trial' | 'plan_visit';

export type OwnerCrystalLeadItem = {
  id: number;
  lead_type: string;
  /** JSON saved from the public POST; shape depends on client. */
  payload?: Record<string, unknown>;
  quantity?: number;
  submitted_at_ms?: number;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type OwnerCrystalLeadsListParams = {
  page?: number;
  page_size?: number;
  lead_type?: ModalCrystalLeadType;
  /** Omit → only active rows (server default). */
  record_status?: 'active' | 'inactive';
  /**
   * Case-insensitive OR across payload `name`, `email`, `message`, and `notes`.
   * Same as `q` (either query param name is accepted by the API).
   */
  search?: string;
  q?: string;
};

/**
 * **GET** `/api/businesses/<slug>/crystal-leads/` — Bearer; owner.
 *
 * Query: `lead_type` (join_now | book_free_trial | plan_visit), optional `record_status`,
 * `search` or `q` (same behavior), `page`, `page_size`. Search applies after type/record filters;
 * matches string fields in payload: name, email, message, notes.
 */
export async function getBusinessCrystalLeadsPaginated(
  businessSlug: string,
  params: OwnerCrystalLeadsListParams = {}
): Promise<{ results: OwnerCrystalLeadItem[]; meta: BusinessListMeta; count: number }> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  const page = params.page && params.page >= 1 ? params.page : 1;
  const page_size = clampOwnerListPageSize(params.page_size ?? 10);
  try {
    const { data } = await privateApi.get(`${BASE}/${encodeURIComponent(key)}/crystal-leads/`, {
      params: {
        page,
        page_size,
        ...(params.lead_type ? { lead_type: params.lead_type } : {}),
        ...(params.record_status ? { record_status: params.record_status } : {}),
        ...ownerListSearchQuery(params),
      },
    });
    return parseMetaResultsList<OwnerCrystalLeadItem>(data, page, page_size);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Business not found or you do not have access.');
    }
    if (axios.isAxiosError(e) && e.response?.status === 400) {
      const body = e.response?.data as { detail?: string } | undefined;
      throw new Error(typeof body?.detail === 'string' ? body.detail : 'Invalid filter.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to load crystal leads'));
  }
}

/**
 * **GET** `/api/businesses/<slug>/crystal-leads/<id>/` — Bearer; owner.
 */
export async function getBusinessCrystalLeadDetail(
  businessSlug: string,
  id: number
): Promise<OwnerCrystalLeadItem> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.get<OwnerCrystalLeadItem>(
      `${BASE}/${encodeURIComponent(key)}/crystal-leads/${id}/`
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Lead not found or you do not have access.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to load lead'));
  }
}

export type PatchOwnerCrystalLeadBody = {
  record_status: 'active' | 'inactive';
};

/**
 * **PATCH** `/api/businesses/<slug>/crystal-leads/<id>/` — Bearer; owner.
 */
export async function patchBusinessCrystalLead(
  businessSlug: string,
  id: number,
  body: PatchOwnerCrystalLeadBody
): Promise<OwnerCrystalLeadItem> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.patch<OwnerCrystalLeadItem>(
      `${BASE}/${encodeURIComponent(key)}/crystal-leads/${id}/`,
      body
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Lead not found or you do not have access.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to update lead'));
  }
}

// —— Owner business enquiries (BusinessEnquiry) ——

export type BusinessEnquiryItem = {
  id: number;
  /** Present on create response when the API includes it. */
  business?: number;
  name: string;
  email: string;
  message: string;
  enquiry_status: 'open' | 'resolved';
  created_at: string;
  updated_at: string;
};

export type BusinessEnquiriesListParams = {
  page?: number;
  page_size?: number;
  enquiry_status?: 'open' | 'resolved';
  /** Omit → only active rows (server default). */
  record_status?: 'active' | 'inactive';
  /**
   * Case-insensitive OR across `name`, `email`, and `message`.
   * Same as `q` (either query param name is accepted by the API).
   */
  search?: string;
  q?: string;
};

export type PostPublicBusinessEnquiryBody = {
  name: string;
  email: string;
  message: string;
};

/**
 * **POST** `/api/businesses/public/<slug>/enquiries/` — no auth.
 *
 * Body: JSON `{ name, email, message }` (message min ~3 chars after trim).
 * **201** — `{ id, business?, name, email, message, enquiry_status, created_at, updated_at }` (no `record_status`).
 * Inactive slug → **404**.
 */
export async function postPublicBusinessEnquiry(
  slug: string,
  body: PostPublicBusinessEnquiryBody
): Promise<BusinessEnquiryItem> {
  const key = slug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await publicApi.post<BusinessEnquiryItem>(
      `${BASE}/public/${encodeURIComponent(key)}/enquiries/`,
      {
        name: body.name.trim(),
        email: body.email.trim(),
        message: body.message.trim(),
      }
    );
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not send enquiry'));
  }
}

/**
 * **GET** `/api/businesses/<slug>/enquiries/` — Bearer; owner.
 *
 * Query: `enquiry_status`, optional `record_status`, `search` or `q` (same behavior), `page`, `page_size`.
 * Search runs after status/record filters; case-insensitive OR across name, email, message.
 */
export async function getBusinessEnquiriesPaginated(
  businessSlug: string,
  params: BusinessEnquiriesListParams = {}
): Promise<{ results: BusinessEnquiryItem[]; meta: BusinessListMeta; count: number }> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  const page = params.page && params.page >= 1 ? params.page : 1;
  const page_size = clampOwnerListPageSize(params.page_size ?? 10);
  try {
    const { data } = await privateApi.get(`${BASE}/${encodeURIComponent(key)}/enquiries/`, {
      params: {
        page,
        page_size,
        ...(params.enquiry_status ? { enquiry_status: params.enquiry_status } : {}),
        ...(params.record_status ? { record_status: params.record_status } : {}),
        ...ownerListSearchQuery(params),
      },
    });
    return parseMetaResultsList<BusinessEnquiryItem>(data, page, page_size);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Business not found or you do not have access.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to load enquiries'));
  }
}

/**
 * **GET** `/api/businesses/<slug>/enquiries/<id>/` — Bearer; owner.
 */
export async function getBusinessEnquiryDetail(businessSlug: string, id: number): Promise<BusinessEnquiryItem> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.get<BusinessEnquiryItem>(
      `${BASE}/${encodeURIComponent(key)}/enquiries/${id}/`
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Enquiry not found or you do not have access.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to load enquiry'));
  }
}

export type PatchBusinessEnquiryBody = {
  enquiry_status?: 'open' | 'resolved';
};

/**
 * **PATCH** `/api/businesses/<slug>/enquiries/<id>/` — Bearer; owner; partial OK.
 */
export async function patchBusinessEnquiry(
  businessSlug: string,
  id: number,
  body: PatchBusinessEnquiryBody
): Promise<BusinessEnquiryItem> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.patch<BusinessEnquiryItem>(
      `${BASE}/${encodeURIComponent(key)}/enquiries/${id}/`,
      body
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Enquiry not found or you do not have access.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to update enquiry'));
  }
}

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

/** Starter block from GET `/businesses/<slug>/first-recharge/` (owner only). */
export type BusinessFirstRechargeStarter = {
  plan_id: number;
  list_price: string;
  first_recharge_price: string | null;
  currency: string;
  /** Amount create-order would charge today for Starter. */
  applicable_price: string;
};

export type BusinessFirstRechargeResponse = {
  slug: string;
  is_first_recharge: boolean;
  has_had_subscription: boolean;
  starter: BusinessFirstRechargeStarter | null;
};

/**
 * **GET** `/api/businesses/<slug>/first-recharge/` — Bearer; owner only. Inactive site → **404**.
 * Aligns with create-order first activation vs list pricing.
 */
export async function getBusinessFirstRecharge(businessSlug: string): Promise<BusinessFirstRechargeResponse> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.get<BusinessFirstRechargeResponse>(
      `${BASE}/${encodeURIComponent(key)}/first-recharge/`
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Business not found or you do not have access.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to load billing preview'));
  }
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
  /** Saved Crystal page JSON (nav, gallery captions, etc.) when the public profile includes it. */
  website_content?: CrystalWebsiteSetupPayload['content'] | Record<string, unknown>;
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

/** `plan_tier` on GET `/businesses/<slug>/active-subscription/` (public). */
export type ActiveSubscriptionPlanTier = 'trial' | 'starter' | 'pro' | 'other';

export type ActiveSubscriptionPlanFeature = { id: number; name: string };

export type ActiveSubscriptionPlanDetail = {
  id: number;
  name: string;
  tier: string;
  duration_days: number;
  currency: string;
  price: string;
  features: ActiveSubscriptionPlanFeature[];
};

export type ActiveSubscriptionNested = {
  id: number;
  plan_name: string;
  plan_tier?: ActiveSubscriptionPlanTier | string;
  subscription_start_date: string;
  subscription_end_date: string;
  plan?: ActiveSubscriptionPlanDetail;
};

/** Response from GET `/businesses/<slug>/active-subscription/` (public, no auth). */
export type ActiveSubscriptionResponse = {
  slug: string;
  is_active: boolean;
  has_active_subscription: boolean;
  subscription_end_date: string | null;
  plan_tier: ActiveSubscriptionPlanTier | null;
  subscription: ActiveSubscriptionNested | null;
  detail?: string;
};

function inactiveActiveSubscriptionResponse(slug: string, detail?: string): ActiveSubscriptionResponse {
  const s = slug.trim();
  return {
    slug: s,
    is_active: false,
    has_active_subscription: false,
    subscription_end_date: null,
    plan_tier: null,
    subscription: null,
    ...(detail ? { detail } : {}),
  };
}

/**
 * Normalizes current and legacy API/cache shapes into {@link ActiveSubscriptionResponse}.
 */
export function normalizeActiveSubscriptionResponse(raw: unknown, fallbackSlug: string): ActiveSubscriptionResponse {
  if (!raw || typeof raw !== 'object') {
    return inactiveActiveSubscriptionResponse(fallbackSlug);
  }
  const o = raw as Record<string, unknown>;
  const s = String(o.slug ?? fallbackSlug).trim() || fallbackSlug.trim();
  const hasSub = o.has_active_subscription === true;
  const isActive =
    typeof o.is_active === 'boolean' ? o.is_active
    : hasSub ? true
    : false;
  const nestedRaw = o.subscription;
  const nested =
    nestedRaw && typeof nestedRaw === 'object' ?
      (nestedRaw as ActiveSubscriptionNested)
    : null;

  const planFromNested =
    nested && typeof nested.plan === 'object' && nested.plan !== null ?
      (nested.plan as ActiveSubscriptionPlanDetail)
    : undefined;

  const planTierRaw =
    (o.plan_tier as string | null | undefined) ??
    nested?.plan_tier ??
    planFromNested?.tier ??
    null;
  const tierLc = typeof planTierRaw === 'string' ? planTierRaw.trim().toLowerCase() : '';
  const planTier: ActiveSubscriptionResponse['plan_tier'] =
    tierLc === 'trial' || tierLc === 'starter' || tierLc === 'pro' || tierLc === 'other' ? tierLc
    : tierLc ? 'other'
    : null;

  const endTop = o.subscription_end_date;
  const endTopStr = typeof endTop === 'string' && endTop.trim() ? endTop : null;
  const endNested = nested?.subscription_end_date;
  const endNestedStr = typeof endNested === 'string' && endNested.trim() ? endNested : null;
  const subscription_end_date = endTopStr ?? endNestedStr ?? null;

  const detail = typeof o.detail === 'string' ? o.detail : undefined;

  return {
    slug: s,
    is_active: isActive,
    has_active_subscription: hasSub,
    subscription_end_date,
    plan_tier: planTier as ActiveSubscriptionResponse['plan_tier'],
    subscription: nested,
    ...(detail ? { detail } : {}),
  };
}

/** Check if a business has an active subscription. Public endpoint, no auth. */
export async function getActiveSubscription(slug: string): Promise<ActiveSubscriptionResponse> {
  const key = slug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await publicApi.get<unknown>(`${BASE}/${encodeURIComponent(key)}/active-subscription/`);
    return normalizeActiveSubscriptionResponse(data, key);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      const body = e.response?.data;
      if (body && typeof body === 'object') {
        return normalizeActiveSubscriptionResponse(body, key);
      }
      return inactiveActiveSubscriptionResponse(key, 'Not found.');
    }
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

export type CheckBusinessSlugAvailabilityOptions = {
  /**
   * When editing an existing gym, the slug that business already uses. If the typed slug matches this
   * (after trim/lowercase), it is treated as **available** without calling the public check — the public
   * “exists” APIs cannot exclude the current business, which otherwise yields a false “taken” result.
   */
  reservedSlug?: string;
};

/**
 * Whether `slug` is free for a new gym public URL (`/:slug/`).
 *
 * 1) GET /businesses/check-slug/?slug= (public).
 * 2) On failure, falls back to GET /businesses/public/:slug/ (404 ⇒ available).
 */
export async function checkBusinessSlugAvailability(
  slug: string,
  options?: CheckBusinessSlugAvailabilityOptions
): Promise<{
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

  const reserved = options?.reservedSlug?.trim().toLowerCase();
  if (reserved && normalized === reserved) {
    return { available: true };
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
 * Request JSON body: {@link CrystalWebsiteSetupPayload}. Optional `content.layout.heroTextColor` (`#rrggbb`) tints hero copy.
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
 * `record_status` is **not** accepted here — use {@link postBusinessRecordStatus} instead.
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

/** **409** when deactivating a business that still has an active subscription (server `code` often `active_subscription_blocks_deactivate`). */
export class BusinessDeactivateBlockedError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'BusinessDeactivateBlockedError';
    this.code = code;
  }
}

export type PostBusinessRecordStatusBody = {
  record_status: 'active' | 'inactive';
};

/**
 * **POST** `/api/businesses/<slug>/record-status/` — Bearer; owner only. Soft-delete (`inactive`) or restore (`active`).
 * **409** if an active subscription blocks deactivation. `PATCH /businesses/<slug>/` does not accept `record_status`.
 */
export async function postBusinessRecordStatus(
  businessSlug: string,
  payload: PostBusinessRecordStatusBody
): Promise<BusinessDetail> {
  const key = businessSlug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    const { data } = await privateApi.post<BusinessDetail>(
      `${BASE}/${encodeURIComponent(key)}/record-status/`,
      payload
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      const d = e.response.data as { detail?: string; code?: string } | undefined;
      throw new BusinessDeactivateBlockedError(
        typeof d?.detail === 'string' ? d.detail : 'This gym cannot be removed while it has an active subscription.',
        typeof d?.code === 'string' ? d.code : 'active_subscription_blocks_deactivate'
      );
    }
    throw new Error(getAxiosErrorMessage(e, 'Could not update website'));
  }
}
