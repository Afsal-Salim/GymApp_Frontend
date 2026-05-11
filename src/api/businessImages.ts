import axios from 'axios';
import { apiBaseUrl } from '@/config/env';
import { privateApi } from './interceptor';
import { publicApi } from './http/publicApi';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';

const BASE = '/businesses';

function businessImageFilePathSegment(): string {
  const raw =
    import.meta.env.VITE_BUSINESS_IMAGE_FILE_SEGMENT ??
    import.meta.env.NEXT_PUBLIC_BUSINESS_IMAGE_FILE_SEGMENT ??
    'file';
  const s = raw.trim().replace(/^\/+|\/+$/g, '');
  return s || 'file';
}

function shouldUseApiFileUrlForBusinessImages(): boolean {
  const v = (
    import.meta.env.VITE_BUSINESS_IMAGE_USE_API_FILE ??
    import.meta.env.NEXT_PUBLIC_BUSINESS_IMAGE_USE_API_FILE ??
    ''
  ).trim();
  return /^true|1|yes$/i.test(v);
}

/**
 * `<img src>` / gallery strip URL. By default uses **`image_url` from the API** (e.g. time-limited **signed S3 URLs**).
 *
 * Set `NEXT_PUBLIC_BUSINESS_IMAGE_USE_API_FILE=true` to use `GET {apiBaseUrl}/businesses/{slug}/images/{id}/{segment}/` instead
 * when raw `image_url` is private and fails in the browser. Segment defaults to `file`; override with
 * `NEXT_PUBLIC_BUSINESS_IMAGE_FILE_SEGMENT`.
 */
export function resolveBusinessImageDisplayUrl(
  slug: string,
  img: Pick<BusinessUploadedImage, 'id' | 'image_url'>
): string {
  const raw = (img.image_url ?? '').trim();
  const id = img.id;
  if (shouldUseApiFileUrlForBusinessImages() && id != null && Number.isFinite(id) && id > 0) {
    const base = apiBaseUrl.replace(/\/$/, '');
    const seg = businessImageFilePathSegment();
    return `${base}${BASE}/${encodeURIComponent(slug.trim())}/images/${Math.trunc(id)}/${seg}/`;
  }
  return raw;
}

/** Asset types that create an `Asset` row (POST …/images/ → **201** + asset payload). Logo uses `uploadBusinessLogo` instead. */
export type BusinessUploadedImageAsset = 'dp' | 'hero' | 'background' | 'gallery';

export type BusinessUploadedImage = {
  /** Numeric asset row id from GET list — required for POST delete. */
  id?: number;
  image_url: string;
  s3_key?: string;
  asset?: string;
};

function parseImagePk(row: Record<string, unknown>): number | undefined {
  const v = row.id;
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.trunc(v);
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v.trim());
    if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  }
  return undefined;
}

export type ListBusinessImagesResponse = {
  images: BusinessUploadedImage[];
  slots_used: number;
  slots_limit: number;
};

function normalizeListPayload(data: unknown): ListBusinessImagesResponse {
  if (!data || typeof data !== 'object') {
    return { images: [], slots_used: 0, slots_limit: 5 };
  }
  const o = data as Record<string, unknown>;
  const raw = o.images;
  const images: BusinessUploadedImage[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const row = item as Record<string, unknown>;
      const url = row.image_url;
      if (typeof url !== 'string' || !url.trim()) continue;
      const pk = parseImagePk(row);
      const assetRaw = row.asset ?? row.asset_type;
      images.push({
        ...(pk != null ? { id: pk } : {}),
        image_url: url.trim(),
        s3_key: typeof row.s3_key === 'string' ? row.s3_key.trim() : undefined,
        asset: typeof assetRaw === 'string' ? assetRaw.trim().toLowerCase() : undefined,
      });
    }
  }
  const galleryRowCount = images.filter((i) => !i.asset || i.asset === 'gallery').length;
  const parsedUsed = Number(o.slots_used);
  const reportedUsed = Number.isFinite(parsedUsed) && parsedUsed >= 0 ? parsedUsed : 0;
  /** Some backends omit or zero `slots_used` while still returning `images` — never undercount vs listed gallery rows. */
  const slots_used = Math.max(reportedUsed, galleryRowCount);

  return {
    images,
    slots_used,
    slots_limit: Number.isFinite(Number(o.slots_limit)) && Number(o.slots_limit) > 0 ? Number(o.slots_limit) : 5,
  };
}

/**
 * GET `/businesses/<slug>/images/` — public list of uploaded gym images + slot usage.
 */
export async function listBusinessImages(slug: string): Promise<ListBusinessImagesResponse> {
  const key = slug.trim();
  if (!key) return { images: [], slots_used: 0, slots_limit: 5 };
  try {
    const { data } = await publicApi.get<unknown>(`${BASE}/${encodeURIComponent(key)}/images/`);
    return normalizeListPayload(data);
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const st = e.response?.status;
      if (st === 503 || st === 404) {
        return { images: [], slots_used: 0, slots_limit: st === 503 ? 0 : 5 };
      }
    }
    throw new Error(getAxiosErrorMessage(e, 'Failed to load gym images'));
  }
}

export type UploadBusinessImageResult = {
  image_url: string;
  slots_used?: number;
  slots_limit?: number;
};

function parseUploadResponse(data: unknown): UploadBusinessImageResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Upload succeeded but the response was invalid.');
  }
  const o = data as Record<string, unknown>;
  const image_url = typeof o.image_url === 'string' ? o.image_url.trim() : '';
  if (!image_url) {
    throw new Error('Upload succeeded but no image URL was returned.');
  }
  return {
    image_url,
    slots_used: Number.isFinite(Number(o.slots_used)) ? Number(o.slots_used) : undefined,
    slots_limit: Number.isFinite(Number(o.slots_limit)) ? Number(o.slots_limit) : undefined,
  };
}

/**
 * POST `/businesses/<slug>/images/` — multipart; owner only. `asset_type`: `dp` | `hero` | `background` | `gallery`.
 * Branding logo: use {@link uploadBusinessLogo} (`asset_type=logo`, **200** + business body).
 * Returns **`image_url`** from **201** (and optional slot counts).
 */
export async function uploadBusinessImage(
  slug: string,
  file: File,
  assetType: BusinessUploadedImageAsset = 'gallery'
): Promise<UploadBusinessImageResult> {
  const key = slug.trim();
  if (!key) throw new Error('Business slug is required.');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('asset_type', assetType);
  try {
    const { data } = await privateApi.post<unknown>(`${BASE}/${encodeURIComponent(key)}/images/`, fd);
    return parseUploadResponse(data);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 503) {
      throw new Error('Image uploads are temporarily unavailable. Please try again later.');
    }
    if (axios.isAxiosError(e) && e.response?.status === 400) {
      const body = e.response?.data as { detail?: string } | undefined;
      throw new Error(typeof body?.detail === 'string' ? body.detail : 'Upload was rejected. Check file type and size (max 1 MB).');
    }
    throw new Error(getAxiosErrorMessage(e, 'Upload failed'));
  }
}

/**
 * Remove one Asset row (gallery / dp / hero / background) — DELETE `/businesses/<slug>/images/?id=<pk>`.
 * `pk` is each item’s `id` from GET `/businesses/<slug>/images/`. Replaces legacy POST `…/images/<pk>/`.
 * Response **200** + `{ deleted: "asset", id: <pk> }`.
 */
export async function deleteBusinessGalleryImage(slug: string, imagePk: number): Promise<void> {
  const key = slug.trim();
  const pk = Math.trunc(Number(imagePk));
  if (!key || !Number.isFinite(pk) || pk <= 0) {
    throw new Error('Business slug and image id are required.');
  }
  try {
    await privateApi.delete(`${BASE}/${encodeURIComponent(key)}/images/`, {
      params: { id: pk },
    });
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const st = e.response?.status;
      const body = e.response?.data as { detail?: string } | undefined;
      const detail = typeof body?.detail === 'string' ? body.detail : '';
      if (st === 400) {
        throw new Error(detail || 'Invalid delete request (do not combine id with asset_type).');
      }
      if (st === 502) {
        throw new Error(detail || 'Storage could not remove the image.');
      }
      if (st === 404) {
        throw new Error(detail || 'Image not found.');
      }
    }
    throw new Error(getAxiosErrorMessage(e, 'Could not remove image'));
  }
}
