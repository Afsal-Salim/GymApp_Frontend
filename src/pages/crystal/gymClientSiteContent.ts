import type { PublicBusinessDetail } from '../../api';
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

export type GymClientDetailRow = {
  id: string;
  label: string;
  value: string;
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
 * Public gym site at /crystal/:slug — swap `GYM_CLIENT_SITE_DEFAULTS` or merge API JSON later.
 */
export type GymClientSiteContent = {
  layout: {
    /** Hero background (full-width). Replace via API when ready. */
    heroBackgroundImage: string;
    /** 0–1 dark overlay on top of image */
    heroOverlay: number;
  };
  nav: {
    items: GymClientNavItem[];
    ctaLabel: string;
    ctaHref: string;
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
    /** Shown as “A • B • C” under the title; if empty, `subtitle` is used instead */
    taglineItems: string[];
    subtitle: string;
    /** Ghost button next to primary (nav CTA) */
    ctaSecondary?: GymClientHeroCta;
    /** Right side of hero info bar; omit to hide */
    ratingLine?: string;
  };
  description: {
    sectionTitle: string;
    /** e.g. “Helping over **500+ members** get fit since 2018” — accent uses theme color */
    lead?: { before: string; accent: string; after: string };
    body: string;
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
  };
  details: {
    sectionTitle: string;
    rows: GymClientDetailRow[];
  };
};

const DEFAULT_HERO_BG =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80';

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
    ratingLine: 'Rated 4.9/5 by members',
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
      { id: 'slug', label: 'Page', value: '' },
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

  if (business.slug) {
    c.details.rows = upsertDetail(c.details.rows, {
      id: 'slug',
      label: 'Page',
      value: `/${business.slug}`,
    });
  }

  c.logo.alt = `${business.name ?? c.header.title} logo`;

  const apiLogo = business.logo_url?.trim();
  if (apiLogo) {
    c.logo.src = apiLogo;
  }

  return c;
}

export function gymVideoUrlToEmbedSrc(url: string): string {
  const u = url.trim();
  if (!u) return '';
  if (u.includes('youtube.com/embed/')) return u;
  const watch = u.match(/[?&]v=([\w-]{11})/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = u.match(/youtu\.be\/([\w-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  return u;
}
