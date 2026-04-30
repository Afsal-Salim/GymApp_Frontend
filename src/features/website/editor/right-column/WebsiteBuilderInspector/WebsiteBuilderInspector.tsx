'use client';

import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Component, Editor } from 'grapesjs';
import type { InspectorKind, SelectionInfo } from '@/features/website/editor/right-column/websiteBuilderInspector/websiteBuilderInspector';
import { findOne, getDirectText, getHeroContent, setDirectText } from '@/features/website/editor/right-column/websiteBuilderInspector/websiteBuilderInspector';
import { looksLikeGoogleMapsUrl, normalizeGoogleMapsIframeSrc } from '@/features/website/editor/blocks/websiteBuilderGoogleMapsEmbed/websiteBuilderGoogleMapsEmbed';
import { waMeHrefFromDigits } from '@/features/website/editor/blocks/websiteBuilderBlocks/websiteBuilderBlocks';
import { applySectionSpacingPreset } from '@/features/website/editor/tools/websiteBuilderEditorTools';

export type InspectorTab = 'content' | 'design' | 'advanced';

/** Grapes page list (id + display name) for “link to page” in Basics. */
export type BuilderPageOption = { id: string; name: string };

type Props = {
  editor: Editor | null;
  selection: SelectionInfo | null;
  tab: InspectorTab;
  onTabChange: (t: InspectorTab) => void;
  /** When set, link buttons can target another builder page (href uses a simple `/slug` path). */
  builderPages?: BuilderPageOption[];
};

const SECTION_TYPES = ['Hero', 'About', 'Services', 'Pricing', 'Contact', 'Custom'] as const;

/** Font stacks for the Style tab (`font-family` on the selected block). */
const INSPECTOR_FONT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Same as rest of page' },
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Poppins, system-ui, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, system-ui, sans-serif', label: 'Montserrat' },
  { value: 'DM Sans, system-ui, sans-serif', label: 'DM Sans' },
  { value: 'Playfair Display, Georgia, serif', label: 'Playfair Display' },
  { value: 'Merriweather, Georgia, serif', label: 'Merriweather' },
  { value: 'Oswald, system-ui, sans-serif', label: 'Oswald' },
  { value: 'Bebas Neue, Impact, sans-serif', label: 'Bebas Neue' },
  { value: 'monospace', label: 'Monospace' },
];

type ButtonActionChoice = 'none' | 'section' | 'page' | 'custom' | 'join' | 'visit' | 'trial' | 'enquiry';

function sliceMax(s: string, max: number) {
  return s.length > max ? s.slice(0, max) : s;
}

function patchAttributes(comp: Component, patch: Record<string, string | undefined>) {
  const next = { ...(comp.getAttributes?.() ?? {}) } as Record<string, string>;
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === '') delete next[key];
    else next[key] = value;
  }
  comp.set('attributes', next);
}

function sanitizeModalAction(raw: string): ButtonActionChoice | null {
  const v = raw.trim().toLowerCase();
  if (v === 'join' || v === 'enquiry' || v === 'visit' || v === 'trial') return v;
  return null;
}

function sanitizeSectionTarget(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 80);
}

function slugifyPagePathSegment(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 48);
  return s || 'page';
}

function hrefForBuilderPage(page: BuilderPageOption, index: number): string {
  if (index === 0) return '/';
  return `/${slugifyPagePathSegment(page.name)}`;
}

function findPageIndexByHref(href: string, pages: BuilderPageOption[]): number | null {
  const h = href.trim();
  if (!pages.length) return null;
  if (h === '#') return null;
  if (h === '/' || h === '') return 0;
  const path = h.replace(/^\//, '').split('?')[0].split('#')[0];
  if (!path) return 0;
  for (let i = 0; i < pages.length; i++) {
    const want = hrefForBuilderPage(pages[i]!, i);
    if (want === `/${path}` || want === h) return i;
  }
  for (let i = 0; i < pages.length; i++) {
    if (slugifyPagePathSegment(pages[i]!.name) === path) return i;
  }
  return null;
}

function parseOnclickHref(onclick: string): string | null {
  const m = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
  return m?.[1] ?? null;
}

function parseMailtoEmail(href: string): string {
  const raw = href.trim();
  if (!raw.toLowerCase().startsWith('mailto:')) return '';
  try {
    const rest = raw.slice('mailto:'.length);
    return decodeURIComponent(rest.split('?')[0] ?? '');
  } catch {
    return '';
  }
}

function parseTelNumber(href: string): string {
  return href.replace(/^tel:/i, '').trim();
}

function resolveGalleryCarouselRoot(comp: Component): Component | undefined {
  let cur: Component | null | undefined = comp;
  while (cur && !cur.is?.('wrapper')) {
    const attrs = cur.getAttributes?.() ?? {};
    const cls = String(attrs.class || '');
    if (/\bwb-gallery-carousel\b/.test(cls) || String(attrs['data-wb-gallery-carousel'] || '') === '1') {
      return cur;
    }
    cur = cur.parent?.();
  }
  return undefined;
}

/**
 * Accept domain-only image input (e.g. "example.com/a.jpg") by normalizing to https URL.
 * Keep explicit relative/data/blob/protocol URLs unchanged.
 */
function normalizeImageSrcInput(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (
    t.startsWith('/') ||
    t.startsWith('./') ||
    t.startsWith('../') ||
    t.startsWith('data:') ||
    t.startsWith('blob:') ||
    t.startsWith('//') ||
    /^https?:\/\//i.test(t)
  ) {
    return t;
  }
  if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/:?#].*)?$/i.test(t)) {
    return `https://${t}`;
  }
  return t;
}

function inferLinkButtonAction(comp: Component, pages: BuilderPageOption[]): ButtonActionChoice {
  const attrs = comp.getAttributes?.() ?? {};
  const modal = sanitizeModalAction(String(attrs['data-wb-open'] ?? ''));
  if (modal) return modal;
  const href = String(attrs.href ?? '').trim();
  if (href.startsWith('#') && href.length > 1) return 'section';
  const idx = findPageIndexByHref(href, pages);
  if (idx != null && idx >= 0) return 'page';
  if (href && href !== '#') return 'custom';
  return 'none';
}

function inferPushButtonAction(comp: Component, pages: BuilderPageOption[]): ButtonActionChoice {
  const attrs = comp.getAttributes?.() ?? {};
  const modal = sanitizeModalAction(String(attrs['data-wb-open'] ?? ''));
  if (modal) return modal;
  const onclick = String(attrs.onclick ?? '');
  const nav = parseOnclickHref(onclick);
  if (nav) {
    if (nav.startsWith('#') && nav.length > 1) return 'section';
    const idx = findPageIndexByHref(nav, pages);
    if (idx != null && idx >= 0) return 'page';
    return 'custom';
  }
  if (/href\s*=\s*['"]#/.test(onclick) || /location\.hash\s*=/.test(onclick)) return 'section';
  return 'none';
}

function toOnclickNavigate(url: string): string {
  const escaped = url.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `try{if('${escaped}'.charAt(0)!=='#'&&window.top&&window.top!==window){window.top.location.href='${escaped}';}else{window.location.href='${escaped}';}}catch(e){window.location.href='${escaped}';}`;
}

function InspectorEmpty() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-title">Pick something on the page</p>
      <p className="website-builder-page__inspector-empty-text">
        Click any heading, picture, button, or area on your site preview. Then use <strong>Basics</strong> for words and links,{' '}
        <strong>Style</strong> for colours and layout, and <strong>Extras</strong> only when you need motion or jump links.
      </p>
    </div>
  );
}

function WrapperHint() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-title">Whole page</p>
      <p className="website-builder-page__inspector-empty-text">
        Click a heading, image, or block <em>inside</em> the preview — that is where you edit text and colours. The empty frame around the page has no settings here.
      </p>
    </div>
  );
}

type HeroBg = 'image' | 'video' | 'slider' | 'color';

export function WebsiteBuilderInspector({ editor, selection, tab, onTabChange, builderPages = [] }: Props) {
  const selected = useMemo(() => {
    if (!editor || !selection || selection.kind === 'wrapper') return null;
    return editor.getSelected() ?? null;
  }, [editor, selection]);

  const panelTitle = selection?.kind === 'wrapper' ? 'Inspector' : (selection?.title ?? 'Edit section');

  const closePanel = useCallback(() => {
    const ed = editor;
    if (!ed) return;
    const w = ed.getWrapper();
    if (w) ed.select(w);
  }, [editor]);

  const showStylesDock = tab === 'design' && selection && selection.kind !== 'hero';
  const showAdvancedDock = tab === 'advanced';

  return (
    <>
      <div className="website-builder-page__panel-head">
        <strong className="website-builder-page__panel-title">{panelTitle}</strong>
        <button type="button" className="website-builder-page__panel-close" aria-label="Close panel" onClick={closePanel}>
          ×
        </button>
      </div>
      <div className="website-builder-page__inspector-tabs website-builder-page__inspector-tabs--icons">
        <button
          type="button"
          className={`website-builder-page__inspector-tab${tab === 'content' ? ' is-active' : ''}`}
          onClick={() => onTabChange('content')}
        >
          <ArticleOutlinedIcon className="website-builder-page__inspector-tab-icon" fontSize="small" />
          <span>Basics</span>
        </button>
        <button
          type="button"
          className={`website-builder-page__inspector-tab${tab === 'design' ? ' is-active' : ''}`}
          onClick={() => onTabChange('design')}
        >
          <PaletteOutlinedIcon className="website-builder-page__inspector-tab-icon" fontSize="small" />
          <span>Style</span>
        </button>
        <button
          type="button"
          className={`website-builder-page__inspector-tab${tab === 'advanced' ? ' is-active' : ''}`}
          onClick={() => onTabChange('advanced')}
        >
          <SettingsOutlinedIcon className="website-builder-page__inspector-tab-icon" fontSize="small" />
          <span>Extras</span>
        </button>
      </div>

      <div className="website-builder-page__panel-body website-builder-page__panel-body--inspector">
        {!selection || selection.kind === 'wrapper' ?
          selection?.kind === 'wrapper' ?
            <WrapperHint />
          : <InspectorEmpty />
        : tab === 'content' ?
          <ContentPanel
            editor={editor}
            selection={selection}
            selected={selected ?? undefined}
            builderPages={builderPages}
          />
        : tab === 'design' ?
          <DesignPanel selection={selection} selected={selected ?? undefined} />
        : <AdvancedPanelForm selected={selected ?? undefined} />}

        {/* Grapes append targets — always mounted so the editor can bind; visibility follows tab + selection */}
        <div hidden={!showStylesDock} className="website-builder-page__gjs-dock">
          <p className="website-builder-page__field-hint website-builder-page__gjs-dock-title">Extra colour &amp; spacing (optional)</p>
          <div id="wb-styles" className="website-builder-page__gjs-styles-host" />
        </div>
        <div hidden={!showAdvancedDock} className="website-builder-page__gjs-dock">
          <p className="website-builder-page__field-hint">Built-in motion options</p>
          <div id="wb-traits" className="website-builder-page__traits-host website-builder-page__traits-skin" />
        </div>
        {tab === 'advanced' && selection && selection.kind !== 'wrapper' ?
          <button type="button" className="website-builder-page__save-section-btn website-builder-page__save-section-btn--after-dock">
            Save Section
          </button>
        : null}
      </div>
    </>
  );
}

function ContentPanel({
  editor,
  selection,
  selected,
  builderPages,
}: {
  editor: Editor | null;
  selection: SelectionInfo;
  selected: ReturnType<Editor['getSelected']>;
  builderPages: BuilderPageOption[];
}) {
  if (!editor || !selected) return <InspectorEmpty />;

  if (selection.kind === 'hero') {
    return <HeroContent key={selection.cid} root={selected} />;
  }
  if (selection.kind === 'heading') {
    return <HeadingContent comp={selected} />;
  }
  if (selection.kind === 'text') {
    return <TextContent comp={selected} />;
  }
  if (selection.kind === 'whatsappLink') {
    return <WhatsAppLinkContent comp={selected} />;
  }
  if (selection.kind === 'mailtoLink') {
    return <MailtoLinkContent comp={selected} />;
  }
  if (selection.kind === 'telLink') {
    return <TelLinkContent comp={selected} />;
  }
  if (selection.kind === 'button') {
    return <ButtonContent comp={selected} builderPages={builderPages} />;
  }
  if (selection.kind === 'pushButton') {
    return <PushButtonContent comp={selected} builderPages={builderPages} />;
  }
  if (selection.kind === 'iframe') {
    return <IframeContent comp={selected} />;
  }
  if (selection.kind === 'div') {
    return <DivBlockContent />;
  }
  if (selection.kind === 'image') {
    return <ImageContent comp={selected} />;
  }
  if (selection.kind === 'nav') {
    return <NavContent />;
  }
  if (selection.kind === 'section') {
    return <SectionContent root={selected} />;
  }
  if (selection.kind === 'galleryCarousel') {
    return <GalleryCarouselContent editor={editor} comp={selected} />;
  }
  return <GenericContent comp={selected} kind={selection.kind} />;
}

function refreshDsGalleriesInCanvas(editor: Editor | null) {
  try {
    const w = editor?.Canvas?.getWindow?.() as (Window & { __wbRefreshDsGalleries?: () => void }) | undefined;
    w?.__wbRefreshDsGalleries?.();
  } catch {
    /* ignore */
  }
}

function GalleryCarouselContent({
  editor,
  comp,
}: {
  editor: Editor | null;
  comp: NonNullable<ReturnType<Editor['getSelected']>>;
}) {
  const root = useMemo(() => resolveGalleryCarouselRoot(comp) ?? comp, [comp]);
  const [slides, setSlides] = useState<Array<{ src: string; alt: string; caption: string }>>([]);

  const findTrack = useCallback(() => findOne(root, '.wb-sys-carousel__track'), [root]);

  const readSlides = useCallback(() => {
    const track = findTrack();
    const out: Array<{ src: string; alt: string; caption: string }> = [];
    if (!track) return out;
    const ch = track.components();
    const len = typeof ch.length === 'number' ? ch.length : 0;
    for (let i = 0; i < len; i += 1) {
      const slide = typeof ch.at === 'function' ? ch.at(i) : null;
      if (!slide) continue;
      const img = findOne(slide, 'img');
      const cap = findOne(slide, 'figcaption');
      const attrs = img?.getAttributes?.() ?? {};
      out.push({
        src: String(attrs.src ?? ''),
        alt: String(attrs.alt ?? ''),
        caption: cap ? getDirectText(cap) : '',
      });
    }
    return out;
  }, [findTrack]);

  useEffect(() => {
    setSlides(readSlides());
  }, [readSlides, root]);

  const writeSlideSrc = (idx: number, value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, src: value } : s)));
    const track = findTrack();
    if (!track) return;
    const coll = track.components();
    const slide = typeof coll.at === 'function' ? coll.at(idx) : null;
    const img = slide ? findOne(slide, 'img') : undefined;
    if (img) img.addAttributes({ src: value });
  };

  const writeSlideAlt = (idx: number, value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, alt: value } : s)));
    const track = findTrack();
    if (!track) return;
    const coll = track.components();
    const slide = typeof coll.at === 'function' ? coll.at(idx) : null;
    const img = slide ? findOne(slide, 'img') : undefined;
    if (img) img.addAttributes({ alt: value });
  };

  const writeSlideCaption = (idx: number, value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, caption: value } : s)));
    const track = findTrack();
    if (!track) return;
    const coll = track.components();
    const slide = typeof coll.at === 'function' ? coll.at(idx) : null;
    const cap = slide ? findOne(slide, 'figcaption') : undefined;
    if (cap) setDirectText(cap, value);
  };

  const addSlide = () => {
    const track = findTrack();
    if (!track) return;
    const coll = track.components() as unknown as {
      add?: (value: unknown, opts?: { at?: number }) => unknown;
      length?: number;
    };
    const nextN = (typeof coll.length === 'number' ? coll.length : slides.length) + 1;
    const label = `Frame ${nextN}`;
    const svg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'><rect fill='#f8fafc' width='640' height='420' rx='18'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#94a3b8' font-family='system-ui' font-size='15' font-weight='600'>${label}</text></svg>`
    );
    coll.add?.({
      type: 'default',
      tagName: 'figure',
      classes: ['wb-sys-carousel__slide'],
      components: [
        {
          type: 'image',
          tagName: 'img',
          attributes: { src: `data:image/svg+xml,${svg}`, alt: label },
          style: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          },
        },
        {
          type: 'text',
          tagName: 'figcaption',
          content: label,
          style: {
            marginTop: '0.5rem',
            color: '#64748b',
            fontSize: '0.8rem',
          },
        },
      ],
    });
    window.requestAnimationFrame(() => {
      refreshDsGalleriesInCanvas(editor);
      setSlides(readSlides());
    });
  };

  const removeSlide = (idx: number) => {
    const track = findTrack();
    if (!track || slides.length <= 1) return;
    const coll = track.components();
    const slide = typeof coll.at === 'function' ? coll.at(idx) : null;
    slide?.remove?.();
    window.requestAnimationFrame(() => {
      refreshDsGalleriesInCanvas(editor);
      setSlides(readSlides());
    });
  };

  return (
    <>
      <div className="website-builder-page__panel-group-title">Gallery carousel</div>
      <p className="website-builder-page__field-hint">
        Manage slide count and images here. Next/prev stays active in canvas preview.
      </p>
      <div className="website-builder-page__form-block">
        <button type="button" className="website-builder-page__save-section-btn" onClick={addSlide}>
          Add slide
        </button>
      </div>
      {slides.map((slide, idx) => (
        <div key={`gallery-slide-${idx}`} className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Slide {idx + 1} image URL</label>
          <input
            className="website-builder-page__field-control"
            value={slide.src}
            placeholder="https://…"
            onChange={(e) => writeSlideSrc(idx, e.target.value)}
          />
          <label className="website-builder-page__field-label" style={{ marginTop: '0.5rem' }}>
            Alt text
          </label>
          <input
            className="website-builder-page__field-control"
            value={slide.alt}
            onChange={(e) => writeSlideAlt(idx, e.target.value)}
          />
          <label className="website-builder-page__field-label" style={{ marginTop: '0.5rem' }}>
            Caption
          </label>
          <input
            className="website-builder-page__field-control"
            value={slide.caption}
            onChange={(e) => writeSlideCaption(idx, e.target.value)}
          />
          <button
            type="button"
            className="website-builder-page__remove-row-btn"
            disabled={slides.length <= 1}
            onClick={() => removeSlide(idx)}
            style={{ marginTop: '0.5rem' }}
          >
            Remove slide
          </button>
        </div>
      ))}
    </>
  );
}

function HeroContent({ root }: { root: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [sectionType, setSectionType] = useState('Hero');
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [btnText, setBtnText] = useState('');
  const [btnHref, setBtnHref] = useState('#');
  const [bgType, setBgType] = useState<HeroBg>('image');
  const [overlayOn, setOverlayOn] = useState(true);
  const [overlayPct, setOverlayPct] = useState(60);

  const reload = useCallback(() => {
    const { h1, sub, link } = getHeroContent(root);
    setHeading(h1 ? getDirectText(h1) : '');
    setSubheading(sub ? getDirectText(sub) : '');
    setBtnText(link ? getDirectText(link) : '');
    setBtnHref(String(link?.getAttributes?.().href ?? '#'));
    const attrs = root.getAttributes?.() ?? {};
    const st = (attrs['data-wb-section-type'] ?? 'Hero').trim();
    if (SECTION_TYPES.includes(st as (typeof SECTION_TYPES)[number])) setSectionType(st);
    else setSectionType('Custom');
    const ot = (attrs['data-wb-bg-type'] ?? 'image').trim();
    if (ot === 'video' || ot === 'slider' || ot === 'color') setBgType(ot);
    else setBgType('image');
    setOverlayOn(attrs['data-wb-overlay'] !== 'off');
    const op = Number(attrs['data-wb-overlay-opacity'] ?? 60);
    setOverlayPct(Number.isFinite(op) ? Math.min(100, Math.max(0, op)) : 60);
  }, [root]);

  useEffect(() => {
    reload();
  }, [reload]);

  const applyHeading = (v: string) => {
    const t = sliceMax(v, 80);
    setHeading(t);
    const h1 = findOne(root, 'h1');
    if (h1) setDirectText(h1, t);
  };

  const applySub = (v: string) => {
    const t = sliceMax(v, 160);
    setSubheading(t);
    const { sub } = getHeroContent(root);
    if (sub) setDirectText(sub, t);
  };

  const applyBtn = (v: string) => {
    const t = sliceMax(v, 30);
    setBtnText(t);
    const link = findOne(root, 'a.wb-link-btn') ?? findOne(root, 'a');
    if (link) setDirectText(link, t);
  };

  const applyHref = (v: string) => {
    setBtnHref(v);
    const link = findOne(root, 'a.wb-link-btn') ?? findOne(root, 'a');
    if (link) link.addAttributes({ href: v });
  };

  return (
    <>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-sec-type">
          Section Type
        </label>
        <select
          id="wb-ins-sec-type"
          className="website-builder-page__field-control"
          value={sectionType}
          onChange={(e) => {
            const v = e.target.value;
            setSectionType(v);
            root.addAttributes({ 'data-wb-section-type': v });
          }}
        >
          {SECTION_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-hero-h">
            Heading
          </label>
          <span className="website-builder-page__char-count">
            {heading.length}/80
          </span>
        </div>
        <input
          id="wb-ins-hero-h"
          className="website-builder-page__field-control"
          value={heading}
          maxLength={80}
          onChange={(e) => applyHeading(e.target.value)}
        />
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-hero-sub">
            Subheading
          </label>
          <span className="website-builder-page__char-count">{subheading.length}/160</span>
        </div>
        <textarea
          id="wb-ins-hero-sub"
          className="website-builder-page__field-control website-builder-page__field-control--textarea"
          value={subheading}
          maxLength={160}
          rows={3}
          onChange={(e) => applySub(e.target.value)}
        />
      </div>

      <div className="website-builder-page__panel-group-title">Button</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-hero-bt">
            Text
          </label>
          <span className="website-builder-page__char-count">{btnText.length}/30</span>
        </div>
        <input
          id="wb-ins-hero-bt"
          className="website-builder-page__field-control"
          value={btnText}
          maxLength={30}
          onChange={(e) => applyBtn(e.target.value)}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-hero-href">
          Link
        </label>
        <div className="website-builder-page__input-with-actions">
          <input
            id="wb-ins-hero-href"
            className="website-builder-page__field-control"
            value={btnHref}
            onChange={(e) => applyHref(e.target.value)}
            placeholder="#contact"
          />
          <button type="button" className="website-builder-page__input-action" aria-label="Open link" title="Open link">
            <OpenInNewOutlinedIcon fontSize="small" />
          </button>
          <button type="button" className="website-builder-page__input-action" aria-label="More link options" title="More">
            <AddOutlinedIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="website-builder-page__panel-group-title">Background</div>
      <div className="website-builder-page__segmented" role="group" aria-label="Background type">
        {(
          [
            ['image', 'Image'],
            ['video', 'Video'],
            ['slider', 'Slider'],
            ['color', 'Color'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`website-builder-page__segmented-btn${bgType === id ? ' is-active' : ''}`}
            onClick={() => setBgType(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="website-builder-page__bg-thumb-wrap">
        <div className="website-builder-page__bg-thumb" />
        <button type="button" className="website-builder-page__bg-thumb-delete" aria-label="Remove background">
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </button>
      </div>

      <div className="website-builder-page__toggle-block">
        <div>
          <div className="website-builder-page__field-label mb-0">Overlay</div>
          <p className="website-builder-page__field-hint">Add a dark overlay over the background.</p>
        </div>
        <button
          type="button"
          className={`website-builder-page__toggle${overlayOn ? ' is-on' : ''}`}
          aria-pressed={overlayOn}
          aria-label="Toggle overlay"
          onClick={() => {
            setOverlayOn((o) => {
              const next = !o;
              root.addAttributes({ 'data-wb-overlay': next ? 'on' : 'off' });
              return next;
            });
          }}
        >
          <span />
        </button>
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-overlay-op">
          Overlay Opacity
        </label>
        <div className="website-builder-page__range-row">
          <input
            id="wb-ins-overlay-op"
            type="range"
            min={0}
            max={100}
            value={overlayPct}
            className="website-builder-page__range"
            onChange={(e) => {
              const n = Number(e.target.value);
              setOverlayPct(n);
              root.addAttributes({ 'data-wb-overlay-opacity': String(n) });
            }}
          />
          <span className="website-builder-page__range-value">{overlayPct}%</span>
        </div>
      </div>

      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function HeadingContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(getDirectText(comp));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-head">
            Text
          </label>
          <span className="website-builder-page__char-count">{text.length}/120</span>
        </div>
        <input
          id="wb-ins-head"
          className="website-builder-page__field-control"
          value={text}
          maxLength={120}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function TextContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(getDirectText(comp));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-par">
            Paragraph
          </label>
          <span className="website-builder-page__char-count">{text.length}/2000</span>
        </div>
        <textarea
          id="wb-ins-par"
          className="website-builder-page__field-control website-builder-page__field-control--textarea"
          value={text}
          maxLength={2000}
          rows={5}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function PushButtonContent({
  comp,
  builderPages,
}: {
  comp: NonNullable<ReturnType<Editor['getSelected']>>;
  builderPages: BuilderPageOption[];
}) {
  const [label, setLabel] = useState('');
  const [btnType, setBtnType] = useState('button');
  const [action, setAction] = useState<ButtonActionChoice>('none');
  const [sectionTarget, setSectionTarget] = useState('');
  const [pageId, setPageId] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    setLabel(getDirectText(comp));
    const attrs = comp.getAttributes?.() ?? {};
    setBtnType(String(attrs.type || 'button'));
    const nextAction = inferPushButtonAction(comp, builderPages);
    setAction(nextAction);
    const onclick = String(attrs.onclick ?? '');
    const nav = parseOnclickHref(onclick);
    if (nextAction === 'custom' && nav) setCustomUrl(nav);
    else setCustomUrl('');
    if (nextAction === 'section') {
      const hrefM = onclick.match(/href\s*=\s*['"]#([^'"]+)['"]/i);
      const hashM = onclick.match(/location\.hash\s*=\s*['"]#?([^'"]+)['"]/i);
      setSectionTarget(sanitizeSectionTarget(hrefM?.[1] ?? hashM?.[1] ?? ''));
    } else {
      setSectionTarget('');
    }
    if (nextAction === 'page' && nav) {
      const idx = findPageIndexByHref(nav, builderPages);
      if (idx != null && idx >= 0 && builderPages[idx]) setPageId(builderPages[idx]!.id);
      else if (builderPages[0]) setPageId(builderPages[0]!.id);
    } else if (builderPages[0]) {
      setPageId(builderPages[0]!.id);
    } else {
      setPageId('');
    }
  }, [comp, builderPages]);

  const applyAction = (nextAction: ButtonActionChoice) => {
    setAction(nextAction);
    if (nextAction === 'none') {
      patchAttributes(comp, { 'data-wb-open': undefined, onclick: undefined, 'data-wb-nav-href': undefined });
      setCustomUrl('');
      return;
    }
    if (nextAction === 'section') {
      const sectionId = sanitizeSectionTarget(sectionTarget);
      patchAttributes(comp, {
        'data-wb-open': undefined,
        onclick: sectionId ? toOnclickNavigate(`#${sectionId}`) : undefined,
        'data-wb-nav-href': undefined,
      });
      return;
    }
    if (nextAction === 'page') {
      const idx = Math.max(0, builderPages.findIndex((p) => p.id === pageId));
      const p = builderPages[idx] ?? builderPages[0];
      const href = p ? hrefForBuilderPage(p, idx) : '/';
      patchAttributes(comp, {
        'data-wb-open': undefined,
        onclick: toOnclickNavigate(href),
        'data-wb-nav-href': href,
        type: 'button',
      });
      setBtnType('button');
      return;
    }
    if (nextAction === 'custom') {
      const u = customUrl.trim() || '/';
      patchAttributes(comp, {
        'data-wb-open': undefined,
        onclick: toOnclickNavigate(u),
        'data-wb-nav-href': u,
        type: 'button',
      });
      setBtnType('button');
      return;
    }
    patchAttributes(comp, { 'data-wb-open': nextAction, onclick: undefined, 'data-wb-nav-href': undefined, type: 'button' });
    setBtnType('button');
  };

  return (
    <>
      <div className="website-builder-page__panel-group-title">Button</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-pbt">
            Label
          </label>
          <span className="website-builder-page__char-count">{label.length}/80</span>
        </div>
        <input
          id="wb-ins-pbt"
          className="website-builder-page__field-control"
          value={label}
          maxLength={80}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-pb-action">
          Button action
        </label>
        <select
          id="wb-ins-pb-action"
          className="website-builder-page__field-control"
          value={action}
          onChange={(e) => applyAction(e.target.value as ButtonActionChoice)}
        >
          <option value="none">None</option>
          <option value="section">Go to section (this page)</option>
          {builderPages.length > 0 ?
            <option value="page">Go to another page</option>
          : null}
          <option value="custom">Custom URL</option>
          <option value="join">Open join modal</option>
          <option value="visit">Open plan visit modal</option>
          <option value="trial">Open trial modal</option>
          <option value="enquiry">Open enquiry modal</option>
        </select>
      </div>
      {action === 'section' ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-ins-pb-section">
            Section link name
          </label>
          <input
            id="wb-ins-pb-section"
            className="website-builder-page__field-control"
            value={sectionTarget}
            placeholder="contact"
            onChange={(e) => {
              const v = sanitizeSectionTarget(e.target.value);
              setSectionTarget(v);
              patchAttributes(comp, {
                'data-wb-open': undefined,
                onclick: v ? toOnclickNavigate(`#${v}`) : undefined,
                'data-wb-nav-href': undefined,
              });
            }}
          />
          <p className="website-builder-page__field-hint">Uses in-page navigation (same as anchor link).</p>
        </div>
      : null}
      {action === 'page' && builderPages.length > 0 ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-ins-pb-page">
            Page
          </label>
          <select
            id="wb-ins-pb-page"
            className="website-builder-page__field-control"
            value={pageId}
            onChange={(e) => {
              const id = e.target.value;
              setPageId(id);
              const idx = builderPages.findIndex((p) => p.id === id);
              const i = idx >= 0 ? idx : 0;
              const p = builderPages[i];
              const href = p ? hrefForBuilderPage(p, i) : '/';
              patchAttributes(comp, {
                'data-wb-open': undefined,
                onclick: toOnclickNavigate(href),
                'data-wb-nav-href': href,
              });
            }}
          >
            {builderPages.map((p, i) => (
              <option key={p.id} value={p.id}>
                {p.name} ({hrefForBuilderPage(p, i)})
              </option>
            ))}
          </select>
          <p className="website-builder-page__field-hint">
            Preview opens one static HTML snapshot. “Go to another page” runs in the real browser and jumps to that path on your app host—it does not switch Grapes pages inside preview.
          </p>
        </div>
      : null}
      {action === 'custom' ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-ins-pb-custom">
            URL
          </label>
          <input
            id="wb-ins-pb-custom"
            className="website-builder-page__field-control"
            value={customUrl}
            placeholder="https://… or /path"
            onChange={(e) => {
              const v = e.target.value;
              setCustomUrl(v);
              patchAttributes(comp, {
                'data-wb-open': undefined,
                onclick: v.trim() ? toOnclickNavigate(v.trim()) : undefined,
                'data-wb-nav-href': v.trim() || undefined,
              });
            }}
          />
        </div>
      : null}
      {action === 'join' || action === 'visit' || action === 'trial' || action === 'enquiry' ?
        <p className="website-builder-page__field-hint">
          <strong>Button action</strong> above is what this control does. Lead modals run in the editor canvas and in Preview when{' '}
          <code>NEXT_PUBLIC_API_BASE_URL</code> is set; join, visit, and trial also need a valid gym slug (edit site or create-flow preview slug). If something is missing, the browser shows a short alert when you click.
        </p>
      : null}
      {action === 'none' ?
        <p className="website-builder-page__field-hint">No click action. Choose section, page, URL, or a modal.</p>
      : null}
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-pbtype">
          Type
        </label>
        <select
          id="wb-ins-pbtype"
          className="website-builder-page__field-control"
          value={btnType}
          onChange={(e) => {
            const v = e.target.value;
            setBtnType(v);
            comp.addAttributes({ type: v });
          }}
        >
          <option value="button">button</option>
          <option value="submit">submit</option>
          <option value="reset">reset</option>
        </select>
      </div>
      <p className="website-builder-page__field-hint">Use <strong>Style</strong> for width, height, and fade.</p>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function IframeContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [src, setSrc] = useState('');
  const [title, setTitle] = useState('');
  useEffect(() => {
    const sync = () => {
      const a = comp.getAttributes?.() ?? {};
      setSrc(String(a.src ?? ''));
      setTitle(String(a.title ?? ''));
    };
    sync();
    comp.on('change:attributes', sync);
    return () => {
      comp.off('change:attributes', sync);
    };
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Iframe</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-if-src">
          Source URL
        </label>
        <input
          id="wb-ins-if-src"
          className="website-builder-page__field-control"
          value={src}
          placeholder="https://…"
          onChange={(e) => {
            const v = e.target.value;
            setSrc(v);
            comp.addAttributes({ src: v });
          }}
          onBlur={() => {
            const cur = src.trim();
            if (!cur || !looksLikeGoogleMapsUrl(cur)) return;
            const next = normalizeGoogleMapsIframeSrc(cur);
            if (next !== cur) {
              setSrc(next);
              comp.addAttributes({ src: next });
            }
          }}
        />
        <p className="website-builder-page__field-hint" style={{ marginTop: '0.35rem' }}>
          Google Maps: paste any maps link, then tab out of this field — we convert place and search links to an embed
          URL. For short links (maps.app.goo.gl), open Google Maps → Share → <strong>Embed a map</strong> and paste the{' '}
          <code>iframe src</code> here.
        </p>
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-if-title">
          Title (accessibility)
        </label>
        <input
          id="wb-ins-if-title"
          className="website-builder-page__field-control"
          value={title}
          onChange={(e) => {
            const v = e.target.value;
            setTitle(v);
            comp.addAttributes({ title: v });
          }}
        />
      </div>
      <p className="website-builder-page__field-hint">Use <strong>Style</strong> for width, height, minimum height, and fade.</p>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function DivBlockContent() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-text">
        This is a <strong>div</strong> container. Use the <strong>Design</strong> tab for width, height, max-width, and opacity. Add inner elements from the toolbar <strong>Add</strong> menu.
      </p>
    </div>
  );
}

function WhatsAppLinkContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [label, setLabel] = useState('');
  const [phone, setPhone] = useState('');
  useEffect(() => {
    setLabel(getDirectText(comp));
    const attrs = comp.getAttributes?.() ?? {};
    const raw = String(attrs['data-wb-wa-phone'] ?? '').replace(/\D/g, '');
    setPhone(raw);
  }, [comp]);

  return (
    <>
      <div className="website-builder-page__panel-group-title">WhatsApp</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-wa-label">
            Button text
          </label>
          <span className="website-builder-page__char-count">{label.length}/80</span>
        </div>
        <input
          id="wb-ins-wa-label"
          className="website-builder-page__field-control"
          maxLength={80}
          value={label}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-wa-phone">
          Business phone (digits)
        </label>
        <input
          id="wb-ins-wa-phone"
          className="website-builder-page__field-control"
          inputMode="tel"
          autoComplete="tel"
          placeholder="e.g. 919876543210"
          value={phone}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
            setPhone(digits);
            const href = waMeHrefFromDigits(digits);
            patchAttributes(comp, { 'data-wb-wa-phone': digits, href });
          }}
        />
        <p className="website-builder-page__field-hint">Country code + number, no spaces. Tap opens WhatsApp chat (wa.me).</p>
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function MailtoLinkContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [label, setLabel] = useState('');
  const [email, setEmail] = useState('');
  useEffect(() => {
    setLabel(getDirectText(comp));
    const attrs = comp.getAttributes?.() ?? {};
    setEmail(parseMailtoEmail(String(attrs.href ?? '')));
  }, [comp]);

  return (
    <>
      <div className="website-builder-page__panel-group-title">Email link</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-mailto-label">
            Link text
          </label>
          <span className="website-builder-page__char-count">{label.length}/80</span>
        </div>
        <input
          id="wb-ins-mailto-label"
          className="website-builder-page__field-control"
          maxLength={80}
          value={label}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-mailto">
          Email address
        </label>
        <input
          id="wb-ins-mailto"
          type="email"
          className="website-builder-page__field-control"
          placeholder="hello@yourgym.com"
          value={email}
          onChange={(e) => {
            const v = e.target.value.trim();
            setEmail(v);
            patchAttributes(comp, { href: v ? `mailto:${v}` : '#' });
          }}
        />
        <p className="website-builder-page__field-hint">Visitors&apos; mail app opens with this address.</p>
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function TelLinkContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [label, setLabel] = useState('');
  const [num, setNum] = useState('');
  useEffect(() => {
    setLabel(getDirectText(comp));
    const attrs = comp.getAttributes?.() ?? {};
    setNum(parseTelNumber(String(attrs.href ?? '')));
  }, [comp]);

  return (
    <>
      <div className="website-builder-page__panel-group-title">Call link</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-tel-label">
            Link text
          </label>
          <span className="website-builder-page__char-count">{label.length}/80</span>
        </div>
        <input
          id="wb-ins-tel-label"
          className="website-builder-page__field-control"
          maxLength={80}
          value={label}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-tel">
          Phone number
        </label>
        <input
          id="wb-ins-tel"
          className="website-builder-page__field-control"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 90000 00000"
          value={num}
          onChange={(e) => {
            const v = e.target.value.trim();
            setNum(v);
            const digits = v.replace(/[^\d+]/g, '');
            const href = digits ? `tel:${digits}` : '#';
            patchAttributes(comp, { href });
          }}
        />
        <p className="website-builder-page__field-hint">On phones, tap-to-call uses this tel: link.</p>
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function ButtonContent({
  comp,
  builderPages,
}: {
  comp: NonNullable<ReturnType<Editor['getSelected']>>;
  builderPages: BuilderPageOption[];
}) {
  const [label, setLabel] = useState('');
  const [, setHref] = useState('#');
  const [action, setAction] = useState<ButtonActionChoice>('none');
  const [sectionTarget, setSectionTarget] = useState('');
  const [pageId, setPageId] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    setLabel(getDirectText(comp));
    const attrs = comp.getAttributes?.() ?? {};
    const nextHref = String(attrs.href ?? '#');
    setHref(nextHref);
    setSectionTarget(sanitizeSectionTarget(nextHref.startsWith('#') ? nextHref.slice(1) : ''));
    const nextAction = inferLinkButtonAction(comp, builderPages);
    setAction(nextAction);
    const idx = findPageIndexByHref(nextHref, builderPages);
    if (idx != null && idx >= 0 && builderPages[idx]) setPageId(builderPages[idx]!.id);
    else if (builderPages[0]) setPageId(builderPages[0]!.id);
    else setPageId('');
    setCustomUrl(nextAction === 'custom' ? nextHref : '');
  }, [comp, builderPages]);

  const applyAction = (nextAction: ButtonActionChoice) => {
    setAction(nextAction);
    if (nextAction === 'none') {
      patchAttributes(comp, { 'data-wb-open': undefined, href: '#', 'data-wb-nav-href': undefined });
      setHref('#');
      setSectionTarget('');
      setCustomUrl('');
      return;
    }
    if (nextAction === 'section') {
      const target = sanitizeSectionTarget(sectionTarget);
      const nextHref = target ? `#${target}` : '#';
      patchAttributes(comp, { 'data-wb-open': undefined, href: nextHref, target: undefined, 'data-wb-nav-href': undefined });
      setHref(nextHref);
      return;
    }
    if (nextAction === 'page') {
      const idx = Math.max(0, builderPages.findIndex((p) => p.id === pageId));
      const p = builderPages[idx] ?? builderPages[0];
      const nextHref = p ? hrefForBuilderPage(p, idx) : '/';
      patchAttributes(comp, { 'data-wb-open': undefined, href: nextHref, target: undefined, 'data-wb-nav-href': nextHref });
      setHref(nextHref);
      if (p) setPageId(p.id);
      return;
    }
    if (nextAction === 'custom') {
      const u = customUrl.trim() || '#';
      patchAttributes(comp, { 'data-wb-open': undefined, href: u, target: undefined, 'data-wb-nav-href': u });
      setHref(u);
      return;
    }
    patchAttributes(comp, { 'data-wb-open': nextAction, href: '#', target: undefined, 'data-wb-nav-href': undefined });
    setHref('#');
  };

  return (
    <>
      <div className="website-builder-page__panel-group-title">Link</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-bt">
            Label
          </label>
          <span className="website-builder-page__char-count">{label.length}/80</span>
        </div>
        <input
          id="wb-ins-bt"
          className="website-builder-page__field-control"
          value={label}
          maxLength={80}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-ba">
          Button action
        </label>
        <select
          id="wb-ins-ba"
          className="website-builder-page__field-control"
          value={action}
          onChange={(e) => applyAction(e.target.value as ButtonActionChoice)}
        >
          <option value="none">None</option>
          <option value="section">Go to section (this page)</option>
          {builderPages.length > 0 ?
            <option value="page">Go to another page</option>
          : null}
          <option value="custom">Custom URL</option>
          <option value="join">Open join modal</option>
          <option value="visit">Open plan visit modal</option>
          <option value="trial">Open trial modal</option>
          <option value="enquiry">Open enquiry modal</option>
        </select>
      </div>
      {action === 'section' ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-ins-bh">
            Section link name
          </label>
          <input
            id="wb-ins-bh"
            className="website-builder-page__field-control"
            value={sectionTarget}
            onChange={(e) => {
              const v = sanitizeSectionTarget(e.target.value);
              setSectionTarget(v);
              const nextHref = v ? `#${v}` : '#';
              setHref(nextHref);
              patchAttributes(comp, { href: nextHref, 'data-wb-open': undefined, target: undefined, 'data-wb-nav-href': undefined });
            }}
            placeholder="pricing"
          />
          <p className="website-builder-page__field-hint">Same-page anchor, e.g. <code>#pricing</code>.</p>
        </div>
      : null}
      {action === 'page' && builderPages.length > 0 ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-ins-b-page">
            Page
          </label>
          <select
            id="wb-ins-b-page"
            className="website-builder-page__field-control"
            value={pageId}
            onChange={(e) => {
              const id = e.target.value;
              setPageId(id);
              const idx = builderPages.findIndex((p) => p.id === id);
              const i = idx >= 0 ? idx : 0;
              const p = builderPages[i];
              const nextHref = p ? hrefForBuilderPage(p, i) : '/';
              setHref(nextHref);
              patchAttributes(comp, { href: nextHref, 'data-wb-open': undefined, target: undefined, 'data-wb-nav-href': nextHref });
            }}
          >
            {builderPages.map((p, i) => (
              <option key={p.id} value={p.id}>
                {p.name} ({hrefForBuilderPage(p, i)})
              </option>
            ))}
          </select>
          <p className="website-builder-page__field-hint">Uses a simple path per page (first page is <code>/</code>).</p>
          <p className="website-builder-page__field-hint">
            Preview is one exported HTML page. This action navigates the browser to that path on your app host; it does not open another Grapes page inside preview.
          </p>
        </div>
      : null}
      {action === 'custom' ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-ins-b-custom">
            URL
          </label>
          <input
            id="wb-ins-b-custom"
            className="website-builder-page__field-control"
            value={customUrl}
            placeholder="https://example.com or /path"
            onChange={(e) => {
              const v = e.target.value;
              setCustomUrl(v);
              setHref(v.trim() || '#');
              const u = v.trim() || '#';
              patchAttributes(comp, { href: u, 'data-wb-open': undefined, target: undefined, 'data-wb-nav-href': u });
            }}
          />
        </div>
      : null}
      {action === 'join' || action === 'visit' || action === 'trial' || action === 'enquiry' ?
        <p className="website-builder-page__field-hint">
          <strong>Button action</strong> above is what this link does. Lead modals run in the canvas and Preview when <code>NEXT_PUBLIC_API_BASE_URL</code> is set; join, visit, and trial need a valid gym slug. If configuration is missing, a short browser alert appears when you click.
        </p>
      : null}
      {action === 'none' ?
        <p className="website-builder-page__field-hint">Link is cleared to <code>#</code>. Pick an action or a custom URL.</p>
      : null}
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function ImageContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  useEffect(() => {
    const a = comp.getAttributes?.() ?? {};
    setSrc(String(a.src ?? ''));
    setAlt(String(a.alt ?? ''));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Image</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-img-src">
          Source URL
        </label>
        <input
          id="wb-ins-img-src"
          className="website-builder-page__field-control"
          value={src}
          onChange={(e) => {
            const v = e.target.value;
            setSrc(v);
            comp.addAttributes({ src: v });
          }}
          onBlur={() => {
            const normalized = normalizeImageSrcInput(src);
            if (normalized !== src) {
              setSrc(normalized);
              comp.addAttributes({ src: normalized });
            }
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-img-alt">
          Alt text
        </label>
        <input
          id="wb-ins-img-alt"
          className="website-builder-page__field-control"
          value={alt}
          onChange={(e) => {
            const v = e.target.value;
            setAlt(v);
            comp.addAttributes({ alt: v });
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function NavContent() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-text">
        Click each menu item on the preview to change its text and link. Use <strong>Style</strong> for colours and <strong>Extras</strong> only if you need extra options.
      </p>
    </div>
  );
}

function SectionContent({ root }: { root: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [sectionType, setSectionType] = useState('Custom');
  useEffect(() => {
    const attrs = root.getAttributes?.() ?? {};
    const st = (attrs['data-wb-section-type'] ?? 'Custom').trim();
    setSectionType(st);
  }, [root]);
  return (
    <>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-sec2">
          What this area is (your notes)
        </label>
        <select
          id="wb-ins-sec2"
          className="website-builder-page__field-control"
          value={sectionType}
          onChange={(e) => {
            const v = e.target.value;
            setSectionType(v);
            root.addAttributes({ 'data-wb-section-type': v });
          }}
        >
          {SECTION_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <p className="website-builder-page__field-hint">
        This is only a label for you (e.g. “Pricing”). To change colours and fonts, open <strong>Style</strong>. For gentle motion or menu links, open <strong>Extras</strong>.
      </p>
      <div className="website-builder-page__panel-group-title">Section spacing</div>
      <p className="website-builder-page__field-hint">Quick padding presets for this block.</p>
      <div className="website-builder-page__segmented website-builder-page__segmented--triple" style={{ marginBottom: '0.5rem' }}>
        <button
          type="button"
          className="website-builder-page__segmented-btn"
          onClick={() => applySectionSpacingPreset(root, 'tight')}
        >
          Tight
        </button>
        <button type="button" className="website-builder-page__segmented-btn" onClick={() => applySectionSpacingPreset(root, 'normal')}>
          Normal
        </button>
        <button
          type="button"
          className="website-builder-page__segmented-btn"
          onClick={() => applySectionSpacingPreset(root, 'airy')}
        >
          Airy
        </button>
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function GenericContent({ comp, kind }: { comp: NonNullable<ReturnType<Editor['getSelected']>>; kind: InspectorKind }) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(getDirectText(comp));
  }, [comp]);
  if (kind === 'image') return null;
  return (
    <>
      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-gen">
          Text
        </label>
        <textarea
          id="wb-ins-gen"
          className="website-builder-page__field-control website-builder-page__field-control--textarea"
          value={text}
          rows={4}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function opacityToPercent(style: Record<string, string>): number {
  const o = style.opacity;
  if (!o) return 100;
  const n = parseFloat(o);
  if (Number.isNaN(n)) return 100;
  if (n <= 1) return Math.min(100, Math.round(n * 100));
  return Math.min(100, Math.round(n));
}

function applyStylePatch(comp: Component, patch: Record<string, string | undefined>) {
  const prev = { ...(comp.getStyle?.() as Record<string, string> | undefined) } as Record<string, string>;
  for (const [k, v] of Object.entries(patch)) {
    if (v === '' || v === undefined) delete prev[k];
    else prev[k] = v;
  }
  comp.setStyle(prev);
}

/** Normalize to #rrggbb for `<input type="color">`. */
function colorStringToHexInput(s: string): string {
  const t = s.trim();
  if (t.startsWith('#')) {
    if (t.length >= 7) return t.slice(0, 7);
    if (t.length === 4) {
      const r = t[1];
      const g = t[2];
      const b = t[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  const m = t.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const h = (n: number) => n.toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  return '#2563eb';
}

function parseLinearGradientFromBackground(bg: string): { angle: number; c1: string; c2: string } | null {
  if (!bg.includes('gradient')) return null;
  const degM = bg.match(/([\d.]+)\s*deg/i);
  const angle = degM ? Math.min(360, Math.max(0, Number(degM[1]))) : 135;
  const colors: string[] = [];
  const re = /(#[0-9a-fA-F]{3,8})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*[^)]+\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bg)) !== null) {
    colors.push(colorStringToHexInput(m[0]));
  }
  if (colors.length >= 2) return { angle, c1: colors[0], c2: colors[1] };
  return null;
}

function extractCssBackgroundUrl(raw: string): string {
  const t = raw.trim();
  if (!t || t === 'none') return '';
  const m = t.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
  return (m?.[1] ?? '').trim();
}

function inferFillMode(st: Record<string, string>): 'solid' | 'gradient' | 'image' {
  const bg = st.background || '';
  const bgImg = (st['background-image'] || '').trim();
  const urlFromLayer = extractCssBackgroundUrl(bgImg);
  const urlFromShorthand = extractCssBackgroundUrl(bg);
  const hasUrl = Boolean(urlFromLayer || urlFromShorthand);
  const hasGrad = /gradient/i.test(bg) || /gradient/i.test(bgImg);
  if (hasUrl && !hasGrad) return 'image';
  if (hasGrad) return 'gradient';
  return 'solid';
}

function clearImageBackgroundPatch(): Record<string, string | undefined> {
  return {
    'background-image': undefined,
    'background-size': undefined,
    'background-position': undefined,
    'background-repeat': undefined,
  };
}

function FillAndTextFields({ comp, omitFontFamily }: { comp: Component; omitFontFamily?: boolean }) {
  const read = useCallback(() => {
    const st = (comp.getStyle?.() ?? {}) as Record<string, string>;
    const bg = st.background || '';
    const mode = inferFillMode(st);
    const bgImg = (st['background-image'] || '').trim();
    const urlFromLayer = extractCssBackgroundUrl(bgImg);
    const urlFromShorthand = extractCssBackgroundUrl(bg);
    const imageUrl = urlFromLayer || urlFromShorthand;
    const bgSize = (st['background-size'] || 'cover').trim() || 'cover';
    return {
      color: st.color || '',
      fontFamily: (st['font-family'] || '').trim(),
      background: bg,
      backgroundColor: st['background-color'] || '',
      mode,
      imageUrl,
      backgroundSize: bgSize === 'contain' || bgSize === 'auto' ? bgSize : 'cover',
    };
  }, [comp]);

  const [fontFamily, setFontFamily] = useState('');
  const [textColor, setTextColor] = useState('#0f172a');
  const [fillMode, setFillMode] = useState<'solid' | 'gradient' | 'image'>('solid');
  const [solidBg, setSolidBg] = useState('#ffffff');
  const [g1, setG1] = useState('#2563eb');
  const [g2, setG2] = useState('#7c3aed');
  const [angle, setAngle] = useState(135);
  const [imageUrl, setImageUrl] = useState('');
  const [bgSizeMode, setBgSizeMode] = useState<'cover' | 'contain' | 'auto'>('cover');

  useEffect(() => {
    const st = read();
    setFontFamily(st.fontFamily);
    setTextColor(st.color || '#0f172a');
    setFillMode(st.mode);
    setImageUrl(st.imageUrl);
    setBgSizeMode(st.backgroundSize === 'contain' || st.backgroundSize === 'auto' ? st.backgroundSize : 'cover');
    if (st.mode === 'solid') {
      const bc = st.backgroundColor;
      setSolidBg(bc ? colorStringToHexInput(bc) : '#ffffff');
    } else if (st.mode === 'gradient') {
      const parsed = parseLinearGradientFromBackground(st.background);
      if (parsed) {
        setAngle(parsed.angle);
        setG1(parsed.c1);
        setG2(parsed.c2);
      }
    }
  }, [read, comp]);

  const applyGradient = (a: number, c1: string, c2: string) => {
    applyStylePatch(comp, {
      background: `linear-gradient(${a}deg, ${c1}, ${c2})`,
      'background-color': undefined,
      ...clearImageBackgroundPatch(),
    });
  };

  const applyImage = (url: string, size: 'cover' | 'contain' | 'auto') => {
    const u = normalizeImageSrcInput(url);
    if (!u) {
      applyStylePatch(comp, {
        ...clearImageBackgroundPatch(),
        background: undefined,
        'background-color': undefined,
      });
      return;
    }
    applyStylePatch(comp, {
      background: undefined,
      'background-color': undefined,
      'background-image': `url("${u.replace(/"/g, '\\"')}")`,
      'background-size': size,
      'background-position': 'center',
      'background-repeat': 'no-repeat',
    });
  };

  const fontValueForSelect = useMemo(() => {
    const f = fontFamily.trim();
    if (!f) return '';
    const hit = INSPECTOR_FONT_OPTIONS.find((o) => o.value === f);
    if (hit) return hit.value;
    return '__custom__';
  }, [fontFamily]);

  return (
    <>
      <div className="website-builder-page__panel-group-title">Text &amp; background</div>
      {!omitFontFamily ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-fill-font">
            Font
          </label>
          <select
            id="wb-fill-font"
            className="website-builder-page__field-control"
            value={fontValueForSelect}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__custom__') return;
              setFontFamily(v);
              applyStylePatch(comp, { 'font-family': v || undefined });
            }}
          >
            {INSPECTOR_FONT_OPTIONS.map((o) => (
              <option key={o.label + o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value="__custom__">Custom (edit below)</option>
          </select>
          {fontValueForSelect === '__custom__' ?
            <input
              type="text"
              className="website-builder-page__field-control"
              style={{ marginTop: 8 }}
              value={fontFamily}
              placeholder="e.g. Georgia, serif"
              onChange={(e) => {
                const v = e.target.value;
                setFontFamily(v);
                applyStylePatch(comp, { 'font-family': v || undefined });
              }}
            />
          : null}
        </div>
      : null}
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-fill-tc">
          Text color
        </label>
        <div className="website-builder-page__color-row">
          <input
            id="wb-fill-tc"
            type="color"
            className="website-builder-page__color-swatch"
            value={textColor.startsWith('#') && textColor.length >= 7 ? textColor.slice(0, 7) : '#0f172a'}
            onChange={(e) => {
              const v = e.target.value;
              setTextColor(v);
              applyStylePatch(comp, { color: v });
            }}
          />
          <input
            type="text"
            className="website-builder-page__field-control website-builder-page__field-control--color-hex"
            value={textColor}
            onChange={(e) => {
              const v = e.target.value;
              setTextColor(v);
              applyStylePatch(comp, { color: v || undefined });
            }}
          />
        </div>
      </div>
      <div className="website-builder-page__form-block">
        <span className="website-builder-page__field-label">Background</span>
        <div className="website-builder-page__segmented website-builder-page__segmented--fill website-builder-page__segmented--triple">
          <button
            type="button"
            className={`website-builder-page__segmented-btn${fillMode === 'solid' ? ' is-active' : ''}`}
            onClick={() => {
              setFillMode('solid');
              applyStylePatch(comp, {
                background: undefined,
                'background-color': solidBg,
                ...clearImageBackgroundPatch(),
              });
            }}
          >
            Solid
          </button>
          <button
            type="button"
            className={`website-builder-page__segmented-btn${fillMode === 'gradient' ? ' is-active' : ''}`}
            onClick={() => {
              setFillMode('gradient');
              applyGradient(angle, g1, g2);
            }}
          >
            Gradient
          </button>
          <button
            type="button"
            className={`website-builder-page__segmented-btn${fillMode === 'image' ? ' is-active' : ''}`}
            onClick={() => {
              setFillMode('image');
              applyImage(imageUrl, bgSizeMode);
            }}
          >
            Image
          </button>
        </div>
      </div>
      {fillMode === 'solid' ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-fill-bg">
            Background color
          </label>
          <div className="website-builder-page__color-row">
            <input
              id="wb-fill-bg"
              type="color"
              className="website-builder-page__color-swatch"
              value={solidBg.startsWith('#') && solidBg.length >= 7 ? solidBg.slice(0, 7) : '#ffffff'}
              onChange={(e) => {
                const v = e.target.value;
                setSolidBg(v);
                applyStylePatch(comp, { 'background-color': v, background: undefined, ...clearImageBackgroundPatch() });
              }}
            />
            <input
              type="text"
              className="website-builder-page__field-control website-builder-page__field-control--color-hex"
              value={solidBg}
              onChange={(e) => {
                const v = e.target.value;
                setSolidBg(v);
                applyStylePatch(comp, { 'background-color': v || undefined });
              }}
            />
          </div>
        </div>
      : null}
      {fillMode === 'gradient' ?
        <>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label">Gradient angle</label>
            <div className="website-builder-page__range-row">
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                className="website-builder-page__range"
                onChange={(e) => {
                  const a = Number(e.target.value);
                  setAngle(a);
                  applyGradient(a, g1, g2);
                }}
              />
              <span className="website-builder-page__range-value">{angle}°</span>
            </div>
          </div>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label">Color start</label>
            <div className="website-builder-page__color-row">
              <input
                type="color"
                className="website-builder-page__color-swatch"
                value={g1}
                onChange={(e) => {
                  const v = e.target.value;
                  setG1(v);
                  applyGradient(angle, v, g2);
                }}
              />
            </div>
          </div>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label">Color end</label>
            <div className="website-builder-page__color-row">
              <input
                type="color"
                className="website-builder-page__color-swatch"
                value={g2}
                onChange={(e) => {
                  const v = e.target.value;
                  setG2(v);
                  applyGradient(angle, g1, v);
                }}
              />
            </div>
          </div>
        </>
      : null}
      {fillMode === 'image' ?
        <>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label" htmlFor="wb-fill-bgimg">
              Background image URL
            </label>
            <input
              id="wb-fill-bgimg"
              type="text"
              className="website-builder-page__field-control"
              value={imageUrl}
              placeholder="https://… or /path/to/image.jpg"
              onChange={(e) => {
                const v = e.target.value;
                setImageUrl(v);
                applyImage(v, bgSizeMode);
              }}
            />
            <p className="website-builder-page__field-hint">
              Paste a link to a picture from the web, or a path your host gave you. If you are not sure, use a solid colour or gradient instead.
            </p>
          </div>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label" htmlFor="wb-fill-bgsz">
              Image fit
            </label>
            <select
              id="wb-fill-bgsz"
              className="website-builder-page__field-control"
              value={bgSizeMode}
              onChange={(e) => {
                const v = e.target.value as 'cover' | 'contain' | 'auto';
                setBgSizeMode(v);
                applyImage(imageUrl, v);
              }}
            >
              <option value="cover">Cover (fill area)</option>
              <option value="contain">Contain (fit inside)</option>
              <option value="auto">Original size</option>
            </select>
          </div>
        </>
      : null}
    </>
  );
}

function ElementLayoutFields({ comp }: { comp: Component }) {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maxWidth, setMaxWidth] = useState('');
  const [minHeight, setMinHeight] = useState('');
  const [opacityPct, setOpacityPct] = useState(100);

  const reload = useCallback(() => {
    const raw = (comp.getStyle?.() ?? {}) as Record<string, string>;
    const g = (k: string) => (raw[k] != null && raw[k] !== '' ? String(raw[k]) : '');
    setWidth(g('width'));
    setHeight(g('height'));
    setMaxWidth(g('max-width'));
    setMinHeight(g('min-height'));
    setOpacityPct(opacityToPercent(raw));

    // Some animated blocks start from CSS `opacity: 0` (e.g. `.fade-up`) before runtime "show" toggles.
    // In editor mode this can leave selected cards invisible while slider reads 100%.
    // If there is no explicit opacity style and computed opacity is 0, normalize to visible.
    const rawOpacity = g('opacity');
    if (!rawOpacity) {
      const el = comp.getEl?.() as HTMLElement | undefined;
      const view = el?.ownerDocument?.defaultView;
      const computed = el && view ? Number.parseFloat(view.getComputedStyle(el).opacity || '1') : 1;
      if (Number.isFinite(computed) && computed <= 0.001) {
        applyStylePatch(comp, { opacity: '0.9999', visibility: 'visible' });
      }
    }
  }, [comp]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <>
      <div className="website-builder-page__panel-group-title">Size &amp; fade</div>
      <p className="website-builder-page__field-hint">
        How big this block is on the page. You can type a number and <code>px</code> (pixels) or <code>%</code> (percent of the row).
      </p>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-w">
          Width
        </label>
        <input
          id="wb-lay-w"
          className="website-builder-page__field-control"
          value={width}
          placeholder="e.g. 100% or 320px wide"
          onChange={(e) => {
            const v = e.target.value;
            setWidth(v);
            applyStylePatch(comp, { width: v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-h">
          Height
        </label>
        <input
          id="wb-lay-h"
          className="website-builder-page__field-control"
          value={height}
          placeholder="e.g. 200px or auto"
          onChange={(e) => {
            const v = e.target.value;
            setHeight(v);
            applyStylePatch(comp, { height: v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-mw">
          Max width (stops it getting too wide)
        </label>
        <input
          id="wb-lay-mw"
          className="website-builder-page__field-control"
          value={maxWidth}
          placeholder="e.g. 1200px"
          onChange={(e) => {
            const v = e.target.value;
            setMaxWidth(v);
            applyStylePatch(comp, { 'max-width': v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-mh">
          Minimum height (shortest it can be)
        </label>
        <input
          id="wb-lay-mh"
          className="website-builder-page__field-control"
          value={minHeight}
          placeholder="e.g. 80px"
          onChange={(e) => {
            const v = e.target.value;
            setMinHeight(v);
            applyStylePatch(comp, { 'min-height': v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-lay-op">
            Fade / transparency
          </label>
          <span className="website-builder-page__char-count">{opacityPct}%</span>
        </div>
        <div className="website-builder-page__range-row">
          <input
            id="wb-lay-op"
            type="range"
            min={0}
            max={100}
            value={opacityPct}
            className="website-builder-page__range"
            onChange={(e) => {
              const n = Number(e.target.value);
              setOpacityPct(n);
              const hidden = n <= 0;
              const o = hidden ? '0' : n >= 100 ? '0.9999' : String(n / 100);
              applyStylePatch(comp, {
                opacity: o,
                visibility: hidden ? 'hidden' : 'visible',
              });
            }}
          />
        </div>
      </div>
    </>
  );
}

function AnimationQuickFields({ comp }: { comp: Component }) {
  const [anim, setAnim] = useState('');
  const [delayMs, setDelayMs] = useState(0);

  useEffect(() => {
    const attrs = comp.getAttributes?.() ?? {};
    const nextAnim = String(attrs['data-wb-anim'] ?? '').trim();
    const nextDelay = Number(attrs['data-wb-anim-delay'] ?? 0);
    setAnim(nextAnim);
    setDelayMs(Number.isFinite(nextDelay) ? Math.max(0, nextDelay) : 0);
  }, [comp]);

  return (
    <>
      <p className="website-builder-page__field-hint" style={{ marginBottom: '0.45rem' }}>
        Optional: a little movement when someone first opens the page. Leave as “No motion” for a simple, still site.
      </p>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-anim-style">
          Effect when the page loads
        </label>
        <select
          id="wb-anim-style"
          className="website-builder-page__field-control"
          value={anim}
          onChange={(e) => {
            const v = e.target.value;
            setAnim(v);
            comp.addAttributes({ 'data-wb-anim': v });
          }}
        >
          <option value="">No motion</option>
          <option value="wb-fade-up">Gentle rise</option>
          <option value="wb-fade-in">Soft fade in</option>
          <option value="wb-slide-left">Slide from left</option>
          <option value="wb-slide-right">Slide from right</option>
          <option value="wb-zoom-in">Slight zoom in</option>
          <option value="wb-pulse">Repeating pulse</option>
        </select>
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-anim-delay">
            Wait before it starts
          </label>
          <span className="website-builder-page__char-count">{delayMs}ms</span>
        </div>
        <div className="website-builder-page__range-row">
          <input
            id="wb-anim-delay"
            type="range"
            min={0}
            max={2000}
            step={50}
            value={delayMs}
            className="website-builder-page__range"
            onChange={(e) => {
              const n = Number(e.target.value);
              setDelayMs(n);
              comp.addAttributes({ 'data-wb-anim-delay': String(n) });
            }}
          />
        </div>
      </div>
    </>
  );
}

function DesignPanel({
  selection,
  selected,
}: {
  selection: SelectionInfo;
  selected: ReturnType<Editor['getSelected']>;
}) {
  if (!selected) return <InspectorEmpty />;

  if (selection.kind === 'hero') {
    return (
      <>
        <p className="website-builder-page__field-hint website-builder-page__inspector-lede">
          Set the <strong>banner</strong> look: colours, photo or video, headline sizes, and buttons — the first thing people see.
        </p>
        <FillAndTextFields key={selection.cid} comp={selected} omitFontFamily />
        <HeroDesign root={selected} />
      </>
    );
  }

  return (
    <>
      <p className="website-builder-page__field-hint website-builder-page__inspector-lede">
        Change <strong>colours</strong>, <strong>font</strong>, <strong>background</strong> (solid, blend, or picture), then <strong>size</strong> and <strong>fade</strong>. On a heading or paragraph, you can also <strong>drag the blue corner handles</strong> on the canvas to grow or shrink the text.
      </p>
      <FillAndTextFields key={selection.cid} comp={selected} />
      <ElementLayoutFields comp={selected} />
      <div className="website-builder-page__gjs-embed">
        <p className="website-builder-page__field-hint website-builder-page__gjs-embed-hint">
          {selection.kind === 'iframe' ?
            'Put the map or video address under Basics. Use the boxes above for size and colours; use Extras if you want motion or a menu jump link.'
          : selection.kind === 'pushButton' || selection.kind === 'div' ?
            'Optional fine controls below. For motion or a section label, open the Extras tab.'
          : 'When this looks right, switch to Extras only if you want a menu jump link or gentle motion when the page opens.'}
        </p>
      </div>
    </>
  );
}

function resolveHeroInnerEl(root: NonNullable<ReturnType<Editor['getSelected']>>) {
  const inner = findOne(root, '.wb-hero-premium__inner');
  if (inner) return inner;
  const comps = root.components?.();
  if (!comps || typeof comps.length !== 'number') return undefined;
  for (let i = 0; i < comps.length; i += 1) {
    const ch = comps.at(i);
    if (ch && String(ch.get('tagName') ?? '').toLowerCase() === 'div') return ch;
  }
  return undefined;
}

function HeroDesign({ root }: { root: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [layoutWidth, setLayoutWidth] = useState('Contained');
  const [vAlign, setVAlign] = useState<'start' | 'center' | 'end'>('center');
  /** Matches centered scratch hero; uses text-align + full-width inner so preview matches editor. */
  const [contentPos, setContentPos] = useState('Center');
  const [minH, setMinH] = useState(80);
  const [minUnit, setMinUnit] = useState<'vh' | 'px'>('vh');
  const [gap, setGap] = useState('Default');
  const [hFont, setHFont] = useState('Poppins');
  const [hWeight, setHWeight] = useState('700');
  const [hSize, setHSize] = useState(64);
  const [hLh, setHLh] = useState(1.1);
  const [pFont, setPFont] = useState('Inter');
  const [pWeight, setPWeight] = useState('400');
  const [pSize, setPSize] = useState(18);
  const [pLh, setPLh] = useState(1.6);
  const [btnStyle, setBtnStyle] = useState('Outline');
  const [btnRadius, setBtnRadius] = useState(8);

  const applyRootStyle = useCallback(
    (patch: Record<string, string>) => {
      const prev = root.getStyle?.() ?? {};
      root.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  const applyHeadingStyle = useCallback(
    (patch: Record<string, string>) => {
      const h1 = findOne(root, 'h1');
      if (!h1) return;
      const prev = h1.getStyle?.() ?? {};
      h1.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  const applySubStyle = useCallback(
    (patch: Record<string, string>) => {
      const { sub } = getHeroContent(root);
      if (!sub) return;
      const prev = sub.getStyle?.() ?? {};
      sub.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  const applyLinkStyle = useCallback(
    (patch: Record<string, string>) => {
      const link = findOne(root, 'a.wb-link-btn') ?? findOne(root, 'a');
      if (!link) return;
      const prev = link.getStyle?.() ?? {};
      link.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  useEffect(() => {
    const textAlign = contentPos === 'Right' ? 'right' : contentPos === 'Center' ? 'center' : 'left';
    applyRootStyle({
      'min-height': `${minH}${minUnit}`,
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': vAlign === 'start' ? 'flex-start' : vAlign === 'end' ? 'flex-end' : 'center',
      'align-items': 'stretch',
      'text-align': textAlign,
    });
  }, [applyRootStyle, minH, minUnit, vAlign, contentPos]);

  useEffect(() => {
    const inner = resolveHeroInnerEl(root);
    if (!inner) return;
    const prev = inner.getStyle?.() ?? {};
    if (layoutWidth === 'Full width') {
      inner.setStyle({
        ...prev,
        width: '100%',
        'max-width': 'none',
        'margin-left': '0',
        'margin-right': '0',
        'box-sizing': 'border-box',
      });
    } else {
      inner.setStyle({
        ...prev,
        width: '100%',
        'max-width': '42rem',
        'margin-left': 'auto',
        'margin-right': 'auto',
        'box-sizing': 'border-box',
      });
    }
  }, [root, layoutWidth]);

  const hRem = (hSize / 16).toFixed(2);
  const pRem = (pSize / 16).toFixed(2);
  const btnRadiusRem = (btnRadius / 16).toFixed(3);

  useEffect(() => {
    const cap = (hSize / 16).toFixed(2);
    applyHeadingStyle({
      'font-family': `${hFont}, system-ui, sans-serif`,
      'font-weight': hWeight,
      'font-size': `clamp(1.35rem, 2.5vw + 0.75rem, ${cap}rem)`,
      'line-height': String(hLh),
    });
  }, [applyHeadingStyle, hFont, hWeight, hSize, hLh]);

  useEffect(() => {
    const cap = (pSize / 16).toFixed(2);
    applySubStyle({
      'font-family': `${pFont}, system-ui, sans-serif`,
      'font-weight': pWeight,
      'font-size': `clamp(0.9rem, 1.2vw + 0.65rem, ${cap}rem)`,
      'line-height': String(pLh),
      'max-width': 'min(36rem, 92%)',
      'margin-left': 'auto',
      'margin-right': 'auto',
    });
  }, [applySubStyle, pFont, pWeight, pSize, pLh]);

  useEffect(() => {
    const border =
      btnStyle === 'Outline' ? '2px solid rgba(255,255,255,0.9)' : btnStyle === 'Solid' ? '2px solid transparent' : '0';
    const bg = btnStyle === 'Solid' ? 'rgba(255,255,255,0.15)' : 'transparent';
    const r = (btnRadius / 16).toFixed(3);
    applyLinkStyle({
      'border-radius': `${r}rem`,
      border,
      background: bg,
    });
  }, [applyLinkStyle, btnStyle, btnRadius]);

  return (
    <>
      <details className="website-builder-page__disclosure" open>
        <summary className="website-builder-page__disclosure-summary">Layout</summary>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Content Width</label>
          <select className="website-builder-page__field-control" value={layoutWidth} onChange={(e) => setLayoutWidth(e.target.value)}>
            <option>Contained</option>
            <option>Full width</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <span className="website-builder-page__field-label">Vertical Align</span>
          <div className="website-builder-page__icon-toggle-row">
            <button
              type="button"
              className={`website-builder-page__icon-toggle${vAlign === 'start' ? ' is-active' : ''}`}
              aria-label="Align top"
              onClick={() => setVAlign('start')}
            >
              <span className="website-builder-page__vbar website-builder-page__vbar--top" />
            </button>
            <button
              type="button"
              className={`website-builder-page__icon-toggle${vAlign === 'center' ? ' is-active' : ''}`}
              aria-label="Align middle"
              onClick={() => setVAlign('center')}
            >
              <span className="website-builder-page__vbar website-builder-page__vbar--mid" />
            </button>
            <button
              type="button"
              className={`website-builder-page__icon-toggle${vAlign === 'end' ? ' is-active' : ''}`}
              aria-label="Align bottom"
              onClick={() => setVAlign('end')}
            >
              <span className="website-builder-page__vbar website-builder-page__vbar--bot" />
            </button>
          </div>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Content Position</label>
          <select className="website-builder-page__field-control" value={contentPos} onChange={(e) => setContentPos(e.target.value)}>
            <option>Left</option>
            <option>Center</option>
            <option>Right</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Min Height</label>
          <div className="website-builder-page__split-input">
            <input
              type="number"
              className="website-builder-page__field-control"
              value={minH}
              onChange={(e) => setMinH(Number(e.target.value))}
            />
            <select className="website-builder-page__field-control" value={minUnit} onChange={(e) => setMinUnit(e.target.value as 'vh' | 'px')}>
              <option value="vh">vh</option>
              <option value="px">px</option>
            </select>
          </div>
          <p className="website-builder-page__field-hint">Minimum height of the section.</p>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Columns Gap</label>
          <select className="website-builder-page__field-control" value={gap} onChange={(e) => setGap(e.target.value)}>
            <option>Default</option>
            <option>Tight</option>
            <option>Wide</option>
          </select>
        </div>
      </details>

      <details className="website-builder-page__disclosure" open>
        <summary className="website-builder-page__disclosure-summary">Typography</summary>
        <div className="website-builder-page__subhead">Heading</div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Font</label>
          <select className="website-builder-page__field-control" value={hFont} onChange={(e) => setHFont(e.target.value)}>
            <option>Poppins</option>
            <option>Inter</option>
            <option>system-ui</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Weight</label>
          <select className="website-builder-page__field-control" value={hWeight} onChange={(e) => setHWeight(e.target.value)}>
            <option value="700">700 — Bold</option>
            <option value="600">600 — Semibold</option>
            <option value="400">400 — Regular</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <div className="website-builder-page__label-row">
            <span className="website-builder-page__field-label mb-0">Size</span>
            <DesktopWindowsOutlinedIcon fontSize="small" className="website-builder-page__inline-icon" />
          </div>
          <div className="website-builder-page__range-row">
            <input type="range" min={24} max={96} value={hSize} className="website-builder-page__range" onChange={(e) => setHSize(Number(e.target.value))} />
            <span className="website-builder-page__range-value">{hRem}rem</span>
          </div>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Line Height</label>
          <input type="number" step={0.05} className="website-builder-page__field-control" value={hLh} onChange={(e) => setHLh(Number(e.target.value))} />
        </div>

        <div className="website-builder-page__subhead">Subheading</div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Font</label>
          <select className="website-builder-page__field-control" value={pFont} onChange={(e) => setPFont(e.target.value)}>
            <option>Inter</option>
            <option>Poppins</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Weight</label>
          <select className="website-builder-page__field-control" value={pWeight} onChange={(e) => setPWeight(e.target.value)}>
            <option value="400">400 — Regular</option>
            <option value="500">500 — Medium</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <div className="website-builder-page__range-row">
            <input type="range" min={12} max={32} value={pSize} className="website-builder-page__range" onChange={(e) => setPSize(Number(e.target.value))} />
            <span className="website-builder-page__range-value">{pRem}rem</span>
          </div>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Line Height</label>
          <input type="number" step={0.05} className="website-builder-page__field-control" value={pLh} onChange={(e) => setPLh(Number(e.target.value))} />
        </div>
      </details>

      <details className="website-builder-page__disclosure" open>
        <summary className="website-builder-page__disclosure-summary">Button</summary>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Style</label>
          <select className="website-builder-page__field-control" value={btnStyle} onChange={(e) => setBtnStyle(e.target.value)}>
            <option>Outline</option>
            <option>Solid</option>
            <option>Ghost</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Border Radius</label>
          <div className="website-builder-page__range-row">
            <input type="range" min={0} max={32} value={btnRadius} className="website-builder-page__range" onChange={(e) => setBtnRadius(Number(e.target.value))} />
            <span className="website-builder-page__range-value">{btnRadiusRem}rem</span>
          </div>
        </div>
      </details>

      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function AdvancedPanelForm({
  selected,
}: {
  selected: ReturnType<Editor['getSelected']>;
}) {
  const [htmlTag, setHtmlTag] = useState('section');
  const [cssId, setCssId] = useState('');
  const [cssClass, setCssClass] = useState('');
  const [padLock, setPadLock] = useState(true);
  const [pad, setPad] = useState({ t: 80, r: 80, b: 80, l: 80 });
  const [marginLock, setMarginLock] = useState(true);
  const [margin, setMargin] = useState({ t: 0, r: 0, b: 0, l: 0 });
  const [sectionDisplayName, setSectionDisplayName] = useState('');
  const [customCss, setCustomCss] = useState(
    `.hero-section {\n  /* section */\n}\n.hero-section .heading {\n  /* heading */\n}`,
  );

  useEffect(() => {
    if (!selected) return;
    setHtmlTag(String(selected.get('tagName') ?? 'div'));
    setCssId(String(selected.getAttributes?.().id ?? ''));
    const cl = selected.getClasses?.();
    setCssClass(Array.isArray(cl) ? cl.join(' ') : String(cl ?? ''));
    setSectionDisplayName(String(selected.getAttributes?.()['data-wb-section-name'] ?? '').trim());
  }, [selected]);

  const applyTag = (tag: string) => {
    setHtmlTag(tag);
    if (!selected) return;
    selected.set('tagName', tag);
  };

  const applyId = (id: string) => {
    setCssId(id);
    if (!selected) return;
    selected.addAttributes({ id });
  };

  const applyClasses = (cls: string) => {
    setCssClass(cls);
    if (!selected) return;
    const parts = cls.split(/\s+/).filter(Boolean);
    if (parts.length) selected.setClass(parts);
    else selected.setClass([]);
  };

  const applyPadding = (patch: Partial<typeof pad>) => {
    const next = { ...pad, ...patch };
    setPad(next);
    if (!selected) return;
    const prev = selected.getStyle?.() ?? {};
    selected.setStyle({
      ...prev,
      padding: `${next.t}px ${next.r}px ${next.b}px ${next.l}px`,
    });
  };

  if (!selected) return <InspectorEmpty />;

  return (
    <>
      <p className="website-builder-page__field-hint website-builder-page__inspector-lede">
        Most people only use the first section. The rest is for when you work with a web designer or know a little HTML.
      </p>

      <div className="website-builder-page__panel-group-title">Name &amp; motion</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-secname">
          Friendly name (for you)
        </label>
        <input
          id="wb-ins-secname"
          className="website-builder-page__field-control"
          value={sectionDisplayName}
          placeholder="e.g. Our prices, Meet the team"
          onChange={(e) => {
            const v = e.target.value;
            setSectionDisplayName(v);
            patchAttributes(selected, { 'data-wb-section-name': v.trim() || undefined });
          }}
        />
        <p className="website-builder-page__field-hint">
          Helps you remember what this part of the page is. Customers do not usually see this text.
        </p>
      </div>
      <AnimationQuickFields comp={selected} />

      <div className="website-builder-page__panel-group-title">Menu jump link (optional)</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-id">
          Short name for “scroll here” in menus
        </label>
        <input id="wb-ins-id" className="website-builder-page__field-control" value={cssId} onChange={(e) => applyId(e.target.value)} placeholder="pricing" />
        <p className="website-builder-page__field-hint">
          One word, no spaces (e.g. <code>pricing</code>). Your menu can link to <code>#pricing</code> so the page scrolls to this block.
        </p>
      </div>

      <div className="website-builder-page__panel-group-title">Technical (skip unless you know)</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-tag">
          Block type (HTML)
        </label>
        <select id="wb-ins-tag" className="website-builder-page__field-control" value={htmlTag} onChange={(e) => applyTag(e.target.value)}>
          <option value="section">section</option>
          <option value="header">header</option>
          <option value="div">div</option>
          <option value="article">article</option>
          <option value="main">main</option>
          <option value="nav">nav</option>
          <option value="footer">footer</option>
          <option value="h1">h1</option>
          <option value="h2">h2</option>
          <option value="p">p</option>
          <option value="a">a</option>
          <option value="img">img</option>
        </select>
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-cls">
          Extra labels (classes)
        </label>
        <input
          id="wb-ins-cls"
          className="website-builder-page__field-control"
          value={cssClass}
          onChange={(e) => applyClasses(e.target.value)}
          placeholder="hero-section"
        />
        <p className="website-builder-page__field-hint">Only if a designer gave you exact words to paste here.</p>
      </div>

      <div className="website-builder-page__panel-group-title">Phone &amp; tablet (coming soon)</div>
      <div className="website-builder-page__form-block">
        <span className="website-builder-page__field-label">Hide on smaller screens</span>
        <p className="website-builder-page__field-hint">For now, use <strong>Style</strong> to make one layout that works everywhere.</p>
        <div className="website-builder-page__device-row">
          <button type="button" className="website-builder-page__device-btn is-active" aria-label="Desktop" disabled>
            <DesktopWindowsOutlinedIcon fontSize="small" />
          </button>
          <button type="button" className="website-builder-page__device-btn" aria-label="Tablet" disabled>
            <TabletMacOutlinedIcon fontSize="small" />
          </button>
          <button type="button" className="website-builder-page__device-btn" aria-label="Mobile" disabled>
            <PhoneIphoneOutlinedIcon fontSize="small" />
          </button>
        </div>
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <span className="website-builder-page__field-label mb-0">Space inside the block</span>
          <button type="button" className="website-builder-page__link-icon-btn" aria-label="Link padding" onClick={() => setPadLock((v) => !v)}>
            <LinkOutlinedIcon fontSize="small" />
          </button>
        </div>
        <div className="website-builder-page__quad-inputs">
          {(['t', 'r', 'b', 'l'] as const).map((k) => (
            <label key={k} className="website-builder-page__quad-label">
              <span>{k.toUpperCase()}</span>
              <div className="website-builder-page__input-unit">
                <input
                  type="number"
                  className="website-builder-page__field-control"
                  value={pad[k]}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (padLock) applyPadding({ t: n, r: n, b: n, l: n });
                    else applyPadding({ [k]: n });
                  }}
                />
                <span>px</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <span className="website-builder-page__field-label mb-0">Space outside the block</span>
          <button type="button" className="website-builder-page__link-icon-btn" aria-label="Link margin" onClick={() => setMarginLock((v) => !v)}>
            <LinkOutlinedIcon fontSize="small" />
          </button>
        </div>
        <div className="website-builder-page__quad-inputs">
          {(['t', 'r', 'b', 'l'] as const).map((k) => (
            <label key={k} className="website-builder-page__quad-label">
              <span>{k.toUpperCase()}</span>
              <div className="website-builder-page__input-unit">
                <input
                  type="number"
                  className="website-builder-page__field-control"
                  value={margin[k]}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    const next = marginLock ? { t: n, r: n, b: n, l: n } : { ...margin, [k]: n };
                    setMargin(next);
                    if (!selected) return;
                    const prev = selected.getStyle?.() ?? {};
                    selected.setStyle({
                      ...prev,
                      margin: `${next.t}px ${next.r}px ${next.b}px ${next.l}px`,
                    });
                  }}
                />
                <span>px</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="website-builder-page__panel-group-title">Custom code (experts only)</div>
      <p className="website-builder-page__field-hint">Skip this unless someone gave you CSS to paste. Wrong code can break the page.</p>
      <textarea
        className="website-builder-page__field-control website-builder-page__code-editor"
        rows={8}
        value={customCss}
        onChange={(e) => setCustomCss(e.target.value)}
        spellCheck={false}
      />
    </>
  );
}
