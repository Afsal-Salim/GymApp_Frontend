/**
 * Application environment and public runtime configuration.
 *
 * All values come from Vite `import.meta.env` (build-time). Only `VITE_*` keys are exposed to the client.
 * Do not put API secrets or private keys here — they would be visible in the bundle.
 */

import { SESSION_CRYSTAL_CREATE_SKIP_ON_BACK } from './storageKeys';

export const appMode = import.meta.env.MODE;
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

/** Vite base path, e.g. `/` or `/app/` */
export const viteBaseUrl = import.meta.env.BASE_URL;

/**
 * REST API base URL (scheme + host + optional path prefix).
 * @default http://localhost:3000/api
 */
export const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL ?? '').trim() || 'http://localhost:3000/api';

/** Google Identity Services client ID (optional). */
export const googleOAuthClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim();

/** Marketing / contact: WhatsApp E.164 or display number (optional). */
export const whatsappPhone = (import.meta.env.VITE_WHATSAPP_PHONE ?? '').trim();

export const whatsappDefaultMessage =
  (import.meta.env.VITE_WHATSAPP_MESSAGE ?? '').trim() ||
  'Hello I am interested in your service';

export const homepageTutorialVideoUrl =
  (import.meta.env.VITE_HOMEPAGE_TUTORIAL_VIDEO_URL ?? '').trim() ||
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

/**
 * POST path for homepage enquiry form (appended to `apiBaseUrl`, which already includes `/api`).
 * Full URL: `{apiBaseUrl}/public/enquiries/` → e.g. `https://host/api/public/enquiries/`.
 * @default /public/enquiries/
 */
export const marketingEnquiryPath =
  (import.meta.env.VITE_MARKETING_ENQUIRY_PATH ?? '').trim() || '/public/enquiries/';

/**
 * POST path for service / custom website enquiries (appended to `apiBaseUrl`).
 * @default /public/service-enquiries/
 */
export const serviceEnquiryPath =
  (import.meta.env.VITE_SERVICE_ENQUIRY_PATH ?? '').trim() || '/public/service-enquiries/';

/**
 * Refresh-token endpoint path, appended to `apiBaseUrl` (same as legacy `REFRESH_ENDPOINT`).
 */
export const authRefreshPath = '/auth/refresh/' as const;

/**
 * Absolute URL for the Crystal site preview (same tab / window).
 */
export function crystalPreviewAbsoluteUrl(): string {
  const base = viteBaseUrl.endsWith('/') ? viteBaseUrl : `${viteBaseUrl}/`;
  return new URL('preview', window.location.origin + base).href;
}

/**
 * Hostname for public gym mini-sites, without leading `www` (e.g. `crystal-co.in`).
 * When set, live gyms are served at `https://{slug}.{domain}` and path `/slug` on the marketing host redirects there.
 * Leave empty for local dev to keep path-based `/{slug}/` only.
 */
export const publicSiteDomain = (import.meta.env.VITE_PUBLIC_SITE_DOMAIN ?? '').trim().toLowerCase();

/**
 * Plain local dev (Vite default). On these hosts we keep path-based `/{slug}/` even if `VITE_PUBLIC_SITE_DOMAIN` is set,
 * so you are not redirected to `{slug}.{domain}` and “Visit website” stays on the dev server.
 */
export function isLocalDevelopmentHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

/**
 * Subdomain public URLs + `/slug` → `https://slug.domain` redirects (production-style). Off on localhost.
 */
export function isPublicSiteSubdomainRoutingActive(): boolean {
  return Boolean(publicSiteDomain) && !isLocalDevelopmentHost();
}

/** First path segment is marketing/app shell; anything else is treated as a public gym path (when not using a gym subdomain). */
export const MARKETING_APP_PATH_FIRST_SEGMENTS = new Set([
  'plans',
  'starter',
  'pro',
  'login',
  'signup',
  'forgot-password',
  'legal',
  'user',
  'support',
  'services',
  '404',
]);

const RESERVED_PUBLIC_SITE_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'mail',
  'admin',
  'staging',
  'dev',
  'cdn',
  'static',
  'preview',
  'localhost',
]);

/**
 * When `VITE_PUBLIC_SITE_DOMAIN` is set and the browser host is `{slug}.{domain}`, returns that slug.
 */
export function getPublicGymSlugFromHost(): string | null {
  if (typeof window === 'undefined' || !publicSiteDomain) return null;
  const host = window.location.hostname.toLowerCase();
  const domain = publicSiteDomain;
  if (host === domain || host === `www.${domain}`) return null;
  const suffix = `.${domain}`;
  if (!host.endsWith(suffix)) return null;
  const sub = host.slice(0, -suffix.length);
  if (!sub || sub.includes('.')) return null;
  if (RESERVED_PUBLIC_SITE_SUBDOMAINS.has(sub)) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(sub)) return null;
  return sub;
}

/**
 * Absolute URL for a gym’s public site. Without `publicSiteDomain`, uses same origin + Vite base + `/{slug}/`.
 */
export function publicGymSiteUrl(slug: string, path = '/'): string {
  const s = slug.trim();
  const tail = path.startsWith('/') ? path : `/${path}`;
  if (!publicSiteDomain) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = new URL(viteBaseUrl, origin);
    const subPath = s ? `${encodeURIComponent(s)}${tail === '/' ? '/' : tail}` : tail.slice(1) || '.';
    return new URL(subPath, base).href;
  }
  const scheme =
    typeof window !== 'undefined' && window.location.protocol === 'http:' ? 'http' : 'https';
  return `${scheme}://${encodeURIComponent(s)}.${publicSiteDomain}${tail === '/' ? '/' : tail}`;
}

/**
 * Display-only public address without `http(s)://` — e.g. `my-gym.example.com/` or `/my-gym/` when using path-based dev.
 */
export function publicGymSiteHostLabel(slug: string): string {
  const s = slug.trim().toLowerCase();
  if (!s) return '—';
  if (!publicSiteDomain) {
    return `/${s}/`;
  }
  return `${s}.${publicSiteDomain}/`;
}

/** Marketing SPA entry on `www` (dashboard, login, `/preview`, etc.). */
export function crystalMarketingAbsoluteUrl(path = '/'): string {
  const raw = path.startsWith('/') ? path.slice(1) : path;
  if (publicSiteDomain) {
    const base = new URL(viteBaseUrl, `https://www.${publicSiteDomain}`);
    return new URL(raw, base).href;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const base = new URL(viteBaseUrl, origin);
  return new URL(raw, base).href;
}

/**
 * Opens the gym’s public site in the browser.
 *
 * - **Production-style (subdomain):** when `VITE_PUBLIC_SITE_DOMAIN` is set and the host is not localhost, performs a
 *   full navigation to `https://{slug}.{VITE_PUBLIC_SITE_DOMAIN}/` — i.e. `{slug}` as a **subdomain**, not `crystal/{slug}`.
 * - **Local / no domain:** stays on the current origin and uses React Router to `/{slug}/` (path-based public site).
 *
 * Legacy bookmarks `/crystal/...` are handled separately in the router (stripped to `/...`).
 */

/** Matches React Router `navigate` for string paths (plus optional `replace`). */
type NavigatePathFn = (to: string, opts?: { replace?: boolean }) => void;

/**
 * @param options.replace — use browser history replace so “back” from the gym page does not return to the editor.
 * On subdomain routing, sets {@link SESSION_CRYSTAL_CREATE_SKIP_ON_BACK} so a later back navigation can send the user to profile.
 */
export function visitPublicGymSite(slug: string, navigate: NavigatePathFn, options?: { replace?: boolean }): void {
  const replace = options?.replace === true;
  if (isPublicSiteSubdomainRoutingActive()) {
    if (replace && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SESSION_CRYSTAL_CREATE_SKIP_ON_BACK, '1');
      } catch {
        /* quota / private mode */
      }
    }
    window.location.assign(publicGymSiteUrl(slug));
  } else {
    navigate(`/${slug}/`, { replace });
  }
}
