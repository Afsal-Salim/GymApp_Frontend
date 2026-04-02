import type { PublicBusinessDetail } from '../../api';
import clientDefaultHeroBackground from '../../assets/clientbg.png';
import { publicGymSiteHostLabel, publicGymSiteUrl } from '../../config/env';
import { GYM_CLIENT_BRAND_LOGO_SRC } from './gymClientBrandLogo';

export type GymClientNavItem = {
  id: string;
  label: string;
  /** Hash link e.g. #about */
  href: string;
};

export type GymClientFooterLink = {
  label: string;
  href: string;
};

export type GymClientContactItem = {
  id: string;
  label: string;
  value: string;
  href?: string;
};

export type GymClientPackageItem = {
  id: string;
  name: string;
  priceLabel: string;
  periodLabel?: string;
  /** Shown struck-through when set with discountPercent */
  originalPriceLabel?: string;
  /** Renders % badge */
  discountPercent?: number;
  features: readonly string[];
  highlighted?: boolean;
  ctaLabel?: string;
};

export type GymClientDiscountOffer = {
  id: string;
  title: string;
  subtitle?: string;
  percentOff: number;
  originalPriceLabel: string;
  salePriceLabel: string;
  periodLabel?: string;
};

/** True when an offer has real content (0% + default title “Offer” + placeholder prices alone does not count). */
export function isGymClientDiscountOfferFilled(o: GymClientDiscountOffer): boolean {
  if (o.percentOff > 0) return true;
  const sale = o.salePriceLabel.trim();
  const orig = o.originalPriceLabel.trim();
  if (sale && sale !== '—') return true;
  if (orig && orig !== '—') return true;
  if (o.subtitle?.trim()) return true;
  const t = o.title.trim();
  if (t && t.toLowerCase() !== 'offer') return true;
  return false;
}

/** True when a membership card is more than empty placeholders from the builder (`Plan` / `—`). */
export function isGymClientPackageItemFilled(p: GymClientPackageItem): boolean {
  const nameOk = p.name.trim() && p.name.trim() !== 'Plan';
  const priceOk = p.priceLabel.trim() && p.priceLabel.trim() !== '—';
  const orig = p.originalPriceLabel?.trim();
  const origOk = Boolean(orig && orig !== '—');
  const discOk = p.discountPercent != null && p.discountPercent > 0;
  const ctaOk = Boolean(p.ctaLabel?.trim());
  const featOk = p.features.some((f) => f.trim() && f !== '—');
  return nameOk || priceOk || origOk || discOk || ctaOk || featOk;
}

export type GymClientDetailRow = {
  id: string;
  label: string;
  value: string;
  /** When set, the value is shown as this link (e.g. live gym URL while label stays scheme-free). */
  href?: string;
};

/** Coach / trainer row for the public site. Empty `trainers.items` hides the section. */
export type GymClientTrainer = {
  id: string;
  name: string;
  /** e.g. Head coach, Yoga lead */
  role?: string;
  shortBio?: string;
  /** Profile image URL; omit or null for initials placeholder */
  photoUrl?: string | null;
};

export type GymClientHeroCta = {
  label: string;
  href: string;
};

/** About grid cards under the main heading */
export type GymClientAboutFeature = {
  id: string;
  title: string;
  subtext: string;
  icon: 'coaches' | 'facility' | 'results';
};

/**
 * Public gym site at `/:slug` — swap `GYM_CLIENT_SITE_DEFAULTS` or merge API JSON later.
 */
export type GymClientSiteContent = {
  layout: {
    /** Hero background (full-width). Replace via API when ready. */
    heroBackgroundImage: string;
    /** 0–1 dark overlay on top of image */
    heroOverlay: number;
    /** Optional `#rrggbb` for hero headline, taglines, subtitle, and info bar copy. Omit for default white tones. */
    heroTextColor?: string;
  };
  nav: {
    items: GymClientNavItem[];
    /** Omitted when the site hides the primary CTA (nav + hero). */
    ctaLabel?: string;
    ctaHref?: string;
  };
  footer: {
    brandTitle: string;
    tagline: string;
    links: GymClientFooterLink[];
    /** e.g. "Powered by Crystal" */
    finePrint?: string;
  };
  logo: {
    src: string;
    alt: string;
  };
  header: {
    /** Line above the gym name, e.g. “Transform Your Body at” */
    titlePrefix: string;
    /** Gym / business name — shown in large type with accent brackets */
    title: string;
    /** Shown as “A • B • C” under the title; if empty, `subtitle` is shown in this line instead */
    taglineItems: string[];
    /** Longer paragraph under the tagline line when tagline items exist; otherwise fills the tagline line */
    subtitle: string;
    /** Ghost button next to primary (nav CTA) */
    ctaSecondary?: GymClientHeroCta;
    /** 0–5 score; hero bar shows “Rated …/5 by members”. Omit to hide that segment. */
    memberRating?: number;
  };
  description: {
    sectionTitle: string;
    /** e.g. “Helping over **500+ members** get fit since 2018” — accent uses theme color */
    lead?: { before: string; accent: string; after: string };
    body: string;
    /** Optional blended image background behind the About body copy block. */
    bodyBackground?: {
      enabled: boolean;
      imageUrl?: string;
      blendColor?: string;
      /** When true, UI uses bundled palette artwork for `imageUrl` (Crystal builder). */
      usePresetArtwork?: boolean;
    };
    /** Empty = simple about (title + body only) */
    features: GymClientAboutFeature[];
  };
  video: {
    sectionTitle: string;
    url: string;
    caption?: string;
  };
  discountOffers: {
    sectionTitle: string;
    sectionSubtitle?: string;
    offers: GymClientDiscountOffer[];
  };
  packages: {
    sectionTitle: string;
    sectionSubtitle?: string;
    items: GymClientPackageItem[];
  };
  trainers: {
    sectionTitle: string;
    sectionSubtitle?: string;
    items: GymClientTrainer[];
  };
  contacts: {
    sectionTitle: string;
    items: GymClientContactItem[];
    /** Thought-bubble next to floating WhatsApp; empty string hides the bubble */
    whatsappFabHint: string;
    /** Google Maps (or other) URL; shown next to address with a map pin on the public page. */
    locationMapUrl?: string;
  };
  details: {
    sectionTitle: string;
    rows: GymClientDetailRow[];
  };
};

/**
 * Body for **POST** `{API_BASE}/businesses/website-setup/` (authenticated).
 * Sent when the user clicks “Save & continue to plans” on the Crystal website builder.
 *
 * - `slug`: chosen public path (`/{slug}/`).
 * - `theme`: CSS variables for the live client (`--gym-client-accent`, `--gym-client-dark`, `--gym-client-text`, `--gym-client-light`).
 * - `content`: full public page model (same shape as preview). Image fields may be `https://` or `data:image/...` until the backend persists uploads.
 * - **Location / maps:** `content.contacts.locationMapUrl` — optional string, full `https://…` maps link (e.g. Google Maps share URL).
 *   Also persist on the business record as `location_map_url` if your API supports it.
 * - **Discounts:** `content.discountOffers.offers` may be `[]` when there are no deals; the client page hides the deals section.
 * - **Hero text:** optional `content.layout.heroTextColor` (`#rrggbb`) tints headline, taglines, subtitle, and the address/rating bar.
 */
export type CrystalWebsiteSetupPayload = {
  slug: string;
  theme: {
    accentHex: string;
    darkHex: string;
    textHex: string;
    /** Light surfaces/cards base (used for “mostly white” areas). */
    lightHex?: string;
  };
  content: GymClientSiteContent;
};

/** Bundled default hero cover for new sites (website builder + public defaults). */
const DEFAULT_HERO_BG: string = clientDefaultHeroBackground;

/** Old marketing default gym photo (Unsplash); still appears in saved drafts and API `website_content`. */
const LEGACY_UNSPLASH_HERO_PHOTO_ID = 'photo-1534438327276';

/**
 * Replace legacy Unsplash hero URLs with the bundled default. Empty string is unchanged (builder may clear field).
 */
export function normalizeLegacyHeroBackgroundImageUrl(url: string | undefined | null): string {
  const t = (url ?? '').trim();
  if (!t) return t;
  if (t.includes('images.unsplash.com') && t.includes(LEGACY_UNSPLASH_HERO_PHOTO_ID)) return DEFAULT_HERO_BG;
  return t;
}

/** Migrate stored/API site content so preview and edit flows drop the old Unsplash hero. */
export function withLegacyHeroBackgroundMigrated(content: GymClientSiteContent): GymClientSiteContent {
  const raw = (content.layout?.heroBackgroundImage ?? '').trim();
  const next = normalizeLegacyHeroBackgroundImageUrl(raw);
  if (next === raw) return content;
  return {
    ...content,
    layout: { ...content.layout, heroBackgroundImage: next },
  };
}

export const GYM_CLIENT_SITE_DEFAULTS: GymClientSiteContent = {
  layout: {
    heroBackgroundImage: DEFAULT_HERO_BG,
    heroOverlay: 0.55,
  },
  nav: {
    items: [
      { id: 'about', label: 'About', href: '#about' },
      { id: 'trainers', label: 'Coaches', href: '#trainers' },
      { id: 'offers', label: 'Deals', href: '#deals' },
      { id: 'pricing', label: 'Pricing', href: '#pricing' },
      { id: 'tour', label: 'Tour', href: '#tour' },
      { id: 'visit', label: 'Visit', href: '#visit' },
      { id: 'contact', label: 'Contact', href: '#contact' },
    ],
    ctaLabel: 'Join now',
    ctaHref: '#contact',
  },
  footer: {
    brandTitle: 'Your Gym',
    tagline: 'Stronger every session.',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Coaches', href: '#trainers' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Contact', href: '#contact' },
    ],
    finePrint: 'Member site',
  },
  logo: {
    src: GYM_CLIENT_BRAND_LOGO_SRC,
    alt: 'Gym logo',
  },
  header: {
    titlePrefix: 'Transform your body at',
    title: 'Your Gym',
    taglineItems: ['Personal training', 'Modern equipment', 'Open 6am – 10pm'],
    subtitle: 'Strength, conditioning, and community under one roof.',
    ctaSecondary: { label: 'Book free trial', href: '#contact' },
    memberRating: 4.9,
  },
  description: {
    sectionTitle: 'Achieve your fitness goals',
    lead: {
      before: 'Helping over ',
      accent: '500+ members',
      after: ' get fit since 2018',
    },
    body:
      'We help you move better, get stronger, and stay consistent. Whether you are new to training or chasing a new PR, our coaches and members have your back.',
    bodyBackground: {
      enabled: false,
      imageUrl: '',
      blendColor: '#111827CC',
    },
    features: [
      {
        id: 'feat-coaches',
        title: 'Expert coaches',
        subtext: 'Certified & experienced trainers',
        icon: 'coaches',
      },
      {
        id: 'feat-facility',
        title: 'State-of-the-art facility',
        subtext: 'Top-notch equipment',
        icon: 'facility',
      },
      {
        id: 'feat-results',
        title: 'Proven results',
        subtext: 'Real success stories',
        icon: 'results',
      },
    ],
  },
  video: {
    sectionTitle: 'Facility tour',
    url: '',
    caption: 'Walk the floor, racks, and studio in under two minutes.',
  },
  discountOffers: {
    sectionTitle: 'Limited-time offers',
    sectionSubtitle: 'Lock in member pricing before rates go up.',
    offers: [
      {
        id: 'founders',
        title: 'Founders rate',
        subtitle: 'First 50 members',
        percentOff: 25,
        originalPriceLabel: '₹3,999',
        salePriceLabel: '₹2,999',
        periodLabel: '/ month',
      },
      {
        id: 'annual',
        title: 'Annual commitment',
        subtitle: 'Pay yearly, save big',
        percentOff: 20,
        originalPriceLabel: '₹35,988',
        salePriceLabel: '₹28,799',
        periodLabel: '/ year',
      },
    ],
  },
  packages: {
    sectionTitle: 'Memberships',
    sectionSubtitle: 'Pick what fits your schedule. Upgrade anytime.',
    items: [
      {
        id: 'drop-in',
        name: 'Drop-in',
        priceLabel: '₹399',
        originalPriceLabel: '₹499',
        discountPercent: 20,
        periodLabel: 'per visit',
        features: ['Single session', 'All group classes', 'Locker access'],
        ctaLabel: 'Ask at desk',
      },
      {
        id: 'monthly',
        name: 'Monthly',
        priceLabel: '₹2,999',
        originalPriceLabel: '₹3,499',
        discountPercent: 14,
        periodLabel: 'per month',
        features: ['Unlimited gym floor', 'Group classes', '1 form check / month'],
        highlighted: true,
        ctaLabel: 'Most popular',
      },
      {
        id: 'annual',
        name: 'Annual',
        priceLabel: '₹24,999',
        originalPriceLabel: '₹31,200',
        discountPercent: 20,
        periodLabel: 'per year',
        features: ['Best value', 'Same as Monthly', '2 guest passes / month'],
        ctaLabel: 'Save more',
      },
    ],
  },
  trainers: {
    sectionTitle: 'Our coaches',
    sectionSubtitle: 'Certified trainers here to guide every rep and every goal.',
    items: [
      {
        id: 'trainer-1',
        name: 'Alex Rivera',
        role: 'Head coach · Strength',
        shortBio: 'Powerlifting background, 10+ years coaching all levels.',
        photoUrl:
          'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&h=400&q=80',
      },
      {
        id: 'trainer-2',
        name: 'Jordan Lee',
        role: 'HIIT & conditioning',
        shortBio: 'Former collegiate athlete focused on speed and stamina.',
        photoUrl:
          'https://images.unsplash.com/photo-1594381898411-e6cdf7a5c7c2?auto=format&fit=crop&w=400&h=400&q=80',
      },
      {
        id: 'trainer-3',
        name: 'Sam Okonkwo',
        role: 'Mobility & recovery',
        shortBio: 'Helps you move well, recover smart, and stay injury-free.',
        photoUrl: null,
      },
    ],
  },
  contacts: {
    sectionTitle: 'Contact',
    whatsappFabHint: 'Got questions? Message us on WhatsApp for membership enquiries.',
    items: [
      {
        id: 'email',
        label: 'Email',
        value: 'hello@yourgym.com',
        href: 'mailto:hello@yourgym.com',
      },
      {
        id: 'instagram',
        label: 'Instagram',
        value: '@yourgym',
        href: 'https://instagram.com/',
      },
      { id: 'phone', label: 'Phone', value: '', href: undefined },
      { id: 'address', label: 'Address', value: '' },
    ],
  },
  details: {
    sectionTitle: 'Visit',
    rows: [
      { id: 'hours', label: 'Hours', value: 'Mon–Fri 6am–10pm · Sat–Sun 8am–8pm' },
      { id: 'parking', label: 'Parking', value: 'Free street parking on Oak Ave' },
      { id: 'slug', label: 'Website', value: '' },
    ],
  },
};

function cloneDiscountOffers(d: GymClientSiteContent['discountOffers']): GymClientSiteContent['discountOffers'] {
  return {
    ...d,
    offers: d.offers.map((o) => ({ ...o })),
  };
}

/** Deep copy of default client site content (setup forms, previews). */
export function cloneGymClientSiteDefaults(): GymClientSiteContent {
  return cloneDefaults();
}

function cloneDefaults(): GymClientSiteContent {
  return {
    ...GYM_CLIENT_SITE_DEFAULTS,
    layout: { ...GYM_CLIENT_SITE_DEFAULTS.layout },
    nav: {
      ...GYM_CLIENT_SITE_DEFAULTS.nav,
      items: GYM_CLIENT_SITE_DEFAULTS.nav.items.map((i) => ({ ...i })),
    },
    footer: {
      ...GYM_CLIENT_SITE_DEFAULTS.footer,
      links: GYM_CLIENT_SITE_DEFAULTS.footer.links.map((l) => ({ ...l })),
    },
    logo: { ...GYM_CLIENT_SITE_DEFAULTS.logo },
    header: {
      ...GYM_CLIENT_SITE_DEFAULTS.header,
      taglineItems: [...GYM_CLIENT_SITE_DEFAULTS.header.taglineItems],
      ctaSecondary: GYM_CLIENT_SITE_DEFAULTS.header.ctaSecondary
        ? { ...GYM_CLIENT_SITE_DEFAULTS.header.ctaSecondary }
        : undefined,
    },
    description: {
      ...GYM_CLIENT_SITE_DEFAULTS.description,
      lead: GYM_CLIENT_SITE_DEFAULTS.description.lead ? { ...GYM_CLIENT_SITE_DEFAULTS.description.lead } : undefined,
      bodyBackground: GYM_CLIENT_SITE_DEFAULTS.description.bodyBackground
        ? { ...GYM_CLIENT_SITE_DEFAULTS.description.bodyBackground }
        : undefined,
      features: GYM_CLIENT_SITE_DEFAULTS.description.features.map((f) => ({ ...f })),
    },
    video: { ...GYM_CLIENT_SITE_DEFAULTS.video },
    discountOffers: cloneDiscountOffers(GYM_CLIENT_SITE_DEFAULTS.discountOffers),
    packages: {
      ...GYM_CLIENT_SITE_DEFAULTS.packages,
      items: GYM_CLIENT_SITE_DEFAULTS.packages.items.map((p) => ({
        ...p,
        features: [...p.features],
      })),
    },
    trainers: {
      ...GYM_CLIENT_SITE_DEFAULTS.trainers,
      items: GYM_CLIENT_SITE_DEFAULTS.trainers.items.map((t) => ({ ...t })),
    },
    contacts: {
      ...GYM_CLIENT_SITE_DEFAULTS.contacts,
      items: GYM_CLIENT_SITE_DEFAULTS.contacts.items.map((i) => ({ ...i })),
    },
    details: {
      ...GYM_CLIENT_SITE_DEFAULTS.details,
      rows: GYM_CLIENT_SITE_DEFAULTS.details.rows.map((r) => ({ ...r })),
    },
  };
}

function upsertContact(items: GymClientContactItem[], row: GymClientContactItem): GymClientContactItem[] {
  const i = items.findIndex((x) => x.id === row.id);
  if (i >= 0) {
    const next = [...items];
    next[i] = row;
    return next;
  }
  return [...items, row];
}

function upsertDetail(rows: GymClientDetailRow[], row: GymClientDetailRow): GymClientDetailRow[] {
  const i = rows.findIndex((x) => x.id === row.id);
  if (i >= 0) {
    const next = [...rows];
    next[i] = row;
    return next;
  }
  return [...rows, row];
}

export function resolveGymClientSiteContent(business: PublicBusinessDetail): GymClientSiteContent {
  const c = cloneDefaults();

  c.header.title = business.name?.trim() || c.header.title;
  c.footer.brandTitle = business.name?.trim() || c.footer.brandTitle;

  if (business.description?.trim()) {
    c.description.body = business.description.trim();
  }

  if (business.phone?.trim()) {
    const phone = business.phone.trim();
    c.contacts.items = upsertContact(c.contacts.items, {
      id: 'phone',
      label: 'Phone',
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
    });
  }

  if (business.address?.trim()) {
    c.contacts.items = upsertContact(c.contacts.items, {
      id: 'address',
      label: 'Address',
      value: business.address.trim(),
    });
  }

  const mapFromApi = business.location_map_url?.trim();
  if (mapFromApi && isValidHttpLocationUrl(mapFromApi)) {
    c.contacts.locationMapUrl = normalizeLocationMapUrl(mapFromApi);
  }

  if (business.slug) {
    c.details.rows = upsertDetail(c.details.rows, {
      id: 'slug',
      label: 'Website',
      value: publicGymSiteHostLabel(business.slug),
      href: publicGymSiteUrl(business.slug),
    });
  }

  c.logo.alt = `${business.name ?? c.header.title} logo`;

  const apiLogo = business.logo_url?.trim();
  if (apiLogo) {
    c.logo.src = apiLogo;
  }

  return c;
}

/** Normalize pasted maps links (add https when missing). */
export function normalizeLocationMapUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  const href =
    t.startsWith('http://') || t.startsWith('https://') ? t : t.startsWith('//') ? `https:${t}` : `https://${t}`;
  try {
    return new URL(href).href;
  } catch {
    return t;
  }
}

export function isValidHttpLocationUrl(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  try {
    const href =
      t.startsWith('http://') || t.startsWith('https://') ? t : t.startsWith('//') ? `https:${t}` : `https://${t}`;
    const u = new URL(href);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function clampMemberRating(n: number): number {
  return Math.min(5, Math.max(0, n));
}

/** Hero bar copy from a 0–5 score (one decimal when needed). */
export function formatHeroMemberRating(n: number): string {
  const c = clampMemberRating(n);
  const rounded = Math.round(c * 10) / 10;
  const label = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `Rated ${label}/5 by members`;
}

/**
 * Best-effort parse from legacy `ratingLine` strings (e.g. “Rated 4.9/5 by members”) or bare numbers.
 */
export function parseLegacyRatingToMemberRating(line: string | undefined): number | undefined {
  if (!line?.trim()) return undefined;
  const slash = line.match(/(\d+(?:[.,]\d+)?)\s*\/\s*5/i);
  if (slash) {
    const n = parseFloat(slash[1].replace(',', '.'));
    return Number.isFinite(n) ? clampMemberRating(n) : undefined;
  }
  const n = parseFloat(line.replace(',', '.'));
  return Number.isFinite(n) ? clampMemberRating(n) : undefined;
}

type HeaderWithLegacy = GymClientSiteContent['header'] & { ratingLine?: string };

/** Text for the hero rating segment; supports old drafts that only stored `ratingLine`. */
export function getHeroRatingDisplayText(header: GymClientSiteContent['header']): string | undefined {
  const h = header as HeaderWithLegacy;
  if (typeof h.memberRating === 'number' && Number.isFinite(h.memberRating)) {
    return formatHeroMemberRating(h.memberRating);
  }
  const fromLegacy = parseLegacyRatingToMemberRating(h.ratingLine);
  if (fromLegacy != null) return formatHeroMemberRating(fromLegacy);
  const raw = h.ratingLine?.trim();
  return raw || undefined;
}

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Pull an 11-char YouTube video id from common URL shapes (watch, embed, shorts, live, youtu.be). */
export function extractYoutubeVideoId(raw: string): string {
  const u = raw.trim();
  if (!u) return '';
  if (YOUTUBE_ID_RE.test(u)) return u;

  const tryHost = (href: string): string => {
    let parsed: URL;
    try {
      parsed = new URL(href);
    } catch {
      return '';
    }
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const seg = parsed.pathname.split('/').filter(Boolean)[0];
      const id = seg?.split('?')[0] ?? '';
      return YOUTUBE_ID_RE.test(id) ? id : '';
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = parsed.searchParams.get('v');
      if (v && YOUTUBE_ID_RE.test(v)) return v;

      const parts = parsed.pathname.split('/').filter(Boolean);
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        if (seg === 'embed' || seg === 'shorts' || seg === 'live' || seg === 'v') {
          const id = parts[i + 1]?.split('?')[0] ?? '';
          if (YOUTUBE_ID_RE.test(id)) return id;
        }
      }

      if (parts[0] === 'watch' && parts[1] && YOUTUBE_ID_RE.test(parts[1])) {
        return parts[1];
      }
    }

    return '';
  };

  const fromAbsolute = tryHost(u.startsWith('//') ? `https:${u}` : u.startsWith('http') ? u : `https://${u}`);
  if (fromAbsolute) return fromAbsolute;

  const watch = u.match(/[?&]v=([a-zA-Z0-9_-]{11})(?:&|$|#)/);
  if (watch) return watch[1];
  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|#|$|\/)/);
  if (short) return short[1];
  const embedPath = u.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?|#|$|\/)/i);
  if (embedPath) return embedPath[1];
  const shorts = u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?|#|$|\/)/i);
  if (shorts) return shorts[1];

  return '';
}

/**
 * Normalizes a pasted YouTube / embed URL to an iframe-safe `https://www.youtube.com/embed/…` src.
 * Returns '' when the URL is not a usable YouTube embed (avoids blank iframes from watch links).
 */
export function gymVideoUrlToEmbedSrc(url: string): string {
  const id = extractYoutubeVideoId(url);
  if (id) return `https://www.youtube.com/embed/${id}`;

  const t = url.trim();
  if (!t) return '';

  try {
    const href = t.startsWith('http') ? t : t.startsWith('//') ? `https:${t}` : `https://${t}`;
    const parsed = new URL(href);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    const path = parsed.pathname.toLowerCase();
    if (path.includes('/embed/')) {
      return parsed.protocol === 'https:' ? parsed.href : `https://${parsed.host}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    /* ignore */
  }

  return '';
}
