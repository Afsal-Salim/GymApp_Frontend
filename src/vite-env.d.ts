/// <reference types="vite/client" />

/** Augment env typing for documented `VITE_*` variables (merged with Vite defaults). */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_WHATSAPP_PHONE?: string;
  readonly VITE_WHATSAPP_MESSAGE?: string;
  readonly VITE_HOMEPAGE_TUTORIAL_VIDEO_URL?: string;
}
