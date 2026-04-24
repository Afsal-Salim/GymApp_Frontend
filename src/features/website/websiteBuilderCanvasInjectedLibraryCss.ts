import type { Editor } from 'grapesjs';
import { WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS } from './websiteBuilderConstants';

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
button.component-btn${WB_SKIP_OWN_BG_SHORTHAND},
a.component-btn${WB_SKIP_OWN_BG_SHORTHAND} {
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 42%, #4f46e5 100%) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.32), 0 1px 0 rgba(255, 255, 255, 0.18) inset !important;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
}
button.component-btn:hover,
a.component-btn:hover {
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
  filter: brightness(1.04) !important;
}
button.component-btn:active,
a.component-btn:active {
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

a.component-btn.wb-wa-btn${WB_SKIP_OWN_BG_SHORTHAND},
button.component-btn.wb-wa-btn${WB_SKIP_OWN_BG_SHORTHAND} {
  background: linear-gradient(135deg, #047857 0%, #059669 35%, #10b981 72%, #34d399 100%) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 4px 18px rgba(16, 185, 129, 0.42), 0 1px 0 rgba(255, 255, 255, 0.22) inset !important;
}
a.component-btn.wb-wa-btn:hover,
button.component-btn.wb-wa-btn:hover {
  box-shadow: 0 10px 32px rgba(52, 211, 153, 0.45), 0 1px 0 rgba(255, 255, 255, 0.26) inset !important;
  filter: brightness(1.05) !important;
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
      s.textContent = `${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}\n${WB_CANVAS_COMPONENT_BTN_COERCION}`;
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
