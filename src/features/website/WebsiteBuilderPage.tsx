'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import grapesjs, { type Component, type Editor } from 'grapesjs';
import beautify from 'js-beautify';
import { Button, Container, Form, Modal, Spinner } from 'react-bootstrap';
import { PageContainer } from '../../components';
import {
  apiBaseUrl,
  nextBaseUrl,
  publicGymSiteHostLabel,
  publicGymSiteUrl,
  serviceEnquiryPath,
} from '../../config/env';
import 'grapesjs/dist/css/grapes.min.css';
import './WebsiteBuilderPage.css';
import { expandBlockManagerCategories, registerWebsiteBuilderExtensions } from './websiteBuilderBlocks';
import { registerWebsiteBuilderLayerGroup } from './websiteBuilderLayerGroup';
import { readCrystalWebsitePreviewFromStorage } from './setup/createWebsiteFormState';
import {
  WEBSITE_BUILDER_ANIMATION_CSS,
  WEBSITE_BUILDER_CANVAS_DOCUMENT_SHELL_CSS,
  WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS,
  WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS,
} from './websiteBuilderConstants';
import { WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT } from './websiteBuilderDesignSystemFonts';
import { WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS } from './websiteBuilderDesignSystems.css';
import {
  ensureCanvasCssBaselineInComposer,
  mergePreviewDraftWithSlug,
  persistVisualBuilderToCreate,
  persistVisualBuilderToEdit,
  resolveWebsiteBuilderInitialCanvas,
  syncVisualBuilderDraftForPreviewTab,
  type WebsiteBuilderResolvedLoad,
} from './websiteBuilderPersistence';
import { attachCanvasInjectedComponentLibraryCss } from './websiteBuilderCanvasInjectedLibraryCss';
import {
  blockPaletteDragMimePresent,
  insertBlockById,
  insertBlockByIdAtFrameClientPoint,
  readBlockIdFromPaletteDrag,
  type ComponentsLibraryOpenTarget,
} from './websiteBuilderComponentCatalog';
import { attachCanvasBlockPaletteDrop } from './websiteBuilderCanvasBlockPaletteDrop';
import { WebsiteBuilderComponentsLibrary } from './WebsiteBuilderComponentsLibrary';
import { attachWebsiteBuilderCanvasAutoFit, runCanvasAutoFit } from './websiteBuilderCanvasAutoFit';
import { attachCanvasClipboardPaste } from './websiteBuilderCanvasClipboardPaste';
import { attachCanvasLayerOrderContextMenu, resolveComponentFromPointer } from './websiteBuilderCanvasContextMenu';
import { attachCanvasMarqueeSelect } from './websiteBuilderCanvasMarqueeSelect';
import { filterCssUsedByPageHtml } from './websiteBuilderPageUsedCss';
import {
  attachCanvasSelectionFocus,
  attachSelectionListener,
  nameLastAddedLayer,
  type SelectionInfo,
} from './websiteBuilderInspector';
import { WebsiteBuilderLeftPanel, type LeftPanelTab } from './WebsiteBuilderLeftPanel';
import { WebsiteBuilderInspector, type InspectorTab } from './WebsiteBuilderInspector';

type BuilderPageTab = {
  id: string;
  name: string;
};

/** Grapes page `name` is often `''` in saved projects; `'' ?? fallback` keeps the empty string — show a label. */
function labelForGrapesPageName(raw: unknown, idx: number): string {
  if (raw == null) return `Page ${idx + 1}`;
  const s = String(raw).trim();
  return s || `Page ${idx + 1}`;
}

function syncPages(editor: Editor, setPages: (items: BuilderPageTab[]) => void, setSelected: (id: string) => void) {
  const readPages = () => {
    const pages = editor.Pages.getAll();
    const items = pages.map((page, idx) => {
      const id = String(page.get('id') ?? `page-${idx + 1}`);
      const name = labelForGrapesPageName(page.get('name'), idx);
      return { id, name };
    });
    const selected = editor.Pages.getSelected();
    setPages(items);
    if (selected) setSelected(String(selected.get('id')));
  };

  readPages();
  editor.on('page:add', readPages);
  editor.on('page:remove', readPages);
  editor.on('page:select', readPages);
  return () => {
    editor.off('page:add', readPages);
    editor.off('page:remove', readPages);
    editor.off('page:select', readPages);
  };
}

const PREVIEW_WINDOW_NAME = 'gymCrystalSitePreview';

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Blob preview documents need absolute script URLs; relative `/file.js` does not load from `blob:`. */
function absolutePublicAssetUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  const base = nextBaseUrl.endsWith('/') ? nextBaseUrl.slice(0, -1) : nextBaseUrl;
  return `${window.location.origin}${base}${p}`;
}

function buildPreviewLeadBodyAttrs(mode: 'create' | 'edit', routeSlug: string): string {
  let slug = mode === 'edit' ? routeSlug.trim().toLowerCase() : '';
  if (!slug && mode === 'create') {
    slug = (readCrystalWebsitePreviewFromStorage()?.slug ?? '').trim().toLowerCase();
  }
  const parts: string[] = [];
  if (slug && slug !== 'preview' && SLUG_PATTERN.test(slug)) {
    parts.push(`data-wb-public-gym-slug="${escapeHtmlAttr(slug)}"`);
  }
  const api = (apiBaseUrl || '').replace(/\/$/, '');
  if (api) parts.push(`data-wb-api-base="${escapeHtmlAttr(api)}"`);
  const enq = (serviceEnquiryPath || '').trim();
  if (enq) parts.push(`data-wb-service-enquiry-path="${escapeHtmlAttr(enq)}"`);
  return parts.length ? ` ${parts.join(' ')}` : '';
}

const LS_SIDEBAR_L_W = 'wb_builder_sidebar_left_w_v1';
const LS_SIDEBAR_R_W = 'wb_builder_sidebar_right_w_v1';
const LS_SIDEBAR_L_C = 'wb_builder_sidebar_left_collapsed_v1';
const LS_SIDEBAR_R_C = 'wb_builder_sidebar_right_collapsed_v1';
const LS_CANVAS_DIMS = 'wb_builder_canvas_dims_v1';

const SIDEBAR_LEFT_DEF = 288;
const SIDEBAR_RIGHT_DEF = 320;
/** Narrower than this while dragging → panel collapses (avoids unusable layers UI). */
const SIDEBAR_LEFT_MIN = 260;
const SIDEBAR_RIGHT_MIN = 260;
/** Each sidebar may use at most this fraction of the builder grid width. */
const SIDEBAR_MAX_GRID_FRAC = 0.4;
/** Require dragging this far past min before auto-collapse (avoids jitter / RO fighting the drag). */
const SIDEBAR_COLLAPSE_SLACK_PX = 24;

type SidebarResizeDrag =
  | { which: 'left'; startX: number; startLeftW: number }
  | { which: 'right'; startX: number; startRightW: number };
type SidebarDragSession =
  | { which: 'left'; startLeftW: number; minRawLeft: number }
  | { which: 'right'; startRightW: number; minRawRight: number };

function maxSidebarColPx(gridWidth: number, colMin: number): number {
  if (!Number.isFinite(gridWidth) || gridWidth <= 0) return colMin;
  return Math.max(colMin, Math.floor(gridWidth * SIDEBAR_MAX_GRID_FRAC));
}

const CANVAS_MIN_W = 360;
const CANVAS_MIN_H = 320;

function readNumLs(key: string, fallback: number, min: number, max: number): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const n = Number.parseInt(window.localStorage.getItem(key) ?? '', 10);
    if (Number.isFinite(n)) return Math.min(max, Math.max(min, n));
  } catch {
    /* ignore */
  }
  return fallback;
}

function readBoolLs(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(key);
    if (v === '1') return true;
    if (v === '0') return false;
  } catch {
    /* ignore */
  }
  return fallback;
}

function readCanvasDimsLs(): { w: number; h: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LS_CANVAS_DIMS);
    if (!raw) return null;
    const o = JSON.parse(raw) as { w?: unknown; h?: unknown };
    const w = Number(o.w);
    const h = Number(o.h);
    if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
    if (w < CANVAS_MIN_W || h < CANVAS_MIN_H) return null;
    return { w: Math.round(w), h: Math.round(h) };
  } catch {
    return null;
  }
}

function enableCanvasResizeHandles(comp: Component | null | undefined) {
  if (!comp) return;
  try {
    if (comp.is('wrapper')) return;
  } catch {
    return;
  }
  const tag = String(comp.get('tagName') ?? '').trim().toLowerCase();
  const textOnlyTag = tag === 'p' || tag === 'span' || tag === 'strong' || tag === 'em' || tag === 'small';
  const handles = textOnlyTag ?
      {
        cl: true,
        cr: true,
        keyWidth: 'width',
      }
    : {
        tl: true,
        tr: true,
        bl: true,
        br: true,
        tc: true,
        bc: true,
        cl: true,
        cr: true,
        keyWidth: 'width',
        keyHeight: 'min-height',
      };
  comp.set('resizable', handles);
}

const WB_CANVAS_LEAD_SCRIPT_ID = 'wb-crystal-lead-modals-canvas';

function shouldSkipCanvasDocMutations(doc: Document | null | undefined): boolean {
  if (!doc) return true;
  const href = String(doc.defaultView?.location?.href ?? '');
  if (!href) return false;
  // Grapes canvas docs are typically about:blank/srcdoc. If the frame is navigated to an app route
  // (eg /page-2), do not inject builder scripts/attrs that break hydration on that page.
  if (/^https?:\/\//i.test(href)) return true;
  return false;
}

function attachCanvasLeadModalsBridge(editor: Editor, opts: { mode: 'create' | 'edit'; routeSlug: string }): () => void {
  const apply = () => {
    try {
      const doc = editor.Canvas?.getDocument?.();
      if (!doc?.body) return;
      if (shouldSkipCanvasDocMutations(doc)) return;

      let slug = opts.mode === 'edit' ? opts.routeSlug.trim().toLowerCase() : '';
      if (!slug && opts.mode === 'create') {
        slug = (readCrystalWebsitePreviewFromStorage()?.slug ?? '').trim().toLowerCase();
      }
      if (slug && slug !== 'preview' && SLUG_PATTERN.test(slug)) {
        doc.body.setAttribute('data-wb-public-gym-slug', slug);
      } else {
        doc.body.removeAttribute('data-wb-public-gym-slug');
      }

      if (apiBaseUrl) doc.body.setAttribute('data-wb-api-base', apiBaseUrl);
      else doc.body.removeAttribute('data-wb-api-base');

      if (serviceEnquiryPath) doc.body.setAttribute('data-wb-service-enquiry-path', serviceEnquiryPath);
      else doc.body.removeAttribute('data-wb-service-enquiry-path');

      if (doc.getElementById(WB_CANVAS_LEAD_SCRIPT_ID)) return;
      const s = doc.createElement('script');
      s.id = WB_CANVAS_LEAD_SCRIPT_ID;
      s.src = '/wb-crystal-lead-modals.js';
      s.async = true;
      doc.head.appendChild(s);
    } catch {
      /* ignore */
    }
  };

  editor.on('canvas:frame:load', apply);
  queueMicrotask(apply);
  return () => {
    try {
      editor.off('canvas:frame:load', apply);
    } catch {
      /* ignore */
    }
  };
}

type PageFrameLike = {
  view?: {
    getDoc?: () => Document | null | undefined;
  };
};

function collectCanvasFrameDocs(editor: Editor): Document[] {
  const byRef = new Map<Document, Document>();
  const add = (d: Document | null | undefined) => {
    if (d) byRef.set(d, d);
  };
  add(editor.Canvas.getDocument());
  try {
    const frames = (editor.Canvas as unknown as { getFrames?: () => PageFrameLike[] }).getFrames?.();
    if (Array.isArray(frames)) {
      for (const fr of frames) add(fr?.view?.getDoc?.() ?? undefined);
    }
  } catch {
    /* ignore */
  }
  return [...byRef.keys()];
}

/** In builder mode, block in-canvas CTA/navigation actions so editing doesn't trigger runtime behavior. */
function attachCanvasTopNavigationBridge(editor: Editor): () => void {
  const offs: Array<() => void> = [];
  const docOpts: AddEventListenerOptions = { capture: true, passive: false };
  const dbg = (msg: string, extra?: Record<string, unknown>) => {
    try {
      // Temporary diagnostics for iframe navigation issues (about:blank#blocked).
      // eslint-disable-next-line no-console
      console.log('[wb-top-nav]', msg, extra ?? {});
    } catch {
      /* ignore */
    }
  };

  const resolveNavigateUrl = (el: Element): string => {
    const explicit = (el.getAttribute('data-wb-nav-href') ?? '').trim();
    if (explicit) return explicit;
    const tag = el.tagName.toLowerCase();
    if (tag === 'a') {
      const a = el as HTMLAnchorElement;
      const attrHref = (a.getAttribute('href') ?? '').trim();
      if (attrHref) return attrHref;
      const propHref = (a.href ?? '').trim();
      if (!propHref) return '';
      try {
        const u = new URL(propHref, window.location.origin);
        if (u.protocol === 'http:' || u.protocol === 'https:') {
          if (u.origin === window.location.origin) return `${u.pathname}${u.search}${u.hash}`;
          return u.toString();
        }
      } catch {
        /* ignore */
      }
      return '';
    }
    const onclick = (el.getAttribute('onclick') ?? '').trim();
    if (!onclick) return '';
    const m = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/i);
    return (m?.[1] ?? '').trim();
  };

  const bypassReason = (url: string, el: Element): string | null => {
    if (!url) return 'empty-url';
    if (url === '#') return 'hash-empty';
    if (url.startsWith('#')) return 'hash-only';
    if (/^javascript:/i.test(url)) return 'javascript-url';
    const wbOpen = (el.getAttribute('data-wb-open') ?? '').trim().toLowerCase();
    if (wbOpen) return 'wb-modal-action';
    return null;
  };

  const isHashReason = (reason: string | null): boolean => reason === 'hash-empty' || reason === 'hash-only';

  const scrollToHashInFrame = (targetDoc: Document, url: string) => {
    if (!url.startsWith('#') || url === '#') return;
    const id = url.slice(1).trim();
    if (!id) return;
    let node: Element | null = null;
    try {
      node = targetDoc.getElementById(id);
      if (!node) node = targetDoc.querySelector(`[name="${CSS.escape(id)}"]`);
    } catch {
      node = null;
    }
    if (!node) return;
    try {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      try {
        node.scrollIntoView();
      } catch {
        /* ignore */
      }
    }
  };

  const toFrameNavigationUrl = (raw: string): string => {
    try {
      return new URL(raw, window.location.origin).toString();
    } catch {
      return raw;
    }
  };

  const navigateInCanvasFrame = (ev: MouseEvent, url: string): boolean => {
    try {
      const frameEl = editor.Canvas.getFrameEl();
      if (frameEl) {
        // Grapes uses `srcdoc`; when present it can keep editor-mutated DOM context.
        // Force real document navigation by removing `srcdoc` before assigning `src`.
        if (frameEl.hasAttribute('srcdoc')) frameEl.removeAttribute('srcdoc');
        frameEl.setAttribute('src', url);
        return true;
      }
    } catch {
      /* ignore */
    }
    const ct = ev.currentTarget;
    const fw =
      ct instanceof Window ? ct
      : ct instanceof Document ? ct.defaultView
      : null;
    if (fw) {
      try {
        fw.location.assign(url);
        return true;
      } catch {
        /* ignore */
      }
    }
    return false;
  };

  const findNavTarget = (target: EventTarget | null): { el: Element; url: string; reason: string | null } | null => {
    if (!(target instanceof Element)) return null;
    const el = target.closest('a, button[onclick], [onclick]');
    if (!el) return null;
    const url = resolveNavigateUrl(el);
    return { el, url, reason: bypassReason(url, el) };
  };

  const isHitWithinCurrentSelection = (hit: Component | undefined): boolean => {
    if (!hit || hit.is('wrapper')) return false;
    const all = editor.getSelectedAll();
    if (!all.length) return false;
    const set = new Set(all);
    let cur: Component | undefined = hit;
    while (cur && !cur.is('wrapper')) {
      if (set.has(cur)) return true;
      cur = cur.parent() ?? undefined;
    }
    return false;
  };

  const onClick = (e: MouseEvent) => {
    if (e.button !== 0) {
      dbg('skip: non-left-click', { button: e.button });
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      dbg('skip: modifier key', {
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
      });
      return;
    }
    const t = e.target;
    if (!(t instanceof Element)) {
      dbg('skip: non-element target');
      return;
    }
    const hit = resolveComponentFromPointer(editor, t);
    if (hit && !hit.is('wrapper') && !isHitWithinCurrentSelection(hit)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      try {
        editor.select(hit, { event: e });
      } catch {
        /* ignore */
      }
      dbg('select-only: suppressed action for unselected component', {
        tag: t.tagName,
      });
      return;
    }
    const nav = findNavTarget(t);
    if (!nav) {
      dbg('skip: no clickable nav element', { target: t.tagName });
      return;
    }
    if (nav.reason) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      dbg('skip: bypassed url', {
        target: t.tagName,
        tag: nav.el.tagName,
        href: nav.el.getAttribute('href'),
        onclick: nav.el.getAttribute('onclick'),
        resolvedUrl: nav.url,
        reason: nav.reason,
      });
      return;
    }

    const el = nav.el;
    const url = nav.url;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    dbg('blocked: in-canvas interaction disabled', {
      tag: el.tagName,
      href: el.getAttribute('href'),
      onclick: el.getAttribute('onclick'),
      resolvedUrl: url,
    });
  };

  const bind = () => {
    for (const off of offs) off();
    offs.length = 0;
    const docs = collectCanvasFrameDocs(editor);
    dbg('bind: attaching listeners', { docs: docs.length });
    for (const doc of docs) {
      doc.addEventListener('click', onClick, docOpts);
      offs.push(() => doc.removeEventListener('click', onClick, docOpts));
      const fw = doc.defaultView;
      if (fw) {
        fw.addEventListener('click', onClick, docOpts);
        offs.push(() => fw.removeEventListener('click', onClick, docOpts));
      }
    }
  };

  editor.on('canvas:frame:load', bind);
  editor.on('canvas:frame:load:body', bind);
  editor.on('load', bind);
  queueMicrotask(bind);
  const t = window.setTimeout(bind, 400);

  return () => {
    dbg('unbind: removing listeners', { count: offs.length });
    window.clearTimeout(t);
    editor.off('canvas:frame:load', bind);
    editor.off('canvas:frame:load:body', bind);
    editor.off('load', bind);
    for (const off of offs) off();
  };
}

const WB_CANVAS_COMPONENT_ANIM_SCRIPT_ID = 'wb-component-animations-canvas';
const WB_CANVAS_COMPONENT_ANIM_EDITOR_STYLE_ID = 'wb-component-animations-editor-visibility';

function attachCanvasComponentAnimations(editor: Editor): () => void {
  const forceEditorVisibleMotionNodes = () => {
    try {
      const doc = editor.Canvas?.getDocument?.();
      if (!doc?.body) return;
      if (shouldSkipCanvasDocMutations(doc)) return;
      const nodes = doc.querySelectorAll('.fade-up, .wb-fade-up, .wb-ds-root.wb-fade-in');
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i] as HTMLElement;
        if (el.classList.contains('fade-up')) el.classList.add('show');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('transform', 'none', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
      }
    } catch {
      /* ignore */
    }
  };

  const scheduleForceEditorVisibleMotionNodes = () => {
    forceEditorVisibleMotionNodes();
    requestAnimationFrame(() => {
      forceEditorVisibleMotionNodes();
      requestAnimationFrame(forceEditorVisibleMotionNodes);
    });
    window.setTimeout(forceEditorVisibleMotionNodes, 60);
    window.setTimeout(forceEditorVisibleMotionNodes, 180);
  };

  const inject = () => {
    try {
      const doc = editor.Canvas?.getDocument?.();
      if (!doc?.head) return;
      if (shouldSkipCanvasDocMutations(doc)) return;
      if (!doc.getElementById(WB_CANVAS_COMPONENT_ANIM_SCRIPT_ID)) {
        const s = doc.createElement('script');
        s.id = WB_CANVAS_COMPONENT_ANIM_SCRIPT_ID;
        s.src = '/wb-component-animations.js';
        s.defer = true;
        doc.head.appendChild(s);
      }
    } catch {
      /* ignore */
    }

    try {
      // Editor-only guard: animation utility classes like `.fade-up` start at opacity:0.
      // In the builder canvas this can hide newly inserted cards before runtime observers mark them shown.
      // Force visibility in-editor so components are immediately editable; preview/export keep real animation.
      const doc = editor.Canvas?.getDocument?.();
      if (!doc?.head) return;
      if (!doc.getElementById(WB_CANVAS_COMPONENT_ANIM_EDITOR_STYLE_ID)) {
        const st = doc.createElement('style');
        st.id = WB_CANVAS_COMPONENT_ANIM_EDITOR_STYLE_ID;
        st.textContent = `
          .fade-up,
          .wb-fade-up,
          .wb-ds-root.wb-fade-in {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        `;
        doc.head.appendChild(st);
      }
    } catch {
      /* ignore */
    }

    scheduleForceEditorVisibleMotionNodes();
  };
  editor.on('canvas:frame:load', inject);
  editor.on('component:add', scheduleForceEditorVisibleMotionNodes);
  editor.on('component:update', scheduleForceEditorVisibleMotionNodes);
  editor.on('load', scheduleForceEditorVisibleMotionNodes);
  queueMicrotask(inject);
  return () => {
    try {
      editor.off('canvas:frame:load', inject);
      editor.off('component:add', scheduleForceEditorVisibleMotionNodes);
      editor.off('component:update', scheduleForceEditorVisibleMotionNodes);
      editor.off('load', scheduleForceEditorVisibleMotionNodes);
    } catch {
      /* ignore */
    }
  };
}

function escapeForCodeDisplay(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const WB_HTML_BEAUTIFY_OPTS = {
  indent_size: 2,
  indent_char: ' ',
  max_preserve_newlines: 2,
  preserve_newlines: true,
  indent_inner_html: true,
  wrap_line_length: 100,
  end_with_newline: true,
} as const;

const WB_CSS_BEAUTIFY_OPTS = {
  indent_size: 2,
  newline_between_rules: true,
  space_around_combinator: true,
  end_with_newline: true,
} as const;

function formatCodeHtml(src: string): string {
  try {
    return beautify.html(src, WB_HTML_BEAUTIFY_OPTS);
  } catch {
    return src;
  }
}

function formatCodeCss(src: string): string {
  try {
    return beautify.css(src, WB_CSS_BEAUTIFY_OPTS);
  } catch {
    return src;
  }
}

type CssLineSeg = { k: 'c' | 's' | 'r'; text: string };

/** Split a CSS line into comments, strings, and raw slices so highlighting stays inside safe regions. */
function segmentCssLine(line: string): CssLineSeg[] {
  const out: CssLineSeg[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '/' && line[i + 1] === '*') {
      const end = line.indexOf('*/', i + 2);
      const j = end === -1 ? line.length : end + 2;
      out.push({ k: 'c', text: line.slice(i, j) });
      i = j;
      continue;
    }
    const q = line[i];
    if (q === '"' || q === "'") {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') {
          j += 2;
          continue;
        }
        if (line[j] === q) {
          j += 1;
          break;
        }
        j += 1;
      }
      out.push({ k: 's', text: line.slice(i, j) });
      i = j;
      continue;
    }
    let j = i + 1;
    while (j < line.length) {
      if (line[j] === '/' && line[j + 1] === '*') break;
      const cj = line[j];
      if (cj === '"' || cj === "'") break;
      j += 1;
    }
    if (j > i) out.push({ k: 'r', text: line.slice(i, j) });
    i = j;
  }
  return out;
}

function highlightCssRawChunk(text: string): string {
  let s = escapeForCodeDisplay(text);
  s = s.replace(/(#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})\b)/gi, '<span class="wb-code-hl__hex">$1</span>');
  s = s.replace(/\b(@[\w-]+)\b/g, '<span class="wb-code-hl__at">$1</span>');
  s = s.replace(/\b([\w-]+)(?=\s*\()/g, '<span class="wb-code-hl__func">$1</span>');
  s = s.replace(/\b([\w-]+)(\s*:)(?!:)/g, '<span class="wb-code-hl__prop">$1</span><span class="wb-code-hl__punct">$2</span>');
  s = s.replace(/\b(?:\d+\.\d+|\.\d+|\d+)(?:px|rem|em|vh|vw|%|deg|fr|ms|ch|ex|turn)?\b/gi, '<span class="wb-code-hl__num">$&</span>');
  s = s.replace(/([{}();,]|!important\b)/g, '<span class="wb-code-hl__punct">$1</span>');
  s = s.replace(/(&gt;|&lt;|~|\+)/g, '<span class="wb-code-hl__selop">$1</span>');
  return s;
}

function highlightCssLine(line: string): string {
  return segmentCssLine(line)
    .map((seg) => {
      if (seg.k === 'c') return `<span class="wb-code-hl__comment">${escapeForCodeDisplay(seg.text)}</span>`;
      if (seg.k === 's') return `<span class="wb-code-hl__string">${escapeForCodeDisplay(seg.text)}</span>`;
      return highlightCssRawChunk(seg.text);
    })
    .join('');
}

type HtmlLineSeg = { k: 'c' | 'r'; text: string };

function segmentHtmlLine(line: string): HtmlLineSeg[] {
  const out: HtmlLineSeg[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '<' && line.slice(i, i + 4) === '<!--') {
      const end = line.indexOf('-->', i + 4);
      const j = end === -1 ? line.length : end + 3;
      out.push({ k: 'c', text: line.slice(i, j) });
      i = j;
      continue;
    }
    let j = i + 1;
    while (j < line.length) {
      if (line[j] === '<' && line.slice(j, j + 4) === '<!--') break;
      j += 1;
    }
    if (j > i) out.push({ k: 'r', text: line.slice(i, j) });
    i = j;
  }
  return out;
}

function highlightHtmlRawChunk(text: string): string {
  let s = escapeForCodeDisplay(text);
  s = s.replace(/(&lt;!DOCTYPE\b[\s\S]*?&gt;)/gi, '<span class="wb-code-hl__doctype">$1</span>');
  s = s.replace(/(&lt;\/?)([\w:-]+)/g, '<span class="wb-code-hl__brack">$1</span><span class="wb-code-hl__tag">$2</span>');
  s = s.replace(/(\s+)([\w:-]+)(=)(&quot;[\s\S]*?&quot;)/g, '$1<span class="wb-code-hl__attr">$2</span><span class="wb-code-hl__eq">$3</span><span class="wb-code-hl__string">$4</span>');
  s = s.replace(/(\/&gt;|&gt;)/g, '<span class="wb-code-hl__brack">$1</span>');
  return s;
}

function highlightHtmlLine(line: string): string {
  return segmentHtmlLine(line)
    .map((seg) => {
      if (seg.k === 'c') return `<span class="wb-code-hl__comment">${escapeForCodeDisplay(seg.text)}</span>`;
      return highlightHtmlRawChunk(seg.text);
    })
    .join('');
}

function highlightCodeLine(line: string, kind: 'html' | 'css'): string {
  return kind === 'html' ? highlightHtmlLine(line) : highlightCssLine(line);
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function WebsiteBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ slug?: string | string[] }>();
  const editorHostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  /** Serialized `getProjectData()` after load / successful save — used to detect unsaved edits. */
  const baselineProjectJsonRef = useRef<string | null>(null);

  const [resolving, setResolving] = useState(true);
  const [resolveErr, setResolveErr] = useState<string | null>(null);
  const [resolved, setResolved] = useState<WebsiteBuilderResolvedLoad | null>(null);

  const [booting, setBooting] = useState(false);
  const [pages, setPages] = useState<BuilderPageTab[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeHtml, setCodeHtml] = useState('');
  const [codeCss, setCodeCss] = useState('');
  const [previewBusy, setPreviewBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [clearCanvasModalOpen, setClearCanvasModalOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [inspectorSelection, setInspectorSelection] = useState<SelectionInfo | null>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [deviceMode, setDeviceMode] = useState<'Desktop' | 'Tablet' | 'Mobile portrait'>('Desktop');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement | null>(null);
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('structure');

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [componentsLibOpen, setComponentsLibOpen] = useState(false);
  const [componentsLibIntent, setComponentsLibIntent] = useState<ComponentsLibraryOpenTarget>({});

  const [publishOpen, setPublishOpen] = useState(false);
  const [publishSlug, setPublishSlug] = useState('');
  const [publishBusy, setPublishBusy] = useState(false);
  const [publishErr, setPublishErr] = useState<string | null>(null);

  const [leftW, setLeftW] = useState(SIDEBAR_LEFT_DEF);
  const [rightW, setRightW] = useState(SIDEBAR_RIGHT_DEF);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const resizeDragRef = useRef<SidebarResizeDrag | null>(null);
  /** True between gutter pointerdown and document pointerup (survives mid-drag collapse clearing `resizeDragRef`). */
  const sidebarGutterDragActiveRef = useRef(false);
  /** Gutter drag session for pointerup-only auto-collapse (avoids false collapse from coalesced / jittery moves). */
  const sidebarDragSessionRef = useRef<SidebarDragSession | null>(null);
  /** Latest pointer X during gutter drag; rAF applies from this so React state stays in sync with refs on pointerup. */
  const sidebarGutterPointerXRef = useRef<number | null>(null);
  const sidebarGutterPointerIdRef = useRef<number | null>(null);
  const sidebarGutterCaptureRef = useRef<{ el: HTMLElement; pointerId: number } | null>(null);
  const sidebarGutterRafRef = useRef<number | null>(null);
  const leftWRef = useRef(SIDEBAR_LEFT_DEF);
  const rightWRef = useRef(SIDEBAR_RIGHT_DEF);
  leftWRef.current = leftW;
  rightWRef.current = rightW;

  const lastExpandedLeftWRef = useRef(SIDEBAR_LEFT_DEF);
  const lastExpandedRightWRef = useRef(SIDEBAR_RIGHT_DEF);
  const gridLayoutRef = useRef<HTMLDivElement | null>(null);
  const inspectorAsideRef = useRef<HTMLElement | null>(null);
  /** Latest “open inspector from canvas” handler (editor init effect runs before expandRightPanel in source order). */
  const openInspectFromCanvasRef = useRef<(ed: Editor, comp: Component | null) => void>(() => {});

  /** null = fill grid cell; numbers = fixed canvas card size (resizable like devtools). */
  const [canvasDims, setCanvasDims] = useState<{ w: number; h: number } | null>(null);
  const [canvasDimsLabel, setCanvasDimsLabel] = useState('');
  const canvasSectionRef = useRef<HTMLElement | null>(null);
  const canvasResizeRef = useRef<{
    kind: 'se' | 'e' | 's';
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  /** Debounced fit from {@link attachWebsiteBuilderCanvasAutoFit} — used by ResizeObserver on the canvas slot. */
  const canvasAutoFitDebouncedRef = useRef<(() => void) | null>(null);

  const routeSlug = useMemo(() => {
    const raw = params.slug;
    if (typeof raw === 'string') return raw.trim();
    if (Array.isArray(raw) && raw[0]) return String(raw[0]).trim();
    return '';
  }, [params.slug]);

  const mode: 'create' | 'edit' = routeSlug ? 'edit' : 'create';
  const templateQuery = searchParams.get('template');

  useEffect(() => {
    if (!addMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [addMenuOpen]);

  useEffect(() => {
    if (leftPanelTab !== 'components') return;
    const ed = editorRef.current;
    if (!ed) return;
    queueMicrotask(() => {
      expandBlockManagerCategories(ed);
      try {
        ed.refresh?.();
      } catch {
        /* ignore */
      }
    });
  }, [leftPanelTab]);

  useEffect(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1400;
    const initCap = maxSidebarColPx(vw, SIDEBAR_LEFT_MIN);
    const lw = readNumLs(LS_SIDEBAR_L_W, SIDEBAR_LEFT_DEF, SIDEBAR_LEFT_MIN, initCap);
    const rw = readNumLs(LS_SIDEBAR_R_W, SIDEBAR_RIGHT_DEF, SIDEBAR_RIGHT_MIN, maxSidebarColPx(vw, SIDEBAR_RIGHT_MIN));
    setLeftW(lw);
    setRightW(rw);
    lastExpandedLeftWRef.current = lw;
    lastExpandedRightWRef.current = rw;
    leftWRef.current = lw;
    rightWRef.current = rw;
    setLeftCollapsed(readBoolLs(LS_SIDEBAR_L_C, false));
    setRightCollapsed(readBoolLs(LS_SIDEBAR_R_C, false));
    setCanvasDims(readCanvasDimsLs());
  }, []);

  useEffect(() => {
    const el = gridLayoutRef.current;
    if (!el) return;
    const clampToGrid = () => {
      /* Don’t reclamp while the user is dragging a gutter — RO can fire from reflow and fight the pointer. */
      if (resizeDragRef.current) return;
      const gw = el.getBoundingClientRect().width;
      if (!gw) return;
      const lMax = maxSidebarColPx(gw, SIDEBAR_LEFT_MIN);
      const rMax = maxSidebarColPx(gw, SIDEBAR_RIGHT_MIN);
      /* Use refs — functional updaters can still see pre-drag `w` on the same frame as the last `mousemove` + `mouseup`, which snapped columns back. */
      setLeftW(() => {
        const w = leftWRef.current;
        const nw = Math.min(lMax, Math.max(SIDEBAR_LEFT_MIN, w));
        leftWRef.current = nw;
        return nw;
      });
      setRightW(() => {
        const w = rightWRef.current;
        const nw = Math.min(rMax, Math.max(SIDEBAR_RIGHT_MIN, w));
        rightWRef.current = nw;
        return nw;
      });
    };
    const ro = new ResizeObserver(clampToGrid);
    ro.observe(el);
    queueMicrotask(clampToGrid);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = canvasSectionRef.current;
    if (!el || canvasDims !== null) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setCanvasDimsLabel(`${Math.round(r.width)} × ${Math.round(r.height)}`);
    });
    ro.observe(el);
    queueMicrotask(() => {
      const r = el.getBoundingClientRect();
      setCanvasDimsLabel(`${Math.round(r.width)} × ${Math.round(r.height)}`);
    });
    return () => ro.disconnect();
  }, [canvasDims, resolved, booting, leftW, rightW, leftCollapsed, rightCollapsed]);

  useEffect(() => {
    if (canvasDims) {
      setCanvasDimsLabel(`${canvasDims.w} × ${canvasDims.h}`);
    }
  }, [canvasDims]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = canvasResizeRef.current;
      if (!d) return;
      const slot = canvasSectionRef.current?.parentElement;
      const maxW = slot ? Math.max(CANVAS_MIN_W, Math.floor(slot.getBoundingClientRect().width)) : 2400;
      const maxH = Math.max(CANVAS_MIN_H, Math.floor(window.innerHeight - 72));
      let nw = d.startW;
      let nh = d.startH;
      if (d.kind === 'se' || d.kind === 'e') nw = d.startW + (e.clientX - d.startX);
      if (d.kind === 'se' || d.kind === 's') nh = d.startH + (e.clientY - d.startY);
      nw = Math.min(maxW, Math.max(CANVAS_MIN_W, Math.round(nw)));
      nh = Math.min(maxH, Math.max(CANVAS_MIN_H, Math.round(nh)));
      setCanvasDims({ w: nw, h: nh });
      setCanvasDimsLabel(`${nw} × ${nh}`);
    };
    const onUp = () => {
      if (!canvasResizeRef.current) return;
      canvasResizeRef.current = null;
      setCanvasDims((cur) => {
        if (cur) {
          try {
            window.localStorage.setItem(LS_CANVAS_DIMS, JSON.stringify(cur));
          } catch {
            /* ignore */
          }
        }
        return cur;
      });
      queueMicrotask(() => {
        try {
          editorRef.current?.refresh?.();
          const ed = editorRef.current;
          if (ed) runCanvasAutoFit(ed);
        } catch {
          /* ignore */
        }
      });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  /** Refit zoom when the canvas column is resized so the whole page stays in view at any sidebar/window width. */
  useEffect(() => {
    if (!editorInstance) return;
    const slot = canvasSectionRef.current;
    if (!slot) return;
    const ro = new ResizeObserver(() => {
      canvasAutoFitDebouncedRef.current?.();
    });
    ro.observe(slot);
    queueMicrotask(() => {
      canvasAutoFitDebouncedRef.current?.();
    });
    return () => ro.disconnect();
  }, [editorInstance, leftW, rightW, leftCollapsed, rightCollapsed, canvasDims]);

  useEffect(() => {
    const releaseOurPointerCapture = () => {
      const cap = sidebarGutterCaptureRef.current;
      if (!cap) return;
      try {
        if (cap.el.hasPointerCapture(cap.pointerId)) cap.el.releasePointerCapture(cap.pointerId);
      } catch {
        /* ignore */
      }
      sidebarGutterCaptureRef.current = null;
    };

    const applySidebarGutterAt = (clientX: number) => {
      const d = resizeDragRef.current;
      if (!d) return;
      const gw =
        gridLayoutRef.current?.getBoundingClientRect().width ??
        (typeof window !== 'undefined' ? window.innerWidth : 1200);
      if (d.which === 'left') {
        const leftMaxPx = maxSidebarColPx(gw, SIDEBAR_LEFT_MIN);
        const deltaX = clientX - d.startX;
        const raw = d.startLeftW + deltaX;
        const narrowing = deltaX < 0;
        const sess = sidebarDragSessionRef.current;
        if (sess?.which === 'left' && narrowing) {
          sess.minRawLeft = Math.min(sess.minRawLeft, raw);
        }
        const nw = Math.min(leftMaxPx, Math.max(SIDEBAR_LEFT_MIN, raw));
        leftWRef.current = nw;
        setLeftW(nw);
      } else {
        const rightMaxPx = maxSidebarColPx(gw, SIDEBAR_RIGHT_MIN);
        const deltaX = clientX - d.startX;
        const raw = d.startRightW + (d.startX - clientX);
        const narrowing = deltaX > 0;
        const sess = sidebarDragSessionRef.current;
        if (sess?.which === 'right' && narrowing) {
          sess.minRawRight = Math.min(sess.minRawRight, raw);
        }
        const nw = Math.min(rightMaxPx, Math.max(SIDEBAR_RIGHT_MIN, raw));
        rightWRef.current = nw;
        setRightW(nw);
      }
    };

    const flushSidebarGutterRaf = () => {
      sidebarGutterRafRef.current = null;
      const cx = sidebarGutterPointerXRef.current;
      if (cx == null) return;
      applySidebarGutterAt(cx);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!resizeDragRef.current) return;
      if (sidebarGutterPointerIdRef.current != null && e.pointerId !== sidebarGutterPointerIdRef.current) return;
      sidebarGutterPointerXRef.current = e.clientX;
      if (sidebarGutterRafRef.current != null) return;
      sidebarGutterRafRef.current = window.requestAnimationFrame(flushSidebarGutterRaf);
    };

    const onPointerEnd = (e: PointerEvent) => {
      if (sidebarGutterPointerIdRef.current != null && e.pointerId !== sidebarGutterPointerIdRef.current) return;

      const session = sidebarDragSessionRef.current;
      if (sidebarGutterRafRef.current != null) {
        window.cancelAnimationFrame(sidebarGutterRafRef.current);
        sidebarGutterRafRef.current = null;
      }
      if (resizeDragRef.current != null && sidebarGutterPointerXRef.current != null) {
        applySidebarGutterAt(sidebarGutterPointerXRef.current);
      }

      releaseOurPointerCapture();
      sidebarGutterPointerIdRef.current = null;

      if (!sidebarGutterDragActiveRef.current) {
        gridLayoutRef.current?.classList.remove('website-builder-page__grid--suppress-sidebar-transition');
        resizeDragRef.current = null;
        sidebarDragSessionRef.current = null;
        sidebarGutterPointerXRef.current = null;
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');
        return;
      }

      sidebarGutterDragActiveRef.current = false;
      sidebarDragSessionRef.current = null;
      sidebarGutterPointerXRef.current = null;

      if (session?.which === 'left') {
        if (
          session.startLeftW > SIDEBAR_LEFT_MIN &&
          leftWRef.current < session.startLeftW - 10 &&
          session.minRawLeft < SIDEBAR_LEFT_MIN - SIDEBAR_COLLAPSE_SLACK_PX
        ) {
          lastExpandedLeftWRef.current = Math.max(SIDEBAR_LEFT_MIN, leftWRef.current);
          setLeftCollapsed(true);
        }
      } else if (session?.which === 'right') {
        if (
          session.startRightW > SIDEBAR_RIGHT_MIN &&
          rightWRef.current < session.startRightW - 10 &&
          session.minRawRight < SIDEBAR_RIGHT_MIN - SIDEBAR_COLLAPSE_SLACK_PX
        ) {
          lastExpandedRightWRef.current = Math.max(SIDEBAR_RIGHT_MIN, rightWRef.current);
          setRightCollapsed(true);
        }
      }

      resizeDragRef.current = null;

      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
      gridLayoutRef.current?.classList.remove('website-builder-page__grid--suppress-sidebar-transition');

      try {
        window.localStorage.setItem(LS_SIDEBAR_L_W, String(leftWRef.current));
        window.localStorage.setItem(LS_SIDEBAR_R_W, String(rightWRef.current));
      } catch {
        /* ignore */
      }
    };

    const capOpts = { capture: true };
    document.addEventListener('pointermove', onPointerMove, capOpts);
    document.addEventListener('pointerup', onPointerEnd, capOpts);
    document.addEventListener('pointercancel', onPointerEnd, capOpts);
    return () => {
      if (sidebarGutterRafRef.current != null) {
        window.cancelAnimationFrame(sidebarGutterRafRef.current);
        sidebarGutterRafRef.current = null;
      }
      releaseOurPointerCapture();
      sidebarGutterPointerIdRef.current = null;
      gridLayoutRef.current?.classList.remove('website-builder-page__grid--suppress-sidebar-transition');
      document.removeEventListener('pointermove', onPointerMove, capOpts);
      document.removeEventListener('pointerup', onPointerEnd, capOpts);
      document.removeEventListener('pointercancel', onPointerEnd, capOpts);
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setResolving(true);
    setResolveErr(null);
    setResolved(null);
    void (async () => {
      try {
        const r = await resolveWebsiteBuilderInitialCanvas({
          mode,
          routeSlug,
          templateQuery,
        });
        if (!cancelled) setResolved(r);
      } catch (e) {
        if (!cancelled) {
          setResolveErr(e instanceof Error ? e.message : 'Could not load the visual builder.');
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, routeSlug, templateQuery]);

  useEffect(() => {
    if (!resolved || !editorHostRef.current) return;

    setBooting(true);
    const editor = grapesjs.init({
      container: editorHostRef.current,
      fromElement: false,
      storageManager: false,
      /** Ctrl/Cmd+click adds to selection; Shift+click extends among siblings (GrapesJS default). */
      multipleSelection: true,
      /** Canva-style: move handle drags with transform, not only flow / CSS position. */
      dragMode: 'translate',
      selectorManager: { componentFirst: true },
      width: '100%',
      height: '100%',
      blockManager: { appendTo: '#wb-blocks' },
      traitManager: { appendTo: '#wb-traits' },
      styleManager: {
        appendTo: '#wb-styles',
        sectors: [
          { name: 'Dimension', open: false, buildProps: ['width', 'min-height', 'padding', 'margin'] },
          { name: 'Typography', open: false, buildProps: ['font-size', 'font-weight', 'color', 'line-height'] },
          { name: 'Background', open: false, buildProps: ['background', 'background-color'] },
          { name: 'Border', open: false, buildProps: ['border', 'border-radius', 'box-shadow'] },
          { name: 'Effects', open: false, buildProps: ['opacity', 'transition'] },
        ],
      },
      panels: { defaults: [] },
      /** Allow panning when zoom is below 100% after fit-to-view. */
      canvas: { scrollableCanvas: true },
    });

    editorRef.current = editor;
    setEditorInstance(editor);
    registerWebsiteBuilderExtensions(editor);
    const detachLayerGroup = registerWebsiteBuilderLayerGroup(editor);

    const syncUndoRedo = () => {
      try {
        setCanUndo(editor.UndoManager.hasUndo());
        setCanRedo(editor.UndoManager.hasRedo());
      } catch {
        setCanUndo(false);
        setCanRedo(false);
      }
    };
    editor.on('undo', syncUndoRedo);
    editor.on('redo', syncUndoRedo);
    editor.on('update', syncUndoRedo);
    queueMicrotask(syncUndoRedo);

    const syncResizeHandles = () => {
      enableCanvasResizeHandles(editor.getSelected() ?? null);
    };
    editor.on('component:selected', syncResizeHandles);
    const onComponentAdd = (model: Component) => {
      queueMicrotask(() => {
        const sel = editor.getSelected() ?? model;
        enableCanvasResizeHandles(sel);
      });
    };
    editor.on('component:add', onComponentAdd);
    queueMicrotask(syncResizeHandles);

    const detachInspector = attachSelectionListener(editor, setInspectorSelection);
    const detachCanvasSelectionFocus = attachCanvasSelectionFocus(editor);
    const detachCanvasMarquee = attachCanvasMarqueeSelect(editor);
    const detachCanvasLayerCtx = attachCanvasLayerOrderContextMenu(editor, {
      onOpenInspect: (ed, comp) => {
        openInspectFromCanvasRef.current(ed, comp);
      },
    });
    const detachCanvasClipboardPaste = attachCanvasClipboardPaste(editor);
    const detachCanvasBlockPaletteDrop = attachCanvasBlockPaletteDrop(editor);
    const detachCanvasLeadBridge = attachCanvasLeadModalsBridge(editor, { mode, routeSlug });
    const detachCanvasTopNavBridge = attachCanvasTopNavigationBridge(editor);
    const detachCanvasComponentAnimations = attachCanvasComponentAnimations(editor);
    const detachInjectedLibraryCss = attachCanvasInjectedComponentLibraryCss(editor);
    const canvasAutoFit = attachWebsiteBuilderCanvasAutoFit(editor);
    canvasAutoFitDebouncedRef.current = canvasAutoFit.debouncedFit;
    const onEditorLoadCssBaseline = () => {
      if (resolved.kind === 'project') ensureCanvasCssBaselineInComposer(editor);
    };
    editor.on('load', onEditorLoadCssBaseline);
    if (resolved.kind === 'project') {
      editor.loadProjectData(resolved.project);
    } else {
      editor.setStyle(resolved.css);
      editor.setComponents(resolved.html);
    }

    const expandCats = () => expandBlockManagerCategories(editor);
    editor.on('load', expandCats);
    queueMicrotask(expandCats);

    editor.Commands.add('wb:add-div', {
      run(ed) {
        const sel = ed.getSelected();
        const target = sel || ed.getWrapper();
        if (!target) return;
        target.append('<div style="min-height:80px; padding:16px; border:1px dashed #94a3b8;">New div</div>');
        nameLastAddedLayer(target);
      },
    });

    editor.Commands.add('wb:add-button-element', {
      run(ed) {
        const target = ed.getSelected() || ed.getWrapper();
        if (!target) return;
        target.append(
          '<button type="button" class="wb-add-el" style="padding:8px 16px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer">New button</button>',
        );
        nameLastAddedLayer(target);
      },
    });

    editor.Commands.add('wb:add-iframe', {
      run(ed) {
        const target = ed.getSelected() || ed.getWrapper();
        if (!target) return;
        target.append(
          '<iframe title="Embedded content" src="about:blank" style="width:100%;min-height:200px;border:1px solid #cbd5e1;border-radius:8px;display:block"></iframe>',
        );
        nameLastAddedLayer(target);
      },
    });

    editor.Commands.add('wb:add-map', {
      run(ed) {
        const target = ed.getSelected() || ed.getWrapper();
        if (!target) return;
        target.append(
          '<iframe title="Gym location map" src="about:blank" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="width:100%;min-height:260px;border:1px solid #cbd5e1;border-radius:10px;display:block;background:#f8fafc"></iframe>',
        );
        nameLastAddedLayer(target);
      },
    });

    editor.Commands.add('wb:add-section', {
      run(ed) {
        const target = ed.getSelected() || ed.getWrapper();
        if (!target) return;
        target.append(
          '<section class="wb-add-el" style="padding:48px 20px; background:#f8fafc; border:1px dashed #94a3b8;"><p style="margin:0">New section</p></section>',
        );
        nameLastAddedLayer(target);
      },
    });

    editor.Commands.add('wb:add-h2', {
      run(ed) {
        const target = ed.getSelected() || ed.getWrapper();
        if (!target) return;
        target.append('<h2 class="wb-add-el" style="margin:0 0 12px">New heading</h2>');
        nameLastAddedLayer(target);
      },
    });

    editor.Commands.add('wb:add-p', {
      run(ed) {
        const target = ed.getSelected() || ed.getWrapper();
        if (!target) return;
        target.append('<p class="wb-add-el" style="margin:0 0 12px">New paragraph</p>');
        nameLastAddedLayer(target);
      },
    });

    editor.Commands.add('wb:new-page', {
      run(ed) {
        const idx = ed.Pages.getAll().length + 1;
        const page = ed.Pages.add({
          id: `page-${Date.now()}`,
          name: `Page ${idx}`,
          component: `<main style="padding:40px 20px;"><h1>Page ${idx}</h1><p>Start building this page.</p></main>`,
        });
        if (page) ed.Pages.select(page);
      },
    });

    const teardownPages = syncPages(editor, setPages, setSelectedPageId);
    const baselineTimer = window.setTimeout(() => {
      try {
        baselineProjectJsonRef.current = JSON.stringify(editor.getProjectData());
      } catch {
        baselineProjectJsonRef.current = null;
      }
    }, 0);
    queueMicrotask(() => setBooting(false));

    return () => {
      window.clearTimeout(baselineTimer);
      editor.off('undo', syncUndoRedo);
      editor.off('redo', syncUndoRedo);
      editor.off('update', syncUndoRedo);
      editor.off('component:selected', syncResizeHandles);
      editor.off('component:add', onComponentAdd);
      editor.off('load', expandCats);
      detachInspector();
      detachCanvasSelectionFocus();
      detachCanvasMarquee();
      detachCanvasLayerCtx();
      detachCanvasClipboardPaste();
      detachCanvasBlockPaletteDrop();
      detachLayerGroup();
      detachCanvasLeadBridge();
      detachCanvasTopNavBridge();
      detachCanvasComponentAnimations();
      detachInjectedLibraryCss();
      canvasAutoFitDebouncedRef.current = null;
      canvasAutoFit.detach();
      try {
        editor.off('load', onEditorLoadCssBaseline);
      } catch {
        /* ignore */
      }
      setInspectorSelection(null);
      setEditorInstance(null);
      setBooting(false);
      setCanUndo(false);
      setCanRedo(false);
      baselineProjectJsonRef.current = null;
      teardownPages();
      editor.destroy();
      editorRef.current = null;
    };
  }, [resolved]);

  const switchPage = useCallback((pageId: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const page = editor.Pages.get(pageId);
    if (!page) return;
    editor.Pages.select(page);
  }, []);

  const refreshPages = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const list = editor.Pages.getAll();
    setPages(
      list.map((page, idx) => ({
        id: String(page.get('id') ?? `page-${idx + 1}`),
        name: labelForGrapesPageName(page.get('name'), idx),
      })),
    );
    const selected = editor.Pages.getSelected();
    if (selected) setSelectedPageId(String(selected.get('id')));
  }, []);

  const syncBaselineFromEditor = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      baselineProjectJsonRef.current = JSON.stringify(editor.getProjectData());
    } catch {
      baselineProjectJsonRef.current = null;
    }
  }, []);

  const hasUnsavedChanges = useCallback((): boolean => {
    const editor = editorRef.current;
    const baseline = baselineProjectJsonRef.current;
    if (!editor || baseline === null || resolving || !resolved) return false;
    try {
      return JSON.stringify(editor.getProjectData()) !== baseline;
    } catch {
      return true;
    }
  }, [resolving, resolved]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const editor = editorRef.current;
    if (!editor || !resolved) return false;
    setSaveBusy(true);
    try {
      if (mode === 'edit' && routeSlug) {
        await persistVisualBuilderToEdit(routeSlug, editor, resolved.templateSeedKey);
        alert('Website draft saved.');
      } else {
        const ok = persistVisualBuilderToCreate(editor, resolved.templateSeedKey);
        alert(ok ? 'Draft saved to this browser (Crystal preview).' : 'Could not save draft to storage.');
        if (!ok) return false;
      }
      syncBaselineFromEditor();
      return true;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed.');
      return false;
    } finally {
      setSaveBusy(false);
    }
  }, [mode, resolved, routeSlug, syncBaselineFromEditor]);

  const requestNavigate = useCallback(
    (href: string) => {
      if (!hasUnsavedChanges()) {
        router.push(href);
        return;
      }
      setPendingHref(href);
      setLeaveModalOpen(true);
    },
    [hasUnsavedChanges, router],
  );

  const discardAndLeave = useCallback(() => {
    const href = pendingHref;
    setLeaveModalOpen(false);
    setPendingHref(null);
    if (href) router.push(href);
  }, [pendingHref, router]);

  const saveAndLeave = useCallback(async () => {
    const href = pendingHref;
    const ok = await handleSave();
    if (!ok || !href) return;
    setLeaveModalOpen(false);
    setPendingHref(null);
    router.push(href);
  }, [handleSave, pendingHref, router]);

  const handleClearCanvasConfirm = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      editor.setComponents('<main class="wb-page wb-template-root"></main>');
      setInspectorSelection(null);
      try {
        editor.refresh();
      } catch {
        /* ignore */
      }
    } finally {
      setClearCanvasModalOpen(false);
    }
  }, []);

  const handleDownloadHtml = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !resolved) return;
    setDownloadBusy(true);
    try {
      const html = editor.getHtml() ?? '';
      const css = editor.getCss() ?? '';
      const seed = resolved.templateSeedKey.replace(/[^a-z0-9-_]+/gi, '-').slice(0, 48) || 'export';
      const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Website export</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
</body>
</html>`;
      const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `website-${seed}.html`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadBusy(false);
    }
  }, [resolved]);

  const handleOpenCode = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !resolved) return;
    const html = editor.getHtml() ?? '';
    setCodeHtml(html);
    setCodeCss(filterCssUsedByPageHtml(html, editor.getCss() ?? ''));
    setCodeModalOpen(true);
  }, [resolved]);

  const codeHtmlDisplay = useMemo(() => {
    const raw = codeHtml.trim() ? codeHtml : '<!-- Empty HTML -->';
    return formatCodeHtml(raw);
  }, [codeHtml]);
  const codeCssDisplay = useMemo(() => {
    const raw = codeCss.trim() ? codeCss : '/* Empty CSS */';
    return formatCodeCss(raw);
  }, [codeCss]);
  const codeHtmlLines = useMemo(() => codeHtmlDisplay.split('\n'), [codeHtmlDisplay]);
  const codeCssLines = useMemo(() => codeCssDisplay.split('\n'), [codeCssDisplay]);

  const handleCopyCodeHtml = useCallback(async () => {
    const ok = await copyTextToClipboard(codeHtmlDisplay);
    if (!ok) alert('Could not copy to clipboard.');
  }, [codeHtmlDisplay]);

  const handleCopyCodeCss = useCallback(async () => {
    const ok = await copyTextToClipboard(codeCssDisplay);
    if (!ok) alert('Could not copy to clipboard.');
  }, [codeCssDisplay]);

  const handleCopyAllCode = useCallback(async () => {
    const block = `<!-- HTML -->\n${codeHtmlDisplay}\n\n/* CSS */\n${codeCssDisplay}`;
    const ok = await copyTextToClipboard(block);
    if (!ok) alert('Could not copy to clipboard.');
  }, [codeHtmlDisplay, codeCssDisplay]);

  const handlePreview = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || !resolved) return;
    setPreviewBusy(true);
    try {
      const ok = await syncVisualBuilderDraftForPreviewTab(editor, resolved.templateSeedKey, mode, routeSlug);
      if (!ok) {
        alert('Could not sync the preview draft in this browser.');
        return;
      }
      const html = editor.getHtml() ?? '';
      const css = editor.getCss() ?? '';
      const bodyLeadAttrs = buildPreviewLeadBodyAttrs(mode, routeSlug);
      const animScriptSrc = absolutePublicAssetUrl('/wb-component-animations.js');
      const leadScriptSrc = absolutePublicAssetUrl('/wb-crystal-lead-modals.js');
      const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Website preview</title>
  <style>
${WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT}
${WEBSITE_BUILDER_CANVAS_DOCUMENT_SHELL_CSS}
${WEBSITE_BUILDER_ANIMATION_CSS}
${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}
${WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS}
${WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS}
${WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS}
${css}
  </style>
</head>
<body class="wb-template-root"${bodyLeadAttrs}>
${html}
<script defer src="${animScriptSrc}"></script>
<script src="${leadScriptSrc}"></script>
</body>
</html>`;
      const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
      const previewUrl = URL.createObjectURL(blob);
      const w = window.open(previewUrl, PREVIEW_WINDOW_NAME);
      if (w) {
        try {
          w.focus();
        } catch {
          /* cross-origin focus may fail */
        }
      }
      window.setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not open preview.');
    } finally {
      setPreviewBusy(false);
    }
  }, [mode, resolved, routeSlug]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_SIDEBAR_L_C, leftCollapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [leftCollapsed]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LS_SIDEBAR_R_C, rightCollapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [rightCollapsed]);

  const openPublishModal = useCallback(() => {
    setPublishErr(null);
    if (mode === 'edit') {
      setPublishSlug(routeSlug.trim().toLowerCase());
    } else {
      const d = readCrystalWebsitePreviewFromStorage();
      const s = d?.slug?.trim().toLowerCase() ?? '';
      setPublishSlug(s && s !== 'preview' ? s : '');
    }
    setPublishOpen(true);
  }, [mode, routeSlug]);

  const handlePublishSubmit = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || !resolved) return;
    const slugNorm =
      mode === 'edit' ? routeSlug.trim().toLowerCase() : publishSlug.trim().toLowerCase();
    if (!slugNorm) {
      setPublishErr('Enter a site URL slug.');
      return;
    }
    if (!SLUG_PATTERN.test(slugNorm)) {
      setPublishErr('Use lowercase letters, numbers, and single hyphens only.');
      return;
    }
    setPublishBusy(true);
    setPublishErr(null);
    try {
      if (mode === 'edit') {
        await persistVisualBuilderToEdit(slugNorm, editor, resolved.templateSeedKey);
      } else {
        mergePreviewDraftWithSlug(slugNorm);
        const ok = persistVisualBuilderToCreate(editor, resolved.templateSeedKey);
        if (!ok) throw new Error('Could not save draft to this browser.');
      }
      syncBaselineFromEditor();
      setPublishOpen(false);
      window.location.assign(publicGymSiteUrl(slugNorm));
    } catch (e) {
      setPublishErr(e instanceof Error ? e.message : 'Could not publish.');
    } finally {
      setPublishBusy(false);
    }
  }, [mode, publishSlug, resolved, routeSlug, syncBaselineFromEditor]);

  const bindSidebarGutterPointerDown = useCallback(
    (which: 'left' | 'right', e: React.PointerEvent<HTMLDivElement>) => {
      if (which === 'left' && leftCollapsed) return;
      if (which === 'right' && rightCollapsed) return;
      if (e.button !== 0) return;
      e.preventDefault();
      const el = e.currentTarget;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      sidebarGutterCaptureRef.current = { el, pointerId: e.pointerId };
      sidebarGutterPointerIdRef.current = e.pointerId;
      sidebarGutterPointerXRef.current = e.clientX;
      sidebarGutterDragActiveRef.current = true;
      if (which === 'left') {
        sidebarDragSessionRef.current = {
          which: 'left',
          startLeftW: leftWRef.current,
          minRawLeft: Number.POSITIVE_INFINITY,
        };
        resizeDragRef.current = {
          which: 'left',
          startX: e.clientX,
          startLeftW: leftWRef.current,
        };
      } else {
        sidebarDragSessionRef.current = {
          which: 'right',
          startRightW: rightWRef.current,
          minRawRight: Number.POSITIVE_INFINITY,
        };
        resizeDragRef.current = {
          which: 'right',
          startX: e.clientX,
          startRightW: rightWRef.current,
        };
      }
      document.body.style.setProperty('cursor', 'col-resize');
      document.body.style.setProperty('user-select', 'none');
      gridLayoutRef.current?.classList.add('website-builder-page__grid--suppress-sidebar-transition');
    },
    [leftCollapsed, rightCollapsed],
  );

  const onLeftResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => bindSidebarGutterPointerDown('left', e),
    [bindSidebarGutterPointerDown],
  );

  const onRightResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => bindSidebarGutterPointerDown('right', e),
    [bindSidebarGutterPointerDown],
  );

  const gridCssVars = useMemo(
    () =>
      ({
        ['--wb-col-left' as string]: leftCollapsed ? '48px' : `${leftW}px`,
        ['--wb-gutter-left' as string]: leftCollapsed ? '0px' : '6px',
        ['--wb-col-right' as string]: rightCollapsed ? '48px' : `${rightW}px`,
        ['--wb-gutter-right' as string]: rightCollapsed ? '0px' : '6px',
      }) as CSSProperties,
    [leftCollapsed, leftW, rightCollapsed, rightW],
  );

  const expandLeftPanel = useCallback(() => {
    const gw =
      gridLayoutRef.current?.getBoundingClientRect().width ??
      (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const cap = maxSidebarColPx(gw, SIDEBAR_LEFT_MIN);
    const w = Math.min(cap, Math.max(SIDEBAR_LEFT_MIN, lastExpandedLeftWRef.current));
    leftWRef.current = w;
    setLeftW(w);
    setLeftCollapsed(false);
  }, []);

  const expandRightPanel = useCallback(() => {
    const gw =
      gridLayoutRef.current?.getBoundingClientRect().width ??
      (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const cap = maxSidebarColPx(gw, SIDEBAR_RIGHT_MIN);
    const w = Math.min(cap, Math.max(SIDEBAR_RIGHT_MIN, lastExpandedRightWRef.current));
    rightWRef.current = w;
    setRightW(w);
    setRightCollapsed(false);
  }, []);

  openInspectFromCanvasRef.current = (ed, comp) => {
    expandRightPanel();
    setInspectorTab('content');
    if (comp) {
      try {
        ed.select(comp);
      } catch {
        /* ignore */
      }
    }
    /* Stacked/mobile grid: inspector is below the canvas — scroll it into view after the next paint. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          inspectorAsideRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } catch {
          /* ignore */
        }
      });
    });
  };

  const handleCanvasChromeContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      expandRightPanel();
      setInspectorTab('content');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            inspectorAsideRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          } catch {
            /* ignore */
          }
        });
      });
    },
    [expandRightPanel],
  );

  const onCanvasBlockPaletteDragOver = useCallback((e: React.DragEvent) => {
    const dt = e.dataTransfer;
    if (!dt || !blockPaletteDragMimePresent(dt)) return;
    e.preventDefault();
    e.stopPropagation();
    dt.dropEffect = 'copy';
  }, []);

  const onCanvasBlockPaletteDrop = useCallback((e: React.DragEvent) => {
    const ed = editorRef.current;
    const dt = e.dataTransfer;
    if (!ed || !dt || !blockPaletteDragMimePresent(dt)) return;
    e.preventDefault();
    e.stopPropagation();
    const id = readBlockIdFromPaletteDrag(dt);
    if (!id) return;

    const frame = ed.Canvas.getFrameEl() as HTMLIFrameElement | null | undefined;
    const fdoc = ed.Canvas.getDocument();
    let inserted: ReturnType<typeof insertBlockById> | undefined;
    if (frame && fdoc) {
      const fr = frame.getBoundingClientRect();
      const x = e.clientX - fr.left;
      const y = e.clientY - fr.top;
      const inside = x >= 0 && y >= 0 && x <= fr.width && y <= fr.height;
      if (inside) {
        inserted = insertBlockByIdAtFrameClientPoint(ed, id, fdoc, x, y) ?? insertBlockById(ed, id);
      } else {
        inserted = insertBlockById(ed, id);
      }
    } else {
      inserted = insertBlockById(ed, id);
    }
    if (!inserted) return;
    queueMicrotask(() => {
      try {
        ed.select(inserted);
      } catch {
        /* ignore */
      }
    });
  }, []);

  const pinchCollapseLeft = useCallback(() => {
    lastExpandedLeftWRef.current = leftWRef.current;
    setLeftCollapsed(true);
  }, []);

  const pinchCollapseRight = useCallback(() => {
    lastExpandedRightWRef.current = rightWRef.current;
    setRightCollapsed(true);
  }, []);

  const startCanvasResize = useCallback(
    (e: React.MouseEvent, kind: 'se' | 'e' | 's') => {
      e.preventDefault();
      e.stopPropagation();
      const section = canvasSectionRef.current;
      if (!section) return;
      const r = section.getBoundingClientRect();
      const baseW = canvasDims?.w ?? Math.round(r.width);
      const baseH = canvasDims?.h ?? Math.round(r.height);
      if (!canvasDims) setCanvasDims({ w: baseW, h: baseH });
      canvasResizeRef.current = {
        kind,
        startX: e.clientX,
        startY: e.clientY,
        startW: baseW,
        startH: baseH,
      };
    },
    [canvasDims],
  );

  const resetCanvasSize = useCallback(() => {
    canvasResizeRef.current = null;
    setCanvasDims(null);
    setCanvasDimsLabel('');
    try {
      window.localStorage.removeItem(LS_CANVAS_DIMS);
    } catch {
      /* ignore */
    }
    queueMicrotask(() => {
      const el = canvasSectionRef.current;
      if (el) {
        const b = el.getBoundingClientRect();
        setCanvasDimsLabel(`${Math.round(b.width)} × ${Math.round(b.height)}`);
      }
      const ed = editorRef.current;
      if (ed) runCanvasAutoFit(ed);
    });
  }, []);

  const backHref = mode === 'edit' ? `/user/business/${encodeURIComponent(routeSlug)}/settings` : '/user/create-website/select-template';
  const runCommand = useCallback((cmd: string) => {
    editorRef.current?.runCommand(cmd);
  }, []);

  const setDevice = useCallback((device: 'Desktop' | 'Tablet' | 'Mobile portrait') => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.setDevice(device);
    setDeviceMode(device);
    queueMicrotask(() => {
      try {
        ed.refresh();
      } catch {
        /* ignore */
      }
      queueMicrotask(() => {
        try {
          runCanvasAutoFit(ed);
        } catch {
          /* ignore */
        }
      });
    });
  }, []);

  const editorDeviceAttr =
    deviceMode === 'Desktop' ? 'desktop' : deviceMode === 'Tablet' ? 'tablet' : 'mobile';

  return (
    <PageContainer className="website-builder-page__page-container">
      <main className="website-builder-page py-3">
        <Container fluid className="website-builder-page__container">
          {resolveErr ?
            <div className="alert alert-danger" role="alert">
              {resolveErr}
            </div>
          : null}

          <div className="website-builder-page__workbar mb-2">
            <div className="website-builder-page__workbar-group website-builder-page__workbar-group--left" ref={addMenuRef}>
              <button
                type="button"
                className="website-builder-page__workbar-back"
                aria-label={mode === 'edit' ? 'Back to site settings' : 'Back to template selection'}
                disabled={resolving || Boolean(resolveErr) || !resolved}
                title={mode === 'edit' ? 'Back to site settings' : 'Back to template selection'}
                onClick={() => requestNavigate(backHref)}
              >
                <ArrowBackOutlinedIcon fontSize="small" />
              </button>
              <Button
                size="sm"
                className="website-builder-page__workbar-save"
                disabled={saveBusy || resolving || Boolean(resolveErr) || !resolved}
                title={mode === 'edit' ? 'Save to website' : 'Save draft locally'}
                onClick={() => void handleSave()}
              >
                {saveBusy ? 'Saving…' : 'Save'}
              </Button>
              <div className="website-builder-page__add-wrap">
                <Button
                  size="sm"
                  className="website-builder-page__workbar-add"
                  type="button"
                  aria-expanded={addMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setAddMenuOpen((o) => !o)}
                >
                  <AddOutlinedIcon fontSize="small" className="website-builder-page__workbar-add-icon" aria-hidden />
                  Add
                </Button>
                {addMenuOpen ?
                  <div className="website-builder-page__add-menu" role="menu">
                    <button type="button" className="website-builder-page__add-menu-item" role="menuitem" onClick={() => { runCommand('wb:add-div'); setAddMenuOpen(false); }}>
                      Div
                    </button>
                    <button type="button" className="website-builder-page__add-menu-item" role="menuitem" onClick={() => { runCommand('wb:add-button-element'); setAddMenuOpen(false); }}>
                      Button
                    </button>
                    <button type="button" className="website-builder-page__add-menu-item" role="menuitem" onClick={() => { runCommand('wb:add-iframe'); setAddMenuOpen(false); }}>
                      Iframe
                    </button>
                    <button type="button" className="website-builder-page__add-menu-item" role="menuitem" onClick={() => { runCommand('wb:add-map'); setAddMenuOpen(false); }}>
                      Map
                    </button>
                    <button type="button" className="website-builder-page__add-menu-item" role="menuitem" onClick={() => { runCommand('wb:add-section'); setAddMenuOpen(false); }}>
                      Section
                    </button>
                    <button type="button" className="website-builder-page__add-menu-item" role="menuitem" onClick={() => { runCommand('wb:add-h2'); setAddMenuOpen(false); }}>
                      Heading
                    </button>
                    <button type="button" className="website-builder-page__add-menu-item" role="menuitem" onClick={() => { runCommand('wb:add-p'); setAddMenuOpen(false); }}>
                      Paragraph
                    </button>
                  </div>
                : null}
              </div>
              <Button
                size="sm"
                className="website-builder-page__workbar-code"
                type="button"
                disabled={resolving || Boolean(resolveErr) || !resolved}
                title="View current page HTML and CSS"
                onClick={() => handleOpenCode()}
              >
                <CodeOutlinedIcon fontSize="small" className="website-builder-page__workbar-code-icon" aria-hidden />
                Code
              </Button>
              <Button
                size="sm"
                className="website-builder-page__workbar-download"
                type="button"
                disabled={downloadBusy || resolving || Boolean(resolveErr) || !resolved}
                title="Download HTML file"
                onClick={() => handleDownloadHtml()}
              >
                <FileDownloadOutlinedIcon fontSize="small" className="website-builder-page__workbar-download-icon" aria-hidden />
                {downloadBusy ? 'Preparing…' : 'Download HTML'}
              </Button>
              <Button
                size="sm"
                type="button"
                className="website-builder-page__workbar-library"
                disabled={resolving || Boolean(resolveErr) || !resolved}
                title="Browse and insert ready-made blocks"
                onClick={() => setComponentsLibOpen(true)}
              >
                <ViewModuleOutlinedIcon fontSize="small" className="website-builder-page__workbar-library-icon" aria-hidden />
                Library
              </Button>
              <Button
                size="sm"
                type="button"
                variant="outline-danger"
                disabled={resolving || Boolean(resolveErr) || !resolved}
                title="Clear current page canvas"
                onClick={() => setClearCanvasModalOpen(true)}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" aria-hidden />
                Clear
              </Button>
            </div>
            <div className="website-builder-page__workbar-group website-builder-page__workbar-group--center">
              <button
                type="button"
                className={`website-builder-page__icon-btn${deviceMode === 'Desktop' ? ' is-active' : ''}`}
                onClick={() => setDevice('Desktop')}
                aria-label="Desktop view"
              >
                <DesktopWindowsOutlinedIcon fontSize="small" />
              </button>
              <button
                type="button"
                className={`website-builder-page__icon-btn${deviceMode === 'Tablet' ? ' is-active' : ''}`}
                onClick={() => setDevice('Tablet')}
                aria-label="Tablet view"
              >
                <TabletMacOutlinedIcon fontSize="small" />
              </button>
              <button
                type="button"
                className={`website-builder-page__icon-btn${deviceMode === 'Mobile portrait' ? ' is-active' : ''}`}
                onClick={() => setDevice('Mobile portrait')}
                aria-label="Mobile view"
              >
                <PhoneIphoneOutlinedIcon fontSize="small" />
              </button>
              <button
                type="button"
                className={`website-builder-page__icon-btn website-builder-page__icon-btn--ghost${canUndo ? ' website-builder-page__icon-btn--history-ready' : ' website-builder-page__icon-btn--history-idle'}`}
                disabled={!canUndo || resolving || Boolean(resolveErr) || !resolved}
                onClick={() => runCommand('core:undo')}
                aria-label="Undo"
                title={canUndo ? 'Undo' : 'Nothing to undo'}
              >
                <UndoOutlinedIcon fontSize="small" />
              </button>
              <button
                type="button"
                className={`website-builder-page__icon-btn website-builder-page__icon-btn--ghost${canRedo ? ' website-builder-page__icon-btn--history-ready' : ' website-builder-page__icon-btn--history-idle'}`}
                disabled={!canRedo || resolving || Boolean(resolveErr) || !resolved}
                onClick={() => runCommand('core:redo')}
                aria-label="Redo"
                title={canRedo ? 'Redo' : 'Nothing to redo'}
              >
                <RedoOutlinedIcon fontSize="small" />
              </button>
            </div>
            <div className="website-builder-page__workbar-group website-builder-page__workbar-group--actions">
              <Button
                size="sm"
                className="website-builder-page__top-btn website-builder-page__top-btn--ghost"
                disabled={previewBusy || resolving || Boolean(resolveErr) || !resolved}
                onClick={() => void handlePreview()}
              >
                <RemoveRedEyeOutlinedIcon fontSize="small" className="website-builder-page__top-btn-icon" />
                {previewBusy ? 'Opening…' : 'Preview'}
              </Button>
              <Button
                size="sm"
                className="website-builder-page__top-btn website-builder-page__top-btn--publish"
                disabled={publishBusy || resolving || Boolean(resolveErr) || !resolved}
                onClick={() => openPublishModal()}
              >
                <PublicOutlinedIcon fontSize="small" className="website-builder-page__top-btn-icon" aria-hidden />
                {publishBusy ? 'Working…' : 'Publish'}
              </Button>
            </div>
          </div>

          <Modal
            show={leaveModalOpen}
            onHide={() => setLeaveModalOpen(false)}
            centered
            animation
            dialogClassName="website-builder-page__leave-modal-dialog"
            contentClassName="website-builder-page__leave-modal-content"
            backdropClassName="website-builder-page__leave-modal-backdrop"
          >
            <Modal.Header closeButton className="website-builder-page__leave-modal-header" />
            <Modal.Body className="website-builder-page__leave-modal-body">
              <div className="website-builder-page__leave-modal-icon-wrap" aria-hidden>
                <WarningAmberRoundedIcon className="website-builder-page__leave-modal-icon" />
              </div>
              <h2 className="website-builder-page__leave-modal-title">Unsaved changes</h2>
              <p className="website-builder-page__leave-modal-copy">
                Your changes will be lost if you leave the builder now. Save your work, or discard and leave.
              </p>

              <div className="website-builder-page__leave-modal-note" role="status" aria-live="polite">
                <div className="website-builder-page__leave-modal-note-ico">
                  <DescriptionOutlinedIcon fontSize="small" />
                </div>
                <div>
                  <p className="website-builder-page__leave-modal-note-title">You have unsaved changes</p>
                  <p className="website-builder-page__leave-modal-note-sub">Last edited a few seconds ago</p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="website-builder-page__leave-modal-footer">
              <Button variant="outline-secondary" className="website-builder-page__leave-btn website-builder-page__leave-btn--cancel" onClick={() => setLeaveModalOpen(false)}>
                <CloseOutlinedIcon fontSize="small" />
                Cancel
              </Button>
              <Button variant="outline-danger" className="website-builder-page__leave-btn website-builder-page__leave-btn--discard" onClick={() => discardAndLeave()}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
                Discard changes
              </Button>
              <Button variant="primary" className="website-builder-page__leave-btn website-builder-page__leave-btn--save" disabled={saveBusy} onClick={() => void saveAndLeave()}>
                <SaveOutlinedIcon fontSize="small" />
                {saveBusy ? 'Saving…' : 'Save and leave'}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={clearCanvasModalOpen} onHide={() => setClearCanvasModalOpen(false)} centered animation>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h5 mb-0">
                Clear canvas
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-2 fw-semibold">Are you sure?</p>
              <p className="text-muted small mb-0">
                This will remove all sections and components from the current page canvas. This action cannot be undone with one click.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setClearCanvasModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleClearCanvasConfirm()}>
                Clear canvas
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={codeModalOpen}
            onHide={() => setCodeModalOpen(false)}
            centered
            scrollable
            size="xl"
            contentClassName="wb-code-modal__content"
            dialogClassName="wb-code-modal__dialog"
            backdropClassName="wb-code-modal__backdrop"
          >
            <Modal.Body className="wb-code-modal__body p-0">
              <div className="wb-code-modal__shell">
                <header className="wb-code-modal__header">
                  <div className="wb-code-modal__header-main">
                    <span className="wb-code-modal__header-icon" aria-hidden>
                      <CodeOutlinedIcon className="wb-code-modal__header-icon-svg" fontSize="inherit" />
                    </span>
                    <div>
                      <h2 className="wb-code-modal__title">Current page code</h2>
                      <p className="wb-code-modal__subtitle">
                        View and copy your current page HTML, and CSS rules that match this markup (not the full canvas
                        stylesheet).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="wb-code-modal__close"
                    aria-label="Close"
                    onClick={() => setCodeModalOpen(false)}
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </button>
                </header>

                <div className="wb-code-modal__panels">
                  <section className="wb-code-modal__card" aria-labelledby="wb-code-html-label">
                    <div className="wb-code-modal__card-head">
                      <div className="wb-code-modal__card-head-left">
                        <span className="wb-code-modal__card-icon wb-code-modal__card-icon--html" aria-hidden>
                          <DataObjectOutlinedIcon fontSize="small" />
                        </span>
                        <span id="wb-code-html-label" className="wb-code-modal__card-label">
                          HTML
                        </span>
                      </div>
                      <button type="button" className="wb-code-modal__btn-ghost" onClick={() => void handleCopyCodeHtml()}>
                        <ContentCopyOutlinedIcon fontSize="small" aria-hidden />
                        Copy
                      </button>
                    </div>
                    <div className="wb-code-modal__editor">
                      {codeHtmlLines.map((line, i) => (
                        <div key={`h-${i}`} className="wb-code-modal__row">
                          <span className="wb-code-modal__ln">{i + 1}</span>
                          <code
                            className="wb-code-modal__line"
                            dangerouslySetInnerHTML={{ __html: highlightCodeLine(line, 'html') }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="wb-code-modal__card-foot">
                      <span className="wb-code-modal__card-note">
                        <InfoOutlinedIcon className="wb-code-modal__card-note-icon" fontSize="inherit" aria-hidden />
                        HTML structure of your current page.
                      </span>
                      <span className="wb-code-modal__card-meta">
                        <span className="wb-code-modal__status wb-code-modal__status--html" aria-hidden />
                        {codeHtmlLines.length} line{codeHtmlLines.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </section>

                  <section className="wb-code-modal__card" aria-labelledby="wb-code-css-label">
                    <div className="wb-code-modal__card-head">
                      <div className="wb-code-modal__card-head-left">
                        <span className="wb-code-modal__card-icon wb-code-modal__card-icon--css" aria-hidden>
                          <StyleOutlinedIcon fontSize="small" />
                        </span>
                        <span id="wb-code-css-label" className="wb-code-modal__card-label">
                          CSS
                        </span>
                      </div>
                      <button type="button" className="wb-code-modal__btn-ghost" onClick={() => void handleCopyCodeCss()}>
                        <ContentCopyOutlinedIcon fontSize="small" aria-hidden />
                        Copy
                      </button>
                    </div>
                    <div className="wb-code-modal__editor">
                      {codeCssLines.map((line, i) => (
                        <div key={`c-${i}`} className="wb-code-modal__row">
                          <span className="wb-code-modal__ln">{i + 1}</span>
                          <code
                            className="wb-code-modal__line"
                            dangerouslySetInnerHTML={{ __html: highlightCodeLine(line, 'css') }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="wb-code-modal__card-foot">
                      <span className="wb-code-modal__card-note">
                        <InfoOutlinedIcon className="wb-code-modal__card-note-icon" fontSize="inherit" aria-hidden />
                        CSS kept when a selector matches your current HTML (plus referenced @keyframes).
                      </span>
                      <span className="wb-code-modal__card-meta">
                        <span className="wb-code-modal__status wb-code-modal__status--css" aria-hidden />
                        {codeCssLines.length} line{codeCssLines.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </section>
                </div>

                <footer className="wb-code-modal__footer">
                  <div className="wb-code-modal__tip">
                    <LightbulbOutlinedIcon className="wb-code-modal__tip-icon" fontSize="small" aria-hidden />
                    <span>Tip: You can copy the code and use it anywhere you like.</span>
                  </div>
                  <div className="wb-code-modal__footer-actions">
                    <button type="button" className="wb-code-modal__btn-ghost" onClick={() => void handleCopyAllCode()}>
                      <ContentCopyOutlinedIcon fontSize="small" aria-hidden />
                      Copy all
                    </button>
                    <button type="button" className="wb-code-modal__btn-primary" onClick={() => setCodeModalOpen(false)}>
                      Close
                    </button>
                  </div>
                </footer>
              </div>
            </Modal.Body>
          </Modal>

          <Modal show={publishOpen} onHide={() => !publishBusy && setPublishOpen(false)} centered animation>
            <Modal.Header closeButton={!publishBusy}>
              <Modal.Title as="h2" className="h5 mb-0">
                Publish site
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted small mb-3">
                We’ll save your current design, then open your public gym page. Example:{' '}
                <span className="fw-semibold text-body">{publicGymSiteHostLabel('my-gym')}</span>
              </p>
              <Form.Group className="mb-2" controlId="wb-publish-slug">
                <Form.Label className="small fw-semibold">
                  {mode === 'edit' ? 'Site slug' : 'Choose your site slug'}
                </Form.Label>
                {mode === 'edit' ?
                  <p className="mb-0 fw-semibold font-monospace small">{publishSlug || routeSlug}</p>
                : <Form.Control
                    type="text"
                    value={publishSlug}
                    onChange={(e) => setPublishSlug(e.target.value.trim().toLowerCase())}
                    placeholder="my-gym"
                    autoComplete="off"
                    disabled={publishBusy}
                  />
                }
                <Form.Text className="text-muted text-break">
                  {mode === 'edit' && routeSlug.trim() ?
                    publicGymSiteUrl(routeSlug.trim())
                  : publishSlug.trim() ?
                    publicGymSiteUrl(publishSlug.trim())
                  : 'Lowercase letters, numbers, and hyphens only.'}
                </Form.Text>
              </Form.Group>
              {publishErr ?
                <p className="text-danger small mb-0" role="alert">
                  {publishErr}
                </p>
              : null}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" disabled={publishBusy} onClick={() => setPublishOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={publishBusy} onClick={() => void handlePublishSubmit()}>
                {publishBusy ? 'Saving…' : 'Save and open site'}
              </Button>
            </Modal.Footer>
          </Modal>

          <div
            ref={gridLayoutRef}
            className="website-builder-page__grid website-builder-page__grid--resizable"
            style={gridCssVars}
          >
            <aside
              className={`website-builder-page__sidebar website-builder-page__sidebar--pages${leftCollapsed ? ' website-builder-page__sidebar--collapsed-rail' : ''}`}
            >
              {leftCollapsed ?
                <button
                  type="button"
                  className="website-builder-page__sidebar-rail-btn"
                  aria-label="Expand left panel"
                  title="Expand left panel"
                  onClick={() => expandLeftPanel()}
                >
                  <ChevronRightOutlinedIcon fontSize="small" />
                </button>
              : (
                <button
                  type="button"
                  className="website-builder-page__sidebar-pinch website-builder-page__sidebar-pinch--left"
                  aria-label="Collapse left panel"
                  title="Collapse left panel"
                  onClick={() => pinchCollapseLeft()}
                >
                  <ChevronLeftOutlinedIcon fontSize="small" />
                </button>
              )}
              <div
                className={
                  leftCollapsed ? 'website-builder-page__sidebar-offscreen' : 'website-builder-page__sidebar-panel'
                }
              >
                <WebsiteBuilderLeftPanel
                  editor={editorInstance}
                  tab={leftPanelTab}
                  onTabChange={setLeftPanelTab}
                  pages={pages}
                  selectedPageId={selectedPageId}
                  onSelectPage={switchPage}
                  onNewPage={() => runCommand('wb:new-page')}
                  onPageRenamed={refreshPages}
                  onAddSection={() => runCommand('wb:add-section')}
                  onOpenComponentsLibrary={(target) => {
                    setComponentsLibIntent(target ?? {});
                    setComponentsLibOpen(true);
                  }}
                />
              </div>
            </aside>

            <div
              className={`website-builder-page__col-resizer${leftCollapsed ? ' is-disabled' : ''}`}
              onPointerDown={onLeftResizePointerDown}
              role="separator"
              aria-orientation="vertical"
              aria-hidden={leftCollapsed}
            />

            <div
              className="website-builder-page__canvas-slot"
              onContextMenu={handleCanvasChromeContextMenu}
              onDragOver={onCanvasBlockPaletteDragOver}
              onDrop={onCanvasBlockPaletteDrop}
            >
              <section
                ref={canvasSectionRef}
                className={`website-builder-page__canvas card shadow-sm border-0${canvasDims ? ' website-builder-page__canvas--sized' : ' website-builder-page__canvas--fill'}`}
                style={
                  canvasDims ?
                    {
                      width: canvasDims.w,
                      height: canvasDims.h,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }
                  : undefined
                }
              >
                {canvasDimsLabel ?
                  <button
                    type="button"
                    className="website-builder-page__canvas-dims"
                    title="Double-click to fit workspace"
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      resetCanvasSize();
                      editorRef.current?.refresh?.();
                      const ed = editorRef.current;
                      if (ed) queueMicrotask(() => runCanvasAutoFit(ed));
                    }}
                  >
                    {canvasDimsLabel}
                  </button>
                : null}
                <button
                  type="button"
                  className="website-builder-page__canvas-resize website-builder-page__canvas-resize--e"
                  aria-label="Resize canvas width"
                  onMouseDown={(e) => startCanvasResize(e, 'e')}
                />
                <button
                  type="button"
                  className="website-builder-page__canvas-resize website-builder-page__canvas-resize--s"
                  aria-label="Resize canvas height"
                  onMouseDown={(e) => startCanvasResize(e, 's')}
                />
                <button
                  type="button"
                  className="website-builder-page__canvas-resize website-builder-page__canvas-resize--se"
                  aria-label="Resize canvas width and height"
                  onMouseDown={(e) => startCanvasResize(e, 'se')}
                />
                {resolving || (resolved !== null && booting) ?
                  <div className="website-builder-page__loader">
                    <Spinner animation="border" />
                  </div>
                : null}
                <div
                  ref={editorHostRef}
                  className="website-builder-page__editor"
                  data-wb-device={editorDeviceAttr}
                  onContextMenuCapture={handleCanvasChromeContextMenu}
                />
                {resolved ?
                  <div
                    id="wb-blocks"
                    className="website-builder-page__blocks-mount-inner website-builder-page__blocks-mount--hidden"
                    aria-hidden
                  />
                : null}
              </section>
            </div>

            <div
              className={`website-builder-page__col-resizer${rightCollapsed ? ' is-disabled' : ''}`}
              onPointerDown={onRightResizePointerDown}
              role="separator"
              aria-orientation="vertical"
              aria-hidden={rightCollapsed}
            />

            <aside
              ref={inspectorAsideRef}
              className={`website-builder-page__sidebar website-builder-page__sidebar--inspector${rightCollapsed ? ' website-builder-page__sidebar--collapsed-rail' : ''}`}
            >
              {rightCollapsed ?
                <button
                  type="button"
                  className="website-builder-page__sidebar-rail-btn website-builder-page__sidebar-rail-btn--right"
                  aria-label="Expand right panel"
                  title="Expand right panel"
                  onClick={() => expandRightPanel()}
                >
                  <ChevronLeftOutlinedIcon fontSize="small" />
                </button>
              : (
                <button
                  type="button"
                  className="website-builder-page__sidebar-pinch website-builder-page__sidebar-pinch--right"
                  aria-label="Collapse right panel"
                  title="Collapse right panel"
                  onClick={() => pinchCollapseRight()}
                >
                  <ChevronRightOutlinedIcon fontSize="small" />
                </button>
              )}
              <div
                className={
                  rightCollapsed ? 'website-builder-page__sidebar-offscreen' : 'website-builder-page__sidebar-panel'
                }
              >
                <WebsiteBuilderInspector
                  editor={editorInstance}
                  selection={inspectorSelection}
                  tab={inspectorTab}
                  onTabChange={setInspectorTab}
                  builderPages={pages}
                />
              </div>
            </aside>
          </div>
        </Container>
      </main>
      <WebsiteBuilderComponentsLibrary
        editor={editorInstance}
        isOpen={componentsLibOpen}
        onClose={() => {
          setComponentsLibOpen(false);
          setComponentsLibIntent({});
        }}
        onAddSection={() => runCommand('wb:add-section')}
        disabled={!editorInstance || resolving || Boolean(resolveErr) || !resolved}
        initialFilter={componentsLibIntent.filter}
        initialScope={componentsLibIntent.scope}
      />
    </PageContainer>
  );
}
