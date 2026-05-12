/**
 * Project-wide ambient declarations.
 *
 * We intentionally do NOT pull in `/// <reference types="vite/client" />` because Vite's defaults
 * type static image imports as plain `string`, while several modules in this codebase use a
 * defensive `typeof X === 'string' ? X : X.src` accessor (a holdover from the Next.js era when
 * imports were `StaticImageData`). Declaring the union here keeps both branches type-checking.
 */

interface CrystalBundledImage {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
}
type CrystalBundledAsset = string | CrystalBundledImage;

declare module '*.svg' {
  const value: CrystalBundledAsset;
  export default value;
}
declare module '*.png' {
  const value: CrystalBundledAsset;
  export default value;
}
declare module '*.jpg' {
  const value: CrystalBundledAsset;
  export default value;
}
declare module '*.jpeg' {
  const value: CrystalBundledAsset;
  export default value;
}
declare module '*.webp' {
  const value: CrystalBundledAsset;
  export default value;
}
declare module '*.gif' {
  const value: CrystalBundledAsset;
  export default value;
}
declare module '*.ico' {
  const value: string;
  export default value;
}
declare module '*.avif' {
  const value: CrystalBundledAsset;
  export default value;
}

declare module '*.css' {
  const css: string;
  export default css;
}

/** Vite's `?raw` / `?url` / `?inline` import suffixes. */
declare module '*?raw' {
  const content: string;
  export default content;
}
declare module '*?url' {
  const url: string;
  export default url;
}
declare module '*?inline' {
  const inline: string;
  export default inline;
}

declare module 'js-beautify' {
  type BeautifyOpts = Record<string, unknown>;
  type BeautifyFn = (src: string, opts?: BeautifyOpts) => string;
  interface Beautify extends BeautifyFn {
    (src: string, opts?: BeautifyOpts): string;
    js: BeautifyFn;
    css: BeautifyFn;
    html: BeautifyFn;
  }
  const beautify: Beautify;
  export default beautify;
}

/**
 * Public env vars inlined into the browser bundle.
 *
 * Source: `.env` at the project root. The whitelist of keys that actually get exposed is
 * `PUBLIC_ENV_KEYS` in `vite.config.ts`; at build time Vite's `define` replaces each
 * `import.meta.env.<KEY>` access with the literal value.
 *
 * To add a new public env var:
 *   1. Add the key to `PUBLIC_ENV_KEYS` in `vite.config.ts`.
 *   2. Declare it below so TypeScript accepts `import.meta.env.<KEY>`.
 *   3. Put a value in `.env` (or document a default in `.env.example`).
 */
interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly NODE_ENV?: string;

  readonly API_BASE_URL?: string;
  readonly PUBLIC_SITE_DOMAIN?: string;
  readonly SITE_URL?: string;
  readonly BASE_PATH?: string;
  readonly HOMEPAGE_TUTORIAL_VIDEO_URL?: string;
  readonly GOOGLE_CLIENT_ID?: string;
  readonly CONTACT_EMAIL?: string;
  readonly CONTACT_PHONE?: string;
  readonly CONTACT_PHONE_TEL?: string;
  readonly WHATSAPP_PHONE?: string;
  readonly WHATSAPP_MESSAGE?: string;
  readonly MARKETING_ENQUIRY_PATH?: string;
  readonly SERVICE_ENQUIRY_PATH?: string;
  readonly BUSINESS_IMAGE_FILE_SEGMENT?: string;
  readonly BUSINESS_IMAGE_USE_API_FILE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
