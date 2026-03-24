/**
 * Application environment and public runtime configuration.
 *
 * All values come from Vite `import.meta.env` (build-time). Only `VITE_*` keys are exposed to the client.
 * Do not put API secrets or private keys here — they would be visible in the bundle.
 */

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
 * Refresh-token endpoint path, appended to `apiBaseUrl` (same as legacy `REFRESH_ENDPOINT`).
 */
export const authRefreshPath = '/auth/refresh/' as const;

/**
 * Absolute URL for the Crystal site preview (same tab / window).
 */
export function crystalPreviewAbsoluteUrl(): string {
  return new URL('crystal/preview', window.location.origin + viteBaseUrl).href;
}
