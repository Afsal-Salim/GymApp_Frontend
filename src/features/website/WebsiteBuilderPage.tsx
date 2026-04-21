'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import grapesjs, { type Editor } from 'grapesjs';
import { Button, Card, Container, Spinner } from 'react-bootstrap';
import { PageContainer } from '../../components';
import 'grapesjs/dist/css/grapes.min.css';
import './WebsiteBuilderPage.css';
import { registerWebsiteBuilderExtensions } from './websiteBuilderBlocks';
import {
  persistVisualBuilderToCreate,
  persistVisualBuilderToEdit,
  resolveWebsiteBuilderInitialCanvas,
  type WebsiteBuilderResolvedLoad,
} from './websiteBuilderPersistence';

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

export default function WebsiteBuilderPage() {
  const searchParams = useSearchParams();
  const params = useParams<{ slug?: string | string[] }>();
  const editorHostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor | null>(null);

  const [resolving, setResolving] = useState(true);
  const [resolveErr, setResolveErr] = useState<string | null>(null);
  const [resolved, setResolved] = useState<WebsiteBuilderResolvedLoad | null>(null);

  const [booting, setBooting] = useState(false);
  const [pages, setPages] = useState<BuilderPageTab[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [exportBusy, setExportBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  const routeSlug = useMemo(() => {
    const raw = params.slug;
    if (typeof raw === 'string') return raw.trim();
    if (Array.isArray(raw) && raw[0]) return String(raw[0]).trim();
    return '';
  }, [params.slug]);

  const mode: 'create' | 'edit' = routeSlug ? 'edit' : 'create';
  const templateQuery = searchParams.get('template');

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
      width: 'auto',
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
      layerManager: { appendTo: '#wb-layers' },
      panels: { defaults: [] },
    });

    editorRef.current = editor;
    registerWebsiteBuilderExtensions(editor);

    if (resolved.kind === 'project') {
      editor.loadProjectData(resolved.project);
    } else {
      editor.setStyle(resolved.css);
      editor.setComponents(resolved.html);
    }

    editor.Panels.addPanel({
      id: 'toolbar-actions',
      el: '#wb-actions',
      buttons: [
        { id: 'undo', className: 'wb-toolbar-btn', label: 'Undo', command: 'core:undo' },
        { id: 'redo', className: 'wb-toolbar-btn', label: 'Redo', command: 'core:redo' },
        { id: 'preview', className: 'wb-toolbar-btn', label: 'Preview', command: 'core:preview' },
        { id: 'clear', className: 'wb-toolbar-btn', label: 'Clear', command: 'core:canvas-clear' },
      ],
    });

    editor.Commands.add('wb:add-div', {
      run(ed) {
        const sel = ed.getSelected();
        const target = sel || ed.getWrapper();
        if (!target) return;
        target.append('<div style="min-height:80px; padding:16px; border:1px dashed #94a3b8;">New div</div>');
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
    queueMicrotask(() => setBooting(false));

    return () => {
      setBooting(false);
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

  const exportCode = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    setExportBusy(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const payload = `<!-- HTML -->
${html}

/* CSS */
${css}`;
      await navigator.clipboard.writeText(payload);
      alert('Copied HTML/CSS to clipboard.');
    } finally {
      setExportBusy(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || !resolved) return;
    setSaveBusy(true);
    try {
      if (mode === 'edit' && routeSlug) {
        await persistVisualBuilderToEdit(routeSlug, editor, resolved.templateSeedKey);
        alert('Website draft saved.');
      } else {
        const ok = persistVisualBuilderToCreate(editor, resolved.templateSeedKey);
        alert(ok ? 'Draft saved to this browser (Crystal preview).' : 'Could not save draft to storage.');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaveBusy(false);
    }
  }, [mode, resolved, routeSlug]);

  const backHref = mode === 'edit' ? `/user/business/${encodeURIComponent(routeSlug)}/settings` : '/user/create-website/select-template';

  const headline = resolved?.displayLabel ?? 'Visual builder';

  return (
    <PageContainer>
      <main className="website-builder-page py-3">
        <Container fluid className="website-builder-page__container">
          <div className="website-builder-page__head mb-3">
            <div>
              <p className="text-muted small mb-1">Visual Builder · {mode === 'edit' ? 'Edit website' : 'Create website'}</p>
              <h1 className="h4 mb-1">{headline}</h1>
              <p className="text-muted small mb-0">
                Pro template HTML/CSS loads as the canvas when you pick a template. Drag blocks, edit Traits for links and motion, then save to your site or local preview draft.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link href={backHref} className="btn btn-outline-secondary btn-sm">
                Back
              </Link>
              <Button size="sm" variant="outline-primary" onClick={() => editorRef.current?.runCommand('wb:add-div')}>
                Add div
              </Button>
              <Button size="sm" variant="primary" onClick={() => editorRef.current?.runCommand('wb:new-page')}>
                Create next page
              </Button>
              <Button
                size="sm"
                variant="success"
                disabled={saveBusy || resolving || Boolean(resolveErr) || !resolved}
                onClick={() => void handleSave()}
              >
                {saveBusy ? 'Saving…' : mode === 'edit' ? 'Save to website' : 'Save draft locally'}
              </Button>
              <Button size="sm" variant="outline-success" disabled={exportBusy} onClick={() => void exportCode()}>
                {exportBusy ? 'Exporting…' : 'Copy HTML/CSS'}
              </Button>
            </div>
          </div>

          {resolveErr ?
            <div className="alert alert-danger" role="alert">
              {resolveErr}
            </div>
          : null}

          <div className="website-builder-page__grid">
            <section className="website-builder-page__canvas card shadow-sm border-0">
              <div id="wb-actions" className="website-builder-page__toolbar" />
              {resolving || (resolved !== null && booting) ?
                <div className="website-builder-page__loader">
                  <Spinner animation="border" />
                </div>
              : null}
              <div ref={editorHostRef} className="website-builder-page__editor" />
            </section>

            <aside className="website-builder-page__sidebar">
              <Card className="mb-3 border-0 shadow-sm">
                <Card.Header className="py-2 px-3"><strong className="small">Pages</strong></Card.Header>
                <Card.Body className="py-2 px-2">
                  {pages.length === 0 ? <p className="small text-muted mb-0">No pages yet.</p> : null}
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      className={`website-builder-page__page-btn${selectedPageId === page.id ? ' is-active' : ''}`}
                      onClick={() => switchPage(page.id)}
                    >
                      {page.name}
                    </button>
                  ))}
                </Card.Body>
              </Card>

              <Card className="mb-3 border-0 shadow-sm">
                <Card.Header className="py-2 px-3"><strong className="small">Sections Toolbox</strong></Card.Header>
                <Card.Body className="py-2 px-2"><div id="wb-blocks" /></Card.Body>
              </Card>

              <Card className="mb-3 border-0 shadow-sm">
                <Card.Header className="py-2 px-3"><strong className="small">Traits (links / motion)</strong></Card.Header>
                <Card.Body className="py-2 px-2"><div id="wb-traits" /></Card.Body>
              </Card>

              <Card className="mb-3 border-0 shadow-sm">
                <Card.Header className="py-2 px-3"><strong className="small">Styles</strong></Card.Header>
                <Card.Body className="py-2 px-2"><div id="wb-styles" /></Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="py-2 px-3"><strong className="small">Layers</strong></Card.Header>
                <Card.Body className="py-2 px-2"><div id="wb-layers" /></Card.Body>
              </Card>
            </aside>
          </div>
        </Container>
      </main>
    </PageContainer>
  );
}
