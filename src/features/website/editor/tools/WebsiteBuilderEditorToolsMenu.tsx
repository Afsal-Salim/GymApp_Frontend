'use client';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from 'grapesjs';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import {
  listBusinessImages,
  resolveBusinessImageDisplayUrl,
  uploadBusinessImage,
  type BusinessUploadedImage,
} from '@/api/businessImages';
import {
  alignSelectedCenter,
  applyBrandKitToCanvas,
  applySectionSpacingPreset,
  duplicateCurrentPage,
  duplicateSelectedComponent,
  findReplaceOnCurrentPage,
  insertBusinessSnippet,
  loadBrandKit,
  saveBrandKit,
  scanLinksOnCurrentPage,
  type BrandKit,
} from '@/features/website/editor/tools/websiteBuilderEditorTools';
import { BUSINESS_SNIPPET_IDS, BUSINESS_SNIPPET_LABELS } from '@/features/website/editor/tools/websiteBuilderBusinessSnippets';
import { compressImageFileForWebsiteUpload } from '@/features/website/editor/tools/websiteBuilderCompressImage';

type Props = {
  editor: Editor | null;
  disabled: boolean;
  /** Gym slug for image library + brand kit (edit mode or preview slug). */
  businessSlug: string;
  /** `workbar` = trigger + dropdown; `leftPanel` = full scrollable list in the left column */
  variant?: 'workbar' | 'leftPanel';
};

const FONT_PRESETS: { label: string; value: string }[] = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Poppins', value: 'Poppins, system-ui, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
];

export function WebsiteBuilderEditorToolsMenu({
  editor,
  disabled,
  businessSlug,
  variant = 'workbar',
}: Props) {
  const workbar = variant === 'workbar';
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [findOpen, setFindOpen] = useState(false);
  const [findQ, setFindQ] = useState('');
  const [findR, setFindR] = useState('');

  const [linksOpen, setLinksOpen] = useState(false);
  const [linkIssues, setLinkIssues] = useState<ReturnType<typeof scanLinksOnCurrentPage>>([]);

  const [brandOpen, setBrandOpen] = useState(false);
  const [brandPrimary, setBrandPrimary] = useState('#2563eb');
  const [brandFont, setBrandFont] = useState(FONT_PRESETS[0]!.value);

  const [imgOpen, setImgOpen] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgList, setImgList] = useState<BusinessUploadedImage[]>([]);
  const [imgSlots, setImgSlots] = useState<{ used: number; limit: number }>({ used: 0, limit: 5 });
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    if (!workbar) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [workbar]);

  useEffect(() => {
    if (!brandOpen || !businessSlug.trim()) return;
    const k = loadBrandKit(businessSlug);
    if (k) {
      setBrandPrimary(k.primary);
      setBrandFont(k.fontStack);
    }
  }, [brandOpen, businessSlug]);

  const slugOk = Boolean(businessSlug.trim());

  const runFind = useCallback(() => {
    if (!editor) return;
    const n = findReplaceOnCurrentPage(editor, findQ, findR);
    setToast(n ? `Replaced in ${n} place(s).` : 'No matches.');
    setFindOpen(false);
    if (workbar) setOpen(false);
  }, [editor, findQ, findR, workbar]);

  const runScanLinks = useCallback(() => {
    if (!editor) return;
    setLinkIssues(scanLinksOnCurrentPage(editor));
    setLinksOpen(true);
    if (workbar) setOpen(false);
  }, [editor, workbar]);

  const runBrandApply = useCallback(() => {
    if (!editor) return;
    const kit: BrandKit = { primary: brandPrimary, fontStack: brandFont };
    if (slugOk) saveBrandKit(businessSlug, kit);
    applyBrandKitToCanvas(editor, kit);
    setToast('Brand colours & font applied on canvas.');
    setBrandOpen(false);
    if (workbar) setOpen(false);
  }, [editor, brandPrimary, brandFont, businessSlug, slugOk, workbar]);

  const loadImages = useCallback(async () => {
    if (!slugOk) return;
    setImgLoading(true);
    try {
      const res = await listBusinessImages(businessSlug);
      setImgList(res.images);
      setImgSlots({ used: res.slots_used, limit: res.slots_limit });
    } catch {
      setToast('Could not load images.');
    } finally {
      setImgLoading(false);
    }
  }, [businessSlug, slugOk]);

  useEffect(() => {
    if (imgOpen && slugOk) void loadImages();
  }, [imgOpen, slugOk, loadImages]);

  const copyUrl = useCallback((url: string) => {
    void navigator.clipboard.writeText(url).then(() => setToast('Link copied — paste in Basics or Style.'));
  }, []);

  const onUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = '';
      if (!f || !slugOk) return;
      setUploadBusy(true);
      try {
        const prepared = await compressImageFileForWebsiteUpload(f);
        const r = await uploadBusinessImage(businessSlug, prepared, 'gallery');
        setToast(prepared !== f ? 'Compressed & uploaded — URL copied.' : 'Uploaded — URL copied.');
        await copyUrl(r.image_url);
        await loadImages();
      } catch (err) {
        setToast(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploadBusy(false);
      }
    },
    [businessSlug, slugOk, loadImages, copyUrl],
  );

  const applyImgToSelection = useCallback(
    (url: string) => {
      if (!editor) return;
      const sel = editor.getSelected();
      const tag = String(sel?.get('tagName') ?? '').toLowerCase();
      if (tag === 'img') {
        const prevAlt = String(sel?.getAttributes?.().alt ?? '').trim();
        sel?.addAttributes({ src: url });
        if (!prevAlt) {
          setToast('Image updated — add a short description (Basics) for accessibility.');
        } else {
          setToast('Image updated.');
        }
      } else {
        void copyUrl(url);
      }
      setImgOpen(false);
    },
    [editor, copyUrl],
  );

  const closeDropdown = useCallback(() => {
    if (workbar) setOpen(false);
  }, [workbar]);

  const menuBody = (
    <>
          <div className="wb-tools-menu__group-label">Content</div>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              setFindOpen(true);
              closeDropdown();
            }}
          >
            Find &amp; replace…
          </button>
          <button type="button" className="wb-tools-menu__item" role="menuitem" onClick={runScanLinks}>
            Check links &amp; images
          </button>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              if (editor && duplicateSelectedComponent(editor)) setToast('Duplicated block.');
              else setToast('Select one block first.');
              closeDropdown();
            }}
          >
            Duplicate selected block
          </button>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              if (editor && duplicateCurrentPage(editor)) setToast('New page added (copy).');
              else setToast('Could not duplicate page.');
              closeDropdown();
            }}
          >
            Duplicate this page
          </button>
          <div className="wb-tools-menu__group-label">Layout</div>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              if (!editor) return;
              const sel = editor.getSelected();
              if (!sel || sel.is?.('wrapper')) {
                setToast('Select a section or block first.');
              } else {
                applySectionSpacingPreset(sel, 'tight');
                setToast('Spacing: tight.');
              }
              closeDropdown();
            }}
          >
            Section spacing: tight
          </button>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              if (!editor) return;
              const sel = editor.getSelected();
              if (!sel || sel.is?.('wrapper')) {
                setToast('Select a section or block first.');
              } else {
                applySectionSpacingPreset(sel, 'normal');
                setToast('Spacing: normal.');
              }
              closeDropdown();
            }}
          >
            Section spacing: normal
          </button>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              if (!editor) return;
              const sel = editor.getSelected();
              if (!sel || sel.is?.('wrapper')) {
                setToast('Select a section or block first.');
              } else {
                applySectionSpacingPreset(sel, 'airy');
                setToast('Spacing: airy.');
              }
              closeDropdown();
            }}
          >
            Section spacing: airy
          </button>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              if (editor && alignSelectedCenter(editor)) setToast('Block centred.');
              else setToast('Select one block first.');
              closeDropdown();
            }}
          >
            Centre block (align)
          </button>
          <div className="wb-tools-menu__group-label">Gym blocks</div>
          {BUSINESS_SNIPPET_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="wb-tools-menu__item wb-tools-menu__item--sub"
              role="menuitem"
              title={BUSINESS_SNIPPET_LABELS[id].hint}
              onClick={() => {
                if (editor && insertBusinessSnippet(editor, id)) {
                  setToast(`Inserted: ${BUSINESS_SNIPPET_LABELS[id].title}`);
                } else {
                  setToast('Could not insert block.');
                }
                closeDropdown();
              }}
            >
              {BUSINESS_SNIPPET_LABELS[id].title}
            </button>
          ))}
          <div className="wb-tools-menu__group-label">Brand &amp; media</div>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            onClick={() => {
              setBrandOpen(true);
              closeDropdown();
            }}
          >
            Brand kit…
          </button>
          <button
            type="button"
            className="wb-tools-menu__item"
            role="menuitem"
            disabled={!slugOk}
            title={slugOk ? 'Gym images' : 'Save with a site address first'}
            onClick={() => {
              setImgOpen(true);
              closeDropdown();
            }}
          >
            Image library…
          </button>
    </>
  );

  return (
    <div
      className={`wb-tools-menu${workbar ? '' : ' wb-tools-menu--embed-left'}`}
      ref={workbar ? wrapRef : undefined}
    >
      {workbar ?
        <>
          <button
            type="button"
            className="website-builder-page__workbar-tools-btn"
            data-wb-tools-trigger=""
            disabled={disabled}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            title="Text, links, layout, gym blocks, images, brand"
          >
            <TuneOutlinedIcon fontSize="small" aria-hidden />
            <span>Tools</span>
          </button>
          {open ?
            <div className="wb-tools-menu__dropdown" role="menu">
              {menuBody}
            </div>
          : null}
        </>
      : <div
          className={`wb-tools-menu__embed-body${disabled ? ' wb-tools-menu__embed-body--disabled' : ''}`}
          role="navigation"
          aria-label="Tools"
          aria-disabled={disabled ? true : undefined}
        >
          {menuBody}
        </div>
      }

      {toast ?
        <div className="wb-tools-menu__toast" role="status">
          {toast}
          <button type="button" className="wb-tools-menu__toast-x" onClick={() => setToast(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      : null}

      <Modal show={findOpen} onHide={() => setFindOpen(false)} centered size="sm" animation>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h6 mb-0">
            Find &amp; replace (this page)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label className="small mb-1">Find</Form.Label>
            <Form.Control size="sm" value={findQ} onChange={(e) => setFindQ(e.target.value)} placeholder="e.g. Lorem or old phone" />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label className="small mb-1">Replace with</Form.Label>
            <Form.Control size="sm" value={findR} onChange={(e) => setFindR(e.target.value)} placeholder="New text" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setFindOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={runFind} disabled={!findQ.trim()}>
            Replace all
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={linksOpen} onHide={() => setLinksOpen(false)} centered scrollable animation>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h6 mb-0">
            Links &amp; images
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {linkIssues.length === 0 ?
            <p className="small text-muted mb-0">No obvious issues found on this page.</p>
          : <ul className="small mb-0 ps-3">
              {linkIssues.map((iss, i) => (
                <li key={i} className="mb-1">
                  {iss.message}
                  {iss.preview ? <span className="text-muted"> — “{iss.preview}”</span> : null}
                </li>
              ))}
            </ul>
          }
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="primary" size="sm" onClick={() => setLinksOpen(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={brandOpen} onHide={() => setBrandOpen(false)} centered size="sm" animation>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h6 mb-0">
            Brand kit
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted">Applies to the preview and is saved in this browser{slugOk ? ' for this site.' : '.'}</p>
          <Form.Group className="mb-2">
            <Form.Label className="small mb-1">Primary colour</Form.Label>
            <Form.Control type="color" value={brandPrimary} onChange={(e) => setBrandPrimary(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-0">
            <Form.Label className="small mb-1">Font</Form.Label>
            <Form.Select size="sm" value={brandFont} onChange={(e) => setBrandFont(e.target.value)}>
              {FONT_PRESETS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="outline-secondary" size="sm" onClick={() => setBrandOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={runBrandApply}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={imgOpen} onHide={() => setImgOpen(false)} centered scrollable animation>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h6 mb-0">
            Image library
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-2">
            Slots {imgSlots.used}/{imgSlots.limit}. Keep files small (&lt;1 MB) for fast loading. Click a row to use on a selected image, or copy the link.
          </p>
          <Form.Control type="file" accept="image/*" disabled={!slugOk || uploadBusy} onChange={onUpload} className="mb-2" size="sm" />
          {uploadBusy ?
            <Spinner size="sm" />
          : null}
          {imgLoading ?
            <Spinner size="sm" className="ms-2" />
          : null}
          <div className="wb-tools-menu__img-list">
            {imgList.map((img, idx) => {
              const url = resolveBusinessImageDisplayUrl(businessSlug, img);
              return (
                <button
                  key={`${img.id ?? idx}-${url.slice(0, 24)}`}
                  type="button"
                  className="wb-tools-menu__img-row"
                  onClick={() => applyImgToSelection(url)}
                >
                  <span className="wb-tools-menu__img-thumb-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="wb-tools-menu__img-thumb" />
                  </span>
                  <span className="wb-tools-menu__img-meta small text-truncate">{url.slice(0, 56)}…</span>
                </button>
              );
            })}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
