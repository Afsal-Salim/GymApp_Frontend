/**
 * Application environment and public runtime configuration.
 *
 * All values are read via `import.meta.env.<KEY>`. The set of keys exposed to the browser bundle
 * is whitelisted in `vite.config.ts` (`PUBLIC_ENV_KEYS`) and inlined at build time via Vite's
 * `define`. Don't put API secrets here.
 */

import { SESSION_CRYSTAL_CREATE_SKIP_ON_BACK } from './storageKeys';

function trim(s: string | undefined): string {
  return (s ?? '').trim();
}

export const appMode: 'production' | 'development' =
  (import.meta.env.MODE as 'production' | 'development') ??
  (import.meta.env.NODE_ENV === 'production' ? 'production' : 'development');
export const isDev = appMode !== 'production';
export const isProd = appMode === 'production';

/** App base path, e.g. `/` or `/app/`. */
export const nextBaseUrl = trim(import.meta.env.BASE_PATH) || '/';

/** REST API base URL (scheme + host + optional path prefix). Set in `.env`. */
export const apiBaseUrl = trim(import.meta.env.API_BASE_URL);

export const googleOAuthClientId = trim(import.meta.env.GOOGLE_CLIENT_ID);

export const whatsappPhone = trim(import.meta.env.WHATSAPP_PHONE);

export const whatsappDefaultMessage = trim(import.meta.env.WHATSAPP_MESSAGE);

export const homepageTutorialVideoUrl = trim(import.meta.env.HOMEPAGE_TUTORIAL_VIDEO_URL);

export const marketingEnquiryPath = trim(import.meta.env.MARKETING_ENQUIRY_PATH);

export const serviceEnquiryPath = trim(import.meta.env.SERVICE_ENQUIRY_PATH);

export const contactEmail = trim(import.meta.env.CONTACT_EMAIL);

export const contactPhoneDisplay = trim(import.meta.env.CONTACT_PHONE);

export const contactPhoneTelRaw = trim(import.meta.env.CONTACT_PHONE_TEL);

export function contactMailtoHref(): string {
  return contactEmail ? `mailto:${contactEmail}` : '';
}

export function contactTelHref(): string {
  let raw = contactPhoneTelRaw.replace(/\s/g, '');
  if (!raw && contactPhoneDisplay) {
    raw = contactPhoneDisplay.replace(/\D/g, '');
  }
  if (!raw) return '';
  if (raw.startsWith('+')) return `tel:${raw}`;
  const digits = raw.replace(/\D/g, '');
  return digits ? `tel:+${digits}` : '';
}

export type MarketingContactRow = {
  type: 'Email' | 'Phone' | 'WhatsApp';
  value: string;
  href: string;
};

export function buildMarketingContactRows(): MarketingContactRow[] {
  const waHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappDefaultMessage)}`
    : '';
  const rows: MarketingContactRow[] = [];
  if (contactEmail) {
    rows.push({ type: 'Email', value: contactEmail, href: contactMailtoHref() });
  }
  if (contactPhoneDisplay) {
    rows.push({ type: 'Phone', value: contactPhoneDisplay, href: contactTelHref() });
  }
  rows.push({ type: 'WhatsApp', value: 'Chat with us instantly', href: waHref });
  return rows;
}

export const authRefreshPath = '/auth/refresh/' as const;

export function crystalPreviewAbsoluteUrl(): string {
  const base = nextBaseUrl.endsWith('/') ? nextBaseUrl : `${nextBaseUrl}/`;
  if (typeof window === 'undefined') {
    return 'preview';
  }
  return new URL('preview', window.location.origin + base).href;
}

export const publicSiteDomain = trim(import.meta.env.PUBLIC_SITE_DOMAIN).toLowerCase();

export function isLocalDevelopmentHost(): boolean {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

export function isPublicSiteSubdomainRoutingActive(): boolean {
  return Boolean(publicSiteDomain) && !isLocalDevelopmentHost();
}

export const MARKETING_APP_PATH_FIRST_SEGMENTS = new Set([
  'api',
  'plans',
  'base',
  'starter',
  'pro',
  'max',
  'login',
  'signup',
  'forgot-password',
  'legal',
  'user',
  'support',
  'services',
  '404',
  'gym-by-host',
  /** Standalone HTML/CSS templates (e.g. Pro client page previews), not gym sites */
  'templates',
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
