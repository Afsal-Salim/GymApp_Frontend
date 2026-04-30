import type { Component, Editor } from 'grapesjs';

/**
 * Headings and text runs: dragging resize handles scales **font size** (Canva-style),
 * not the box, so local business users can “pull” text bigger without finding font-size in the panel.
 */
const TYPO_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'small']);

type Session = {
  baseW: number;
  baseH: number;
  baseFontPx: number;
};

function isTypographyFontResizeTarget(comp: Component): boolean {
  try {
    if (comp.is?.('wrapper')) return false;
  } catch {
    return false;
  }
  const tag = String(comp.get('tagName') ?? '').trim().toLowerCase();
  return TYPO_TAGS.has(tag);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Attach listeners; return detach. Call once per editor instance.
 */
export function attachCanvasTypographyResizeToFontSize(editor: Editor): () => void {
  const sessions = new Map<string, Session>();

  const onStart = (props: { component: Component; el: HTMLElement }) => {
    const { component: comp, el } = props;
    if (!isTypographyFontResizeTarget(comp)) return;
    const baseFontPx = parseFloat(getComputedStyle(el).fontSize || '16') || 16;
    sessions.set(comp.getId?.() ?? '', {
      baseW: Math.max(1, el.offsetWidth),
      baseH: Math.max(1, el.offsetHeight),
      baseFontPx,
    });
  };

  const onUpdate = (props: {
    component: Component;
    rect: { w: number; h: number };
    updateStyle: (styles?: Record<string, string>) => void;
  }) => {
    const { component: comp, rect, updateStyle } = props;
    if (!isTypographyFontResizeTarget(comp)) return;
    const id = comp.getId?.() ?? '';
    const session = sessions.get(id);
    if (!session) return;

    const dw = rect.w / session.baseW;
    const dh = rect.h / session.baseH;
    let scale: number;
    if (Math.abs(dh - 1) < 0.04) scale = dw;
    else if (Math.abs(dw - 1) < 0.04) scale = dh;
    else scale = Math.sqrt(Math.max(0.01, dw) * Math.max(0.01, dh));

    const px = clamp(round1(session.baseFontPx * scale), 8, 240);
    updateStyle({
      'font-size': `${px}px`,
      width: 'max-content',
      'max-width': '100%',
      'min-height': 'auto',
      height: 'auto',
      'box-sizing': 'border-box',
    });
  };

  const onEnd = (props: { component: Component }) => {
    const id = props.component.getId?.() ?? '';
    sessions.delete(id);
  };

  editor.on('component:resize:start', onStart);
  editor.on('component:resize:update', onUpdate);
  editor.on('component:resize:end', onEnd);

  return () => {
    try {
      editor.off('component:resize:start', onStart);
      editor.off('component:resize:update', onUpdate);
      editor.off('component:resize:end', onEnd);
    } catch {
      /* ignore */
    }
    sessions.clear();
  };
}
