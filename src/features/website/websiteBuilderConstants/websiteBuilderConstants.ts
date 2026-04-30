/**
 * Grapes “Desktop” iframe width: matches a typical laptop viewport so centered max-width sections
 * show the same side gutters as `/preview` and the in-app preview tab (canvas was ~900–1100px before).
 */
export const WEBSITE_BUILDER_EDITOR_DESKTOP_FRAME_WIDTH_PX = 1440;

/** Baseline shell CSS injected into Grapes canvas docs for consistent sizing/reset. */
export const WEBSITE_BUILDER_CANVAS_DOCUMENT_SHELL_CSS = `
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
}
body {
  box-sizing: border-box;
}
*, *::before, *::after {
  box-sizing: inherit;
}
`;

/** Shared animation utilities + primary CTA style for GrapesJS blocks (injected into canvas CSS). */
export const WEBSITE_BUILDER_ANIMATION_CSS = `
.wb-fade-up { animation: wbFadeUp 0.88s cubic-bezier(0.22, 1, 0.36, 1) both; }
.wb-fade-in { animation: wbFadeIn 0.92s cubic-bezier(0.22, 1, 0.36, 1) both; }
.wb-slide-left { animation: wbSlideLeft 0.82s cubic-bezier(0.22, 1, 0.36, 1) both; }
.wb-slide-right { animation: wbSlideRight 0.82s cubic-bezier(0.22, 1, 0.36, 1) both; }
.wb-zoom-in { animation: wbZoomIn 0.72s cubic-bezier(0.22, 1, 0.36, 1) both; }
.wb-pulse { animation: wbPulse 2.6s cubic-bezier(0.45, 0, 0.55, 1) infinite; }

@keyframes wbFadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes wbFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes wbSlideLeft {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes wbSlideRight {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes wbZoomIn {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes wbPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.028); }
}

.wb-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.78rem 1.38rem;
  border-radius: 999px;
  font-weight: 650;
  letter-spacing: 0.02em;
  text-decoration: none;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #4338ca 100%);
  box-shadow:
    0 4px 16px rgba(37, 99, 235, 0.38),
    0 1px 0 rgba(255, 255, 255, 0.2) inset;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, filter 0.2s ease;
}
.wb-link-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 36px rgba(37, 99, 235, 0.45),
    0 1px 0 rgba(255, 255, 255, 0.24) inset;
  filter: brightness(1.05);
}
.wb-link-btn:active {
  transform: translateY(0);
  filter: brightness(0.98);
}

button.wb-link-btn[data-wb-open='visit'],
a.wb-link-btn[data-wb-open='visit'] {
  background: linear-gradient(135deg, #0f766e 0%, #0e7490 38%, #06b6d4 100%);
  box-shadow: 0 4px 16px rgba(6, 182, 212, 0.38), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
}
button.wb-link-btn[data-wb-open='visit']:hover,
a.wb-link-btn[data-wb-open='visit']:hover {
  box-shadow: 0 14px 36px rgba(6, 182, 212, 0.48), 0 1px 0 rgba(255, 255, 255, 0.24) inset;
}

button.wb-link-btn[data-wb-open='trial'],
a.wb-link-btn[data-wb-open='trial'] {
  background: linear-gradient(135deg, #c2410c 0%, #ea580c 45%, #f59e0b 100%);
  box-shadow: 0 4px 16px rgba(234, 88, 12, 0.4), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
}
button.wb-link-btn[data-wb-open='trial']:hover,
a.wb-link-btn[data-wb-open='trial']:hover {
  box-shadow: 0 14px 36px rgba(245, 158, 11, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}

button.wb-link-btn[data-wb-open='enquiry'],
a.wb-link-btn[data-wb-open='enquiry'] {
  background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 48%, #a855f7 100%);
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4), 0 1px 0 rgba(255, 255, 255, 0.18) inset;
}
button.wb-link-btn[data-wb-open='enquiry']:hover,
a.wb-link-btn[data-wb-open='enquiry']:hover {
  box-shadow: 0 14px 36px rgba(168, 85, 247, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}
`;

/**
 * Marketing / library component cards (shared with Grapes blocks).
 * Injected with builder helpers so previews and published pages match.
 */
export const WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS = `
:root {
  --primary: #2563eb;
  --primary-mid: #3b82f6;
  --primary-deep: #1d4ed8;
  --accent-indigo: #4f46e5;
  --bg: #f1f5f9;
  --card: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --border: rgba(148, 163, 184, 0.28);
  --shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px -8px rgba(15, 23, 42, 0.1);
  --shadow-card-hover: 0 4px 8px rgba(15, 23, 42, 0.04), 0 24px 48px -12px rgba(15, 23, 42, 0.16);
  --radius-card: 18px;
  --radius-control: 11px;
  /* Form + channel accents (library blocks) */
  --wb-wa-from: #059669;
  --wb-wa-mid: #10b981;
  --wb-wa-to: #34d399;
  --wb-phone-from: #ea580c;
  --wb-phone-to: #f97316;
  --wb-mail-from: #4f46e5;
  --wb-mail-to: #6366f1;
  --wb-visit-from: #0e7490;
  --wb-visit-to: #06b6d4;
  --wb-trial-from: #c2410c;
  --wb-trial-to: #f59e0b;
  --wb-enquiry-from: #6d28d9;
  --wb-enquiry-to: #a855f7;
}

.wb-template-root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/*
 * Palette blocks are wrapped in .wb-canvas-layer-group for Grapes layers. These rules must live in
 * the shared library (not canvas-only) so preview / export match the builder iframe.
 */
.wb-canvas-layer-group {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  min-height: 0;
  box-sizing: border-box;
  backface-visibility: hidden;
}
.wb-canvas-layer-group:has(> .component-card) {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.wb-canvas-layer-group > .component-card {
  box-sizing: border-box;
  flex: 0 1 auto;
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
}
/* Default responsive card width; inline style width (from canvas resize handles) may override this. */
.wb-canvas-layer-group > .component-card:not([style*='width']) {
  max-width: 36rem;
}
.wb-canvas-layer-group > .wb-enquiry-slide {
  width: fit-content;
  max-width: 100%;
}

.component-eyebrow {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 0.45rem;
}

.component-card {
  position: relative;
  background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 1.28rem 1.4rem 1.32rem;
  box-shadow: var(--shadow-card);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, width 0.16s ease, min-height 0.16s ease;
}

.component-card:hover {
  border-color: rgba(99, 102, 241, 0.22);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-3px);
}

.component-title {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  line-height: 1.25;
}

.component-desc {
  font-size: 0.8125rem;
  color: var(--muted);
  margin: 0 0 1rem;
  line-height: 1.58;
  max-width: 36rem;
}

button.component-btn,
a.component-btn {
  margin-top: 0.35rem;
  padding: 0.58rem 1.15rem;
  min-height: 2.45rem;
  border-radius: var(--radius-control);
  font-size: 0.8125rem;
  font-weight: 650;
  letter-spacing: 0.03em;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  font: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  text-align: center;
  box-sizing: border-box;
  background: linear-gradient(135deg, var(--primary-deep, #1d4ed8) 0%, var(--primary, #2563eb) 42%, var(--accent-indigo, #4f46e5) 100%);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.32), 0 1px 0 rgba(255, 255, 255, 0.18) inset;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, filter 0.2s ease;
}

/* Guard against template-level button resets (example: button background and text both forced to white). */
.component-card button.component-btn:not([style*='background']),
.component-card a.component-btn:not([style*='background']) {
  color: #fff !important;
  text-decoration: none !important;
  background: linear-gradient(135deg, var(--primary-deep, #1d4ed8) 0%, var(--primary, #2563eb) 42%, var(--accent-indigo, #4f46e5) 100%) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.32), 0 1px 0 rgba(255, 255, 255, 0.18) inset !important;
}
.component-card button.component-btn[data-wb-open='visit']:not([style*='background']),
.component-card a.component-btn[data-wb-open='visit']:not([style*='background']) {
  background: linear-gradient(135deg, #0f766e 0%, var(--wb-visit-from, #0e7490) 38%, var(--wb-visit-to, #06b6d4) 100%) !important;
}
.component-card button.component-btn[data-wb-open='trial']:not([style*='background']),
.component-card a.component-btn[data-wb-open='trial']:not([style*='background']) {
  background: linear-gradient(135deg, var(--wb-trial-from, #c2410c) 0%, #ea580c 45%, var(--wb-trial-to, #f59e0b) 100%) !important;
}
.component-card button.component-btn[data-wb-open='enquiry']:not([style*='background']),
.component-card a.component-btn[data-wb-open='enquiry']:not([style*='background']) {
  background: linear-gradient(135deg, var(--wb-enquiry-from, #6d28d9) 0%, #7c3aed 48%, var(--wb-enquiry-to, #a855f7) 100%) !important;
}
.component-card a.component-btn[href^='tel:']:not([style*='background']) {
  background: linear-gradient(135deg, #c2410c 0%, var(--wb-phone-from, #ea580c) 40%, var(--wb-phone-to, #f97316) 100%) !important;
}
.component-card a.component-btn[href^='mailto:']:not([style*='background']) {
  background: linear-gradient(135deg, #3730a3 0%, var(--wb-mail-from, #4f46e5) 42%, var(--wb-mail-to, #6366f1) 100%) !important;
}
.component-card a.component-btn.wb-wa-btn:not([style*='background']),
.component-card button.component-btn.wb-wa-btn:not([style*='background']) {
  color: #ecfdf5 !important;
  background: linear-gradient(135deg, #047857 0%, var(--wb-wa-from, #059669) 35%, var(--wb-wa-mid, #10b981) 72%, var(--wb-wa-to, #34d399) 100%) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}

button.component-btn:hover,
a.component-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
  filter: brightness(1.04);
}

button.component-btn:active,
a.component-btn:active {
  transform: translateY(0);
  filter: brightness(0.97);
}

/* —— Semantic CTAs (join stays default blue above) —— */
button.component-btn[data-wb-open='visit'],
a.component-btn[data-wb-open='visit'] {
  background: linear-gradient(135deg, #0f766e 0%, var(--wb-visit-from, #0e7490) 38%, var(--wb-visit-to, #06b6d4) 100%);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 4px 18px rgba(6, 182, 212, 0.35), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
}
button.component-btn[data-wb-open='visit']:hover,
a.component-btn[data-wb-open='visit']:hover {
  box-shadow: 0 10px 30px rgba(6, 182, 212, 0.48), 0 1px 0 rgba(255, 255, 255, 0.24) inset;
}

button.component-btn[data-wb-open='trial'],
a.component-btn[data-wb-open='trial'] {
  background: linear-gradient(135deg, var(--wb-trial-from, #c2410c) 0%, #ea580c 45%, var(--wb-trial-to, #f59e0b) 100%);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 18px rgba(234, 88, 12, 0.38), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
}
button.component-btn[data-wb-open='trial']:hover,
a.component-btn[data-wb-open='trial']:hover {
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}

button.component-btn[data-wb-open='enquiry'],
a.component-btn[data-wb-open='enquiry'] {
  background: linear-gradient(135deg, var(--wb-enquiry-from, #6d28d9) 0%, #7c3aed 48%, var(--wb-enquiry-to, #a855f7) 100%);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 18px rgba(124, 58, 237, 0.38), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
}
button.component-btn[data-wb-open='enquiry']:hover,
a.component-btn[data-wb-open='enquiry']:hover {
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}

a.component-btn[href^='tel:'] {
  color: #fff;
  background: linear-gradient(135deg, #c2410c 0%, var(--wb-phone-from, #ea580c) 40%, var(--wb-phone-to, #f97316) 100%);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 18px rgba(234, 88, 12, 0.38), 0 1px 0 rgba(255, 255, 255, 0.18) inset;
}
a.component-btn[href^='tel:']:hover {
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}

a.component-btn[href^='mailto:'] {
  color: #fff;
  background: linear-gradient(135deg, #3730a3 0%, var(--wb-mail-from, #4f46e5) 42%, var(--wb-mail-to, #6366f1) 100%);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 18px rgba(79, 70, 229, 0.35), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
}
a.component-btn[href^='mailto:']:hover {
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}

a.wb-wa-btn,
button.wb-wa-btn,
a.component-btn.wb-wa-btn,
button.component-btn.wb-wa-btn {
  color: #ecfdf5;
  background: linear-gradient(135deg, #047857 0%, var(--wb-wa-from, #059669) 35%, var(--wb-wa-mid, #10b981) 72%, var(--wb-wa-to, #34d399) 100%);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}
a.wb-wa-btn:hover,
button.wb-wa-btn:hover,
a.component-btn.wb-wa-btn:hover,
button.component-btn.wb-wa-btn:hover {
  box-shadow: 0 10px 32px rgba(52, 211, 153, 0.45), 0 1px 0 rgba(255, 255, 255, 0.26) inset;
  filter: brightness(1.05);
}

.wb-enquiry-slide .component-btn.wb-enquiry-slide__toggle {
  background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 48%, #a855f7 100%);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 18px rgba(124, 58, 237, 0.38), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
}
.wb-enquiry-slide .component-btn.wb-enquiry-slide__toggle:hover {
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
}

a.component-btn[download]:not(.wb-wa-btn) {
  color: #f8fafc;
  background: linear-gradient(135deg, #334155 0%, #475569 55%, #64748b 100%);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.22), 0 1px 0 rgba(255, 255, 255, 0.14) inset;
}
a.component-btn[download]:not(.wb-wa-btn):hover {
  box-shadow: 0 10px 28px rgba(51, 65, 85, 0.35), 0 1px 0 rgba(255, 255, 255, 0.18) inset;
}

/* Safety layer: keep CTA contrast stable inside design-system wrappers (some templates define broad button/link styles). */
.wb-ds-root .component-card button.component-btn,
.wb-ds-root .component-card a.component-btn {
  color: #fff !important;
  text-decoration: none !important;
  background: linear-gradient(135deg, var(--primary-deep, #1d4ed8) 0%, var(--primary, #2563eb) 42%, var(--accent-indigo, #4f46e5) 100%) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.32), 0 1px 0 rgba(255, 255, 255, 0.18) inset !important;
}
.wb-ds-root .component-card button.component-btn[data-wb-open='visit'],
.wb-ds-root .component-card a.component-btn[data-wb-open='visit'] {
  background: linear-gradient(135deg, #0f766e 0%, var(--wb-visit-from, #0e7490) 38%, var(--wb-visit-to, #06b6d4) 100%) !important;
}
.wb-ds-root .component-card button.component-btn[data-wb-open='trial'],
.wb-ds-root .component-card a.component-btn[data-wb-open='trial'] {
  background: linear-gradient(135deg, var(--wb-trial-from, #c2410c) 0%, #ea580c 45%, var(--wb-trial-to, #f59e0b) 100%) !important;
}
.wb-ds-root .component-card button.component-btn[data-wb-open='enquiry'],
.wb-ds-root .component-card a.component-btn[data-wb-open='enquiry'] {
  background: linear-gradient(135deg, var(--wb-enquiry-from, #6d28d9) 0%, #7c3aed 48%, var(--wb-enquiry-to, #a855f7) 100%) !important;
}
.wb-ds-root .component-card a.component-btn[href^='tel:'] {
  background: linear-gradient(135deg, #c2410c 0%, var(--wb-phone-from, #ea580c) 40%, var(--wb-phone-to, #f97316) 100%) !important;
}
.wb-ds-root .component-card a.component-btn[href^='mailto:'] {
  background: linear-gradient(135deg, #3730a3 0%, var(--wb-mail-from, #4f46e5) 42%, var(--wb-mail-to, #6366f1) 100%) !important;
}
.wb-ds-root .component-card a.component-btn.wb-wa-btn,
.wb-ds-root .component-card button.component-btn.wb-wa-btn {
  color: #ecfdf5 !important;
  background: linear-gradient(135deg, #047857 0%, var(--wb-wa-from, #059669) 35%, var(--wb-wa-mid, #10b981) 72%, var(--wb-wa-to, #34d399) 100%) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}

/* Safety layer for design-system template buttons used by non-POWER sets (.wb-sys-btn variants). */
.wb-ds-root .wb-sys--elite .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']),
.wb-ds-root .wb-sys--focus .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']),
.wb-ds-root .wb-sys--energy .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']),
.wb-ds-root .wb-sys--prime .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']),
.wb-ds-root .wb-sys--sporty .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']),
.wb-ds-root .wb-sys--glassmorph .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']),
.wb-ds-root .wb-sys--cyberfit .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  color: #fff !important;
  text-decoration: none !important;
}
.wb-ds-root .wb-sys--elite .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  background: linear-gradient(135deg, #0052cc, var(--wb-eli-blue, #0066ff) 52%, var(--wb-eli-blue-soft, #60a5fa)) !important;
  border-color: rgba(0, 102, 255, 0.25) !important;
  box-shadow: 0 8px 26px rgba(0, 102, 255, 0.32) !important;
}
.wb-ds-root .wb-sys--focus .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  background: linear-gradient(135deg, var(--wb-foc-lime-deep, #65a30d), var(--wb-foc-lime, #84cc16) 52%, var(--wb-foc-lime-bright, #bef264)) !important;
  color: var(--wb-foc-ink, #0f172a) !important;
  border-color: rgba(200, 232, 119, 0.45) !important;
  box-shadow: 0 10px 32px rgba(156, 207, 63, 0.32) !important;
}
.wb-ds-root .wb-sys--energy .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  background: linear-gradient(135deg, var(--wb-eng-orange-deep, #c2410c), var(--wb-eng-orange, #ea580c) 50%, #ff8533) !important;
  border-color: rgba(255, 102, 0, 0.35) !important;
  box-shadow: 0 8px 26px rgba(255, 102, 0, 0.32) !important;
}
.wb-ds-root .wb-sys--prime .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  background: linear-gradient(135deg, #6b21a8, var(--wb-prm-violet, #7c3aed) 48%, #d8b4fe) !important;
  border-color: rgba(233, 213, 254, 0.45) !important;
  box-shadow: 0 10px 32px rgba(109, 40, 217, 0.42) !important;
}
.wb-ds-root .wb-sys--sporty .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  background: linear-gradient(135deg, var(--wb-spo-teal-deep, #0f766e), var(--wb-spo-teal, #14b8a6) 52%, #33b8c0) !important;
  border-color: rgba(0, 163, 173, 0.35) !important;
  box-shadow: 0 8px 26px rgba(0, 163, 173, 0.28) !important;
}
.wb-ds-root .wb-sys--glassmorph .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  background: linear-gradient(135deg, #6f8cff 0%, #79bcff 100%) !important;
  border-color: rgba(89, 130, 246, 0.48) !important;
  box-shadow: 0 10px 24px rgba(92, 132, 235, 0.35) !important;
}
.wb-ds-root .wb-sys--cyberfit .wb-sys-btn:not(.wb-sys-btn--ghost):not([style*='background']) {
  background: linear-gradient(90deg, var(--wb-cyb-magenta-deep, #7e22ce) 0%, var(--wb-cyb-magenta-hot, #db2777) 55%, #c026d3 100%) !important;
  border-color: rgba(255, 0, 255, 0.45) !important;
  box-shadow: 0 0 18px rgba(255, 0, 255, 0.35), 0 8px 28px rgba(156, 0, 132, 0.35) !important;
}

.wb-ds-root .wb-sys--elite .wb-sys-btn--ghost:not([style*='background']) {
  background: transparent !important;
  color: #1d4ed8 !important;
  border-color: rgba(37, 99, 235, 0.28) !important;
}
.wb-ds-root .wb-sys--focus .wb-sys-btn--ghost:not([style*='background']) {
  background: rgba(255, 255, 255, 0.03) !important;
  color: #f8fafc !important;
  border-color: rgba(248, 250, 252, 0.45) !important;
}
.wb-ds-root .wb-sys--energy .wb-sys-btn--ghost:not([style*='background']) {
  background: #fff !important;
  color: #1c1917 !important;
  border-color: rgba(214, 211, 209, 0.95) !important;
}
.wb-ds-root .wb-sys--prime .wb-sys-btn--ghost:not([style*='background']) {
  background: rgba(255, 255, 255, 0.04) !important;
  color: #faf5ff !important;
  border-color: rgba(233, 213, 254, 0.42) !important;
}
.wb-ds-root .wb-sys--sporty .wb-sys-btn--ghost:not([style*='background']) {
  background: #fff !important;
  color: var(--wb-spo-teal-deep, #0f766e) !important;
  border-color: rgba(0, 163, 173, 0.45) !important;
}
.wb-ds-root .wb-sys--glassmorph .wb-sys-btn--ghost:not([style*='background']) {
  background: rgba(255, 255, 255, 0.62) !important;
  color: #4567d5 !important;
  border-color: rgba(113, 149, 255, 0.38) !important;
}
.wb-ds-root .wb-sys--cyberfit .wb-sys-btn--ghost:not([style*='background']) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.12) !important;
}

.component-card form {
  margin-top: 0.15rem;
}

.component-card input,
.component-card textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.62rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.42);
  border-radius: var(--radius-control);
  margin-bottom: 0.55rem;
  font: inherit;
  font-size: 0.875rem;
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.component-card input:focus,
.component-card textarea:focus {
  outline: none;
  background: #fff;
  border-color: rgba(124, 58, 237, 0.45);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.component-card input::placeholder,
.component-card textarea::placeholder {
  color: #94a3b8;
}

.component-card textarea {
  min-height: 5.5rem;
  resize: vertical;
  line-height: 1.5;
}

.component-media {
  margin-top: 0.35rem;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.component-media iframe {
  display: block;
  width: 100%;
}

.wb-hero-premium {
  position: relative;
  overflow: hidden;
  background: radial-gradient(100% 70% at 50% -10%, rgba(59, 130, 246, 0.45) 0%, transparent 58%),
    linear-gradient(168deg, #0f172a 0%, #111827 42%, #020617 100%);
}
.wb-hero-premium::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 50% at 80% 100%, rgba(79, 70, 229, 0.2), transparent 55%);
  pointer-events: none;
}
.wb-hero-premium__inner {
  position: relative;
  z-index: 1;
  max-width: 42rem;
  margin: 0 auto;
}

.wb-section-shell {
  max-width: 72rem;
  margin: 0 auto;
  padding-left: clamp(0.85rem, 3.5vw, 1.35rem);
  padding-right: clamp(0.85rem, 3.5vw, 1.35rem);
  box-sizing: border-box;
  width: 100%;
}

.wb-add-el.grid,
.component-card .grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 560px) {
  .wb-add-el.grid,
  .component-card .grid {
    grid-template-columns: 1fr;
  }
}

/* Fluid grids — stacks on narrow viewports without per-block media queries */
.wb-grid-autofill-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17.25rem), 1fr));
  gap: 1.1rem;
  width: 100%;
  max-width: 66rem;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.wb-grid-autofill-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 52rem;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.wb-grid-contact-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.75rem), 1fr));
  gap: 0.65rem;
  width: 100%;
  box-sizing: border-box;
}

.wb-hero-split {
  max-width: 68rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .wb-hero-split {
    grid-template-columns: 1fr;
  }
}

.wb-footer-cols {
  max-width: 68rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.wb-metrics-row {
  max-width: 62rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
  gap: 0.85rem;
  width: 100%;
  position: relative;
  box-sizing: border-box;
}
`;

/**
 * Optional motion utilities for “animated” component blocks (separate from static cards).
 * Loaded after component library CSS so hover / motion rules can compose.
 */
export const WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS = `
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1), transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
.fade-up.show {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .fade-up {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.hover-scale {
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.hover-scale:hover {
  transform: scale(1.025);
}

.component-card.hover-scale:hover {
  transform: scale(1.018) translateY(-3px);
}

.glow-btn {
  position: relative;
  overflow: hidden;
}
.glow-btn::after {
  content: "";
  position: absolute;
  width: 220%;
  height: 220%;
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.35) 50%, transparent 65%);
  top: -60%;
  left: -60%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s ease, transform 0.6s ease;
  transform: translateX(-12%) rotate(8deg);
}
.glow-btn:hover::after {
  opacity: 1;
  transform: translateX(8%) rotate(8deg);
}

/* Button pulse uses glow only (no transform) so it stacks with hover lift */
.component-btn.pulse {
  animation: wbPremiumBtnPulse 2.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes wbPremiumBtnPulse {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.32), 0 1px 0 rgba(255, 255, 255, 0.18) inset;
  }
  50% {
    box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5), 0 1px 0 rgba(255, 255, 255, 0.22) inset;
  }
}

.wb-wa-btn .wb-wa-ico {
  flex-shrink: 0;
  display: block;
  
}

.wb-wa-float {
  position: fixed;
  bottom: 4%;
  right: 4%;
  width: min(3.75rem, 14vw);
  height: min(3.75rem, 14vw);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #34d399 0%, #10b981 38%, #059669 72%, #047857 100%);
  color: #fff;
  font-size: 0;
  line-height: 0;
  text-decoration: none;
  z-index: 13000;
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 8px 28px rgba(16, 185, 129, 0.48), 0 2px 8px rgba(15, 23, 42, 0.12), 0 1px 0 rgba(255, 255, 255, 0.2) inset;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, filter 0.2s ease;
}
.wb-wa-float:hover {
  filter: brightness(1.06);
}
.wb-wa-float.pulse {
  animation: wbWaFloatPulse 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

/* Fixed “back to top” — library block; sits bottom-left so it does not cover the WhatsApp float (right). */
.wb-scroll-top {
  position: fixed;
  left: 3%;
  bottom: 3%;
  z-index: 12500;
  width: min(2.75rem, 12vw);
  height: min(2.75rem, 12vw);
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  color: #0f172a;
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.14), 0 1px 0 rgba(255, 255, 255, 0.9) inset;
  cursor: pointer;
  font: inherit;
  line-height: 0;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, filter 0.2s ease;
}
.wb-scroll-top:hover {
  transform: translateY(-2px);
  filter: brightness(1.03);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18), 0 1px 0 rgba(255, 255, 255, 0.95) inset;
}
.wb-scroll-top:active {
  transform: translateY(0);
}
.wb-scroll-top svg {
  display: block;
  flex-shrink: 0;
}

@keyframes wbWaFloatPulse {
  0%, 100% { box-shadow: 0 8px 28px rgba(16, 185, 129, 0.48), 0 2px 8px rgba(15, 23, 42, 0.12), 0 1px 0 rgba(255, 255, 255, 0.2) inset; }
  50% { box-shadow: 0 14px 40px rgba(52, 211, 153, 0.55), 0 4px 12px rgba(15, 23, 42, 0.14), 0 1px 0 rgba(255, 255, 255, 0.24) inset; }
}

@keyframes wbGradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.wb-offer-gradient-anim {
  padding: 1.35rem 1.5rem;
  border-radius: var(--radius-card);
  color: #fff;
  text-align: center;
  font-weight: 750;
  letter-spacing: 0.04em;
  font-size: 0.95rem;
  text-shadow: 0 1px 2px rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 40px -10px rgba(79, 70, 229, 0.45), 0 1px 0 rgba(255, 255, 255, 0.12) inset;
  background: linear-gradient(120deg, #1d4ed8, #6366f1, #7c3aed, #2563eb);
  background-size: 320% 320%;
  animation: wbGradientMove 8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.wb-enquiry-slide {
  position: relative;
}
.wb-enquiry-slide__backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2147482000;
  animation: wbBackdropFade 0.35s ease both;
}
@keyframes wbBackdropFade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.wb-enquiry-slide--open .wb-enquiry-slide__backdrop {
  display: block;
}
.wb-enquiry-slide__drawer {
  position: fixed;
  top: 0;
  right: -340px;
  width: min(320px, 92vw);
  height: 100%;
  max-height: 100vh;
  overflow: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 1.5rem 1.35rem;
  border-left: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: -24px 0 48px rgba(15, 23, 42, 0.18);
  z-index: 2147483001;
  transition: right 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  box-sizing: border-box;
}
.wb-enquiry-slide--open .wb-enquiry-slide__drawer {
  right: 0;
}

.wb-drawer-close {
  border: 0;
  cursor: pointer;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 10px;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
  color: #475569;
  font-size: 1.15rem;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.wb-drawer-close:hover {
  background: #fff;
  color: #0f172a;
  transform: scale(1.06);
}

.wb-enquiry-slide__field {
  width: 100%;
  box-sizing: border-box;
  padding: 0.62rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.42);
  border-radius: 11px;
  margin-bottom: 0.75rem;
  font: inherit;
  font-size: 0.875rem;
  background: linear-gradient(180deg, #fafbfc, #ffffff);
  color: var(--text);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.wb-enquiry-slide__field::placeholder {
  color: #94a3b8;
}
.wb-enquiry-slide__field:focus {
  outline: none;
  background: #fff;
  border-color: rgba(124, 58, 237, 0.45);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}

.wb-custom-dialog-panel {
  margin: 0.75rem 0 0;
  border: 0;
  border-radius: var(--radius-card);
  padding: 0;
  box-shadow: 0 28px 70px rgba(15, 23, 42, 0.32);
}
.wb-custom-dialog-panel::backdrop {
  background: rgba(15, 23, 42, 0.45);
}

.wb-tcarousel {
  min-height: 5.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.wb-tcarousel__text {
  transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  margin: 0;
  font-size: 1.02rem;
  line-height: 1.6;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text);
}
.wb-tcarousel__text::before {
  content: "“";
  color: #93c5fd;
  font-size: 1.6rem;
  line-height: 0;
  margin-right: 0.12em;
  vertical-align: -0.15em;
  font-weight: 700;
}

.wb-gallery-anim-grid img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease;
}
.wb-gallery-anim-grid img:hover {
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
}
`;

/** Responsive guardrails for imported Pro HTML/CSS inside Grapes canvas. */
export const WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS = `
html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

.wb-template-root,
.wb-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.wb-template-root *,
.wb-template-root *::before,
.wb-template-root *::after,
.wb-page *,
.wb-page *::before,
.wb-page *::after {
  box-sizing: border-box;
}

.wb-template-root img,
.wb-template-root svg,
.wb-template-root video,
.wb-template-root canvas,
.wb-page img,
.wb-page svg,
.wb-page video,
.wb-page canvas {
  max-width: 100%;
  height: auto;
}

@media (max-width: 1200px) {
  .wb-template-root .gjs-container,
  .wb-page .gjs-container {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: clamp(0.75rem, 2vw, 1.2rem) !important;
    padding-right: clamp(0.75rem, 2vw, 1.2rem) !important;
  }

  .wb-template-root .gjs-plg-flex-row,
  .wb-page .gjs-plg-flex-row {
    gap: clamp(0.55rem, 1.6vw, 1rem) !important;
  }
}

@media (max-width: 767.98px) {
  .wb-template-root .wb-hero .wb-link-btn,
  .wb-page .wb-hero .wb-link-btn {
    position: static !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
    transform: none !important;
    display: inline-flex !important;
    margin: 0.65rem auto 0 !important;
  }

  .wb-nav-stack-sm {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.65rem !important;
  }

  .wb-nav-stack-sm > div {
    width: 100%;
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
  }
}

@media (max-width: 640px) {
  .component-card .component-btn,
  .component-card a.component-btn {
    width: 100%;
    max-width: 100%;
  }
}

/* --- Library: inline SVG icons (draggable blocks) --- */
.wb-icon-block {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem;
  border-radius: 14px;
  background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
  color: #1e293b;
  line-height: 0;
  box-sizing: border-box;
  vertical-align: middle;
}
.wb-icon-block svg {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  display: block;
}
.wb-template-root .wb-icon-block svg,
.wb-page .wb-icon-block svg {
  max-width: 100%;
  height: 2.5rem;
}
.wb-icons-kit__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: center;
}
`;

export const WEBSITE_BUILDER_CUSTOM_SCRATCH = {
  name: 'Custom (start from scratch)',
  html: `
    <main class="wb-page wb-template-root">
      <section class="wb-hero wb-fade-up wb-hero-premium" style="padding:clamp(4rem,10vw,6rem) 1.35rem; text-align:center; color:#fff;">
        <div class="wb-hero-premium__inner">
          <span class="component-eyebrow" style="color: rgba(226, 232, 240, 0.88);">Visual builder</span>
          <h1 style="font-size:clamp(2.1rem,4.5vw,3rem); margin:0 0 0.65rem; font-weight:800; letter-spacing:-0.03em; line-height:1.08;">Your gym, elevated</h1>
          <p style="max-width:36rem; margin:0 auto 1.5rem; font-size:1.05rem; line-height:1.58; color:#cbd5e1;">Compose premium sections, sync pages, and publish a public experience that feels bespoke—not template-stale.</p>
          <a class="wb-link-btn" href="#pricing">Explore layouts</a>
        </div>
      </section>
    </main>
  `,
  css: '',
};

import { DESIGN_SYSTEM_SETS } from '../websiteBuilderDesignSystemBlocks/websiteBuilderDesignSystemBlocks';

const DESIGN_SYSTEM_TEMPLATE_LABELS: Record<string, string> = Object.fromEntries(
  DESIGN_SYSTEM_SETS.map((s) => [`ds-${s.id}`, `${s.label} · design system`]),
);

export const PRO_TEMPLATE_LABELS: Record<string, string> = {
  autopilot: 'TrainHouse',
  fitcore: 'FitCore',
  sonicflow: 'IronPulse',
  vital: 'Vital',
  sole: 'Sole',
  zen: 'Zen',
  'grapes-welcome': 'GrapesJS · Core welcome',
  'grapes-hello': 'GrapesJS · Hello demo',
  'grapes-cli': 'GrapesJS · CLI default',
  ...DESIGN_SYSTEM_TEMPLATE_LABELS,
};
