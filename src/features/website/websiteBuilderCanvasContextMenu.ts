import type { Component, Editor } from 'grapesjs';
import {
  canDetachFromParentFor,
  canGroupSelection,
  canUngroupSelection,
  detachComponentFromParent,
  groupSelected,
  moveToSiblingAt,
  parentChildCount,
  siblingIndex,
  ungroupSelected,
} from './websiteBuilderLayerGroup';

const MENU_CLASS = 'wb-canvas-ctx-menu';

/** Walk up from text nodes / nested DOM until Grapes resolves a component. */
function resolveComponentFromPointer(editor: Editor, start: Node | null): Component | undefined {
  const helpers = editor.Utils as unknown as {
    getComponentModel?: (node: Node) => Component | undefined;
    helpers?: { getComponentModel?: (node: Node) => Component | undefined };
  };
  const gcm = helpers?.getComponentModel ?? helpers?.helpers?.getComponentModel;

  let n: Node | null = start;
  for (let depth = 0; depth < 64 && n; depth += 1, n = n.parentNode) {
    const fromView = gcm?.(n);
    if (fromView) return fromView;
    if (n.nodeType === 1) {
      const id = (n as HTMLElement).getAttribute?.('id');
      if (id) {
        const dc = editor.DomComponents?.getById?.(id) as Component | null | undefined;
        if (dc) return dc;
      }
    }
  }
  return undefined;
}

type FrameLike = {
  view?: {
    getDoc?: () => Document | null | undefined;
    getWindow?: () => Window | null | undefined;
  };
};

/** Primary frame + any extra Grapes frames (e.g. multi-frame previews). */
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

const ctxOpts: AddEventListenerOptions = { capture: true, passive: false };

export type CanvasLayerContextMenuAttachOptions = {
  /**
   * Opens the app inspector: expand the right panel, focus the Content tab, and optionally select `comp`.
   * `comp` is null when the user right-clicks empty canvas / wrapper or non-component chrome.
   */
  onOpenInspect?: (editor: Editor, comp: Component | null) => void;
};

/**
 * Right-click on the canvas: layer menu (order, group, ungroup), plus optional app inspector hook.
 * Listeners are on each canvas `document` (capture); `e.currentTarget` is the frame doc — do not gate on a side Set of Document refs (can miss === and suppress the menu after preventDefault).
 */
export function attachCanvasLayerOrderContextMenu(
  editor: Editor,
  options?: CanvasLayerContextMenuAttachOptions,
): () => void {
  let detachFns: Array<() => void> = [];
  let activeMenu: HTMLDivElement | null = null;
  let closeListeners: Array<() => void> = [];

  const removeMenu = () => {
    if (activeMenu?.isConnected) activeMenu.remove();
    activeMenu = null;
    for (const off of closeListeners) off();
    closeListeners = [];
  };

  const detachFrameListeners = () => {
    for (const off of detachFns) off();
    detachFns = [];
  };

  const onCtx = (e: MouseEvent) => {
    const frameDoc = e.currentTarget as Document;
    if (!frameDoc || frameDoc.nodeType !== 9) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = e.target as Node | null;
    if (!target || !frameDoc.contains(target)) {
      removeMenu();
      options?.onOpenInspect?.(editor, null);
      return;
    }

    const frameWin = frameDoc.defaultView;
    const frameEl = (frameWin?.frameElement as HTMLIFrameElement | null | undefined) ?? editor.Canvas.getFrameEl();
    const rect = (frameEl ?? editor.Canvas.getFrameEl()).getBoundingClientRect();
    const hostX = rect.left + e.clientX;
    const hostY = rect.top + e.clientY;

    const positionMenu = (menu: HTMLDivElement, x: number, y: number) => {
      const pad = 4;
      const mw = menu.offsetWidth;
      const mh = menu.offsetHeight;
      let left = x;
      let top = y;
      if (left + mw + pad > window.innerWidth) left = window.innerWidth - mw - pad;
      if (top + mh + pad > window.innerHeight) top = window.innerHeight - mh - pad;
      if (left < pad) left = pad;
      if (top < pad) top = pad;
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
    };

    const wireCloseListeners = (menu: HTMLDivElement, fd: Document) => {
      const onDocClick = (ev: MouseEvent) => {
        if (!menu.contains(ev.target as Node)) removeMenu();
      };
      const onFrameClick = (ev: MouseEvent) => {
        if (!menu.contains(ev.target as Node)) removeMenu();
      };
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') removeMenu();
      };
      /* Defer so the same contextmenu burst does not fire an immediate document click and dismiss the menu. */
      window.setTimeout(() => {
        if (!menu.isConnected) return;
        document.addEventListener('click', onDocClick);
        fd.addEventListener('click', onFrameClick);
        document.addEventListener('keydown', onKey, true);
        closeListeners.push(() => document.removeEventListener('click', onDocClick));
        closeListeners.push(() => fd.removeEventListener('click', onFrameClick));
        closeListeners.push(() => document.removeEventListener('keydown', onKey, true));
      }, 0);
    };

    const comp = resolveComponentFromPointer(editor, target);

    if (!comp || comp.is('wrapper')) {
      removeMenu();
      options?.onOpenInspect?.(editor, null);
      const menu = document.createElement('div');
      menu.className = MENU_CLASS;
      menu.setAttribute('role', 'menu');
      const head = document.createElement('div');
      head.className = `${MENU_CLASS}__head`;
      head.textContent = 'Canvas';
      menu.appendChild(head);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `${MENU_CLASS}__item`;
      b.textContent = 'Open inspector';
      b.title = 'Open the right panel on the Content tab';
      b.setAttribute('role', 'menuitem');
      b.addEventListener('click', () => {
        options?.onOpenInspect?.(editor, null);
        removeMenu();
      });
      menu.appendChild(b);
      document.body.appendChild(menu);
      activeMenu = menu;
      positionMenu(menu, hostX, hostY);
      wireCloseListeners(menu, frameDoc);
      return;
    }

    const parent = comp.parent();
    if (!parent) {
      removeMenu();
      options?.onOpenInspect?.(editor, comp);
      return;
    }

    options?.onOpenInspect?.(editor, comp);

    const len = parentChildCount(parent);
    const idx = siblingIndex(comp);
    const locked = Boolean(comp.get('wbLayerLocked'));
    const draggable = comp.get('draggable');
    const canReorder = len > 1 && !locked && draggable !== false;
    const atBack = idx <= 0;
    const atFront = idx >= len - 1;

    removeMenu();

    const menu = document.createElement('div');
    menu.className = MENU_CLASS;
    menu.setAttribute('role', 'menu');

    const mkHead = (text: string) => {
      const d = document.createElement('div');
      d.className = `${MENU_CLASS}__head`;
      d.textContent = text;
      menu.appendChild(d);
    };

    const mkSep = () => {
      const hr = document.createElement('div');
      hr.className = `${MENU_CLASS}__sep`;
      hr.setAttribute('role', 'separator');
      menu.appendChild(hr);
    };

    const mkBtn = (label: string, disabled: boolean, title: string, run: () => void, opts?: { skipReselect?: boolean }) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `${MENU_CLASS}__item`;
      b.textContent = label;
      b.disabled = disabled;
      b.title = title;
      b.setAttribute('role', 'menuitem');
      b.addEventListener('click', () => {
        if (b.disabled) return;
        run();
        if (!opts?.skipReselect) {
          try {
            editor.select(comp);
          } catch {
            /* ignore */
          }
        }
        removeMenu();
      });
      menu.appendChild(b);
    };

    mkHead('Layer');
    mkBtn(
      'Move to front',
      !canReorder || atFront,
      !canReorder ?
        locked ?
          'This layer is locked.'
        : 'Nothing to reorder (only one sibling).'
      : atFront ?
        'Already in front.'
      : 'Move above sibling layers in this container.',
      () => moveToSiblingAt(comp, len - 1),
    );
    mkBtn(
      'Move to back',
      !canReorder || atBack,
      !canReorder ?
        locked ?
          'This layer is locked.'
        : 'Nothing to reorder (only one sibling).'
      : atBack ?
        'Already at the back.'
      : 'Move below sibling layers in this container.',
      () => moveToSiblingAt(comp, 0),
    );

    mkSep();
    mkBtn(
      'Lift out of container',
      !canDetachFromParentFor(comp),
      canDetachFromParentFor(comp) ?
        'Make this block a sibling of its parent (independent free-move).'
      : 'Already a top-level page block.',
      () => detachComponentFromParent(editor, comp),
      { skipReselect: true },
    );

    mkSep();
    mkBtn(
      'Group selection',
      !canGroupSelection(editor),
      canGroupSelection(editor) ?
        'Wrap the current multi-selection in one layer group.'
      : 'Select two or more siblings (Ctrl/Cmd+click), then group.',
      () => groupSelected(editor),
      { skipReselect: true },
    );
    mkBtn(
      'Ungroup',
      !canUngroupSelection(editor),
      canUngroupSelection(editor) ?
        'Lift children out of this group wrapper.'
      : 'Select a grouped layer (dashed “Layer group” wrapper) to ungroup.',
      () => ungroupSelected(editor),
      { skipReselect: true },
    );

    document.body.appendChild(menu);
    activeMenu = menu;
    positionMenu(menu, hostX, hostY);
    wireCloseListeners(menu, frameDoc);
  };

  const onIframeChromeCtx = (e: MouseEvent) => {
    const frameEl = editor.Canvas.getFrameEl();
    if (frameEl && e.target === frameEl) {
      e.preventDefault();
      options?.onOpenInspect?.(editor, null);
    }
  };

  const attachToFrame = () => {
    detachFrameListeners();
    removeMenu();

    const docs = collectFrameDocuments(editor);
    for (const doc of docs) {
      doc.addEventListener('contextmenu', onCtx, ctxOpts);
      detachFns.push(() => doc.removeEventListener('contextmenu', onCtx, ctxOpts));
    }

    const frameEl = editor.Canvas.getFrameEl();
    if (frameEl) {
      frameEl.addEventListener('contextmenu', onIframeChromeCtx, true);
      detachFns.push(() => frameEl.removeEventListener('contextmenu', onIframeChromeCtx, true));
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
    removeMenu();
  };
}
