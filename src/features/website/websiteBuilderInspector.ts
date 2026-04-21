import type { Component, Editor } from 'grapesjs';

export type InspectorKind =
  | 'wrapper'
  | 'hero'
  | 'section'
  | 'heading'
  | 'text'
  | 'button'
  | 'pushButton'
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

  let kind: InspectorKind = 'unknown';

  if (tag === 'nav' || attrs.role === 'navigation') kind = 'nav';
  else if (tag === 'iframe') kind = 'iframe';
  else if (tag === 'img') kind = 'image';
  else if (tag === 'button') kind = 'pushButton';
  else if (tag === 'a' || typeName === 'link-button') kind = 'button';
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
