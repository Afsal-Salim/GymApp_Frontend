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
 * Public env vars exposed by Vite (must be prefixed with `VITE_`).
 * Legacy `NEXT_PUBLIC_*` names are also accepted at runtime as a fallback in `src/config/env.ts`
 * so we can keep using the same `.env` file from the Next.js era during the migration.
 */
interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly NODE_ENV?: string;

  readonly VITE_API_BASE_URL?: string;
  readonly VITE_MARKETING_ENQUIRY_PATH?: string;
  readonly VITE_SERVICE_ENQUIRY_PATH?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_WHATSAPP_PHONE?: string;
  readonly VITE_WHATSAPP_MESSAGE?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_CONTACT_PHONE_TEL?: string;
  readonly VITE_HOMEPAGE_TUTORIAL_VIDEO_URL?: string;
  readonly VITE_PUBLIC_SITE_DOMAIN?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_BUSINESS_IMAGE_FILE_SEGMENT?: string;
  readonly VITE_BUSINESS_IMAGE_USE_API_FILE?: string;
  /** Legacy NEXT_PUBLIC_* fallbacks for the same values (kept for the migration window). */
  readonly NEXT_PUBLIC_API_BASE_URL?: string;
  readonly NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
  readonly NEXT_PUBLIC_WHATSAPP_PHONE?: string;
  readonly NEXT_PUBLIC_WHATSAPP_MESSAGE?: string;
  readonly NEXT_PUBLIC_CONTACT_EMAIL?: string;
  readonly NEXT_PUBLIC_CONTACT_PHONE?: string;
  readonly NEXT_PUBLIC_CONTACT_PHONE_TEL?: string;
  readonly NEXT_PUBLIC_HOMEPAGE_TUTORIAL_VIDEO_URL?: string;
  readonly NEXT_PUBLIC_PUBLIC_SITE_DOMAIN?: string;
  readonly NEXT_PUBLIC_SITE_URL?: string;
  readonly NEXT_PUBLIC_MARKETING_ENQUIRY_PATH?: string;
  readonly NEXT_PUBLIC_SERVICE_ENQUIRY_PATH?: string;
  readonly NEXT_PUBLIC_BASE_PATH?: string;
  readonly NEXT_PUBLIC_BUSINESS_IMAGE_FILE_SEGMENT?: string;
  readonly NEXT_PUBLIC_BUSINESS_IMAGE_USE_API_FILE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
