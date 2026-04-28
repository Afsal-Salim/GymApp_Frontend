/**
 * Fallback copy when GET /plans/plan_list/ omits `features` for a plan (often Pro in DB).
 * Prefer API features when present.
 */
export const STARTER_PLAN_FEATURE_FALLBACKS = [
  'Dynamic website for your gym — Showcase your services, timings, and facilities with a modern, responsive page.',
  '5 ready-made themes (fully customizable) — Match your brand with colors and style that fit your gym’s vibe.',
  'WhatsApp integration — Let potential members contact you instantly—no missed leads.',
  'Basic client analytics — Understand who’s visiting your page and what they’re interested in.',
  'Limited image upload — Showcase your equipment and space within your plan; upgrade to Pro for more capacity.',
  'Email notifications for enquiries — Get notified instantly when someone shows interest.',
  'User activity insights — Track how visitors interact with your page to improve conversions.',
];

export const PRO_PLAN_FEATURE_FALLBACKS = [
  'Everything in Base — Dynamic website, themes, WhatsApp, analytics, enquiry emails, and visitor insights.',
  '3× image upload vs Base — Triple the gallery and media capacity for photos, coaches, and hero sections.',
  'Premium templates — Extra client page layouts and styles beyond the Base set.',
  'SMS notifications for new leads — Get a text alert when someone submits a lead so you can respond faster.',
];
