/**
 * Canonical marketing site origin for metadata, sitemap, and JSON-LD (server-side).
 *
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. `https://www.crystal-co.in`).
 * Falls back to `NEXT_PUBLIC_PUBLIC_SITE_DOMAIN` with https, then `VERCEL_URL` on Vercel.
 */
export function getMarketingSiteOrigin(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      const u = new URL(explicit.includes('://') ? explicit : `https://${explicit}`);
      return u;
    } catch {
      /* fall through */
    }
  }
  const domain = process.env.NEXT_PUBLIC_PUBLIC_SITE_DOMAIN?.trim();
  if (domain) {
    const host = domain.replace(/^https?:\/\//i, '').split('/')[0];
    try {
      return new URL(`https://${host}`);
    } catch {
      /* fall through */
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      return new URL(`https://${vercel}`);
    } catch {
      /* fall through */
    }
  }
  return new URL('http://localhost:3000');
}
