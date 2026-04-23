import type { Component, Editor } from 'grapesjs';

export type InspectorKind =
  | 'wrapper'
  | 'hero'
  | 'section'
  | 'heading'
  | 'text'
  | 'button'
  | 'pushButton'
  | 'whatsappLink'
  | 'mailtoLink'
  | 'telLink'
  | 'image'
  | 'iframe'
  | 'div'
  | 'nav'
  | 'block'
  | 'unknown';

export type SelectionInfo = {
  cid: string;
  kind: InspectorKind;
  title: string;
  tagName: string;
};

export function findOne(comp: Component, selector: string): Component | undefined {
  const found = comp.find(selector) as unknown as { length: number; at?: (i: number) => Component };
  if (!found?.length) return undefined;
  return typeof found.at === 'function' ? found.at(0) : undefined;
}

/** Plain text from a component tree (concatenates text nodes). */
export function getDirectText(comp: Component): string {
  const children = comp.components();
  if (!children || typeof children.length !== 'number' || children.length === 0) {
    return String(comp.get('content') ?? '');
  }
  let out = '';
  for (let i = 0; i < children.length; i += 1) {
    const child = children.at(i);
    if (!child) continue;
    const t = child.get('type');
    if (t === 'textnode') out += String(child.get('content') ?? '');
    else out += getDirectText(child);
  }
  return out;
}

export function setDirectText(comp: Component, text: string) {
  const children = comp.components();
  if (children && children.length === 1 && children.at(0)?.get('type') === 'textnode') {
    children.at(0)?.set('content', text);
    return;
  }
  comp.components(text);
}

function titleForKind(kind: InspectorKind, tag: string): string {
  switch (kind) {
    case 'hero':
      return 'Edit Hero Section';
    case 'section':
      return 'Edit Section';
    case 'heading':
      return 'Edit Heading';
    case 'text':
      return 'Edit Text';
    case 'button':
      return 'Edit Button';
    case 'whatsappLink':
      return 'Edit WhatsApp link';
    case 'mailtoLink':
      return 'Edit Email link';
    case 'telLink':
      return 'Edit Call link';
    case 'image':
      return 'Edit Image';
    case 'nav':
      return 'Edit Navigation';
    case 'block':
      return 'Edit Block';
    case 'wrapper':
      return 'Page';
    case 'unknown':
    default:
      return tag ? `Edit ${tag}` : 'Edit Element';
  }
}

export function describeSelection(selected: Component | undefined | null): SelectionInfo | null {
  if (!selected) return null;
  if (selected.is?.('wrapper')) {
    return { cid: String(selected.getId()), kind: 'wrapper', title: 'Page', tagName: 'body' };
  }

  const tag = String(selected.get('tagName') || '').toLowerCase();
  const attrs = selected.getAttributes() || {};
  const typeName = String(selected.get('type') || '');
  const cls = String(attrs.class || '');
  const href = String(attrs.href || '').trim().toLowerCase();

  let kind: InspectorKind = 'unknown';

  if (tag === 'nav' || attrs.role === 'navigation') kind = 'nav';
  else if (tag === 'iframe') kind = 'iframe';
  else if (tag === 'img') kind = 'image';
  else if (tag === 'button') kind = 'pushButton';
  else if (tag === 'a' || typeName === 'link-button') {
    if (typeName === 'whatsapp-link' || /\bwb-wa-btn\b/.test(cls) || /\bwb-wa-float\b/.test(cls)) kind = 'whatsappLink';
    else if (href.startsWith('mailto:')) kind = 'mailtoLink';
    else if (href.startsWith('tel:')) kind = 'telLink';
    else kind = 'button';
  }
  else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) kind = 'heading';
  else if (tag === 'p') kind = 'text';
  else if (['section', 'header', 'article', 'main'].includes(tag)) {
    const hasH1 = Boolean(findOne(selected, 'h1'));
    kind = hasH1 ? 'hero' : 'section';
  } else if (tag === 'div') {
    const hasH1 = Boolean(findOne(selected, 'h1'));
    if (hasH1) kind = 'hero';
    else kind = 'div';
  } else kind = 'block';

  return {
    cid: String(selected.getId()),
    kind,
    title: titleForKind(kind, tag),
    tagName: tag,
  };
}

export function getHeroContent(root: Component) {
  const h1 = findOne(root, 'h1');
  const paragraphs = root.find('p') as unknown as { length: number; at?: (i: number) => Component };
  const plen = paragraphs?.length ?? 0;
  let sub: Component | undefined;
  if (plen >= 2) sub = typeof paragraphs.at === 'function' ? paragraphs.at(1) : undefined;
  else if (plen === 1) sub = typeof paragraphs.at === 'function' ? paragraphs.at(0) : undefined;
  const link = findOne(root, 'a.wb-link-btn') ?? findOne(root, 'a');
  return { h1, sub, link };
}

/** Name the last child of `target` as "Layer N" if it has no custom name (for the layers panel). */
export function nameLastAddedLayer(target: Component) {
  const ch = target.components();
  const len = typeof ch.length === 'number' ? ch.length : 0;
  if (!len) return;
  const last = typeof ch.at === 'function' ? ch.at(len - 1) : undefined;
  if (last && !String(last.get('name') || '').trim()) {
    last.set('name', `Layer ${len}`);
  }
}

export function attachSelectionListener(editor: Editor, onChange: (info: SelectionInfo | null) => void) {
  const notify = () => {
    const sel = editor.getSelected();
    onChange(describeSelection(sel ?? undefined));
  };
  editor.on('component:selected', notify);
  editor.on('component:deselected', notify);
  editor.on('component:update', notify);
  notify();
  return () => {
    editor.off('component:selected', notify);
    editor.off('component:deselected', notify);
    editor.off('component:update', notify);
  };
}

const WB_FLASH_STYLE_ID = 'wb-selection-flash-style';
const WB_FLASH_CLASS = 'wb-canvas-selection-flash';

type CanvasScrollOpts = ScrollIntoViewOptions & { force?: boolean };

function ensureCanvasFlashStyle(editor: Editor) {
  try {
    const doc = editor.Canvas?.getDocument?.();
    if (!doc?.head || doc.getElementById(WB_FLASH_STYLE_ID)) return;
    const s = doc.createElement('style');
    s.id = WB_FLASH_STYLE_ID;
    s.textContent = `
.${WB_FLASH_CLASS} {
  outline: 3px solid rgba(37, 99, 235, 0.92) !important;
  outline-offset: 3px !important;
}
`;
    doc.head.appendChild(s);
  } catch {
    /* ignore */
  }
}

function clearFlashClassOnCanvas(editor: Editor) {
  try {
    const doc = editor.Canvas?.getDocument?.();
    doc?.querySelectorAll(`.${WB_FLASH_CLASS}`).forEach((n) => n.classList.remove(WB_FLASH_CLASS));
  } catch {
    /* ignore */
  }
}

type FlashHandles = { raf?: number; timeout?: number };
const selectionFlashHandles = new WeakMap<Editor, FlashHandles>();

function clearSelectionFlashHandles(editor: Editor) {
  const h = selectionFlashHandles.get(editor);
  if (!h) return;
  if (h.raf != null) cancelAnimationFrame(h.raf);
  if (h.timeout != null) window.clearTimeout(h.timeout);
  selectionFlashHandles.delete(editor);
}

/**
 * When a component is selected (e.g. from the Structure tree), scroll the canvas to it and flash an outline
 * so the user can see which block it is. Uses Grapes `Canvas.scrollTo` so scrolling works inside the iframe.
 */
export function attachCanvasSelectionFocus(editor: Editor): () => void {
  const onSelected = (comp: Component) => {
    if (!comp || comp.is('wrapper')) return;

    clearSelectionFlashHandles(editor);
    clearFlashClassOnCanvas(editor);

    const handles: FlashHandles = {};
    selectionFlashHandles.set(editor, handles);

    handles.raf = requestAnimationFrame(() => {
      handles.raf = undefined;
      const el = comp.getEl?.();
      if (!el) {
        selectionFlashHandles.delete(editor);
        return;
      }

      try {
        editor.Canvas.scrollTo(comp, {
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
          force: false,
        } as CanvasScrollOpts);
      } catch {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } catch {
          try {
            el.scrollIntoView({ block: 'nearest' });
          } catch {
            /* ignore */
          }
        }
      }

      ensureCanvasFlashStyle(editor);
      el.classList.add(WB_FLASH_CLASS);
      handles.timeout = window.setTimeout(() => {
        el.classList.remove(WB_FLASH_CLASS);
        const cur = selectionFlashHandles.get(editor);
        if (cur === handles) selectionFlashHandles.delete(editor);
      }, 1350);
    });
  };

  editor.on('component:selected', onSelected);
  return () => {
    editor.off('component:selected', onSelected);
    clearSelectionFlashHandles(editor);
    clearFlashClassOnCanvas(editor);
  };
}
