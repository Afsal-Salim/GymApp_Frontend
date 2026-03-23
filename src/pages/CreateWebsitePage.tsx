import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Accordion,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from 'react-bootstrap';
import { PageContainer } from '../components';
import { checkBusinessSlugAvailability, submitWebsiteSetupDraft } from '../api';
import { useToast } from '../contexts/ToastContext';
import { PLANS_PAGE_PATH } from './PlansPage';
import {
  CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY,
  draftPayloadToFormState,
  initCreateWebsiteForm,
  mapFormToWebsiteDraft,
  parseCrystalWebsiteDraftJson,
  readCrystalWebsitePreviewFromStorage,
  writeCrystalWebsitePreviewToStorage,
  type CreateWebsiteFormState,
} from './createWebsite/createWebsiteFormState';
import './CreateWebsitePage.css';

const SLUG_REGEX = /^([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const DRAFT_STORAGE_KEY = 'crystal_website_setup_draft_v1';
const MAX_IMAGE_UPLOAD_BYTES = 1024 * 1024; // 1 MB

function isDataImageUrl(s: string): boolean {
  return s.trim().startsWith('data:image/');
}

function canPreviewImageSrc(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (isDataImageUrl(t)) return true;
  try {
    const u = new URL(t);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

type ImageUrlOrUploadFieldProps = {
  id: string;
  label: string;
  hintId: string;
  hint: ReactNode;
  value: string;
  onChange: (next: string) => void;
  previewVariant: 'square' | 'landscape';
  ratioHint: string;
  showToast: (message: string, variant?: 'danger' | 'success' | 'warning' | 'info') => void;
};

function ImageUrlOrUploadField({
  id,
  label,
  hintId,
  hint,
  value,
  onChange,
  previewVariant,
  ratioHint,
  showToast,
}: ImageUrlOrUploadFieldProps) {
  const [tab, setTab] = useState<'url' | 'upload'>(() => (isDataImageUrl(value) ? 'upload' : 'url'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDataImageUrl(value)) setTab('upload');
  }, [value]);

  const isData = isDataImageUrl(value);
  const urlFieldValue = isData ? '' : value;
  const previewSrc = canPreviewImageSrc(value) ? value.trim() : null;

  const goTab = (next: 'url' | 'upload') => {
    if (next === 'url' && isData) onChange('');
    setTab(next);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file.', 'warning');
      return;
    }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      showToast('Image must be 1 MB or smaller.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') onChange(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Form.Group>
      <LabelWithHint htmlFor={id} label={label} hintId={hintId} hint={hint} />
      <p className="text-muted small mb-2">
        {ratioHint} Max upload size 1 MB.
      </p>
      <div className="btn-group mb-2" role="group" aria-label={`${label} source`}>
        <Button type="button" size="sm" variant={tab === 'url' ? 'primary' : 'outline-secondary'} onClick={() => goTab('url')}>
          URL
        </Button>
        <Button type="button" size="sm" variant={tab === 'upload' ? 'primary' : 'outline-secondary'} onClick={() => goTab('upload')}>
          Upload
        </Button>
      </div>
      {tab === 'url' ?
        <Form.Control id={id} value={urlFieldValue} onChange={(e) => onChange(e.target.value)} placeholder="https://…" />
      : <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            aria-label={`Upload ${label}`}
            onChange={onFileChange}
          />
          <button
            type="button"
            className="create-website__image-upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="create-website__image-upload-zone-title">Choose image</span>
            <span className="create-website__image-upload-zone-sub text-muted small">PNG, JPG, WebP, GIF — up to 1 MB</span>
          </button>
        </>
      }
      {previewSrc ?
        <div className={`create-website__image-preview create-website__image-preview--${previewVariant}`}>
          <img src={previewSrc} alt="" />
        </div>
      : null}
    </Form.Group>
  );
}
/** How long to wait after typing before pushing preview to localStorage (other tabs listen via `storage`). */
const PREVIEW_LIVE_SYNC_DEBOUNCE_MS = 450;

function useDebounced<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setD(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return d;
}

function FieldHint({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{children}</Tooltip>}>
      <button type="button" className="create-website__info-btn" aria-label={`About ${label}`}>
        i
      </button>
    </OverlayTrigger>
  );
}

function LabelWithHint({ htmlFor, label, hintId, hint }: { htmlFor: string; label: string; hintId: string; hint: React.ReactNode }) {
  return (
    <Form.Label htmlFor={htmlFor} className="create-website__label-row">
      <span>{label}</span>
      <FieldHint id={hintId} label={label}>
        {hint}
      </FieldHint>
    </Form.Label>
  );
}

function initialFormFromStorageOrDefaults(): CreateWebsiteFormState {
  const draft = readCrystalWebsitePreviewFromStorage();
  return draft ? draftPayloadToFormState(draft) : initCreateWebsiteForm();
}

export default function CreateWebsitePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [form, setForm] = useState<CreateWebsiteFormState>(() => initialFormFromStorageOrDefaults());
  const set = useCallback(<K extends keyof CreateWebsiteFormState>(key: K, value: CreateWebsiteFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  /** “Edit setup” from preview passes state so we always merge the latest saved preview (same tab or new tab). */
  useEffect(() => {
    const fromPreview = Boolean((location.state as { fromPreview?: boolean } | null)?.fromPreview);
    if (!fromPreview) return;
    const draft = readCrystalWebsitePreviewFromStorage();
    if (draft) setForm(draftPayloadToFormState(draft));
  }, [location.state]);

  /** Another tab updated preview (Preview site); keep this tab’s form in sync. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY || e.newValue == null) return;
      const draft = parseCrystalWebsiteDraftJson(e.newValue);
      if (draft) setForm(draftPayloadToFormState(draft));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Live-sync preview draft so a `/crystal/preview` tab in another window updates after you type (via `storage` event). */
  useEffect(() => {
    const slugForPreview = form.slug.trim().toLowerCase() || 'preview';
    const t = window.setTimeout(() => {
      const draft = mapFormToWebsiteDraft({ ...form, slug: slugForPreview });
      writeCrystalWebsitePreviewToStorage(draft);
    }, PREVIEW_LIVE_SYNC_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [form]);

  const debouncedSlug = useDebounced(form.slug.trim().toLowerCase(), 450);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [slugDetail, setSlugDetail] = useState<string | undefined>();
  const [previewTargetModalOpen, setPreviewTargetModalOpen] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    if (!debouncedSlug) {
      setSlugStatus('idle');
      setSlugDetail(undefined);
      return;
    }
    if (!SLUG_REGEX.test(debouncedSlug) || debouncedSlug.length < 2 || debouncedSlug.length > 48) {
      setSlugStatus('invalid');
      setSlugDetail(undefined);
      return;
    }
    const id = ++reqId.current;
    setSlugStatus('checking');
    setSlugDetail(undefined);
    void checkBusinessSlugAvailability(debouncedSlug).then((r) => {
      if (reqId.current !== id) return;
      setSlugStatus(r.available ? 'available' : 'unavailable');
      setSlugDetail(r.message);
    });
  }, [debouncedSlug]);

  const slugHelp =
    slugStatus === 'checking' ? (
      <span className="text-muted small d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> Checking availability…
      </span>
    ) : slugStatus === 'available' ? (
      <span className="text-success small">This address is available.</span>
    ) : slugStatus === 'unavailable' ? (
      <span className="text-danger small">{slugDetail ?? 'This address is not available. Try another.'}</span>
    ) : slugStatus === 'invalid' && form.slug.trim() ? (
      <span className="text-danger small">Use 2–48 characters: lowercase letters, numbers, and hyphens only.</span>
    ) : (
      <span className="text-muted small">Choose a unique path for your public gym page.</span>
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim().toLowerCase();
    if (!slug || !SLUG_REGEX.test(slug)) {
      showToast('Enter a valid site address (slug).');
      return;
    }
    if (slugStatus !== 'available') {
      showToast('Wait for a green “available” check, or pick a different slug.');
      return;
    }
    const draft = mapFormToWebsiteDraft({ ...form, slug });
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* quota */
    }
    void submitWebsiteSetupDraft(draft).catch(() => {
      /* backend optional */
    });
    showToast('Website details saved. Continue with your plan to go live.');
    navigate(PLANS_PAGE_PATH);
  };

  const savePreviewDraftToStorage = (): boolean => {
    const slugForPreview = form.slug.trim().toLowerCase() || 'preview';
    const draft = mapFormToWebsiteDraft({ ...form, slug: slugForPreview });
    return writeCrystalWebsitePreviewToStorage(draft);
  };

  const openPreviewInNewTab = () => {
    if (!savePreviewDraftToStorage()) {
      showToast('Could not save preview in this browser.');
      return;
    }
    setPreviewTargetModalOpen(false);
    const previewUrl = new URL('crystal/preview', window.location.origin + import.meta.env.BASE_URL).href;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const openPreviewInSameTab = () => {
    if (!savePreviewDraftToStorage()) {
      showToast('Could not save preview in this browser.');
      return;
    }
    setPreviewTargetModalOpen(false);
    navigate('/crystal/preview');
  };

  const iconOpts = (
    <>
      <option value="coaches">Coaches</option>
      <option value="facility">Facility</option>
      <option value="results">Results</option>
    </>
  );

  return (
    <PageContainer>
      <main className="create-website">
        <Container className="create-website__container py-4">
          <div className="create-website__head">
            <div>
              <h1 className="create-website__title h3 mb-1">Create your gym website</h1>
              <p className="text-muted small mb-0">
                These fields match what the public Crystal client page uses (content, layout, and theme colors).
              </p>
            </div>
            <Link to="/user" className="btn btn-outline-secondary btn-sm">
              ← Back to profile
            </Link>
          </div>

          <Card className="create-website__card mt-3">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Accordion defaultActiveKey={['slug', 'brand']} alwaysOpen>
                  <Accordion.Item eventKey="slug" className="create-website__accordion-item">
                    <Accordion.Header>Site address &amp; gym identity</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-3">
                        <LabelWithHint
                          htmlFor="cw-slug"
                          label="Site slug (URL)"
                          hintId="cw-hint-slug"
                          hint={
                            <>
                              This becomes your live link: <strong>/crystal/your-slug/</strong>. Use only lowercase letters,
                              numbers, and hyphens. You cannot change this later without support.
                            </>
                          }
                        />
                        <InputGroup>
                          <InputGroup.Text className="text-muted small text-nowrap">…/crystal/</InputGroup.Text>
                          <Form.Control
                            id="cw-slug"
                            value={form.slug}
                            onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            placeholder="my-gym"
                            autoComplete="off"
                            spellCheck={false}
                            aria-describedby="cw-slug-help"
                          />
                        </InputGroup>
                        <Form.Text id="cw-slug-help">{slugHelp}</Form.Text>
                      </Form.Group>
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <LabelWithHint
                              htmlFor="cw-name"
                              label="Gym / business name"
                              hintId="cw-hint-name"
                              hint="Shown in the hero, navbar brand text area, and footer. Same as the main headline name on your public page."
                            />
                            <Form.Control id="cw-name" value={form.gymName} onChange={(e) => set('gymName', e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <LabelWithHint
                              htmlFor="cw-desc"
                              label="Short description (about)"
                              hintId="cw-hint-desc"
                              hint="Main about copy on the client site. You can expand this later from your dashboard when the API supports it."
                            />
                            <Form.Control
                              id="cw-desc"
                              as="textarea"
                              rows={3}
                              value={form.businessDescription}
                              onChange={(e) => set('businessDescription', e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="brand" className="create-website__accordion-item">
                    <Accordion.Header>Brand colors &amp; logo</Accordion.Header>
                    <Accordion.Body>
                      <p className="text-muted small">
                        On the live site these map to CSS variables <code>--gym-client-accent</code> (buttons, highlights) and{' '}
                        <code>--gym-client-dark</code> (text / dark surfaces). Stored in your setup draft for when the theme API
                        is connected.
                      </p>
                      <Row className="g-3 mb-3">
                        <Col sm={6}>
                          <Form.Group>
                            <LabelWithHint
                              htmlFor="cw-accent"
                              label="Accent color"
                              hintId="cw-hint-accent"
                              hint="Primary brand color — CTAs, links, badges, and gradient accents on the client page."
                            />
                            <div className="d-flex gap-2 align-items-center">
                              <Form.Control
                                type="color"
                                id="cw-accent"
                                value={form.accentColor}
                                onChange={(e) => set('accentColor', e.target.value)}
                                className="create-website__color-input"
                                title="Accent"
                              />
                              <Form.Control value={form.accentColor} onChange={(e) => set('accentColor', e.target.value)} />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col sm={6}>
                          <Form.Group>
                            <LabelWithHint
                              htmlFor="cw-dark"
                              label="Dark / ink color"
                              hintId="cw-hint-dark"
                              hint="Used for headings and dark UI chrome on the public gym template."
                            />
                            <div className="d-flex gap-2 align-items-center">
                              <Form.Control
                                type="color"
                                id="cw-dark"
                                value={form.darkColor}
                                onChange={(e) => set('darkColor', e.target.value)}
                                className="create-website__color-input"
                                title="Dark"
                              />
                              <Form.Control value={form.darkColor} onChange={(e) => set('darkColor', e.target.value)} />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>
                      <ImageUrlOrUploadField
                        id="cw-logo"
                        label="Logo image (optional)"
                        hintId="cw-hint-logo"
                        hint="If empty, the site uses the default Crystal client logo. Use a square or wide logo; URL or upload."
                        value={form.logoUrl}
                        onChange={(v) => set('logoUrl', v)}
                        previewVariant="square"
                        ratioHint="Recommended aspect ~1:1 (square) or wide logo."
                        showToast={showToast}
                      />
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="hero" className="create-website__accordion-item">
                    <Accordion.Header>Hero &amp; navigation CTAs</Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-3">
                        <ImageUrlOrUploadField
                          id="cw-hero-bg"
                          label="Hero background image"
                          hintId="cw-hint-hero-bg"
                          hint="Full-width cover image behind the hero. Use a high-resolution landscape photo; URL or upload."
                          value={form.heroBackgroundImage}
                          onChange={(v) => set('heroBackgroundImage', v)}
                          previewVariant="landscape"
                          ratioHint="Recommended aspect ~16:9 (landscape)."
                          showToast={showToast}
                        />
                      </div>
                      <Form.Group className="mb-3">
                        <LabelWithHint
                          htmlFor="cw-hero-overlay"
                          label={`Hero dark overlay (${form.heroOverlay.toFixed(2)})`}
                          hintId="cw-hint-overlay"
                          hint="0 = image fully bright, 1 = very dark. Improves text contrast on busy photos."
                        />
                        <Form.Range
                          id="cw-hero-overlay"
                          min={0}
                          max={1}
                          step={0.05}
                          value={form.heroOverlay}
                          onChange={(e) => set('heroOverlay', Number(e.target.value))}
                        />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Line above gym name</Form.Label>
                        <Form.Control value={form.titlePrefix} onChange={(e) => set('titlePrefix', e.target.value)} />
                      </Form.Group>
                      <Row className="g-2 mb-2">
                        <Col md={4}>
                          <Form.Label className="small">Tagline • part 1</Form.Label>
                          <Form.Control value={form.tagline1} onChange={(e) => set('tagline1', e.target.value)} />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">Tagline • part 2</Form.Label>
                          <Form.Control value={form.tagline2} onChange={(e) => set('tagline2', e.target.value)} />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">Tagline • part 3</Form.Label>
                          <Form.Control value={form.tagline3} onChange={(e) => set('tagline3', e.target.value)} />
                        </Col>
                      </Row>
                      <Form.Group className="mb-2">
                        <Form.Label>Subtitle paragraph</Form.Label>
                        <Form.Control value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Rating line (hero bar)</Form.Label>
                        <Form.Control value={form.ratingLine} onChange={(e) => set('ratingLine', e.target.value)} />
                      </Form.Group>
                      <Row className="g-2">
                        <Col md={6}>
                          <Form.Label className="small">Primary CTA label</Form.Label>
                          <Form.Control value={form.navCtaLabel} onChange={(e) => set('navCtaLabel', e.target.value)} />
                          <Form.Label className="small mt-1">Primary CTA link</Form.Label>
                          <Form.Control value={form.navCtaHref} onChange={(e) => set('navCtaHref', e.target.value)} />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small">Secondary CTA label</Form.Label>
                          <Form.Control value={form.secondaryCtaLabel} onChange={(e) => set('secondaryCtaLabel', e.target.value)} />
                          <Form.Label className="small mt-1">Secondary CTA link</Form.Label>
                          <Form.Control value={form.secondaryCtaHref} onChange={(e) => set('secondaryCtaHref', e.target.value)} />
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="about" className="create-website__accordion-item">
                    <Accordion.Header>About section</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-2">
                        <Form.Label>Section title</Form.Label>
                        <Form.Control
                          value={form.descriptionSectionTitle}
                          onChange={(e) => set('descriptionSectionTitle', e.target.value)}
                        />
                      </Form.Group>
                      <Row className="g-2 mb-2">
                        <Col md={4}>
                          <Form.Label className="small">Lead (before)</Form.Label>
                          <Form.Control value={form.leadBefore} onChange={(e) => set('leadBefore', e.target.value)} />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">Lead (accent)</Form.Label>
                          <Form.Control value={form.leadAccent} onChange={(e) => set('leadAccent', e.target.value)} />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="small">Lead (after)</Form.Label>
                          <Form.Control value={form.leadAfter} onChange={(e) => set('leadAfter', e.target.value)} />
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Body copy</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={form.descriptionBody}
                          onChange={(e) => set('descriptionBody', e.target.value)}
                        />
                      </Form.Group>
                      {[1, 2, 3].map((n) => {
                        const icon = n === 1 ? form.feat1Icon : n === 2 ? form.feat2Icon : form.feat3Icon;
                        const title = n === 1 ? form.feat1Title : n === 2 ? form.feat2Title : form.feat3Title;
                        const sub = n === 1 ? form.feat1Sub : n === 2 ? form.feat2Sub : form.feat3Sub;
                        const onIcon = (v: CreateWebsiteFormState['feat1Icon']) => {
                          if (n === 1) set('feat1Icon', v);
                          else if (n === 2) set('feat2Icon', v);
                          else set('feat3Icon', v);
                        };
                        const onTitle = (v: string) => {
                          if (n === 1) set('feat1Title', v);
                          else if (n === 2) set('feat2Title', v);
                          else set('feat3Title', v);
                        };
                        const onSub = (v: string) => {
                          if (n === 1) set('feat1Sub', v);
                          else if (n === 2) set('feat2Sub', v);
                          else set('feat3Sub', v);
                        };
                        return (
                          <Row key={n} className="g-2 mb-2 align-items-end">
                            <Col md={3}>
                              <Form.Label className="small">Feature {n} icon</Form.Label>
                              <Form.Select
                                value={icon}
                                onChange={(e) => onIcon(e.target.value as CreateWebsiteFormState['feat1Icon'])}
                              >
                                {iconOpts}
                              </Form.Select>
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Title</Form.Label>
                              <Form.Control value={title} onChange={(e) => onTitle(e.target.value)} />
                            </Col>
                            <Col md={5}>
                              <Form.Label className="small">Subtext</Form.Label>
                              <Form.Control value={sub} onChange={(e) => onSub(e.target.value)} />
                            </Col>
                          </Row>
                        );
                      })}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="video" className="create-website__accordion-item">
                    <Accordion.Header>Video</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-2">
                        <Form.Label>Section title</Form.Label>
                        <Form.Control value={form.videoSectionTitle} onChange={(e) => set('videoSectionTitle', e.target.value)} />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>YouTube or embed URL</Form.Label>
                        <Form.Control value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Caption</Form.Label>
                        <Form.Control value={form.videoCaption} onChange={(e) => set('videoCaption', e.target.value)} />
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="offers" className="create-website__accordion-item">
                    <Accordion.Header>Discount offers (2)</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-2">
                        <Form.Label>Section title</Form.Label>
                        <Form.Control value={form.discountSectionTitle} onChange={(e) => set('discountSectionTitle', e.target.value)} />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Section subtitle</Form.Label>
                        <Form.Control
                          value={form.discountSectionSubtitle}
                          onChange={(e) => set('discountSectionSubtitle', e.target.value)}
                        />
                      </Form.Group>
                      {[1, 2].map((n) => (
                        <Card key={n} body className="mb-3 bg-light">
                          <p className="small fw-semibold mb-2">Offer {n}</p>
                          <Row className="g-2">
                            <Col md={6}>
                              <Form.Label className="small">Title</Form.Label>
                              <Form.Control
                                value={form[`offer${n}Title` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`offer${n}Title` as 'offer1Title', e.target.value)}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label className="small">Subtitle</Form.Label>
                              <Form.Control
                                value={form[`offer${n}Subtitle` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`offer${n}Subtitle` as 'offer1Subtitle', e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">% off</Form.Label>
                              <Form.Control
                                type="number"
                                min={0}
                                max={100}
                                value={form[`offer${n}Percent` as keyof CreateWebsiteFormState] as number}
                                onChange={(e) => set(`offer${n}Percent` as 'offer1Percent', Number(e.target.value))}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">Original price</Form.Label>
                              <Form.Control
                                value={form[`offer${n}Original` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`offer${n}Original` as 'offer1Original', e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">Sale price</Form.Label>
                              <Form.Control
                                value={form[`offer${n}Sale` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`offer${n}Sale` as 'offer1Sale', e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">Period label</Form.Label>
                              <Form.Control
                                value={form[`offer${n}Period` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`offer${n}Period` as 'offer1Period', e.target.value)}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="packages" className="create-website__accordion-item">
                    <Accordion.Header>Membership packages (3)</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-2">
                        <Form.Label>Section title</Form.Label>
                        <Form.Control value={form.packagesSectionTitle} onChange={(e) => set('packagesSectionTitle', e.target.value)} />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Section subtitle</Form.Label>
                        <Form.Control
                          value={form.packagesSectionSubtitle}
                          onChange={(e) => set('packagesSectionSubtitle', e.target.value)}
                        />
                      </Form.Group>
                      {[1, 2, 3].map((n) => (
                        <Card key={n} body className="mb-3 bg-light">
                          <p className="small fw-semibold mb-2">Package {n}</p>
                          <Row className="g-2">
                            <Col md={4}>
                              <Form.Label className="small">Name</Form.Label>
                              <Form.Control
                                value={form[`pkg${n}Name` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`pkg${n}Name` as 'pkg1Name', e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Price</Form.Label>
                              <Form.Control
                                value={form[`pkg${n}Price` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`pkg${n}Price` as 'pkg1Price', e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Period</Form.Label>
                              <Form.Control
                                value={form[`pkg${n}Period` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`pkg${n}Period` as 'pkg1Period', e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Original price (optional)</Form.Label>
                              <Form.Control
                                value={form[`pkg${n}Original` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`pkg${n}Original` as 'pkg1Original', e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Discount % (optional)</Form.Label>
                              <Form.Control
                                value={form[`pkg${n}Discount` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`pkg${n}Discount` as 'pkg1Discount', e.target.value)}
                              />
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                              <Form.Check
                                type="checkbox"
                                label="Highlight card"
                                checked={form[`pkg${n}Highlighted` as keyof CreateWebsiteFormState] as boolean}
                                onChange={(e) => set(`pkg${n}Highlighted` as 'pkg1Highlighted', e.target.checked)}
                              />
                            </Col>
                            <Col md={12}>
                              <Form.Label className="small">Features (comma-separated)</Form.Label>
                              <Form.Control
                                value={form[`pkg${n}Features` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`pkg${n}Features` as 'pkg1Features', e.target.value)}
                              />
                            </Col>
                            <Col md={12}>
                              <Form.Label className="small">CTA label (optional)</Form.Label>
                              <Form.Control
                                value={form[`pkg${n}Cta` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`pkg${n}Cta` as 'pkg1Cta', e.target.value)}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="trainers" className="create-website__accordion-item">
                    <Accordion.Header>Coaches (3)</Accordion.Header>
                    <Accordion.Body>
                      <Form.Group className="mb-2">
                        <Form.Label>Section title</Form.Label>
                        <Form.Control value={form.trainersSectionTitle} onChange={(e) => set('trainersSectionTitle', e.target.value)} />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Section subtitle</Form.Label>
                        <Form.Control
                          value={form.trainersSectionSubtitle}
                          onChange={(e) => set('trainersSectionSubtitle', e.target.value)}
                        />
                      </Form.Group>
                      {[1, 2, 3].map((n) => (
                        <Card key={n} body className="mb-3 bg-light">
                          <p className="small fw-semibold mb-2">Coach {n}</p>
                          <Row className="g-2">
                            <Col md={4}>
                              <Form.Label className="small">Name</Form.Label>
                              <Form.Control
                                value={form[`tr${n}Name` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`tr${n}Name` as 'tr1Name', e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Role</Form.Label>
                              <Form.Control
                                value={form[`tr${n}Role` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`tr${n}Role` as 'tr1Role', e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Photo URL</Form.Label>
                              <Form.Control
                                value={form[`tr${n}Photo` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`tr${n}Photo` as 'tr1Photo', e.target.value)}
                              />
                            </Col>
                            <Col md={12}>
                              <Form.Label className="small">Short bio</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={form[`tr${n}Bio` as keyof CreateWebsiteFormState] as string}
                                onChange={(e) => set(`tr${n}Bio` as 'tr1Bio', e.target.value)}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="contact" className="create-website__accordion-item">
                    <Accordion.Header>Contact, visit &amp; footer</Accordion.Header>
                    <Accordion.Body>
                      <Row className="g-2 mb-2">
                        <Col md={6}>
                          <Form.Label className="small">Email</Form.Label>
                          <Form.Control value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small">Phone</Form.Label>
                          <Form.Control value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small">Instagram handle (no @)</Form.Label>
                          <Form.Control value={form.contactInstagram} onChange={(e) => set('contactInstagram', e.target.value)} />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small">Address</Form.Label>
                          <Form.Control value={form.contactAddress} onChange={(e) => set('contactAddress', e.target.value)} />
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>WhatsApp FAB hint text</Form.Label>
                        <Form.Control value={form.whatsappFabHint} onChange={(e) => set('whatsappFabHint', e.target.value)} />
                      </Form.Group>
                      <Row className="g-2 mb-3">
                        <Col md={6}>
                          <Form.Label className="small">Hours</Form.Label>
                          <Form.Control value={form.hours} onChange={(e) => set('hours', e.target.value)} />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small">Parking</Form.Label>
                          <Form.Control value={form.parking} onChange={(e) => set('parking', e.target.value)} />
                        </Col>
                      </Row>
                      <Form.Group className="mb-2">
                        <Form.Label>Footer tagline</Form.Label>
                        <Form.Control value={form.footerTagline} onChange={(e) => set('footerTagline', e.target.value)} />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Fine print (optional)</Form.Label>
                        <Form.Control value={form.footerFinePrint} onChange={(e) => set('footerFinePrint', e.target.value)} />
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                <div className="create-website__actions mt-4 d-flex flex-wrap gap-3 justify-content-between align-items-center">
                  <p className="text-muted small mb-0">
                    <strong>Preview site</strong> asks where to open your gym page (new tab or this tab). No slug check
                    required. Draft save uses <code>POST /businesses/website-setup/</code> when your API is ready.
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button type="button" variant="outline-primary" onClick={() => setPreviewTargetModalOpen(true)}>
                      Preview site
                    </Button>
                    <Button type="submit" variant="primary" disabled={slugStatus !== 'available'}>
                      Save &amp; continue to plans
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <Modal show={previewTargetModalOpen} onHide={() => setPreviewTargetModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">
            Open preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Where would you like to open the preview?</p>
        </Modal.Body>
        <Modal.Footer className="flex-wrap gap-2">
          <Button variant="outline-secondary" onClick={() => setPreviewTargetModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="outline-primary" onClick={openPreviewInSameTab}>
            This tab
          </Button>
          <Button variant="primary" onClick={openPreviewInNewTab}>
            New tab
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
}
