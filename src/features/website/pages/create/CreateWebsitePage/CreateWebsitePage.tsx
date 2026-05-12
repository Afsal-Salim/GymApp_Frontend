'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useNavigationTypeCompat } from '@/hooks/useNavigationTypeCompat';
import {
  Accordion,
  Alert,
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
import { PageContainer } from '@/components/index/index';
import {
  checkBusinessSlugAvailability,
  deleteBusinessGalleryImage,
  getActiveSubscription,
  getBusinessDetail,
  invalidateUserBusinessListCache,
  invalidateUserAnalyticsCache,
  listBusinessImages,
  patchBusiness,
  resolveBusinessImageDisplayUrl,
  submitWebsiteSetupDraft,
  uploadBusinessImage,
  uploadBusinessLogo,
  deleteBusinessLogo,
  type ActiveSubscriptionResponse,
  type BusinessUploadedImage,
  type ListBusinessImagesResponse,
} from '@/api';
import { useToast } from '@/contexts/ToastContext/ToastContext';
import { crystalPreviewAbsoluteUrl, publicSiteDomain, visitPublicGymSite } from '@/config/env';
import { PLANS_PAGE_PATH } from '@/features/plans/PlansPage/PlansPage';
import {
  CRYSTAL_WEBSITE_SETUP_DRAFT_STORAGE_KEY,
  SESSION_CRYSTAL_CREATE_SKIP_ON_BACK,
} from '@/config/storageKeys';
import {
  consumePendingProTemplateKey,
  grantTemplateGateFromPreview,
  isCreateTemplateGateOk,
  isEditTemplateGateOk,
  stashInitialTemplateForSelectPage,
} from '@/features/website/templates/websiteTemplateGate/websiteTemplateGate';
import {
  buildDesignSystemSelectPageTemplateCards,
  buildProTemplateCards,
  isDesignSystemTemplateKey,
  PRO_TEMPLATE_PREVIEW_PATHS,
  type ProTemplateKey,
} from '@/features/website/templates/websiteProTemplateCards/websiteProTemplateCards';
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
  withPreviewEditReturn,
  writeCrystalWebsitePreviewToStorage,
  type CoachFormRow,
  type CreateWebsiteFormState,
  type CrystalWebsiteDraftPayload,
  type DiscountOfferFormRow,
  type MembershipPackageFormRow,
} from '@/features/website/setup/createWebsiteFormState/createWebsiteFormState';
import {
  formMatchesThemePreset,
  getPresetArtworkUrlForColors,
  WEBSITE_THEME_PRESETS,
  type WebsiteThemePreset,
} from '@/features/website/templates/websiteThemePresets/websiteThemePresets';
import {
  clampPercentOff,
  formatDerivedPrice,
  parseLoosePrice,
  parsePercentInputString,
  percentFromOriginalAndSale,
  saleFromOriginalAndPercent,
} from '@/features/website/setup/createWebsiteDiscountCalc/createWebsiteDiscountCalc';
import {
  GYM_CLIENT_SITE_DEFAULTS,
  isValidHttpLocationUrl,
  normalizeLocationMapUrl,
} from '@/features/crystal/gymClientSiteContent/gymClientSiteContent';
import { hexColorsEqual, normalizeHexColor } from '@/utils/hexColor';
import { clampPhoneDigitsInput, isTenDigitPhone } from '@/utils/phoneDigits';
import './CreateWebsitePage.css';

const SLUG_REGEX = /^([a-z0-9]+(?:-[a-z0-9]+)*)$/;

const MAX_IMAGE_UPLOAD_BYTES = 1024 * 1024; // 1 MB — logo, about body, coach photos, gallery
const MAX_HERO_BG_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB — hero background only (large landscape)

function formatImageUploadMaxLabel(maxBytes: number): string {
  const mb = maxBytes / (1024 * 1024);
  if (mb >= 1 && Number.isInteger(mb)) return `${mb} MB`;
  const kb = maxBytes / 1024;
  if (kb >= 1) return `${Math.max(1, Math.round(kb))} KB`;
  return `${maxBytes} bytes`;
}

/** Some browsers leave `file.type` empty for camera / drag-drop; fall back to extension. */
function fileLooksLikeGalleryImage(file: File): boolean {
  const mime = file.type?.trim().toLowerCase();
  if (mime.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif|bmp|avif)$/i.test(file.name ?? '');
}

const GALLERY_DND_TYPE = 'application/x-gym-gallery-key';

const GALLERY_KEY_PREFIX_SERVER = 's|';
const GALLERY_KEY_PREFIX_PENDING = 'p|';

/** Server gallery rows marked for removal in the UI; DELETE `…/images/?id=` runs on Save only. */
type GalleryPendingServerDelete = { id: number; url: string };

function galleryServerKey(imageUrl: string): string {
  return `${GALLERY_KEY_PREFIX_SERVER}${imageUrl}`;
}

function galleryPendingKey(localId: string): string {
  return `${GALLERY_KEY_PREFIX_PENDING}${localId}`;
}

function reconcileGalleryVisualKeys(
  prev: string[],
  serverUrls: string[],
  pendingIds: string[],
  savedServerOrder: string[]
): string[] {
  const valid = new Set([
    ...serverUrls.map(galleryServerKey),
    ...pendingIds.map(galleryPendingKey),
  ]);
  const filteredPrev = prev.filter((k) => valid.has(k));
  const used = new Set(filteredPrev);
  const out = [...filteredPrev];
  for (const url of savedServerOrder) {
    const k = galleryServerKey(url);
    if (valid.has(k) && !used.has(k)) {
      out.push(k);
      used.add(k);
    }
  }
  for (const url of serverUrls) {
    const k = galleryServerKey(url);
    if (!used.has(k)) {
      out.push(k);
      used.add(k);
    }
  }
  for (const id of pendingIds) {
    const k = galleryPendingKey(id);
    if (!used.has(k)) {
      out.push(k);
      used.add(k);
    }
  }
  return out;
}

function galleryKeysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function orderFromGalleryVisualKeys(keys: string[]): string[] {
  return keys
    .filter((k) => k.startsWith(GALLERY_KEY_PREFIX_SERVER))
    .map((k) => k.slice(GALLERY_KEY_PREFIX_SERVER.length));
}

async function uploadPendingGalleryInVisualOrder(
  slug: string,
  visualKeys: string[],
  pendingRows: { localId: string; file: File; previewUrl: string }[],
  uploadFn: typeof uploadBusinessImage
): Promise<Map<string, string>> {
  const pendingById = new Map(pendingRows.map((r) => [r.localId, r]));
  const urlByLocalId = new Map<string, string>();
  for (const key of visualKeys) {
    if (!key.startsWith(GALLERY_KEY_PREFIX_PENDING)) continue;
    const id = key.slice(GALLERY_KEY_PREFIX_PENDING.length);
    const row = pendingById.get(id);
    if (!row || urlByLocalId.has(id)) continue;
    const res = await uploadFn(slug, row.file, 'gallery');
    urlByLocalId.set(id, res.image_url);
  }
  for (const row of pendingRows) {
    if (urlByLocalId.has(row.localId)) continue;
    const res = await uploadFn(slug, row.file, 'gallery');
    urlByLocalId.set(row.localId, res.image_url);
  }
  return urlByLocalId;
}

function mergedGalleryOrderFromKeys(visualKeys: string[], urlByLocalId: Map<string, string>): string[] {
  return visualKeys
    .map((key) => {
      if (key.startsWith(GALLERY_KEY_PREFIX_SERVER)) return key.slice(GALLERY_KEY_PREFIX_SERVER.length);
      if (key.startsWith(GALLERY_KEY_PREFIX_PENDING)) {
        return urlByLocalId.get(key.slice(GALLERY_KEY_PREFIX_PENDING.length));
      }
      return undefined;
    })
    .filter((u): u is string => typeof u === 'string' && u.length > 0);
}

type GalleryPendingRow = { localId: string; file: File; previewUrl: string; dataUrl?: string };

/** Data URLs for pending files so `/preview` works across tabs (blob URLs are document-scoped). */
function applyPreviewGallerySlotsToDraft(
  draft: CrystalWebsiteDraftPayload,
  visualKeys: string[],
  pendingRows: GalleryPendingRow[]
): CrystalWebsiteDraftPayload {
  const pendingById = new Map(pendingRows.map((r) => [r.localId, r]));
  const slots = visualKeys
    .map((key) => {
      if (key.startsWith(GALLERY_KEY_PREFIX_SERVER)) return key.slice(GALLERY_KEY_PREFIX_SERVER.length).trim();
      if (key.startsWith(GALLERY_KEY_PREFIX_PENDING)) {
        const id = key.slice(GALLERY_KEY_PREFIX_PENDING.length);
        return pendingById.get(id)?.dataUrl?.trim() ?? '';
      }
      return '';
    })
    .filter(Boolean);

  const baseGallery = draft.content.gallery;
  if (slots.length === 0) {
    if (!baseGallery?.previewImageOrder?.length) return draft;
    const { previewImageOrder, ...rest } = baseGallery;
    void previewImageOrder;
    return {
      ...draft,
      content: {
        ...draft.content,
        gallery: Object.keys(rest).length > 0 ? rest : undefined,
      },
    };
  }

  return {
    ...draft,
    content: {
      ...draft.content,
      gallery: {
        sectionTitle: baseGallery?.sectionTitle?.trim() || 'Gallery',
        ...(baseGallery?.captionsByUrl && Object.keys(baseGallery.captionsByUrl).length > 0 ?
          { captionsByUrl: baseGallery.captionsByUrl }
        : {}),
        ...(baseGallery?.imageOrder?.length ? { imageOrder: baseGallery.imageOrder } : {}),
        previewImageOrder: slots,
      },
    },
  };
}

function planTierIsTrial(sub: ActiveSubscriptionResponse | null): boolean {
  if (!sub) return false;
  const t = (sub.plan_tier ?? '').toString().trim().toLowerCase();
  return t === 'trial';
}


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

type LogoStagingSnapshot = {
  /** From last GET detail — S3 vs external URL vs none. */
  serverLogoCanonical: 's3' | 'url' | null;
  /** Staged device file; uploaded on Save (same pattern as gallery pending rows). */
  logoStagedFile: File | null;
  /** Staged removal of server logo; DELETE on Save when S3. */
  logoStagedDelete: boolean;
};

/** Avoid persisting presigned S3 URLs or data URLs into `website_content.logo.src` on PATCH. */
function applyLogoPersistenceToDraftContent(
  content: { logo: { src: string; alt: string } },
  form: CreateWebsiteFormState,
  opts: LogoStagingSnapshot
): void {
  const gymName = form.gymName.trim();
  content.logo.alt = `${gymName || 'Gym'} logo`;
  if (opts.logoStagedFile) {
    content.logo.src = '';
    return;
  }
  if (opts.logoStagedDelete) {
    content.logo.src = '';
    return;
  }
  if (opts.serverLogoCanonical === 's3') {
    content.logo.src = '';
    return;
  }
  const t = form.logoUrl.trim();
  if (!t || isDataImageUrl(t)) {
    content.logo.src = '';
    return;
  }
  try {
    const u = new URL(t);
    content.logo.src = u.protocol === 'http:' || u.protocol === 'https:' ? t : '';
  } catch {
    content.logo.src = '';
  }
}

function buildLogoPatchUrl(
  form: CreateWebsiteFormState,
  opts: LogoStagingSnapshot
): { omitLogoUrl: boolean; logo_url?: string } {
  if (opts.logoStagedFile) {
    return { omitLogoUrl: true };
  }
  if (opts.logoStagedDelete) {
    return { omitLogoUrl: false, logo_url: '' };
  }
  if (opts.serverLogoCanonical === 's3') {
    return { omitLogoUrl: true };
  }
  const t = form.logoUrl.trim();
  const logoUrlForApi =
    !t || isDataImageUrl(t) ?
      ''
    : (() => {
        try {
          const u = new URL(t);
          return u.protocol === 'http:' || u.protocol === 'https:' ? t : '';
        } catch {
          return '';
        }
      })();
  return { omitLogoUrl: false, logo_url: logoUrlForApi };
}

/** Omit large data URLs from staged device uploads before first `website-setup` POST (create flow). */
function formWithoutStagedDataUrlsForSetup(
  f: CreateWebsiteFormState,
  opts: {
    heroStagedFile: File | null;
    aboutBgStagedFile: File | null;
    coachPhotoStagedFiles: Record<number, File>;
  }
): CreateWebsiteFormState {
  let o = { ...f };
  if (opts.heroStagedFile && isDataImageUrl(o.heroBackgroundImage)) {
    o = { ...o, heroBackgroundImage: '' };
  }
  if (opts.aboutBgStagedFile && isDataImageUrl(o.aboutBodyBgImageUrl)) {
    o = { ...o, aboutBodyBgImageUrl: '' };
  }
  if (Object.keys(opts.coachPhotoStagedFiles).length > 0) {
    const coaches = o.coaches.map((c, i) =>
      opts.coachPhotoStagedFiles[i] && isDataImageUrl(c.photoUrl) ? { ...c, photoUrl: '' } : c
    );
    o = { ...o, coaches };
  }
  return o;
}

function hasStagedSectionUploads(
  heroStagedFile: File | null,
  aboutBgStagedFile: File | null,
  coachPhotoStagedFiles: Record<number, File>
): boolean {
  return Boolean(heroStagedFile || aboutBgStagedFile || Object.keys(coachPhotoStagedFiles).length > 0);
}

/** POST `…/images/` with `asset_type` hero | background | dp; merge returned `image_url` into form. */
async function uploadStagedSectionImages(
  slug: string,
  form: CreateWebsiteFormState,
  heroStagedFile: File | null,
  aboutBgStagedFile: File | null,
  coachPhotoStagedFiles: Record<number, File>
): Promise<CreateWebsiteFormState> {
  let next = form;
  if (heroStagedFile) {
    const { image_url } = await uploadBusinessImage(slug, heroStagedFile, 'hero');
    next = { ...next, heroBackgroundImage: image_url };
  }
  if (aboutBgStagedFile && next.aboutBodyBgEnabled && !next.useDefaultPaletteArtwork) {
    const { image_url } = await uploadBusinessImage(slug, aboutBgStagedFile, 'background');
    next = { ...next, aboutBodyBgImageUrl: image_url };
  }
  const coachKeys = Object.keys(coachPhotoStagedFiles);
  if (coachKeys.length > 0) {
    const coaches = [...next.coaches];
    for (const k of coachKeys) {
      const idx = Number(k);
      if (!Number.isFinite(idx) || idx < 0 || idx >= coaches.length) continue;
      const file = coachPhotoStagedFiles[idx];
      if (!file) continue;
      const { image_url } = await uploadBusinessImage(slug, file, 'dp');
      coaches[idx] = { ...coaches[idx], photoUrl: image_url };
    }
    next = { ...next, coaches };
  }
  return next;
}

function RemoveRowTrashButton({
  ariaLabel,
  onClick,
  disabled,
}: {
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline-danger"
      size="sm"
      type="button"
      className="create-website__remove-row-btn"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
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
  /** Max file size for device upload; hero background allows a higher cap. */
  maxUploadBytes?: number;
  /** Called after validation, before the default data-URL read (e.g. stage file for save like gallery). */
  onChooseLocalFile?: (file: File) => void;
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
  maxUploadBytes = MAX_IMAGE_UPLOAD_BYTES,
  onChooseLocalFile,
}: ImageUrlOrUploadFieldProps) {
  const uploadMaxLabel = formatImageUploadMaxLabel(maxUploadBytes);
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
    const input = e.target;
    /** Grab `File` before `value = ''` — clearing the input empties the live `FileList` reference. */
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!fileLooksLikeGalleryImage(file)) {
      showToast('Please choose an image file (JPG, PNG, WebP, GIF, …).', 'warning');
      return;
    }
    if (file.size > maxUploadBytes) {
      showToast(`Image must be ${uploadMaxLabel} or smaller.`, 'warning');
      return;
    }
    onChooseLocalFile?.(file);
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
          <>Upload from your device only (no image URL). {ratioHint} Max {uploadMaxLabel}.</>
        : <>
            {ratioHint} Max upload size {uploadMaxLabel}.
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
            <span className="create-website__image-upload-zone-sub text-muted small">
              PNG, JPG, WebP, GIF — up to {uploadMaxLabel}
            </span>
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
  allowClear,
}: {
  id: string;
  label: string;
  hintId: string;
  hint: ReactNode;
  value: string;
  onChange: (hex: string) => void;
  pickerTitle: string;
  /** When true, clearing the input and blurring saves empty string (site uses built‑in default for that token). */
  allowClear?: boolean;
}) {
  const [hexDraft, setHexDraft] = useState(value);
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    setHexDraft(value);
  }, [value]);

  const commitHex = () => {
    if (allowClear && !hexDraft.trim()) {
      onChange('');
      setHexDraft('');
      return;
    }
    const n = normalizeHexColor(hexDraft);
    if (n) {
      onChange(n);
      setHexDraft(n);
    } else {
      setHexDraft(value);
    }
  };

  const normalizedValue = normalizeHexColor(value);
  const displayHex =
    allowClear && !normalizedValue ? '#d4d4d8' : (normalizedValue ?? '#e7e5e4');

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
  const router = useRouter();
  const navigationType = useNavigationTypeCompat();
  const searchParams = useSearchParams();
  const params = useParams<{ slug?: string | string[] }>();
  const editRouteSlug = (() => {
    const raw = params.slug;
    if (typeof raw === 'string') return raw.trim() || undefined;
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') return raw[0].trim() || undefined;
    return undefined;
  })();
  const isEditMode = Boolean(editRouteSlug);
  const fromPreviewFlow = searchParams.get('fromPreview') === '1';
  const [templateGateReady, setTemplateGateReady] = useState(false);
  const { showToast } = useToast();
  /** Edit flow must not seed from preview localStorage — wrong slug debounces and triggers a false “taken” check. */
  const [form, setForm] = useState<CreateWebsiteFormState>(() =>
    editRouteSlug ? initCreateWebsiteForm() : initialFormFromStorageOrDefaults()
  );
  const formRef = useRef(form);
  formRef.current = form;

  const previewEditSlugRef = useRef<string | undefined>(undefined);
  previewEditSlugRef.current =
    isEditMode && editRouteSlug?.trim() ? editRouteSlug.trim().toLowerCase() : undefined;
  const set = useCallback(<K extends keyof CreateWebsiteFormState>(key: K, value: CreateWebsiteFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const onHeroBackgroundChange = useCallback(
    (v: string) => {
      set('heroBackgroundImage', v);
      const t = v.trim();
      if (!t || !isDataImageUrl(t)) {
        setHeroStagedFile(null);
      }
    },
    [set]
  );

  const onHeroBackgroundChooseFile = useCallback((file: File) => {
    setHeroStagedFile(file);
  }, []);

  const onAboutBodyBgImageChange = useCallback(
    (v: string) => {
      set('aboutBodyBgImageUrl', v);
      const t = v.trim();
      if (!t || !isDataImageUrl(t)) {
        setAboutBgStagedFile(null);
      }
    },
    [set]
  );

  const onAboutBodyBgChooseFile = useCallback((file: File) => {
    setAboutBgStagedFile(file);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (fromPreviewFlow) {
      grantTemplateGateFromPreview(isEditMode, editRouteSlug);
      setTemplateGateReady(true);
      return;
    }
    if (!isEditMode) {
      if (!isCreateTemplateGateOk()) {
        router.replace('/user/create-website/select-template');
        return;
      }
      setTemplateGateReady(true);
      return;
    }
    const slug = editRouteSlug?.trim().toLowerCase();
    if (!slug) {
      setTemplateGateReady(true);
      return;
    }
    if (!isEditTemplateGateOk(slug)) {
      router.replace(`/user/business/${encodeURIComponent(slug)}/edit/select-template`);
      return;
    }
    setTemplateGateReady(true);
  }, [fromPreviewFlow, isEditMode, editRouteSlug, router]);

  /** After first-time save: modal prompts recharge (pricing) instead of a toast. */
  const [postSaveRechargeModalSlug, setPostSaveRechargeModalSlug] = useState<string | null>(null);
  /** In-page template preview modal (no new tab). */
  const [templatePreviewKey, setTemplatePreviewKey] = useState<ProTemplateKey | null>(null);
  /** Create flow: business slug exists after first successful save (enables S3 gallery uploads). */
  const [committedBusinessSlug, setCommittedBusinessSlug] = useState<string | null>(null);
  const [galleryList, setGalleryList] = useState<ListBusinessImagesResponse | null>(null);
  const [galleryListLoading, setGalleryListLoading] = useState(false);
  /** Staged files — uploaded only when the main Save button runs. */
  const [galleryPending, setGalleryPending] = useState<GalleryPendingRow[]>([]);
  const [galleryVisualKeys, setGalleryVisualKeys] = useState<string[]>([]);
  const galleryVisualKeysRef = useRef(galleryVisualKeys);
  const galleryPendingRef = useRef(galleryPending);
  galleryVisualKeysRef.current = galleryVisualKeys;
  galleryPendingRef.current = galleryPending;
  const [galleryFileDragOver, setGalleryFileDragOver] = useState(false);
  const [builderSubscription, setBuilderSubscription] = useState<ActiveSubscriptionResponse | null>(null);
  const [galleryPreviewSrc, setGalleryPreviewSrc] = useState<string | null>(null);
  const [galleryServerDeletesPending, setGalleryServerDeletesPending] = useState<GalleryPendingServerDelete[]>([]);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  /** Drop staged files when switching which business is being edited (avoid wrong blob previews). */
  const galleryPendingSlugRef = useRef<string | undefined>(undefined);

  const applyThemePreset = useCallback((preset: WebsiteThemePreset) => {
    setForm((f) => ({
      ...f,
      accentColor: preset.accentColor,
      darkColor: preset.darkColor,
      textColor: preset.textColor,
      lightColor: preset.lightColor,
      aboutSectionBg: '',
      aboutFeatureCardBg: '',
      packagesSectionBg: '',
      packageCardBg: '',
      metaSectionBg: '',
      metaPanelBg: '',
      metaRowBg: '',
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
    setAboutBgStagedFile(null);
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

  const onCoachPhotoUrlChange = useCallback(
    (index: number, v: string) => {
      patchCoach(index, { photoUrl: v });
      if (!v.trim() || !isDataImageUrl(v)) {
        setCoachPhotoStagedFiles((prev) => {
          if (!(index in prev)) return prev;
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    },
    [patchCoach]
  );

  const onCoachPhotoChooseFile = useCallback((index: number, file: File) => {
    setCoachPhotoStagedFiles((prev) => ({ ...prev, [index]: file }));
  }, []);

  const addCoach = useCallback(() => {
    setForm((f) =>
      f.coaches.length >= CREATE_WEBSITE_MAX_COACHES ? f : { ...f, coaches: [...f.coaches, emptyCoachRow()] }
    );
  }, []);

  const removeCoach = useCallback((index: number) => {
    setForm((f) => ({ ...f, coaches: f.coaches.filter((_, i) => i !== index) }));
    setCoachPhotoStagedFiles((prev) => {
      const next: Record<number, File> = {};
      for (const [k, file] of Object.entries(prev)) {
        const i = Number(k);
        if (i < index) next[i] = file;
        else if (i > index) next[i - 1] = file;
      }
      return next;
    });
  }, []);

  const [editReady, setEditReady] = useState(!isEditMode);
  const [editBaselineSlug, setEditBaselineSlug] = useState<string | null>(null);
  /** From GET detail — whether the saved logo lives in S3 vs external URL (controls PATCH semantics). */
  const [serverLogoCanonical, setServerLogoCanonical] = useState<'s3' | 'url' | null>(null);
  /** Staged logo file — POST `…/images/` with `asset_type=logo` on Save (same idea as gallery pending uploads). */
  const [logoStagedFile, setLogoStagedFile] = useState<File | null>(null);
  /** Staged removal — DELETE `…/images/?asset_type=logo` (branding logo) on Save when {@link serverLogoCanonical} is `s3`. */
  const [logoStagedDelete, setLogoStagedDelete] = useState(false);
  /** Device file staged for POST `…/images/?asset_type=hero` on Save (avoid data URLs in `website_content`). */
  const [heroStagedFile, setHeroStagedFile] = useState<File | null>(null);
  const [aboutBgStagedFile, setAboutBgStagedFile] = useState<File | null>(null);
  const [coachPhotoStagedFiles, setCoachPhotoStagedFiles] = useState<Record<number, File>>({});

  const editLogoSlug = useMemo(
    () => (editBaselineSlug ?? editRouteSlug?.trim().toLowerCase() ?? '').trim(),
    [editBaselineSlug, editRouteSlug]
  );

  useEffect(() => {
    if (!editRouteSlug) {
      setEditReady(true);
      setEditBaselineSlug(null);
      setServerLogoCanonical(null);
      setLogoStagedFile(null);
      setLogoStagedDelete(false);
      setHeroStagedFile(null);
      setAboutBgStagedFile(null);
      setCoachPhotoStagedFiles({});
      return;
    }
    let cancelled = false;
    setEditReady(false);
    getBusinessDetail(editRouteSlug)
      .then((d) => {
        if (cancelled) return;
        setForm(createWebsiteFormFromBusinessDetail(d, editRouteSlug));
        setEditBaselineSlug(d.slug?.trim().toLowerCase() ?? editRouteSlug.trim().toLowerCase());
        setServerLogoCanonical(d.logo?.type === 's3' ? 's3' : d.logo?.type === 'url' ? 'url' : null);
        setLogoStagedFile(null);
        setLogoStagedDelete(false);
        setHeroStagedFile(null);
        setAboutBgStagedFile(null);
        setCoachPhotoStagedFiles({});
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

  const onLogoFieldValueChange = useCallback(
    (v: string) => {
      setForm((f) => ({ ...f, logoUrl: v }));
      const t = v.trim();
      if (!t) {
        setLogoStagedFile(null);
        setLogoStagedDelete(serverLogoCanonical !== null);
        return;
      }
      if (isDataImageUrl(t)) {
        return;
      }
      setLogoStagedFile(null);
      setLogoStagedDelete(false);
    },
    [serverLogoCanonical]
  );

  const onLogoChooseLocalFile = useCallback((file: File) => {
    setLogoStagedFile(file);
    setLogoStagedDelete(false);
  }, []);

  const handleStageRemoveLogo = useCallback(() => {
    if (!isEditMode || !editReady) return;
    setLogoStagedDelete(true);
    setLogoStagedFile(null);
    setForm((f) => ({ ...f, logoUrl: '' }));
  }, [isEditMode, editReady]);

  /**
   * “Edit setup” from `/preview`: merge latest preview draft. Create flow runs immediately; edit flow waits for
   * `getBusinessDetail` so slug baseline exists (avoids false “URL taken” from preview slug alone).
   */
  useEffect(() => {
    const fromPreview = searchParams.get('fromPreview') === '1';
    if (!fromPreview) return;
    const draft = readCrystalWebsitePreviewFromStorage();
    if (!draft) return;
    if (isEditMode) {
      if (!editReady) return;
      const hint = draft.editBusinessSlug?.trim().toLowerCase();
      const routeSlug = editRouteSlug?.trim().toLowerCase();
      if (hint && routeSlug && hint !== routeSlug) return;
      setForm(draftPayloadToFormState(draft));
      setServerLogoCanonical(null);
      setLogoStagedFile(null);
      setLogoStagedDelete(false);
      setHeroStagedFile(null);
      setAboutBgStagedFile(null);
      setCoachPhotoStagedFiles({});
      return;
    }
    setForm(draftPayloadToFormState(draft));
    setHeroStagedFile(null);
    setAboutBgStagedFile(null);
    setCoachPhotoStagedFiles({});
  }, [searchParams, isEditMode, editReady, editRouteSlug]);

  /** Apply template choice from the standalone template step (overrides draft/server on return from picker). */
  useEffect(() => {
    if (!templateGateReady || isEditMode) return;
    const p = consumePendingProTemplateKey();
    if (p === null) return;
    setForm((f) => ({ ...f, proTemplateKey: p }));
  }, [templateGateReady, isEditMode]);

  useEffect(() => {
    if (!templateGateReady || !isEditMode || !editReady) return;
    const p = consumePendingProTemplateKey();
    if (p === null) return;
    setForm((f) => ({ ...f, proTemplateKey: p }));
  }, [templateGateReady, isEditMode, editReady]);

  /**
   * After “Preview in this tab” or “View my site” from the save modal, the history stack can return here on Back.
   * Send the user to profile instead of trapping them in the wizard again.
   */
  useEffect(() => {
    if (isEditMode) return;
    try {
      if (navigationType === 'POP' && sessionStorage.getItem(SESSION_CRYSTAL_CREATE_SKIP_ON_BACK) === '1') {
        sessionStorage.removeItem(SESSION_CRYSTAL_CREATE_SKIP_ON_BACK);
        router.replace('/user');
        return;
      }
      if (navigationType !== 'POP') {
        sessionStorage.removeItem(SESSION_CRYSTAL_CREATE_SKIP_ON_BACK);
      }
    } catch {
      /* sessionStorage unavailable */
    }
  }, [navigationType, isEditMode, router]);

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
   *
   * Skip when the URL slug field is still empty: SSR/hydration can start with an empty form before
   * `fromPreview` merges localStorage — writing would persist `slug: "preview"` and wipe the user’s chosen URL.
   */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const f = formRef.current;
    const slugTrim = f.slug.trim().toLowerCase();
    if (!slugTrim) return;
    const draft = mapFormToWebsiteDraft({ ...f, slug: slugTrim });
    writeCrystalWebsitePreviewToStorage(
      withPreviewEditReturn(
        applyPreviewGallerySlotsToDraft(draft, galleryVisualKeysRef.current, galleryPendingRef.current),
        previewEditSlugRef.current
      )
    );
  }, [
    form.slug,
    form.useDefaultPaletteArtwork,
    form.aboutBodyBgImageUrl,
    form.aboutBodyBgEnabled,
    form.accentColor,
    form.darkColor,
    form.textColor,
    form.lightColor,
    galleryVisualKeys,
    galleryPending,
  ]);

  /** Live-sync preview draft to localStorage so `/preview` updates (debounced; runs in create and edit). */
  useEffect(() => {
    const t = window.setTimeout(() => {
      const f = formRef.current;
      const slugForPreview = f.slug.trim().toLowerCase();
      if (!slugForPreview) return;
      const draft = mapFormToWebsiteDraft({ ...f, slug: slugForPreview });
      writeCrystalWebsitePreviewToStorage(
        withPreviewEditReturn(
          applyPreviewGallerySlotsToDraft(draft, galleryVisualKeysRef.current, galleryPendingRef.current),
          previewEditSlugRef.current
        )
      );
    }, PREVIEW_LIVE_SYNC_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [form, galleryVisualKeys, galleryPending]);

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
    /** Route + API baseline: any match means “still this gym’s slug” (handles null baseline before detail loads). */
    const reservedEditSlugNorm =
      isEditMode ? (editBaselineSlug || editRouteSlug || '').trim().toLowerCase() : '';
    if (reservedEditSlugNorm && debouncedSlug === reservedEditSlugNorm) {
      setSlugStatus('available');
      setSlugDetail(undefined);
      return;
    }
    const id = ++reqId.current;
    setSlugStatus('checking');
    setSlugDetail(undefined);
    void checkBusinessSlugAvailability(debouncedSlug, {
      reservedSlug: reservedEditSlugNorm || undefined,
    }).then((r) => {
      if (reqId.current !== id) return;
      setSlugStatus(r.available ? 'available' : 'unavailable');
      setSlugDetail(r.message);
    });
  }, [debouncedSlug, isEditMode, editBaselineSlug, editRouteSlug]);

  const galleryUploadSlug = useMemo(() => {
    if (isEditMode) {
      return (editBaselineSlug ?? editRouteSlug?.trim().toLowerCase() ?? '').trim();
    }
    return (committedBusinessSlug ?? '').trim();
  }, [isEditMode, editBaselineSlug, editRouteSlug, committedBusinessSlug]);

  useEffect(() => {
    setGalleryServerDeletesPending([]);
  }, [editRouteSlug, galleryUploadSlug]);

  useEffect(() => {
    if (!galleryUploadSlug || (isEditMode && !editReady)) {
      setBuilderSubscription(null);
      return;
    }
    let cancelled = false;
    getActiveSubscription(galleryUploadSlug)
      .then((d) => {
        if (!cancelled) setBuilderSubscription(d);
      })
      .catch(() => {
        if (!cancelled) setBuilderSubscription(null);
      });
    return () => {
      cancelled = true;
    };
  }, [galleryUploadSlug, isEditMode, editReady]);

  useEffect(() => {
    if (!galleryUploadSlug || (isEditMode && !editReady)) {
      setGalleryList(null);
      setGalleryListLoading(false);
      return;
    }
    let cancelled = false;
    setGalleryListLoading(true);
    listBusinessImages(galleryUploadSlug)
      .then((res) => {
        if (!cancelled) setGalleryList(res);
      })
      .catch(() => {
        if (!cancelled) setGalleryList(null);
      })
      .finally(() => {
        if (!cancelled) setGalleryListLoading(false);
      });
    return () => {
      cancelled = true;
      setGalleryListLoading(false);
    };
  }, [galleryUploadSlug, isEditMode, editReady]);

  const effectiveGalleryLimit = useMemo(() => {
    if (galleryList && galleryList.slots_limit > 0) {
      return galleryList.slots_limit;
    }
    if (galleryList && galleryList.slots_limit === 0 && (galleryList.images?.length ?? 0) === 0) {
      /** API may report 0 while storage is still usable — allow staging; server rejects if truly disabled. */
      return 5;
    }
    if (builderSubscription) {
      return planTierIsTrial(builderSubscription) ? 5 : 10;
    }
    /** Subscription or image list still loading — stay conservative until `slots_limit` or plan resolves. */
    return 5;
  }, [galleryList, builderSubscription]);

  /**
   * Slots “used” for this UI = actual gallery rows returned by GET …/images/ (plus pending files).
   * Do not rely on `slots_used` alone — some APIs omit it or return 0 while `images` still lists files,
   * which incorrectly showed “0 / 5” with photos already on the gym.
   */
  const pendingDeletedGalleryUrls = useMemo(
    () => new Set(galleryServerDeletesPending.map((d) => d.url)),
    [galleryServerDeletesPending]
  );

  const serverGalleryImageCount = useMemo(() => {
    const list = galleryList?.images;
    if (!list?.length) return 0;
    return list.filter(
      (img) =>
        (!img.asset || img.asset === 'gallery') && !pendingDeletedGalleryUrls.has(img.image_url)
    ).length;
  }, [galleryList, pendingDeletedGalleryUrls]);

  const galleryStagedCount = serverGalleryImageCount + galleryPending.length;
  const galleryAtCapacity =
    effectiveGalleryLimit > 0 ? galleryStagedCount >= effectiveGalleryLimit : effectiveGalleryLimit === 0;

  const serverGalleryUrls = useMemo(
    () =>
      (galleryList?.images ?? [])
        .filter((img) => !img.asset || img.asset === 'gallery')
        .map((img) => img.image_url)
        .filter((url) => !pendingDeletedGalleryUrls.has(url)),
    [galleryList, pendingDeletedGalleryUrls]
  );

  const pendingLocalIds = useMemo(() => galleryPending.map((r) => r.localId), [galleryPending]);

  useEffect(() => {
    if (!isEditMode) {
      galleryPendingSlugRef.current = undefined;
      setGalleryVisualKeys((prev) =>
        reconcileGalleryVisualKeys(prev, serverGalleryUrls, pendingLocalIds, formRef.current.galleryImageOrder)
      );
      return;
    }
    const slugNorm = editRouteSlug?.trim().toLowerCase();
    const prevStoredSlug = galleryPendingSlugRef.current;
    if (slugNorm && prevStoredSlug != null && prevStoredSlug !== slugNorm) {
      setGalleryPending((rows) => {
        for (const r of rows) URL.revokeObjectURL(r.previewUrl);
        return [];
      });
    }
    if (slugNorm) galleryPendingSlugRef.current = slugNorm;
    if (!slugNorm || !editReady) return;
    setGalleryVisualKeys((prev) =>
      reconcileGalleryVisualKeys(prev, serverGalleryUrls, pendingLocalIds, formRef.current.galleryImageOrder)
    );
  }, [isEditMode, editRouteSlug, editReady, serverGalleryUrls, pendingLocalIds]);

  useEffect(() => {
    const urls = orderFromGalleryVisualKeys(galleryVisualKeys);
    setForm((f) => {
      if (galleryKeysEqual(f.galleryImageOrder, urls)) return f;
      return { ...f, galleryImageOrder: urls };
    });
  }, [galleryVisualKeys]);

  const addGalleryFilesFromList = useCallback(
    (files: FileList | File[] | null | undefined) => {
      const picked = files && files.length ? Array.from(files) : [];
      if (!picked.length) return;
      if (isEditMode && !editReady) {
        showToast('Still loading this gym — wait a moment, then try adding photos again.');
        return;
      }
      if (effectiveGalleryLimit <= 0) {
        showToast('Image storage is not available right now.');
        return;
      }
      const toAppend: GalleryPendingRow[] = [];
      let wouldBeCount = galleryStagedCount;
      for (const file of picked) {
        if (wouldBeCount >= effectiveGalleryLimit) {
          if (toAppend.length === 0) {
            showToast(`You can have up to ${effectiveGalleryLimit} images on your current plan.`);
          } else {
            showToast(`Added ${toAppend.length} image(s). Gallery is full — remaining files were skipped.`);
          }
          break;
        }
        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          showToast('Each image must be 1 MB or smaller.');
          continue;
        }
        if (!fileLooksLikeGalleryImage(file)) {
          showToast('Use JPG, PNG, WebP, or GIF.');
          continue;
        }
        const localId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ?
            crypto.randomUUID()
          : `g-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        toAppend.push({ localId, file, previewUrl: URL.createObjectURL(file) });
        wouldBeCount += 1;
      }
      if (toAppend.length > 0) {
        setGalleryPending((rows) => [...rows, ...toAppend]);
        setGalleryVisualKeys((keys) => {
          let next = keys;
          for (const row of toAppend) {
            const k = galleryPendingKey(row.localId);
            if (!next.includes(k)) {
              if (next === keys) next = [...keys];
              next.push(k);
            }
          }
          return next;
        });
        for (const row of toAppend) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result !== 'string') return;
            setGalleryPending((prev) =>
              prev.map((p) => (p.localId === row.localId ? { ...p, dataUrl: result } : p))
            );
          };
          reader.readAsDataURL(row.file);
        }
      }
    },
    [isEditMode, editReady, effectiveGalleryLimit, galleryStagedCount, showToast]
  );

  const handleGalleryFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      /** Snapshot before reset — `input.files` is a live list that clears when the input is reset. */
      const picked = input.files?.length ? Array.from(input.files) : [];
      input.value = '';
      addGalleryFilesFromList(picked);
    },
    [addGalleryFilesFromList]
  );

  const removeGalleryPendingRow = useCallback((localId: string) => {
    setGalleryPending((rows) => {
      const row = rows.find((r) => r.localId === localId);
      if (row) URL.revokeObjectURL(row.previewUrl);
      return rows.filter((r) => r.localId !== localId);
    });
  }, []);

  const moveGalleryVisualKey = useCallback((draggedKey: string, targetKey: string) => {
    if (draggedKey === targetKey) return;
    setGalleryVisualKeys((keys) => {
      const from = keys.indexOf(draggedKey);
      const to = keys.indexOf(targetKey);
      if (from < 0 || to < 0) return keys;
      const next = [...keys];
      next.splice(from, 1);
      next.splice(to, 0, draggedKey);
      return next;
    });
  }, []);

  const serverImageByUrl = useMemo(() => {
    const m = new Map<string, BusinessUploadedImage>();
    for (const img of galleryList?.images ?? []) {
      if (!img.asset || img.asset === 'gallery') m.set(img.image_url, img);
    }
    return m;
  }, [galleryList]);

  const pendingByLocalId = useMemo(() => new Map(galleryPending.map((r) => [r.localId, r])), [galleryPending]);

  const openGalleryPreview = useCallback((src: string) => {
    setGalleryPreviewSrc(src);
  }, []);

  const stageRemoveServerGalleryImage = useCallback(
    (img: BusinessUploadedImage) => {
      if (!galleryUploadSlug) return;
      if (
        !window.confirm(
          'Remove this photo from the gallery? It will disappear here until you save. Your public site updates after you click Save.'
        )
      ) {
        return;
      }
      const imageUrl = img.image_url;
      const pk = img.id;
      if (pk == null || !Number.isFinite(pk) || pk <= 0) {
        showToast('Cannot remove this image (missing id). Try refreshing the page.');
        return;
      }
      setGalleryServerDeletesPending((rows) =>
        rows.some((r) => r.url === imageUrl) ? rows : [...rows, { id: pk, url: imageUrl }]
      );
      setForm((f) => {
        const next = { ...f.galleryCaptions };
        delete next[imageUrl];
        return { ...f, galleryCaptions: next };
      });
    },
    [galleryUploadSlug, showToast]
  );

  useEffect(() => {
    return () => {
      for (const row of galleryPendingRef.current) {
        URL.revokeObjectURL(row.previewUrl);
      }
    };
  }, []);

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

  const proTemplateCards = useMemo(() => buildProTemplateCards(), []);
  const designSystemTemplateCards = useMemo(() => buildDesignSystemSelectPageTemplateCards(), []);
  const allTemplatePickerCards = useMemo(
    () => [...proTemplateCards, ...designSystemTemplateCards],
    [proTemplateCards, designSystemTemplateCards],
  );
  const selectedTemplateLabel =
    form.proTemplateKey ?
      allTemplatePickerCards.find((c) => c.key === form.proTemplateKey)?.label ?? 'Selected template'
    : 'Crystal default theme';

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
    if (isEditMode) {
      const baseline = editBaselineSlug ?? editRouteSlug?.trim().toLowerCase();
      if (!editRouteSlug?.trim() || !baseline) {
        showToast('Missing business to edit.');
        return;
      }
      const pendingSnapshot = [...galleryPending];
      const visualKeysSnapshot = [...galleryVisualKeys];
      const pendingDeletesSnapshot = [...galleryServerDeletesPending];
      const heroSnap = heroStagedFile;
      const aboutSnap = aboutBgStagedFile;
      const coachSnap = { ...coachPhotoStagedFiles };
      setSaving(true);
      try {
        if (pendingDeletesSnapshot.length > 0) {
          for (const row of pendingDeletesSnapshot) {
            await deleteBusinessGalleryImage(baseline, row.id);
          }
          setGalleryServerDeletesPending([]);
        }
        if (logoStagedDelete && !logoStagedFile && serverLogoCanonical === 's3') {
          await deleteBusinessLogo(baseline);
        }
        const urlByLocalId =
          pendingSnapshot.length > 0 ?
            await uploadPendingGalleryInVisualOrder(
              baseline,
              visualKeysSnapshot,
              pendingSnapshot,
              uploadBusinessImage
            )
          : new Map<string, string>();
        if (logoStagedFile) {
          await uploadBusinessLogo(baseline, logoStagedFile);
        }
        let formForPatch = form;
        if (hasStagedSectionUploads(heroSnap, aboutSnap, coachSnap)) {
          formForPatch = await uploadStagedSectionImages(
            baseline,
            form,
            heroSnap,
            aboutSnap,
            coachSnap
          );
          setHeroStagedFile(null);
          setAboutBgStagedFile(null);
          setCoachPhotoStagedFiles({});
          setForm(formForPatch);
        }
        const mergedGalleryImageOrder = mergedGalleryOrderFromKeys(visualKeysSnapshot, urlByLocalId);
        const logoSnap: LogoStagingSnapshot = {
          serverLogoCanonical,
          logoStagedFile,
          logoStagedDelete,
        };
        const draft = mapFormToWebsiteDraft({
          ...formForPatch,
          slug,
          galleryImageOrder: mergedGalleryImageOrder,
        });
        applyLogoPersistenceToDraftContent(draft.content, formForPatch, logoSnap);
        const mapNorm = mapRaw && isValidHttpLocationUrl(mapRaw) ? normalizeLocationMapUrl(mapRaw) : '';
        const logoPatch = buildLogoPatchUrl(formForPatch, logoSnap);
        const patchBody: Parameters<typeof patchBusiness>[1] = {
          name: formForPatch.gymName.trim(),
          slug,
          description: formForPatch.businessDescription.trim(),
          phone: phoneDigits,
          address: formForPatch.contactAddress.trim(),
          location_map_url: mapNorm,
          website_theme: {
            accentHex: draft.theme.accentHex.trim() || '#ea580c',
            darkHex: draft.theme.darkHex.trim() || '#0c0a09',
            textHex: draft.theme.textHex.trim() || GYM_CLIENT_DEFAULT_TEXT_HEX,
            lightHex: draft.theme.lightHex?.trim() || GYM_CLIENT_DEFAULT_LIGHT_HEX,
          },
          website_content: draft.content,
        };
        if (!logoPatch.omitLogoUrl) {
          patchBody.logo_url = logoPatch.logo_url ?? '';
        }
        await patchBusiness(baseline, patchBody);
        setLogoStagedFile(null);
        setLogoStagedDelete(false);
        for (const row of pendingSnapshot) {
          URL.revokeObjectURL(row.previewUrl);
        }
        if (pendingSnapshot.length > 0) {
          setGalleryPending([]);
          setForm((f) => ({ ...f, galleryImageOrder: mergedGalleryImageOrder }));
        }
        try {
          setGalleryList(await listBusinessImages(baseline));
        } catch {
          /* list refresh is best-effort */
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Could not save changes. Try again.');
        return;
      } finally {
        setSaving(false);
      }
      showToast('Business and website updated.', 'success');
      invalidateUserBusinessListCache();
      invalidateUserAnalyticsCache();
      router.push('/user');
      return;
    }

    const logoFileSnapshot = logoStagedFile;
    const heroSnap = heroStagedFile;
    const aboutSnap = aboutBgStagedFile;
    const coachSnap = { ...coachPhotoStagedFiles };
    const sectionStaged = hasStagedSectionUploads(heroSnap, aboutSnap, coachSnap);
    const formForSetup =
      sectionStaged ?
        formWithoutStagedDataUrlsForSetup(form, {
          heroStagedFile: heroSnap,
          aboutBgStagedFile: aboutSnap,
          coachPhotoStagedFiles: coachSnap,
        })
      : form;
    const draft = mapFormToWebsiteDraft({ ...formForSetup, slug });
    if (logoFileSnapshot) {
      draft.content.logo.src = '';
    }
    const pendingDeletesSnapshot = [...galleryServerDeletesPending];
    setSaving(true);
    try {
      if (pendingDeletesSnapshot.length > 0) {
        for (const row of pendingDeletesSnapshot) {
          await deleteBusinessGalleryImage(slug, row.id);
        }
        setGalleryServerDeletesPending([]);
      }
      await submitWebsiteSetupDraft(draft);
      let formMerged = form;
      if (sectionStaged) {
        formMerged = await uploadStagedSectionImages(slug, form, heroSnap, aboutSnap, coachSnap);
        setHeroStagedFile(null);
        setAboutBgStagedFile(null);
        setCoachPhotoStagedFiles({});
        setForm(formMerged);
      }
      if (logoFileSnapshot) {
        try {
          await uploadBusinessLogo(slug, logoFileSnapshot);
          setLogoStagedFile(null);
        } catch (logoErr) {
          showToast(
            logoErr instanceof Error ? logoErr.message : 'Website saved but logo upload failed.',
            'warning'
          );
        }
      }
      const pendingSnapshot = [...galleryPending];
      const visualKeysSnapshot = [...galleryVisualKeys];
      const urlByLocalId =
        pendingSnapshot.length > 0 ?
          await uploadPendingGalleryInVisualOrder(slug, visualKeysSnapshot, pendingSnapshot, uploadBusinessImage)
        : new Map<string, string>();
      const mergedGalleryImageOrder = mergedGalleryOrderFromKeys(visualKeysSnapshot, urlByLocalId);
      if (pendingSnapshot.length > 0 || pendingDeletesSnapshot.length > 0 || sectionStaged) {
        const draftWithGallery = mapFormToWebsiteDraft({
          ...formMerged,
          slug,
          galleryImageOrder: mergedGalleryImageOrder,
        });
        if (logoFileSnapshot) {
          draftWithGallery.content.logo.src = '';
        }
        await patchBusiness(slug, { website_content: draftWithGallery.content });
      }
      for (const row of pendingSnapshot) {
        URL.revokeObjectURL(row.previewUrl);
      }
      if (pendingSnapshot.length > 0 || pendingDeletesSnapshot.length > 0) {
        setForm((f) => ({ ...f, galleryImageOrder: mergedGalleryImageOrder }));
      }
      if (pendingSnapshot.length > 0) {
        setGalleryPending([]);
      }
      try {
        setGalleryList(await listBusinessImages(slug));
      } catch {
        /* list refresh is best-effort */
      }
      const draftForStorage =
        sectionStaged || pendingSnapshot.length > 0 || pendingDeletesSnapshot.length > 0 ?
          mapFormToWebsiteDraft({ ...formMerged, slug, galleryImageOrder: mergedGalleryImageOrder })
        : draft;
      try {
        sessionStorage.setItem(CRYSTAL_WEBSITE_SETUP_DRAFT_STORAGE_KEY, JSON.stringify(draftForStorage));
      } catch {
        /* quota */
      }
      invalidateUserBusinessListCache();
      invalidateUserAnalyticsCache();
      setCommittedBusinessSlug(slug);
      setPostSaveRechargeModalSlug(slug);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not save website setup. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const savePreviewDraftToStorage = (): boolean => {
    const slugForPreview = form.slug.trim().toLowerCase() || 'preview';
    const draft = mapFormToWebsiteDraft({ ...form, slug: slugForPreview });
    return writeCrystalWebsitePreviewToStorage(
      withPreviewEditReturn(
        applyPreviewGallerySlotsToDraft(draft, galleryVisualKeys, galleryPending),
        previewEditSlugRef.current
      )
    );
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
    try {
      sessionStorage.setItem(SESSION_CRYSTAL_CREATE_SKIP_ON_BACK, '1');
    } catch {
      /* quota */
    }
    router.replace('/preview');
  };

  const iconOpts = (
    <>
      <option value="coaches">Coaches</option>
      <option value="facility">Facility</option>
      <option value="results">Results</option>
    </>
  );

  return (
    <PageContainer className="create-website__page-container--builder">
      <main className="create-website">
        <Container className="create-website__container create-website__container--builder py-4">
          <div className="create-website__preview-sticky">
            <div className="create-website__preview-dock">
              <Button
                type="button"
                variant="primary"
                className="create-website__preview-dock-btn"
                disabled={!templateGateReady || (isEditMode && !editReady)}
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
          </div>
          <div className="create-website__head">
            <div>
              <h1 className="create-website__title h3 mb-1">
                {isEditMode ? 'Edit gym website' : 'Create your gym website'}
              </h1>
              <p className="create-website__content-policy-hint small text-muted mb-0 mt-2">
                You are responsible for having the rights to all images, videos, and text you publish. Do not use
                copyrighted or unlicensed material. Do not share end-user personal data improperly. See{' '}
                <Link href="/legal/user-content" target="_blank" rel="noopener noreferrer">
                  User Content Responsibility
                </Link>
                {' and '}
                <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="create-website__head-actions">
              <Link
                href={
                  isEditMode && editRouteSlug ?
                    `/user/business/${encodeURIComponent(editRouteSlug)}/edit/select-template`
                  : '/user/create-website/select-template'
                }
                className="btn btn-outline-primary btn-sm"
                onClick={() => stashInitialTemplateForSelectPage(form.proTemplateKey)}
              >
                Select template
              </Link>
              <Link href="/user" className="btn btn-outline-secondary btn-sm">
                ← Back to profile
              </Link>
            </div>
          </div>

          <Card className="create-website__card mt-3">
            <Card.Body>
              {!templateGateReady ?
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" className="mb-2" />
                  <p className="text-muted small mb-0">Loading…</p>
                </div>
              : isEditMode && !editReady ?
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" className="mb-2" />
                  <p className="text-muted small mb-0">Loading business…</p>
                </div>
              : null}
              <Form
                className={!templateGateReady || (isEditMode && !editReady) ? 'd-none' : undefined}
                onSubmit={handleSubmit}
                aria-hidden={!templateGateReady || (isEditMode && !editReady) ? true : undefined}
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
                      <div className="create-website__current-template mt-3">
                        <div className="create-website__current-template-top">
                          <h4 className="h6 mb-1">Current client page template</h4>
                          {!form.proTemplateKey ? (
                            <span className="badge text-bg-success">Base</span>
                          ) : isDesignSystemTemplateKey(form.proTemplateKey) ?
                            <span className="badge text-bg-dark">Max</span>
                          : (
                            <span className="badge text-bg-warning">Pro</span>
                          )}
                        </div>
                        <p className="small text-muted mb-1">
                          {selectedTemplateLabel}
                          {form.proTemplateKey ? ' is selected for your public client page.' : ' is active for your public client page.'}
                        </p>
                        <p className="small text-muted mb-0">
                          Use <strong>Select template</strong> to change the layout. Tiers: <strong>Base</strong> (Crystal
                          default) · <strong>Pro</strong> (classic full-page layouts and design-system section blocks) ·{' '}
                          <strong>Max</strong> (design-system full-page packs). Saving any non-Base template requires an
                          active <strong>Pro</strong> subscription.
                        </p>
                        {form.proTemplateKey ?
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            <Button
                              type="button"
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => setTemplatePreviewKey(form.proTemplateKey as ProTemplateKey)}
                            >
                              Preview current template
                            </Button>
                            <Button
                              type="button"
                              variant="light"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  PRO_TEMPLATE_PREVIEW_PATHS[form.proTemplateKey as ProTemplateKey],
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                            >
                              Open in new tab
                            </Button>
                          </div>
                        : null}
                      </div>
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

                  <Accordion.Item eventKey="brand" id="cw-site-brand" className="create-website__accordion-item">
                    <Accordion.Header>Brand colors &amp; logo</Accordion.Header>
                    <Accordion.Body>
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
                        Color palettes
                      </p>
                      <p className="small text-muted mb-3">
                        Pick one preset to set your site&apos;s brand colours.{' '}
                        {form.useDefaultPaletteArtwork ?
                          'Each card shows Crystal reference artwork for that palette.'
                        : 'Each card shows accent → dark ink → body text → light surfaces (left to right).'}
                      </p>
                      <div className="create-website__theme-presets mb-3" role="group" aria-label="Color palettes">
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
                      <ImageUrlOrUploadField
                        id="cw-logo"
                        label="Logo image (optional)"
                        hintId="cw-hint-logo"
                        hint="If empty, the site uses the default Crystal client logo. Use a square or wide logo; URL or upload. Logo upload and removal apply when you save changes (same as gallery)."
                        value={form.logoUrl}
                        onChange={onLogoFieldValueChange}
                        onChooseLocalFile={onLogoChooseLocalFile}
                        previewVariant="square"
                        ratioHint="Recommended aspect ~1:1 (square) or wide logo."
                        showToast={showToast}
                      />
                      {(logoStagedFile || logoStagedDelete) ?
                        <p className="small text-warning mb-0 mt-2">Logo changes will be applied when you save.</p>
                      : null}
                      {isEditMode && editReady && editLogoSlug && !logoStagedDelete &&
                      (serverLogoCanonical !== null || logoStagedFile || form.logoUrl.trim() !== '') ?
                        <Button
                          type="button"
                          variant="outline-secondary"
                          size="sm"
                          className="mt-2"
                          onClick={handleStageRemoveLogo}
                        >
                          Remove logo (on save)
                        </Button>
                      : null}
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
                          hint="Full-width cover image behind the hero. Use a high-resolution landscape photo; URL or upload. Device uploads are sent on save (asset_type=hero)."
                          value={form.heroBackgroundImage}
                          onChange={onHeroBackgroundChange}
                          onChooseLocalFile={onHeroBackgroundChooseFile}
                          previewVariant="landscape"
                          ratioHint="Recommended aspect ~16:9 (landscape)."
                          showToast={showToast}
                          maxUploadBytes={MAX_HERO_BG_UPLOAD_BYTES}
                        />
                      </div>
                      <Form.Group className="mb-3">
                        <LabelWithHint
                          htmlFor="cw-hero-overlay"
                          label={`Hero dark overlay (${form.heroOverlay.toFixed(2)})`}
                          hintId="cw-hint-overlay"
                          hint="0 = bright photo, 1 = strongest dimming. Uses a neutral black scrim so your background image stays visible; combine with Hero text colour for contrast."
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
                            hint="Used behind the short description paragraph (Business profile) with blend overlay. Device uploads are sent on save (asset_type=background)."
                            value={form.aboutBodyBgImageUrl}
                            onChange={onAboutBodyBgImageChange}
                            onChooseLocalFile={
                              form.useDefaultPaletteArtwork ? undefined : onAboutBodyBgChooseFile
                            }
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

                  <Accordion.Item eventKey="gallery" className="create-website__accordion-item">
                    <Accordion.Header>Gym gallery (photos)</Accordion.Header>
                    <Accordion.Body>
                      <p className="small text-muted mb-3">
                        JPG, PNG, WebP, or GIF — max 1 MB each. Add photos with the button below or by dropping files onto
                        the dashed area. Drag tiles by the handle to change order on your public site (saved with{' '}
                        <strong>Save</strong>). Trial: up to 5 images; Starter/Pro: up to 10. The live gallery strip is
                        hidden on trial public pages, but <strong>Preview site</strong> shows it so you can check photos and
                        order (remove or reorder in this form, then save).
                      </p>
                      {(isEditMode && !editReady) ?
                        <Alert variant="info" className="mb-0 py-2 small">
                          Loading business…
                        </Alert>
                      : <>
                          {galleryUploadSlug && galleryListLoading ?
                            <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                              <Spinner animation="border" size="sm" aria-hidden />
                              <span>Refreshing saved photos from the server… You can still add new images below.</span>
                            </div>
                          : null}
                          <Form.Group className="mb-3">
                            <Form.Label>Gallery section title (public site)</Form.Label>
                            <Form.Control
                              value={form.gallerySectionTitle}
                              onChange={(e) => set('gallerySectionTitle', e.target.value)}
                              placeholder="Gallery"
                            />
                          </Form.Group>
                          {galleryList != null && galleryList.slots_limit === 0 && (galleryList.images?.length ?? 0) > 0 ?
                            <Alert variant="warning" className="py-2 small mb-3">
                              The server reports no free gallery slots, but existing images are listed below. If uploads
                              fail when you save, contact support.
                            </Alert>
                          : null}
                          {!galleryUploadSlug && !isEditMode ?
                            <p className="small text-muted mb-3">
                              Slot count uses a trial limit until your gym exists; it will match your plan after the first
                              save.
                            </p>
                          : null}
                          <input
                            ref={galleryFileInputRef}
                            type="file"
                            accept="image/*"
                            className="d-none"
                            multiple
                            onChange={handleGalleryFileChange}
                          />
                          <div
                            className={`create-website__gallery-dropzone mb-3${galleryFileDragOver ? ' create-website__gallery-dropzone--active' : ''}`}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              if (e.dataTransfer.types.includes('Files')) setGalleryFileDragOver(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              if (!e.currentTarget.contains(e.relatedTarget as Node)) setGalleryFileDragOver(false);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (e.dataTransfer.types.includes('Files')) {
                                e.dataTransfer.dropEffect = 'copy';
                                setGalleryFileDragOver(true);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setGalleryFileDragOver(false);
                              if (e.dataTransfer.files?.length) addGalleryFilesFromList(e.dataTransfer.files);
                            }}
                          >
                            <div className="create-website__gallery-dropzone-inner text-center py-4 px-3">
                              <p className="small text-muted mb-2 mb-md-3">
                                <strong>{galleryStagedCount}</strong> /{' '}
                                {effectiveGalleryLimit > 0 ? effectiveGalleryLimit : '—'} photos
                                {galleryPending.length > 0 || galleryServerDeletesPending.length > 0 ?
                                  <span className="text-muted">
                                    {galleryPending.length > 0 ?
                                      <> · {galleryPending.length} new photo{galleryPending.length === 1 ? '' : 's'} not saved</>
                                    : null}
                                    {galleryServerDeletesPending.length > 0 ?
                                      <> · {galleryServerDeletesPending.length} removal
                                      {galleryServerDeletesPending.length === 1 ? '' : 's'} on save</>
                                    : null}
                                  </span>
                                : null}
                              </p>
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                className="create-website__gallery-choose-btn mb-2"
                                disabled={galleryAtCapacity || (isEditMode && !editReady)}
                                onClick={() => galleryFileInputRef.current?.click()}
                              >
                                <span className="create-website__gallery-upload-icon" aria-hidden>
                                  ↥
                                </span>{' '}
                                Choose photos
                              </Button>
                              <p className="small text-muted mb-0">or drop images here — you can select several at once</p>
                            </div>
                            {galleryVisualKeys.length > 0 ?
                              <div className="create-website__gallery-grid px-3 pb-3">
                                {galleryVisualKeys.map((gKey) => {
                                  const isPending = gKey.startsWith(GALLERY_KEY_PREFIX_PENDING);
                                  const localId = isPending ? gKey.slice(GALLERY_KEY_PREFIX_PENDING.length) : '';
                                  const url = isPending ? '' : gKey.slice(GALLERY_KEY_PREFIX_SERVER.length);
                                  const row = isPending ? pendingByLocalId.get(localId) : undefined;
                                  const img = !isPending && url ? serverImageByUrl.get(url) : undefined;
                                  const previewSrc =
                                    row?.previewUrl ??
                                    (galleryUploadSlug && img ?
                                      resolveBusinessImageDisplayUrl(galleryUploadSlug, img)
                                    : url || '');
                                  if (isPending && !row) return null;
                                  if (!isPending && !previewSrc) return null;
                                  const isStaged = Boolean(row);
                                  return (
                                    <div
                                      key={gKey}
                                      className={`create-website__gallery-tile${isStaged ? ' create-website__gallery-tile--staged' : ''}`}
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData(GALLERY_DND_TYPE, gKey);
                                        e.dataTransfer.setData('text/plain', gKey);
                                        e.dataTransfer.effectAllowed = 'move';
                                      }}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        if (
                                          e.dataTransfer.types.includes(GALLERY_DND_TYPE) ||
                                          e.dataTransfer.types.includes('text/plain')
                                        ) {
                                          e.dataTransfer.dropEffect = 'move';
                                        }
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        const from =
                                          e.dataTransfer.getData(GALLERY_DND_TYPE) ||
                                          e.dataTransfer.getData('text/plain');
                                        if (from) moveGalleryVisualKey(from, gKey);
                                      }}
                                    >
                                      <div className="create-website__gallery-tile-top">
                                        <span
                                          className="create-website__gallery-drag-hint text-muted"
                                          aria-hidden
                                          title="Drag to reorder"
                                        >
                                          ⠿
                                        </span>
                                        {isStaged ?
                                          <span className="badge bg-primary-subtle text-primary-emphasis small">
                                            Unsaved
                                          </span>
                                        : null}
                                      </div>
                                      <button
                                        type="button"
                                        className="create-website__gallery-thumb-btn"
                                        onClick={() => openGalleryPreview(previewSrc)}
                                        aria-label={isStaged ? 'Preview staged image' : 'Preview gallery image'}
                                      >
                                        <span className="create-website__gallery-thumb-square">
                                          <img src={previewSrc} alt="" />
                                        </span>
                                      </button>
                                      <div className="create-website__gallery-tile-actions">
                                        <Button
                                          type="button"
                                          variant="outline-secondary"
                                          size="sm"
                                          className="create-website__remove-row-btn"
                                          aria-label={isStaged ? 'Preview staged image' : 'Preview gallery image'}
                                          title="Preview"
                                          onClick={() => openGalleryPreview(previewSrc)}
                                        >
                                          <svg
                                            className="create-website__eye-icon"
                                            viewBox="0 0 24 24"
                                            width="18"
                                            height="18"
                                            fill="currentColor"
                                            aria-hidden
                                          >
                                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                          </svg>
                                        </Button>
                                        {isStaged ?
                                          <RemoveRowTrashButton
                                            ariaLabel="Remove staged image"
                                            onClick={() => removeGalleryPendingRow(localId)}
                                          />
                                        : img ?
                                          <RemoveRowTrashButton
                                            ariaLabel="Remove image from gallery (saved on Save)"
                                            disabled={!galleryUploadSlug || img.id == null || !Number.isFinite(img.id)}
                                            onClick={() => stageRemoveServerGalleryImage(img)}
                                          />
                                        : null}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            : (
                              <p className="small text-muted text-center px-3 pb-3 mb-0">No photos yet — add some above.</p>
                            )}
                          </div>
                        </>
                      }
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
                                hint="Coach headshot on the public page. Upload from your device only — same 1 MB limit as other images. Sent on save (asset_type=dp)."
                                value={row.photoUrl}
                                onChange={(v) => onCoachPhotoUrlChange(index, v)}
                                onChooseLocalFile={(file) => onCoachPhotoChooseFile(index, file)}
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
                  <div className="d-flex flex-column align-items-end gap-2">
                    <div className="d-flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={slugStatus !== 'available' || saving}
                    >
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving…
                        </>
                      ) : isEditMode ?
                        <>Save changes</>
                      : (
                        <>Save website</>
                      )}
                    </Button>
                    </div>
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

      <Modal
        show={templatePreviewKey !== null}
        onHide={() => setTemplatePreviewKey(null)}
        centered
        size="xl"
        aria-labelledby="create-website-template-preview-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="create-website-template-preview-title" as="h2" className="h5 mb-0">
            {templatePreviewKey ?
              `${allTemplatePickerCards.find((c) => c.key === templatePreviewKey)?.label ?? 'Template'} preview`
            : 'Template preview'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {templatePreviewKey ? (
            <iframe
              src={PRO_TEMPLATE_PREVIEW_PATHS[templatePreviewKey]}
              title="Template preview"
              className="create-website__template-preview-frame"
            />
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => {
              if (!templatePreviewKey) return;
              window.open(PRO_TEMPLATE_PREVIEW_PATHS[templatePreviewKey], '_blank', 'noopener,noreferrer');
            }}
          >
            Open in new tab
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={galleryPreviewSrc !== null}
        onHide={() => setGalleryPreviewSrc(null)}
        centered
        size="lg"
        aria-labelledby="create-website-gallery-preview-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="create-website-gallery-preview-title" as="h2" className="h5 mb-0">
            Image preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pb-4">
          {galleryPreviewSrc ?
            <img
              src={galleryPreviewSrc}
              alt=""
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: 'min(75vh, 720px)', width: 'auto', maxWidth: '100%' }}
            />
          : null}
        </Modal.Body>
      </Modal>

      <Modal
        show={postSaveRechargeModalSlug !== null}
        onHide={() => setPostSaveRechargeModalSlug(null)}
        centered
        backdrop="static"
        aria-labelledby="create-website-recharge-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="create-website-recharge-modal-title">Website saved</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            Your gym page is ready. <strong>Recharge now</strong> on the pricing page to keep your site available to the
            public and extend your service.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => {
              const s = postSaveRechargeModalSlug;
              setPostSaveRechargeModalSlug(null);
              if (s) visitPublicGymSite(s, (to, o) => (o?.replace ? router.replace(to) : router.push(to)), { replace: true });
            }}
          >
            View my site first
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              const s = postSaveRechargeModalSlug;
              setPostSaveRechargeModalSlug(null);
              if (s) router.push(`${PLANS_PAGE_PATH}/${encodeURIComponent(s)}`);
            }}
          >
            Recharge now
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
}
