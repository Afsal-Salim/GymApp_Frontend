import type { BusinessDetail } from '../../../api/businesses';
import {
  CRYSTAL_WEBSITE_PREVIEW_BROADCAST_CHANNEL,
  CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY,
} from '../../../config/storageKeys';
import { GYM_CLIENT_BRAND_LOGO_SRC } from '../../crystal/gymClientBrandLogo';
import {
  GYM_CLIENT_SITE_DEFAULTS,
  cloneGymClientSiteDefaults,
  clampMemberRating,
  formatHeroMemberRating,
  normalizeLocationMapUrl,
  parseLegacyRatingToMemberRating,
  type CrystalWebsiteSetupPayload,
  type GymClientAboutFeature,
  type GymClientSiteContent,
} from '../../crystal/gymClientSiteContent';

/** Alias: same shape as {@link CrystalWebsiteSetupPayload} (preview storage + backend). */
export type CrystalWebsiteDraftPayload = CrystalWebsiteSetupPayload;

/** Default body copy color on light sections (`--gym-client-text`) when ink/surfaces use a light “dark” token. */
export const GYM_CLIENT_DEFAULT_TEXT_HEX = '#1c1917';
export const GYM_CLIENT_DEFAULT_LIGHT_HEX = '#ffffff';

export const CREATE_WEBSITE_MAX_OFFERS = 5;
export const CREATE_WEBSITE_MAX_PACKAGES = 5;
export const CREATE_WEBSITE_MAX_COACHES = 5;

export type DiscountOfferFormRow = {
  title: string;
  subtitle: string;
  percentOff: number;
  originalPriceLabel: string;
  salePriceLabel: string;
  periodLabel: string;
};

export type MembershipPackageFormRow = {
  name: string;
  priceLabel: string;
  periodLabel: string;
  originalPriceLabel: string;
  discountPercent: string;
  featuresCsv: string;
  highlighted: boolean;
  ctaLabel: string;
};

export type CoachFormRow = {
  name: string;
  role: string;
  shortBio: string;
  photoUrl: string;
};

export function emptyDiscountOfferRow(): DiscountOfferFormRow {
  return {
    title: '',
    subtitle: '',
    percentOff: 0,
    originalPriceLabel: '',
    salePriceLabel: '',
    periodLabel: '',
  };
}

function isDiscountOfferFormRowFilled(row: DiscountOfferFormRow): boolean {
  if (row.percentOff > 0) return true;
  const sale = row.salePriceLabel.trim();
  const orig = row.originalPriceLabel.trim();
  if (sale && sale !== '—') return true;
  if (orig && orig !== '—') return true;
  if (row.subtitle.trim()) return true;
  const t = row.title.trim();
  if (t && t.toLowerCase() !== 'offer') return true;
  return false;
}

export function emptyMembershipPackageRow(): MembershipPackageFormRow {
  return {
    name: '',
    priceLabel: '',
    periodLabel: '',
    originalPriceLabel: '',
    discountPercent: '',
    featuresCsv: '',
    highlighted: false,
    ctaLabel: '',
  };
}

export function emptyCoachRow(): CoachFormRow {
  return { name: '', role: '', shortBio: '', photoUrl: '' };
}

function discountRowFromSiteOffer(
  o: GymClientSiteContent['discountOffers']['offers'][number] | undefined
): DiscountOfferFormRow {
  if (!o) return emptyDiscountOfferRow();
  return {
    title: o.title,
    subtitle: o.subtitle ?? '',
    percentOff: o.percentOff,
    originalPriceLabel: o.originalPriceLabel,
    salePriceLabel: o.salePriceLabel,
    periodLabel: o.periodLabel ?? '',
  };
}

function packageRowFromSiteItem(
  p: GymClientSiteContent['packages']['items'][number] | undefined
): MembershipPackageFormRow {
  if (!p) return emptyMembershipPackageRow();
  return {
    name: p.name,
    priceLabel: p.priceLabel,
    periodLabel: p.periodLabel ?? '',
    originalPriceLabel: p.originalPriceLabel ?? '',
    discountPercent: p.discountPercent != null ? String(p.discountPercent) : '',
    featuresCsv: p.features.join(', '),
    highlighted: Boolean(p.highlighted),
    ctaLabel: p.ctaLabel ?? '',
  };
}

function coachRowFromSiteItem(
  t: GymClientSiteContent['trainers']['items'][number] | undefined
): CoachFormRow {
  if (!t) return emptyCoachRow();
  return {
    name: t.name,
    role: t.role ?? '',
    shortBio: t.shortBio ?? '',
    photoUrl: typeof t.photoUrl === 'string' ? t.photoUrl : '',
  };
}

export type CreateWebsiteFormState = {
  slug: string;
  accentColor: string;
  darkColor: string;
  /** Readable text on light backgrounds (about, packages, etc.); maps to `--gym-client-text`. */
  textColor: string;
  /** Base color for light surfaces (cards/sections). */
  lightColor: string;
  logoUrl: string;
  gymName: string;
  businessDescription: string;
  heroBackgroundImage: string;
  heroOverlay: number;
  titlePrefix: string;
  tagline1: string;
  tagline2: string;
  tagline3: string;
  subtitle: string;
  /** Raw 0–5 input; empty hides the hero rating segment. */
  memberRating: string;
  /** Fixed copy: same as site defaults (“Join now” → #contact). */
  primaryCtaEnabled: boolean;
  /** Fixed copy: same as site defaults (“Book free trial” → #contact). */
  secondaryCtaEnabled: boolean;
  descriptionSectionTitle: string;
  leadBefore: string;
  leadAccent: string;
  leadAfter: string;
  aboutBodyBgEnabled: boolean;
  aboutBodyBgImageUrl: string;
  aboutBodyBgBlendColor: string;
  feat1Title: string;
  feat1Sub: string;
  feat1Icon: GymClientAboutFeature['icon'];
  feat2Title: string;
  feat2Sub: string;
  feat2Icon: GymClientAboutFeature['icon'];
  feat3Title: string;
  feat3Sub: string;
  feat3Icon: GymClientAboutFeature['icon'];
  videoSectionTitle: string;
  videoUrl: string;
  videoCaption: string;
  discountSectionTitle: string;
  discountSectionSubtitle: string;
  /** At least one row; up to {@link CREATE_WEBSITE_MAX_OFFERS}. */
  discountOffers: DiscountOfferFormRow[];
  packagesSectionTitle: string;
  packagesSectionSubtitle: string;
  /** At least one row; up to {@link CREATE_WEBSITE_MAX_PACKAGES}. */
  membershipPackages: MembershipPackageFormRow[];
  trainersSectionTitle: string;
  trainersSectionSubtitle: string;
  /** At least one row; up to {@link CREATE_WEBSITE_MAX_COACHES}. */
  coaches: CoachFormRow[];
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  /** Google Maps (or Apple Maps) link; required when address or phone is set. */
  contactLocationMapUrl: string;
  contactInstagram: string;
  whatsappFabHint: string;
  hours: string;
  parking: string;
  footerTagline: string;
  footerFinePrint: string;
};

export function initCreateWebsiteForm(): CreateWebsiteFormState {
  const d = GYM_CLIENT_SITE_DEFAULTS;
  const ti = d.header.taglineItems;
  const feats = d.description.features;
  const [f1, f2, f3] = [feats[0], feats[1], feats[2]];
  const pk = d.packages.items;
  const offs = d.discountOffers.offers;
  const tr = d.trainers.items;
  const c = (id: string) => d.contacts.items.find((x) => x.id === id)?.value ?? '';
  const detail = (id: string) => d.details.rows.find((x) => x.id === id)?.value ?? '';

  return {
    slug: '',
    accentColor: '#ea580c',
    darkColor: '#0c0a09',
    textColor: GYM_CLIENT_DEFAULT_TEXT_HEX,
    lightColor: GYM_CLIENT_DEFAULT_LIGHT_HEX,
    logoUrl: '',
    gymName: d.header.title,
    businessDescription: d.description.body,
    heroBackgroundImage: d.layout.heroBackgroundImage,
    heroOverlay: d.layout.heroOverlay,
    titlePrefix: d.header.titlePrefix,
    tagline1: ti[0] ?? '',
    tagline2: ti[1] ?? '',
    tagline3: ti[2] ?? '',
    subtitle: d.header.subtitle,
    memberRating:
      d.header.memberRating != null && Number.isFinite(d.header.memberRating) ?
        String(d.header.memberRating)
      : '',
    primaryCtaEnabled: true,
    secondaryCtaEnabled: true,
    descriptionSectionTitle: d.description.sectionTitle,
    leadBefore: d.description.lead?.before ?? '',
    leadAccent: d.description.lead?.accent ?? '',
    leadAfter: d.description.lead?.after ?? '',
    aboutBodyBgEnabled: d.description.bodyBackground?.enabled ?? false,
    aboutBodyBgImageUrl: d.description.bodyBackground?.imageUrl ?? '',
    aboutBodyBgBlendColor: d.description.bodyBackground?.blendColor ?? '#111827CC',
    feat1Title: f1?.title ?? '',
    feat1Sub: f1?.subtext ?? '',
    feat1Icon: f1?.icon ?? 'coaches',
    feat2Title: f2?.title ?? '',
    feat2Sub: f2?.subtext ?? '',
    feat2Icon: f2?.icon ?? 'facility',
    feat3Title: f3?.title ?? '',
    feat3Sub: f3?.subtext ?? '',
    feat3Icon: f3?.icon ?? 'results',
    videoSectionTitle: d.video.sectionTitle,
    videoUrl: d.video.url,
    videoCaption: d.video.caption ?? '',
    discountSectionTitle: d.discountOffers.sectionTitle,
    discountSectionSubtitle: d.discountOffers.sectionSubtitle ?? '',
    discountOffers: [discountRowFromSiteOffer(offs[0])],
    packagesSectionTitle: d.packages.sectionTitle,
    packagesSectionSubtitle: d.packages.sectionSubtitle ?? '',
    membershipPackages: [packageRowFromSiteItem(pk[0])],
    trainersSectionTitle: d.trainers.sectionTitle,
    trainersSectionSubtitle: d.trainers.sectionSubtitle ?? '',
    coaches: [coachRowFromSiteItem(tr[0])],
    contactEmail: c('email'),
    contactPhone: c('phone'),
    contactAddress: c('address'),
    contactLocationMapUrl: '',
    contactInstagram: c('instagram').replace(/^@/, ''),
    whatsappFabHint: d.contacts.whatsappFabHint,
    hours: detail('hours'),
    parking: detail('parking'),
    footerTagline: d.footer.tagline,
    footerFinePrint: d.footer.finePrint ?? '',
  };
}

/**
 * Saved for `/preview` (see CrystalBusinessPage).
 * Uses localStorage (not sessionStorage) so a preview opened in a **new tab** can read the same draft —
 * sessionStorage is separate per tab, which caused “No preview yet” after Preview site → new tab.
 */
export { CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY };

/** Parse JSON string from localStorage or a `storage` event. */
export function parseCrystalWebsiteDraftJson(raw: string): CrystalWebsiteDraftPayload | null {
  return parsePreviewPayload(raw);
}

function parsePreviewPayload(raw: string): CrystalWebsiteDraftPayload | null {
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object') return null;
    const rec = o as Partial<CrystalWebsiteDraftPayload>;
    if (!rec.content || typeof rec.content !== 'object') return null;
    const title = (rec.content as GymClientSiteContent).header?.title;
    if (typeof title !== 'string') return null;
    const accent = rec.theme?.accentHex;
    const dark = rec.theme?.darkHex;
    const textRaw = (rec.theme as { textHex?: string } | undefined)?.textHex;
    const lightRaw = (rec.theme as { lightHex?: string } | undefined)?.lightHex;
    const textHex = typeof textRaw === 'string' && textRaw.trim() ? textRaw.trim() : GYM_CLIENT_DEFAULT_TEXT_HEX;
    const lightHex = typeof lightRaw === 'string' && lightRaw.trim() ? lightRaw.trim() : GYM_CLIENT_DEFAULT_LIGHT_HEX;
    const theme =
      typeof accent === 'string' && typeof dark === 'string' ?
        { accentHex: accent, darkHex: dark, textHex, lightHex }
      : { accentHex: '#ea580c', darkHex: '#0c0a09', textHex: GYM_CLIENT_DEFAULT_TEXT_HEX, lightHex: GYM_CLIENT_DEFAULT_LIGHT_HEX };
    return {
      slug: typeof rec.slug === 'string' && rec.slug ? rec.slug : 'preview',
      theme,
      content: rec.content as GymClientSiteContent,
    };
  } catch {
    return null;
  }
}

export function readCrystalWebsitePreviewFromStorage(): CrystalWebsiteDraftPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    let raw: string | null = null;
    if (typeof localStorage !== 'undefined') {
      raw = localStorage.getItem(CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY);
    }
    if (!raw && typeof sessionStorage !== 'undefined') {
      raw = sessionStorage.getItem(CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY);
    }
    if (!raw) return null;
    return parsePreviewPayload(raw);
  } catch {
    return null;
  }
}

export function writeCrystalWebsitePreviewToStorage(payload: CrystalWebsiteDraftPayload): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY, JSON.stringify(payload));
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(CRYSTAL_WEBSITE_PREVIEW_BROADCAST_CHANNEL);
        bc.postMessage({ type: 'crystal-preview-draft' });
        bc.close();
      } catch {
        /* ignore */
      }
    }
    return true;
  } catch {
    return false;
  }
}

function parseDiscount(s: string): number | undefined {
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : undefined;
}

export function isMembershipPackageFormRowFilled(row: MembershipPackageFormRow): boolean {
  const nameOk = row.name.trim() && row.name.trim() !== 'Plan';
  const priceOk = row.priceLabel.trim() && row.priceLabel.trim() !== '—';
  const origOk = row.originalPriceLabel.trim() && row.originalPriceLabel.trim() !== '—';
  const discOk = Boolean(parseDiscount(row.discountPercent));
  const ctaOk = Boolean(row.ctaLabel.trim());
  const featOk = row.featuresCsv
    .split(',')
    .map((x) => x.trim())
    .some(Boolean);
  return nameOk || priceOk || origOk || discOk || ctaOk || featOk;
}

function parseMemberRatingFormField(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const n = parseFloat(t.replace(',', '.'));
  if (!Number.isFinite(n)) return undefined;
  return clampMemberRating(n);
}

/** Live label for the create-website form; `null` when the field is empty or invalid. */
export function formatMemberRatingPreview(input: string): string | null {
  const n = parseMemberRatingFormField(input);
  return n != null ? formatHeroMemberRating(n) : null;
}

function buildPackage(
  id: string,
  name: string,
  priceLabel: string,
  periodLabel: string,
  originalPriceLabel: string,
  discountStr: string,
  featuresCsv: string,
  highlighted: boolean,
  ctaLabel: string
): GymClientSiteContent['packages']['items'][0] {
  const features = featuresCsv
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const discountPercent = parseDiscount(discountStr);
  return {
    id,
    name: name.trim() || 'Plan',
    priceLabel: priceLabel.trim() || '—',
    periodLabel: periodLabel.trim() || undefined,
    originalPriceLabel: originalPriceLabel.trim() || undefined,
    discountPercent,
    features: features.length ? features : ['—'],
    highlighted,
    ctaLabel: ctaLabel.trim() || undefined,
  };
}

export function mapFormToWebsiteDraft(form: CreateWebsiteFormState): CrystalWebsiteDraftPayload {
  const slug = form.slug.trim().toLowerCase();
  const base = cloneGymClientSiteDefaults();
  const gymName = form.gymName.trim() || base.header.title;

  base.layout.heroBackgroundImage = form.heroBackgroundImage.trim() || base.layout.heroBackgroundImage;
  base.layout.heroOverlay = Math.min(1, Math.max(0, Number(form.heroOverlay) || 0));

  base.logo.src = form.logoUrl.trim() || base.logo.src;
  base.logo.alt = `${gymName} logo`;

  base.header.titlePrefix = form.titlePrefix.trim();
  base.header.title = gymName;
  base.header.taglineItems = [form.tagline1, form.tagline2, form.tagline3].map((x) => x.trim()).filter(Boolean);
  base.header.subtitle = form.subtitle.trim();
  const memberRating = parseMemberRatingFormField(form.memberRating);
  if (memberRating != null) base.header.memberRating = memberRating;
  else delete base.header.memberRating;
  const defSec = GYM_CLIENT_SITE_DEFAULTS.header.ctaSecondary;
  base.header.ctaSecondary =
    form.secondaryCtaEnabled && defSec ? { label: defSec.label, href: defSec.href } : undefined;

  if (form.primaryCtaEnabled) {
    base.nav.ctaLabel = GYM_CLIENT_SITE_DEFAULTS.nav.ctaLabel;
    base.nav.ctaHref = GYM_CLIENT_SITE_DEFAULTS.nav.ctaHref;
  } else {
    delete base.nav.ctaLabel;
    delete base.nav.ctaHref;
  }

  base.footer.brandTitle = gymName;
  base.footer.tagline = form.footerTagline.trim();
  base.footer.finePrint = form.footerFinePrint.trim() || undefined;

  base.description.sectionTitle = form.descriptionSectionTitle.trim();
  const lb = form.leadBefore.trim();
  const la = form.leadAccent.trim();
  const laf = form.leadAfter.trim();
  base.description.lead =
    lb || la || laf ? { before: lb, accent: la, after: laf } : undefined;
  base.description.body = form.businessDescription.trim();
  const aboutBgImage = form.aboutBodyBgImageUrl.trim();
  const aboutBgBlendColor = form.aboutBodyBgBlendColor.trim() || '#111827CC';
  base.description.bodyBackground = {
    enabled: Boolean(form.aboutBodyBgEnabled && aboutBgImage),
    imageUrl: aboutBgImage || undefined,
    blendColor: aboutBgBlendColor,
  };
  base.description.features = [
    {
      id: 'feat-1',
      title: form.feat1Title.trim() || '—',
      subtext: form.feat1Sub.trim() || '—',
      icon: form.feat1Icon,
    },
    {
      id: 'feat-2',
      title: form.feat2Title.trim() || '—',
      subtext: form.feat2Sub.trim() || '—',
      icon: form.feat2Icon,
    },
    {
      id: 'feat-3',
      title: form.feat3Title.trim() || '—',
      subtext: form.feat3Sub.trim() || '—',
      icon: form.feat3Icon,
    },
  ];

  base.video.sectionTitle = form.videoSectionTitle.trim();
  base.video.url = form.videoUrl.trim();
  base.video.caption = form.videoCaption.trim() || undefined;

  base.discountOffers.sectionTitle = form.discountSectionTitle.trim();
  base.discountOffers.sectionSubtitle = form.discountSectionSubtitle.trim() || undefined;
  const filledOfferRows = form.discountOffers.filter(isDiscountOfferFormRowFilled);
  base.discountOffers.offers = filledOfferRows.map((row, i) => ({
    id: `offer-${i + 1}`,
    title: row.title.trim() || 'Offer',
    subtitle: row.subtitle.trim() || undefined,
    percentOff: Math.min(100, Math.max(0, Number(row.percentOff) || 0)),
    originalPriceLabel: row.originalPriceLabel.trim() || '—',
    salePriceLabel: row.salePriceLabel.trim() || '—',
    periodLabel: row.periodLabel.trim() || undefined,
  }));

  base.packages.sectionTitle = form.packagesSectionTitle.trim();
  base.packages.sectionSubtitle = form.packagesSectionSubtitle.trim() || undefined;
  const filledPackageRows = form.membershipPackages.filter(isMembershipPackageFormRowFilled);
  base.packages.items = filledPackageRows.map((row, i) =>
    buildPackage(
      `pkg-${i + 1}`,
      row.name,
      row.priceLabel,
      row.periodLabel,
      row.originalPriceLabel,
      row.discountPercent,
      row.featuresCsv,
      row.highlighted,
      row.ctaLabel
    )
  );

  base.trainers.sectionTitle = form.trainersSectionTitle.trim();
  base.trainers.sectionSubtitle = form.trainersSectionSubtitle.trim() || undefined;
  const filledCoachRows = form.coaches.filter((row) => row.name.trim());
  base.trainers.items = filledCoachRows.map((row, i) => ({
    id: `tr-${i + 1}`,
    name: row.name.trim(),
    role: row.role.trim() || undefined,
    shortBio: row.shortBio.trim() || undefined,
    photoUrl: row.photoUrl.trim() || null,
  }));

  base.contacts.whatsappFabHint = form.whatsappFabHint.trim();
  const email = form.contactEmail.trim();
  const phone = form.contactPhone.trim();
  const address = form.contactAddress.trim();
  const mapUrlRaw = form.contactLocationMapUrl.trim();
  const ig = form.contactInstagram.trim();
  if (mapUrlRaw) {
    base.contacts.locationMapUrl = normalizeLocationMapUrl(mapUrlRaw);
  } else {
    delete base.contacts.locationMapUrl;
  }
  base.contacts.items = [
    {
      id: 'email',
      label: 'Email',
      value: email || '—',
      href: email ? `mailto:${email}` : undefined,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      value: ig ? `@${ig.replace(/^@/, '')}` : '—',
      href: ig ? `https://instagram.com/${ig.replace(/^@/, '')}` : undefined,
    },
    {
      id: 'phone',
      label: 'Phone',
      value: phone,
      href: phone ? `tel:${phone.replace(/\s/g, '')}` : undefined,
    },
    { id: 'address', label: 'Address', value: address },
  ];

  base.details.rows = [
    { id: 'hours', label: 'Hours', value: form.hours.trim() || '—' },
    { id: 'parking', label: 'Parking', value: form.parking.trim() || '—' },
    { id: 'slug', label: 'Page', value: slug ? `/${slug}` : '—' },
  ];

  return {
    slug,
    theme: {
      accentHex: form.accentColor.trim(),
      darkHex: form.darkColor.trim(),
      textHex: form.textColor.trim() || GYM_CLIENT_DEFAULT_TEXT_HEX,
      lightHex: form.lightColor.trim() || GYM_CLIENT_DEFAULT_LIGHT_HEX,
    },
    content: base,
  };
}

function isFeatureIcon(x: string): x is GymClientAboutFeature['icon'] {
  return x === 'coaches' || x === 'facility' || x === 'results';
}

function contactValue(items: GymClientSiteContent['contacts']['items'], id: string): string {
  const v = items.find((x) => x.id === id)?.value?.trim() ?? '';
  return v === '—' ? '' : v;
}

/** Rebuild the setup form from a preview / saved draft (e.g. “Edit setup” after Preview site). */
export function draftPayloadToFormState(draft: CrystalWebsiteDraftPayload): CreateWebsiteFormState {
  const c = draft.content;
  const defLogoSrc = GYM_CLIENT_SITE_DEFAULTS.logo.src;
  const logoUrl =
    c.logo.src && c.logo.src !== defLogoSrc && c.logo.src !== GYM_CLIENT_BRAND_LOGO_SRC ? c.logo.src : '';

  const ti = c.header.taglineItems;
  const feats = c.description.features;
  const [f1, f2, f3] = [feats[0], feats[1], feats[2]];
  const offerRows = c.discountOffers.offers
    .slice(0, CREATE_WEBSITE_MAX_OFFERS)
    .map((o) => discountRowFromSiteOffer(o));
  const pkgRows = c.packages.items
    .slice(0, CREATE_WEBSITE_MAX_PACKAGES)
    .map((p) => packageRowFromSiteItem(p));
  const coachRows = c.trainers.items
    .slice(0, CREATE_WEBSITE_MAX_COACHES)
    .map((t) => coachRowFromSiteItem(t));

  let instagram = contactValue(c.contacts.items, 'instagram');
  if (instagram.startsWith('@')) instagram = instagram.slice(1);

  const hoursRow = c.details.rows.find((r) => r.id === 'hours')?.value?.trim() ?? '';
  const parkingRow = c.details.rows.find((r) => r.id === 'parking')?.value?.trim() ?? '';

  return {
    slug: draft.slug,
    accentColor: draft.theme.accentHex || '#ea580c',
    darkColor: draft.theme.darkHex || '#0c0a09',
    textColor: draft.theme.textHex?.trim() || GYM_CLIENT_DEFAULT_TEXT_HEX,
    lightColor: draft.theme.lightHex?.trim() || GYM_CLIENT_DEFAULT_LIGHT_HEX,
    logoUrl,
    gymName: c.header.title,
    businessDescription: c.description.body,
    heroBackgroundImage: c.layout.heroBackgroundImage,
    heroOverlay: c.layout.heroOverlay,
    titlePrefix: c.header.titlePrefix,
    tagline1: ti[0] ?? '',
    tagline2: ti[1] ?? '',
    tagline3: ti[2] ?? '',
    subtitle: c.header.subtitle,
    memberRating: (() => {
      const h = c.header as { memberRating?: number; ratingLine?: string };
      if (typeof h.memberRating === 'number' && Number.isFinite(h.memberRating)) {
        return String(clampMemberRating(h.memberRating));
      }
      const p = parseLegacyRatingToMemberRating(h.ratingLine);
      return p != null ? String(p) : '';
    })(),
    primaryCtaEnabled: Boolean(c.nav.ctaLabel?.trim() && c.nav.ctaHref?.trim()),
    secondaryCtaEnabled: Boolean(c.header.ctaSecondary?.label?.trim()),
    descriptionSectionTitle: c.description.sectionTitle,
    leadBefore: c.description.lead?.before ?? '',
    leadAccent: c.description.lead?.accent ?? '',
    leadAfter: c.description.lead?.after ?? '',
    aboutBodyBgEnabled: Boolean(c.description.bodyBackground?.enabled && c.description.bodyBackground?.imageUrl?.trim()),
    aboutBodyBgImageUrl: c.description.bodyBackground?.imageUrl?.trim() ?? '',
    aboutBodyBgBlendColor: c.description.bodyBackground?.blendColor?.trim() ?? '#111827CC',
    feat1Title: f1?.title ?? '',
    feat1Sub: f1?.subtext ?? '',
    feat1Icon: f1?.icon && isFeatureIcon(f1.icon) ? f1.icon : 'coaches',
    feat2Title: f2?.title ?? '',
    feat2Sub: f2?.subtext ?? '',
    feat2Icon: f2?.icon && isFeatureIcon(f2.icon) ? f2.icon : 'facility',
    feat3Title: f3?.title ?? '',
    feat3Sub: f3?.subtext ?? '',
    feat3Icon: f3?.icon && isFeatureIcon(f3.icon) ? f3.icon : 'results',
    videoSectionTitle: c.video.sectionTitle,
    videoUrl: c.video.url,
    videoCaption: c.video.caption ?? '',
    discountSectionTitle: c.discountOffers.sectionTitle,
    discountSectionSubtitle: c.discountOffers.sectionSubtitle ?? '',
    discountOffers: offerRows.length > 0 ? offerRows : [],
    packagesSectionTitle: c.packages.sectionTitle,
    packagesSectionSubtitle: c.packages.sectionSubtitle ?? '',
    membershipPackages: pkgRows.length > 0 ? pkgRows : [],
    trainersSectionTitle: c.trainers.sectionTitle,
    trainersSectionSubtitle: c.trainers.sectionSubtitle ?? '',
    coaches: coachRows.length > 0 ? coachRows : [],
    contactEmail: contactValue(c.contacts.items, 'email'),
    contactPhone: contactValue(c.contacts.items, 'phone'),
    contactAddress: contactValue(c.contacts.items, 'address'),
    contactLocationMapUrl: typeof c.contacts.locationMapUrl === 'string' ? c.contacts.locationMapUrl.trim() : '',
    contactInstagram: instagram,
    whatsappFabHint: c.contacts.whatsappFabHint,
    hours: hoursRow === '—' ? '' : hoursRow,
    parking: parkingRow === '—' ? '' : parkingRow,
    footerTagline: c.footer.tagline,
    footerFinePrint: c.footer.finePrint ?? '',
  };
}

/** Normalize theme from GET (camelCase or snake_case keys). */
function themeFromBusinessDetail(detail: BusinessDetail): CrystalWebsiteSetupPayload['theme'] | undefined {
  const wt = detail.website_theme;
  if (!wt || typeof wt !== 'object') return undefined;
  const o = wt as Record<string, unknown>;
  const accent = o.accentHex ?? o.accent_hex;
  const dark = o.darkHex ?? o.dark_hex;
  const text = o.textHex ?? o.text_hex;
  const light = o.lightHex ?? o.light_hex;
  if (typeof accent !== 'string' && typeof dark !== 'string' && typeof text !== 'string' && typeof light !== 'string') return undefined;
  return {
    accentHex: typeof accent === 'string' ? accent : '#ea580c',
    darkHex: typeof dark === 'string' ? dark : '#0c0a09',
    textHex: typeof text === 'string' ? text : GYM_CLIENT_DEFAULT_TEXT_HEX,
    lightHex: typeof light === 'string' ? light : GYM_CLIENT_DEFAULT_LIGHT_HEX,
  };
}

/**
 * Map an owned business from GET `/businesses/<slug>/` into the website builder form (edit flow).
 * Uses `website_theme` + `website_content` when the API returns them so colors and layout match saved data.
 */
export function createWebsiteFormFromBusinessDetail(detail: BusinessDetail): CreateWebsiteFormState {
  const slug = detail.slug?.trim().toLowerCase() ?? '';
  const mapUrl = typeof detail.location_map_url === 'string' ? detail.location_map_url.trim() : '';
  const logoUrl =
    typeof (detail as { logo_url?: unknown }).logo_url === 'string' ?
      (detail as { logo_url: string }).logo_url.trim()
    : '';

  const theme = themeFromBusinessDetail(detail);
  const wcRaw = detail.website_content;
  const wc = wcRaw && typeof wcRaw === 'object' ? (wcRaw as GymClientSiteContent) : undefined;

  if (wc && slug) {
    const themeResolved: CrystalWebsiteSetupPayload['theme'] =
      theme ?? { accentHex: '#ea580c', darkHex: '#0c0a09', textHex: GYM_CLIENT_DEFAULT_TEXT_HEX, lightHex: GYM_CLIENT_DEFAULT_LIGHT_HEX };
    const fromDraft = draftPayloadToFormState({ slug, theme: themeResolved, content: wc });
    return {
      ...fromDraft,
      slug,
      gymName: detail.name?.trim() || fromDraft.gymName,
      businessDescription: detail.description?.trim() || fromDraft.businessDescription,
      contactPhone: detail.phone?.trim() ?? fromDraft.contactPhone,
      contactAddress: detail.address?.trim() ?? fromDraft.contactAddress,
      contactLocationMapUrl: mapUrl || fromDraft.contactLocationMapUrl,
      logoUrl: logoUrl || fromDraft.logoUrl,
    };
  }

  const base = initCreateWebsiteForm();
  return {
    ...base,
    slug,
    gymName: detail.name?.trim() || base.gymName,
    businessDescription: detail.description?.trim() || base.businessDescription,
    contactPhone: detail.phone?.trim() ?? '',
    contactAddress: detail.address?.trim() ?? '',
    contactLocationMapUrl: mapUrl,
    logoUrl: logoUrl || base.logoUrl,
    ...(theme ?
      {
        accentColor: theme.accentHex,
        darkColor: theme.darkHex,
        textColor: theme.textHex,
        lightColor: theme.lightHex ?? GYM_CLIENT_DEFAULT_LIGHT_HEX,
      }
    : {}),
  };
}
