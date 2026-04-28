/**
 * Premium inline SVGs for design-system HTML blocks (Grapes canvas + published sites).
 * Stroke icons use currentColor so themes control color via CSS.
 */
const NS = 'xmlns="http://www.w3.org/2000/svg"';
const STROKE =
  'fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"';

function svg(w: number, h: number, cls: string, body: string): string {
  return `<svg ${NS} width="${w}" height="${h}" viewBox="0 0 24 24" ${STROKE} class="${cls}" aria-hidden="true" focusable="false">${body}</svg>`;
}

function svgFill(w: number, h: number, cls: string, body: string): string {
  return `<svg ${NS} width="${w}" height="${h}" viewBox="0 0 24 24" fill="currentColor" class="${cls}" aria-hidden="true" focusable="false">${body}</svg>`;
}

/** Feature / contact / controls */
export const DS_ICO = {
  /** Nav / hero accent */
  bolt: svg(20, 20, 'wb-ds-ico wb-ds-ico--nav', `<path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>`),
  /** FOCUS Gym — diamond mark */
  focusMark: svg(20, 20, 'wb-ds-ico wb-ds-ico--foc-nav', `<path d="M12 3.2L18.2 10 12 20.8 5.8 10 12 3.2z"/>`),
  /** PRIME Fitness — electric mark (nav) */
  primeBolt: svg(20, 20, 'wb-ds-ico wb-ds-ico--prm-nav', `<path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>`),
  /** ELITE Fitness — shield + check */
  eliteShield: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--eli-nav',
    `<path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z"/><path d="M9 12l2 2 4-4"/>`,
  ),
  /** ENERGY Fit — shield + bolt */
  energyShield: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--en-nav',
    `<path d="M12 3l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7l8-4z"/><path d="M13 7.5L8.5 14H12l-1 5.5 4.5-6.5H12l1-5.5z"/>`,
  ),
  /** SPORTY Gym — angular mark */
  sportyMark: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--spo-nav',
    `<path d="M14.5 3.5L7 12h5.5L9 21l8-8.5H12l2.5-9z"/>`,
  ),
  /** CYBERFIT — hex circuit mark */
  cyberMark: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--cyb-nav',
    `<path d="M12 2.2l7.2 4.2v8.2L12 18.8l-7.2-4.2V6.4L12 2.2z"/><path d="M12 6.5L8.2 8.7v4.6L12 15.5l3.8-2.2V8.7L12 6.5z"/>`,
  ),
  /** JUNGLE BEAST — compact tiger head */
  jungleMark: svgFill(
    20,
    20,
    'wb-ds-ico wb-ds-ico--jng-nav',
    `<path d="M12 3.2c-1.4 0-2.6.6-3.4 1.5-.5-.1-1 .1-1.3.4-.3.3-.4.8-.2 1.2-.6.7-1 1.6-1 2.6 0 2 1.3 3.7 3.2 4.4.1.7.4 1.3.9 1.8s1.1.7 1.8.8h.2c1.7-.1 3.1-1.5 3.5-3.2.8-.2 1.5-.7 2-1.3.4-.6.6-1.3.4-2 .2-.4.1-.9-.2-1.2s-.8-.5-1.3-.4c-.8-.9-2-1.5-3.4-1.5zm-2.2 2.8c.3 0 .6.3.6.6s-.3.6-.6.6-.6-.3-.6-.6.3-.6.6-.6zm4.4 0c.3 0 .6.3.6.6s-.3.6-.6.6-.6-.3-.6-.6.3-.6.6-.6zm-2.2 4.4c-.8 0-1.5-.3-2-.8l.5-.9c.4.3.9.5 1.5.5s1.1-.2 1.5-.5l.5.9c-.5.5-1.2.8-2 .8z"/>`,
  ),
  /** LIQUIDFIT — fluid droplet */
  liquidMark: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--liq-nav',
    `<path d="M12 3.5c2.8 3.4 5.2 6.6 5.2 9.6a5.2 5.2 0 1 1-10.4 0c0-3 2.4-6.2 5.2-9.6z"/>`,
  ),
  /** VINTAGE IRON — barbell mark */
  vintageMark: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--vin-nav',
    `<path d="M5.5 10h9"/><rect x="2.5" y="7.5" width="3" height="5" rx="0.6"/><rect x="14.5" y="7.5" width="3" height="5" rx="0.6"/>`,
  ),
  fatLoss: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M12 3v18"/><path d="M7 7.5h10"/><path d="M8 12h8"/><path d="M9 16.5h6"/><circle cx="12" cy="7.5" r="1.2"/>`,
  ),
  muscleGain: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M6 14c2-4 5.5-6 9-4.5"/><path d="M5 18l2.5-5 4.5 1.5"/><path d="M15 10l3 2"/><path d="M4 21h5"/>`,
  ),
  enduranceFlame: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M12 22c3.5-3.5 2.5-7.5 0-10.5 1.5 2 1 5-1 7-1-2.5-1-5.5 1.5-8.5C9 6 8.5 12 12 22z"/>`,
  ),
  wellnessCalm: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<circle cx="12" cy="7" r="2.5"/><path d="M7 18c2.5-3 4.5-3 10 0"/><path d="M6 21h12"/><path d="M10 13h4"/>`,
  ),
  cardio: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M4.5 12h3l2-6 4 12 2-6h3.5"/>`,
  ),
  studio: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 9h8"/><path d="M8 13h5"/>`,
  ),
  recovery: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>`,
  ),
  challengeTarget: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/>`,
  ),
  strengthTraining: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M5 13h14"/><path d="M5 11v4"/><path d="M19 11v4"/><path d="M8 9v6"/><path d="M16 9v6"/>`,
  ),
  crossTraining: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<circle cx="8.5" cy="8.5" r="2.5"/><circle cx="15.5" cy="15.5" r="2.5"/><path d="M10 10l4 4"/><path d="M4 20h16"/>`,
  ),
  flexibility: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M6 18c2.5-4 2.5-8 0-12"/><path d="M12 6c2.5 2.5 5 4.5 8 5.5"/><path d="M12 18c2.5-2 5-4 8-5"/>`,
  ),
  healthTracking: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M4 17V9"/><path d="M9 17v-6"/><path d="M14 17V6"/><path d="M19 17v-4"/><path d="M4 20h16"/>`,
  ),
  equipment: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M4 12h16"/><path d="M4 10v4"/><path d="M20 10v4"/><path d="M7 8v8"/><path d="M17 8v8"/>`,
  ),
  coaching: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/><path d="M8 5h8v15a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5z"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h2"/>`,
  ),
  clock: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  ),
  users: svg(
    22,
    22,
    'wb-ds-ico wb-ds-ico--feature',
    `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  ),
  phone: svg(20, 20, 'wb-ds-ico wb-ds-ico--contact', `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.11.37 1.95.58 2.81.7A2 2 0 0 1 22 16.92z"/>`),
  mail: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--contact',
    `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/>`,
  ),
  mapPin: svg(
    20,
    20,
    'wb-ds-ico wb-ds-ico--contact',
    `<path d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10z"/><circle cx="12" cy="11" r="2.5"/>`,
  ),
  chevL: svg(18, 18, 'wb-ds-ico wb-ds-ico--chev', `<path d="M15 18l-6-6 6-6"/>`),
  chevR: svg(18, 18, 'wb-ds-ico wb-ds-ico--chev', `<path d="M9 18l6-6-6-6"/>`),
  /** Social glyphs (filled — readable at small sizes) */
  socialFb: svgFill(18, 18, 'wb-ds-ico wb-ds-ico--social', `<path d="M14 9h-2V7.5c0-.6.4-1 1.2-1H14V4h-2c-2 0-3 1.4-3 3.2V9H7v3h2v8h3v-8h2.4l.6-3z"/>`),
  socialTw: svgFill(
    18,
    18,
    'wb-ds-ico wb-ds-ico--social',
    `<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>`,
  ),
  socialX: svgFill(18, 18, 'wb-ds-ico wb-ds-ico--social', `<path d="M4 4l5.5 7.3L4 20h2.2l4.5-5.9 3.6 5.9H20l-5.8-7.7L19.5 4h-2.2l-4.1 5.4L10 4H4z"/>`),
  socialLi: svgFill(
    18,
    18,
    'wb-ds-ico wb-ds-ico--social',
    `<path d="M5 3.5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM4 8.2h2V20H4V8.2zm5.3 0H11v1.6h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.6V20h-2.2v-6.4c0-1.5 0-3.5-2.1-3.5s-2.4 1.7-2.4 3.4V20H7.3V8.2z"/>`,
  ),
  socialIg: svgFill(
    18,
    18,
    'wb-ds-ico wb-ds-ico--social',
    `<path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm8 2H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm-4 2.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm4.8-3.3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>`,
  ),
  /** Nav tier badge — compact crown (amber via `.wb-sys-tag-crown`) */
  crownNav: svgFill(
    16,
    16,
    'wb-ds-ico wb-ds-ico--crown-nav',
    `<path d="M5 17 6 9l3.2 2.1L12 5l3.8 6.1L18 9l1 8H5zm-1 2h16" />`,
  ),
} as const;
