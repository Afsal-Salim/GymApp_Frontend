/**
 * Single bundled brand logo for the public gym client (navbar, footer, loaders, modals, small accents).
 * Override per business via API `logo_url` → `content.logo.src` in `resolveGymClientSiteContent`.
 */
import brandLogoAsset from '../../assets/clientlogo.png';

export const GYM_CLIENT_BRAND_LOGO_SRC: string = brandLogoAsset;

export function resolveGymClientBrandLogoSrc(logoUrl?: string | null): string {
  const t = typeof logoUrl === 'string' ? logoUrl.trim() : '';
  return t || GYM_CLIENT_BRAND_LOGO_SRC;
}

/**
 * Detects URLs from the old default (`logo.svg` via Vite), still present in some preview localStorage drafts.
 * Does not match `clientlogo.png` paths.
 */
export function isLegacyCrystalGemLogoUrl(url: string): boolean {
  const path = url.trim().split(/[?#]/)[0].toLowerCase();
  if (!path.endsWith('.svg')) return false;
  return (
    /\/logo\.svg$/i.test(path) ||
    /\/src\/assets\/logo\.svg$/i.test(path) ||
    /\/assets\/logo-[a-z0-9]+\.svg$/i.test(path)
  );
}

/** Ensures preview / stored content shows the PNG default instead of a stale bundled SVG URL. */
export function withBundledDefaultClientLogo<T extends { logo: { src: string; alt: string } }>(content: T): T {
  const src = content.logo?.src?.trim() ?? '';
  if (!src || isLegacyCrystalGemLogoUrl(src)) {
    return { ...content, logo: { ...content.logo, src: GYM_CLIENT_BRAND_LOGO_SRC } };
  }
  return content;
}
