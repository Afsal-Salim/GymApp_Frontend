import type { Component, Editor } from 'grapesjs';

/** Marks a user “layer group” wrapper (inserted blocks + manual groups). */
export const WB_LAYER_GROUP_ATTR = 'data-wb-layer-group';

const WB_TLB_FRONT = 'wb-tlb-front';
const WB_TLB_BACK = 'wb-tlb-back';
const WB_TLB_GROUP = 'wb-tlb-group';
const WB_TLB_UNGROUP = 'wb-tlb-ungroup';
const WB_TLB_DETACH = 'wb-tlb-detach';

const CANVAS_GROUP_CSS_ID = 'wb-canvas-layer-group-rules';
const CANVAS_POS_REF_ID = 'wb-canvas-position-ref';

/** Stable anchor in the page (invisible) — stacking context reference; does not affect layout. */
function injectCanvasPositionReferenceEl(doc: Document) {
  if (!doc.body || doc.getElementById(CANVAS_POS_REF_ID)) return;
  const el = doc.createElement('div');
  el.id = CANVAS_POS_REF_ID;
  el.className = 'wb-canvas-position-ref';
  el.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(el);
}

function patchDefaultToolbarItemTitles(comp: Component) {
  if (!comp || comp.is('wrapper')) return;
  const tlb = comp.get('toolbar') as unknown as { models?: Array<{ get: (k: string) => unknown; set: (k: string, v: unknown) => void }> };
  if (!Array.isArray(tlb?.models)) return;
  for (const m of tlb.models) {
    const cmd = m.get('command');
    let hint: string | undefined;
    let shortLabel: string | undefined;
    if (typeof cmd === 'function') {
      hint = 'Select parent — edit the section or container above';
      shortLabel = 'Move up';
    } else if (cmd === 'tlb-move') {
      hint = 'Move — drag to reposition (free move on page)';
      shortLabel = 'Move';
    } else if (cmd === 'tlb-clone') {
      hint = 'Duplicate this block';
      shortLabel = 'Duplicate';
    } else if (cmd === 'tlb-delete') {
      hint = 'Delete from page';
      shortLabel = 'Delete';
    } else if (cmd === WB_TLB_DETACH) {
      hint = 'Lift out — parent no longer moves this block with it';
      shortLabel = 'Lift out';
    } else if (cmd === WB_TLB_FRONT) {
      hint = 'Bring to front — move this layer to top of sibling stack (Canva-like order)';
      shortLabel = 'To front';
    } else if (cmd === WB_TLB_BACK) {
      hint = 'Send to back — move this layer to bottom of sibling stack';
      shortLabel = 'To back';
    } else if (cmd === WB_TLB_GROUP) {
      hint = 'Group — multi-select with Ctrl/Cmd+click, or drag on empty / unselected area to box-select';
      shortLabel = 'Group';
    } else if (cmd === WB_TLB_UNGROUP) {
      hint = 'Ungroup — lift children out of this group';
      shortLabel = 'Ungroup';
    }
    if (!shortLabel) continue;
    const attrs = (m.get('attributes') as Record<string, string> | undefined) ?? {};
    m.set('attributes', {
      ...attrs,
      title: attrs.title || hint || shortLabel,
      'data-wb-toolbar-label': shortLabel,
    });
  }
}

export function siblingIndex(comp: Component): number {
  const fn = (comp as unknown as { index?: () => number }).index;
  if (typeof fn === 'function') {
    try {
      const n = fn();
      if (Number.isFinite(n)) return n;
    } catch {
      /* Detached/partial models can throw (e.g. missing backbone collection). Fall back below. */
    }
  }

  const parent = comp.parent();
  if (!parent) return 0;
  const coll = parent.components();
  const len = typeof coll.length === 'number' ? coll.length : 0;
  for (let i = 0; i < len; i += 1) {
    const cur = typeof coll.at === 'function' ? coll.at(i) : null;
    if (cur === comp) return i;
  }
  return 0;
}

export function parentChildCount(parent: Component): number {
  const coll = parent.components();
  return typeof coll.length === 'number' ? coll.length : 0;
}

/** Sync stacking among direct siblings (paint order + z-index for overlaps). */
export function syncZIndexAmongSiblings(parent: Component) {
  const coll = parent.components();
  const len = typeof coll.length === 'number' ? coll.length : 0;
  for (let i = 0; i < len; i++) {
    const c = typeof coll.at === 'function' ? coll.at(i) : null;
    if (!c || c.is('wrapper')) continue;
    try {
      /* Only z-index — do not force `position: relative` (conflicts with translate-drag & free layout). */
      c.addStyle({ zIndex: String(10 + i) });
    } catch {
      /* ignore */
    }
  }
}

export function moveToSiblingAt(comp: Component, at: number) {
  const parent = comp.parent();
  if (!parent) return;
  const len = parentChildCount(parent);
  if (len <= 1) return;
  const clamped = Math.max(0, Math.min(len - 1, at));
  const mover = comp as unknown as { move?: (p: Component, o: { at: number }) => void };
  if (typeof mover.move === 'function') {
    mover.move(parent, { at: clamped });
    syncZIndexAmongSiblings(parent);
  }
}

/** Parsed stacking z-index from the rendered element (handles Grapes translate-drag, etc.). */
export function computedStackingZ(comp: Component): number {
  try {
    const el = comp.getEl?.();
    if (!el) return 0;
    const z = getComputedStyle(el).zIndex;
    if (!z || z === 'auto') return 0;
    const n = Number(z);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function eachDirectSibling(comp: Component, fn: (s: Component) => void) {
  const p = comp.parent();
  if (!p) return;
  const coll = p.components();
  const len = typeof coll.length === 'number' ? coll.length : 0;
  for (let i = 0; i < len; i += 1) {
    const s = typeof coll.at === 'function' ? coll.at(i) : null;
    if (s && !s.is('wrapper') && s !== comp) fn(s);
  }
}

export function maxSiblingPaintZ(comp: Component): number {
  let m = -Infinity;
  eachDirectSibling(comp, (s) => {
    m = Math.max(m, computedStackingZ(s));
  });
  if (!Number.isFinite(m)) return 0;
  return m;
}

export function minSiblingPaintZ(comp: Component): number {
  let m = Infinity;
  eachDirectSibling(comp, (s) => {
    m = Math.min(m, computedStackingZ(s));
  });
  if (!Number.isFinite(m)) return 0;
  return m;
}

export function isPaintFrontmost(comp: Component): boolean {
  const parent = comp.parent();
  if (!parent) return true;
  const len = parentChildCount(parent);
  return len <= 1 || siblingIndex(comp) >= len - 1;
}

export function isPaintBackmost(comp: Component): boolean {
  const parent = comp.parent();
  if (!parent) return true;
  return parentChildCount(parent) <= 1 || siblingIndex(comp) <= 0;
}

/** Canva-style front: move to the end of sibling stack, then normalize z-indexes. */
export function bringComponentPaintToFront(comp: Component): void {
  if (!comp || comp.is('wrapper')) return;
  const p = comp.parent();
  if (!p) return;
  if (parentChildCount(p) <= 1) return;
  moveToSiblingAt(comp, parentChildCount(p) - 1);
}

/** Canva-style back: move to the start of sibling stack, then normalize z-indexes. */
export function sendComponentPaintToBack(comp: Component): void {
  if (!comp || comp.is('wrapper')) return;
  const p = comp.parent();
  if (!p) return;
  if (parentChildCount(p) <= 1) return;
  moveToSiblingAt(comp, 0);
}

export function isWbLayerGroup(comp: Component): boolean {
  if (comp.is('wrapper')) return false;
  const attrs = (comp.getAttributes?.() ?? {}) as Record<string, string>;
  return attrs[WB_LAYER_GROUP_ATTR] === '1';
}

export function canGroupSelection(editor: Editor): boolean {
  const all = editor.getSelectedAll();
  if (all.length < 2) return false;
  const p = all[0]?.parent();
  if (!p || all.some((c) => c.parent() !== p)) return false;
  if (all.some((c) => c.is('wrapper'))) return false;
  return true;
}

/** True if this component is a user layer group that still has children to lift out. */
export function canUngroupLayerGroup(group: Component | null | undefined): boolean {
  return Boolean(group && !group.is('wrapper') && isWbLayerGroup(group) && parentChildCount(group) >= 1);
}

export function canUngroupSelection(editor: Editor): boolean {
  return canUngroupLayerGroup(editor.getSelected());
}

/** Nearest `data-wb-layer-group` wrapper walking up from `comp` (including `comp` itself). */
export function findEnclosingWbLayerGroup(comp: Component | null | undefined): Component | undefined {
  let cur: Component | null | undefined = comp;
  while (cur && !cur.is('wrapper')) {
    if (isWbLayerGroup(cur)) return cur;
    cur = cur.parent();
  }
  return undefined;
}

/** Ungroup is available if the selection is a layer group, or the right-clicked layer sits inside one. */
export function canUngroupFromContextHit(editor: Editor, hit: Component): boolean {
  return canUngroupLayerGroup(editor.getSelected()) || canUngroupLayerGroup(findEnclosingWbLayerGroup(hit));
}

export function groupSelected(editor: Editor): void {
  if (!canGroupSelection(editor)) return;
  const all = editor.getSelectedAll();
  const parent = all[0]!.parent()!;
  const sorted = [...all].sort((a, b) => siblingIndex(a) - siblingIndex(b));
  const insertAt = siblingIndex(sorted[0]!);

  const coll = parent.components();
  const wrapper = coll.add(
    {
      type: 'default',
      tagName: 'div',
      attributes: { [WB_LAYER_GROUP_ATTR]: '1', class: 'wb-canvas-layer-group' },
      draggable: true,
      droppable: true,
      copyable: true,
      removable: true,
      components: [],
    },
    { at: insertAt },
  ) as Component | undefined;
  if (!wrapper) return;

  try {
    wrapper.set('name', 'Layer group');
  } catch {
    /* ignore */
  }

  for (const c of sorted) {
    c.move(wrapper, { at: parentChildCount(wrapper) });
  }
  syncZIndexAmongSiblings(parent);
  editor.select(wrapper);
}

export function ungroupLayerGroup(editor: Editor, group: Component | null | undefined): void {
  const c = group;
  if (!c || !isWbLayerGroup(c)) return;
  const parent = c.parent();
  if (!parent) return;
  const at = siblingIndex(c);
  const coll = c.components();
  const len = typeof coll.length === 'number' ? coll.length : 0;
  const kids: Component[] = [];
  for (let i = 0; i < len; i++) {
    const ch = typeof coll.at === 'function' ? coll.at(i) : null;
    if (ch) kids.push(ch);
  }
  kids.forEach((ch, i) => {
    ch.move(parent, { at: at + i });
  });
  c.remove();
  syncZIndexAmongSiblings(parent);
  if (kids[0]) editor.select(kids[0]);
}

export function ungroupSelected(editor: Editor): void {
  ungroupLayerGroup(editor, editor.getSelected());
}

/** Prefer ungrouping the current selection if it is a layer group; otherwise the group wrapping `hit`. */
export function ungroupFromCanvasContext(editor: Editor, hit: Component): void {
  const sel = editor.getSelected();
  if (canUngroupLayerGroup(sel)) {
    ungroupLayerGroup(editor, sel);
    return;
  }
  const g = findEnclosingWbLayerGroup(hit);
  if (canUngroupLayerGroup(g)) ungroupLayerGroup(editor, g);
}

/** Whether `comp` can be lifted out of its immediate parent (not already a direct child of the page). */
export function canDetachFromParentFor(comp: Component | null | undefined): boolean {
  if (!comp || comp.is('wrapper')) return false;
  const p = comp.parent();
  if (!p || p.is('wrapper')) return false;
  return true;
}

export function canDetachFromParent(editor: Editor): boolean {
  return canDetachFromParentFor(editor.getSelected());
}

/**
 * Move `comp` out of its immediate parent so it becomes a sibling **after** that parent.
 * Stops translate-drag on the parent from moving this block with it.
 */
export function detachComponentFromParent(editor: Editor, comp: Component): void {
  if (!comp || comp.is('wrapper')) return;
  const p = comp.parent();
  if (!p || p.is('wrapper')) return;
  const gp = p.parent();
  if (!gp) return;

  /** Keep the block visually anchored when reparenting by compensating viewport delta via transform. */
  const beforeRect = (() => {
    try {
      return comp.getEl?.()?.getBoundingClientRect() ?? null;
    } catch {
      return null;
    }
  })();

  const insertAt = Math.min(parentChildCount(gp), siblingIndex(p) + 1);
  comp.move(gp, { at: insertAt });
  syncZIndexAmongSiblings(gp);

  const applyLiftTransform = () => {
    if (!beforeRect) return;
    try {
      const afterRect = comp.getEl?.()?.getBoundingClientRect() ?? null;
      if (!afterRect) return;
      const dx = beforeRect.left - afterRect.left;
      const dy = beforeRect.top - afterRect.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        const style = (comp.getStyle?.() ?? {}) as Record<string, unknown>;
        const prevTf = typeof style.transform === 'string' ? style.transform.trim() : '';
        const keepTf = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
        comp.addStyle({ transform: prevTf ? `${prevTf} ${keepTf}` : keepTf });
      }
    } catch {
      /* ignore */
    }
  };

  /** Grapes translate-drag + layout settle after reparent; one frame is often not enough. */
  applyLiftTransform();
  queueMicrotask(() => {
    requestAnimationFrame(() => {
      applyLiftTransform();
      requestAnimationFrame(applyLiftTransform);
    });
  });

  editor.select(comp);
}

export function detachSelectedFromParent(editor: Editor): void {
  const c = editor.getSelected();
  if (c) detachComponentFromParent(editor, c);
}

function visitAll(comp: Component | null, fn: (c: Component) => void) {
  if (!comp) return;
  fn(comp);
  const ch = comp.components();
  const n = typeof ch.length === 'number' ? ch.length : 0;
  for (let i = 0; i < n; i++) {
    const c = typeof ch.at === 'function' ? ch.at(i) : null;
    visitAll(c, fn);
  }
}

function toolbarHasWbControls(comp: Component): boolean {
  const tlb = comp.get('toolbar') as unknown as { models?: { get: (k: string) => unknown }[] };
  const models = tlb?.models;
  if (!Array.isArray(models)) return false;
  return models.some((m) => {
    const cmd = m.get?.('command');
    return cmd === WB_TLB_GROUP || cmd === WB_TLB_FRONT || cmd === WB_TLB_DETACH;
  });
}

function augmentToolbar(editor: Editor, comp: Component) {
  if (comp.is('wrapper') || toolbarHasWbControls(comp)) return;
  const tlb = comp.get('toolbar') as unknown as { add?: (rows: unknown | unknown[]) => void };
  if (typeof tlb?.add !== 'function') return;

  const icon = (name: string, fallback: string) => {
    try {
      const g = (editor as unknown as { getIcon?: (n: string) => string }).getIcon;
      return typeof g === 'function' ? g.call(editor, name) ?? fallback : fallback;
    } catch {
      return fallback;
    }
  };

  const rows = [
    {
      label: icon('arrowUp', '↑'),
      command: WB_TLB_FRONT,
      attributes: {
        title: 'Bring to front — move this layer to top of sibling stack',
        'data-wb-toolbar-label': 'To front',
      },
    },
    {
      label: '↓',
      command: WB_TLB_BACK,
      attributes: { title: 'Send to back — move this layer to bottom of sibling stack', 'data-wb-toolbar-label': 'To back' },
    },
    {
      label: '⧉',
      command: WB_TLB_GROUP,
      attributes: {
        title: 'Group — Ctrl/Cmd+click, or drag on empty / unselected canvas to box-select; then group',
        'data-wb-toolbar-label': 'Group',
      },
    },
    {
      label: '⧈',
      command: WB_TLB_UNGROUP,
      attributes: { title: 'Ungroup — lift children out of this group', 'data-wb-toolbar-label': 'Ungroup' },
    },
    {
      label: '⎋',
      command: WB_TLB_DETACH,
      attributes: {
        title: 'Lift out — move this block out of its container (independent layer)',
        'data-wb-toolbar-label': 'Lift out',
      },
    },
  ];
  for (const row of rows) tlb.add(row);
}

function injectLayerGroupCanvasCss(editor: Editor) {
  const doc = editor.Canvas.getDocument();
  if (!doc?.head) return;
  const css = `
    /* Layout for .wb-canvas-layer-group lives in WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS (preview parity). */
    /* Smoother translate-drag (GPU layer) for Grapes-highlightable nodes */
    [data-gjs-highlightable='true'] {
      backface-visibility: hidden;
    }
    .wb-canvas-position-ref {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 0;
      height: 0;
      margin: 0;
      padding: 0;
      border: 0;
      overflow: hidden;
      z-index: -99999999;
      pointer-events: none;
      visibility: hidden;
      contain: strict;
    }
  `;
  let s = doc.getElementById(CANVAS_GROUP_CSS_ID) as HTMLStyleElement | null;
  if (!s) {
    s = doc.createElement('style');
    s.id = CANVAS_GROUP_CSS_ID;
    doc.head.appendChild(s);
  }
  s.textContent = css;
  injectCanvasPositionReferenceEl(doc);
}

/**
 * Layer groups, z-order sync, canvas toolbar icons (front/back/group/ungroup), and related commands.
 */
export function registerWebsiteBuilderLayerGroup(editor: Editor): () => void {
  editor.Commands.add(WB_TLB_FRONT, {
    run(ed) {
      const c = ed.getSelected();
      if (!c || c.is('wrapper')) return;
      bringComponentPaintToFront(c);
      ed.select(c);
    },
  });

  editor.Commands.add(WB_TLB_BACK, {
    run(ed) {
      const c = ed.getSelected();
      if (!c || c.is('wrapper')) return;
      sendComponentPaintToBack(c);
      ed.select(c);
    },
  });

  editor.Commands.add(WB_TLB_GROUP, {
    run(ed) {
      groupSelected(ed);
    },
  });

  editor.Commands.add(WB_TLB_UNGROUP, {
    run(ed) {
      ungroupSelected(ed);
    },
  });

  editor.Commands.add(WB_TLB_DETACH, {
    run(ed) {
      detachSelectedFromParent(ed);
    },
  });

  const onCreate = (m: Component) => augmentToolbar(editor, m);

  const onSelected = (c: Component) => {
    queueMicrotask(() => {
      try {
        patchDefaultToolbarItemTitles(c);
      } catch {
        /* ignore */
      }
    });
  };

  const onLoad = () => {
    injectLayerGroupCanvasCss(editor);
    const w = editor.getWrapper();
    if (w) visitAll(w, (c) => augmentToolbar(editor, c));
  };

  const onCanvasFrame = () => {
    injectLayerGroupCanvasCss(editor);
  };

  editor.on('component:create', onCreate);
  editor.on('load', onLoad);
  editor.on('canvas:frame:load', onCanvasFrame);
  editor.on('component:selected', onSelected);
  queueMicrotask(onLoad);

  return () => {
    editor.off('component:create', onCreate);
    editor.off('load', onLoad);
    editor.off('canvas:frame:load', onCanvasFrame);
    editor.off('component:selected', onSelected);
  };
}
