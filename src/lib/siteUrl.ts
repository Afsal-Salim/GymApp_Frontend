/**
 * Canonical marketing site origin for SEO metadata, sitemap, and JSON-LD.
 *
 * Set `VITE_SITE_URL` in production (e.g. `https://www.crystal-co.in`). Falls back to
 * `VITE_PUBLIC_SITE_DOMAIN` (or the legacy `NEXT_PUBLIC_*` aliases) with https, then the current
 * `window.location.origin`, and finally `http://localhost:3000` for dev.
 */
export function getMarketingSiteOrigin(): URL {
  const env = import.meta.env;
  const explicit = (env.VITE_SITE_URL ?? env.NEXT_PUBLIC_SITE_URL ?? '').trim();
  if (explicit) {
    try {
      return new URL(explicit.includes('://') ? explicit : `https://${explicit}`);
    } catch {
      /* fall through */
    }
  }
  const domain = (env.VITE_PUBLIC_SITE_DOMAIN ?? env.NEXT_PUBLIC_PUBLIC_SITE_DOMAIN ?? '').trim();
  if (domain) {
    const host = domain.replace(/^https?:\/\//i, '').split('/')[0];
    try {
      return new URL(`https://${host}`);
    } catch {
      /* fall through */
    }
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    try {
      return new URL(window.location.origin);
    } catch {
      /* fall through */
    }
  }
  return new URL('http://localhost:3000');
}
