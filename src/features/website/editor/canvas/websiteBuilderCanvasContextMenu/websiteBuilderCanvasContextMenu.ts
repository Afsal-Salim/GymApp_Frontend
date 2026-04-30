import type { Component, Editor } from 'grapesjs';
import {
  bringComponentPaintToFront,
  canDetachFromParentFor,
  canGroupSelection,
  canUngroupFromContextHit,
  canUngroupSelection,
  detachComponentFromParent,
  groupSelected,
  isPaintBackmost,
  isPaintFrontmost,
  parentChildCount,
  sendComponentPaintToBack,
  ungroupFromCanvasContext,
} from '@/features/website/editor/blocks/websiteBuilderLayerGroup/websiteBuilderLayerGroup';
import { applyShapePreset } from '@/features/website/editor/canvas/websiteBuilderComponentShapes/websiteBuilderComponentShapes';
import {
  alignSelectedCenter,
  duplicateSelectedComponent,
} from '@/features/website/editor/tools/websiteBuilderEditorTools';

const MENU_CLASS = 'wb-canvas-ctx-menu';

/** Walk up from text nodes / nested DOM until Grapes resolves a component. */
export function resolveComponentFromPointer(editor: Editor, start: Node | null): Component | undefined {
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

function isGrapesCanvasChromeEl(el: unknown): boolean {
  if (!el || !(el instanceof Element)) return false;
  const cls = typeof el.className === 'string' ? el.className : '';
  if (!/\bgjs-/.test(cls)) return false;
  return (
    /\bgjs-highlighter\b/.test(cls) ||
    /\bgjs-badge\b/.test(cls) ||
    /\bgjs-placeholder\b/.test(cls) ||
    /\bgjs-resizer\b/.test(cls) ||
    /\bgjs-handler\b/.test(cls) ||
    /\bgjs-freezeframe\b/.test(cls)
  );
}

/**
 * Pick the topmost real block under the pointer (skips Grapes overlays), so right-click works
 * over padding, badges, and highlights—not only the deepest DOM node.
 */
export function resolveComponentFromCanvasPoint(
  editor: Editor,
  doc: Document,
  clientX: number,
  clientY: number,
): Component | undefined {
  let stack: Element[] = [];
  try {
    stack = doc.elementsFromPoint(clientX, clientY) as Element[];
  } catch {
    const n = doc.elementFromPoint(clientX, clientY);
    return resolveComponentFromPointer(editor, n);
  }
  for (const el of stack) {
    if (!(el instanceof Element)) continue;
    if (isGrapesCanvasChromeEl(el)) continue;
    const c = resolveComponentFromPointer(editor, el);
    if (c && !c.is('wrapper')) return c;
  }
  return undefined;
}

/**
 * Map iframe-document pointer `clientX` / `clientY` to the **host** viewport (where `position: fixed`
 * menus are placed). Grapes scales/translates the frame, so `frameRect.left + clientX` is wrong when
 * zoom ≠ 1 or the displayed iframe size ≠ the inner layout size.
 */
export function iframePointerClientToHostViewport(
  frameEl: HTMLIFrameElement | null | undefined,
  frameDoc: Document,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  if (!frameEl) return { x: clientX, y: clientY };
  const fr = frameEl.getBoundingClientRect();
  const root = frameDoc.documentElement;
  const body = frameDoc.body;
  const iw = Math.max(1, root.clientWidth || body?.clientWidth || 1);
  const ih = Math.max(1, root.clientHeight || body?.clientHeight || 1);
  return {
    x: fr.left + (clientX / iw) * fr.width,
    y: fr.top + (clientY / ih) * fr.height,
  };
}

/**
 * Map a `getBoundingClientRect()` from the **iframe document** into the same host viewport as
 * `iframePointerClientToHostViewport`, so host overlays (marquee) intersect component bounds correctly.
 */
export function iframeDomRectToHostViewport(
  frameEl: HTMLIFrameElement | null | undefined,
  frameDoc: Document,
  r: DOMRectReadOnly,
): DOMRect {
  if (!frameEl) return new DOMRect(r.left, r.top, r.width, r.height);
  const fr = frameEl.getBoundingClientRect();
  const root = frameDoc.documentElement;
  const body = frameDoc.body;
  const iw = Math.max(1, root.clientWidth || body?.clientWidth || 1);
  const ih = Math.max(1, root.clientHeight || body?.clientHeight || 1);
  const mapX = (x: number) => fr.left + (x / iw) * fr.width;
  const mapY = (y: number) => fr.top + (y / ih) * fr.height;
  const left = mapX(r.left);
  const top = mapY(r.top);
  const right = mapX(r.right);
  const bottom = mapY(r.bottom);
  return new DOMRect(left, top, Math.max(0, right - left), Math.max(0, bottom - top));
}

/** Right-click target: prefer stack hit-test, then walk DOM ancestors (badges / chrome). */
export function resolveContextMenuComponent(
  editor: Editor,
  frameDoc: Document,
  clientX: number,
  clientY: number,
  rawTarget: Node | null,
): Component | undefined {
  const fromPoint = resolveComponentFromCanvasPoint(editor, frameDoc, clientX, clientY);
  if (fromPoint && !fromPoint.is('wrapper')) return fromPoint;
  let n: Node | null = rawTarget;
  for (let i = 0; i < 48 && n; i += 1) {
    const c = resolveComponentFromPointer(editor, n);
    if (c && !c.is('wrapper')) return c;
    n = n.parentNode;
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

/**
 * `Document` is not `contains()`-ed by itself; `e.target` can be the frame `Document` on some
 * right-clicks. Treat those as in-frame so we do not bail (and swallow the native menu) wrongly.
 */
function contextEventTargetInFrameDocument(frameDoc: Document, e: MouseEvent): boolean {
  const raw = e.target as Node | null;
  if (raw === frameDoc) return true;
  if (raw?.nodeType === Node.DOCUMENT_NODE) return true;
  if (raw) {
    try {
      if (frameDoc.contains(raw)) return true;
    } catch {
      /* ignore */
    }
  }
  if (typeof e.composedPath === 'function') {
    for (const n of e.composedPath()) {
      if (n === frameDoc || n === frameDoc.documentElement || n === frameDoc.body) return true;
    }
  }
  return false;
}

/** Grapes badge / toolbar / resizers live in the host under `#…tools`, not in the iframe document. */
function getCanvasToolsHostRoot(editor: Editor): Element | null {
  const cv = editor.Canvas.getElement();
  if (!cv) return null;
  const cfg = (editor.getConfig?.() ?? {}) as { pStylePrefix?: string };
  const ppfx = String(cfg.pStylePrefix ?? '');
  const selectors = [`#${ppfx}tools`, '#gjs-tools', '#tools'] as const;
  for (const sel of selectors) {
    try {
      const el = cv.querySelector(sel);
      if (el) return el;
    } catch {
      /* ignore invalid selector */
    }
  }
  return null;
}

const ctxOpts: AddEventListenerOptions = { capture: true, passive: false };

export type CanvasLayerContextMenuAttachOptions = {
  /**
   * Opens the app inspector: expand the right panel, focus the Basics tab, and optionally select `comp`.
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
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') removeMenu();
    };
    /**
     * Close on “click outside”. `click` in the iframe often never reaches `document` because
     * GrapesJS stops propagation; use `pointerdown` capture on the host window and frame doc instead.
     * Targets inside the iframe are never contained by the host-mounted menu node, so a hit on
     * the menu is only possible when the event target lives in the parent document.
     */
    const onPointerDownClose = (ev: PointerEvent) => {
      if (!menu.isConnected || activeMenu !== menu) return;
      const t = ev.target as Node | null;
      if (t && menu.contains(t)) return;
      removeMenu();
    };
    /* Defer so the opening contextmenu / pointer burst does not immediately dismiss the menu. */
    window.setTimeout(() => {
      if (!menu.isConnected) return;
      window.addEventListener('pointerdown', onPointerDownClose, true);
      fd.addEventListener('pointerdown', onPointerDownClose, true);
      document.addEventListener('keydown', onKey, true);
      closeListeners.push(() => window.removeEventListener('pointerdown', onPointerDownClose, true));
      closeListeners.push(() => fd.removeEventListener('pointerdown', onPointerDownClose, true));
      closeListeners.push(() => document.removeEventListener('keydown', onKey, true));
    }, 0);
  };

  const showContextMenu = (frameDoc: Document, hostX: number, hostY: number, comp: Component | undefined) => {
    if (!comp || comp.is('wrapper')) {
      removeMenu();
      const menu = document.createElement('div');
      menu.className = MENU_CLASS;
      menu.setAttribute('role', 'menu');

      const mkSep = () => {
        const hr = document.createElement('div');
        hr.className = `${MENU_CLASS}__sep`;
        hr.setAttribute('role', 'separator');
        menu.appendChild(hr);
      };

      const mkBtn = (label: string, disabled: boolean, title: string, run: () => void) => {
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
          removeMenu();
        });
        menu.appendChild(b);
      };

      const head = document.createElement('div');
      head.className = `${MENU_CLASS}__head`;
      head.textContent = 'Canvas';
      menu.appendChild(head);
      mkBtn('Open editor panel', false, 'Open the right panel on the Basics tab', () => {
        options?.onOpenInspect?.(editor, null);
      });
      mkSep();
      mkBtn(
        'Group selection',
        !canGroupSelection(editor),
        canGroupSelection(editor) ?
          'Wrap the current multi-selection in one layer group.'
        : 'Select two or more sibling layers (Ctrl/Cmd+click), then group.',
        () => groupSelected(editor),
      );
      (() => {
        const selForUngroup = editor.getSelected() ?? undefined;
        const ungroupDisabled = selForUngroup ?
          !canUngroupFromContextHit(editor, selForUngroup)
        : !canUngroupSelection(editor);
        const ungroupTitle =
          selForUngroup && canUngroupFromContextHit(editor, selForUngroup) ?
            'Lift children out of the layer group.'
          : 'Select a layer group or a block inside a grouped layer.';
        mkBtn('Ungroup', ungroupDisabled, ungroupTitle, () => {
          if (selForUngroup) ungroupFromCanvasContext(editor, selForUngroup);
        });
      })();
      document.body.appendChild(menu);
      activeMenu = menu;
      positionMenu(menu, hostX, hostY);
      wireCloseListeners(menu, frameDoc);
      return;
    }

    const parent = comp.parent();
    if (!parent) {
      removeMenu();
      const menu = document.createElement('div');
      menu.className = MENU_CLASS;
      menu.setAttribute('role', 'menu');
      const mkSep = () => {
        const hr = document.createElement('div');
        hr.className = `${MENU_CLASS}__sep`;
        hr.setAttribute('role', 'separator');
        menu.appendChild(hr);
      };
      const mkBtn = (label: string, disabled: boolean, title: string, run: () => void) => {
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
          removeMenu();
        });
        menu.appendChild(b);
      };
      const head = document.createElement('div');
      head.className = `${MENU_CLASS}__head`;
      head.textContent = 'Canvas';
      menu.appendChild(head);
      mkBtn('Open editor panel', false, 'Open the right panel on the Basics tab', () => {
        options?.onOpenInspect?.(editor, comp);
      });
      mkSep();
      mkBtn(
        'Group selection',
        !canGroupSelection(editor),
        canGroupSelection(editor) ?
          'Wrap the current multi-selection in one layer group.'
        : 'Select two or more sibling layers (Ctrl/Cmd+click), then group.',
        () => groupSelected(editor),
      );
      mkBtn(
        'Ungroup',
        !canUngroupFromContextHit(editor, comp),
        canUngroupFromContextHit(editor, comp) ?
          'Lift children out of the layer group.'
        : 'Select a layer group or right-click a block inside a group.',
        () => ungroupFromCanvasContext(editor, comp),
      );
      document.body.appendChild(menu);
      activeMenu = menu;
      positionMenu(menu, hostX, hostY);
      wireCloseListeners(menu, frameDoc);
      return;
    }

    const len = parentChildCount(parent);
    const locked = Boolean(comp.get('wbLayerLocked'));
    const draggable = comp.get('draggable');
    const canReorder = len > 1 && !locked && draggable !== false;
    const atFront = isPaintFrontmost(comp);
    const atBack = isPaintBackmost(comp);

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
      'Group selection',
      !canGroupSelection(editor),
      canGroupSelection(editor) ?
        'Wrap the current multi-selection in one layer group.'
      : 'Select two or more sibling layers (Ctrl/Cmd+click), then group.',
      () => groupSelected(editor),
      { skipReselect: true },
    );
    mkBtn(
      'Ungroup',
      !canUngroupFromContextHit(editor, comp),
      canUngroupFromContextHit(editor, comp) ?
        'Lift children out of the layer group (this block or its parent group).'
      : 'Select a layer group, or right-click a block that sits inside a group.',
      () => ungroupFromCanvasContext(editor, comp),
      { skipReselect: true },
    );

    mkSep();
    mkBtn(
      'Bring to front',
      !canReorder || atFront,
      !canReorder ?
        locked ?
          'This layer is locked.'
        : 'Nothing to reorder (only one sibling).'
      : atFront ?
        'Already at top of sibling layer stack.'
      : 'Move this layer to top of sibling stack (Canva-like front order).',
      () => bringComponentPaintToFront(comp),
    );
    mkBtn(
      'Send to back',
      !canReorder || atBack,
      !canReorder ?
        locked ?
          'This layer is locked.'
        : 'Nothing to reorder (only one sibling).'
      : atBack ?
        'Already at bottom of sibling layer stack.'
      : 'Move this layer to bottom of sibling stack.',
      () => sendComponentPaintToBack(comp),
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

    const multiSelect = ((editor as unknown as { getSelectedAll?: () => Component[] }).getSelectedAll?.() ?? []).length > 1;
    if (!multiSelect) {
      mkSep();
      mkHead('Shape');
      mkBtn(
        'Default',
        false,
        'Clear rounded corners and clip mask',
        () => applyShapePreset(comp, 'default'),
      );
      mkBtn(
        'Rounded',
        false,
        'Rounded rectangle (16px radius)',
        () => applyShapePreset(comp, 'rounded'),
      );
      mkBtn(
        'Pill',
        false,
        'Fully rounded ends',
        () => applyShapePreset(comp, 'pill'),
      );
      mkBtn(
        'Circle',
        false,
        'Circular mask (square aspect)',
        () => applyShapePreset(comp, 'circle'),
      );
      mkBtn(
        'Star',
        false,
        'Star clip (works best on square blocks)',
        () => applyShapePreset(comp, 'star'),
      );
    }

    mkSep();
    mkHead('Quick edit');
    mkBtn(
      'Duplicate block',
      false,
      'Copy this block right under the original',
      () => {
        try {
          editor.select(comp);
        } catch {
          /* ignore */
        }
        duplicateSelectedComponent(editor);
      },
    );
    mkBtn(
      'Center block',
      false,
      'Centre this block in the row (margin auto)',
      () => {
        try {
          editor.select(comp);
        } catch {
          /* ignore */
        }
        alignSelectedCenter(editor);
      },
    );

    document.body.appendChild(menu);
    activeMenu = menu;
    positionMenu(menu, hostX, hostY);
    wireCloseListeners(menu, frameDoc);
  };

  const onCtx = (e: MouseEvent) => {
    const frameDoc = e.currentTarget as Document;
    if (!frameDoc || frameDoc.nodeType !== 9) return;

    if (!contextEventTargetInFrameDocument(frameDoc, e)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    let target = e.target as Node | null;
    if (target?.nodeType === Node.DOCUMENT_NODE) target = frameDoc.body;
    if (!target) target = frameDoc.body;

    const frameWin = frameDoc.defaultView;
    const frameEl = (frameWin?.frameElement as HTMLIFrameElement | null | undefined) ?? editor.Canvas.getFrameEl();
    const host = iframePointerClientToHostViewport(frameEl ?? undefined, frameDoc, e.clientX, e.clientY);
    const comp = resolveContextMenuComponent(editor, frameDoc, e.clientX, e.clientY, target);
    showContextMenu(frameDoc, host.x, host.y, comp);
  };

  /** Right-click on Grapes host chrome (badge, toolbar) uses the host document — use current selection. */
  const onHostCanvasToolsContextMenu = (e: MouseEvent) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.ownerDocument !== document) return;
    const cv = editor.Canvas.getElement();
    if (!cv?.contains(t)) return;
    const toolsRoot = getCanvasToolsHostRoot(editor);
    if (!toolsRoot?.contains(t)) return;

    const frameDoc = editor.Canvas.getDocument();
    if (!frameDoc) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const sel = editor.getSelected();
    const comp = sel && !sel.is('wrapper') ? sel : undefined;
    showContextMenu(frameDoc, e.clientX, e.clientY, comp);
  };

  const onIframeChromeCtx = (e: MouseEvent) => {
    const frameEl = editor.Canvas.getFrameEl();
    if (frameEl && e.target === frameEl) {
      e.preventDefault();
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

    const canvasHost = editor.Canvas.getElement();
    if (canvasHost) {
      canvasHost.addEventListener('contextmenu', onHostCanvasToolsContextMenu, true);
      detachFns.push(() => canvasHost.removeEventListener('contextmenu', onHostCanvasToolsContextMenu, true));
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
