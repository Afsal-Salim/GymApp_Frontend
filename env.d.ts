/** Public env vars (inlined by Next.js). See `src/config/env.ts`. */
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_API_BASE_URL?: string;
    VITE_MARKETING_ENQUIRY_PATH?: string;
    VITE_SERVICE_ENQUIRY_PATH?: string;
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
    NEXT_PUBLIC_WHATSAPP_PHONE?: string;
    NEXT_PUBLIC_WHATSAPP_MESSAGE?: string;
    NEXT_PUBLIC_CONTACT_EMAIL?: string;
    NEXT_PUBLIC_CONTACT_PHONE?: string;
    NEXT_PUBLIC_CONTACT_PHONE_TEL?: string;
    NEXT_PUBLIC_HOMEPAGE_TUTORIAL_VIDEO_URL?: string;
    NEXT_PUBLIC_PUBLIC_SITE_DOMAIN?: string;
    /** Canonical site URL for SEO (e.g. https://www.crystal-co.in). Optional; falls back to PUBLIC_SITE_DOMAIN. */
    NEXT_PUBLIC_SITE_URL?: string;
    VERCEL_URL?: string;
    NEXT_PUBLIC_MARKETING_ENQUIRY_PATH?: string;
    NEXT_PUBLIC_SERVICE_ENQUIRY_PATH?: string;
    NEXT_PUBLIC_BASE_PATH?: string;
    NEXT_PUBLIC_BUSINESS_IMAGE_FILE_SEGMENT?: string;
    NEXT_PUBLIC_BUSINESS_IMAGE_USE_API_FILE?: string;
  }
}
