'use client';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from 'grapesjs';
import { useToast } from '../../contexts/ToastContext';
import {
  type ComponentLibraryFilter,
  type ComponentLibraryPreviewKind,
  applyDesignSystemSectionPreviewFit,
  applyLibraryPreviewFit,
  buildDesignSystemTemplatePreviewSrcDoc,
  WB_LIB_DS_SECTION_PREVIEW_WIDTH,
  buildComponentPreviewSrcDoc,
  buildScrollableComponentPreviewSrcDoc,
  COMPONENT_LIBRARY_FILTERS,
  copyBlockHtmlToClipboard,
  filterCatalog,
  getCategoryLabelForFilter,
  getComponentCatalog,
  insertBlockById,
  insertFullDesignSystemPage,
  setBlockDragTransferData,
} from './websiteBuilderComponentCatalog';
import { DESIGN_SYSTEM_SETS } from './websiteBuilderDesignSystemBlocks';
import {
  ICON_GRID_KIT_CATALOG_ENTRY,
  ICON_LIBRARY_SUBGROUP_FILTERS,
  type IconLibrarySubgroup,
  getIconLibraryItems,
  iconLibrarySvgMarkup,
} from './websiteBuilderIconBlocks';

type Props = {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  onAddSection: () => void;
  disabled: boolean;
  /** When the dialog opens, apply this filter (blocks scope) or design-systems list. */
  initialFilter?: ComponentLibraryFilter;
  initialScope?: 'blocks' | 'design-systems';
};

function PreviewMock({ kind }: { kind: ComponentLibraryPreviewKind }) {
  return (
    <div className={`wb-comp-lib__mock wb-comp-lib__mock--${kind}`} aria-hidden>
      {kind === 'action' ?
        <div className="wb-comp-lib__mock-inner">
          <span className="wb-comp-lib__mock-pill" />
        </div>
      : null}
      {kind === 'hero' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--hero">
          <span className="wb-comp-lib__mock-line wb-comp-lib__mock-line--lg" />
          <span className="wb-comp-lib__mock-line wb-comp-lib__mock-line--sm" />
        </div>
      : null}
      {kind === 'form' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--form">
          <span className="wb-comp-lib__mock-field" />
          <span className="wb-comp-lib__mock-field" />
          <span className="wb-comp-lib__mock-field wb-comp-lib__mock-field--ta" />
        </div>
      : null}
      {kind === 'nav' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--nav">
          <span className="wb-comp-lib__mock-dot" />
          <span className="wb-comp-lib__mock-line" />
        </div>
      : null}
      {kind === 'pricing' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--pricing">
          <span className="wb-comp-lib__mock-col" />
          <span className="wb-comp-lib__mock-col" />
          <span className="wb-comp-lib__mock-col" />
        </div>
      : null}
      {kind === 'content' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--content">
          <span className="wb-comp-lib__mock-line" />
          <span className="wb-comp-lib__mock-line" />
        </div>
      : null}
      {kind === 'footer' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--footer">
          <span className="wb-comp-lib__mock-line wb-comp-lib__mock-line--sm" />
        </div>
      : null}
      {kind === 'modal' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--modal">
          <span className="wb-comp-lib__mock-line" />
        </div>
      : null}
      {kind === 'trust' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--trust">
          <span className="wb-comp-lib__mock-stars" />
        </div>
      : null}
      {kind === 'embed' ?
        <div className="wb-comp-lib__mock-inner wb-comp-lib__mock-inner--embed">
          <span className="wb-comp-lib__mock-embed-frame" />
        </div>
      : null}
      {kind === 'default' ?
        <div className="wb-comp-lib__mock-inner">
          <span className="wb-comp-lib__mock-line" />
        </div>
      : null}
    </div>
  );
}

/** Live iframe preview of a Grapes block (shared with left-panel palette tiles). */
export function BlockPreview({
  editor,
  blockId,
  kind,
}: {
  editor: Editor | null;
  blockId: string;
  kind: ComponentLibraryPreviewKind;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const dsPreviewRoRef = useRef<ResizeObserver | null>(null);
  const isScrollableMode = blockId.startsWith('wb-ds-');
  const srcDoc = useMemo(() => {
    if (!editor) return '';
    return isScrollableMode ? buildScrollableComponentPreviewSrcDoc(editor, blockId) : buildComponentPreviewSrcDoc(editor, blockId);
  }, [editor, blockId, isScrollableMode]);

  const scheduleDefaultFit = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    applyLibraryPreviewFit(el);
    window.setTimeout(() => applyLibraryPreviewFit(el), 160);
  }, []);

  const handlePreviewFrameLoad = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    dsPreviewRoRef.current?.disconnect();
    dsPreviewRoRef.current = null;
    if (isScrollableMode) {
      applyDesignSystemSectionPreviewFit(el);
      const ro = new ResizeObserver(() => applyDesignSystemSectionPreviewFit(el));
      ro.observe(el);
      const root = el.contentDocument?.querySelector('.wb-lib-preview-root');
      if (root) ro.observe(root);
      dsPreviewRoRef.current = ro;
      return;
    }
    scheduleDefaultFit();
  }, [isScrollableMode, scheduleDefaultFit]);

  useEffect(() => {
    if (isScrollableMode) return;
    if (!srcDoc) return;
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => scheduleDefaultFit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [srcDoc, scheduleDefaultFit, isScrollableMode]);

  useEffect(
    () => () => {
      dsPreviewRoRef.current?.disconnect();
      dsPreviewRoRef.current = null;
    },
    [],
  );

  useEffect(() => {
    dsPreviewRoRef.current?.disconnect();
    dsPreviewRoRef.current = null;
  }, [srcDoc]);

  if (!srcDoc) return <PreviewMock kind={kind} />;
  return (
    <iframe
      ref={frameRef}
      title={`${blockId} preview`}
      className={`wb-comp-lib__preview-frame${isScrollableMode ? ' wb-comp-lib__preview-frame--scroll' : ''}`}
      srcDoc={srcDoc}
      loading="lazy"
      tabIndex={-1}
      aria-hidden
      onLoad={handlePreviewFrameLoad}
    />
  );
}

function DesignSystemTemplatePreview({
  editor,
  setId,
  label,
}: {
  editor: Editor | null;
  setId: (typeof DESIGN_SYSTEM_SETS)[number]['id'];
  label: string;
}) {
  const srcDoc = useMemo(() => {
    if (!editor) return '';
    return buildDesignSystemTemplatePreviewSrcDoc(editor, setId);
  }, [editor, setId]);

  if (!srcDoc) {
    return (
      <div className="wb-comp-lib__template-preview-fallback" aria-hidden>
        {label}
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

type DesignSystemSetId = (typeof DESIGN_SYSTEM_SETS)[number]['id'];

/** Full artboard preview (fixed width inside iframe, no scale-to-fit) — “actual page” library mode. */
function DesignSystemArtboardFullPreview({
  editor,
  setId,
  label,
  artboardWidthPx,
}: {
  editor: Editor | null;
  setId: DesignSystemSetId;
  label: string;
  artboardWidthPx: number;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const srcDoc = useMemo(() => {
    if (!editor) return '';
    return buildDesignSystemTemplatePreviewSrcDoc(editor, setId, { artboardWidthPx });
  }, [editor, setId, artboardWidthPx]);

  const fitHeight = useCallback(() => {
    const el = frameRef.current;
    const doc = el?.contentDocument;
    if (!doc) return;
    const h = Math.max(
      doc.documentElement?.scrollHeight ?? 0,
      doc.body?.scrollHeight ?? 0,
    );
    if (h > 0) el.style.height = `${Math.ceil(h + 8)}px`;
  }, []);

  useEffect(() => {
    fitHeight();
  }, [srcDoc, fitHeight]);

  if (!srcDoc) {
    return (
      <div className="wb-comp-lib__full-preview-fallback" role="status">
        {label}
      </div>
    );
  }

  return (
    <iframe
      ref={frameRef}
      title={`${label} — full page preview`}
      className="wb-comp-lib__full-preview-iframe"
      style={{ width: `${artboardWidthPx}px` }}
      srcDoc={srcDoc}
      onLoad={fitHeight}
      tabIndex={0}
    />
  );
}

export function WebsiteBuilderComponentsLibrary({
  editor,
  isOpen,
  onClose,
  onAddSection,
  disabled,
  initialFilter,
  initialScope,
}: Props) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ComponentLibraryFilter>('all');
  const [libraryScope, setLibraryScope] = useState<'blocks' | 'design-systems'>('blocks');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [iconSubgroup, setIconSubgroup] = useState<'all' | IconLibrarySubgroup>('all');
  const [fullPreview, setFullPreview] = useState<{ id: DesignSystemSetId; label: string } | null>(null);
  /** Design systems library: full-page packs (Max) vs single sections (Pro). */
  const [dsLibraryTab, setDsLibraryTab] = useState<'templates' | 'components'>('templates');

  useEffect(() => {
    if (!isOpen) return;
    if (initialScope === 'design-systems') {
      setLibraryScope('design-systems');
      setDsLibraryTab('templates');
    } else {
      setLibraryScope('blocks');
      if (initialFilter) setActiveFilter(initialFilter);
      else setActiveFilter('all');
    }
    setSearch('');
  }, [isOpen, initialFilter, initialScope]);

  useEffect(() => {
    if (activeFilter !== 'icons') setIconSubgroup('all');
  }, [activeFilter]);

  const catalog = useMemo(() => getComponentCatalog(), []);
  const isIconsLibraryView = libraryScope === 'blocks' && activeFilter === 'icons';

  const iconItemsFiltered = useMemo(() => {
    let rows = getIconLibraryItems();
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) => r.cardTitle.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q),
      );
    }
    if (iconSubgroup !== 'all') rows = rows.filter((r) => r.subgroup === iconSubgroup);
    return rows;
  }, [search, iconSubgroup]);

  const visible = useMemo(() => {
    if (libraryScope === 'design-systems') {
      return filterCatalog(catalog, 'design-systems', search);
    }
    if (activeFilter === 'icons') {
      const kit = catalog.find((it) => it.blockId === ICON_GRID_KIT_CATALOG_ENTRY.blockId);
      return kit ? [kit] : [];
    }
    const rows = filterCatalog(catalog, activeFilter, search);
    if (activeFilter === 'all') return rows.filter((it) => it.filter !== 'design-systems');
    return rows;
  }, [catalog, activeFilter, search, libraryScope]);

  const onInsert = useCallback(
    (blockId: string) => {
      if (!editor || disabled) {
        showToast('Open a page in the builder first.', 'warning');
        return;
      }
      const inserted = insertBlockById(editor, blockId);
      if (inserted) {
        showToast('Block added to the page.', 'success');
        queueMicrotask(() => {
          try {
            editor.select(inserted);
          } catch {
            /* ignore */
          }
        });
      } else {
        showToast('Could not add this block. Try again.', 'danger');
      }
    },
    [editor, disabled, showToast],
  );

  const onInsertFullTemplate = useCallback(
    (setId: (typeof DESIGN_SYSTEM_SETS)[number]['id']) => {
      if (!editor || disabled) {
        showToast('Open a page in the builder first.', 'warning');
        return;
      }
      try {
        insertFullDesignSystemPage(editor, setId);
        showToast('Full template added (9 sections).', 'success');
        try {
          editor.refresh();
        } catch {
          /* ignore */
        }
      } catch {
        showToast('Could not add template.', 'danger');
      }
    },
    [editor, disabled, showToast],
  );

  const onCopy = useCallback(
    async (blockId: string) => {
      if (!editor || disabled) {
        showToast('Builder is not ready.', 'warning');
        return;
      }
      setCopyingId(blockId);
      const ok = await copyBlockHtmlToClipboard(editor, blockId);
      setCopyingId(null);
      if (ok) showToast('HTML copied — paste it anywhere in the page or in code.', 'success');
      else showToast('Could not copy. Check browser permissions.', 'danger');
    },
    [editor, disabled, showToast],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (fullPreview) {
        e.preventDefault();
        setFullPreview(null);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, fullPreview]);

  useEffect(() => {
    if (!isOpen) setFullPreview(null);
  }, [isOpen]);

  const designSystemSetsFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return DESIGN_SYSTEM_SETS;
    return DESIGN_SYSTEM_SETS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [search]);

  if (!isOpen) return null;

  const kitEntry = catalog.find((it) => it.blockId === ICON_GRID_KIT_CATALOG_ENTRY.blockId) ?? ICON_GRID_KIT_CATALOG_ENTRY;

  return (
    <div
      className="wb-comp-lib"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wb-comp-lib-title"
    >
      <button type="button" className="wb-comp-lib__backdrop" aria-label="Close library" onClick={onClose} />
      <div
        className={`wb-comp-lib__panel${fullPreview ? ' wb-comp-lib__panel--full-preview' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {fullPreview ?
          <div className="wb-comp-lib__full-preview-wrap">
            <nav className="wb-comp-lib__full-preview-nav" aria-label="Template preview">
              <button type="button" className="wb-comp-lib__full-preview-back" onClick={() => setFullPreview(null)}>
                <ArrowBackOutlinedIcon fontSize="small" aria-hidden />
                Library
              </button>
              <span className="wb-comp-lib__full-preview-title">{fullPreview.label}</span>
              <span className="wb-comp-lib__full-preview-chip">
                {WB_LIB_DS_SECTION_PREVIEW_WIDTH}px artboard
              </span>
            </nav>
            <div className="wb-comp-lib__full-preview-viewport">
              <DesignSystemArtboardFullPreview
                editor={editor}
                setId={fullPreview.id}
                label={fullPreview.label}
                artboardWidthPx={WB_LIB_DS_SECTION_PREVIEW_WIDTH}
              />
            </div>
          </div>
        : <>
        <header className="wb-comp-lib__header">
          <div>
            <h2 id="wb-comp-lib-title" className="wb-comp-lib__title">
              Components library
            </h2>
            <p className="wb-comp-lib__subtitle">
              See live previews, then add blocks or copy HTML. Under <strong>Design systems</strong>, use{' '}
              <strong>Complete templates</strong> (Max) or <strong>Section components</strong> (Pro). Full-page{' '}
              <strong>Preview</strong> opens at real desktop width.
            </p>
          </div>
          <div className="wb-comp-lib__header-actions">
            {!isIconsLibraryView ?
              <div className="wb-comp-lib__view-toggle" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`wb-comp-lib__view-btn${viewMode === 'grid' ? ' is-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  title="Grid view"
                >
                  <GridViewOutlinedIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  className={`wb-comp-lib__view-btn${viewMode === 'list' ? ' is-active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  title="List view"
                >
                  <ViewListOutlinedIcon fontSize="small" />
                </button>
              </div>
            : null}
            <button type="button" className="wb-comp-lib__close" onClick={onClose} aria-label="Close">
              <CloseOutlinedIcon fontSize="small" />
            </button>
          </div>
        </header>

        <div className="wb-comp-lib__subnav" aria-label="Library mode">
          <div className="wb-comp-lib__scope wb-comp-lib__scope--subnav" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={libraryScope === 'blocks'}
              className={`wb-comp-lib__scope-btn${libraryScope === 'blocks' ? ' is-active' : ''}`}
              onClick={() => {
                setLibraryScope('blocks');
                setActiveFilter('all');
                setDsLibraryTab('templates');
              }}
            >
              Blocks
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={libraryScope === 'design-systems'}
              className={`wb-comp-lib__scope-btn${libraryScope === 'design-systems' ? ' is-active' : ''}`}
              onClick={() => {
                setLibraryScope('design-systems');
                setDsLibraryTab('templates');
              }}
            >
              <span className="wb-comp-lib__scope-inner">
                <span>Design systems</span>
                <span className="wb-ds-max-tag" aria-hidden>
                  Max
                </span>
                <WorkspacePremiumOutlinedIcon
                  className="wb-ds-max-crown wb-comp-lib__scope-crown"
                  fontSize="inherit"
                  aria-hidden
                />
              </span>
            </button>
          </div>
          <div className="wb-comp-lib__premium-strip">
            <WorkspacePremiumOutlinedIcon className="wb-comp-lib__premium-ico" fontSize="small" aria-hidden />
            <span>
              <strong>Tiers</strong> — Base (default site) · Pro (classic layouts + section blocks) · Max (full design-system
              page packs). Saving any paid template still requires an active Pro subscription.
            </span>
          </div>
        </div>

        <div className="wb-comp-lib__body">
          <aside className="wb-comp-lib__sidebar">
            {libraryScope === 'blocks' && activeFilter !== 'icons' ?
              <input
                type="search"
                className="wb-comp-lib__search"
                placeholder="Search components…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search components"
              />
            : null}
            <button
              type="button"
              className="wb-comp-lib__add-section"
              onClick={() => {
                onAddSection();
                showToast('New section block added. Select it in the tree or on the canvas.', 'success');
              }}
              disabled={disabled}
            >
              + Add section
            </button>
            <div className="wb-comp-lib__saved">
              <div className="wb-comp-lib__saved-title">Saved components</div>
              <p className="wb-comp-lib__saved-hint">Reusable blocks you save from the page will appear here in a future update.</p>
            </div>
            {libraryScope === 'design-systems' ?
              <p className="wb-comp-lib__side-hint">
                Complete templates vs single sections — pick a full set for a coherent page, or mix sections on purpose.
              </p>
            : null}
          </aside>

          <div className="wb-comp-lib__main">
            {isIconsLibraryView ?
              <>
                <div className="wb-comp-lib__icons-head">
                  <div className="wb-comp-lib__icons-head-text">
                    <h2 className="wb-comp-lib__icons-title">Icons</h2>
                    <p className="wb-comp-lib__icons-sub">
                      Choose from beautiful, customizable icons for your website.
                    </p>
                  </div>
                  <div className="wb-comp-lib__icons-search">
                    <SearchOutlinedIcon className="wb-comp-lib__icons-search-ico" fontSize="small" aria-hidden />
                    <input
                      type="search"
                      className="wb-comp-lib__icons-search-input"
                      placeholder="Search icons…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search icons"
                    />
                  </div>
                </div>
                <div className="wb-comp-lib__pills wb-comp-lib__pills--icon-subgroups" role="tablist" aria-label="Icon categories">
                  {ICON_LIBRARY_SUBGROUP_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="tab"
                      aria-selected={iconSubgroup === f.id}
                      className={`wb-comp-lib__pill${iconSubgroup === f.id ? ' is-active' : ''}`}
                      onClick={() => setIconSubgroup(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="wb-comp-lib__icon-kit-banner">
                  <div className="wb-comp-lib__icon-kit-banner-text">
                    <h3 className="wb-comp-lib__icon-kit-banner-title">{kitEntry.title}</h3>
                    <p className="wb-comp-lib__icon-kit-banner-desc">{kitEntry.description}</p>
                  </div>
                  <div className="wb-comp-lib__icon-kit-banner-actions">
                    <button
                      type="button"
                      className="wb-comp-lib__icon-kit-add"
                      disabled={disabled}
                      onClick={() => onInsert(kitEntry.blockId)}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="wb-comp-lib__icon-kit-copy"
                      disabled={disabled || copyingId === kitEntry.blockId}
                      onClick={() => void onCopy(kitEntry.blockId)}
                      aria-label="Copy all-in-one grid HTML"
                    >
                      <ContentCopyOutlinedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
                <ul className="wb-comp-lib__icon-tile-grid">
                  {iconItemsFiltered.length === 0 ?
                    <li className="wb-comp-lib__icon-tile-empty">No icons match your search.</li>
                  : iconItemsFiltered.map((it) => (
                      <li
                        key={it.blockId}
                        className="wb-comp-lib__icon-tile"
                        draggable={!disabled}
                        onDragStart={(e) => {
                          if (disabled) {
                            e.preventDefault();
                            return;
                          }
                          setBlockDragTransferData(e.dataTransfer, it.blockId);
                        }}
                      >
                        <div
                          className="wb-comp-lib__icon-tile-svg"
                          dangerouslySetInnerHTML={{ __html: iconLibrarySvgMarkup(it.svgInner) }}
                        />
                        <span className="wb-comp-lib__icon-tile-name">{it.cardTitle}</span>
                        <div className="wb-comp-lib__icon-tile-actions">
                          <button
                            type="button"
                            className="wb-comp-lib__icon-tile-add"
                            disabled={disabled}
                            onClick={() => onInsert(it.blockId)}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="wb-comp-lib__icon-tile-copy"
                            disabled={disabled || copyingId === it.blockId}
                            onClick={() => void onCopy(it.blockId)}
                            aria-label={`Copy ${it.cardTitle} HTML`}
                          >
                            <ContentCopyOutlinedIcon fontSize="inherit" />
                          </button>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </>
            : libraryScope === 'blocks' ?
              <div className="wb-comp-lib__pills" role="tablist" aria-label="Filter by type">
                {COMPONENT_LIBRARY_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === f.id}
                    className={`wb-comp-lib__pill${activeFilter === f.id ? ' is-active' : ''}`}
                    onClick={() => setActiveFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            :
              <>
                <div className="wb-comp-lib__ds-toolbar">
                  <div className="wb-comp-lib__ds-toolbar-search">
                    <SearchOutlinedIcon className="wb-comp-lib__ds-toolbar-search-ico" fontSize="small" aria-hidden />
                    <input
                      type="search"
                      className="wb-comp-lib__ds-toolbar-input"
                      placeholder="Search design systems…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search design systems"
                    />
                  </div>
                  <label className="wb-comp-lib__ds-sort">
                    <span className="wb-comp-lib__ds-sort-label">Sort by</span>
                    <select className="wb-comp-lib__ds-sort-select" defaultValue="popular" aria-label="Sort design systems">
                      <option value="popular">Popular</option>
                    </select>
                  </label>
                </div>
                <div className="wb-comp-lib__ds-subtabs" role="tablist" aria-label="Design systems library mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={dsLibraryTab === 'templates'}
                    className={`wb-comp-lib__ds-subtab${dsLibraryTab === 'templates' ? ' is-active' : ''}`}
                    onClick={() => setDsLibraryTab('templates')}
                  >
                    <span className="wb-comp-lib__ds-subtab-label">Complete templates</span>
                    <span className="wb-comp-lib__tier-pill wb-comp-lib__tier-pill--max" aria-hidden>
                      Max
                    </span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={dsLibraryTab === 'components'}
                    className={`wb-comp-lib__ds-subtab${dsLibraryTab === 'components' ? ' is-active' : ''}`}
                    onClick={() => setDsLibraryTab('components')}
                  >
                    <span className="wb-comp-lib__ds-subtab-label">Section components</span>
                    <span className="wb-comp-lib__tier-pill wb-comp-lib__tier-pill--pro" aria-hidden>
                      Pro
                    </span>
                  </button>
                </div>
                {dsLibraryTab === 'templates' ?
                  <p className="wb-comp-lib__filter-hint">
                    <strong>Max</strong> — one click adds all nine sections (navbar → footer) in a single design set. Use{' '}
                    <strong>Section components</strong> to add layers individually.
                  </p>
                : <p className="wb-comp-lib__filter-hint">
                    <strong>Pro</strong> — {visible.length} individual blocks (nav, hero, pricing, …). Drag or use{' '}
                    <strong>Add to page</strong>.
                  </p>}
              </>
            }

            {!isIconsLibraryView && libraryScope === 'blocks' && activeFilter !== 'all' ?
              <p className="wb-comp-lib__filter-hint">
                Showing <strong>{getCategoryLabelForFilter(activeFilter)}</strong> · {visible.length} blocks
              </p>
            : null}

            {!isIconsLibraryView ?
              <ul className={viewMode === 'grid' ? 'wb-comp-lib__grid' : 'wb-comp-lib__grid wb-comp-lib__grid--list'}>
              {libraryScope === 'design-systems' && dsLibraryTab === 'templates' ?
                <>
                  <li className="wb-comp-lib__ds-section-head" key="__ds-head-templates__">
                    <h3 className="wb-comp-lib__ds-section-title">Complete templates · Max</h3>
                    <p className="wb-comp-lib__template-sets-desc mb-0">
                      Navbar through footer in one style. <strong>Preview</strong> uses a {WB_LIB_DS_SECTION_PREVIEW_WIDTH}px
                      frame; <strong>Add</strong> drops all nine sections onto the canvas.
                    </p>
                  </li>
                  {designSystemSetsFiltered.length === 0 ?
                    <li className="wb-comp-lib__empty">No design systems match your search.</li>
                  : designSystemSetsFiltered.map((s) => (
                      <li key={s.id} className="wb-comp-lib__card wb-comp-lib__card--ds-template">
                        <div className="wb-comp-lib__card-visual wb-comp-lib__card-visual--ds">
                          <div className="wb-comp-lib__ds-max-badge" aria-hidden>
                            <span className="wb-ds-max-tag">Max</span>
                            <WorkspacePremiumOutlinedIcon className="wb-ds-max-crown" fontSize="inherit" />
                          </div>
                          <DesignSystemTemplatePreview editor={editor} setId={s.id} label={s.label} />
                        </div>
                        <div className="wb-comp-lib__card-body wb-comp-lib__card-body--ds">
                          <div className="wb-comp-lib__ds-card-head">
                            <span className="wb-comp-lib__ds-card-ico" aria-hidden />
                            <h3 className="wb-comp-lib__card-title">{s.label}</h3>
                          </div>
                          <p className="wb-comp-lib__card-meta">9 sections</p>
                          <div className="wb-comp-lib__ds-card-actions">
                            <button
                              type="button"
                              className="wb-comp-lib__ds-preview-link"
                              onClick={() => setFullPreview({ id: s.id, label: s.label })}
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              className="wb-comp-lib__btn wb-comp-lib__btn--primary wb-comp-lib__btn--ds-add"
                              disabled={disabled}
                              onClick={() => onInsertFullTemplate(s.id)}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  }
                </>
              : libraryScope === 'design-systems' && dsLibraryTab === 'components' ?
                <>
                  <li className="wb-comp-lib__ds-section-head" key="__ds-head-sections__">
                    <h3 className="wb-comp-lib__ds-section-title">Section components · Pro</h3>
                    <p className="wb-comp-lib__template-sets-desc mb-0">
                      Add one layer at a time (nav, hero, pricing, …). Match the Max template set above for a consistent page.
                    </p>
                  </li>
                  {visible.length === 0 ?
                    <li className="wb-comp-lib__empty">No components match your search. Try another word or clear filters.</li>
                  : visible.map((it) => (
                      <li
                        key={it.blockId}
                        className={`wb-comp-lib__card${it.filter === 'design-systems' ? ' wb-comp-lib__card--design-system' : ''}`}
                        draggable={!disabled}
                        onDragStart={(e) => {
                          if (disabled) {
                            e.preventDefault();
                            return;
                          }
                          setBlockDragTransferData(e.dataTransfer, it.blockId);
                        }}
                      >
                        <div className="wb-comp-lib__card-visual">
                          <span className="wb-comp-lib__card-tier-ribbon" aria-hidden>
                            Pro
                          </span>
                          <BlockPreview editor={editor} blockId={it.blockId} kind={it.preview} />
                        </div>
                        <div className="wb-comp-lib__card-body">
                          <h3 className="wb-comp-lib__card-title">{it.title}</h3>
                          <p className="wb-comp-lib__card-desc">{it.description}</p>
                          <div className="wb-comp-lib__card-actions">
                            <button
                              type="button"
                              className="wb-comp-lib__btn wb-comp-lib__btn--primary"
                              disabled={disabled}
                              onClick={() => onInsert(it.blockId)}
                            >
                              Add to page
                            </button>
                            <button
                              type="button"
                              className="wb-comp-lib__btn wb-comp-lib__btn--ghost"
                              disabled={disabled || copyingId === it.blockId}
                              onClick={() => void onCopy(it.blockId)}
                            >
                              <ContentCopyOutlinedIcon className="wb-comp-lib__copy-ico" fontSize="small" />
                              {copyingId === it.blockId ? 'Copying…' : 'Copy HTML'}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  }
                </>
              : libraryScope === 'blocks' ?
                visible.length === 0 ?
                  <li className="wb-comp-lib__empty">No components match your search. Try another word or clear filters.</li>
                : visible.map((it) => (
                    <li
                      key={it.blockId}
                      className={`wb-comp-lib__card${it.filter === 'design-systems' ? ' wb-comp-lib__card--design-system' : ''}`}
                      draggable={!disabled}
                      onDragStart={(e) => {
                        if (disabled) {
                          e.preventDefault();
                          return;
                        }
                        setBlockDragTransferData(e.dataTransfer, it.blockId);
                      }}
                    >
                      <div className="wb-comp-lib__card-visual">
                        <BlockPreview editor={editor} blockId={it.blockId} kind={it.preview} />
                      </div>
                      <div className="wb-comp-lib__card-body">
                        <h3 className="wb-comp-lib__card-title">{it.title}</h3>
                        <p className="wb-comp-lib__card-desc">{it.description}</p>
                        <div className="wb-comp-lib__card-actions">
                          <button
                            type="button"
                            className="wb-comp-lib__btn wb-comp-lib__btn--primary"
                            disabled={disabled}
                            onClick={() => onInsert(it.blockId)}
                          >
                            Add to page
                          </button>
                          <button
                            type="button"
                            className="wb-comp-lib__btn wb-comp-lib__btn--ghost"
                            disabled={disabled || copyingId === it.blockId}
                            onClick={() => void onCopy(it.blockId)}
                          >
                            <ContentCopyOutlinedIcon className="wb-comp-lib__copy-ico" fontSize="small" />
                            {copyingId === it.blockId ? 'Copying…' : 'Copy HTML'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
              : null}
              </ul>
            : null}
          </div>
        </div>
        </>
        }
      </div>
    </div>
  );
}
