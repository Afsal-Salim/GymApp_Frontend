import type { Component, Editor } from 'grapesjs';
import {
  iframeDomRectToHostViewport,
  iframePointerClientToHostViewport,
  resolveComponentFromCanvasPoint,
} from '@/features/website/editor/canvas/websiteBuilderCanvasContextMenu/websiteBuilderCanvasContextMenu';

type FrameLike = {
  view?: {
    getDoc?: () => Document | null | undefined;
  };
};

function collectFrameDocuments(editor: Editor): Document[] {
  const byRef = new Map<Document, Document>();
  const add = (doc: Document | null | undefined) => {
    if (doc) byRef.set(doc, doc);
  };

  add(editor.Canvas.getDocument());

  try {
    const frames = (editor.Canvas as unknown as { getFrames?: () => FrameLike[] }).getFrames?.();
    if (Array.isArray(frames)) {
      for (const fr of frames) {
        add(fr?.view?.getDoc?.() ?? undefined);
      }
    }
  } catch {
    /* ignore */
  }

  return [...byRef.keys()];
}

function topNonWrapperComponent(editor: Editor, doc: Document, x: number, y: number): Component | undefined {
  return resolveComponentFromCanvasPoint(editor, doc, x, y);
}

/** True if `hit` is the selection root or nested inside one of the selected components. */
function hitWithinCurrentSelection(editor: Editor, hit: Component | undefined): boolean {
  if (!hit) return false;
  const all = editor.getSelectedAll();
  if (!all.length) return false;
  const set = new Set(all);
  let cur: Component | undefined = hit;
  while (cur && !cur.is('wrapper')) {
    if (set.has(cur)) return true;
    cur = cur.parent() ?? undefined;
  }
  return false;
}

function rectsIntersect(a: DOMRect, b: DOMRect): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function rectIntersectionArea(a: DOMRect, b: DOMRect): number {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

/** Ignore glancing hits so we do not select every nested text node / chip inside a loose box. */
const MARQUEE_MIN_OVERLAP_FRAC = 0.14;

function marqueeOverlapIsMeaningful(marqueeHost: DOMRect, compHost: DOMRect): boolean {
  const inter = rectIntersectionArea(marqueeHost, compHost);
  if (inter < 4) return false;
  const compArea = Math.max(1, compHost.width * compHost.height);
  const mqArea = Math.max(1, marqueeHost.width * marqueeHost.height);
  return inter / compArea >= MARQUEE_MIN_OVERLAP_FRAC || inter / mqArea >= MARQUEE_MIN_OVERLAP_FRAC;
}

function isAncestorOf(ancestor: Component, comp: Component): boolean {
  let p = comp.parent();
  while (p) {
    if (p === ancestor) return true;
    p = p.parent();
  }
  return false;
}

/** If both a container and its child intersect the marquee, keep the innermost hits only. */
function filterPreferDeepest(hits: Component[]): Component[] {
  return hits.filter((c) => !hits.some((other) => other !== c && isAncestorOf(c, other)));
}

function eachChild(c: Component, fn: (ch: Component) => void) {
  const coll = c.components();
  const len = typeof coll.length === 'number' ? coll.length : 0;
  for (let i = 0; i < len; i++) {
    const ch = typeof coll.at === 'function' ? coll.at(i) : null;
    if (ch) fn(ch);
  }
}

function collectMarqueeHits(
  editor: Editor,
  rectHost: DOMRect,
  frameEl: HTMLIFrameElement,
  frameDoc: Document,
): Component[] {
  const w = editor.getWrapper();
  if (!w) return [];
  const hits: Component[] = [];

  const visit = (c: Component) => {
    if (c.is('wrapper')) {
      eachChild(c, visit);
      return;
    }
    if (c.get('selectable') === false || c.get('wbLayerLocked')) {
      eachChild(c, visit);
      return;
    }
    const el = typeof c.getEl === 'function' ? c.getEl() : null;
    if (el) {
      try {
        if (el.ownerDocument === frameDoc) {
          const br = el.getBoundingClientRect();
          const brHost = iframeDomRectToHostViewport(frameEl, frameDoc, br);
          if (rectsIntersect(brHost, rectHost) && marqueeOverlapIsMeaningful(rectHost, brHost)) hits.push(c);
        }
      } catch {
        /* ignore */
      }
    }
    eachChild(c, visit);
  };

  visit(w);
  return filterPreferDeepest(hits);
}

function clampHostPointToFrame(x: number, y: number, b: DOMRect): { x: number; y: number } {
  return {
    x: Math.min(b.right, Math.max(b.left, x)),
    y: Math.min(b.bottom, Math.max(b.top, y)),
  };
}

function intersectHostRects(a: DOMRect, b: DOMRect): DOMRect {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  const w = Math.max(0, right - left);
  const h = Math.max(0, bottom - top);
  return new DOMRect(left, top, w, h);
}

function applyMarqueeSelection(editor: Editor, picked: Component[]): void {
  const unique = [...new Set(picked)];

  if (!unique.length) {
    const cur = editor.getSelectedAll();
    for (const c of cur) {
      try {
        editor.selectRemove(c);
      } catch {
        /* ignore */
      }
    }
    return;
  }

  const [first, ...rest] = unique;
  try {
    editor.select(first, {});
  } catch {
    /* ignore */
  }
  for (const c of rest) {
    try {
      editor.selectAdd(c);
    } catch {
      /* ignore */
    }
  }
}

const MARQUEE_THRESHOLD_PX = 4;
const OVERLAY_CLASS = 'wb-canvas-marquee';

const docOpts: AddEventListenerOptions = { capture: true, passive: false };
const winOpts: AddEventListenerOptions = { capture: true, passive: false };

type DragState = {
  startHx: number;
  startHy: number;
  /** Canvas iframe bounds in host viewport — marquee is clipped here. */
  frameBounds: DOMRect;
  frameEl: HTMLIFrameElement;
  frameDoc: Document;
  /** Iframe browsing context; move/up may fire here with iframe-local clientX/Y. */
  frameWin: Window | null;
  /** Windows that received pointermove/up listeners for this drag. */
  listenWins: Window[];
  overlay: HTMLDivElement | null;
  active: boolean;
  blockedGrapes: boolean;
  pendingHit?: Component;
};

/** Host viewport XY: iframe-originated events use iframe client coords; parent window uses host client coords. */
function pointerEventToHostViewport(
  ev: PointerEvent,
  frameEl: HTMLIFrameElement,
  frameDoc: Document,
  frameWin: Window | null | undefined,
): { x: number; y: number } {
  const fw = frameWin ?? null;
  const tgt = ev.target;
  let inFrameDoc = false;
  if (tgt instanceof Node) {
    try {
      inFrameDoc = frameDoc.contains(tgt);
    } catch {
      inFrameDoc = false;
    }
  }
  if (fw && ev.view === fw) {
    return iframePointerClientToHostViewport(frameEl, frameDoc, ev.clientX, ev.clientY);
  }
  if (inFrameDoc) {
    return iframePointerClientToHostViewport(frameEl, frameDoc, ev.clientX, ev.clientY);
  }
  return { x: ev.clientX, y: ev.clientY };
}

/**
 * Windows-style box select on the canvas iframe (clipped to the iframe on screen).
 * Host coordinates use `iframePointerClientToHostViewport` so the box tracks the pointer under Grapes zoom.
 */
export function attachCanvasMarqueeSelect(editor: Editor): () => void {
  let detachFns: Array<() => void> = [];
  let drag: DragState | null = null;

  const clearOverlay = () => {
    if (drag?.overlay?.isConnected) drag.overlay.remove();
    if (drag) drag.overlay = null;
  };

  const syncOverlay = (x0: number, y0: number, x1: number, y1: number, bounds: DOMRect) => {
    if (!drag?.overlay) return;
    const p0 = clampHostPointToFrame(x0, y0, bounds);
    const p1 = clampHostPointToFrame(x1, y1, bounds);
    const left = Math.min(p0.x, p1.x);
    const top = Math.min(p0.y, p1.y);
    const w = Math.max(1, Math.abs(p1.x - p0.x));
    const h = Math.max(1, Math.abs(p1.y - p0.y));
    const el = drag.overlay;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
  };

  const detachPointerFollow = (listenWins: Window[]) => {
    for (const w of listenWins) {
      w.removeEventListener('pointermove', onWinMove, winOpts);
      w.removeEventListener('pointerup', onWinUp, winOpts);
      w.removeEventListener('pointercancel', onWinUp, winOpts);
    }
  };

  const onWinMove = (ev: PointerEvent) => {
    if (!drag) return;
    if (drag.blockedGrapes) ev.preventDefault();
    const b = drag.frameBounds;
    const { x: hx, y: hy } = pointerEventToHostViewport(ev, drag.frameEl, drag.frameDoc, drag.frameWin);
    const cur = clampHostPointToFrame(hx, hy, b);
    const dx = cur.x - drag.startHx;
    const dy = cur.y - drag.startHy;
    if (!drag.active) {
      if (dx * dx + dy * dy < MARQUEE_THRESHOLD_PX * MARQUEE_THRESHOLD_PX) return;
      drag.active = true;
      const box = document.createElement('div');
      box.className = OVERLAY_CLASS;
      box.setAttribute('aria-hidden', 'true');
      document.body.appendChild(box);
      drag.overlay = box;
    }
    syncOverlay(drag.startHx, drag.startHy, cur.x, cur.y, b);
  };

  const onWinUp = (ev: PointerEvent) => {
    if (!drag) return;
    const curDrag = drag;
    drag = null;
    detachPointerFollow(curDrag.listenWins);

    if (!curDrag.active) {
      if (curDrag.overlay?.isConnected) curDrag.overlay.remove();
      if (curDrag.blockedGrapes && curDrag.pendingHit) {
        try {
          editor.select(curDrag.pendingHit, { event: ev as unknown as MouseEvent });
        } catch {
          /* ignore */
        }
      }
      return;
    }

    if (curDrag.overlay?.isConnected) curDrag.overlay.remove();
    curDrag.overlay = null;

    const b = curDrag.frameBounds;
    const { x: endHx, y: endHy } = pointerEventToHostViewport(
      ev,
      curDrag.frameEl,
      curDrag.frameDoc,
      curDrag.frameWin,
    );
    const end = clampHostPointToFrame(endHx, endHy, b);

    if (
      Math.abs(end.x - curDrag.startHx) < MARQUEE_THRESHOLD_PX &&
      Math.abs(end.y - curDrag.startHy) < MARQUEE_THRESHOLD_PX
    ) {
      return;
    }

    const raw = new DOMRect(
      Math.min(curDrag.startHx, end.x),
      Math.min(curDrag.startHy, end.y),
      Math.max(1, Math.abs(end.x - curDrag.startHx)),
      Math.max(1, Math.abs(end.y - curDrag.startHy)),
    );
    const rect = intersectHostRects(raw, b);
    if (rect.width < 1 || rect.height < 1) {
      try {
        editor.select([], {});
      } catch {
        /* ignore */
      }
      return;
    }
    const picked = collectMarqueeHits(editor, rect, curDrag.frameEl, curDrag.frameDoc);
    applyMarqueeSelection(editor, picked);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const frameDoc = e.currentTarget as Document;
    if (!frameDoc || frameDoc.nodeType !== 9) return;

    try {
      if (editor.getEditing?.()) return;
    } catch {
      /* ignore */
    }

    if (e.shiftKey || e.ctrlKey || e.metaKey) return;

    const t = e.target as Node | null;
    if (t && frameDoc.contains(t)) {
      let el: Element | null = t instanceof Element ? t : t.parentElement;
      for (let i = 0; i < 8 && el; i += 1, el = el.parentElement) {
        if (el instanceof HTMLElement && el.closest?.('[data-wb-marquee-ignore]')) return;
      }
    }

    const hit = topNonWrapperComponent(editor, frameDoc, e.clientX, e.clientY);
    const empty = !hit;

    if (!empty && hitWithinCurrentSelection(editor, hit)) return;

    const frameEl = editor.Canvas.getFrameEl();
    const fr = frameEl?.getBoundingClientRect();
    if (!fr || !frameEl) return;

    const host = iframePointerClientToHostViewport(frameEl, frameDoc, e.clientX, e.clientY);
    const start = clampHostPointToFrame(host.x, host.y, fr);

    const blockedGrapes = Boolean(!empty && hit);
    if (blockedGrapes) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }

    const frameWin = frameDoc.defaultView;
    const listenWins =
      frameWin && frameWin !== window ? [window, frameWin] : [window];

    drag = {
      startHx: start.x,
      startHy: start.y,
      frameBounds: fr,
      frameEl,
      frameDoc,
      frameWin,
      listenWins,
      overlay: null,
      active: false,
      blockedGrapes,
      pendingHit: hit,
    };

    for (const w of listenWins) {
      w.addEventListener('pointermove', onWinMove, winOpts);
      w.addEventListener('pointerup', onWinUp, winOpts);
      w.addEventListener('pointercancel', onWinUp, winOpts);
    }
  };

  const attachToFrame = () => {
    for (const off of detachFns) off();
    detachFns = [];
    if (drag?.listenWins?.length) detachPointerFollow(drag.listenWins);
    else detachPointerFollow([window]);
    clearOverlay();
    drag = null;

    for (const doc of collectFrameDocuments(editor)) {
      doc.addEventListener('pointerdown', onPointerDown, docOpts);
      detachFns.push(() => doc.removeEventListener('pointerdown', onPointerDown, docOpts));
    }
  };

  editor.on('canvas:frame:load', attachToFrame);
  editor.on('canvas:frame:load:body', attachToFrame);
  editor.on('load', attachToFrame);
  queueMicrotask(attachToFrame);
  const t = window.setTimeout(attachToFrame, 400);

  const onUnload = () => {
    for (const off of detachFns) off();
    detachFns = [];
    if (drag?.listenWins?.length) detachPointerFollow(drag.listenWins);
    else detachPointerFollow([window]);
    clearOverlay();
    drag = null;
  };
  editor.on('canvas:frame:unload', onUnload);

  return () => {
    window.clearTimeout(t);
    editor.off('canvas:frame:load', attachToFrame);
    editor.off('canvas:frame:load:body', attachToFrame);
    editor.off('load', attachToFrame);
    editor.off('canvas:frame:unload', onUnload);
    for (const off of detachFns) off();
    detachFns = [];
    if (drag?.listenWins?.length) detachPointerFollow(drag.listenWins);
    else detachPointerFollow([window]);
    clearOverlay();
    drag = null;
  };
}
