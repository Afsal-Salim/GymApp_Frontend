/**
 * Single bundled brand logo for the public gym client (navbar, loaders, modals, small accents).
 * Override per business via API `logo_url` → `content.logo.src` in `resolveGymClientSiteContent`.
 */
import brandLogoAsset from '../../assets/clientlogo.png';

export const GYM_CLIENT_BRAND_LOGO_SRC: string = brandLogoAsset;

export function resolveGymClientBrandLogoSrc(logoUrl?: string | null): string {
  const t = typeof logoUrl === 'string' ? logoUrl.trim() : '';
  return t || GYM_CLIENT_BRAND_LOGO_SRC;
}
