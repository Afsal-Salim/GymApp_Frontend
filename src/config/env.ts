/**
 * Application environment and public runtime configuration.
 *
 * Client-exposed values use `NEXT_PUBLIC_*` (inlined at build time).
 * Do not put API secrets or private keys here.
 */

import { SESSION_CRYSTAL_CREATE_SKIP_ON_BACK } from './storageKeys';

function envString(key: string): string {
  if (typeof process === 'undefined' || !process.env) return '';
  return (process.env[key] ?? '').trim();
}

export const appMode = envString('NODE_ENV') === 'production' ? 'production' : 'development';
export const isDev = appMode !== 'production';
export const isProd = appMode === 'production';

/** Next.js base path, e.g. `/` or `/app/` */
export const nextBaseUrl = envString('NEXT_PUBLIC_BASE_PATH') || '/';

/**
 * REST API base URL (scheme + host + optional path prefix).
 * @default http://localhost:3000/api
 */
export const apiBaseUrl =
  envString('NEXT_PUBLIC_API_BASE_URL') || 'http://localhost:3000/api';

/** Google Identity Services client ID (optional). */
export const googleOAuthClientId = envString('NEXT_PUBLIC_GOOGLE_CLIENT_ID');

/** Marketing / contact: WhatsApp E.164 or display number (optional). */
export const whatsappPhone = envString('NEXT_PUBLIC_WHATSAPP_PHONE');

export const whatsappDefaultMessage =
  envString('NEXT_PUBLIC_WHATSAPP_MESSAGE') || 'Hello I am interested in your service';

export const homepageTutorialVideoUrl =
  envString('NEXT_PUBLIC_HOMEPAGE_TUTORIAL_VIDEO_URL') ||
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export const marketingEnquiryPath =
  envString('NEXT_PUBLIC_MARKETING_ENQUIRY_PATH') || '/public/enquiries/';

export const serviceEnquiryPath =
  envString('NEXT_PUBLIC_SERVICE_ENQUIRY_PATH') || '/public/service-enquiries/';

export const authRefreshPath = '/auth/refresh/' as const;

/**
 * Absolute URL for the Crystal site preview (same tab / window).
 */
export function crystalPreviewAbsoluteUrl(): string {
  const base = nextBaseUrl.endsWith('/') ? nextBaseUrl : `${nextBaseUrl}/`;
  if (typeof window === 'undefined') {
    return 'preview';
  }
  return new URL('preview', window.location.origin + base).href;
}

export const publicSiteDomain = envString('NEXT_PUBLIC_PUBLIC_SITE_DOMAIN').toLowerCase();

export function isLocalDevelopmentHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

export function isPublicSiteSubdomainRoutingActive(): boolean {
  return Boolean(publicSiteDomain) && !isLocalDevelopmentHost();
}

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
  'gym-by-host',
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
 * Server/middleware: extract gym slug from Host header (no `window`).
 */
export function getPublicGymSlugFromHostHeader(hostHeader: string | null): string | null {
  if (!publicSiteDomain || !hostHeader) return null;
  const host = hostHeader.split(':')[0]?.toLowerCase() ?? '';
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return null;
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

export function publicGymSiteUrl(slug: string, path = '/'): string {
  const s = slug.trim();
  const tail = path.startsWith('/') ? path : `/${path}`;
  if (!publicSiteDomain) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = new URL(nextBaseUrl, origin || 'http://localhost');
    const subPath = s ? `${encodeURIComponent(s)}${tail === '/' ? '/' : tail}` : tail.slice(1) || '.';
    return new URL(subPath, base).href;
  }
  const scheme =
    typeof window !== 'undefined' && window.location.protocol === 'http:' ? 'http' : 'https';
  return `${scheme}://${encodeURIComponent(s)}.${publicSiteDomain}${tail === '/' ? '/' : tail}`;
}

export function publicGymSiteHostLabel(slug: string): string {
  const s = slug.trim().toLowerCase();
  if (!s) return '—';
  if (!publicSiteDomain) {
    return `/${s}/`;
  }
  return `${s}.${publicSiteDomain}/`;
}

export function crystalMarketingAbsoluteUrl(path = '/'): string {
  const raw = path.startsWith('/') ? path.slice(1) : path;
  if (publicSiteDomain) {
    const base = new URL(nextBaseUrl, `https://www.${publicSiteDomain}`);
    return new URL(raw, base).href;
  }
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const base = new URL(nextBaseUrl, origin);
  return new URL(raw, base).href;
}

/** Matches client router `push` / `replace` for string paths. */
type NavigatePathFn = (to: string, opts?: { replace?: boolean }) => void;

export function visitPublicGymSite(slug: string, navigate: NavigatePathFn, options?: { replace?: boolean }): void {
  const replace = options?.replace === true;
  if (isPublicSiteSubdomainRoutingActive()) {
    if (replace && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(SESSION_CRYSTAL_CREATE_SKIP_ON_BACK, '1');
      } catch {
        /* quota */
      }
    }
    if (typeof window !== 'undefined') {
      window.location.assign(publicGymSiteUrl(slug));
    }
  } else {
    navigate(`/${slug}/`, { replace });
  }
}
