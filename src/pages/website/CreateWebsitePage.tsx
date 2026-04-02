import { useState, useEffect, useLayoutEffect, useCallback, useRef, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Container,
  Form,
  InputGroup,
  Modal,
  OverlayTrigger,
  Row,
  Spinner,
  Tooltip,
} from 'react-bootstrap';
import { PageContainer } from '../../components';
import {
  checkBusinessSlugAvailability,
  getBusinessDetail,
  invalidateUserBusinessListCache,
  patchBusiness,
  submitWebsiteSetupDraft,
} from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { PLANS_PAGE_PATH } from '../plans/PlansPage';
import { crystalPreviewAbsoluteUrl, publicSiteDomain } from '../../config/env';
import { CRYSTAL_WEBSITE_SETUP_DRAFT_STORAGE_KEY } from '../../config/storageKeys';
import {
  CREATE_WEBSITE_MAX_COACHES,
  CREATE_WEBSITE_MAX_OFFERS,
  CREATE_WEBSITE_MAX_PACKAGES,
  CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY,
  createWebsiteFormFromBusinessDetail,
  draftPayloadToFormState,
  GYM_CLIENT_DEFAULT_LIGHT_HEX,
  GYM_CLIENT_DEFAULT_TEXT_HEX,
  emptyCoachRow,
  emptyDiscountOfferRow,
  emptyMembershipPackageRow,
  formatMemberRatingPreview,
  initCreateWebsiteForm,
  mapFormToWebsiteDraft,
  parseCrystalWebsiteDraftJson,
  readCrystalWebsitePreviewFromStorage,
  writeCrystalWebsitePreviewToStorage,
  type CoachFormRow,
  type CreateWebsiteFormState,
  type DiscountOfferFormRow,
  type MembershipPackageFormRow,
} from './setup/createWebsiteFormState';
import {
  formMatchesThemePreset,
  getPresetArtworkUrlForColors,
  WEBSITE_THEME_PRESETS,
  type WebsiteThemePreset,
} from './websiteThemePresets';
import {
  clampPercentOff,
  formatDerivedPrice,
  parseLoosePrice,
  parsePercentInputString,
  percentFromOriginalAndSale,
  saleFromOriginalAndPercent,
} from './setup/createWebsiteDiscountCalc';
import {
  GYM_CLIENT_SITE_DEFAULTS,
  isValidHttpLocationUrl,
  normalizeLocationMapUrl,
} from '../crystal/gymClientSiteContent';
import { hexColorsEqual, normalizeHexColor } from '../../utils/hexColor';
import { clampPhoneDigitsInput, isTenDigitPhone } from '../../utils/phoneDigits';
import './CreateWebsitePage.css';

const SLUG_REGEX = /^([a-z0-9]+(?:-[a-z0-9]+)*)$/;

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

function RemoveRowTrashButton({ ariaLabel, onClick }: { ariaLabel: string; onClick: () => void }) {
  return (
    <Button
      variant="outline-danger"
      size="sm"
      type="button"
      className="create-website__remove-row-btn"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
    >
      <svg className="create-website__trash-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
      </svg>
    </Button>
  );
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
  /** When set, hides URL entry — image must come from file upload (data URL). */
  sourceMode?: 'url-or-upload' | 'upload-only';
  /** Disables URL, upload, and tabs; still shows preview when `value` is set. */
  disabled?: boolean;
  /** Shown above controls when `disabled` (e.g. preset artwork is active). */
  disabledNotice?: ReactNode;
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
  sourceMode = 'url-or-upload',
  disabled = false,
  disabledNotice,
}: ImageUrlOrUploadFieldProps) {
  const uploadOnly = sourceMode === 'upload-only';
  const [tab, setTab] = useState<'url' | 'upload'>(() =>
    uploadOnly ? 'upload' : isDataImageUrl(value) ? 'upload' : 'url'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadOnly) return;
    if (isDataImageUrl(value)) setTab('upload');
  }, [value, uploadOnly]);

  const isData = isDataImageUrl(value);
  const urlFieldValue = isData ? '' : value;
  const previewSrc = canPreviewImageSrc(value) ? value.trim() : null;

  const goTab = (next: 'url' | 'upload') => {
    if (disabled || uploadOnly) return;
    if (next === 'url' && isData) onChange('');
    setTab(next);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
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
      {disabled && disabledNotice ?
        <Alert variant="warning" className="py-2 px-3 small mb-2">
          {disabledNotice}
        </Alert>
      : null}
      <p className="text-muted small mb-2">
        {uploadOnly ?
          <>Upload from your device only (no image URL). {ratioHint} Max 1 MB.</>
        : <>
            {ratioHint} Max upload size 1 MB.
          </>
        }
      </p>
      {uploadOnly ? null : (
        <div
          className="create-website__image-source-radios d-flex flex-wrap align-items-center gap-3 mb-2"
          role="radiogroup"
          aria-label={`${label} source`}
        >
          <Form.Check
            type="radio"
            id={`${id}-src-upload`}
            name={`${id}-image-source`}
            className="mb-0"
            label="Upload"
            checked={tab === 'upload'}
            disabled={disabled}
            onChange={() => goTab('upload')}
          />
          <Form.Check
            type="radio"
            id={`${id}-src-url`}
            name={`${id}-image-source`}
            className="mb-0"
            label="Url"
            checked={tab === 'url'}
            disabled={disabled}
            onChange={() => goTab('url')}
          />
        </div>
      )}
      {!uploadOnly && tab === 'url' ?
        <Form.Control
          id={id}
          value={urlFieldValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          disabled={disabled}
        />
      : <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            aria-label={`Upload ${label}`}
            onChange={onFileChange}
            disabled={disabled}
          />
          <button
            type="button"
            className={`create-website__image-upload-zone${disabled ? ' create-website__image-upload-zone--disabled' : ''}`}
            onClick={() => !disabled && fileInputRef.current?.click()}
            disabled={disabled}
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

/** Parse #RRGGBB or #RRGGBBAA (overlay blend). Returns RGB for the picker and opacity 0–1. */
function parseHexWithAlpha(raw: string): { rgbHex: string; alpha: number } {
  let s = raw.trim();
  if (s.startsWith('#')) s = s.slice(1);
  if (/^[0-9a-fA-F]{8}$/.test(s)) {
    const rgb = normalizeHexColor(`#${s.slice(0, 6)}`) ?? '#111827';
    const aByte = parseInt(s.slice(6, 8), 16);
    const alpha = Number.isFinite(aByte) ? aByte / 255 : 0.8;
    return { rgbHex: rgb, alpha: Math.min(1, Math.max(0, alpha)) };
  }
  const six = normalizeHexColor(`#${s}`);
  if (six) return { rgbHex: six, alpha: 1 };
  return { rgbHex: '#111827', alpha: 0.8 };
}

function formatHexWithAlpha(rgbHex: string, alpha01: number): string {
  const rgb = normalizeHexColor(rgbHex) ?? '#111827';
  const a = Math.round(Math.min(1, Math.max(0, alpha01)) * 255);
  const aa = a.toString(16).padStart(2, '0');
  return `${rgb}${aa}`;
}

/** Curated palette for theme fields — avoids the native OS color dialog. */
const THEME_COLOR_SWATCH_GROUPS: { label: string; colors: string[] }[] = [
  {
    label: 'Neutrals',
    colors: ['#fafaf9', '#e7e5e4', '#a8a29e', '#78716c', '#44403c', '#292524', '#0c0a09', '#000000'],
  },
  {
    label: 'Orange & amber',
    colors: ['#fff7ed', '#ffedd5', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412'],
  },
  {
    label: 'Red & rose',
    colors: ['#fef2f2', '#fecaca', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#9f1239', '#881337'],
  },
  {
    label: 'Green & teal',
    colors: ['#f0fdf4', '#bbf7d0', '#4ade80', '#22c55e', '#15803d', '#0f766e', '#115e59', '#134e4a'],
  },
  {
    label: 'Blue & violet',
    colors: ['#eff6ff', '#bfdbfe', '#60a5fa', '#3b82f6', '#2563eb', '#4f46e5', '#5b21b6', '#4c1d95'],
  },
];

function ThemeColorPickerModal({
  show,
  onHide,
  title,
  titleId,
  committedValue,
  onApply,
}: {
  show: boolean;
  onHide: () => void;
  title: string;
  titleId: string;
  committedValue: string;
  onApply: (hex: string) => void;
}) {
  const nativeColorRef = useRef<HTMLInputElement>(null);
  const safeCommitted = normalizeHexColor(committedValue) ?? '#000000';
  const [draft, setDraft] = useState(safeCommitted);
  const [hexEdit, setHexEdit] = useState(safeCommitted);

  useEffect(() => {
    if (!show) return;
    const s = normalizeHexColor(committedValue) ?? '#000000';
    setDraft(s);
    setHexEdit(s);
  }, [show, committedValue]);

  const commitHexEdit = () => {
    const n = normalizeHexColor(hexEdit);
    if (n) {
      setDraft(n);
      setHexEdit(n);
    } else {
      setHexEdit(draft);
    }
  };

  const handleApply = () => {
    const n = normalizeHexColor(hexEdit);
    if (!n) return;
    onApply(n);
    onHide();
  };

  const canApply = normalizeHexColor(hexEdit) !== null;
  const previewBg = normalizeHexColor(hexEdit) ?? draft;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      aria-labelledby={titleId}
      dialogClassName="create-website__color-modal-dialog"
      contentClassName="create-website__color-modal-content"
    >
      <div className="create-website__color-modal-head">
        <Button type="button" variant="outline-secondary" size="sm" className="create-website__color-modal-head-btn" onClick={onHide}>
          Cancel
        </Button>
        <h2 id={titleId} className="create-website__color-modal-title h6 mb-0">
          {title}
        </h2>
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="create-website__color-modal-head-btn"
          disabled={!canApply}
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
      <Modal.Body className="create-website__color-modal-body pt-0">
        <div className="create-website__color-modal-preview" style={{ background: previewBg }} aria-hidden />
        <p className="create-website__color-modal-hex-label small text-muted mb-1">Hex</p>
        <Form.Control
          type="text"
          value={hexEdit}
          onChange={(e) => {
            const v = e.target.value;
            setHexEdit(v);
            const n = normalizeHexColor(v);
            if (n) setDraft(n);
          }}
          onBlur={commitHexEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitHexEdit();
            }
          }}
          className="create-website__color-modal-hex-input font-monospace mb-3"
          spellCheck={false}
          autoComplete="off"
          aria-label="Color hex value"
        />
        <div className="create-website__color-modal-custom mb-4">
          <p className="create-website__color-modal-group-label">Custom</p>
          <div className="create-website__color-modal-custom-row d-flex flex-wrap align-items-center gap-2">
            <input
              ref={nativeColorRef}
              type="color"
              className="create-website__color-modal-native-hidden"
              value={draft}
              onChange={(e) => {
                const v = e.target.value;
                setDraft(v);
                setHexEdit(v);
              }}
              tabIndex={-1}
              aria-hidden
            />
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              className="create-website__color-modal-custom-btn"
              onClick={() => nativeColorRef.current?.click()}
            >
              Full spectrum
            </Button>
            <span className="create-website__color-modal-custom-hint text-muted small">
              Opens your device color picker for any shade.
            </span>
          </div>
        </div>
        {THEME_COLOR_SWATCH_GROUPS.map((group) => (
          <div key={group.label} className="create-website__color-modal-group">
            <p className="create-website__color-modal-group-label">{group.label}</p>
            <div className="create-website__color-modal-swatches">
              {group.colors.map((hex) => {
                const selected = hexColorsEqual(hex, draft);
                return (
                  <button
                    key={hex}
                    type="button"
                    className={`create-website__color-swatch${selected ? ' create-website__color-swatch--selected' : ''}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => {
                      setDraft(hex);
                      setHexEdit(hex);
                    }}
                    title={hex}
                    aria-label={`${hex}${selected ? ', selected' : ''}`}
                    aria-pressed={selected}
                  >
                    {selected ?
                      <span className="create-website__color-swatch-check" aria-hidden>
                        ✓
                      </span>
                    : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Modal.Body>
    </Modal>
  );
}

function ThemeColorField({
  id,
  label,
  hintId,
  hint,
  value,
  onChange,
  pickerTitle,
}: {
  id: string;
  label: string;
  hintId: string;
  hint: ReactNode;
  value: string;
  onChange: (hex: string) => void;
  pickerTitle: string;
}) {
  const [hexDraft, setHexDraft] = useState(value);
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  const commitHex = () => {
    const n = normalizeHexColor(hexDraft);
    if (n) {
      onChange(n);
      setHexDraft(n);
    } else {
      setHexDraft(value);
    }
  };

  const displayHex = normalizeHexColor(value) ?? '#e7e5e4';

  return (
    <div className="create-website__theme-color-field">
      <ThemeColorPickerModal
        show={pickerOpen}
        onHide={() => setPickerOpen(false)}
        title="Choose color"
        titleId={`${id}-color-modal-title`}
        committedValue={value}
        onApply={(hex) => {
          onChange(hex);
          setHexDraft(hex);
        }}
      />
      <div className="create-website__theme-color-field-head">
        <LabelWithHint htmlFor={id} label={label} hintId={hintId} hint={hint} />
      </div>
      <div className="create-website__theme-color-control">
        <div className="create-website__theme-color-swatch-shell">
          <button
            type="button"
            className="create-website__theme-color-swatch-btn"
            style={{ backgroundColor: displayHex }}
            onClick={() => setPickerOpen(true)}
            aria-label={`${pickerTitle} — open palette`}
            aria-haspopup="dialog"
          />
        </div>
        <Form.Control
          id={id}
          type="text"
          value={hexDraft}
          onChange={(e) => setHexDraft(e.target.value)}
          onBlur={commitHex}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitHex();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="create-website__theme-color-hex"
          placeholder="#000000"
          spellCheck={false}
          autoComplete="off"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}

/** Blend overlay: 6-digit color + opacity slider → stored as #RRGGBBAA. */
function BlendOverlayColorField({
  id,
  label,
  hintId,
  hint,
  value,
  onChange,
  pickerTitle,
}: {
  id: string;
  label: string;
  hintId: string;
  hint: ReactNode;
  value: string;
  onChange: (hexWithAlpha: string) => void;
  pickerTitle: string;
}) {
  const { rgbHex, alpha } = parseHexWithAlpha(value);
  const opacityPct = Math.round(alpha * 100);

  const setRgb = (h: string) => {
    const n = normalizeHexColor(h);
    if (!n) return;
    onChange(formatHexWithAlpha(n, alpha));
  };

  const setOpacityPct = (pct: number) => {
    const a = Math.min(100, Math.max(0, pct)) / 100;
    onChange(formatHexWithAlpha(rgbHex, a));
  };

  return (
    <div className="create-website__blend-overlay-field">
      <ThemeColorField
        id={id}
        label={label}
        hintId={hintId}
        hint={hint}
        value={rgbHex}
        onChange={setRgb}
        pickerTitle={pickerTitle}
      />
      <Form.Group className="mt-2 mb-0">
        <Form.Label className="small mb-1" htmlFor={`${id}-opacity`}>
          Overlay opacity ({opacityPct}%)
        </Form.Label>
        <Form.Range
          id={`${id}-opacity`}
          min={0}
          max={100}
          step={1}
          value={opacityPct}
          onChange={(e) => setOpacityPct(Number(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={opacityPct}
          aria-label={`${label} opacity`}
        />
        <Form.Text className="text-muted small d-block mb-0">
          Full color uses 8-digit hex (#RRGGBBAA). Lower opacity shows more of the photo.
        </Form.Text>
      </Form.Group>
    </div>
  );
}

function initialFormFromStorageOrDefaults(): CreateWebsiteFormState {
  const draft = readCrystalWebsitePreviewFromStorage();
  return draft ? draftPayloadToFormState(draft) : initCreateWebsiteForm();
}

export default function CreateWebsitePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug: editRouteSlug } = useParams<{ slug?: string }>();
  const isEditMode = Boolean(editRouteSlug);
  const { showToast } = useToast();
  const [form, setForm] = useState<CreateWebsiteFormState>(() => initialFormFromStorageOrDefaults());
  const formRef = useRef(form);
  formRef.current = form;
  const set = useCallback(<K extends keyof CreateWebsiteFormState>(key: K, value: CreateWebsiteFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const [themeManualOpen, setThemeManualOpen] = useState(false);

  const applyThemePreset = useCallback((preset: WebsiteThemePreset) => {
    setForm((f) => ({
      ...f,
      accentColor: preset.accentColor,
      darkColor: preset.darkColor,
      textColor: preset.textColor,
      lightColor: preset.lightColor,
      ...(f.useDefaultPaletteArtwork ?
        {
          aboutBodyBgEnabled: true,
          aboutBodyBgImageUrl: preset.artworkSrc,
        }
      : {}),
    }));
  }, []);

  useEffect(() => {
    if (!form.useDefaultPaletteArtwork) return;
    const nextUrl = getPresetArtworkUrlForColors(form);
    setForm((f) => {
      if (!f.useDefaultPaletteArtwork) return f;
      if (f.aboutBodyBgImageUrl === nextUrl && f.aboutBodyBgEnabled) return f;
      return { ...f, aboutBodyBgImageUrl: nextUrl, aboutBodyBgEnabled: true };
    });
  }, [
    form.useDefaultPaletteArtwork,
    form.accentColor,
    form.darkColor,
    form.textColor,
    form.lightColor,
  ]);

  const onToggleDefaultPaletteArtwork = useCallback((checked: boolean) => {
    setForm((f) => {
      if (checked) {
        return {
          ...f,
          useDefaultPaletteArtwork: true,
          aboutBodyBgEnabled: true,
          aboutBodyBgImageUrl: getPresetArtworkUrlForColors(f),
        };
      }
      return {
        ...f,
        useDefaultPaletteArtwork: false,
        aboutBodyBgImageUrl: '',
        aboutBodyBgEnabled: false,
      };
    });
  }, []);

  const patchDiscountOffer = useCallback((index: number, patch: Partial<DiscountOfferFormRow>) => {
    setForm((f) => {
      const next = [...f.discountOffers];
      next[index] = { ...next[index], ...patch };
      return { ...f, discountOffers: next };
    });
  }, []);

  const handleDiscountPercentChange = useCallback((index: number, raw: string) => {
    const pct = clampPercentOff(Number(raw));
    setForm((f) => {
      const row = f.discountOffers[index];
      if (!row) return f;
      const next = { ...row, percentOff: pct };
      const orig = parseLoosePrice(next.originalPriceLabel).value;
      if (orig != null && orig > 0) {
        next.salePriceLabel = formatDerivedPrice(saleFromOriginalAndPercent(orig, pct), next.originalPriceLabel);
      }
      const list = [...f.discountOffers];
      list[index] = next;
      return { ...f, discountOffers: list };
    });
  }, []);

  const handleDiscountOriginalChange = useCallback((index: number, value: string) => {
    setForm((f) => {
      const row = f.discountOffers[index];
      if (!row) return f;
      const next = { ...row, originalPriceLabel: value };
      const orig = parseLoosePrice(value).value;
      const saleNum = parseLoosePrice(next.salePriceLabel).value;
      if (orig != null && orig > 0) {
        if (next.percentOff > 0) {
          next.salePriceLabel = formatDerivedPrice(
            saleFromOriginalAndPercent(orig, next.percentOff),
            value
          );
        } else if (saleNum != null) {
          next.percentOff = percentFromOriginalAndSale(orig, saleNum);
        }
      }
      const list = [...f.discountOffers];
      list[index] = next;
      return { ...f, discountOffers: list };
    });
  }, []);

  const handleDiscountSaleChange = useCallback((index: number, value: string) => {
    setForm((f) => {
      const row = f.discountOffers[index];
      if (!row) return f;
      const next = { ...row, salePriceLabel: value };
      const orig = parseLoosePrice(next.originalPriceLabel).value;
      const saleNum = parseLoosePrice(value).value;
      if (orig != null && orig > 0 && saleNum != null) {
        next.percentOff = percentFromOriginalAndSale(orig, saleNum);
      }
      const list = [...f.discountOffers];
      list[index] = next;
      return { ...f, discountOffers: list };
    });
  }, []);

  const addDiscountOffer = useCallback(() => {
    setForm((f) =>
      f.discountOffers.length >= CREATE_WEBSITE_MAX_OFFERS ?
        f
      : { ...f, discountOffers: [...f.discountOffers, emptyDiscountOfferRow()] }
    );
  }, []);

  const removeDiscountOffer = useCallback((index: number) => {
    setForm((f) => ({ ...f, discountOffers: f.discountOffers.filter((_, i) => i !== index) }));
  }, []);

  const patchMembershipPackage = useCallback((index: number, patch: Partial<MembershipPackageFormRow>) => {
    setForm((f) => {
      const next = [...f.membershipPackages];
      next[index] = { ...next[index], ...patch };
      return { ...f, membershipPackages: next };
    });
  }, []);

  const handlePackageDiscountPercentChange = useCallback((index: number, raw: string) => {
    setForm((f) => {
      const row = f.membershipPackages[index];
      if (!row) return f;
      const next = { ...row, discountPercent: raw };
      const pct = parsePercentInputString(raw);
      const orig = parseLoosePrice(next.originalPriceLabel).value;
      if (orig != null && orig > 0 && pct > 0) {
        next.priceLabel = formatDerivedPrice(saleFromOriginalAndPercent(orig, pct), next.originalPriceLabel);
      }
      const list = [...f.membershipPackages];
      list[index] = next;
      return { ...f, membershipPackages: list };
    });
  }, []);

  const handlePackageOriginalPriceChange = useCallback((index: number, value: string) => {
    setForm((f) => {
      const row = f.membershipPackages[index];
      if (!row) return f;
      const next = { ...row, originalPriceLabel: value };
      const orig = parseLoosePrice(value).value;
      const priceNum = parseLoosePrice(next.priceLabel).value;
      const pct = parsePercentInputString(next.discountPercent);
      if (orig != null && orig > 0) {
        if (pct > 0) {
          next.priceLabel = formatDerivedPrice(saleFromOriginalAndPercent(orig, pct), value);
        } else if (priceNum != null) {
          const p = percentFromOriginalAndSale(orig, priceNum);
          next.discountPercent = p > 0 && p <= 100 ? String(Math.round(p)) : '';
        }
      }
      const list = [...f.membershipPackages];
      list[index] = next;
      return { ...f, membershipPackages: list };
    });
  }, []);

  const handlePackagePriceChange = useCallback((index: number, value: string) => {
    setForm((f) => {
      const row = f.membershipPackages[index];
      if (!row) return f;
      const next = { ...row, priceLabel: value };
      const orig = parseLoosePrice(next.originalPriceLabel).value;
      const priceNum = parseLoosePrice(value).value;
      if (orig != null && orig > 0 && priceNum != null) {
        const p = percentFromOriginalAndSale(orig, priceNum);
        next.discountPercent = p > 0 && p <= 100 ? String(Math.round(p)) : '';
      }
      const list = [...f.membershipPackages];
      list[index] = next;
      return { ...f, membershipPackages: list };
    });
  }, []);

  const addMembershipPackage = useCallback(() => {
    setForm((f) =>
      f.membershipPackages.length >= CREATE_WEBSITE_MAX_PACKAGES ?
        f
      : { ...f, membershipPackages: [...f.membershipPackages, emptyMembershipPackageRow()] }
    );
  }, []);

  const removeMembershipPackage = useCallback((index: number) => {
    setForm((f) => ({ ...f, membershipPackages: f.membershipPackages.filter((_, i) => i !== index) }));
  }, []);

  const patchCoach = useCallback((index: number, patch: Partial<CoachFormRow>) => {
    setForm((f) => {
      const next = [...f.coaches];
      next[index] = { ...next[index], ...patch };
      return { ...f, coaches: next };
    });
  }, []);

  const addCoach = useCallback(() => {
    setForm((f) =>
      f.coaches.length >= CREATE_WEBSITE_MAX_COACHES ? f : { ...f, coaches: [...f.coaches, emptyCoachRow()] }
    );
  }, []);

  const removeCoach = useCallback((index: number) => {
    setForm((f) => ({ ...f, coaches: f.coaches.filter((_, i) => i !== index) }));
  }, []);

  const [editReady, setEditReady] = useState(!isEditMode);
  const [editBaselineSlug, setEditBaselineSlug] = useState<string | null>(null);
  const [editBusinessActive, setEditBusinessActive] = useState(true);

  useEffect(() => {
    if (!editRouteSlug) {
      setEditReady(true);
      setEditBaselineSlug(null);
      return;
    }
    let cancelled = false;
    setEditReady(false);
    getBusinessDetail(editRouteSlug)
      .then((d) => {
        if (cancelled) return;
        setForm(createWebsiteFormFromBusinessDetail(d));
        setEditBaselineSlug(d.slug?.trim().toLowerCase() ?? editRouteSlug.trim().toLowerCase());
        const ia = d.is_active;
        setEditBusinessActive(typeof ia === 'boolean' ? ia : true);
      })
      .catch(() => {
        if (!cancelled) showToast('Failed to load business.');
      })
      .finally(() => {
        if (!cancelled) setEditReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [editRouteSlug]);

  /** “Edit setup” from preview passes state so we always merge the latest saved preview (same tab or new tab). */
  useEffect(() => {
    if (isEditMode) return;
    const fromPreview = Boolean((location.state as { fromPreview?: boolean } | null)?.fromPreview);
    if (!fromPreview) return;
    const draft = readCrystalWebsitePreviewFromStorage();
    if (draft) setForm(draftPayloadToFormState(draft));
  }, [location.state, isEditMode]);

  /** Another tab updated the preview draft; keep this tab’s form in sync. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY || e.newValue == null) return;
      const draft = parseCrystalWebsiteDraftJson(e.newValue);
      if (draft) setForm(draftPayloadToFormState(draft));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /**
   * Push palette / About-background changes to preview storage immediately so `/preview` (other tab or quick
   * navigation) is not stuck behind the debounced writer.
   */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const f = formRef.current;
    const slugForPreview = f.slug.trim().toLowerCase() || 'preview';
    writeCrystalWebsitePreviewToStorage(mapFormToWebsiteDraft({ ...f, slug: slugForPreview }));
  }, [
    form.useDefaultPaletteArtwork,
    form.aboutBodyBgImageUrl,
    form.aboutBodyBgEnabled,
    form.accentColor,
    form.darkColor,
    form.textColor,
    form.lightColor,
  ]);

  /** Live-sync preview draft to localStorage so `/preview` updates (debounced; runs in create and edit). */
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
  const [saving, setSaving] = useState(false);
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
    /** Route param is the gym being edited; baseline from API may arrive later — both mean “unchanged slug”. */
    const unchangedEditSlug =
      isEditMode ?
        (editBaselineSlug ?? editRouteSlug?.trim().toLowerCase() ?? null)
      : null;
    if (unchangedEditSlug && debouncedSlug === unchangedEditSlug) {
      setSlugStatus('available');
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
  }, [debouncedSlug, isEditMode, editBaselineSlug, editRouteSlug]);

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
      <span className="text-muted small">
        {publicSiteDomain ?
          `Choose a unique subdomain on ${publicSiteDomain} for your public gym page.`
        : 'Choose a unique path for your public gym page.'}
      </span>
    );

  const handleSubmit = async (e: React.FormEvent) => {
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
    const addr = form.contactAddress.trim();
    const phoneDigits = clampPhoneDigitsInput(form.contactPhone);
    const mapRaw = form.contactLocationMapUrl.trim();
    if (phoneDigits && !isTenDigitPhone(phoneDigits)) {
      showToast('Enter a valid 10-digit phone number or clear the phone field.');
      return;
    }
    if (addr || phoneDigits) {
      if (!mapRaw || !isValidHttpLocationUrl(mapRaw)) {
        showToast('Add a valid maps link (https://…) when you include an address or phone number.');
        return;
      }
    }
    const draft = mapFormToWebsiteDraft({ ...form, slug });

    if (isEditMode) {
      const baseline = editBaselineSlug ?? editRouteSlug?.trim().toLowerCase();
      if (!editRouteSlug?.trim() || !baseline) {
        showToast('Missing business to edit.');
        return;
      }
      setSaving(true);
      try {
        const logoTrim = form.logoUrl.trim();
        const logoUrlForApi =
          !logoTrim || isDataImageUrl(logoTrim) ?
            ''
          : (() => {
              try {
                const u = new URL(logoTrim);
                return u.protocol === 'http:' || u.protocol === 'https:' ? logoTrim : '';
              } catch {
                return '';
              }
            })();
        const mapNorm = mapRaw && isValidHttpLocationUrl(mapRaw) ? normalizeLocationMapUrl(mapRaw) : '';
        await patchBusiness(baseline, {
          name: form.gymName.trim(),
          slug,
          description: form.businessDescription.trim(),
          phone: phoneDigits,
          address: form.contactAddress.trim(),
          location_map_url: mapNorm,
          is_active: editBusinessActive,
          logo_url: logoUrlForApi,
          website_theme: {
            accentHex: draft.theme.accentHex.trim() || '#ea580c',
            darkHex: draft.theme.darkHex.trim() || '#0c0a09',
            textHex: draft.theme.textHex.trim() || GYM_CLIENT_DEFAULT_TEXT_HEX,
            lightHex: draft.theme.lightHex?.trim() || GYM_CLIENT_DEFAULT_LIGHT_HEX,
          },
          website_content: draft.content,
        });
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Could not save changes. Try again.');
        return;
      } finally {
        setSaving(false);
      }
      showToast('Business and website updated.', 'success');
      invalidateUserBusinessListCache();
      navigate('/user');
      return;
    }

    setSaving(true);
    try {
      await submitWebsiteSetupDraft(draft);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save website setup. Try again.');
      return;
    } finally {
      setSaving(false);
    }
    try {
      sessionStorage.setItem(CRYSTAL_WEBSITE_SETUP_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* quota */
    }
    showToast('Website details saved. Continue with your plan to go live.', 'success');
    invalidateUserBusinessListCache();
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
    window.open(crystalPreviewAbsoluteUrl(), '_blank', 'noopener,noreferrer');
  };

  const openPreviewInSameTab = () => {
    if (!savePreviewDraftToStorage()) {
      showToast('Could not save preview in this browser.');
      return;
    }
    setPreviewTargetModalOpen(false);
    navigate('/preview');
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
        <div className="create-website__preview-dock">
          <Button
            type="button"
            variant="primary"
            className="create-website__preview-dock-btn"
            disabled={isEditMode && !editReady}
            onClick={() => setPreviewTargetModalOpen(true)}
            aria-label="Open site preview"
          >
            <svg
              className="create-website__preview-dock-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="create-website__preview-dock-label">Preview</span>
          </Button>
        </div>
        <Container className="create-website__container py-4">
          <div className="create-website__head">
            <div>
              <h1 className="create-website__title h3 mb-1">
                {isEditMode ? 'Edit gym website' : 'Create your gym website'}
              </h1>
              <p className="create-website__content-policy-hint small text-muted mb-0 mt-2">
                You are responsible for having the rights to all images, videos, and text you publish. Do not use
                copyrighted or unlicensed material. Do not share end-user personal data improperly. See{' '}
                <Link to="/legal/user-content" target="_blank" rel="noopener noreferrer">
                  User Content Responsibility
                </Link>
                {' and '}
                <Link to="/legal/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="create-website__head-actions">
              <Link to="/user" className="btn btn-outline-secondary btn-sm">
                ← Back to profile
              </Link>
            </div>
          </div>

          <Card className="create-website__card mt-3">
            <Card.Body>
              {isEditMode && !editReady ?
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" className="mb-2" />
                  <p className="text-muted small mb-0">Loading business…</p>
                </div>
              : null}
              <Form
                className={isEditMode && !editReady ? 'd-none' : undefined}
                onSubmit={handleSubmit}
                aria-hidden={isEditMode && !editReady ? true : undefined}
              >
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
                            isEditMode ?
                              publicSiteDomain ?
                                <>
                                  Your live site is <strong>https://your-slug.{publicSiteDomain}/</strong>. You can
                                  rename the slug if the new address is available; that changes the public URL.
                                </>
                              : <>
                                  Your live link is <strong>/your-slug/</strong>. You can rename the slug if the new
                                  address is available; that changes the public URL.
                                </>
                            : publicSiteDomain ?
                              <>
                                This becomes your live site: <strong>https://your-slug.{publicSiteDomain}/</strong>. Use
                                only lowercase letters, numbers, and hyphens. You cannot change this later without
                                support.
                              </>
                            : <>
                                This becomes your live link: <strong>/your-slug/</strong>. Use only lowercase letters,
                                numbers, and hyphens. You cannot change this later without support.
                              </>
                          }
                        />
                        <InputGroup className="create-website__slug-url-group">
                          {publicSiteDomain ?
                            <>
                              <Form.Control
                                id="cw-slug"
                                className="create-website__slug-url-input"
                                value={form.slug}
                                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="my-gym"
                                autoComplete="off"
                                spellCheck={false}
                                aria-describedby="cw-slug-help cw-slug-full-url"
                              />
                              <InputGroup.Text className="create-website__slug-url-addon text-muted small text-nowrap">
                                .{publicSiteDomain}
                              </InputGroup.Text>
                            </>
                          : <>
                              <InputGroup.Text className="create-website__slug-url-addon text-muted small text-nowrap">
                                /
                              </InputGroup.Text>
                              <Form.Control
                                id="cw-slug"
                                className="create-website__slug-url-input"
                                value={form.slug}
                                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="my-gym"
                                autoComplete="off"
                                spellCheck={false}
                                aria-describedby="cw-slug-help cw-slug-full-url"
                              />
                            </>
                          }
                        </InputGroup>
                        <div
                          id="cw-slug-full-url"
                          className="create-website__slug-full-url mt-2"
                          aria-live="polite"
                        >
                          <span className="create-website__slug-full-url-label text-muted small d-block mb-1">
                            Public URL preview
                          </span>
                          <code className="create-website__slug-full-url-code user-select-all">
                            {(() => {
                              const s = (form.slug.trim().toLowerCase() || 'your-slug').replace(/^\/+/, '');
                              return publicSiteDomain ? `${s}.${publicSiteDomain}/` : `/${s}/`;
                            })()}
                          </code>
                        </div>
                        <Form.Text id="cw-slug-help">{slugHelp}</Form.Text>
                      </Form.Group>
                      {isEditMode ?
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="cw-listing-active"
                            label="Business listing active"
                            checked={editBusinessActive}
                            onChange={(e) => setEditBusinessActive(e.target.checked)}
                          />
                          <Form.Text className="text-muted">When off, your gym can be hidden from listings if the API supports it.</Form.Text>
                        </Form.Group>
                      : null}
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
                      <p className="create-website__theme-intro">
                        These map to <code className="create-website__theme-token">--gym-client-accent</code> (CTAs and
                        highlights), <code className="create-website__theme-token">--gym-client-dark</code> (surfaces and
                        borders), <code className="create-website__theme-token">--gym-client-text</code> (readable copy), and{' '}
                        <code className="create-website__theme-token">--gym-client-light</code> (mostly white/light surfaces).
                        Choose a suggested palette for a balanced look, or expand <strong>Customise colors</strong> to set each
                        value manually (palette, hex, or full-spectrum picker). Stored in your setup draft for when the theme API
                        is connected.
                      </p>
                      <Form.Check
                        type="checkbox"
                        id="cw-default-palette-artwork"
                        className="mb-2"
                        label="Use Crystal default palette artwork"
                        checked={form.useDefaultPaletteArtwork}
                        onChange={(e) => onToggleDefaultPaletteArtwork(e.target.checked)}
                      />
                      <p className="small text-muted mb-3">
                        When checked, the <strong>About</strong> section background uses the matching palette image (bundled
                        asset), preset cards show that artwork, and custom URL/upload for that background is disabled. Any
                        uploaded or pasted image is cleared. Uncheck to use your own background image.
                      </p>
                      <p className="create-website__theme-presets-label small text-uppercase fw-semibold text-muted mb-2">
                        Suggested palettes
                      </p>
                      <p className="small text-muted mb-3">
                        {form.useDefaultPaletteArtwork ?
                          'Each card shows Crystal reference artwork for that palette.'
                        : 'Each card shows accent → dark ink → body text → light surfaces (left to right).'}
                      </p>
                      <div className="create-website__theme-presets mb-3" role="group" aria-label="Suggested color palettes">
                        {WEBSITE_THEME_PRESETS.map((preset) => {
                          const selected = formMatchesThemePreset(form, preset);
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              className={`create-website__theme-preset-btn${selected ? ' create-website__theme-preset-btn--selected' : ''}`}
                              onClick={() => applyThemePreset(preset)}
                              aria-pressed={selected}
                              aria-label={`Apply ${preset.name} theme`}
                            >
                              {form.useDefaultPaletteArtwork ?
                                <img
                                  src={preset.artworkSrc}
                                  alt=""
                                  className="create-website__theme-preset-artwork"
                                />
                              : <span className="create-website__theme-preset-strip" aria-hidden>
                                  <span style={{ backgroundColor: preset.accentColor }} />
                                  <span style={{ backgroundColor: preset.darkColor }} />
                                  <span style={{ backgroundColor: preset.textColor }} />
                                  <span style={{ backgroundColor: preset.lightColor }} />
                                </span>
                              }
                              <span className="create-website__theme-preset-name">{preset.name}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="create-website__theme-custom-section mb-3">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          size="sm"
                          className="create-website__theme-custom-toggle"
                          onClick={() => setThemeManualOpen((o) => !o)}
                          aria-expanded={themeManualOpen}
                          aria-controls="cw-theme-manual-colors"
                          id="cw-theme-custom-toggle"
                        >
                          {themeManualOpen ? 'Hide customise colors' : 'Customise colors'}
                        </Button>
                        <Collapse in={themeManualOpen}>
                          <div id="cw-theme-manual-colors" className="pt-2">
                            <p className="small text-muted mb-3">
                              Adjust accent, ink, text, and light surfaces individually. Each field opens a palette; use “Full
                              spectrum” inside the modal for any hex.
                            </p>
                            <div className="create-website__theme-colors-grid mb-1">
                              <ThemeColorField
                                id="cw-accent"
                                label="Accent color"
                                hintId="cw-hint-accent"
                                hint="Primary brand color — CTAs, links, badges, and gradient accents on the client page."
                                value={form.accentColor}
                                onChange={(hex) => set('accentColor', hex)}
                                pickerTitle="Accent"
                              />
                              <ThemeColorField
                                id="cw-dark"
                                label="Dark / ink color"
                                hintId="cw-hint-dark"
                                hint="Used for surfaces, borders, and dark UI chrome on the public gym template."
                                value={form.darkColor}
                                onChange={(hex) => set('darkColor', hex)}
                                pickerTitle="Dark / ink"
                              />
                              <ThemeColorField
                                id="cw-text"
                                label="Body text color"
                                hintId="cw-hint-text"
                                hint="Main text on light sections (about, pricing, contact). Set a dark color when your ink/surfaces are light so copy stays readable."
                                value={form.textColor}
                                onChange={(hex) => set('textColor', hex)}
                                pickerTitle="Body text"
                              />
                              <ThemeColorField
                                id="cw-light"
                                label="Light surface color"
                                hintId="cw-hint-light"
                                hint="Controls the mostly white areas (light section backgrounds/cards/marquee strip)."
                                value={form.lightColor}
                                onChange={(hex) => set('lightColor', hex)}
                                pickerTitle="Light surfaces"
                              />
                            </div>
                          </div>
                        </Collapse>
                      </div>
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
                      <Form.Group className="mb-3">
                        <LabelWithHint
                          htmlFor="cw-hero-text-color"
                          label="Hero text color"
                          hintId="cw-hint-hero-text"
                          hint="Color for the line above your gym name, the name, taglines, subtitle, and the address / rating row under the buttons. Leave empty for the default white style. Sent as content.layout.heroTextColor."
                        />
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <Form.Control
                            id="cw-hero-text-color-native"
                            type="color"
                            className="create-website__hero-native-color"
                            value={normalizeHexColor(form.heroTextColor) ?? '#ffffff'}
                            onChange={(e) => set('heroTextColor', e.target.value)}
                            title="Pick hero text color"
                            aria-label="Hero text color"
                          />
                          <Form.Control
                            id="cw-hero-text-color"
                            type="text"
                            className="font-monospace"
                            style={{ maxWidth: '10rem' }}
                            value={form.heroTextColor}
                            onChange={(e) => set('heroTextColor', e.target.value)}
                            placeholder="#ffffff or empty"
                            spellCheck={false}
                            autoComplete="off"
                          />
                          <Button type="button" variant="outline-secondary" size="sm" onClick={() => set('heroTextColor', '')}>
                            Default
                          </Button>
                        </div>
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
                        <Form.Label>Member rating (hero bar)</Form.Label>
                        <Form.Control
                          type="number"
                          min={0}
                          max={5}
                          step={0.1}
                          inputMode="decimal"
                          value={form.memberRating}
                          onChange={(e) => set('memberRating', e.target.value)}
                          placeholder="e.g. 4.5"
                        />
                        <Form.Text className="text-muted">
                          Enter a score from 0–5. Your site shows it as &quot;Rated …/5 by members&quot;. Leave empty to hide.
                        </Form.Text>
                        {(() => {
                          const preview = formatMemberRatingPreview(form.memberRating);
                          return preview ? (
                            <Form.Text className="text-muted d-block mt-1 mb-0">Preview: {preview}</Form.Text>
                          ) : null;
                        })()}
                      </Form.Group>
                      <div className="d-flex flex-column gap-2">
                        <Form.Check
                          type="switch"
                          id="cw-primary-cta"
                          label={`Show primary button (${GYM_CLIENT_SITE_DEFAULTS.nav.ctaLabel} → ${GYM_CLIENT_SITE_DEFAULTS.nav.ctaHref})`}
                          checked={form.primaryCtaEnabled}
                          onChange={(e) => set('primaryCtaEnabled', e.target.checked)}
                        />
                        <Form.Check
                          type="switch"
                          id="cw-secondary-cta"
                          label={
                            GYM_CLIENT_SITE_DEFAULTS.header.ctaSecondary ?
                              `Show secondary button (${GYM_CLIENT_SITE_DEFAULTS.header.ctaSecondary.label} → ${GYM_CLIENT_SITE_DEFAULTS.header.ctaSecondary.href})`
                            : 'Show secondary button'
                          }
                          checked={form.secondaryCtaEnabled}
                          onChange={(e) => set('secondaryCtaEnabled', e.target.checked)}
                          disabled={!GYM_CLIENT_SITE_DEFAULTS.header.ctaSecondary}
                        />
                        <Form.Text className="text-muted">
                          Button wording and links are fixed for a consistent member experience. Toggle only whether each
                          appears in the nav and hero.
                        </Form.Text>
                      </div>
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
                      <Form.Text className="text-muted small d-block mb-2">
                        The live page adds a space between “accent” and “after” when missing so words don’t run together
                        (e.g. after <strong>500+ members</strong>).
                      </Form.Text>
                      <Form.Text className="text-muted d-block mb-3">
                        Main about paragraph comes from <strong>Short description (about)</strong> in Business profile above.
                      </Form.Text>
                      <Form.Check
                        type="switch"
                        id="cw-about-body-bg-enabled"
                        className="mb-2"
                        label="Use blended image background behind about text"
                        checked={form.aboutBodyBgEnabled}
                        onChange={(e) => set('aboutBodyBgEnabled', e.target.checked)}
                      />
                      {form.aboutBodyBgEnabled ? (
                        <div className="mb-3">
                          <ImageUrlOrUploadField
                            id="cw-about-body-bg-image"
                            label="Body background image"
                            hintId="cw-hint-about-body-bg-image"
                            hint="Used behind the short description paragraph (Business profile) with blend overlay."
                            value={form.aboutBodyBgImageUrl}
                            onChange={(v) => set('aboutBodyBgImageUrl', v)}
                            previewVariant="landscape"
                            ratioHint="Recommended ~16:9 or wide texture."
                            showToast={showToast}
                            disabled={form.useDefaultPaletteArtwork}
                            disabledNotice={
                              <>
                                <strong>Default palette artwork is enabled.</strong> Turn off &quot;Use Crystal default palette
                                artwork&quot; under brand colors to set a custom URL or upload your own image.
                              </>
                            }
                          />
                          <BlendOverlayColorField
                            id="cw-about-body-bg-blend"
                            label="Blend overlay color"
                            hintId="cw-hint-about-body-bg-blend"
                            hint="Overlay tint on top of the image so text stays readable. Adjust opacity to let more or less of the photo show through."
                            value={form.aboutBodyBgBlendColor}
                            onChange={(hex) => set('aboutBodyBgBlendColor', hex)}
                            pickerTitle="About body blend"
                          />
                        </div>
                      ) : null}
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
                    <Accordion.Header>Discount offers ({form.discountOffers.length})</Accordion.Header>
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
                      {form.discountOffers.map((row, index) => (
                        <Card key={index} body className="mb-3 bg-light">
                          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <p className="small fw-semibold mb-0">Offer {index + 1}</p>
                            <RemoveRowTrashButton ariaLabel="Remove offer" onClick={() => removeDiscountOffer(index)} />
                          </div>
                          <Row className="g-2">
                            <Col md={6}>
                              <Form.Label className="small">Title</Form.Label>
                              <Form.Control
                                value={row.title}
                                onChange={(e) => patchDiscountOffer(index, { title: e.target.value })}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label className="small">Subtitle</Form.Label>
                              <Form.Control
                                value={row.subtitle}
                                onChange={(e) => patchDiscountOffer(index, { subtitle: e.target.value })}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">% off</Form.Label>
                              <Form.Control
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={Number.isFinite(row.percentOff) ? row.percentOff : 0}
                                onChange={(e) => handleDiscountPercentChange(index, e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">Original price</Form.Label>
                              <Form.Control
                                value={row.originalPriceLabel}
                                onChange={(e) => handleDiscountOriginalChange(index, e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">Sale price</Form.Label>
                              <Form.Control
                                value={row.salePriceLabel}
                                onChange={(e) => handleDiscountSaleChange(index, e.target.value)}
                              />
                            </Col>
                            <Col md={3}>
                              <Form.Label className="small">Period label</Form.Label>
                              <Form.Control
                                value={row.periodLabel}
                                onChange={(e) => patchDiscountOffer(index, { periodLabel: e.target.value })}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        disabled={form.discountOffers.length >= CREATE_WEBSITE_MAX_OFFERS}
                        onClick={addDiscountOffer}
                      >
                        Add offer ({form.discountOffers.length}/{CREATE_WEBSITE_MAX_OFFERS})
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="packages" className="create-website__accordion-item">
                    <Accordion.Header>Membership packages ({form.membershipPackages.length})</Accordion.Header>
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
                      {form.membershipPackages.map((row, index) => (
                        <Card key={index} body className="mb-3 bg-light">
                          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <p className="small fw-semibold mb-0">Package {index + 1}</p>
                            <RemoveRowTrashButton ariaLabel="Remove package" onClick={() => removeMembershipPackage(index)} />
                          </div>
                          <Row className="g-2">
                            <Col md={4}>
                              <Form.Label className="small">Name</Form.Label>
                              <Form.Control
                                value={row.name}
                                onChange={(e) => patchMembershipPackage(index, { name: e.target.value })}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Price</Form.Label>
                              <Form.Control
                                value={row.priceLabel}
                                onChange={(e) => handlePackagePriceChange(index, e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Period</Form.Label>
                              <Form.Control
                                value={row.periodLabel}
                                onChange={(e) => patchMembershipPackage(index, { periodLabel: e.target.value })}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Original price (optional)</Form.Label>
                              <Form.Control
                                value={row.originalPriceLabel}
                                onChange={(e) => handlePackageOriginalPriceChange(index, e.target.value)}
                              />
                            </Col>
                            <Col md={4}>
                              <Form.Label className="small">Discount % (optional)</Form.Label>
                              <Form.Control
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={row.discountPercent === '' ? '' : row.discountPercent}
                                onChange={(e) => handlePackageDiscountPercentChange(index, e.target.value)}
                              />
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                              <Form.Check
                                type="checkbox"
                                label="Highlight card"
                                checked={row.highlighted}
                                onChange={(e) => patchMembershipPackage(index, { highlighted: e.target.checked })}
                              />
                            </Col>
                            <Col md={12}>
                              <Form.Label className="small">Features (comma-separated)</Form.Label>
                              <Form.Control
                                value={row.featuresCsv}
                                onChange={(e) => patchMembershipPackage(index, { featuresCsv: e.target.value })}
                              />
                            </Col>
                            <Col md={12}>
                              <Form.Label className="small">CTA label (optional)</Form.Label>
                              <Form.Control
                                value={row.ctaLabel}
                                onChange={(e) => patchMembershipPackage(index, { ctaLabel: e.target.value })}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        disabled={form.membershipPackages.length >= CREATE_WEBSITE_MAX_PACKAGES}
                        onClick={addMembershipPackage}
                      >
                        Add package ({form.membershipPackages.length}/{CREATE_WEBSITE_MAX_PACKAGES})
                      </Button>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="trainers" className="create-website__accordion-item">
                    <Accordion.Header>Coaches ({form.coaches.length})</Accordion.Header>
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
                      {form.coaches.map((row, index) => (
                        <Card key={index} body className="mb-3 bg-light">
                          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <p className="small fw-semibold mb-0">Coach {index + 1}</p>
                            <RemoveRowTrashButton ariaLabel="Remove coach" onClick={() => removeCoach(index)} />
                          </div>
                          <Row className="g-2">
                            <Col md={6}>
                              <Form.Label className="small">Name</Form.Label>
                              <Form.Control
                                value={row.name}
                                onChange={(e) => patchCoach(index, { name: e.target.value })}
                              />
                            </Col>
                            <Col md={6}>
                              <Form.Label className="small">Role</Form.Label>
                              <Form.Control
                                value={row.role}
                                onChange={(e) => patchCoach(index, { role: e.target.value })}
                              />
                            </Col>
                            <Col md={12} className="mt-1">
                              <ImageUrlOrUploadField
                                id={`cw-coach-photo-${index}`}
                                label="Photo"
                                hintId={`cw-hint-coach-photo-${index}`}
                                hint="Coach headshot on the public page. Upload from your device only — same 1 MB limit as other images."
                                value={row.photoUrl}
                                onChange={(v) => patchCoach(index, { photoUrl: v })}
                                previewVariant="square"
                                ratioHint="Square ~1:1 works best."
                                showToast={showToast}
                                sourceMode="upload-only"
                              />
                            </Col>
                            <Col md={12}>
                              <Form.Label className="small">Short bio</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={row.shortBio}
                                onChange={(e) => patchCoach(index, { shortBio: e.target.value })}
                              />
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        disabled={form.coaches.length >= CREATE_WEBSITE_MAX_COACHES}
                        onClick={addCoach}
                      >
                        Add coach ({form.coaches.length}/{CREATE_WEBSITE_MAX_COACHES})
                      </Button>
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
                          <Form.Control
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="10-digit mobile"
                            maxLength={10}
                            value={form.contactPhone}
                            onChange={(e) => set('contactPhone', clampPhoneDigitsInput(e.target.value))}
                          />
                          <Form.Text className="text-muted">Digits only, 10 characters.</Form.Text>
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small">Instagram handle (no @)</Form.Label>
                          <Form.Control value={form.contactInstagram} onChange={(e) => set('contactInstagram', e.target.value)} />
                        </Col>
                        <Col md={6}>
                          <Form.Label className="small">Address</Form.Label>
                          <Form.Control value={form.contactAddress} onChange={(e) => set('contactAddress', e.target.value)} />
                        </Col>
                        <Col md={12}>
                          <LabelWithHint
                            htmlFor="cw-map-url"
                            label="Location / Google Maps link"
                            hintId="cw-hint-map"
                            hint={
                              <>
                                Paste a share link from Google Maps (Share → Copy link). Required if you add an address or
                                phone; visitors see a map pin on your public page that opens this URL.
                              </>
                            }
                          />
                          <Form.Control
                            id="cw-map-url"
                            value={form.contactLocationMapUrl}
                            onChange={(e) => set('contactLocationMapUrl', e.target.value)}
                            placeholder="https://maps.app.goo.gl/… or https://www.google.com/maps/…"
                            autoComplete="off"
                            spellCheck={false}
                          />
                          <Form.Text className="text-muted">
                            Required when address or phone is filled.
                          </Form.Text>
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

                <div className="create-website__actions mt-4 d-flex flex-wrap gap-2 justify-content-end align-items-center">
                  <div className="d-flex flex-wrap gap-2">
                    <Button type="submit" variant="primary" disabled={slugStatus !== 'available' || saving}>
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving…
                        </>
                      ) : isEditMode ?
                        <>Save changes</>
                      : (
                        <>Save &amp; continue to plans</>
                      )}
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <Modal
        show={previewTargetModalOpen}
        onHide={() => setPreviewTargetModalOpen(false)}
        centered
        dialogClassName="create-website__preview-modal-dialog"
        contentClassName="create-website__preview-modal-content"
        backdropClassName="create-website__preview-modal-backdrop"
        aria-labelledby="create-website-preview-modal-title"
      >
        <Modal.Header closeButton className="create-website__preview-modal-header">
          <Modal.Title id="create-website-preview-modal-title" as="h2" className="h5 mb-0">
            Preview your site
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="create-website__preview-modal-body">
          <p className="create-website__preview-modal-lead mb-0">
            Your latest draft is saved first. Choose where to open the preview.
          </p>
          <div className="create-website__preview-modal-options" role="group" aria-label="Preview destination">
            <button
              type="button"
              className="create-website__preview-modal-option"
              onClick={openPreviewInSameTab}
            >
              <span className="create-website__preview-modal-option-title">This tab</span>
              <span className="create-website__preview-modal-option-desc">
                Open here — use the browser back button to return to the editor.
              </span>
            </button>
            <button
              type="button"
              className="create-website__preview-modal-option create-website__preview-modal-option--emphasis"
              onClick={openPreviewInNewTab}
            >
              <span className="create-website__preview-modal-option-badge">Recommended</span>
              <span className="create-website__preview-modal-option-title">New tab</span>
              <span className="create-website__preview-modal-option-desc">
                Keep this page open while you review the site.
              </span>
            </button>
          </div>
        </Modal.Body>
        <Modal.Footer className="create-website__preview-modal-footer">
          <Button
            type="button"
            variant="link"
            className="create-website__preview-modal-cancel text-decoration-none"
            onClick={() => setPreviewTargetModalOpen(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
}
