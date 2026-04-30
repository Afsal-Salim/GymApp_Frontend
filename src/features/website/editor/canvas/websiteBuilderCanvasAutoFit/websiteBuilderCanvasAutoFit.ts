import type { Editor } from 'grapesjs';

/** Slightly longer debounce = fewer zoom refits during rapid style edits (lower CPU). */
const DEBOUNCE_MS = 320;

/** Full document scroll size inside the canvas iframe (not just the viewport). */
export function measureIframeContentBox(doc: Document | null | undefined): { w: number; h: number } {
  if (!doc?.documentElement) return { w: 1, h: 1 };
  const root = doc.documentElement;
  const body = doc.body;
  const w = Math.max(root.scrollWidth, root.clientWidth, body?.scrollWidth ?? 0, 1);
  const h = Math.max(root.scrollHeight, root.clientHeight, body?.scrollHeight ?? 0, 1);
  return { w, h };
}

function parseFrameHeight(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const px = raw.match(/^([\d.]+)px$/);
    if (px) return parseFloat(px[1]);
  }
  return null;
}

/**
 * Stretch the Grapes frame to the page’s scroll height so “fit” can include the whole page,
 * not only one viewport slice inside the iframe.
 */
export function syncCanvasFrameHeightToContent(editor: Editor): void {
  try {
    const frame = editor.Canvas.getFrame();
    const doc = editor.Canvas.getDocument();
    if (!frame || !doc?.documentElement) return;

    const { h } = measureIframeContentBox(doc);
    const target = Math.min(Math.max(Math.ceil(h), 240), 48_000);

    const cur = parseFrameHeight(frame.get('height'));
    if (cur !== null && Math.abs(cur - target) < 12) return;

    frame.set({ height: target });
  } catch {
    /* ignore */
  }
}

/**
 * Zoom/pan the Grapes canvas so the page matches **browser-width** behavior (full-bleed hero, no side letterboxing).
 *
 * We intentionally fit **width only** (`ignoreHeight`) so tall pages don’t force a tiny uniform zoom — that was
 * producing large dark gutters left/right in the editor while Preview stayed full-width.
 */
export function fitCanvasPageToEditorViewport(editor: Editor, opts?: { gap?: number; minZoom?: number; maxZoom?: number }): void {
  try {
    const cv = editor.Canvas;
    const doc = cv.getDocument();
    const canvasEl = cv.getElement();
    if (!doc?.documentElement || !canvasEl) return;

    const { w: cw } = measureIframeContentBox(doc);
    const rect = canvasEl.getBoundingClientRect();
    const gap = opts?.gap ?? 14;
    const availW = Math.max(48, rect.width - gap * 2);

    const minZ = opts?.minZoom ?? 4;
    const maxZ = opts?.maxZoom ?? 100;
    const widthRatio = availW / Math.max(1, cw);
    const zoomPct = Math.min(maxZ, Math.max(minZ, widthRatio * 100));

    cv.fitViewport({
      gap,
      zoom: Math.round(zoomPct * 100) / 100,
      ignoreHeight: true,
    });
  } catch {
    /* ignore */
  }
}

export function runCanvasAutoFit(editor: Editor): void {
  syncCanvasFrameHeightToContent(editor);
  fitCanvasPageToEditorViewport(editor);
}

export function createDebouncedCanvasFit(editor: Editor): () => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return () => {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      t = undefined;
      queueMicrotask(() => {
        requestAnimationFrame(() => {
          runCanvasAutoFit(editor);
        });
      });
    }, DEBOUNCE_MS);
  };
}

/** Subscribe Grapes events + return a debounced runner for ResizeObserver. */
export function attachWebsiteBuilderCanvasAutoFit(editor: Editor): {
  detach: () => void;
  debouncedFit: () => void;
} {
  const debouncedFit = createDebouncedCanvasFit(editor);

  const onFrameReady = () => {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        runCanvasAutoFit(editor);
      });
    });
  };

  editor.on('canvas:frame:load', onFrameReady);
  editor.on('canvas:frame:load:body', onFrameReady);

  editor.on('component:add', debouncedFit);
  editor.on('component:remove', debouncedFit);
  editor.on('component:update', debouncedFit);

  return {
    detach: () => {
      editor.off('canvas:frame:load', onFrameReady);
      editor.off('canvas:frame:load:body', onFrameReady);
      editor.off('component:add', debouncedFit);
      editor.off('component:remove', debouncedFit);
      editor.off('component:update', debouncedFit);
    },
    debouncedFit,
  };
}
