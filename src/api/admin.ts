/**
 * Admin-only REST: `/api/admin/...` — Bearer token; backend allows only emails in server `ADMIN` env.
 */
import { protectedApi } from './http/protectedApi';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import type { ClientSupportMessageKind } from './support';

const ADMIN_SUPPORT = '/admin/support-feedback/';
const ADMIN_ENQUIRIES = '/admin/enquiries/';
const ADMIN_WEBSITES = '/admin/websites/';
const ADMIN_USERS = '/admin/users/';

const PAGE_SIZE_MAX = 100;

export type AdminPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function clampPageSize(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 10;
  return Math.min(Math.floor(n), PAGE_SIZE_MAX);
}

/** Normalizes DRF-style or custom `{ results, count, meta }` list payloads. */
function normalizeAdminList<T>(data: unknown): AdminPaginated<T> {
  if (!data || typeof data !== 'object') {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const d = data as Record<string, unknown>;
  const results = Array.isArray(d.results) ? (d.results as T[]) : [];
  if (d.meta && typeof d.meta === 'object') {
    const meta = d.meta as Record<string, unknown>;
    const total =
      typeof meta.total === 'number' ?
        meta.total
      : typeof d.count === 'number' ?
        d.count
      : results.length;
    return { count: total, next: null, previous: null, results };
  }
  const count = typeof d.count === 'number' ? d.count : results.length;
  return {
    count,
    next: typeof d.next === 'string' || d.next === null ? (d.next as string | null) : null,
    previous:
      typeof d.previous === 'string' || d.previous === null ? (d.previous as string | null) : null,
    results,
  };
}

export type AdminSupportFeedbackItem = {
  id: number;
  kind: ClientSupportMessageKind;
  subject?: string;
  message?: string;
  support_status?: 'open' | 'in_progress' | 'resolved' | null;
  feedback_status?: 'open' | 'resolved' | null;
  record_status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type AdminSupportFeedbackListParams = {
  page?: number;
  page_size?: number;
  kind?: ClientSupportMessageKind;
  support_status?: 'open' | 'in_progress' | 'resolved';
  feedback_status?: 'open' | 'resolved';
  record_status?: 'active' | 'inactive';
};

export type PatchAdminSupportFeedbackBody = {
  support_status?: 'open' | 'in_progress' | 'resolved' | null;
  feedback_status?: 'open' | 'resolved' | null;
  record_status?: 'active' | 'inactive';
};

export type AdminEnquiryItem = {
  id: number;
  enquiry_status?: 'open' | 'resolved';
  record_status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type AdminEnquiryListParams = {
  page?: number;
  page_size?: number;
  enquiry_status?: 'open' | 'resolved';
  record_status?: 'active' | 'inactive';
};

export type PatchAdminEnquiryBody = {
  enquiry_status?: 'open' | 'resolved';
  record_status?: 'active' | 'inactive';
};

export type AdminWebsiteItem = {
  slug?: string;
  record_status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

export type AdminWebsiteListParams = {
  page?: number;
  page_size?: number;
  record_status?: 'active' | 'inactive';
};

export type PatchAdminWebsiteBody = {
  record_status?: 'active' | 'inactive';
};

export type AdminUserItem = {
  id: number;
  username: string;
  email: string;
  auth_provider: 'email' | 'google' | string;
  record_status: 'active' | 'inactive' | string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

export type AdminUserListParams = {
  page?: number;
  page_size?: number;
  record_status?: 'active' | 'inactive';
};

export type PatchAdminUserBody = {
  record_status?: 'active' | 'inactive';
};

export async function getAdminSupportFeedbackList(
  params: AdminSupportFeedbackListParams = {}
): Promise<AdminPaginated<AdminSupportFeedbackItem>> {
  try {
    const page = params.page && params.page >= 1 ? params.page : 1;
    const page_size = clampPageSize(params.page_size ?? 10);
    const { data } = await protectedApi.get(ADMIN_SUPPORT, {
      params: {
        page,
        page_size,
        ...(params.kind ? { kind: params.kind } : {}),
        ...(params.support_status ? { support_status: params.support_status } : {}),
        ...(params.feedback_status ? { feedback_status: params.feedback_status } : {}),
        ...(params.record_status ? { record_status: params.record_status } : {}),
      },
    });
    return normalizeAdminList<AdminSupportFeedbackItem>(data);
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not load support & feedback.'));
  }
}

export async function patchAdminSupportFeedback(
  id: number,
  body: PatchAdminSupportFeedbackBody
): Promise<AdminSupportFeedbackItem> {
  try {
    const { data } = await protectedApi.patch<AdminSupportFeedbackItem>(
      `${ADMIN_SUPPORT}${id}/`,
      body
    );
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not update item.'));
  }
}

export async function getAdminEnquiriesList(
  params: AdminEnquiryListParams = {}
): Promise<AdminPaginated<AdminEnquiryItem>> {
  try {
    const page = params.page && params.page >= 1 ? params.page : 1;
    const page_size = clampPageSize(params.page_size ?? 10);
    const { data } = await protectedApi.get(ADMIN_ENQUIRIES, {
      params: {
        page,
        page_size,
        ...(params.enquiry_status ? { enquiry_status: params.enquiry_status } : {}),
        ...(params.record_status ? { record_status: params.record_status } : {}),
      },
    });
    return normalizeAdminList<AdminEnquiryItem>(data);
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not load enquiries.'));
  }
}

export async function patchAdminEnquiry(id: number, body: PatchAdminEnquiryBody): Promise<AdminEnquiryItem> {
  try {
    const { data } = await protectedApi.patch<AdminEnquiryItem>(`${ADMIN_ENQUIRIES}${id}/`, body);
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not update enquiry.'));
  }
}

export async function getAdminWebsitesList(
  params: AdminWebsiteListParams = {}
): Promise<AdminPaginated<AdminWebsiteItem>> {
  try {
    const page = params.page && params.page >= 1 ? params.page : 1;
    const page_size = clampPageSize(params.page_size ?? 10);
    const { data } = await protectedApi.get(ADMIN_WEBSITES, {
      params: {
        page,
        page_size,
        ...(params.record_status ? { record_status: params.record_status } : {}),
      },
    });
    return normalizeAdminList<AdminWebsiteItem>(data);
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not load websites.'));
  }
}

export async function patchAdminWebsite(
  slug: string,
  body: PatchAdminWebsiteBody
): Promise<AdminWebsiteItem> {
  try {
    const { data } = await protectedApi.patch<AdminWebsiteItem>(
      `${ADMIN_WEBSITES}${encodeURIComponent(slug)}/`,
      body
    );
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not update website.'));
  }
}

export async function getAdminUsersList(params: AdminUserListParams = {}): Promise<AdminPaginated<AdminUserItem>> {
  try {
    const page = params.page && params.page >= 1 ? params.page : 1;
    const page_size = clampPageSize(params.page_size ?? 10);
    const { data } = await protectedApi.get(ADMIN_USERS, {
      params: {
        page,
        page_size,
        ...(params.record_status ? { record_status: params.record_status } : {}),
      },
    });
    return normalizeAdminList<AdminUserItem>(data);
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not load users.'));
  }
}

export async function patchAdminUser(id: number, body: PatchAdminUserBody): Promise<AdminUserItem> {
  try {
    const { data } = await protectedApi.patch<AdminUserItem>(`${ADMIN_USERS}${id}/`, body);
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not update user.'));
  }
}
