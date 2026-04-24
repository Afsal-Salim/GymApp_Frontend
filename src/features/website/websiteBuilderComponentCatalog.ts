import type { Component, Editor } from 'grapesjs';
import { nextBaseUrl } from '../../config/env';
import { isWbLayerGroup, siblingIndex, WB_LAYER_GROUP_ATTR } from './websiteBuilderLayerGroup';
import { nameLastAddedLayer } from './websiteBuilderInspector';
import {
  WEBSITE_BUILDER_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS,
  WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS,
} from './websiteBuilderConstants';
import {
  WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT,
  WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF,
} from './websiteBuilderDesignSystemFonts';
import { WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS } from './websiteBuilderDesignSystems.css';
import {
  buildDesignSystemCatalogEntries,
  DESIGN_SYSTEM_SECTION_ORDER,
  type DesignSystemSetId,
} from './websiteBuilderDesignSystemBlocks';
import {
  ICON_COMPONENT_CATALOG_ENTRIES,
  ICON_GRID_KIT_CATALOG_ENTRY,
} from './websiteBuilderIconBlocks';

/**
 * Iframe `srcdoc` documents have an opaque URL (`about:srcdoc`). Root-relative
 * `/public/...` assets and scripts would otherwise fail to load — match the app origin + Next base path.
 */
export function getPreviewSrcDocBaseHref(): string {
  if (typeof window === 'undefined') return '';
  const b = nextBaseUrl.endsWith('/') ? nextBaseUrl.slice(0, -1) : nextBaseUrl;
  const prefix = b && b !== '/' ? b : '';
  return `${window.location.origin}${prefix}/`;
}

function escapeAttrForBaseHref(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function previewBaseTag(): string {
  const href = getPreviewSrcDocBaseHref();
  if (!href) return '';
  return `<base href="${escapeAttrForBaseHref(href)}" />`;
}

export type ComponentLibraryFilter =
  | 'all'
  | 'actions'
  | 'modals'
  | 'forms'
  | 'info'
  | 'content'
  | 'icons'
  | 'trust'
  | 'pricing'
  | 'sections'
  | 'navigation'
  | 'design-systems';

/** Passed when opening the full components library from the left palette. */
export type ComponentsLibraryOpenTarget = {
  filter?: ComponentLibraryFilter;
  scope?: 'blocks' | 'design-systems';
};

export type ComponentLibraryPreviewKind =
  | 'action'
  | 'hero'
  | 'form'
  | 'nav'
  | 'pricing'
  | 'content'
  | 'footer'
  | 'modal'
  | 'trust'
  | 'embed'
  | 'default';

/** Design-system section previews lay out at this width, then scale down to the iframe (avoids mobile breakpoints). */
export const WB_LIB_DS_SECTION_PREVIEW_WIDTH = 1200;

export type ComponentCatalogEntry = {
  blockId: string;
  title: string;
  description: string;
  filter: ComponentLibraryFilter;
  preview: ComponentLibraryPreviewKind;
};

export const COMPONENT_LIBRARY_FILTERS: { id: ComponentLibraryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'actions', label: 'Actions' },
  { id: 'modals', label: 'Modals' },
  { id: 'forms', label: 'Forms' },
  { id: 'info', label: 'Info' },
  { id: 'content', label: 'Content' },
  { id: 'icons', label: 'Icons' },
  { id: 'trust', label: 'Trust' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'sections', label: 'Sections' },
  { id: 'navigation', label: 'Nav' },
];

const catalog: ComponentCatalogEntry[] = [
  {
    blockId: 'wb-cta-join',
    title: 'Join now CTA',
    description: 'Opens the join-now modal on the live gym site (same API as the default Crystal page).',
    filter: 'actions',
    preview: 'action',
  },
  { blockId: 'wb-cta-call', title: 'Call now strip', description: 'Card with tap-to-call button — set your tel: link.', filter: 'actions', preview: 'action' },
  {
    blockId: 'wb-cta-whatsapp',
    title: 'WhatsApp chat',
    description: 'WhatsApp icon + button; set phone in the sidebar—opens wa.me chat when tapped.',
    filter: 'actions',
    preview: 'action',
  },
  {
    blockId: 'wb-cta-email',
    title: 'Email button',
    description: 'Card with a mailto button visitors can tap to email you.',
    filter: 'actions',
    preview: 'action',
  },
  {
    blockId: 'wb-cta-visit',
    title: 'Plan a visit CTA',
    description: 'Button that opens the plan-a-visit lead modal on the published site.',
    filter: 'actions',
    preview: 'action',
  },
  {
    blockId: 'wb-cta-trial',
    title: 'Free trial CTA',
    description: 'Opens the book–free-trial modal (crystal lead API) when published.',
    filter: 'actions',
    preview: 'action',
  },
  {
    blockId: 'wb-cta-join-anim',
    title: 'Join now (animated)',
    description: 'Scroll reveal + hover scale + glow/pulse button; same join modal as the static card.',
    filter: 'actions',
    preview: 'action',
  },
  {
    blockId: 'wb-cta-whatsapp-float-anim',
    title: 'WhatsApp float (animated)',
    description: 'Fixed corner WhatsApp icon; set phone in the sidebar—tap opens chat (wa.me).',
    filter: 'actions',
    preview: 'action',
  },
  {
    blockId: 'wb-enquiry-card',
    title: 'Quick enquiry',
    description: 'Compact card whose button opens the service enquiry modal on the live site.',
    filter: 'modals',
    preview: 'modal',
  },
  {
    blockId: 'wb-modals-lead-strip',
    title: 'Modals · Lead row',
    description: 'Join, visit, trial, and enquiry buttons—same Crystal lead modals as other CTAs.',
    filter: 'modals',
    preview: 'modal',
  },
  {
    blockId: 'wb-enquiry-slide-anim',
    title: 'Quick enquiry (slide panel)',
    description: 'Animated drawer from the right; Send still opens the live enquiry modal.',
    filter: 'modals',
    preview: 'modal',
  },
  {
    blockId: 'wb-modal-custom-dialog',
    title: 'Custom modal (dialog)',
    description: 'Native dialog element you fully customise; open/close is wired by the page animation script.',
    filter: 'modals',
    preview: 'modal',
  },
  {
    blockId: 'wb-form-contact',
    title: 'Contact form',
    description: 'Card layout with name, phone, and message; Send opens the enquiry modal when published.',
    filter: 'forms',
    preview: 'form',
  },
  {
    blockId: 'wb-info-hours-card',
    title: 'Working hours card',
    description: 'Compact opening-hours card with day/time rows.',
    filter: 'info',
    preview: 'footer',
  },
  {
    blockId: 'wb-info-address-card',
    title: 'Address info card',
    description: 'Address details with a plan-a-visit call to action.',
    filter: 'info',
    preview: 'footer',
  },
  {
    blockId: 'wb-info-social-strip',
    title: 'Social links strip',
    description: 'Quick social buttons for Instagram, Facebook, YouTube, and WhatsApp.',
    filter: 'info',
    preview: 'footer',
  },
  {
    blockId: 'wb-info-contact-methods',
    title: 'Contact methods card',
    description: 'Compact call/email/enquiry cards in one row.',
    filter: 'info',
    preview: 'footer',
  },
  {
    blockId: 'wb-info-quick-links',
    title: 'Quick links card',
    description: 'Simple list of important internal links and visit action.',
    filter: 'info',
    preview: 'footer',
  },
  { blockId: 'wb-footer-1', title: 'Footer · simple', description: 'Contact line, brand, and a WhatsApp link.', filter: 'info', preview: 'footer' },
  { blockId: 'wb-footer-2', title: 'Footer · 3 columns', description: 'Brand, links, and hours in columns.', filter: 'info', preview: 'footer' },
  {
    blockId: 'wb-embed-site',
    title: 'Embed (iframe)',
    description: 'Embeds another page or app; set the URL in the builder after adding (iframe src).',
    filter: 'content',
    preview: 'embed',
  },
  {
    blockId: 'wb-map-location',
    title: 'Map (location)',
    description:
      'Map section with an iframe: paste any Google Maps link in Basics → Source URL, then tab out — we convert common links to embed. Or use Share → Embed a map.',
    filter: 'content',
    preview: 'embed',
  },
  {
    blockId: 'wb-map-location-anim',
    title: 'Map (animated)',
    description: 'Same embed map with scroll reveal and hover zoom on the card.',
    filter: 'content',
    preview: 'embed',
  },
  {
    blockId: 'wb-content-services-grid',
    title: 'Services grid',
    description: 'Three-card services layout for key offerings.',
    filter: 'content',
    preview: 'content',
  },
  {
    blockId: 'wb-content-why-us-list',
    title: 'Why us list',
    description: 'Bullet list for key value propositions.',
    filter: 'content',
    preview: 'content',
  },
  {
    blockId: 'wb-content-cta-grid-2',
    title: 'Dual CTA cards',
    description: 'Two side-by-side call-to-action cards (join + visit).',
    filter: 'content',
    preview: 'content',
  },
  {
    blockId: 'wb-brochure-download',
    title: 'Brochure download',
    description: 'Prominent PDF download row — set the file link on the button after adding.',
    filter: 'content',
    preview: 'content',
  },
  {
    blockId: 'wb-trust-metrics-3',
    title: 'Trust metrics strip',
    description: 'Highlights member count, rating, and years of coaching.',
    filter: 'trust',
    preview: 'trust',
  },
  {
    blockId: 'wb-trust-rating-card',
    title: 'Rating summary card',
    description: 'Displays average rating with stars and review confidence text.',
    filter: 'trust',
    preview: 'trust',
  },
  {
    blockId: 'wb-trust-payment-strip',
    title: 'Payments accepted strip',
    description: 'Trusted payment method chips for visitor confidence.',
    filter: 'trust',
    preview: 'trust',
  },
  {
    blockId: 'wb-trust-brand-logos',
    title: 'Partner logos strip',
    description: 'Inline pill-style partner/brand logos for social proof.',
    filter: 'trust',
    preview: 'trust',
  },
  { blockId: 'wb-testimonial-1', title: 'Testimonial', description: 'Quote, name, and star row for social proof.', filter: 'trust', preview: 'trust' },
  {
    blockId: 'wb-testimonial-carousel-anim',
    title: 'Testimonial (carousel)',
    description: 'Rotating quotes with a soft fade — edit the pipe-separated list in data-wb-tcarousel.',
    filter: 'trust',
    preview: 'trust',
  },
  { blockId: 'wb-coaches-1', title: 'Coaches · 3 columns', description: 'Team cards in a three-column section.', filter: 'trust', preview: 'trust' },
  { blockId: 'wb-coaches-2', title: 'Gallery · 2 images', description: 'Two-column image grid with placeholders.', filter: 'trust', preview: 'trust' },
  {
    blockId: 'wb-gallery-hover-anim',
    title: 'Gallery (hover zoom)',
    description: 'Two placeholders with hover scale and scroll-in fade on each image.',
    filter: 'trust',
    preview: 'trust',
  },
  { blockId: 'wb-pricing-1', title: 'Pricing · 3 plans', description: 'Three membership cards with a highlighted tier.', filter: 'pricing', preview: 'pricing' },
  { blockId: 'wb-pricing-2', title: 'Pricing · 2 wide', description: 'Two large plan panels side by side.', filter: 'pricing', preview: 'pricing' },
  { blockId: 'wb-header-1', title: 'Hero · centered', description: 'Dark hero headline, subcopy, and join CTA.', filter: 'sections', preview: 'hero' },
  {
    blockId: 'wb-about-1',
    title: 'About · simple',
    description: 'Short heading and paragraph for your gym story.',
    filter: 'sections',
    preview: 'content',
  },
  { blockId: 'wb-header-2', title: 'Hero · split', description: 'Text plus visual area in two columns.', filter: 'sections', preview: 'hero' },
  { blockId: 'wb-header-3', title: 'Hero · minimal', description: 'Light, centered hero for simple landing tops.', filter: 'sections', preview: 'hero' },
  {
    blockId: 'wb-set-ocean-flow',
    title: 'Style set · Ocean flow',
    description: 'Matching nav + hero + footer with blue theme and smooth animation.',
    filter: 'sections',
    preview: 'hero',
  },
  {
    blockId: 'wb-set-sunset-energy',
    title: 'Style set · Sunset energy',
    description: 'Matching nav + hero + footer with dark-orange energetic style.',
    filter: 'sections',
    preview: 'hero',
  },
  {
    blockId: 'wb-set-clean-minimal',
    title: 'Style set · Clean minimal',
    description: 'Matching nav + hero + footer with clean modern style.',
    filter: 'sections',
    preview: 'hero',
  },
  { blockId: 'wb-offers-1', title: 'Offers · banner', description: 'Dark banner for limited-time promos.', filter: 'sections', preview: 'hero' },
  { blockId: 'wb-offers-2', title: 'Offers · split', description: 'Gradient strip with text and CTA.', filter: 'sections', preview: 'hero' },
  {
    blockId: 'wb-offers-gradient-anim',
    title: 'Offers · gradient (animated)',
    description: 'Full-width shifting gradient promo strip.',
    filter: 'sections',
    preview: 'hero',
  },
  { blockId: 'wb-nav-1', title: 'Nav · sticky bar', description: 'Logo, links, and contact button; sticks to top.', filter: 'navigation', preview: 'nav' },
  { blockId: 'wb-nav-2', title: 'Nav · centered', description: 'Stacked brand and centered links (dark).', filter: 'navigation', preview: 'nav' },
  { blockId: 'wb-nav-3', title: 'Nav · pill links', description: 'Light bar with pill-shaped navigation items.', filter: 'navigation', preview: 'nav' },
  {
    blockId: 'wb-scroll-top',
    title: 'Scroll to top',
    description: 'Fixed bottom-left control; smooth-scrolls the page to the top (pairs with in-page # anchor links).',
    filter: 'navigation',
    preview: 'nav',
  },
  ...(ICON_COMPONENT_CATALOG_ENTRIES as ComponentCatalogEntry[]),
  ICON_GRID_KIT_CATALOG_ENTRY as ComponentCatalogEntry,
  ...buildDesignSystemCatalogEntries(),
];

export function getComponentCatalog(): ComponentCatalogEntry[] {
  return catalog;
}

export function filterCatalog(
  items: ComponentCatalogEntry[],
  filter: ComponentLibraryFilter,
  query: string,
): ComponentCatalogEntry[] {
  const q = query.trim().toLowerCase();
  return items.filter((it) => {
    if (filter !== 'all' && it.filter !== filter) return false;
    if (!q) return true;
    return (
      it.title.toLowerCase().includes(q) ||
      it.description.toLowerCase().includes(q) ||
      it.blockId.toLowerCase().includes(q)
    );
  });
}

export function getBlockHtmlString(editor: Editor, blockId: string): string {
  const block = editor.BlockManager.get(blockId);
  if (!block) return '';
  const raw = block.get('content');
  return typeof raw === 'string' ? raw : '';
}

export function buildComponentPreviewSrcDoc(editor: Editor, blockId: string): string {
  const html = getBlockHtmlString(editor, blockId);
  if (!html) return '';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${previewBaseTag()}
    <style>
      ${WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT}
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f8fafc;
        overflow: hidden;
        font-family: Inter, system-ui, -apple-system, sans-serif;
      }
      .wb-lib-preview-stage {
        width: 100%;
        height: 100%;
        min-height: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .wb-lib-preview-root {
        box-sizing: border-box;
        max-width: 100%;
        transform-origin: center center;
        will-change: transform;
      }
      ${WEBSITE_BUILDER_ANIMATION_CSS}
      ${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}
      ${WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS}
      ${WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS}
      ${WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS}
    </style>
  </head>
  <body>
    <div class="wb-lib-preview-stage">
      <div class="wb-lib-preview-root wb-template-root">${html}</div>
    </div>
    <script defer src="/wb-component-animations.js"></script>
  </body>
</html>`;
}

/** Scrollable preview mode for tall blocks (eg. design-system sections) at native card width. */
export function buildScrollableComponentPreviewSrcDoc(editor: Editor, blockId: string): string {
  const html = getBlockHtmlString(editor, blockId);
  if (!html) return '';
  const designW = WB_LIB_DS_SECTION_PREVIEW_WIDTH;
  const dsPreviewEndCss = `
      /* --- Library: design-system section iframe (must be LAST to win cascade) --- */
      .wb-lib-preview-root .fade-up,
      .wb-lib-preview-root .wb-fade-up,
      .wb-lib-preview-root .wb-fade-in,
      .wb-lib-preview-root .wb-slide-left,
      .wb-lib-preview-root .wb-slide-right,
      .wb-lib-preview-root .wb-zoom-in {
        opacity: 1 !important;
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }
      .wb-lib-preview-root [class*='wb-ds-reveal'] {
        opacity: 1 !important;
        transform: none !important;
        filter: none !important;
        animation: none !important;
      }
      .wb-lib-preview-root .wb-sys-nav {
        position: static !important;
        top: auto !important;
      }
      .wb-lib-preview-root .wb-sys-hero,
      .wb-lib-preview-root .wb-sys-section {
        padding-top: 0.75rem !important;
        padding-bottom: 0.75rem !important;
      }
      .wb-lib-preview-root [class*='hero__shell'],
      .wb-lib-preview-root [class*='hero__stage'] {
        min-height: 0 !important;
      }
      .wb-lib-preview-root [class*='hero__imgCol'],
      .wb-lib-preview-root [class*='hero__media'] {
        min-height: 9rem !important;
      }
      .wb-lib-preview-root .wb-sys-section__head {
        margin-bottom: 0.7rem !important;
      }
      .wb-lib-preview-root .wb-sys-h1 {
        font-size: clamp(1rem, 4vw, 1.35rem) !important;
      }
      .wb-lib-preview-root .wb-sys-h2 {
        font-size: clamp(0.9rem, 3.2vw, 1.1rem) !important;
      }
      .wb-lib-preview-root .wb-sys-sub,
      .wb-lib-preview-root .wb-sys-lead,
      .wb-lib-preview-root .wb-sys-feature__desc {
        font-size: 0.72rem !important;
        line-height: 1.4 !important;
      }
      .wb-lib-preview-root .wb-sys-map {
        max-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
      .wb-lib-preview-root .wb-sys-contact-split {
        max-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .wb-lib-preview-root .wb-sys-price {
        max-width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
      }
  `;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${previewBaseTag()}
    <style>
      ${WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT}
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 0 !important;
        height: auto !important;
        background: #f8fafc;
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: none;
        font-family: Inter, system-ui, -apple-system, sans-serif;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
      .wb-lib-preview-slot {
        position: relative;
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
        overflow: hidden;
        box-sizing: border-box;
      }
      .wb-lib-preview-scaler {
        position: absolute;
        left: 50%;
        top: 0;
        width: ${designW}px;
        transform-origin: top center;
        will-change: transform;
      }
      .wb-lib-preview-root {
        width: 100%;
        min-height: 0 !important;
        box-sizing: border-box;
      }
      ${WEBSITE_BUILDER_ANIMATION_CSS}
      ${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}
      ${WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS}
      ${WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS}
      ${WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS}
      ${dsPreviewEndCss}
    </style>
  </head>
  <body>
    <div class="wb-lib-preview-slot">
      <div class="wb-lib-preview-scaler">
        <div class="wb-lib-preview-root wb-template-root">${html}</div>
      </div>
    </div>
    <script defer src="/wb-component-animations.js"></script>
  </body>
</html>`;
}

export type DesignSystemTemplatePreviewDocOpts = {
  /** Fixed desktop artboard width (px) inside the iframe — no scale-to-fit; use for full “actual page” library preview. */
  artboardWidthPx?: number;
};

/** Full-page preview for a design system set (Navbar → Footer), for library template cards. */
export function buildDesignSystemTemplatePreviewSrcDoc(
  editor: Editor,
  setId: DesignSystemSetId,
  opts?: DesignSystemTemplatePreviewDocOpts,
): string {
  const html = DESIGN_SYSTEM_SECTION_ORDER.map((key) => getBlockHtmlString(editor, `wb-ds-${setId}-${key}`))
    .filter((s) => s.trim().length > 0)
    .join('\n');
  if (!html) return '';

  const aw = opts?.artboardWidthPx;
  const isArtboard = aw != null;
  const rootCss = isArtboard ?
      `
      .wb-lib-template-preview-root {
        width: ${aw}px;
        max-width: none;
        margin: 0 auto;
        box-sizing: border-box;
        min-height: min-content;
      }`
    : `
      .wb-lib-template-preview-root {
        min-height: 100%;
      }`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${previewBaseTag()}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF}" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 100%;
        background: #f8fafc;
        overflow-x: hidden;
        /* Artboard full-preview: grow with content — scroll only on the library viewport, not inside the iframe. */
        overflow-y: ${isArtboard ? 'visible' : 'auto'};
        font-family: Inter, system-ui, -apple-system, sans-serif;
        scrollbar-width: none;
      }
      html::-webkit-scrollbar,
      body::-webkit-scrollbar {
        width: 0;
        height: 0;
        background: transparent;
      }
      ${rootCss}
      ${WEBSITE_BUILDER_ANIMATION_CSS}
      ${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}
      ${WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS}
      ${WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS}
      ${WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS}
    </style>
  </head>
  <body>
    <div class="wb-lib-template-preview-root wb-template-root">${html}</div>
    <script defer src="/wb-component-animations.js"></script>
  </body>
</html>`;
}

/** Scale iframe preview content so it fits the card visual (same-origin srcdoc only). */
export function applyLibraryPreviewFit(iframe: HTMLIFrameElement): void {
  const doc = iframe.contentDocument;
  const root = doc?.querySelector('.wb-lib-preview-root') as HTMLElement | null;
  if (!root) return;

  const run = () => {
    const iw = iframe.clientWidth;
    const ih = iframe.clientHeight;
    if (iw < 4 || ih < 4) return;

    root.style.transform = 'none';
    void root.offsetWidth;
    const rw = Math.max(1, root.scrollWidth);
    const rh = Math.max(1, root.scrollHeight);
    const pad = 0.94;
    const s = Math.min(1, (iw * pad) / rw, (ih * pad) / rh);
    root.style.transformOrigin = 'center center';
    root.style.transform = `scale(${s})`;
  };

  requestAnimationFrame(() => {
    run();
    requestAnimationFrame(run);
  });
}

/**
 * Lay out design-system section previews at a fixed desktop width, scale to the iframe,
 * and size the outer slot so scrolling matches content height (no dead vertical space).
 */
export function applyDesignSystemSectionPreviewFit(iframe: HTMLIFrameElement): void {
  const doc = iframe.contentDocument;
  if (!doc) return;
  const htmlEl = doc.documentElement;
  const body = doc.body;
  const slot = doc.querySelector('.wb-lib-preview-slot') as HTMLElement | null;
  const scaler = doc.querySelector('.wb-lib-preview-scaler') as HTMLElement | null;
  const root = doc.querySelector('.wb-lib-preview-root') as HTMLElement | null;
  if (!slot || !scaler || !root) return;

  const run = () => {
    const iw = Math.max(1, Math.floor(iframe.clientWidth));
    const ih = Math.max(1, Math.floor(iframe.clientHeight));
    const designW = WB_LIB_DS_SECTION_PREVIEW_WIDTH;
    const s = Math.min(1, iw / designW);
    scaler.style.width = `${designW}px`;
    scaler.style.left = '50%';
    scaler.style.top = '0';
    scaler.style.transform = 'none';
    scaler.style.transformOrigin = 'top center';
    void scaler.offsetWidth;
    const h = Math.max(1, root.scrollHeight);
    scaler.style.transform = `translateX(-50%) scale(${s})`;
    const slotH = Math.ceil(h * s);
    slot.style.height = `${slotH}px`;

    const short = slotH < ih;
    if (short) {
      htmlEl.style.height = '100%';
      htmlEl.style.overflow = 'hidden';
      body.style.minHeight = `${ih}px`;
      body.style.height = '100%';
      body.style.boxSizing = 'border-box';
      body.style.display = 'flex';
      body.style.flexDirection = 'column';
      body.style.justifyContent = 'center';
      body.style.alignItems = 'stretch';
      body.style.overflow = 'hidden';
      slot.style.width = '100%';
      slot.style.alignSelf = 'stretch';
    } else {
      htmlEl.style.height = '';
      htmlEl.style.overflow = '';
      body.style.minHeight = '';
      body.style.height = '';
      body.style.boxSizing = '';
      body.style.display = '';
      body.style.flexDirection = '';
      body.style.justifyContent = '';
      body.style.alignItems = '';
      body.style.overflow = '';
      slot.style.width = '';
      slot.style.alignSelf = '';
    }
  };

  requestAnimationFrame(() => {
    run();
    requestAnimationFrame(run);
  });
  window.setTimeout(run, 120);
  window.setTimeout(run, 420);
}

/** HTML5 drag payload from the components palette / library onto the Grapes canvas. */
export const WB_BLOCK_DRAG_MIME = 'application/x-wb-block-id';

export function setBlockDragTransferData(dt: DataTransfer, blockId: string): void {
  dt.setData(WB_BLOCK_DRAG_MIME, blockId);
  dt.setData('text/plain', `wb-block:${blockId}`);
  dt.effectAllowed = 'copy';
}

export function blockPaletteDragMimePresent(dt: DataTransfer | null): boolean {
  if (!dt?.types) return false;
  for (const t of dt.types as unknown as string[]) {
    if (t === WB_BLOCK_DRAG_MIME) return true;
  }
  return false;
}

export function readBlockIdFromPaletteDrag(dt: DataTransfer): string | null {
  try {
    const v = dt.getData(WB_BLOCK_DRAG_MIME);
    if (v && v.trim()) return v.trim();
  } catch {
    /* ignore */
  }
  try {
    const plain = dt.getData('text/plain');
    if (plain.startsWith('wb-block:')) {
      const id = plain.slice('wb-block:'.length).trim();
      return id || null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getComponentModel(editor: Editor, node: Node | null): Component | undefined {
  if (!node) return undefined;
  const utils = editor.Utils as unknown as {
    getComponentModel?: (n: Node) => Component | undefined;
    helpers?: { getComponentModel?: (n: Node) => Component | undefined };
  };
  return utils.getComponentModel?.(node) ?? utils.helpers?.getComponentModel?.(node);
}

/** Nearest top-level (direct child of page) component under the given DOM node. */
function findDirectChildOfWrapper(editor: Editor, start: Node | null): Component | null {
  let n: Node | null = start;
  for (let depth = 0; depth < 64 && n; depth += 1) {
    if (n.nodeType === 1) {
      const c = getComponentModel(editor, n);
      if (c) {
        if (c.is('wrapper')) {
          n = n.parentNode;
          continue;
        }
        const p = c.parent();
        if (p && p.is('wrapper')) {
          return c;
        }
      }
    }
    n = n.parentNode;
  }
  return null;
}

function nameInsertedLayerInParentAt(parent: Component, at: number) {
  const ch = parent.components();
  if (typeof ch.length !== 'number' || at < 0 || at >= ch.length) return;
  const one = typeof ch.at === 'function' ? ch.at(at) : undefined;
  if (one && !String(one.get('name') || '').trim()) {
    one.set('name', `Layer ${at + 1}`);
  }
}

/**
 * Insert a block at the drop position relative to existing top-level page blocks
 * (before/after the block under the pointer). `clientX` / `clientY` must be in the **frame document’s
 * viewport** (e.g. iframe’s `clientX`/`clientY` on a drop inside the canvas frame).
 */
export function insertBlockByIdAtFrameClientPoint(
  editor: Editor,
  blockId: string,
  frameDoc: Document,
  clientX: number,
  clientY: number,
): Component | undefined {
  const html = getBlockHtmlString(editor, blockId);
  if (!html) return undefined;
  const w = editor.getWrapper();
  if (!w) return undefined;

  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
    return insertBlockById(editor, blockId);
  }

  const wrapped = `<div class="wb-canvas-layer-group" ${WB_LAYER_GROUP_ATTR}="1">${html}</div>`;
  const coll = w.components();
  const total = typeof coll.length === 'number' ? coll.length : 0;

  const finishAppend = (): Component | undefined => {
    w.append(wrapped);
    nameLastAddedLayer(w);
    const c2 = w.components();
    const n = typeof c2.length === 'number' ? c2.length : 0;
    if (n > 0) {
      const last = typeof c2.at === 'function' ? c2.at(n - 1) : undefined;
      if (last) {
        try {
          editor.select(last);
        } catch {
          /* ignore */
        }
        return last;
      }
    }
    return undefined;
  };

  let hitEl: Element | null = null;
  try {
    hitEl = frameDoc.elementFromPoint(clientX, clientY) as Element | null;
  } catch {
    return insertBlockById(editor, blockId);
  }

  if (!hitEl) {
    return finishAppend();
  }

  const anchor = findDirectChildOfWrapper(editor, hitEl);
  if (!anchor) {
    return finishAppend();
  }

  const idx = Math.max(0, siblingIndex(anchor));
  const el = anchor.getEl?.() as HTMLElement | undefined;
  const rect = el?.getBoundingClientRect();
  const insertAfter = rect ? clientY > rect.top + rect.height * 0.5 : false;
  const at = Math.min(total, Math.max(0, insertAfter ? idx + 1 : idx));

  try {
    coll.add(wrapped, { at, action: 'add-component' } as { at: number; action: string });
  } catch {
    return finishAppend();
  }

  const inserted = typeof coll.at === 'function' ? coll.at(at) : undefined;
  if (inserted) {
    if (!String(inserted.get('name') || '').trim()) {
      nameInsertedLayerInParentAt(w, at);
    }
    try {
      editor.select(inserted);
    } catch {
      /* ignore */
    }
    return inserted;
  }
  return finishAppend();
}

/**
 * Palette / library inserts must not append into the previously inserted
 * `wb-canvas-layer-group` (Grapes auto-selects it), or every block nests and
 * layout + motion observers break (empty pricing, “Layer 2 / Layer 2 …”).
 */
function resolvePaletteInsertTarget(editor: Editor): Component | undefined {
  const wrap = editor.getWrapper();
  if (!wrap) return undefined;
  const sel = editor.getSelected();
  if (!sel || sel === wrap) return wrap;
  if (isWbLayerGroup(sel)) return wrap;
  return sel;
}

/** Add the block’s HTML to the current selection (or the page) without leaving the editor. */
export function insertBlockById(editor: Editor, blockId: string): Component | undefined {
  const html = getBlockHtmlString(editor, blockId);
  if (!html) return undefined;
  const target = resolvePaletteInsertTarget(editor);
  if (!target) return undefined;
  const wrapped = `<div class="wb-canvas-layer-group" ${WB_LAYER_GROUP_ATTR}="1">${html}</div>`;
  target.append(wrapped);
  nameLastAddedLayer(target);
  const coll = target.components();
  const len = typeof coll.length === 'number' ? coll.length : 0;
  if (len > 0) {
    const last = typeof coll.at === 'function' ? coll.at(len - 1) : undefined;
    if (last) {
      try {
        editor.select(last);
      } catch {
        /* ignore */
      }
      return last;
    }
  }
  return undefined;
}

/** Append every section for one design set (Navbar → Footer) in order. */
export function insertFullDesignSystemPage(editor: Editor, setId: DesignSystemSetId): void {
  for (const key of DESIGN_SYSTEM_SECTION_ORDER) {
    insertBlockById(editor, `wb-ds-${setId}-${key}`);
  }
}

export async function copyBlockHtmlToClipboard(editor: Editor, blockId: string): Promise<boolean> {
  const html = getBlockHtmlString(editor, blockId);
  if (!html) return false;
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(html);
    return true;
  } catch {
    return false;
  }
}

export function getCategoryLabelForFilter(f: ComponentLibraryFilter): string {
  return COMPONENT_LIBRARY_FILTERS.find((x) => x.id === f)?.label ?? f;
}
