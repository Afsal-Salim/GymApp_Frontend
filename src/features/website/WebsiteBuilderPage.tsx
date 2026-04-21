'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import grapesjs, { type Editor } from 'grapesjs';
import { Button, Container, Modal, Spinner } from 'react-bootstrap';
import { PageContainer } from '../../components';
import { crystalPreviewAbsoluteUrl } from '../../config/env';
import 'grapesjs/dist/css/grapes.min.css';
import './WebsiteBuilderPage.css';
import { registerWebsiteBuilderExtensions } from './websiteBuilderBlocks';
import {
  persistVisualBuilderToCreate,
  persistVisualBuilderToEdit,
  resolveWebsiteBuilderInitialCanvas,
  syncVisualBuilderDraftForPreviewTab,
  type WebsiteBuilderResolvedLoad,
} from './websiteBuilderPersistence';
import { attachSelectionListener, nameLastAddedLayer, type SelectionInfo } from './websiteBuilderInspector';
import { WebsiteBuilderLeftPanel, type LeftPanelTab } from './WebsiteBuilderLeftPanel';
import { WebsiteBuilderInspector, type InspectorTab } from './WebsiteBuilderInspector';

type BuilderPageTab = {
  id: string;
  name: string;
};

function syncPages(editor: Editor, setPages: (items: BuilderPageTab[]) => void, setSelected: (id: string) => void) {
  const readPages = () => {
    const pages = editor.Pages.getAll();
    const items = pages.map((page, idx) => {
      const id = String(page.get('id') ?? `page-${idx + 1}`);
      const name = String(page.get('name') ?? `Page ${idx + 1}`);
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
  const [previewBusy, setPreviewBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [inspectorSelection, setInspectorSelection] = useState<SelectionInfo | null>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [deviceMode, setDeviceMode] = useState<'Desktop' | 'Tablet' | 'Mobile portrait'>('Desktop');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement | null>(null);
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('pages');

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
      selectorManager: { componentFirst: true },
      width: '100%',
      height: '70vh',
      blockManager: { appendTo: '#wb-blocks' },
      traitManager: { appendTo: '#wb-traits' },
      styleManager: {
        appendTo: '#wb-styles',
        sectors: [
          { name: 'Dimension', open: false, buildProps: ['width', 'min-height', 'padding', 'margin'] },
          { name: 'Typography', open: false, buildProps: ['font-size', 'font-weight', 'color', 'line-height'] },
          { name: 'Background', open: false, buildProps: ['background', 'background-color'] },
          { name: 'Border', open: false, buildProps: ['border', 'border-radius', 'box-shadow'] },
          { name: 'Effects', open: false, buildProps: ['opacity', 'transition', 'transform'] },
        ],
      },
      panels: { defaults: [] },
    });

    editorRef.current = editor;
    setEditorInstance(editor);
    registerWebsiteBuilderExtensions(editor);

    const detachInspector = attachSelectionListener(editor, setInspectorSelection);

    if (resolved.kind === 'project') {
      editor.loadProjectData(resolved.project);
    } else {
      editor.setStyle(resolved.css);
      editor.setComponents(resolved.html);
    }

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
      detachInspector();
      setInspectorSelection(null);
      setEditorInstance(null);
      setBooting(false);
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
        name: String(page.get('name') ?? `Page ${idx + 1}`),
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
      const previewUrl = crystalPreviewAbsoluteUrl();
      const w = window.open(previewUrl, PREVIEW_WINDOW_NAME);
      if (w) {
        try {
          w.focus();
        } catch {
          /* cross-origin focus may fail */
        }
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not open preview.');
    } finally {
      setPreviewBusy(false);
    }
  }, [mode, resolved, routeSlug]);

  const backHref = mode === 'edit' ? `/user/business/${encodeURIComponent(routeSlug)}/settings` : '/user/create-website/select-template';
  const siteSettingsHref = mode === 'edit' ? `/user/business/${encodeURIComponent(routeSlug)}/settings` : '/user/create-website';
  const runCommand = useCallback((cmd: string) => {
    editorRef.current?.runCommand(cmd);
  }, []);
  const setDevice = useCallback((device: 'Desktop' | 'Tablet' | 'Mobile portrait') => {
    editorRef.current?.setDevice(device);
    setDeviceMode(device);
  }, []);

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
                className="website-builder-page__workbar-download"
                type="button"
                disabled={downloadBusy || resolving || Boolean(resolveErr) || !resolved}
                title="Download HTML file"
                onClick={() => handleDownloadHtml()}
              >
                <FileDownloadOutlinedIcon fontSize="small" className="website-builder-page__workbar-download-icon" aria-hidden />
                {downloadBusy ? 'Preparing…' : 'Download HTML'}
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
                className="website-builder-page__icon-btn website-builder-page__icon-btn--ghost"
                onClick={() => runCommand('core:undo')}
                aria-label="Undo"
              >
                <UndoOutlinedIcon fontSize="small" />
              </button>
              <button
                type="button"
                className="website-builder-page__icon-btn website-builder-page__icon-btn--ghost"
                onClick={() => runCommand('core:redo')}
                aria-label="Redo"
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
            </div>
          </div>

          <Modal show={leaveModalOpen} onHide={() => setLeaveModalOpen(false)} centered animation>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h5 mb-0">
                Unsaved changes
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-0">Your changes will be lost if you leave the builder now. Save your work, or discard and leave.</p>
            </Modal.Body>
            <Modal.Footer className="gap-2 flex-wrap">
              <Button variant="outline-secondary" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline-danger" onClick={() => discardAndLeave()}>
                Discard changes
              </Button>
              <Button variant="primary" disabled={saveBusy} onClick={() => void saveAndLeave()}>
                {saveBusy ? 'Saving…' : 'Save and leave'}
              </Button>
            </Modal.Footer>
          </Modal>

          <div className="website-builder-page__grid">
            <aside className="website-builder-page__sidebar website-builder-page__sidebar--pages">
              <WebsiteBuilderLeftPanel
                editor={editorInstance}
                tab={leftPanelTab}
                onTabChange={setLeftPanelTab}
                pages={pages}
                selectedPageId={selectedPageId}
                onSelectPage={switchPage}
                onNewPage={() => runCommand('wb:new-page')}
                onSiteSettings={() => requestNavigate(siteSettingsHref)}
                onPageRenamed={refreshPages}
              />
            </aside>

            <section className="website-builder-page__canvas card shadow-sm border-0">
              {resolving || (resolved !== null && booting) ?
                <div className="website-builder-page__loader">
                  <Spinner animation="border" />
                </div>
              : null}
              <div ref={editorHostRef} className="website-builder-page__editor" />
            </section>

            <aside className="website-builder-page__sidebar website-builder-page__sidebar--inspector">
              <WebsiteBuilderInspector
                editor={editorInstance}
                selection={inspectorSelection}
                tab={inspectorTab}
                onTabChange={setInspectorTab}
              />
            </aside>
          </div>
        </Container>
      </main>
    </PageContainer>
  );
}
