'use client';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from 'grapesjs';
import { useToast } from '../../contexts/ToastContext';
import {
  type ComponentLibraryFilter,
  type ComponentLibraryPreviewKind,
  applyLibraryPreviewFit,
  buildComponentPreviewSrcDoc,
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
  const srcDoc = useMemo(() => {
    if (!editor) return '';
    return buildComponentPreviewSrcDoc(editor, blockId);
  }, [editor, blockId]);

  const scheduleFit = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    applyLibraryPreviewFit(el);
    window.setTimeout(() => applyLibraryPreviewFit(el), 160);
  }, []);

  useEffect(() => {
    if (!srcDoc) return;
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => scheduleFit());
    ro.observe(el);
    return () => ro.disconnect();
  }, [srcDoc, scheduleFit]);

  if (!srcDoc) return <PreviewMock kind={kind} />;
  return (
    <iframe
      ref={frameRef}
      title={`${blockId} preview`}
      className="wb-comp-lib__preview-frame"
      srcDoc={srcDoc}
      loading="lazy"
      tabIndex={-1}
      aria-hidden
      onLoad={scheduleFit}
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

  useEffect(() => {
    if (!isOpen) return;
    if (initialScope === 'design-systems') {
      setLibraryScope('design-systems');
    } else {
      setLibraryScope('blocks');
      if (initialFilter) setActiveFilter(initialFilter);
      else setActiveFilter('all');
    }
    setSearch('');
  }, [isOpen, initialFilter, initialScope]);

  const catalog = useMemo(() => getComponentCatalog(), []);
  const visible = useMemo(() => {
    if (libraryScope === 'design-systems') {
      return filterCatalog(catalog, 'design-systems', search);
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
      const ok = insertBlockById(editor, blockId);
      if (ok) {
        showToast('Block added to the page.', 'success');
        try {
          editor.refresh();
        } catch {
          /* ignore */
        }
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
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="wb-comp-lib"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wb-comp-lib-title"
    >
      <button type="button" className="wb-comp-lib__backdrop" aria-label="Close library" onClick={onClose} />
      <div className="wb-comp-lib__panel" onClick={(e) => e.stopPropagation()}>
        <header className="wb-comp-lib__header">
          <div>
            <h2 id="wb-comp-lib-title" className="wb-comp-lib__title">
              Components library
            </h2>
            <p className="wb-comp-lib__subtitle">
              See live previews, then add blocks or copy HTML. Use the left <strong>Components</strong> tab—live iframe previews at the bottom—or <strong>Library</strong> in the toolbar for the full catalog.
            </p>
          </div>
          <div className="wb-comp-lib__header-actions">
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
            <button type="button" className="wb-comp-lib__close" onClick={onClose} aria-label="Close">
              <CloseOutlinedIcon fontSize="small" />
            </button>
          </div>
        </header>

        <div className="wb-comp-lib__body">
          <aside className="wb-comp-lib__sidebar">
            <div className="wb-comp-lib__scope" role="tablist" aria-label="Library scope">
              <button
                type="button"
                role="tab"
                aria-selected={libraryScope === 'blocks'}
                className={`wb-comp-lib__scope-btn${libraryScope === 'blocks' ? ' is-active' : ''}`}
                onClick={() => {
                  setLibraryScope('blocks');
                  setActiveFilter('all');
                }}
              >
                Blocks
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={libraryScope === 'design-systems'}
                className={`wb-comp-lib__scope-btn${libraryScope === 'design-systems' ? ' is-active' : ''}`}
                onClick={() => setLibraryScope('design-systems')}
              >
                Design systems
              </button>
            </div>
            <input
              type="search"
              className="wb-comp-lib__search"
              placeholder="Search components…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search components"
            />
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
            {libraryScope === 'blocks' ?
              <nav className="wb-comp-lib__side-nav" aria-label="Quick categories">
                {COMPONENT_LIBRARY_FILTERS.filter((f) => f.id !== 'all').map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`wb-comp-lib__side-link${activeFilter === f.id ? ' is-active' : ''}`}
                    onClick={() => setActiveFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </nav>
            :
              <p className="wb-comp-lib__side-hint">Six full visual systems (nav → footer). Mix only if you mean to.</p>
            }
          </aside>

          <div className="wb-comp-lib__main">
            {libraryScope === 'blocks' ?
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
              <p className="wb-comp-lib__filter-hint">
                <strong>Design systems</strong> · {visible.length} sections below · full pages above
              </p>
            }

            {libraryScope === 'design-systems' ?
              <div className="wb-comp-lib__template-sets" aria-label="Insert full template sets">
                <p className="wb-comp-lib__template-sets-label">Insert a complete landing page</p>
                <p className="wb-comp-lib__template-sets-desc">
                  Adds all nine blocks in order (Navbar → Footer) for one visual system. Use the cards below for individual sections.
                </p>
                <div className="wb-comp-lib__template-sets-grid">
                  {DESIGN_SYSTEM_SETS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="wb-comp-lib__template-set-btn"
                      disabled={disabled}
                      onClick={() => onInsertFullTemplate(s.id)}
                    >
                      <span className="wb-comp-lib__template-set-name">{s.label}</span>
                      <span className="wb-comp-lib__template-set-meta">9 sections</span>
                    </button>
                  ))}
                </div>
              </div>
            : null}

            {libraryScope === 'blocks' && activeFilter !== 'all' ?
              <p className="wb-comp-lib__filter-hint">
                Showing <strong>{getCategoryLabelForFilter(activeFilter)}</strong> · {visible.length} blocks
              </p>
            : null}

            {libraryScope === 'blocks' ?
              <div className="wb-comp-lib__template-sets wb-comp-lib__template-sets--compact" aria-label="Insert full template sets">
                <p className="wb-comp-lib__template-sets-label">Full-page design templates</p>
                <div className="wb-comp-lib__template-sets-grid">
                  {DESIGN_SYSTEM_SETS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="wb-comp-lib__template-set-btn"
                      disabled={disabled}
                      onClick={() => onInsertFullTemplate(s.id)}
                    >
                      <span className="wb-comp-lib__template-set-name">{s.label}</span>
                      <span className="wb-comp-lib__template-set-meta">9 sections</span>
                    </button>
                  ))}
                </div>
              </div>
            : null}

            <ul className={viewMode === 'grid' ? 'wb-comp-lib__grid' : 'wb-comp-lib__grid wb-comp-lib__grid--list'}>
              {visible.length === 0 ?
                <li className="wb-comp-lib__empty">No components match your search. Try another word or clear filters.</li>
              : visible.map((it) => (
                  <li
                    key={it.blockId}
                    className="wb-comp-lib__card"
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
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
