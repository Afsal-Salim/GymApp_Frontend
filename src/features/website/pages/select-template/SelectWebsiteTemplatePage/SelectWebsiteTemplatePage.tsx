'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Modal, Spinner } from 'react-bootstrap';
import { PageContainer } from '@/components/index/index';
import { getBusinessDetail } from '@/api';
import { useToast } from '@/contexts/ToastContext/ToastContext';
import { createWebsiteFormFromBusinessDetail } from '@/features/website/setup/createWebsiteFormState/createWebsiteFormState';
import {
  buildDesignSystemSelectPageTemplateCards,
  buildProTemplateCards,
  PRO_TEMPLATE_PREVIEW_PATHS,
  type ProTemplateKey,
} from '@/features/website/templates/websiteProTemplateCards/websiteProTemplateCards';
import {
  consumeInitialTemplateForSelectPage,
  grantCreateTemplateGate,
  grantEditTemplateGate,
  setPendingProTemplateKey,
} from '@/features/website/templates/websiteTemplateGate/websiteTemplateGate';
import './SelectWebsiteTemplatePage.css';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
};

/** Selection on the picker: Crystal default, a Pro seed key, or blank-canvas custom. */
type SelectPageChoice = '' | ProTemplateKey | 'custom';

export default function SelectWebsiteTemplatePage({ mode }: Props) {
  const router = useRouter();
  const params = useParams<{ slug?: string | string[] }>();
  const routeSlugRaw = (() => {
    const raw = params.slug;
    if (typeof raw === 'string') return raw.trim();
    if (Array.isArray(raw) && raw[0]) return String(raw[0]).trim();
    return '';
  })();
  const { showToast } = useToast();
  const [selectedKey, setSelectedKey] = useState<SelectPageChoice>('');
  const [editLoading, setEditLoading] = useState(mode === 'edit');
  const [templatePreviewKey, setTemplatePreviewKey] = useState<ProTemplateKey | null>(null);

  const slugNorm = mode === 'edit' ? routeSlugRaw.toLowerCase() : '';

  const proTemplateCards = useMemo(() => buildProTemplateCards(), []);
  const designSystemTemplateCards = useMemo(() => buildDesignSystemSelectPageTemplateCards(), []);
  /** All styled templates rendered alongside the Crystal default, in display order. */
  const styledTemplateCards = useMemo(
    () => [...proTemplateCards, ...designSystemTemplateCards],
    [proTemplateCards, designSystemTemplateCards],
  );

  useEffect(() => {
    const stashed = consumeInitialTemplateForSelectPage();
    if (stashed !== null) {
      setSelectedKey(stashed);
      if (mode === 'edit') setEditLoading(false);
      return;
    }
    if (mode === 'create') {
      setSelectedKey('');
      return;
    }
    if (!slugNorm) {
      setEditLoading(false);
      return;
    }
    let cancelled = false;
    getBusinessDetail(slugNorm)
      .then((d) => {
        if (cancelled) return;
        const form = createWebsiteFormFromBusinessDetail(d, slugNorm);
        setSelectedKey((form.proTemplateKey || '') as SelectPageChoice);
      })
      .catch(() => {
        showToast('Failed to load gym.');
      })
      .finally(() => {
        if (!cancelled) setEditLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, slugNorm, showToast]);

  const continueHref = mode === 'create' ? '/user/create-website' : `/user/business/${encodeURIComponent(slugNorm)}/edit`;
  const builderBaseHref = mode === 'create' ? '/user/create-website/builder' : `/user/business/${encodeURIComponent(slugNorm)}/builder`;

  const handleContinue = useCallback(() => {
    if (mode === 'create') grantCreateTemplateGate();
    else grantEditTemplateGate(slugNorm);

    if (selectedKey === '') {
      setPendingProTemplateKey('');
      router.push(continueHref);
      return;
    }
    if (selectedKey === 'custom') {
      router.push(`${builderBaseHref}?template=custom`);
      return;
    }
    router.push(`${builderBaseHref}?template=${encodeURIComponent(selectedKey)}`);
  }, [builderBaseHref, continueHref, mode, router, selectedKey, slugNorm]);

  const lead =
    mode === 'create' ?
      'Choose a template to style your gym website. You can preview and customize any template in the builder.'
    : 'Choose a template for your public gym page. You can preview and customize any template in the builder.';

  if (mode === 'edit' && !slugNorm) {
    return (
      <PageContainer>
        <main className="create-website">
          <Container className="py-5 text-center">
            <p className="text-muted mb-3">This page needs a gym in the URL.</p>
            <Link href="/user" className="btn btn-outline-primary btn-sm">
              Back to profile
            </Link>
          </Container>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="create-website__page-container--templates">
      <main className="create-website create-website--templates">
        <Container fluid className="create-website__container create-website__container--templates py-4">
          <div className="create-website__head create-website__head--templates">
            <div>
              <h1 className="create-website__title h3 mb-1">Website templates</h1>
              <p className="create-website__content-policy-hint small text-muted mb-0">{lead}</p>
            </div>
            <div className="create-website__head-side">
              <div className="create-website__head-actions">
                <Link href="/user" className="btn btn-outline-secondary btn-sm">
                  ← Back to profile
                </Link>
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="create-website__select-template-continue d-inline-flex align-items-center justify-content-center gap-2"
                  onClick={handleContinue}
                  aria-label="Continue to site editor"
                  disabled={mode === 'edit' && editLoading}
                >
                  <span>Continue</span>
                  <ArrowForwardOutlinedIcon sx={{ fontSize: '1.35rem' }} aria-hidden />
                </Button>
              </div>
            </div>
          </div>

          {mode === 'edit' && editLoading ?
            <div className="text-center py-5">
              <Spinner animation="border" role="status" className="mb-2" />
              <p className="text-muted small mb-0">Loading current template…</p>
            </div>
          : <>
              <div className="create-website__template-grid" role="group" aria-label="Templates and custom build">
                <div className="create-website__template-card-shell">
                  <button
                    type="button"
                    className={`create-website__template-card${selectedKey === '' ? ' create-website__template-card--selected' : ''}`}
                    onClick={() => setSelectedKey('')}
                    aria-pressed={selectedKey === ''}
                  >
                    <span className="create-website__template-card-visual create-website__template-card-visual--default">
                      Crystal default
                    </span>
                    <span className="create-website__template-card-title-row">
                      <span className="create-website__template-card-title">Crystal default theme</span>
                    </span>
                    <span className="create-website__template-card-desc">
                      Keep the standard Crystal client page layout and your custom brand/content configuration.
                    </span>
                  </button>
                  {/** Spacer matches preview buttons on styled-template cards so the grid columns align. */}
                  <div className="create-website__template-card-shell-actions" aria-hidden="true" />
                </div>
                {styledTemplateCards.map((template) => {
                  const selected = selectedKey === template.key;
                  return (
                    <div key={template.key} className="create-website__template-card-shell">
                      <button
                        type="button"
                        className={`create-website__template-card${selected ? ' create-website__template-card--selected' : ''}`}
                        onClick={() => setSelectedKey(template.key)}
                        aria-pressed={selected}
                      >
                        <span className="create-website__template-card-visual create-website__template-card-visual--live">
                          <iframe
                            src={template.previewPath}
                            title={`${template.label} card preview`}
                            loading="lazy"
                            tabIndex={-1}
                            className="create-website__template-card-frame"
                          />
                        </span>
                        <span className="create-website__template-card-title-row">
                          <span className="create-website__template-card-title">{template.label}</span>
                        </span>
                        <span className="create-website__template-card-desc">{template.description}</span>
                      </button>
                      <div className="create-website__template-card-shell-actions">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          size="sm"
                          className="create-website__template-preview-btn"
                          onClick={() => setTemplatePreviewKey(template.key)}
                        >
                          <VisibilityOutlinedIcon className="create-website__template-preview-btn-icon" fontSize="small" aria-hidden />
                          Preview
                        </Button>
                        <Button
                          type="button"
                          variant="light"
                          size="sm"
                          className="create-website__template-preview-btn"
                          onClick={() => window.open(template.previewPath, '_blank', 'noopener,noreferrer')}
                        >
                          <OpenInNewOutlinedIcon className="create-website__template-preview-btn-icon" fontSize="small" aria-hidden />
                          Preview in new tab
                        </Button>
                      </div>
                    </div>
                  );
                })}
                <div className="create-website__template-card-shell">
                  <button
                    type="button"
                    className={`create-website__template-card create-website__template-card--customized${selectedKey === 'custom' ? ' create-website__template-card--selected' : ''}`}
                    onClick={() => setSelectedKey('custom')}
                    aria-pressed={selectedKey === 'custom'}
                  >
                    <span className="create-website__template-card-visual create-website__template-card-visual--customized">
                      Customized
                    </span>
                    <span className="create-website__template-card-title-row">
                      <span className="create-website__template-card-title">Custom build</span>
                      <span className="badge text-bg-info">Custom</span>
                    </span>
                    <span className="create-website__template-card-desc">
                      Start from scratch with the visual builder and compose your own sections and pages.
                    </span>
                  </button>
                  {/** Spacer aligns with styled-template rows (preview buttons only). */}
                  <div className="create-website__template-card-shell-actions" aria-hidden="true" />
                </div>
              </div>
            </>
          }
        </Container>
      </main>

      <Modal
        show={templatePreviewKey !== null}
        onHide={() => setTemplatePreviewKey(null)}
        size="xl"
        centered
        aria-labelledby="select-template-preview-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="select-template-preview-title" as="h2" className="h5 mb-0">
            {templatePreviewKey ?
              `${styledTemplateCards.find((c) => c.key === templatePreviewKey)?.label ?? 'Template'} preview`
            : 'Preview'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {templatePreviewKey ?
            <iframe
              src={PRO_TEMPLATE_PREVIEW_PATHS[templatePreviewKey]}
              title="Template preview"
              className="create-website__template-preview-frame"
            />
          : null}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={() => setTemplatePreviewKey(null)}>
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (!templatePreviewKey) return;
              window.open(PRO_TEMPLATE_PREVIEW_PATHS[templatePreviewKey], '_blank', 'noopener,noreferrer');
            }}
          >
            Open in new tab
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
}
