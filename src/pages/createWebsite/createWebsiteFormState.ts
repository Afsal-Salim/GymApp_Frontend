import { GYM_CLIENT_BRAND_LOGO_SRC } from '../crystal/gymClientBrandLogo';
import {
  GYM_CLIENT_SITE_DEFAULTS,
  cloneGymClientSiteDefaults,
  type GymClientAboutFeature,
  type GymClientSiteContent,
} from '../crystal/gymClientSiteContent';

export type CreateWebsiteFormState = {
  slug: string;
  accentColor: string;
  darkColor: string;
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
  ratingLine: string;
  navCtaLabel: string;
  navCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  descriptionSectionTitle: string;
  leadBefore: string;
  leadAccent: string;
  leadAfter: string;
  descriptionBody: string;
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
  offer1Title: string;
  offer1Subtitle: string;
  offer1Percent: number;
  offer1Original: string;
  offer1Sale: string;
  offer1Period: string;
  offer2Title: string;
  offer2Subtitle: string;
  offer2Percent: number;
  offer2Original: string;
  offer2Sale: string;
  offer2Period: string;
  packagesSectionTitle: string;
  packagesSectionSubtitle: string;
  pkg1Name: string;
  pkg1Price: string;
  pkg1Period: string;
  pkg1Original: string;
  pkg1Discount: string;
  pkg1Features: string;
  pkg1Highlighted: boolean;
  pkg1Cta: string;
  pkg2Name: string;
  pkg2Price: string;
  pkg2Period: string;
  pkg2Original: string;
  pkg2Discount: string;
  pkg2Features: string;
  pkg2Highlighted: boolean;
  pkg2Cta: string;
  pkg3Name: string;
  pkg3Price: string;
  pkg3Period: string;
  pkg3Original: string;
  pkg3Discount: string;
  pkg3Features: string;
  pkg3Highlighted: boolean;
  pkg3Cta: string;
  trainersSectionTitle: string;
  trainersSectionSubtitle: string;
  tr1Name: string;
  tr1Role: string;
  tr1Bio: string;
  tr1Photo: string;
  tr2Name: string;
  tr2Role: string;
  tr2Bio: string;
  tr2Photo: string;
  tr3Name: string;
  tr3Role: string;
  tr3Bio: string;
  tr3Photo: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
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
  const [p1, p2, p3] = [pk[0], pk[1], pk[2]];
  const offs = d.discountOffers.offers;
  const [o1, o2] = [offs[0], offs[1]];
  const tr = d.trainers.items;
  const [t1, t2, t3] = [tr[0], tr[1], tr[2]];
  const c = (id: string) => d.contacts.items.find((x) => x.id === id)?.value ?? '';
  const detail = (id: string) => d.details.rows.find((x) => x.id === id)?.value ?? '';

  return {
    slug: '',
    accentColor: '#ea580c',
    darkColor: '#0c0a09',
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
    ratingLine: d.header.ratingLine ?? '',
    navCtaLabel: d.nav.ctaLabel,
    navCtaHref: d.nav.ctaHref,
    secondaryCtaLabel: d.header.ctaSecondary?.label ?? '',
    secondaryCtaHref: d.header.ctaSecondary?.href ?? '#contact',
    descriptionSectionTitle: d.description.sectionTitle,
    leadBefore: d.description.lead?.before ?? '',
    leadAccent: d.description.lead?.accent ?? '',
    leadAfter: d.description.lead?.after ?? '',
    descriptionBody: d.description.body,
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
    offer1Title: o1?.title ?? '',
    offer1Subtitle: o1?.subtitle ?? '',
    offer1Percent: o1?.percentOff ?? 25,
    offer1Original: o1?.originalPriceLabel ?? '',
    offer1Sale: o1?.salePriceLabel ?? '',
    offer1Period: o1?.periodLabel ?? '',
    offer2Title: o2?.title ?? '',
    offer2Subtitle: o2?.subtitle ?? '',
    offer2Percent: o2?.percentOff ?? 20,
    offer2Original: o2?.originalPriceLabel ?? '',
    offer2Sale: o2?.salePriceLabel ?? '',
    offer2Period: o2?.periodLabel ?? '',
    packagesSectionTitle: d.packages.sectionTitle,
    packagesSectionSubtitle: d.packages.sectionSubtitle ?? '',
    pkg1Name: p1?.name ?? '',
    pkg1Price: p1?.priceLabel ?? '',
    pkg1Period: p1?.periodLabel ?? '',
    pkg1Original: p1?.originalPriceLabel ?? '',
    pkg1Discount: p1?.discountPercent != null ? String(p1.discountPercent) : '',
    pkg1Features: p1?.features.join(', ') ?? '',
    pkg1Highlighted: Boolean(p1?.highlighted),
    pkg1Cta: p1?.ctaLabel ?? '',
    pkg2Name: p2?.name ?? '',
    pkg2Price: p2?.priceLabel ?? '',
    pkg2Period: p2?.periodLabel ?? '',
    pkg2Original: p2?.originalPriceLabel ?? '',
    pkg2Discount: p2?.discountPercent != null ? String(p2.discountPercent) : '',
    pkg2Features: p2?.features.join(', ') ?? '',
    pkg2Highlighted: Boolean(p2?.highlighted),
    pkg2Cta: p2?.ctaLabel ?? '',
    pkg3Name: p3?.name ?? '',
    pkg3Price: p3?.priceLabel ?? '',
    pkg3Period: p3?.periodLabel ?? '',
    pkg3Original: p3?.originalPriceLabel ?? '',
    pkg3Discount: p3?.discountPercent != null ? String(p3.discountPercent) : '',
    pkg3Features: p3?.features.join(', ') ?? '',
    pkg3Highlighted: Boolean(p3?.highlighted),
    pkg3Cta: p3?.ctaLabel ?? '',
    trainersSectionTitle: d.trainers.sectionTitle,
    trainersSectionSubtitle: d.trainers.sectionSubtitle ?? '',
    tr1Name: t1?.name ?? '',
    tr1Role: t1?.role ?? '',
    tr1Bio: t1?.shortBio ?? '',
    tr1Photo: t1?.photoUrl ?? '',
    tr2Name: t2?.name ?? '',
    tr2Role: t2?.role ?? '',
    tr2Bio: t2?.shortBio ?? '',
    tr2Photo: t2?.photoUrl ?? '',
    tr3Name: t3?.name ?? '',
    tr3Role: t3?.role ?? '',
    tr3Bio: t3?.shortBio ?? '',
    tr3Photo: t3?.photoUrl ?? '',
    contactEmail: c('email'),
    contactPhone: c('phone'),
    contactAddress: c('address'),
    contactInstagram: c('instagram').replace(/^@/, ''),
    whatsappFabHint: d.contacts.whatsappFabHint,
    hours: detail('hours'),
    parking: detail('parking'),
    footerTagline: d.footer.tagline,
    footerFinePrint: d.footer.finePrint ?? '',
  };
}

/**
 * Saved for `/crystal/preview` (see CrystalBusinessPage).
 * Uses localStorage (not sessionStorage) so a preview opened in a **new tab** can read the same draft —
 * sessionStorage is separate per tab, which caused “No preview yet” after Preview site → new tab.
 */
export type CrystalWebsiteDraftPayload = {
  slug: string;
  theme: { accentHex: string; darkHex: string };
  content: GymClientSiteContent;
};

export const CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY = 'crystal_website_preview_v1';

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
    const theme =
      typeof accent === 'string' && typeof dark === 'string' ?
        { accentHex: accent, darkHex: dark }
      : { accentHex: '#ea580c', darkHex: '#0c0a09' };
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
    return true;
  } catch {
    return false;
  }
}

function parseDiscount(s: string): number | undefined {
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : undefined;
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
  base.header.ratingLine = form.ratingLine.trim() || undefined;
  base.header.ctaSecondary =
    form.secondaryCtaLabel.trim() ?
      { label: form.secondaryCtaLabel.trim(), href: form.secondaryCtaHref.trim() || '#contact' }
    : undefined;

  base.nav.ctaLabel = form.navCtaLabel.trim() || base.nav.ctaLabel;
  base.nav.ctaHref = form.navCtaHref.trim() || base.nav.ctaHref;

  base.footer.brandTitle = gymName;
  base.footer.tagline = form.footerTagline.trim();
  base.footer.finePrint = form.footerFinePrint.trim() || undefined;

  base.description.sectionTitle = form.descriptionSectionTitle.trim();
  const lb = form.leadBefore.trim();
  const la = form.leadAccent.trim();
  const laf = form.leadAfter.trim();
  base.description.lead =
    lb || la || laf ? { before: lb, accent: la, after: laf } : undefined;
  base.description.body = form.businessDescription.trim() || form.descriptionBody.trim();
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
  base.discountOffers.offers = [
    {
      id: 'offer-1',
      title: form.offer1Title.trim() || 'Offer',
      subtitle: form.offer1Subtitle.trim() || undefined,
      percentOff: Math.min(100, Math.max(0, Number(form.offer1Percent) || 0)),
      originalPriceLabel: form.offer1Original.trim() || '—',
      salePriceLabel: form.offer1Sale.trim() || '—',
      periodLabel: form.offer1Period.trim() || undefined,
    },
    {
      id: 'offer-2',
      title: form.offer2Title.trim() || 'Offer',
      subtitle: form.offer2Subtitle.trim() || undefined,
      percentOff: Math.min(100, Math.max(0, Number(form.offer2Percent) || 0)),
      originalPriceLabel: form.offer2Original.trim() || '—',
      salePriceLabel: form.offer2Sale.trim() || '—',
      periodLabel: form.offer2Period.trim() || undefined,
    },
  ];

  base.packages.sectionTitle = form.packagesSectionTitle.trim();
  base.packages.sectionSubtitle = form.packagesSectionSubtitle.trim() || undefined;
  base.packages.items = [
    buildPackage(
      'pkg-1',
      form.pkg1Name,
      form.pkg1Price,
      form.pkg1Period,
      form.pkg1Original,
      form.pkg1Discount,
      form.pkg1Features,
      form.pkg1Highlighted,
      form.pkg1Cta
    ),
    buildPackage(
      'pkg-2',
      form.pkg2Name,
      form.pkg2Price,
      form.pkg2Period,
      form.pkg2Original,
      form.pkg2Discount,
      form.pkg2Features,
      form.pkg2Highlighted,
      form.pkg2Cta
    ),
    buildPackage(
      'pkg-3',
      form.pkg3Name,
      form.pkg3Price,
      form.pkg3Period,
      form.pkg3Original,
      form.pkg3Discount,
      form.pkg3Features,
      form.pkg3Highlighted,
      form.pkg3Cta
    ),
  ];

  base.trainers.sectionTitle = form.trainersSectionTitle.trim();
  base.trainers.sectionSubtitle = form.trainersSectionSubtitle.trim() || undefined;
  base.trainers.items = [
    {
      id: 'tr-1',
      name: form.tr1Name.trim() || 'Coach',
      role: form.tr1Role.trim() || undefined,
      shortBio: form.tr1Bio.trim() || undefined,
      photoUrl: form.tr1Photo.trim() || null,
    },
    {
      id: 'tr-2',
      name: form.tr2Name.trim() || 'Coach',
      role: form.tr2Role.trim() || undefined,
      shortBio: form.tr2Bio.trim() || undefined,
      photoUrl: form.tr2Photo.trim() || null,
    },
    {
      id: 'tr-3',
      name: form.tr3Name.trim() || 'Coach',
      role: form.tr3Role.trim() || undefined,
      shortBio: form.tr3Bio.trim() || undefined,
      photoUrl: form.tr3Photo.trim() || null,
    },
  ];

  base.contacts.whatsappFabHint = form.whatsappFabHint.trim();
  const email = form.contactEmail.trim();
  const phone = form.contactPhone.trim();
  const address = form.contactAddress.trim();
  const ig = form.contactInstagram.trim();
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
    theme: { accentHex: form.accentColor.trim(), darkHex: form.darkColor.trim() },
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
  const pk = c.packages.items;
  const [p1, p2, p3] = [pk[0], pk[1], pk[2]];
  const offs = c.discountOffers.offers;
  const [o1, o2] = [offs[0], offs[1]];
  const tr = c.trainers.items;
  const [t1, t2, t3] = [tr[0], tr[1], tr[2]];

  let instagram = contactValue(c.contacts.items, 'instagram');
  if (instagram.startsWith('@')) instagram = instagram.slice(1);

  const sec = c.header.ctaSecondary;

  const hoursRow = c.details.rows.find((r) => r.id === 'hours')?.value?.trim() ?? '';
  const parkingRow = c.details.rows.find((r) => r.id === 'parking')?.value?.trim() ?? '';

  return {
    slug: draft.slug,
    accentColor: draft.theme.accentHex || '#ea580c',
    darkColor: draft.theme.darkHex || '#0c0a09',
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
    ratingLine: c.header.ratingLine ?? '',
    navCtaLabel: c.nav.ctaLabel,
    navCtaHref: c.nav.ctaHref,
    secondaryCtaLabel: sec?.label ?? '',
    secondaryCtaHref: sec?.href ?? '#contact',
    descriptionSectionTitle: c.description.sectionTitle,
    leadBefore: c.description.lead?.before ?? '',
    leadAccent: c.description.lead?.accent ?? '',
    leadAfter: c.description.lead?.after ?? '',
    descriptionBody: c.description.body,
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
    offer1Title: o1?.title ?? '',
    offer1Subtitle: o1?.subtitle ?? '',
    offer1Percent: o1?.percentOff ?? 0,
    offer1Original: o1?.originalPriceLabel ?? '',
    offer1Sale: o1?.salePriceLabel ?? '',
    offer1Period: o1?.periodLabel ?? '',
    offer2Title: o2?.title ?? '',
    offer2Subtitle: o2?.subtitle ?? '',
    offer2Percent: o2?.percentOff ?? 0,
    offer2Original: o2?.originalPriceLabel ?? '',
    offer2Sale: o2?.salePriceLabel ?? '',
    offer2Period: o2?.periodLabel ?? '',
    packagesSectionTitle: c.packages.sectionTitle,
    packagesSectionSubtitle: c.packages.sectionSubtitle ?? '',
    pkg1Name: p1?.name ?? '',
    pkg1Price: p1?.priceLabel ?? '',
    pkg1Period: p1?.periodLabel ?? '',
    pkg1Original: p1?.originalPriceLabel ?? '',
    pkg1Discount: p1?.discountPercent != null ? String(p1.discountPercent) : '',
    pkg1Features: p1?.features?.join(', ') ?? '',
    pkg1Highlighted: Boolean(p1?.highlighted),
    pkg1Cta: p1?.ctaLabel ?? '',
    pkg2Name: p2?.name ?? '',
    pkg2Price: p2?.priceLabel ?? '',
    pkg2Period: p2?.periodLabel ?? '',
    pkg2Original: p2?.originalPriceLabel ?? '',
    pkg2Discount: p2?.discountPercent != null ? String(p2.discountPercent) : '',
    pkg2Features: p2?.features?.join(', ') ?? '',
    pkg2Highlighted: Boolean(p2?.highlighted),
    pkg2Cta: p2?.ctaLabel ?? '',
    pkg3Name: p3?.name ?? '',
    pkg3Price: p3?.priceLabel ?? '',
    pkg3Period: p3?.periodLabel ?? '',
    pkg3Original: p3?.originalPriceLabel ?? '',
    pkg3Discount: p3?.discountPercent != null ? String(p3.discountPercent) : '',
    pkg3Features: p3?.features?.join(', ') ?? '',
    pkg3Highlighted: Boolean(p3?.highlighted),
    pkg3Cta: p3?.ctaLabel ?? '',
    trainersSectionTitle: c.trainers.sectionTitle,
    trainersSectionSubtitle: c.trainers.sectionSubtitle ?? '',
    tr1Name: t1?.name ?? '',
    tr1Role: t1?.role ?? '',
    tr1Bio: t1?.shortBio ?? '',
    tr1Photo: typeof t1?.photoUrl === 'string' ? t1.photoUrl : '',
    tr2Name: t2?.name ?? '',
    tr2Role: t2?.role ?? '',
    tr2Bio: t2?.shortBio ?? '',
    tr2Photo: typeof t2?.photoUrl === 'string' ? t2.photoUrl : '',
    tr3Name: t3?.name ?? '',
    tr3Role: t3?.role ?? '',
    tr3Bio: t3?.shortBio ?? '',
    tr3Photo: typeof t3?.photoUrl === 'string' ? t3.photoUrl : '',
    contactEmail: contactValue(c.contacts.items, 'email'),
    contactPhone: contactValue(c.contacts.items, 'phone'),
    contactAddress: contactValue(c.contacts.items, 'address'),
    contactInstagram: instagram,
    whatsappFabHint: c.contacts.whatsappFabHint,
    hours: hoursRow === '—' ? '' : hoursRow,
    parking: parkingRow === '—' ? '' : parkingRow,
    footerTagline: c.footer.tagline,
    footerFinePrint: c.footer.finePrint ?? '',
  };
}
