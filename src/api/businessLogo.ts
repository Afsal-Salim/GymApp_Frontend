import axios from 'axios';
import { privateApi } from './interceptor';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import type { BusinessDetail } from './businesses';

const BASE = '/businesses';

/** Structured logo from GET/PATCH owner detail and GET public detail (S3 presigned vs external URL). */
export type BusinessLogoPayload = {
  type: 's3' | 'url' | null;
  url: string;
  s3_key: string | null;
};

/**
 * Prefer `logo.url` (S3 presigned or external), then legacy `logo_url`, then `website_content.logo.src`.
 */
export function resolveBusinessLogoDisplayUrl(business: {
  logo?: BusinessLogoPayload | null;
  logo_url?: string | null;
  website_content?: unknown;
}): string {
  const lo = business.logo;
  if (lo && typeof lo === 'object') {
    const u = typeof lo.url === 'string' ? lo.url.trim() : '';
    if (u) return u;
  }

  const legacy = typeof business.logo_url === 'string' ? business.logo_url.trim() : '';
  if (legacy) return legacy;

  const wc = business.website_content;
  if (wc && typeof wc === 'object') {
    const logo = (wc as { logo?: { src?: unknown } }).logo;
    const src = typeof logo?.src === 'string' ? logo.src.trim() : '';
    if (src) return src;
  }
  return '';
}

function parseBusinessDetailResponse(data: unknown): BusinessDetail {
  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected response from logo upload.');
  }
  return data as BusinessDetail;
}

/**
 * POST `/businesses/<slug>/logo/` — multipart `file`; owner only. Max 1 MB; jpg/png/webp/gif.
 * Returns the updated business payload (same shape as GET detail) when the server includes it.
 */
export async function uploadBusinessLogo(slug: string, file: File): Promise<BusinessDetail> {
  const key = slug.trim();
  if (!key) throw new Error('Business slug is required.');
  const fd = new FormData();
  fd.append('file', file);
  try {
    const { data } = await privateApi.post<unknown>(`${BASE}/${encodeURIComponent(key)}/logo/`, fd);
    return parseBusinessDetailResponse(data);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 503) {
      throw new Error('Logo upload is temporarily unavailable. Please try again later.');
    }
    if (axios.isAxiosError(e) && e.response?.status === 400) {
      const body = e.response?.data as { detail?: string } | undefined;
      throw new Error(typeof body?.detail === 'string' ? body.detail : 'Logo was rejected. Use JPG, PNG, WebP, or GIF (max 1 MB).');
    }
    throw new Error(getAxiosErrorMessage(e, 'Logo upload failed'));
  }
}

/**
 * DELETE `/businesses/<slug>/logo/` — owner only. Removes S3 object and clears `logo_s3_key`.
 */
export async function deleteBusinessLogo(slug: string): Promise<void> {
  const key = slug.trim();
  if (!key) throw new Error('Business slug is required.');
  try {
    await privateApi.delete(`${BASE}/${encodeURIComponent(key)}/logo/`);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      throw new Error('Business not found or logo already removed.');
    }
    throw new Error(getAxiosErrorMessage(e, 'Could not remove logo'));
  }
}
