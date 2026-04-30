import type { Component, Editor } from 'grapesjs';
import { getDirectText, setDirectText } from '@/features/website/editor/right-column/websiteBuilderInspector/websiteBuilderInspector';
import {
  BUSINESS_SNIPPETS_HTML,
  type BusinessSnippetId,
} from '@/features/website/editor/tools/websiteBuilderBusinessSnippets';

export type LinkScanIssue = {
  kind: 'anchor' | 'mailto' | 'external' | 'empty' | 'tel' | 'a11y';
  message: string;
  preview?: string;
};

function walkComponents(root: Component | null | undefined, fn: (c: Component) => void) {
  if (!root) return;
  fn(root);
  const ch = root.components?.();
  const n = typeof ch?.length === 'number' ? ch.length : 0;
  for (let i = 0; i < n; i += 1) {
    const c = typeof ch?.at === 'function' ? ch.at(i) : null;
    if (c) walkComponents(c, fn);
  }
}

function isTextLeafComponent(comp: Component): boolean {
  const ch = comp.components?.();
  const n = typeof ch?.length === 'number' ? ch.length : 0;
  if (n === 0) return true;
  if (n === 1 && ch.at(0)?.get('type') === 'textnode') return true;
  return false;
}

/** Replace visible text and common URL attributes on the current page. Returns number of replacements. */
export function findReplaceOnCurrentPage(editor: Editor, search: string, replace: string): number {
  const q = search.trim();
  if (!q) return 0;
  let count = 0;
  const wrapper = editor.getWrapper();
  walkComponents(wrapper ?? undefined, (comp) => {
    try {
      if (isTextLeafComponent(comp)) {
        const text = getDirectText(comp);
        if (text.includes(q)) {
          setDirectText(comp, text.split(q).join(replace));
          count += 1;
        }
      }
      const attrs = comp.getAttributes?.() ?? {};
      const href = String(attrs.href ?? '');
      if (href && href.includes(q)) {
        comp.addAttributes({ href: href.split(q).join(replace) });
        count += 1;
      }
      const src = String(attrs.src ?? '');
      if (src && src.includes(q)) {
        comp.addAttributes({ src: src.split(q).join(replace) });
        count += 1;
      }
      const tag = String(comp.get('tagName') ?? '').toLowerCase();
      if (tag === 'iframe') {
        const isrc = String(attrs.src ?? '');
        if (isrc && isrc.includes(q)) {
          comp.addAttributes({ src: isrc.split(q).join(replace) });
          count += 1;
        }
      }
    } catch {
      /* ignore */
    }
  });
  return count;
}

/** Collect link / anchor issues for the current canvas (best-effort). */
export function scanLinksOnCurrentPage(editor: Editor): LinkScanIssue[] {
  const issues: LinkScanIssue[] = [];
  const ids = new Set<string>();
  walkComponents(editor.getWrapper() ?? undefined, (comp) => {
    try {
      const id = String(comp.getAttributes?.().id ?? '').trim();
      if (id) ids.add(id);
    } catch {
      /* ignore */
    }
  });

  walkComponents(editor.getWrapper() ?? undefined, (comp) => {
    try {
      const tag = String(comp.get('tagName') ?? '').toLowerCase();
      const attrs = comp.getAttributes?.() ?? {};
      const href = String(attrs.href ?? '').trim();
      if (tag === 'a' && href) {
        if (href === '#' || href === '') {
          issues.push({ kind: 'empty', message: 'Link has no destination (href is #).', preview: getDirectText(comp).slice(0, 40) });
        } else if (href.startsWith('#') && href.length > 1) {
          const id = href.slice(1).split('?')[0]?.split('&')[0];
          if (id && !ids.has(id)) {
            issues.push({
              kind: 'anchor',
              message: `Jump link “${href}” — no matching section id “${id}” on this page.`,
              preview: getDirectText(comp).slice(0, 40),
            });
          }
        } else if (href.startsWith('mailto:')) {
          const addr = href.slice('mailto:'.length).split('?')[0];
          if (!addr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodeURIComponent(addr))) {
            issues.push({ kind: 'mailto', message: 'Email link may be incomplete.', preview: href.slice(0, 60) });
          }
        } else if (href.startsWith('tel:')) {
          const digits = href.replace(/\D/g, '');
          if (digits.length < 6) {
            issues.push({ kind: 'tel', message: 'Phone link looks short — check the number.', preview: href.slice(0, 48) });
          }
        } else if (/^https?:\/\//i.test(href)) {
          try {
            const u = new URL(href);
            if (!u.hostname) issues.push({ kind: 'external', message: 'External URL looks unusual.', preview: href.slice(0, 80) });
          } catch {
            issues.push({ kind: 'external', message: 'External URL could not be parsed.', preview: href.slice(0, 80) });
          }
        }
      }
      if (tag === 'a' && (attrs.href == null || String(attrs.href) === '')) {
        issues.push({ kind: 'empty', message: 'Button/link is missing href.', preview: getDirectText(comp).slice(0, 40) });
      }
    } catch {
      /* ignore */
    }
  });

  walkComponents(editor.getWrapper() ?? undefined, (comp) => {
    try {
      const tag = String(comp.get('tagName') ?? '').toLowerCase();
      if (tag !== 'img') return;
      const attrs = comp.getAttributes?.() ?? {};
      const alt = String(attrs.alt ?? '').trim();
      const src = String(attrs.src ?? '').trim();
      if (!alt && src && !src.startsWith('data:')) {
        issues.push({
          kind: 'a11y',
          message: 'Image has no short description (alt text) — add one in Basics for accessibility.',
          preview: src.slice(0, 48),
        });
      }
    } catch {
      /* ignore */
    }
  });

  return issues;
}

/** Insert a gym block below the selected component (or at end of page). */
export function insertBusinessSnippet(editor: Editor, id: BusinessSnippetId): boolean {
  const html = BUSINESS_SNIPPETS_HTML[id];
  if (!html) return false;
  try {
    const sel = editor.getSelected();
    const parent = sel?.parent?.();
    if (parent && sel && !sel.is?.('wrapper')) {
      const coll = parent.components?.();
      const idx = typeof coll?.indexOf === 'function' ? coll.indexOf(sel) : -1;
      if (coll && typeof coll.add === 'function') {
        try {
          coll.add(html, { at: idx >= 0 ? idx + 1 : undefined });
        } catch {
          parent.append(html);
        }
      } else {
        parent.append(html);
      }
    } else {
      editor.getWrapper()?.append(html);
    }
    editor.refresh?.();
    return true;
  } catch {
    return false;
  }
}

export function duplicateSelectedComponent(editor: Editor): boolean {
  const sel = editor.getSelected();
  if (!sel || sel.is?.('wrapper')) return false;
  try {
    const parent = sel.parent?.();
    if (!parent) return false;
    const clone = sel.clone();
    const coll = parent.components?.();
    const idx = typeof coll?.indexOf === 'function' ? coll.indexOf(sel) : -1;
    if (coll && typeof coll.add === 'function') {
      coll.add(clone, { at: idx >= 0 ? idx + 1 : undefined });
    } else {
      parent.append(clone);
    }
    editor.select(clone);
    return true;
  } catch {
    return false;
  }
}

export function duplicateCurrentPage(editor: Editor): boolean {
  try {
    const page = editor.Pages.getSelected();
    if (!page) return false;
    const name = String(page.get('name') ?? 'Page');
    const html = editor.getHtml?.() ?? '';
    const component =
      html.trim() ?
        html
      : '<section style="padding:2rem"><p>New page</p></section>';
    editor.Pages.add({
      id: `page-${Date.now()}`,
      name: `${name} (copy)`,
      component,
    });
    return true;
  } catch {
    return false;
  }
}

export type BrandKit = {
  primary: string;
  fontStack: string;
};

const LS_KEY = (slug: string) => `wb-brand-kit:${slug.trim().toLowerCase()}`;

export function loadBrandKit(slug: string): BrandKit | null {
  if (typeof window === 'undefined' || !slug.trim()) return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY(slug));
    if (!raw) return null;
    const o = JSON.parse(raw) as Record<string, unknown>;
    const primary = typeof o.primary === 'string' ? o.primary : '#2563eb';
    const fontStack = typeof o.fontStack === 'string' ? o.fontStack : 'Inter, system-ui, sans-serif';
    return { primary, fontStack };
  } catch {
    return null;
  }
}

export function saveBrandKit(slug: string, kit: BrandKit) {
  if (typeof window === 'undefined' || !slug.trim()) return;
  try {
    window.localStorage.setItem(LS_KEY(slug), JSON.stringify(kit));
  } catch {
    /* ignore */
  }
}

/** Apply CSS variables on the canvas document root for new content; also nudges buttons/links using common classes. */
export function applyBrandKitToCanvas(editor: Editor, kit: BrandKit) {
  const doc = editor.Canvas?.getDocument?.();
  if (!doc?.documentElement) return;
  const root = doc.documentElement;
  root.style.setProperty('--wb-brand-primary', kit.primary);
  root.style.setProperty('--wb-brand-font', kit.fontStack);
  try {
    const body = doc.body;
    if (body) {
      body.style.setProperty('font-family', kit.fontStack);
    }
  } catch {
    /* ignore */
  }
}

/** Center a block-level component horizontally (simple alignment). */
export function alignSelectedCenter(editor: Editor): boolean {
  const sel = editor.getSelected();
  if (!sel || sel.is?.('wrapper')) return false;
  try {
    const prev = { ...(sel.getStyle?.() ?? {}) } as Record<string, string>;
    sel.setStyle({
      ...prev,
      display: 'block',
      'margin-left': 'auto',
      'margin-right': 'auto',
    });
    return true;
  } catch {
    return false;
  }
}

export const SPACING_PRESETS = {
  tight: { t: 32, r: 16, b: 32, l: 16 },
  normal: { t: 56, r: 20, b: 56, l: 20 },
  airy: { t: 96, r: 24, b: 96, l: 24 },
} as const;

export function applySectionSpacingPreset(comp: Component, preset: keyof typeof SPACING_PRESETS) {
  const p = SPACING_PRESETS[preset];
  const prev = { ...(comp.getStyle?.() ?? {}) } as Record<string, string>;
  comp.setStyle({
    ...prev,
    padding: `${p.t}px ${p.r}px ${p.b}px ${p.l}px`,
  });
}
