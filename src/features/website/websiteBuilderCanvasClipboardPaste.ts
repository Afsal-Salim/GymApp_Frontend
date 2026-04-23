import type { Component, Editor } from 'grapesjs';
import { nameLastAddedLayer } from './websiteBuilderInspector';

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

function isEditableField(n: Node | null): boolean {
  let el: Element | null = n instanceof Element ? n : n?.parentElement ?? null;
  for (let i = 0; i < 12 && el; i += 1, el = el.parentElement) {
    if (el instanceof HTMLElement && el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  }
  return false;
}

function looksLikeMarkup(s: string): boolean {
  const t = s.trim();
  return t.startsWith('<') && />/.test(t);
}

function extractUserHtmlFromClipboardHtml(html: string): string {
  const s = html.trim();
  if (!s) return '';
  const frag = s.match(/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/);
  if (frag) return frag[1].trim();
  try {
    const d = new DOMParser().parseFromString(s, 'text/html');
    const body = d.body;
    if (body?.childNodes.length) return body.innerHTML.trim();
  } catch {
    /* ignore */
  }
  return s;
}

function pickHtmlPayload(html: string, plain: string): string | null {
  const h = html.trim();
  if (h && (h.includes('<') || h.includes('&lt;'))) {
    const extracted = extractUserHtmlFromClipboardHtml(html);
    return extracted.trim() ? extracted : null;
  }
  const p = plain.trim();
  if (looksLikeMarkup(p)) return p;
  return null;
}

function resolvePasteTarget(editor: Editor): Component | null {
  const wrapper = editor.getWrapper();
  if (!wrapper) return null;
  const sel = editor.getSelected();
  if (!sel || sel.is('wrapper')) return wrapper;
  if (sel.get('droppable') === false) return sel.parent() || wrapper;
  return sel;
}

const pasteOpts: AddEventListenerOptions = { capture: true };

/**
 * Clipboard paste inside the canvas iframe: HTML fragments (e.g. “Copy HTML” from the library)
 * and Grapes internal copy/paste when the iframe is focused (parent keymaps do not see keydown).
 */
export function attachCanvasClipboardPaste(editor: Editor): () => void {
  let detachFns: Array<() => void> = [];

  const detachFrameListeners = () => {
    for (const off of detachFns) off();
    detachFns = [];
  };

  const onPaste = (e: ClipboardEvent) => {
    if (isEditableField(e.target as Node | null)) return;

    const cd = e.clipboardData;
    if (!cd) return;

    const htmlRaw = cd.getData('text/html') || '';
    const plain = cd.getData('text/plain') || cd.getData('Text') || '';
    const payload = pickHtmlPayload(htmlRaw, plain);

    if (payload) {
      e.preventDefault();
      e.stopPropagation();
      const target = resolvePasteTarget(editor);
      if (!target) return;
      try {
        target.append(payload);
        nameLastAddedLayer(target);
      } catch {
        /* ignore malformed fragments */
      }
      return;
    }

    const em = editor.getModel();
    const clp = em.get('clipboard') as Component[] | undefined;
    if (clp?.length && editor.getSelected()) {
      e.preventDefault();
      e.stopPropagation();
      try {
        editor.runCommand('core:paste');
      } catch {
        /* ignore */
      }
    }
  };

  const attachToFrame = () => {
    detachFrameListeners();
    const docs = collectFrameDocuments(editor);
    for (const doc of docs) {
      doc.addEventListener('paste', onPaste, pasteOpts);
      detachFns.push(() => doc.removeEventListener('paste', onPaste, pasteOpts));
    }
  };

  editor.on('canvas:frame:load', attachToFrame);
  editor.on('canvas:frame:load:body', attachToFrame);
  editor.on('load', attachToFrame);
  queueMicrotask(attachToFrame);
  const t = window.setTimeout(attachToFrame, 400);

  const onUnload = () => {
    detachFrameListeners();
  };
  editor.on('canvas:frame:unload', onUnload);

  return () => {
    window.clearTimeout(t);
    editor.off('canvas:frame:load', attachToFrame);
    editor.off('canvas:frame:load:body', attachToFrame);
    editor.off('load', attachToFrame);
    editor.off('canvas:frame:unload', onUnload);
    detachFrameListeners();
  };
}
