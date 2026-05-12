import type { Editor } from 'grapesjs';
import { WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS } from '@/features/website/editor/shared/websiteBuilderConstants/websiteBuilderConstants';

const WB_CANVAS_INJECTED_LIBRARY_ID = 'wb-canvas-injected-component-library';

/**
 * Grapes emits per-component rules like `#<cid> { background-color: … }` (ID specificity). Those
 * always beat `button.component-btn` / attribute variants in the library sheet, so CTAs render as
 * flat greys (#efefef). This tail repeats the library gradients with `!important`
 * so **background** wins over composer `#id` rules. We intentionally do **not** set `color` with
 * `!important` here — that would beat the Style Manager’s `#<cid> { color: … }` and make the panel
 * disagree with what you see (and with preview, which has no this tail).
 */
/**
 * Skip coercion only when the author used the CSS `background:` shorthand in `style` (e.g. custom
 * gradients). Do **not** match `background-color:` — Grapes misclassified `.component-btn` buttons
 * often get `background-color` from the text component, and `*:not([style*="background"])` would
 * wrongly exclude them from the !important tail.
 */
const WB_SKIP_OWN_BG_SHORTHAND = ':not([style*="background:"]):not([style*="Background:"])';

const WB_CANVAS_COMPONENT_BTN_COERCION = `
button.component-btn:not(.wb-wa-btn)${WB_SKIP_OWN_BG_SHORTHAND},
a.component-btn:not(.wb-wa-btn)${WB_SKIP_OWN_BG_SHORTHAND} {
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 42%, #4f46e5 100%) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.32), 0 1px 0 rgba(255, 255, 255, 0.18) inset !important;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
}
button.component-btn:not(.wb-wa-btn):hover,
a.component-btn:not(.wb-wa-btn):hover {
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
  filter: brightness(1.04) !important;
}
button.component-btn:not(.wb-wa-btn):active,
a.component-btn:not(.wb-wa-btn):active {
  filter: brightness(0.97) !important;
}

button.component-btn[data-wb-open='visit']${WB_SKIP_OWN_BG_SHORTHAND},
a.component-btn[data-wb-open='visit']${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #0f766e 0%, #0e7490 38%, #06b6d4 100%) !important;
  border-color: rgba(255, 255, 255, 0.16) !important;
  box-shadow: 0 4px 18px rgba(6, 182, 212, 0.35), 0 1px 0 rgba(255, 255, 255, 0.2) inset !important;
}
button.component-btn[data-wb-open='visit']:hover,
a.component-btn[data-wb-open='visit']:hover {
  box-shadow: 0 10px 30px rgba(6, 182, 212, 0.48), 0 1px 0 rgba(255, 255, 255, 0.24) inset !important;
}

button.component-btn[data-wb-open='trial']${WB_SKIP_OWN_BG_SHORTHAND},
a.component-btn[data-wb-open='trial']${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #c2410c 0%, #ea580c 45%, #f59e0b 100%) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 4px 18px rgba(234, 88, 12, 0.38), 0 1px 0 rgba(255, 255, 255, 0.2) inset !important;
}
button.component-btn[data-wb-open='trial']:hover,
a.component-btn[data-wb-open='trial']:hover {
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}

button.component-btn[data-wb-open='enquiry']${WB_SKIP_OWN_BG_SHORTHAND},
a.component-btn[data-wb-open='enquiry']${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 48%, #a855f7 100%) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 4px 18px rgba(124, 58, 237, 0.38), 0 1px 0 rgba(255, 255, 255, 0.2) inset !important;
}
button.component-btn[data-wb-open='enquiry']:hover,
a.component-btn[data-wb-open='enquiry']:hover {
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}

a.component-btn[href^='tel:']${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 4px 18px rgba(234, 88, 12, 0.38), 0 1px 0 rgba(255, 255, 255, 0.18) inset !important;
}
a.component-btn[href^='tel:']:hover {
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}

a.component-btn[href^='mailto:']${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #3730a3 0%, #4f46e5 42%, #6366f1 100%) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 4px 18px rgba(79, 70, 229, 0.35), 0 1px 0 rgba(255, 255, 255, 0.2) inset !important;
}
a.component-btn[href^='mailto:']:hover {
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}

.wb-enquiry-slide .component-btn.wb-enquiry-slide__toggle${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 48%, #a855f7 100%) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 4px 18px rgba(124, 58, 237, 0.38), 0 1px 0 rgba(255, 255, 255, 0.2) inset !important;
}
.wb-enquiry-slide .component-btn.wb-enquiry-slide__toggle:hover {
  box-shadow: 0 10px 30px rgba(168, 85, 247, 0.45), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}

a.component-btn[download]:not(.wb-wa-btn)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #334155 0%, #475569 55%, #64748b 100%) !important;
  border-color: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.22), 0 1px 0 rgba(255, 255, 255, 0.14) inset !important;
}
a.component-btn[download]:not(.wb-wa-btn):hover {
  box-shadow: 0 10px 28px rgba(51, 65, 85, 0.35), 0 1px 0 rgba(255, 255, 255, 0.18) inset !important;
}
`;

/**
 * Design-system templates (ELITE/FOCUS/ENERGY/PRIME/SPORTY/POWER/GLASSMORPH/CYBERFIT/JUNGLEBEAST/LIQUIDFIT/VINTAGEIRON)
 * mostly use `.wb-sys-btn` instead of `.component-btn`. Grapes can inject per-node `background-color` rules
 * that flatten these themed gradients in canvas (a `#cid` rule beats normal class selectors).
 * Mirror key themed button backgrounds with `!important`, same strategy as `component-btn` coercion above —
 * this is the same defensive pattern used for `.wb-wa-btn` WhatsApp CTAs (see comments at the top of this file).
 */
const WB_CANVAS_DS_SYS_BTN_COERCION = `
.wb-ds-root .wb-sys--elite .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #0052cc, #0066ff 52%, #3385ff) !important;
  border-color: rgba(0, 102, 255, 0.25) !important;
  box-shadow: 0 8px 26px rgba(0, 102, 255, 0.32) !important;
}
.wb-ds-root .wb-sys--focus .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #6a9a2e, #9ccf3f 52%, #c8e877) !important;
  color: #0a0f06 !important;
  border-color: rgba(200, 232, 119, 0.45) !important;
  box-shadow: 0 10px 32px rgba(156, 207, 63, 0.32) !important;
}
.wb-ds-root .wb-sys--energy .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #e65c00, #ff6600 50%, #ff8533) !important;
  border-color: rgba(255, 102, 0, 0.35) !important;
  box-shadow: 0 8px 26px rgba(255, 102, 0, 0.32) !important;
}
.wb-ds-root .wb-sys--prime .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #6b21a8, #a855f7 48%, #d8b4fe) !important;
  border-color: rgba(233, 213, 254, 0.45) !important;
  box-shadow: 0 10px 32px rgba(109, 40, 217, 0.42) !important;
}
.wb-ds-root .wb-sys--sporty .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #00838b, #00a3ad 52%, #33b8c0) !important;
  border-color: rgba(0, 163, 173, 0.35) !important;
  box-shadow: 0 8px 26px rgba(0, 163, 173, 0.28) !important;
}
.wb-ds-root .wb-sys--glassmorph .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #6f8cff 0%, #79bcff 100%) !important;
  border-color: rgba(89, 130, 246, 0.48) !important;
  box-shadow: 0 10px 24px rgba(92, 132, 235, 0.35) !important;
}
.wb-ds-root .wb-sys--cyberfit .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(90deg, #9c0084 0%, #ff00ff 55%, #c026d3 100%) !important;
  border-color: rgba(255, 0, 255, 0.45) !important;
  box-shadow: 0 0 18px rgba(255, 0, 255, 0.35), 0 8px 28px rgba(156, 0, 132, 0.35) !important;
}
.wb-ds-root .wb-sys--power .wb-sys-btn:not(.wb-sys-btn--ghost)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #b91c1c, #dc2626 55%, #ef4444) !important;
  border-color: rgba(248, 113, 113, 0.35) !important;
  box-shadow: 0 8px 28px rgba(220, 38, 38, 0.4) !important;
}
.wb-ds-root .wb-sys--junglebeast .wb-sys-btn:not(.wb-sys-btn--ghost):not(.wb-sys-btn--jng-pill)${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(180deg, #d9f99d 0%, #bef264 40%, #84cc16 100%) !important;
  color: #0f172a !important;
  -webkit-text-fill-color: #0f172a !important;
  border-color: rgba(132, 204, 22, 0.75) !important;
  box-shadow: 0 0 18px rgba(190, 242, 100, 0.28), 0 6px 20px rgba(0, 0, 0, 0.5) !important;
}
.wb-ds-root .wb-sys--junglebeast .wb-sys-btn--jng-pill${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(180deg, #d9f99d 0%, #bef264 45%, #84cc16 100%) !important;
  color: #0f172a !important;
  -webkit-text-fill-color: #0f172a !important;
  border-color: rgba(190, 242, 100, 0.65) !important;
  box-shadow: 0 0 20px rgba(190, 242, 100, 0.35), 0 8px 22px rgba(0, 0, 0, 0.45) !important;
}
.wb-ds-root .wb-sys--liquidfit .wb-sys-btn:not(.wb-sys-btn--ghost):not(.wb-sys-btn--liq-ghost):not(.wb-sys-btn--liq-solid):not(.wb-sys-btn--liq-outline)${WB_SKIP_OWN_BG_SHORTHAND},
.wb-ds-root .wb-sys--liquidfit .wb-sys-btn--liq-gradient${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(90deg, #2563eb, #a855f7, #d946ef) !important;
  border-color: transparent !important;
  box-shadow: 0 0 28px rgba(168, 85, 247, 0.35) !important;
}
.wb-ds-root .wb-sys--liquidfit .wb-sys-btn--liq-solid${WB_SKIP_OWN_BG_SHORTHAND} {
  background: #fff !important;
  color: #0f172a !important;
  -webkit-text-fill-color: #0f172a !important;
  border-color: rgba(255, 255, 255, 0.7) !important;
}
.wb-ds-root .wb-sys--vintageiron .wb-sys-btn:not(.wb-sys-btn--ghost):not(.wb-sys-btn--vin-outline)${WB_SKIP_OWN_BG_SHORTHAND},
.wb-ds-root .wb-sys--vintageiron .wb-sys-btn--vin-bronze${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(180deg, #e3bc5c 0%, #b8860b 45%, #8a6a1f 100%) !important;
  color: #1a1208 !important;
  -webkit-text-fill-color: #1a1208 !important;
  border-color: rgba(90, 70, 35, 0.85) !important;
  box-shadow: 0 0 14px rgba(201, 162, 39, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
}

.wb-ds-root .wb-sys--elite .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: transparent !important;
  border-color: rgba(37, 99, 235, 0.28) !important;
}
.wb-ds-root .wb-sys--focus .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(248, 250, 252, 0.45) !important;
}
.wb-ds-root .wb-sys--energy .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: #fff !important;
  border-color: rgba(214, 211, 209, 0.95) !important;
}
.wb-ds-root .wb-sys--prime .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: rgba(255, 255, 255, 0.04) !important;
  border-color: rgba(233, 213, 254, 0.42) !important;
}
.wb-ds-root .wb-sys--sporty .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: #fff !important;
  border-color: rgba(0, 163, 173, 0.45) !important;
}
.wb-ds-root .wb-sys--glassmorph .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: rgba(255, 255, 255, 0.62) !important;
  border-color: rgba(113, 149, 255, 0.38) !important;
}
.wb-ds-root .wb-sys--cyberfit .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.12) !important;
}
.wb-ds-root .wb-sys--power .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: transparent !important;
  border-color: rgba(248, 113, 113, 0.45) !important;
}
.wb-ds-root .wb-sys--junglebeast .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: transparent !important;
  border-color: rgba(255, 255, 255, 0.55) !important;
}
.wb-ds-root .wb-sys--liquidfit .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND},
.wb-ds-root .wb-sys--liquidfit .wb-sys-btn--liq-ghost${WB_SKIP_OWN_BG_SHORTHAND} {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(148, 163, 184, 0.35) !important;
}
.wb-ds-root .wb-sys--liquidfit .wb-sys-btn--liq-outline${WB_SKIP_OWN_BG_SHORTHAND} {
  background: transparent !important;
  border-color: rgba(255, 255, 255, 0.55) !important;
}
.wb-ds-root .wb-sys--vintageiron .wb-sys-btn--ghost${WB_SKIP_OWN_BG_SHORTHAND},
.wb-ds-root .wb-sys--vintageiron .wb-sys-btn--vin-outline${WB_SKIP_OWN_BG_SHORTHAND} {
  background: transparent !important;
  border-color: rgba(212, 168, 75, 0.75) !important;
}
`;

function shouldSkipCanvasFrameDoc(doc: Document | null | undefined): boolean {
  if (!doc) return true;
  const href = String(doc.defaultView?.location?.href ?? '');
  if (!href) return false;
  if (/^https?:\/\//i.test(href)) return true;
  return false;
}

/**
 * Injects component library CSS into the **canvas iframe** and keeps the `<style>` node at the
 * **end of `body`** so it wins over composer rules after Grapes finishes mounting CssRulesView.
 */
export function attachCanvasInjectedComponentLibraryCss(editor: Editor): () => void {
  let t1 = 0;
  let t2 = 0;
  let tDebounce = 0;

  const bumpToBodyEnd = () => {
    try {
      const doc = editor.Canvas?.getDocument?.();
      if (!doc?.body || shouldSkipCanvasFrameDoc(doc)) return;
      let s = doc.getElementById(WB_CANVAS_INJECTED_LIBRARY_ID) as HTMLStyleElement | null;
      if (!s) {
        s = doc.createElement('style');
        s.id = WB_CANVAS_INJECTED_LIBRARY_ID;
      }
      s.textContent = `${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}\n${WB_CANVAS_COMPONENT_BTN_COERCION}\n${WB_CANVAS_DS_SYS_BTN_COERCION}`;
      doc.body.appendChild(s);
    } catch {
      /* ignore */
    }
  };

  const schedule = () => {
    bumpToBodyEnd();
    queueMicrotask(bumpToBodyEnd);
    requestAnimationFrame(() => {
      bumpToBodyEnd();
      requestAnimationFrame(bumpToBodyEnd);
    });
    window.clearTimeout(t1);
    window.clearTimeout(t2);
    t1 = window.setTimeout(bumpToBodyEnd, 40);
    t2 = window.setTimeout(bumpToBodyEnd, 200);
  };

  const scheduleDebounced = () => {
    window.clearTimeout(tDebounce);
    tDebounce = window.setTimeout(schedule, 90);
  };

  editor.on('canvas:frame:load', schedule);
  editor.on('canvas:frame:load:body', schedule);
  editor.on('load', schedule);
  editor.on('component:add', scheduleDebounced);
  editor.on('component:update', scheduleDebounced);
  editor.on('project:loaded', schedule);
  editor.on('style:target', scheduleDebounced);
  queueMicrotask(schedule);

  return () => {
    window.clearTimeout(t1);
    window.clearTimeout(t2);
    window.clearTimeout(tDebounce);
    try {
      editor.off('canvas:frame:load', schedule);
      editor.off('canvas:frame:load:body', schedule);
      editor.off('load', schedule);
      editor.off('component:add', scheduleDebounced);
      editor.off('component:update', scheduleDebounced);
      editor.off('project:loaded', schedule);
      editor.off('style:target', scheduleDebounced);
    } catch {
      /* ignore */
    }
  };
}
