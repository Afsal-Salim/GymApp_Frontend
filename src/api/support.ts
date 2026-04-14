import { protectedApi } from './http/protectedApi';
import type { BusinessListMeta } from './businesses';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';

const SUPPORT_PATH = '/support/';

export type ClientSupportMessageKind = 'support' | 'feedback';

export type ClientSupportMessage = {
  id: number;
  kind: ClientSupportMessageKind;
  subject: string;
  message: string;
  created_at: string;
};

export type ClientSupportListResponse = {
  results: ClientSupportMessage[];
  meta: BusinessListMeta;
  count: number;
};

export type PostClientSupportPayload = {
  kind: ClientSupportMessageKind;
  /** Optional; max 200 chars on the server. */
  subject?: string;
  /** Trimmed; min 3, max 5000 on the server. */
  message: string;
};

/** Fixed page size for customer support list (10 rows per request / per UI page). */
export const CLIENT_SUPPORT_LIST_PAGE_SIZE = 10;

const MAX_PAGE_SIZE = 50;

/** Parses paginated `{ results, meta?, count? }` like other owner list endpoints. */
function parseSupportListResponse(
  data: unknown,
  page: number,
  pageSize: number
): ClientSupportListResponse {
  const raw = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const results = Array.isArray(raw.results) ? (raw.results as ClientSupportMessage[]) : [];
  const meta = raw.meta as Partial<BusinessListMeta> | undefined;
  const total =
    typeof meta?.total === 'number' ? meta.total : typeof raw.count === 'number' ? raw.count : results.length;
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

/**
 * If the API returns more than `pageSize` rows at once (ignores pagination), keep only the window
 * for the requested `page` so the UI never shows more than 10 at a time.
 */
function clampSupportListToPageWindow(
  parsed: ClientSupportListResponse,
  page: number,
  pageSize: number
): ClientSupportListResponse {
  let { results, meta, count } = parsed;
  if (results.length <= pageSize) {
    return parsed;
  }
  const fullCount = Math.max(count, meta.total, results.length);
  const start = (page - 1) * pageSize;
  const sliced = results.slice(start, start + pageSize);
  const totalPages = Math.ceil(fullCount / pageSize) || 1;
  return {
    results: sliced,
    count: fullCount,
    meta: {
      page,
      page_size: pageSize,
      total: fullCount,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_previous: page > 1,
    },
  };
}

/** Coalesce concurrent GET `/support/?page=` per page key (e.g. Strict Mode). */
const listClientSupportMessagesInflight = new Map<string, Promise<ClientSupportListResponse>>();

/**
 * **GET** `/support/?page=&page_size=` — paginated list for the authenticated customer, newest first.
 * If the server omits `meta`, totals are inferred from the current `results` length (single page).
 */
export async function listClientSupportMessages(params?: {
  page?: number;
  page_size?: number;
}): Promise<ClientSupportListResponse> {
  const page = params?.page && params.page >= 1 ? params.page : 1;
  const page_size =
    params?.page_size && params.page_size >= 1 ?
      Math.min(MAX_PAGE_SIZE, Math.floor(params.page_size))
    : CLIENT_SUPPORT_LIST_PAGE_SIZE;
  const key = `${page}:${page_size}`;
  const existing = listClientSupportMessagesInflight.get(key);
  if (existing) return existing;

  const promise = (async (): Promise<ClientSupportListResponse> => {
    try {
      const { data } = await protectedApi.get<unknown>(SUPPORT_PATH, {
        params: { page, page_size },
      });
      const parsed = parseSupportListResponse(data, page, page_size);
      return clampSupportListToPageWindow(parsed, page, page_size);
    } catch (e) {
      throw new Error(getAxiosErrorMessage(e, 'Could not load your messages.'));
    } finally {
      listClientSupportMessagesInflight.delete(key);
    }
  })();

  listClientSupportMessagesInflight.set(key, promise);
  return promise;
}

/**
 * **POST** `/support/` — creates a support or feedback row; team receives email.
 */
export async function postClientSupportMessage(
  payload: PostClientSupportPayload
): Promise<ClientSupportMessage> {
  const subjectTrimmed = payload.subject?.trim() ?? '';
  const body: Record<string, unknown> = {
    kind: payload.kind,
    message: payload.message.trim(),
  };
  if (subjectTrimmed) {
    body.subject = subjectTrimmed.slice(0, 200);
  }
  try {
    const { data } = await protectedApi.post<ClientSupportMessage>(SUPPORT_PATH, body);
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Could not send your message. Try again later.'));
  }
}
