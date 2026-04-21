'use client';

import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useCallback, useEffect, useState } from 'react';
import type { Component, Editor } from 'grapesjs';

export type LeftPanelTab = 'pages' | 'layers' | 'components';

type PageItem = { id: string; name: string };

type Props = {
  editor: Editor | null;
  tab: LeftPanelTab;
  onTabChange: (t: LeftPanelTab) => void;
  pages: PageItem[];
  selectedPageId: string;
  onSelectPage: (pageId: string) => void;
  onNewPage: () => void;
  onSiteSettings: () => void;
  onPageRenamed?: () => void;
};

function getDisplayName(comp: Component): string {
  const n = comp.get('name');
  if (n && String(n).trim()) return String(n).trim();
  const tag = String(comp.get('tagName') || 'div').toLowerCase();
  return tag;
}

function LayerRow({
  comp,
  depth,
  editor,
  treeTick,
}: {
  comp: Component;
  depth: number;
  editor: Editor;
  treeTick: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const display = getDisplayName(comp);
  const id = String(comp.getId?.() ?? '');

  const onSaveName = useCallback(() => {
    const t = draft.trim();
    if (t) comp.set('name', t);
    setEditing(false);
  }, [comp, draft]);

  const kids = comp.components();
  const n = typeof kids.length === 'number' ? kids.length : 0;

  return (
    <div className="website-builder-page__layer-branch">
      <div
        className="website-builder-page__layer-row"
        style={{ paddingLeft: Math.min(depth * 10, 80) }}
      >
        {editing ?
          <input
            className="website-builder-page__layer-rename"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={onSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        : (
          <button
            type="button"
            className="website-builder-page__layer-name"
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
      </div>
      {n > 0 ?
        Array.from({ length: n }, (_, i) => {
          const ch = kids.at(i);
          if (!ch) return null;
          return (
            <LayerRow
              key={`${id}-${i}-${treeTick}`}
              comp={ch}
              depth={depth + 1}
              editor={editor}
              treeTick={treeTick}
            />
          );
        })
      : null}
    </div>
  );
}

function LayersPanel({ editor, treeTick }: { editor: Editor; treeTick: number }) {
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
    <div className="website-builder-page__layers-tree">
      {Array.from({ length: n }, (_, i) => {
        const ch = kids.at(i);
        if (!ch) return null;
        return <LayerRow key={`${String(ch.getId?.())}-${treeTick}`} comp={ch} depth={0} editor={editor} treeTick={treeTick} />;
      })}
    </div>
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
  onSiteSettings,
  onPageRenamed,
}: Props) {
  const [treeTick, setTreeTick] = useState(0);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageNameDraft, setPageNameDraft] = useState('');

  useEffect(() => {
    if (!editor) return;
    const bump = () => setTreeTick((t) => t + 1);
    editor.on('component:add', bump);
    editor.on('component:remove', bump);
    editor.on('component:update', bump);
    editor.on('page:select', bump);
    return () => {
      editor.off('component:add', bump);
      editor.off('component:remove', bump);
      editor.off('component:update', bump);
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

  return (
    <>
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
          className={`website-builder-page__left-tab${tab === 'layers' ? ' is-active' : ''}`}
          onClick={() => onTabChange('layers')}
        >
          <LayersOutlinedIcon className="website-builder-page__left-tab-icon" fontSize="small" />
          <span>Layers</span>
        </button>
        <button
          type="button"
          className={`website-builder-page__left-tab${tab === 'components' ? ' is-active' : ''}`}
          onClick={() => onTabChange('components')}
        >
          <ViewModuleOutlinedIcon className="website-builder-page__left-tab-icon" fontSize="small" />
          <span>Components</span>
        </button>
      </div>

      <div className="website-builder-page__left-main">
        <div className="website-builder-page__left-panel-body website-builder-page__panel-body-scroll">
        {tab === 'pages' ?
          <div className="website-builder-page__pages-list">
            {pages.length === 0 ?
              <p className="website-builder-page__left-empty">No pages yet.</p>
            : pages.map((page) => (
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
        : tab === 'layers' ?
          editor ?
            <LayersPanel editor={editor} treeTick={treeTick} />
          : <p className="website-builder-page__left-empty">Open the builder to see layers.</p>
        :
          <p className="website-builder-page__field-hint website-builder-page__blocks-hint">Drag a block into the canvas.</p>
        }
        </div>

        {/* Block manager mount — always in DOM for GrapesJS */}
        <div
          className={`website-builder-page__blocks-anchor${tab === 'components' ? ' is-visible' : ' is-offscreen'}`}
          aria-hidden={tab !== 'components'}
        >
          <div id="wb-blocks" className="website-builder-page__blocks-mount-inner" />
        </div>
      </div>

      <button type="button" className="website-builder-page__site-settings-btn" onClick={onSiteSettings}>
        Site settings
      </button>
    </>
  );
}
