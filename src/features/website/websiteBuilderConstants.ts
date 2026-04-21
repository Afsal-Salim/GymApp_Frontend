/** Shared animation utilities + primary CTA style for GrapesJS blocks (injected into canvas CSS). */
export const WEBSITE_BUILDER_ANIMATION_CSS = `
.wb-fade-up { animation: wbFadeUp .7s ease both; }
.wb-fade-in { animation: wbFadeIn .8s ease both; }
.wb-slide-left { animation: wbSlideLeft .75s ease both; }
.wb-slide-right { animation: wbSlideRight .75s ease both; }
.wb-zoom-in { animation: wbZoomIn .65s ease both; }
.wb-pulse { animation: wbPulse 2.4s ease-in-out infinite; }

@keyframes wbFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes wbFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes wbSlideLeft {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes wbSlideRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes wbZoomIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes wbPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.wb-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  color: #fff;
  background: #0d6efd;
}
`;

/** Responsive guardrails for imported Pro HTML/CSS inside Grapes canvas. */
export const WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS = `
.wb-template-root {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.wb-template-root *,
.wb-template-root *::before,
.wb-template-root *::after {
  box-sizing: border-box;
}

.wb-template-root img,
.wb-template-root svg,
.wb-template-root video,
.wb-template-root canvas {
  max-width: 100%;
  height: auto;
}

@media (max-width: 1200px) {
  .wb-template-root .gjs-container {
    width: 100% !important;
    max-width: 100% !important;
    padding-left: clamp(0.75rem, 2vw, 1.2rem) !important;
    padding-right: clamp(0.75rem, 2vw, 1.2rem) !important;
  }

  .wb-template-root .gjs-plg-flex-row {
    gap: clamp(0.55rem, 1.6vw, 1rem) !important;
  }
}
`;

export const WEBSITE_BUILDER_CUSTOM_SCRATCH = {
  name: 'Custom (start from scratch)',
  html: `
    <main class="wb-page">
      <section class="wb-hero wb-fade-up" style="padding: 84px 20px; text-align:center; background:#0f172a; color:#fff;">
        <h1 style="font-size:44px; margin:0 0 12px;">Your gym site</h1>
        <p style="max-width:700px; margin:0 auto 24px; opacity:.85;">Drag sections from the toolbox, add pages, and link buttons in Traits.</p>
        <a class="wb-link-btn" href="#pricing">Get started</a>
      </section>
    </main>
  `,
  css: '',
};

export const PRO_TEMPLATE_LABELS: Record<string, string> = {
  autopilot: 'TrainHouse',
  fitcore: 'FitCore',
  sonicflow: 'IronPulse',
  vital: 'Vital',
  sole: 'Sole',
  zen: 'Zen',
  'grapes-welcome': 'GrapesJS · Core welcome',
  'grapes-hello': 'GrapesJS · Hello demo',
  'grapes-cli': 'GrapesJS · CLI starter',
};
