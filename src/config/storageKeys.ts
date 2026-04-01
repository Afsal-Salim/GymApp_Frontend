/**
 * Central definitions for browser persistence keys.
 * Keeps layers (auth, marketing, gym client) from colliding and makes audits easier.
 */

// —— Authenticated session (used by protected API client + interceptor) ——
export const STORAGE_ACCESS_TOKEN = 'access_token';
export const STORAGE_REFRESH_TOKEN = 'refresh_token';
export const STORAGE_USER_EMAIL = 'user_email';
export const STORAGE_USER_USERNAME = 'user_username';

/** Cached JSON from GET /auth/me/ — cleared on logout with tokens. */
export const STORAGE_USER_PROFILE_CACHE = 'user_profile_cache_v1';

/** Cached paginated GET /businesses/ (dashboard list) — cleared on logout. */
export const STORAGE_USER_BUSINESS_LIST_CACHE = 'user_business_list_cache_v1';

/** Optional profile image URL for navbar (set after login/profile update). */
export const STORAGE_USER_AVATAR_URL = 'user_avatar_url';

// —— Crystal gym client: website builder & live preview ——
/** Live preview draft synced via `localStorage` + `storage` event across tabs. */
export const CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY = 'crystal_website_preview_v1';

/**
 * Same-origin broadcast when the preview draft is written. The `storage` event does not fire in the
 * tab that called `localStorage.setItem`, so preview tabs use this (and `storage`) to stay live.
 */
export const CRYSTAL_WEBSITE_PREVIEW_BROADCAST_CHANNEL = 'crystal_website_preview_broadcast_v1';

/** Older session-only draft key (Create Website wizard). */
export const CRYSTAL_WEBSITE_SETUP_DRAFT_STORAGE_KEY = 'crystal_website_setup_draft_v1';

// —— Anonymous analytics-style persistence ——
/** Per-slug lead / engagement counters for the public gym page. */
export const GYM_CRYSTAL_LEAD_STATS_STORAGE_KEY = 'gymCrystal_leadStats_v1';

/** Cached public gym JSON (business + active-subscription) per slug — short TTL, not auth-specific. */
export const STORAGE_PUBLIC_GYM_BUNDLE_CACHE = 'public_gym_bundle_cache_v1';
