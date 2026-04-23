'use client';

import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { Component, Editor } from 'grapesjs';
import { BlockPreview } from './WebsiteBuilderComponentsLibrary';
import {
  buildDesignSystemTemplatePreviewSrcDoc,
  getComponentCatalog,
  insertBlockById,
  insertFullDesignSystemPage,
  setBlockDragTransferData,
  type ComponentLibraryPreviewKind,
  type ComponentsLibraryOpenTarget,
} from './websiteBuilderComponentCatalog';
import type { DesignSystemSetId } from './websiteBuilderDesignSystemBlocks';

export type LeftPanelTab = 'pages' | 'structure' | 'components';

type PageItem = { id: string; name: string };

type Props = {
  editor: Editor | null;
  tab: LeftPanelTab;
  onTabChange: (t: LeftPanelTab) => void;
  pages: PageItem[];
  selectedPageId: string;
  onSelectPage: (pageId: string) => void;
  onNewPage: () => void;
  onPageRenamed?: () => void;
  onAddSection: () => void;
  onOpenComponentsLibrary?: (target?: ComponentsLibraryOpenTarget) => void;
};

type PaletteAccent = 'blue' | 'green' | 'purple' | 'orange' | 'slate' | 'pink' | 'amber';

type PaletteCard = {
  id: string;
  title: string;
  titleLine2?: string;
  desc: string;
  blockId?: string;
  /** Full-page design system: live iframe preview (same srcDoc as components library). */
  designSystemSetId?: DesignSystemSetId;
  onInsert?: () => void;
  icon: ReactNode;
  accent?: PaletteAccent;
};

type PaletteSection = {
  id: string;
  title: string;
  subtitle?: string;
  headerIcon?: ReactNode;
  /** Opens the full library scoped/filtered to this category. */
  libraryTarget?: ComponentsLibraryOpenTarget;
  items: PaletteCard[];
};

function onPaletteTileKeyDown(e: KeyboardEvent, run: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    run();
  }
}

function PaletteDesignSystemTemplatePreview({
  editor,
  setId,
  label,
}: {
  editor: Editor;
  setId: DesignSystemSetId;
  label: string;
}) {
  const srcDoc = useMemo(() => buildDesignSystemTemplatePreviewSrcDoc(editor, setId), [editor, setId]);
  if (!srcDoc) {
    return (
      <div className="wb-palette-tile__preview-fallback" aria-hidden>
        <span className={`wb-palette-tile__fb-ico wb-palette-ico ${paletteAccentClass(undefined)}`}>
          <LayersOutlinedIcon fontSize="inherit" />
        </span>
        <span className="wb-palette-tile__fb-label">{label}</span>
      </div>
    );
  }
  return (
    <iframe
      title={`${label} full-page preview`}
      className="wb-comp-lib__template-preview-frame"
      srcDoc={srcDoc}
      loading="lazy"
      tabIndex={-1}
      aria-hidden
    />
  );
}

function paletteAccentClass(accent: PaletteAccent | undefined): string {
  switch (accent) {
    case 'green':
      return 'wb-palette-ico--green';
    case 'purple':
      return 'wb-palette-ico--purple';
    case 'orange':
      return 'wb-palette-ico--orange';
    case 'slate':
      return 'wb-palette-ico--slate';
    case 'pink':
      return 'wb-palette-ico--pink';
    case 'amber':
      return 'wb-palette-ico--amber';
    case 'blue':
    default:
      return 'wb-palette-ico--blue';
  }
}

function ComponentsPalette({
  editor,
  searchQuery,
  onSearchQueryChange,
  onAddSection,
  onOpenComponentsLibrary,
}: {
  editor: Editor;
  searchQuery: string;
  onSearchQueryChange: (next: string) => void;
  onAddSection: () => void;
  onOpenComponentsLibrary?: (target?: ComponentsLibraryOpenTarget) => void;
}) {
  const previewByBlockId = useMemo(() => {
    const m = new Map<string, ComponentLibraryPreviewKind>();
    for (const row of getComponentCatalog()) {
      m.set(row.blockId, row.preview);
    }
    return m;
  }, []);

  const quickAdd: PaletteCard[] = useMemo(
    () => [
      {
        id: 'qa-join',
        title: 'Join now',
        titleLine2: 'button',
        desc: 'Opens the join form popup on your live site.',
        blockId: 'wb-cta-join',
        accent: 'blue',
        icon: <PersonAddOutlinedIcon fontSize="inherit" />,
      },
      {
        id: 'qa-wa',
        title: 'WhatsApp',
        titleLine2: 'chat',
        desc: 'Adds a WhatsApp strip visitors can tap to chat.',
        blockId: 'wb-cta-whatsapp',
        accent: 'green',
        icon: <WhatsAppIcon fontSize="inherit" />,
      },
      {
        id: 'qa-form',
        title: 'Enquiry',
        titleLine2: 'form',
        desc: 'A simple contact form for messages.',
        blockId: 'wb-form-contact',
        accent: 'purple',
        icon: <AssignmentOutlinedIcon fontSize="inherit" />,
      },
      {
        id: 'qa-call',
        title: 'Call now',
        titleLine2: 'button',
        desc: 'A tap-to-call strip for your phone number.',
        blockId: 'wb-cta-call',
        accent: 'orange',
        icon: <CallOutlinedIcon fontSize="inherit" />,
      },
    ],
    [],
  );

  const sections: PaletteSection[] = useMemo(
    () => [
      {
        id: 'design-systems',
        title: 'Design systems',
        subtitle: '(FULL PAGE · 9 SECTIONS EACH)',
        headerIcon: <LayersOutlinedIcon className="wb-components-palette__section-lead-ico" fontSize="small" aria-hidden />,
        libraryTarget: { scope: 'design-systems' },
        items: [
          {
            id: 'ds-power',
            title: 'POWER',
            titleLine2: 'Insert full page',
            desc: 'Dark + red · Navbar through Footer',
            designSystemSetId: 'power',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'power');
            },
            accent: 'slate',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'ds-elite',
            title: 'ELITE',
            titleLine2: 'Insert full page',
            desc: 'Light + blue · Navbar through Footer',
            designSystemSetId: 'elite',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'elite');
            },
            accent: 'blue',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'ds-focus',
            title: 'FOCUS',
            titleLine2: 'Insert full page',
            desc: 'Dark + green · Navbar through Footer',
            designSystemSetId: 'focus',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'focus');
            },
            accent: 'green',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'ds-energy',
            title: 'ENERGY',
            titleLine2: 'Insert full page',
            desc: 'Light + orange · Navbar through Footer',
            designSystemSetId: 'energy',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'energy');
            },
            accent: 'orange',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'ds-prime',
            title: 'PRIME',
            titleLine2: 'Insert full page',
            desc: 'Dark + purple · Navbar through Footer',
            designSystemSetId: 'prime',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'prime');
            },
            accent: 'purple',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'ds-sporty',
            title: 'SPORTY',
            titleLine2: 'Insert full page',
            desc: 'Light + teal · Navbar through Footer',
            designSystemSetId: 'sporty',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'sporty');
            },
            accent: 'pink',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'ds-cyberfit',
            title: 'CYBERFIT',
            titleLine2: 'Insert full page',
            desc: 'Cyberpunk neon · Navbar through Footer',
            designSystemSetId: 'cyberfit',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'cyberfit');
            },
            accent: 'purple',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'ds-glassmorph',
            title: 'GLASSMORPH',
            titleLine2: 'Insert full page',
            desc: 'White + blue glass · Navbar through Footer',
            designSystemSetId: 'glassmorph',
            onInsert: () => {
              if (!editor) return;
              insertFullDesignSystemPage(editor, 'glassmorph');
            },
            accent: 'blue',
            icon: <LayersOutlinedIcon fontSize="inherit" />,
          },
        ],
      },
      {
        id: 'marketing',
        title: 'Marketing & leads',
        libraryTarget: { scope: 'blocks', filter: 'actions' },
        items: [
          {
            id: 'm-join',
            title: 'Join now button',
            desc: 'Opens signup popup',
            blockId: 'wb-cta-join',
            accent: 'blue',
            icon: <PersonAddOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'm-offer',
            title: 'Offer banner',
            desc: 'Highlight special offers',
            blockId: 'wb-offers-1',
            accent: 'green',
            icon: <LocalOfferOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'm-lead',
            title: 'Lead form',
            desc: 'Capture visitor details',
            blockId: 'wb-form-contact',
            accent: 'purple',
            icon: <AssignmentOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'm-brochure',
            title: 'Brochure download',
            desc: 'Download PDF brochure',
            blockId: 'wb-brochure-download',
            accent: 'pink',
            icon: <FileDownloadOutlinedIcon fontSize="inherit" />,
          },
        ],
      },
      {
        id: 'contact',
        title: 'Contact & enquiry',
        libraryTarget: { scope: 'blocks', filter: 'forms' },
        items: [
          {
            id: 'x-form',
            title: 'Enquiry form',
            desc: 'Collect enquiries from visitors',
            blockId: 'wb-form-contact',
            accent: 'green',
            icon: <AssignmentOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'x-quick',
            title: 'Quick enquiry',
            desc: 'Small popup form',
            blockId: 'wb-enquiry-card',
            accent: 'amber',
            icon: <ChatOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'x-map',
            title: 'Location map',
            desc: 'Show your gym location',
            blockId: 'wb-map-location',
            accent: 'pink',
            icon: <MapOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'x-call',
            title: 'Call now button',
            desc: 'Click to call your number',
            blockId: 'wb-cta-call',
            accent: 'blue',
            icon: <CallOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 'x-wa',
            title: 'WhatsApp chat',
            desc: 'Chat with customers',
            blockId: 'wb-cta-whatsapp',
            accent: 'green',
            icon: <WhatsAppIcon fontSize="inherit" />,
          },
          {
            id: 'x-email',
            title: 'Email button',
            desc: 'Open email client',
            blockId: 'wb-cta-email',
            accent: 'purple',
            icon: <MailOutlineOutlinedIcon fontSize="inherit" />,
          },
        ],
      },
      {
        id: 'sections',
        title: 'Sections',
        subtitle: '(READY-MADE BLOCKS)',
        headerIcon: <LayersOutlinedIcon className="wb-components-palette__section-lead-ico" fontSize="small" aria-hidden />,
        libraryTarget: { scope: 'blocks', filter: 'sections' },
        items: [
          {
            id: 's-hero',
            title: 'Hero section',
            desc: 'Eye-catching • intro section',
            blockId: 'wb-header-1',
            accent: 'blue',
            icon: <ViewColumnOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 's-about',
            title: 'About section',
            desc: 'Tell your story • trainers & ethos',
            blockId: 'wb-about-1',
            accent: 'slate',
            icon: <WidgetsOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 's-pricing',
            title: 'Pricing section',
            desc: 'Plans & tiers • memberships',
            blockId: 'wb-pricing-1',
            accent: 'purple',
            icon: <CropSquareOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 's-testimonials',
            title: 'Testimonials',
            desc: 'Reviews • trust & social proof',
            blockId: 'wb-testimonial-1',
            accent: 'orange',
            icon: <RateReviewOutlinedIcon fontSize="inherit" />,
          },
          {
            id: 's-gallery',
            title: 'Gallery',
            desc: 'Photos • facility & community',
            blockId: 'wb-coaches-2',
            accent: 'green',
            icon: <ImageOutlinedIcon fontSize="inherit" />,
          },
        ],
      },
    ],
    [onAddSection, editor],
  );

  const insertCard = (card: PaletteCard) => {
    if (card.onInsert) {
      card.onInsert();
      return;
    }
    if (!card.blockId) return;
    insertBlockById(editor, card.blockId);
  };

  const needle = searchQuery.trim().toLowerCase();
  const cardMatches = (card: PaletteCard) => {
    if (!needle) return true;
    return (
      card.title.toLowerCase().includes(needle) ||
      (card.titleLine2?.toLowerCase().includes(needle) ?? false) ||
      card.desc.toLowerCase().includes(needle) ||
      (card.blockId ? card.blockId.toLowerCase().includes(needle) : false) ||
      (card.designSystemSetId?.toLowerCase().includes(needle) ?? false)
    );
  };

  const quickFiltered = quickAdd.filter(cardMatches);
  const filteredSections = sections
    .map((sec) => ({ ...sec, items: sec.items.filter(cardMatches) }))
    .filter((sec) => sec.items.length > 0);

  return (
    <div className="wb-components-palette">
      {onOpenComponentsLibrary ?
        <div className="wb-components-palette__design-sets" role="region" aria-label="Design system blocks">
          <p className="wb-components-palette__design-sets-title">Full-page design sets</p>
          <p className="wb-components-palette__design-sets-copy">
            Use <strong>Design systems</strong> here for one-click full pages, or the <strong>live previews at the bottom</strong> to add single sections—<strong>View more</strong> opens the full library for that category.
          </p>
          <button
            type="button"
            className="wb-components-palette__design-sets-btn"
            onClick={() => onOpenComponentsLibrary?.({ scope: 'design-systems' })}
          >
            Open full library — Design systems
          </button>
        </div>
      : null}
      <div className="wb-components-palette__search-row">
        <input
          type="search"
          className="wb-components-palette__search"
          placeholder="Search or add something…"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          aria-label="Search or add something"
        />
        {onOpenComponentsLibrary ?
          <button
            type="button"
            className="wb-components-palette__search-action"
            aria-label="Open components library"
            title="Browse full library"
            onClick={() => onOpenComponentsLibrary?.()}
          >
            <TuneOutlinedIcon fontSize="small" />
          </button>
        : null}
      </div>

      <div className="wb-components-palette__hero">
        <button type="button" className="wb-components-palette__cta" onClick={onAddSection}>
          + Add section
        </button>
        <p className="wb-components-palette__hint">Drag or click to add to your page</p>
      </div>

      <section className="wb-components-palette__section">
        <div className="wb-components-palette__section-head">
          <h3 className="wb-components-palette__section-title">Quick add</h3>
        </div>
        <div className="wb-components-palette__quick-grid">
          {quickFiltered.map((c) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              className="wb-quick-card"
              data-accent={c.accent ?? 'blue'}
              draggable={Boolean(c.blockId && !c.onInsert)}
              onDragStart={(e) => {
                if (!c.blockId || c.onInsert) {
                  e.preventDefault();
                  return;
                }
                setBlockDragTransferData(e.dataTransfer, c.blockId);
              }}
              onClick={() => insertCard(c)}
              onKeyDown={(ev) => onPaletteTileKeyDown(ev, () => insertCard(c))}
              title={c.desc}
            >
              <span className={`wb-quick-card__ico wb-palette-ico ${paletteAccentClass(c.accent)}`} aria-hidden>
                {c.icon}
              </span>
              <span className="wb-quick-card__title">
                <span className="wb-quick-card__title-line">{c.title}</span>
                {c.titleLine2 ?
                  <span className="wb-quick-card__title-line">{c.titleLine2}</span>
                : null}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="wb-components-palette__canvas-hint" role="note">
        <div className="wb-components-palette__canvas-hint-inner">
          <span className="wb-components-palette__canvas-hint-ico" aria-hidden>
            <WidgetsOutlinedIcon fontSize="inherit" />
          </span>
          <div className="wb-components-palette__canvas-hint-copy">
            <p className="wb-components-palette__canvas-hint-line wb-components-palette__canvas-hint-line--primary">
              Click a live preview below to insert a block
            </p>
            <p className="wb-components-palette__canvas-hint-line wb-components-palette__canvas-hint-line--secondary">
              or use <strong>Add section</strong> / <strong>Library</strong> in the toolbar for more.
            </p>
          </div>
        </div>
      </div>

      <div className="wb-components-palette__iframe-stack" aria-label="Component previews">
        {filteredSections.map((sec) => (
          <section key={sec.id} className="wb-components-palette__section">
            <div className={`wb-components-palette__section-head${sec.subtitle || sec.headerIcon ? ' wb-components-palette__section-head--rich' : ''}`}>
              <div className="wb-components-palette__section-head-main">
                {sec.headerIcon ?
                  <span className="wb-components-palette__section-kicker" aria-hidden>
                    {sec.headerIcon}
                  </span>
                : null}
                <div className="wb-components-palette__section-titles">
                  <h3
                    className={`wb-components-palette__section-title${sec.id === 'design-systems' ? ' wb-components-palette__section-title--with-badges' : ''}`}
                  >
                    {sec.title}
                    {sec.id === 'design-systems' ?
                      <>
                        <span className="wb-ds-max-tag" aria-hidden>
                          Max
                        </span>
                        <WorkspacePremiumOutlinedIcon className="wb-ds-max-crown" fontSize="inherit" aria-hidden />
                      </>
                    : null}
                  </h3>
                  {sec.subtitle ?
                    <p className="wb-components-palette__section-subtitle">{sec.subtitle}</p>
                  : null}
                </div>
              </div>
              {sec.libraryTarget && onOpenComponentsLibrary ?
                <button
                  type="button"
                  className="wb-components-palette__view-all"
                  onClick={() => onOpenComponentsLibrary(sec.libraryTarget)}
                >
                  View more
                </button>
              : null}
            </div>
            <div className="wb-components-palette__preview-grid">
              {sec.items.map((c) => (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  className="wb-palette-tile"
                  draggable={Boolean(c.blockId && !c.onInsert)}
                  onDragStart={(e) => {
                    if (!c.blockId || c.onInsert) {
                      e.preventDefault();
                      return;
                    }
                    setBlockDragTransferData(e.dataTransfer, c.blockId);
                  }}
                  onClick={() => insertCard(c)}
                  onKeyDown={(ev) => onPaletteTileKeyDown(ev, () => insertCard(c))}
                  title={c.desc}
                >
                  <div className="wb-palette-tile__preview" aria-hidden>
                    {c.designSystemSetId ?
                      <PaletteDesignSystemTemplatePreview
                        editor={editor}
                        setId={c.designSystemSetId}
                        label={c.title}
                      />
                    : c.blockId ?
                      <BlockPreview
                        editor={editor}
                        blockId={c.blockId}
                        kind={previewByBlockId.get(c.blockId) ?? 'default'}
                      />
                    : (
                      <div className="wb-palette-tile__preview-fallback">
                        <span className={`wb-palette-tile__fb-ico wb-palette-ico ${paletteAccentClass(c.accent)}`}>
                          {c.icon}
                        </span>
                        <span className="wb-palette-tile__fb-label">{c.titleLine2 ?? c.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="wb-palette-tile__meta">
                    <span className="wb-palette-tile__title">{c.title}</span>
                    {c.titleLine2 && c.blockId ?
                      <span className="wb-palette-tile__subtitle">{c.titleLine2}</span>
                    : null}
                    <span className="wb-palette-tile__desc">{c.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const TAG_FRIENDLY: Record<string, string> = {
  section: 'Section',
  main: 'Main',
  article: 'Article',
  header: 'Header',
  footer: 'Footer',
  nav: 'Navigation',
  div: 'Container',
  span: 'Text',
  h1: 'Heading',
  h2: 'Heading',
  h3: 'Heading',
  h4: 'Heading',
  h5: 'Heading',
  h6: 'Heading',
  p: 'Text',
  a: 'Link',
  button: 'Button',
  img: 'Image',
  iframe: 'Embed',
  svg: 'Icon',
  path: 'Path',
  ul: 'List',
  ol: 'List',
  li: 'List item',
  form: 'Form',
  label: 'Label',
  input: 'Input',
  textarea: 'Text area',
  select: 'Select',
  strong: 'Bold',
  em: 'Italic',
};

function friendlyLabel(comp: Component): string {
  const n = comp.get('name');
  if (n && String(n).trim()) return String(n).trim();
  const tag = String(comp.get('tagName') || 'div').toLowerCase();
  return TAG_FRIENDLY[tag] ?? (tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : 'Element');
}

function typeIcon(tag: string) {
  const t = tag.toLowerCase();
  if (t === 'section' || t === 'header' || t === 'footer' || t === 'article' || t === 'main') {
    return <ViewColumnOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  }
  if (t === 'h1' || t === 'h2' || t === 'h3' || t === 'h4' || t === 'h5' || t === 'h6') {
    return <TitleOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  }
  if (t === 'p' || t === 'span' || t === 'label') {
    return <TextFieldsOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  }
  if (t === 'button') return <CropSquareOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  if (t === 'img') return <ImageOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  if (t === 'a') return <LinkOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  if (t === 'nav') return <MenuOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  if (t === 'svg' || t === 'path') return <WidgetsOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  if (t === 'div') return <CropSquareOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
  return <WidgetsOutlinedIcon className="website-builder-page__struct-icon" fontSize="inherit" />;
}

function isHidden(comp: Component): boolean {
  const d = (comp.getStyle?.() ?? {}) as Record<string, string>;
  return (d.display ?? '').toLowerCase() === 'none';
}

function isLayerLocked(comp: Component): boolean {
  return Boolean(comp.get('wbLayerLocked'));
}

function setLayerLocked(comp: Component, locked: boolean) {
  comp.set('wbLayerLocked', locked);
  comp.set({
    draggable: !locked,
    removable: !locked,
    copyable: !locked,
  });
}

function toggleVisibility(comp: Component) {
  if (isHidden(comp)) {
    comp.removeStyle('display');
  } else {
    comp.addStyle({ display: 'none' } as Record<string, string>);
  }
}

function moveComponentVertically(comp: Component, dir: -1 | 1) {
  const parent = comp.parent();
  if (!parent) return;
  const coll = parent.components();
  const idx =
    typeof (comp as unknown as { index?: () => number }).index === 'function' ?
      (comp as unknown as { index: () => number }).index()
    : 0;
  const len = typeof coll.length === 'number' ? coll.length : 0;
  const next = idx + dir;
  if (next < 0 || next >= len) return;
  const mover = comp as unknown as { move?: (p: Component, o: { at: number }) => void };
  if (typeof mover.move === 'function') {
    mover.move(parent, { at: next });
  }
}

function StructureRow({
  comp,
  depth,
  editor,
  treeTick,
  searchQuery,
  expanded,
  onToggleExpand,
  openMenuId,
  setOpenMenuId,
}: {
  comp: Component;
  depth: number;
  editor: Editor;
  treeTick: number;
  searchQuery: string;
  expanded: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const id = String(comp.getId?.() ?? '');
  const tag = String(comp.get('tagName') || 'div').toLowerCase();
  const display = friendlyLabel(comp);
  const selected = String(editor.getSelected()?.getId?.() ?? '') === id;
  const kids = comp.components();
  const nKids = typeof kids.length === 'number' ? kids.length : 0;
  const hasKids = nKids > 0;
  const isOpen = expanded[id] !== false;
  const hidden = isHidden(comp);
  const locked = isLayerLocked(comp);

  const q = searchQuery.trim().toLowerCase();
  const childVisible = useCallback(
    (child: Component) => {
      if (!q) return true;
      const walk = (c: Component): boolean => {
        if (friendlyLabel(c).toLowerCase().includes(q)) return true;
        const ch = c.components();
        const m = typeof ch.length === 'number' ? ch.length : 0;
        for (let i = 0; i < m; i++) {
          const x = ch.at(i);
          if (x && walk(x)) return true;
        }
        return false;
      };
      return walk(child);
    },
    [q],
  );

  const selfMatches = !q || display.toLowerCase().includes(q);
  const anyChildMatches =
    !q ?
      true
    : (() => {
        for (let i = 0; i < nKids; i++) {
          const ch = kids.at(i);
          if (ch && childVisible(ch)) return true;
        }
        return false;
      })();

  if (q && !selfMatches && !anyChildMatches) return null;

  return (
    <div className="website-builder-page__struct-branch">
      <div
        className={`website-builder-page__struct-row${selected ? ' is-selected' : ''}${hidden ? ' is-hidden-layer' : ''}`}
        style={{ paddingLeft: 4 + Math.min(depth, 12) * 12 }}
      >
          <button
            type="button"
            className="website-builder-page__struct-chevron"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            disabled={!hasKids}
            onClick={(e) => {
              e.stopPropagation();
              if (!hasKids) return;
              onToggleExpand(id);
            }}
          >
            {hasKids ?
              <ChevronRightIcon
                fontSize="inherit"
                className={`website-builder-page__struct-chevron-ic${isOpen ? ' is-open' : ''}`}
              />
            : <span className="website-builder-page__struct-chevron-spacer" />}
          </button>
          <span className="website-builder-page__struct-drag" title="Reorder (menu)">
            <DragIndicatorIcon fontSize="inherit" />
          </span>
          <span className="website-builder-page__struct-type-ic" aria-hidden>
            {typeIcon(tag)}
          </span>
          {editing ?
            <input
              className="website-builder-page__struct-rename"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                const t = draft.trim();
                if (t) comp.set('name', t);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
          : (
            <button
              type="button"
              className="website-builder-page__struct-label"
              onClick={() => editor.select(comp)}
              onDoubleClick={(e) => {
                e.preventDefault();
                setDraft(display);
                setEditing(true);
              }}
            >
              {display}
            </button>
          )}
          <div className="website-builder-page__struct-actions">
            <button
              type="button"
              className="website-builder-page__struct-action"
              title={hidden ? 'Show' : 'Hide'}
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(comp);
              }}
            >
              {hidden ?
                <VisibilityOffOutlinedIcon fontSize="inherit" />
              : <VisibilityOutlinedIcon fontSize="inherit" />}
            </button>
            <button
              type="button"
              className="website-builder-page__struct-action"
              title={locked ? 'Unlock' : 'Lock'}
              onClick={(e) => {
                e.stopPropagation();
                setLayerLocked(comp, !locked);
              }}
            >
              {locked ?
                <LockOutlinedIcon fontSize="inherit" />
              : <LockOpenOutlinedIcon fontSize="inherit" />}
            </button>
            <div className="website-builder-page__struct-more-wrap">
              <button
                type="button"
                className={`website-builder-page__struct-action${openMenuId === id ? ' is-open' : ''}`}
                title="More"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === id ? null : id);
                }}
              >
                <MoreHorizIcon fontSize="inherit" />
              </button>
              {openMenuId === id ?
                <ul
                  className="website-builder-page__struct-menu"
                  role="menu"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDraft(display);
                        setEditing(true);
                        setOpenMenuId(null);
                      }}
                    >
                      Rename
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        moveComponentVertically(comp, -1);
                        setOpenMenuId(null);
                      }}
                    >
                      Move up
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        moveComponentVertically(comp, 1);
                        setOpenMenuId(null);
                      }}
                    >
                      Move down
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        try {
                          const clone = comp.clone();
                          const p = comp.parent();
                          if (clone && p) p.append(clone);
                        } catch {
                          /* ignore */
                        }
                        setOpenMenuId(null);
                      }}
                    >
                      Duplicate
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      role="menuitem"
                      className="is-danger"
                      onClick={() => {
                        if (!locked && comp.get('removable') !== false) comp.remove();
                        setOpenMenuId(null);
                      }}
                    >
                      Delete
                    </button>
                  </li>
                </ul>
              : null}
            </div>
          </div>
      </div>
      {hasKids && isOpen ?
        Array.from({ length: nKids }, (_, i) => {
          const ch = kids.at(i);
          if (!ch || !childVisible(ch)) return null;
          return (
            <StructureRow
              key={`${String(ch.getId?.())}-${i}-${treeTick}`}
              comp={ch}
              depth={depth + 1}
              editor={editor}
              treeTick={treeTick}
              searchQuery={searchQuery}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
            />
          );
        })
      : null}
    </div>
  );
}

function StructurePanel({
  editor,
  treeTick,
  searchQuery,
}: {
  editor: Editor;
  treeTick: number;
  searchQuery: string;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const onToggleExpand = useCallback((cid: string) => {
    setExpanded((prev) => {
      const wasOpen = prev[cid] !== false;
      return { ...prev, [cid]: !wasOpen };
    });
  }, []);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const wrapper = editor.getWrapper();
  if (!wrapper) {
    return <p className="website-builder-page__left-empty">Loading…</p>;
  }
  const kids = wrapper.components();
  const n = typeof kids.length === 'number' ? kids.length : 0;
  if (n === 0) {
    return <p className="website-builder-page__left-empty">No elements on this page yet.</p>;
  }

  return (
    <div className="website-builder-page__struct-tree">
      {Array.from({ length: n }, (_, i) => {
        const ch = kids.at(i);
        if (!ch) return null;
        return (
          <StructureRow
            key={`${String(ch.getId?.())}-${treeTick}-${i}`}
            comp={ch}
            depth={0}
            editor={editor}
            treeTick={treeTick}
            searchQuery={searchQuery}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        );
      })}
    </div>
  );
}

function StructureBreadcrumb({ editor, tick }: { editor: Editor | null; tick: number }) {
  const trail = useMemo(() => {
    if (!editor) return [] as { id: string; label: string }[];
    const sel = editor.getSelected();
    if (!sel) return [];
    const wrapper = editor.getWrapper();
    const parts: { id: string; label: string }[] = [];
    let c: Component | undefined = sel;
    while (c && c !== wrapper) {
      parts.unshift({ id: String(c.getId?.() ?? ''), label: friendlyLabel(c) });
      c = c.parent() ?? undefined;
    }
    return [{ id: 'home', label: 'Page' }, ...parts];
  }, [editor, tick]);

  if (trail.length <= 1) return null;

  return (
    <nav className="website-builder-page__struct-crumb" aria-label="Selection path">
      {trail.map((p, i) => (
        <span key={`${p.id}-${i}`} className="website-builder-page__struct-crumb-part">
          {i > 0 ?
            <span className="website-builder-page__struct-crumb-sep" aria-hidden>
              /
            </span>
          : null}
          <span className={i === trail.length - 1 ? 'is-current' : undefined}>{p.label}</span>
        </span>
      ))}
    </nav>
  );
}

export function WebsiteBuilderLeftPanel({
  editor,
  tab,
  onTabChange,
  pages,
  selectedPageId,
  onSelectPage,
  onNewPage,
  onPageRenamed,
  onAddSection,
  onOpenComponentsLibrary,
}: Props) {
  const [treeTick, setTreeTick] = useState(0);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageNameDraft, setPageNameDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!editor) return;
    const bump = () => setTreeTick((t) => t + 1);
    editor.on('component:add', bump);
    editor.on('component:remove', bump);
    editor.on('component:update', bump);
    editor.on('component:selected', bump);
    editor.on('page:select', bump);
    return () => {
      editor.off('component:add', bump);
      editor.off('component:remove', bump);
      editor.off('component:update', bump);
      editor.off('component:selected', bump);
      editor.off('page:select', bump);
    };
  }, [editor]);

  const savePageName = useCallback(() => {
    if (!editor || !editingPageId) return;
    const p = editor.Pages.get(editingPageId);
    if (p) p.set('name', pageNameDraft.trim() || 'Untitled');
    setEditingPageId(null);
    onPageRenamed?.();
  }, [editor, editingPageId, pageNameDraft, onPageRenamed]);

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.name.toLowerCase().includes(q));
  }, [pages, searchQuery]);

  const searchPlaceholder =
    tab === 'pages' ? 'Search pages…'
    : tab === 'structure' ? 'Search layers…'
    : 'Search or add something…';

  return (
    <div className="website-builder-page__left-shell">
      <div className="website-builder-page__left-tabs">
        <button
          type="button"
          className={`website-builder-page__left-tab${tab === 'pages' ? ' is-active' : ''}`}
          onClick={() => onTabChange('pages')}
        >
          <DescriptionOutlinedIcon className="website-builder-page__left-tab-icon" fontSize="small" />
          <span>Pages</span>
        </button>
        <button
          type="button"
          className={`website-builder-page__left-tab${tab === 'structure' ? ' is-active' : ''}`}
          onClick={() => onTabChange('structure')}
        >
          <LayersOutlinedIcon className="website-builder-page__left-tab-icon" fontSize="small" />
          <span>Structure</span>
        </button>
        <button
          type="button"
          className={`website-builder-page__left-tab${tab === 'components' ? ' is-active' : ''}`}
          onClick={() => onTabChange('components')}
        >
          <BoltOutlinedIcon className="website-builder-page__left-tab-icon" fontSize="small" />
          <span>Components</span>
        </button>
      </div>

      {tab !== 'components' || !editor ?
        <div className="website-builder-page__left-toolbar">
          <input
            type="search"
            className="website-builder-page__left-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={searchPlaceholder}
          />
          {tab === 'structure' ?
            <button type="button" className="website-builder-page__left-add-section" onClick={onAddSection}>
              + Add section
            </button>
          : null}
        </div>
      : null}

      <div className="website-builder-page__left-main">
        <div className="website-builder-page__left-panel-body">
          {tab === 'pages' ?
            <div className="website-builder-page__pages-list">
              {filteredPages.length === 0 ?
                <p className="website-builder-page__left-empty">No matching pages.</p>
              : filteredPages.map((page) => (
                  <div key={page.id} className="website-builder-page__page-row">
                    {editingPageId === page.id ?
                      <input
                        className="website-builder-page__page-rename"
                        value={pageNameDraft}
                        autoFocus
                        onChange={(e) => setPageNameDraft(e.target.value)}
                        onBlur={savePageName}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePageName();
                          if (e.key === 'Escape') setEditingPageId(null);
                        }}
                      />
                    : (
                      <button
                        type="button"
                        className={`website-builder-page__page-btn${selectedPageId === page.id ? ' is-active' : ''}`}
                        onClick={() => onSelectPage(page.id)}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          setPageNameDraft(page.name);
                          setEditingPageId(page.id);
                        }}
                      >
                        {page.name}
                      </button>
                    )}
                  </div>
                ))
              }
              <button type="button" className="website-builder-page__left-add-page" onClick={onNewPage}>
                + New page
              </button>
            </div>
          : tab === 'structure' ?
            <>
              <StructureBreadcrumb editor={editor} tick={treeTick} />
              {editor ?
                <StructurePanel editor={editor} treeTick={treeTick} searchQuery={searchQuery} />
              : <p className="website-builder-page__left-empty">Open the builder to see structure.</p>}
            </>
          : editor ?
            <ComponentsPalette
              editor={editor}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onAddSection={onAddSection}
              onOpenComponentsLibrary={onOpenComponentsLibrary}
            />
          : <p className="website-builder-page__left-empty">Open the builder to add components.</p>}
        </div>
      </div>
    </div>
  );
}
