import type { Component } from 'grapesjs';

export type WbShapePreset = 'default' | 'rounded' | 'pill' | 'circle' | 'star';

const SHAPE_KEYS = ['border-radius', 'clip-path', 'aspect-ratio', 'overflow'] as const;

/** 5-point star in percentage coords (clip-path). */
const STAR_CLIP =
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';

function stripShapeStyles(prev: Record<string, string>): Record<string, string> {
  const out = { ...prev };
  for (const k of SHAPE_KEYS) delete out[k];
  return out;
}

/**
 * Apply a quick “shape” look (rounded box, pill, circle, star) for canvas / context menu.
 * Does not preserve prior border-radius if switching presets — each preset is self-contained.
 */
export function applyShapePreset(comp: Component, preset: WbShapePreset) {
  const raw = (comp.getStyle?.() ?? {}) as Record<string, string>;
  let next = stripShapeStyles(raw);

  if (preset === 'default') {
    comp.setStyle(next);
    const attrs = { ...(comp.getAttributes?.() ?? {}) };
    delete attrs['data-wb-shape'];
    comp.set('attributes', attrs);
    return;
  }

  switch (preset) {
    case 'rounded':
      next = { ...next, 'border-radius': '16px' };
      break;
    case 'pill':
      next = { ...next, 'border-radius': '9999px' };
      break;
    case 'circle':
      next = {
        ...next,
        'border-radius': '50%',
        'aspect-ratio': '1 / 1',
        overflow: 'hidden',
      };
      break;
    case 'star':
      next = {
        ...next,
        'clip-path': STAR_CLIP,
        overflow: 'hidden',
      };
      break;
    default:
      break;
  }

  comp.setStyle(next);
  comp.addAttributes({ 'data-wb-shape': preset });
}
