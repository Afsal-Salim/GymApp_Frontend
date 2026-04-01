import { useState, useEffect, useMemo, useRef, type RefObject, type CSSProperties } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Navbar, Nav } from 'react-bootstrap';
import { PageContainer, WhatsAppLogoIcon, GymLoadingScreen } from '../../components';
import {
  fetchPublicGymBundle,
  getAccessToken,
  invalidatePublicGymBundleCache,
  peekPublicGymBundle,
  PublicBusinessNotFoundError,
} from '../../api';
import type { PublicBusinessDetail } from '../../api';
import CrystalServiceUnavailable from './CrystalServiceUnavailable';
import GymClientBookTrialModal from './GymClientBookTrialModal';
import GymClientPlanVisitModal from './GymClientPlanVisitModal';
import {
  cloneGymClientSiteDefaults,
  resolveGymClientSiteContent,
  getHeroRatingDisplayText,
  gymVideoUrlToEmbedSrc,
  isGymClientDiscountOfferFilled,
  isGymClientPackageItemFilled,
  type GymClientAboutFeature,
  type GymClientSiteContent,
} from './gymClientSiteContent';
import {
  crystalMarketingAbsoluteUrl,
  getPublicGymSlugFromHost,
  publicGymSiteUrl,
  publicSiteDomain,
} from '../../config/env';
import { CRYSTAL_WEBSITE_PREVIEW_BROADCAST_CHANNEL } from '../../config/storageKeys';
import {
  CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY,
  GYM_CLIENT_DEFAULT_TEXT_HEX,
  readCrystalWebsitePreviewFromStorage,
} from '../website/setup/createWebsiteFormState';
import { buildGymClientWhatsAppHref } from './gymClientWhatsApp';
import { recordGymClientLeadCta, recordGymClientWhatsAppClick } from './gymClientLeadTracking';
import GymClientJoinLeadModal from './GymClientJoinLeadModal';
import { GymClientMapsPinIcon, GymClientMidCtaIcon } from './GymClientDecorIcons';
import './CrystalBusinessPage.css';

/** Default theme for the marketing demo at `/preview?from=marketing` (matches website builder defaults). */
const MARKETING_PREVIEW_THEME = {
  accentHex: '#ea580c',
  darkHex: '#0c0a09',
  textHex: GYM_CLIENT_DEFAULT_TEXT_HEX,
  lightHex: '#ffffff',
} as const;

/** Fallback when no draft / API theme (matches `.crystal-client-viewport` CSS defaults). */
const CLIENT_THEME_FALLBACK = {
  accentHex: '#ea580c',
  darkHex: '#0c0a09',
  textHex: GYM_CLIENT_DEFAULT_TEXT_HEX,
  lightHex: '#ffffff',
} as const;

type ParsedWebsiteTheme = Partial<{
  accentHex: string;
  darkHex: string;
  textHex: string;
  lightHex: string;
}>;

function parseWebsiteThemeFromApi(raw: unknown): ParsedWebsiteTheme {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const pick = (camel: string, snake: string): string | undefined => {
    const a = o[camel];
    const b = o[snake];
    const v = (typeof a === 'string' && a.trim() ? a : typeof b === 'string' && b.trim() ? b : '') as string;
    return v.trim() || undefined;
  };
  return {
    accentHex: pick('accentHex', 'accent_hex'),
    darkHex: pick('darkHex', 'dark_hex'),
    textHex: pick('textHex', 'text_hex'),
    lightHex: pick('lightHex', 'light_hex'),
  };
}

function gymClientThemeToCssVars(theme: {
  accentHex: string;
  darkHex: string;
  textHex: string;
  lightHex: string;
}): CSSProperties {
  return {
    ['--gym-client-accent' as string]: theme.accentHex,
    ['--gym-client-dark' as string]: theme.darkHex,
    ['--gym-client-text' as string]: theme.textHex,
    ['--gym-client-light' as string]: theme.lightHex,
  };
}

function headerSecondaryOpensBookTrial(
  secondary: GymClientSiteContent['header']['ctaSecondary']
): boolean {
  if (!secondary?.label) return false;
  const l = secondary.label.toLowerCase();
  return l.includes('trial') || (l.includes('book') && l.includes('free'));
}

function useRevealOnScroll(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-reveal]');
    if (els.length === 0) return;

    const reveal = (target: Element) => {
      target.classList.add('crystal-client-reveal--visible');
    };

    const inView = (el: Element) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < vh * 0.92 && rect.bottom > 0;
    };

    els.forEach((el) => {
      if (inView(el)) reveal(el);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) reveal(e.target);
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -6% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

function GymClientPercentBadge({ value }: { value: number }) {
  return (
    <div className="crystal-client__pct-badge" aria-hidden>
      <span className="crystal-client__pct-value">{value}</span>
      <span className="crystal-client__pct-symbol">%</span>
      <span className="crystal-client__pct-off">OFF</span>
    </div>
  );
}

function SvgHeroPin() {
  return (
    <svg className="crystal-client__hero-infobar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function SvgHeroStar() {
  return (
    <svg className="crystal-client__hero-infobar-icon crystal-client__hero-infobar-icon--star" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function GymClientAboutFeatureGlyph({ icon }: { icon: GymClientAboutFeature['icon'] }) {
  const p = { className: 'crystal-client__about-feature-glyph', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const };
  switch (icon) {
    case 'coaches':
      return (
        <svg {...p}>
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.29 0-2.4.84-2.82 2H12.9c-.41-1.16-1.52-2-2.82-2-1.66 0-3 1.34-3 3s1.34 3 3 3c.93 0 1.76-.43 2.31-1.09.55.66 1.38 1.09 2.31 1.09 1.66 0 3-1.34 3-3zM8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      );
    case 'facility':
      return (
        <svg {...p}>
          <circle cx="7" cy="12" r="3" />
          <rect x="10" y="10" width="8" height="4" rx="1" />
          <circle cx="17" cy="12" r="3" />
        </svg>
      );
    case 'results':
      return (
        <svg {...p}>
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7v-7zm4-3h2v10h-2V7zm4 6h2v4h-2v-4z" />
        </svg>
      );
    default:
      return null;
  }
}

type GymClientMidVariant = 'join' | 'membership' | 'visit';

function GymClientMidCtaStrip({
  businessSlug,
  variant,
  href,
  brandLogoSrc,
  onJoinClick,
  onVisitClick,
  suppressPublicLeads = false,
}: {
  businessSlug: string;
  variant: GymClientMidVariant;
  href: string;
  brandLogoSrc: string;
  /** Opens join lead modal instead of navigating (join strip only). */
  onJoinClick?: () => void;
  /** Opens plan-visit modal instead of navigating (visit strip only). */
  onVisitClick?: () => void;
  suppressPublicLeads?: boolean;
}) {
  const config = {
    join: {
      title: 'Join now',
      sub: 'Take the next step — tell us a bit about you and we’ll follow up.',
      btn: 'Join now',
      track: 'cta_join_now' as const,
    },
    membership: {
      title: 'Get membership today',
      sub: 'See plans, pricing, and member perks while spots last.',
      btn: 'View membership',
      track: 'cta_membership_today' as const,
    },
    visit: {
      title: 'Visit the gym',
      sub: 'Walk the floor, check the equipment, and meet the team.',
      btn: 'Plan your visit',
      track: 'cta_visit_gym' as const,
    },
  }[variant];

  return (
    <section className={`crystal-client-mid-cta crystal-client-mid-cta--${variant}`} aria-label={config.title}>
      <Container>
        <div className="crystal-client-mid-cta__inner" data-reveal>
          <div className="crystal-client-mid-cta__visual" aria-hidden>
            <span className="crystal-client-mid-cta__icon-ring">
              <GymClientMidCtaIcon variant={variant} brandLogoSrc={brandLogoSrc} />
            </span>
          </div>
          <div className="crystal-client-mid-cta__copy">
            <h3 className="crystal-client-mid-cta__title">{config.title}</h3>
            <p className="crystal-client-mid-cta__sub mb-0">{config.sub}</p>
          </div>
          {variant === 'visit' && onVisitClick ? (
            <button
              type="button"
              className="btn crystal-client-mid-cta__btn"
              onClick={() => {
                if (!suppressPublicLeads) recordGymClientLeadCta(businessSlug, config.track);
                onVisitClick();
              }}
            >
              {config.btn}
            </button>
          ) : variant === 'join' && onJoinClick ? (
            <button type="button" className="btn crystal-client-mid-cta__btn" onClick={onJoinClick}>
              {config.btn}
            </button>
          ) : (
            <a
              href={href}
              className="btn crystal-client-mid-cta__btn"
              onClick={() => {
                if (!suppressPublicLeads) recordGymClientLeadCta(businessSlug, config.track);
              }}
            >
              {config.btn}
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}

function GymClientNavBar({
  content,
  showTrainers,
  showDeals,
  showPackages,
  onOpenJoinLead,
}: {
  content: GymClientSiteContent;
  showTrainers: boolean;
  showDeals: boolean;
  showPackages: boolean;
  /** When set and nav CTA targets #contact, open join lead modal instead of jumping. */
  onOpenJoinLead?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Navbar
      expand="lg"
      sticky="top"
      variant="dark"
      className="crystal-client-nav"
      expanded={open}
      onToggle={() => setOpen((o) => !o)}
    >
      <Container>
        <Navbar.Brand href="#top" className="crystal-client-nav__brand d-flex align-items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src={content.logo.src}
            alt={content.logo.alt}
            className="crystal-client-nav__brand-img"
            width={46}
            height={46}
            decoding="async"
          />
          <span className="crystal-client-nav__brand-text">{content.footer.brandTitle}</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="gym-client-nav" className="crystal-client-nav__toggle border-0 shadow-none" />
        <Navbar.Collapse id="gym-client-nav">
          <Nav className="ms-auto align-items-lg-center gap-lg-2 py-2 py-lg-0">
            {content.nav.items
              .filter(
                (item) =>
                  (showTrainers || item.id !== 'trainers') &&
                  (showDeals || item.id !== 'offers') &&
                  (showPackages || item.id !== 'pricing')
              )
              .map((item) => (
                <Nav.Link key={item.id} href={item.href} className="crystal-client-nav__link" onClick={() => setOpen(false)}>
                  {item.label}
                </Nav.Link>
              ))}
            {content.nav.ctaLabel && content.nav.ctaHref ?
              <a
                href={content.nav.ctaHref}
                className="btn crystal-client-nav__cta ms-lg-2"
                onClick={(e) => {
                  setOpen(false);
                  if (onOpenJoinLead && content.nav.ctaHref === '#contact') {
                    e.preventDefault();
                    onOpenJoinLead();
                  }
                }}
              >
                {content.nav.ctaLabel}
              </a>
            : null}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function GymClientFooter({
  content,
  showTrainers,
  showDeals,
  showPackages,
}: {
  content: GymClientSiteContent;
  showTrainers: boolean;
  showDeals: boolean;
  showPackages: boolean;
}) {
  return (
    <footer id="crystal-footer" className="crystal-client-footer">
      <Container>
        <Row className="align-items-center g-4 py-4">
          <Col md={4} className="text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
              <img
                src={content.logo.src}
                alt=""
                className="crystal-client-footer__icon"
                width={36}
                height={36}
                decoding="async"
              />
              <span className="crystal-client-footer__brand">{content.footer.brandTitle}</span>
            </div>
            <p className="crystal-client-footer__tagline small mb-0">{content.footer.tagline}</p>
          </Col>
          <Col md={4} className="text-center">
            <nav aria-label="Footer">
              <ul className="crystal-client-footer__links list-unstyled d-flex flex-wrap justify-content-center gap-3 mb-0 small">
                {content.footer.links
                  .filter(
                    (l) =>
                      (showTrainers || l.href !== '#trainers') &&
                      (showDeals || l.href !== '#deals') &&
                      (showPackages || l.href !== '#pricing')
                  )
                  .map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="crystal-client-footer__link">
                        {l.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </nav>
          </Col>
          <Col md={4} className="text-center text-md-end small">
            {content.footer.finePrint ? <p className="crystal-client-footer__fine-print mb-2 mb-md-1">{content.footer.finePrint}</p> : null}
            {getPublicGymSlugFromHost() ? (
              <a href={crystalMarketingAbsoluteUrl('/')} className="crystal-client-footer__crystal">
                ← Crystal home
              </a>
            ) : (
              <Link to="/" className="crystal-client-footer__crystal">
                ← Crystal home
              </Link>
            )}
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

function GymClientSiteView({
  content,
  businessSlug,
  themeCssVars,
  suppressPublicLeads = false,
}: {
  content: GymClientSiteContent;
  businessSlug: string;
  /** CSS variables for `--gym-client-*` (modals portal to `body` and need the same theme as the page). */
  themeCssVars: CSSProperties;
  /** True on `/preview` — no lead API or local lead stats; gym is not published. */
  suppressPublicLeads?: boolean;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [joinLeadModalOpen, setJoinLeadModalOpen] = useState(false);
  const [bookTrialModalOpen, setBookTrialModalOpen] = useState(false);
  const [planVisitModalOpen, setPlanVisitModalOpen] = useState(false);
  const openJoinLeadModal = () => setJoinLeadModalOpen(true);
  const openBookTrialModal = () => setBookTrialModalOpen(true);
  const openPlanVisitModal = () => setPlanVisitModalOpen(true);
  const joinLeadFromContactCta = Boolean(
    content.nav.ctaLabel && content.nav.ctaHref && content.nav.ctaHref === '#contact'
  );
  const bookTrialFromSecondary =
    Boolean(content.header.ctaSecondary) && headerSecondaryOpensBookTrial(content.header.ctaSecondary);

  useRevealOnScroll(shellRef);

  const [footerVisible, setFooterVisible] = useState(false);
  const [whatsappHintDismissed, setWhatsappHintDismissed] = useState(false);
  const [whatsappFabPeek, setWhatsappFabPeek] = useState(false);

  useEffect(() => {
    const footer = document.getElementById('crystal-footer');
    if (!footer) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e) setFooterVisible(e.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.scrollY + window.innerHeight * 0.85, behavior: 'smooth' });
  };
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dismissWhatsappFabHint = () => {
    setWhatsappHintDismissed(true);
  };

  const embedSrc = gymVideoUrlToEmbedSrc(content.video.url);
  const locationMapUrl = content.contacts.locationMapUrl?.trim();
  const visibleContacts = content.contacts.items.filter((c) => c.value.trim());
  const visibleDetails = content.details.rows.filter((r) => r.value.trim());
  const phoneContact = content.contacts.items.find((c) => c.id === 'phone' && c.value.trim());
  const whatsappHref = phoneContact
    ? buildGymClientWhatsAppHref(phoneContact.value, content.header.title)
    : null;

  const whatsappFabHintText = content.contacts.whatsappFabHint.trim();
  const showWhatsappFabHintBubble = Boolean(
    whatsappFabHintText && (!whatsappHintDismissed || whatsappFabPeek)
  );

  const trainersList = content.trainers.items.filter((t) => t.name.trim());
  const visibleDiscountOffers = content.discountOffers.offers.filter(isGymClientDiscountOfferFilled);
  const showDeals = visibleDiscountOffers.length > 0;
  const visiblePackages = content.packages.items.filter(isGymClientPackageItemFilled);
  const showPackages = visiblePackages.length > 0;

  const heroTaglineLine = content.header.taglineItems
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' • ');
  const heroSubtitleText = content.header.subtitle?.trim() ?? '';
  const heroAddress = content.contacts.items.find((c) => c.id === 'address' && c.value.trim())?.value.trim();
  const heroRating = getHeroRatingDisplayText(content.header);
  const showHeroInfoBar = Boolean(heroAddress || heroRating);
  const aboutFeatures = content.description.features;
  const showAboutFeatures = aboutFeatures.length > 0;
  const visitCtaHref = visibleDetails.length > 0 ? '#visit' : '#contact';
  const aboutBodyBackground = content.description.bodyBackground;
  const aboutBodyBgImageUrl = aboutBodyBackground?.imageUrl?.trim() ?? '';
  const aboutBodyBlend = aboutBodyBackground?.blendColor?.trim() ?? '#111827CC';
  const aboutBodyBgEnabled = Boolean(aboutBodyBackground?.enabled && aboutBodyBgImageUrl);
  const aboutBodyStyle = aboutBodyBgEnabled ?
    ({
      ['--gym-about-body-bg-image' as string]: `url(${aboutBodyBgImageUrl})`,
      ['--gym-about-body-bg-blend' as string]: aboutBodyBlend,
    } as CSSProperties)
  : undefined;

  const heroStyle = {
    '--gym-hero-bg': `url(${content.layout.heroBackgroundImage})`,
    '--gym-hero-overlay': String(content.layout.heroOverlay),
  } as CSSProperties;

  return (
    <div ref={shellRef} className="crystal-client-shell" id="top">
      <GymClientNavBar
        content={content}
        showTrainers={trainersList.length > 0}
        showDeals={showDeals}
        showPackages={showPackages}
        onOpenJoinLead={joinLeadFromContactCta ? openJoinLeadModal : undefined}
      />

      <header className="crystal-client__hero crystal-client__hero--bg" style={heroStyle}>
        <div className="crystal-client__hero-blob crystal-client__hero-blob--1" aria-hidden />
        <div className="crystal-client__hero-blob crystal-client__hero-blob--2" aria-hidden />
        <div className="crystal-client__hero-overlay" aria-hidden />
        <Container className="crystal-client__hero-container position-relative">
          <div className="crystal-client__hero-inner text-center text-lg-start">
            <p
              className="crystal-client__hero-prefix mb-0"
              data-reveal
              style={{ transitionDelay: '0.03s' } as CSSProperties}
            >
              {content.header.titlePrefix}
            </p>
            <h1
              className="crystal-client__hero-title mb-0"
              data-reveal
              style={{ transitionDelay: '0.1s' } as CSSProperties}
            >
              {content.header.title}
            </h1>
            {heroTaglineLine ? (
              <p
                className="crystal-client__hero-tagline mb-0"
                data-reveal
                style={{ transitionDelay: '0.18s' } as CSSProperties}
              >
                {heroTaglineLine}
              </p>
            ) : heroSubtitleText ? (
              <p
                className="crystal-client__hero-tagline mb-0"
                data-reveal
                style={{ transitionDelay: '0.18s' } as CSSProperties}
              >
                {heroSubtitleText}
              </p>
            ) : null}
            {heroTaglineLine && heroSubtitleText ? (
              <p
                className="crystal-client__hero-subtitle-para mb-0"
                data-reveal
                style={{ transitionDelay: '0.26s' } as CSSProperties}
              >
                {heroSubtitleText}
              </p>
            ) : null}
            <div
              className="crystal-client__hero-ctas mt-3"
              data-reveal
              style={{ transitionDelay: '0.34s' } as CSSProperties}
            >
              {content.nav.ctaLabel && content.nav.ctaHref ?
                joinLeadFromContactCta ?
                  <button type="button" className="btn crystal-client__hero-cta-primary" onClick={openJoinLeadModal}>
                    {content.nav.ctaLabel}
                  </button>
                : <a href={content.nav.ctaHref} className="btn crystal-client__hero-cta-primary">
                    {content.nav.ctaLabel}
                  </a>
              : null}
              {content.header.ctaSecondary ? (
                bookTrialFromSecondary ? (
                  <button type="button" className="btn crystal-client__hero-cta-secondary" onClick={openBookTrialModal}>
                    {content.header.ctaSecondary.label}
                  </button>
                ) : (
                  <a href={content.header.ctaSecondary.href} className="btn crystal-client__hero-cta-secondary">
                    {content.header.ctaSecondary.label}
                  </a>
                )
              ) : null}
            </div>
            {showHeroInfoBar ? (
              <div
                className="crystal-client__hero-infobar"
                data-reveal
                style={{ transitionDelay: '0.42s' } as CSSProperties}
              >
                {heroAddress ? (
                  <div className="crystal-client__hero-infobar-item crystal-client__hero-infobar-item--address">
                    <SvgHeroPin />
                    {locationMapUrl ?
                      <a
                        href={locationMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="crystal-client__hero-maps-link"
                      >
                        <span className="crystal-client__hero-maps-link-text">{heroAddress}</span>
                        <span className="visually-hidden">Open in Maps</span>
                      </a>
                    : <span>{heroAddress}</span>}
                  </div>
                ) : null}
                {heroAddress && heroRating ? <span className="crystal-client__hero-infobar-divider" aria-hidden /> : null}
                {heroRating ? (
                  <div className="crystal-client__hero-infobar-item">
                    <SvgHeroStar />
                    <span>{heroRating}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </Container>
      </header>

      <section className="crystal-client__section crystal-client__section--description" id="about" aria-labelledby="crystal-client-about">
        <Container>
          <div className="crystal-client__about-head text-center" data-reveal>
            <h2 id="crystal-client-about" className="crystal-client__about-title">
              <span className="crystal-client__about-title-line" aria-hidden />
              <span className="crystal-client__about-title-text">{content.description.sectionTitle}</span>
              <span className="crystal-client__about-title-line" aria-hidden />
            </h2>
            {content.description.lead ? (
              <p className="crystal-client__about-lead mb-0">
                {content.description.lead.before}
                <span className="crystal-client__about-lead-accent">{content.description.lead.accent}</span>
                {content.description.lead.after}
              </p>
            ) : null}
          </div>
          {showAboutFeatures ? (
            <Row className="g-4 justify-content-center mt-4 crystal-client__about-features">
              {aboutFeatures.map((feat, idx) => (
                <Col key={feat.id} xs={12} sm={6} lg={4}>
                  <div
                    className="crystal-client__about-feature"
                    data-reveal
                    style={{ transitionDelay: `${idx * 0.07}s` } as CSSProperties}
                  >
                    <div className="crystal-client__about-feature-icon-wrap">
                      <span className="crystal-client__about-feature-icon-circle">
                        <GymClientAboutFeatureGlyph icon={feat.icon} />
                      </span>
                    </div>
                    <div className="crystal-client__about-feature-body">
                      <h3 className="crystal-client__about-feature-title">{feat.title}</h3>
                      <p className="crystal-client__about-feature-sub">{feat.subtext}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : null}
          {content.description.body.trim() ? (
            <p
              className={`crystal-client__body mx-auto text-center ${showAboutFeatures ? 'crystal-client__body--after-features' : ''} ${aboutBodyBgEnabled ? 'crystal-client__body--blended' : ''}`}
              style={aboutBodyStyle}
              data-reveal
            >
              {content.description.body}
            </p>
          ) : null}
        </Container>
      </section>

      <GymClientMidCtaStrip
        businessSlug={businessSlug}
        variant="join"
        href="#contact"
        brandLogoSrc={content.logo.src}
        onJoinClick={openJoinLeadModal}
        suppressPublicLeads={suppressPublicLeads}
      />

      {trainersList.length > 0 ? (
        <section className="crystal-client__section crystal-client__section--trainers" id="trainers" aria-labelledby="crystal-client-trainers">
          <Container>
            <h2 id="crystal-client-trainers" className="crystal-client__section-title" data-reveal>
              {content.trainers.sectionTitle}
            </h2>
            {content.trainers.sectionSubtitle ? (
              <p className="crystal-client__section-lead text-muted" data-reveal>
                {content.trainers.sectionSubtitle}
              </p>
            ) : null}
            <Row className="g-4 justify-content-center mt-1">
              {trainersList.map((trainer, idx) => (
                <Col key={trainer.id} xs={12} sm={6} xl={4}>
                  <Card
                    className="crystal-client__trainer-card h-100 border-0 shadow-sm"
                    data-reveal
                    style={{ transitionDelay: `${idx * 0.06}s` } as CSSProperties}
                  >
                    <div className="crystal-client__trainer-photo-wrap">
                      {trainer.photoUrl ? (
                        <img
                          src={trainer.photoUrl}
                          alt=""
                          className="crystal-client__trainer-photo"
                          loading="lazy"
                          width={400}
                          height={400}
                        />
                      ) : (
                        <span className="crystal-client__trainer-placeholder" aria-hidden>
                          {(trainer.name.trim()[0] ?? '?').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Card.Body className="text-center p-4">
                      <Card.Title as="h3" className="h5 mb-1 crystal-client__trainer-name">
                        {trainer.name.trim()}
                      </Card.Title>
                      {trainer.role ? (
                        <p className="crystal-client__trainer-role small fw-semibold text-uppercase mb-2">{trainer.role}</p>
                      ) : null}
                      {trainer.shortBio ? (
                        <p className="crystal-client__trainer-bio small mb-0">{trainer.shortBio}</p>
                      ) : null}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      ) : null}

      {showDeals ?
        <section className="crystal-client__section crystal-client__section--deals" id="deals" aria-labelledby="crystal-client-deals">
          <Container>
            <div className="text-center mb-4" data-reveal>
              <h2 id="crystal-client-deals" className="crystal-client__section-title crystal-client__section-title--on-dark mb-2">
                {content.discountOffers.sectionTitle}
              </h2>
              {content.discountOffers.sectionSubtitle ?
                <p className="crystal-client__section-lead crystal-client__section-lead--on-dark mb-0">
                  {content.discountOffers.sectionSubtitle}
                </p>
              : null}
            </div>
            <Row className="g-4 justify-content-center">
              {visibleDiscountOffers.map((offer, idx) => (
                <Col key={offer.id} xs={12} md={6} lg={5}>
                  <div
                    className={`crystal-client__deal-card ${idx === 1 ? 'crystal-client__deal-card--alt' : ''}`}
                    data-reveal
                    style={{ transitionDelay: `${idx * 0.08}s` } as CSSProperties}
                  >
                    <div className="crystal-client__deal-card-glow" aria-hidden />
                    <GymClientPercentBadge value={offer.percentOff} />
                    <h3 className="crystal-client__deal-title">{offer.title}</h3>
                    {offer.subtitle ? <p className="crystal-client__deal-sub small text-white-50 mb-3">{offer.subtitle}</p> : null}
                    <div className="crystal-client__deal-prices">
                      <span className="crystal-client__deal-was">{offer.originalPriceLabel}</span>
                      <span className="crystal-client__deal-now">
                        {offer.salePriceLabel}
                        {offer.periodLabel ? <span className="crystal-client__deal-period">{offer.periodLabel}</span> : null}
                      </span>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      : null}

      {showPackages ? (
        <GymClientMidCtaStrip
          businessSlug={businessSlug}
          variant="membership"
          href="#pricing"
          brandLogoSrc={content.logo.src}
          suppressPublicLeads={suppressPublicLeads}
        />
      ) : null}

      {showPackages ? (
      <section className="crystal-client__section crystal-client__section--packages" id="pricing" aria-labelledby="crystal-client-packages">
        <Container>
          <h2 id="crystal-client-packages" className="crystal-client__section-title" data-reveal>
            {content.packages.sectionTitle}
          </h2>
          {content.packages.sectionSubtitle ? (
            <p className="crystal-client__section-lead text-muted" data-reveal>
              {content.packages.sectionSubtitle}
            </p>
          ) : null}
          <Row className="g-4 justify-content-center mt-1">
            {visiblePackages.map((pkg, idx) => (
              <Col key={pkg.id} xs={12} md={6} lg={4}>
                <Card
                  className={`crystal-client__package h-100 border-0 shadow-sm ${pkg.highlighted ? 'crystal-client__package--highlight' : ''}`}
                  data-reveal
                  style={{ transitionDelay: `${idx * 0.06}s` } as CSSProperties}
                >
                  {pkg.highlighted ? <div className="crystal-client__package-badge">Popular</div> : null}
                  {pkg.discountPercent != null && pkg.discountPercent > 0 ? (
                    <div className="crystal-client__package-pct">
                      <span className="crystal-client__package-pct-inner">{pkg.discountPercent}%</span>
                    </div>
                  ) : null}
                  <Card.Body className="d-flex flex-column text-center p-4">
                    <Card.Title className="h5 mb-3">{pkg.name}</Card.Title>
                    <div className="crystal-client__package-priceblock mb-3">
                      {pkg.originalPriceLabel ? (
                        <div className="crystal-client__package-original">{pkg.originalPriceLabel}</div>
                      ) : null}
                      <div>
                        <span className="crystal-client__package-price">{pkg.priceLabel}</span>
                        {pkg.periodLabel ? <span className="crystal-client__package-period text-muted small ms-1">{pkg.periodLabel}</span> : null}
                      </div>
                    </div>
                    <ul className="crystal-client__package-features list-unstyled small text-start mb-4 flex-grow-1">
                      {pkg.features.map((f) => (
                        <li key={f} className="mb-1">
                          ✓ {f}
                        </li>
                      ))}
                    </ul>
                    {pkg.ctaLabel ? (
                      <span className="crystal-client__package-cta small fw-bold text-uppercase">{pkg.ctaLabel}</span>
                    ) : null}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
      ) : null}

      <GymClientMidCtaStrip
        businessSlug={businessSlug}
        variant="visit"
        href={visitCtaHref}
        brandLogoSrc={content.logo.src}
        onVisitClick={openPlanVisitModal}
        suppressPublicLeads={suppressPublicLeads}
      />

      {embedSrc ? (
        <section className="crystal-client__section crystal-client__section--video" id="tour" aria-labelledby="crystal-client-video">
          <Container>
            <h2 id="crystal-client-video" className="crystal-client__section-title" data-reveal>
              {content.video.sectionTitle}
            </h2>
            {content.video.caption ? (
              <p className="crystal-client__section-lead text-muted" data-reveal>
                {content.video.caption}
              </p>
            ) : null}
            <div className="crystal-client__video-frame-wrap" data-reveal>
            <div className="crystal-client__video-frame">
              <iframe
                title={content.video.sectionTitle}
                src={embedSrc}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            </div>
          </Container>
        </section>
      ) : null}

      {(visibleDetails.length > 0 || visibleContacts.length > 0) && (
        <section className="crystal-client__section crystal-client__section--meta" aria-labelledby="crystal-client-meta">
          <Container className="crystal-client__meta-container">
            <Row className="crystal-client__meta-row g-4 g-lg-4 justify-content-center align-items-stretch">
              {visibleDetails.length > 0 ? (
                <Col xs={12} md={6} lg={6} id="visit" className="crystal-client__meta-col">
                  <div className="crystal-client__meta-panel">
                    <h2 id="crystal-client-meta" className="crystal-client__section-title crystal-client__section-title--meta" data-reveal>
                      {content.details.sectionTitle}
                    </h2>
                    <dl className="crystal-client__dl crystal-client__dl--meta-panel" data-reveal>
                      {visibleDetails.map((row) => (
                        <div key={row.id} className="crystal-client__dl-row">
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Col>
              ) : null}
              {visibleContacts.length > 0 ? (
                <Col
                  xs={12}
                  md={visibleDetails.length ? 6 : 12}
                  lg={visibleDetails.length ? 6 : 6}
                  id="contact"
                  className={
                    visibleDetails.length ? 'crystal-client__meta-col' : 'crystal-client__meta-col crystal-client__meta-col--single'
                  }
                >
                  <div className="crystal-client__meta-panel">
                    <h2
                      className="crystal-client__section-title crystal-client__section-title--meta"
                      data-reveal
                      id={visibleDetails.length ? 'crystal-client-contact-h' : 'crystal-client-meta'}
                    >
                      {content.contacts.sectionTitle}
                    </h2>
                    <ul className="crystal-client__contact-list list-unstyled mb-0" data-reveal>
                      {visibleContacts.map((item) => (
                        <li key={item.id} className="crystal-client__contact-item">
                          <span className="crystal-client__contact-label crystal-client__contact-label--meta small text-uppercase fw-bold d-block">
                            {item.label}
                          </span>
                          {item.id === 'phone' && whatsappHref ? (
                            <div className="crystal-client__phone-row">
                              <div className="crystal-client__phone-line">
                                {item.href ? (
                                  <a href={item.href} className="crystal-client__link crystal-client__phone-number">
                                    {item.value}
                                  </a>
                                ) : (
                                  <span className="crystal-client__contact-value crystal-client__phone-number">{item.value}</span>
                                )}
                                <a
                                  href={whatsappHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="crystal-client-whatsapp-btn"
                                  aria-label="Chat on WhatsApp about joining"
                                  onClick={() => {
                                    if (!suppressPublicLeads) recordGymClientWhatsAppClick(businessSlug, 'inline');
                                  }}
                                >
                                  <WhatsAppLogoIcon className="crystal-client-whatsapp-btn__icon" />
                                </a>
                              </div>
                            </div>
                          ) : item.id === 'address' && locationMapUrl ? (
                            <div className="crystal-client__address-with-maps">
                              <p className="crystal-client__contact-value crystal-client__address-text mb-0">{item.value}</p>
                              <a
                                href={locationMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="crystal-client__maps-link-btn crystal-client__maps-link-btn--labeled"
                                aria-label="Open location in Google Maps"
                              >
                                <GymClientMapsPinIcon className="crystal-client__maps-pin-icon" />
                                <span className="crystal-client__maps-link-btn-text">Directions</span>
                              </a>
                            </div>
                          ) : item.href ? (
                            <a href={item.href} className="crystal-client__link crystal-client__contact-line">
                              {item.value}
                            </a>
                          ) : (
                            <span className="crystal-client__contact-value crystal-client__contact-line">{item.value}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Col>
              ) : null}
            </Row>
          </Container>
        </section>
      )}

      <GymClientFooter
        content={content}
        showTrainers={trainersList.length > 0}
        showDeals={showDeals}
        showPackages={showPackages}
      />

      <GymClientJoinLeadModal
        show={joinLeadModalOpen}
        onHide={() => setJoinLeadModalOpen(false)}
        businessSlug={businessSlug}
        gymName={content.header.title}
        brandLogoSrc={content.logo.src}
        themeCssVars={themeCssVars}
        suppressPublicLeads={suppressPublicLeads}
      />

      <GymClientBookTrialModal
        show={bookTrialModalOpen}
        onHide={() => setBookTrialModalOpen(false)}
        businessSlug={businessSlug}
        gymName={content.header.title}
        brandLogoSrc={content.logo.src}
        themeCssVars={themeCssVars}
        suppressPublicLeads={suppressPublicLeads}
      />

      <GymClientPlanVisitModal
        show={planVisitModalOpen}
        onHide={() => setPlanVisitModalOpen(false)}
        businessSlug={businessSlug}
        gymName={content.header.title}
        brandLogoSrc={content.logo.src}
        visitSectionHref={visitCtaHref}
        themeCssVars={themeCssVars}
        suppressPublicLeads={suppressPublicLeads}
      />

      <div className="crystal-client-floating-stack">
        {whatsappHref ? (
          <div
            className="crystal-client-whatsapp-fab-wrap"
            onPointerEnter={() => setWhatsappFabPeek(true)}
            onPointerLeave={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && e.currentTarget.contains(next)) return;
              setWhatsappFabPeek(false);
            }}
            onFocus={() => setWhatsappFabPeek(true)}
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && e.currentTarget.contains(next)) return;
              setWhatsappFabPeek(false);
            }}
          >
            {showWhatsappFabHintBubble ? (
              <div className="crystal-client-whatsapp-fab-bubble-shell">
                <button
                  type="button"
                  className="crystal-client-whatsapp-fab-bubble-close"
                  aria-label="Dismiss message"
                  onClick={dismissWhatsappFabHint}
                >
                  <svg className="crystal-client-whatsapp-fab-bubble-close-svg" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      d="M8 8l8 8M16 8l-8 8"
                    />
                  </svg>
                </button>
                <p id="crystal-whatsapp-fab-hint" className="crystal-client-whatsapp-fab-bubble">
                  {whatsappFabHintText}
                </p>
              </div>
            ) : null}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="crystal-client-whatsapp-fab"
              aria-label="Chat on WhatsApp about joining"
              aria-describedby={showWhatsappFabHintBubble ? 'crystal-whatsapp-fab-hint' : undefined}
              onClick={() => {
                if (!suppressPublicLeads) recordGymClientWhatsAppClick(businessSlug, 'fab');
              }}
            >
              <WhatsAppLogoIcon className="crystal-client-whatsapp-fab__icon" />
            </a>
          </div>
        ) : null}
        <button
          type="button"
          className={`crystal-scroll-down-btn ${footerVisible ? 'crystal-scroll-down-btn--up' : ''}`}
          onClick={footerVisible ? scrollToTop : scrollDown}
          aria-label={footerVisible ? 'Scroll to top' : 'Scroll down'}
        >
          <svg
            className="crystal-scroll-down-btn__chevron"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function CrystalPreviewEmpty() {
  const onGymSubdomain = Boolean(getPublicGymSlugFromHost());
  return (
    <PageContainer className="crystal-business-page crystal-business-page--preview-empty">
      <main className="crystal-business-page__main">
        <div className="crystal-business-page__content">
          <h1 className="crystal-business-page__heading">No preview yet</h1>
          <p className="crystal-business-page__lead">
            Use <strong>Preview site</strong> on the setup form (it saves your draft to this browser so the preview tab can load
            it). Typing the URL alone, or an old tab opened before you clicked Preview, will show this screen.
          </p>
          {onGymSubdomain ? (
            <a
              href={crystalMarketingAbsoluteUrl('/user/create-website')}
              className="btn btn-primary mt-4 crystal-business-page__back"
            >
              Create website
            </a>
          ) : (
            <Link to="/user/create-website" className="btn btn-primary mt-4 crystal-business-page__back">
              Create website
            </Link>
          )}
          {onGymSubdomain ? (
            <a href={crystalMarketingAbsoluteUrl('/')} className="btn btn-link mt-2 d-block">
              Crystal home
            </a>
          ) : (
            <Link to="/" className="btn btn-link mt-2 d-block">
              Crystal home
            </Link>
          )}
        </div>
      </main>
    </PageContainer>
  );
}

function CrystalBusinessNotFound({ slug }: { slug: string }) {
  const urlLabel = publicGymSiteUrl(slug);
  const onGymSubdomain = Boolean(getPublicGymSlugFromHost());
  return (
    <PageContainer className="crystal-business-page crystal-business-page--not-found">
      <main className="crystal-business-page__main">
        <div className="crystal-business-page__content">
          <h1 className="crystal-business-page__heading">Page not found</h1>
          <p className="crystal-business-page__lead">
            No business exists for{' '}
            <code className="crystal-business-page__slug-code">{publicSiteDomain ? urlLabel : `/${slug}`}</code>.
          </p>
          {onGymSubdomain ? (
            <a href={crystalMarketingAbsoluteUrl('/')} className="btn btn-primary mt-4 crystal-business-page__back">
              Back to Crystal home
            </a>
          ) : (
            <Link to="/" className="btn btn-primary mt-4 crystal-business-page__back">
              Back to Crystal home
            </Link>
          )}
        </div>
      </main>
    </PageContainer>
  );
}

export default function CrystalBusinessPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const hostSlug = getPublicGymSlugFromHost();
  const slug = (hostSlug ?? routeSlug) ?? '';
  const [searchParams] = useSearchParams();
  const isMarketingPreview = slug === 'preview' && searchParams.get('from') === 'marketing';
  const [business, setBusiness] = useState<PublicBusinessDetail | null>(() => {
    if (!slug || slug === 'preview') return null;
    return peekPublicGymBundle(slug)?.business ?? null;
  });
  const [loading, setLoading] = useState(() => {
    if (!slug || slug === 'preview') return false;
    return peekPublicGymBundle(slug) === null;
  });
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [subscriptionInactive, setSubscriptionInactive] = useState(() => {
    if (!slug || slug === 'preview') return false;
    const hit = peekPublicGymBundle(slug);
    return hit ? !hit.subscription.has_active_subscription : false;
  });
  /** Bumped when another tab writes the preview draft so we re-read localStorage. */
  const [previewStorageRev, setPreviewStorageRev] = useState(0);

  const previewDraft = useMemo(() => {
    if (slug !== 'preview' || isMarketingPreview) return null;
    return readCrystalWebsitePreviewFromStorage();
  }, [slug, isMarketingPreview, previewStorageRev]);

  const marketingDemoContent = useMemo(
    () => (isMarketingPreview ? cloneGymClientSiteDefaults() : null),
    [isMarketingPreview]
  );

  const siteContentFromBusiness = useMemo(
    () => (business ? resolveGymClientSiteContent(business) : null),
    [business]
  );

  const siteContent = useMemo(() => {
    if (slug !== 'preview') return siteContentFromBusiness;
    if (isMarketingPreview && marketingDemoContent) return marketingDemoContent;
    if (previewDraft?.content) return previewDraft.content;
    return null;
  }, [slug, isMarketingPreview, marketingDemoContent, previewDraft, siteContentFromBusiness]);

  /** Same tokens on viewport + portaled modals (navbar, hero, modal header gradient, etc.). */
  const resolvedGymClientTheme = useMemo(() => {
    if (slug === 'preview' && isMarketingPreview) {
      return { ...MARKETING_PREVIEW_THEME };
    }
    if (slug === 'preview' && previewDraft) {
      return {
        accentHex: previewDraft.theme.accentHex?.trim() || CLIENT_THEME_FALLBACK.accentHex,
        darkHex: previewDraft.theme.darkHex?.trim() || CLIENT_THEME_FALLBACK.darkHex,
        textHex: previewDraft.theme.textHex?.trim() || GYM_CLIENT_DEFAULT_TEXT_HEX,
        lightHex: previewDraft.theme.lightHex?.trim() || CLIENT_THEME_FALLBACK.lightHex,
      };
    }
    const fromApi = business ? parseWebsiteThemeFromApi(business.website_theme) : {};
    return {
      accentHex: fromApi.accentHex ?? CLIENT_THEME_FALLBACK.accentHex,
      darkHex: fromApi.darkHex ?? CLIENT_THEME_FALLBACK.darkHex,
      textHex: fromApi.textHex ?? CLIENT_THEME_FALLBACK.textHex,
      lightHex: fromApi.lightHex ?? CLIENT_THEME_FALLBACK.lightHex,
    };
  }, [slug, isMarketingPreview, previewDraft, business]);

  const clientThemeCssVars = useMemo(
    () => gymClientThemeToCssVars(resolvedGymClientTheme),
    [resolvedGymClientTheme]
  );

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setBusiness(null);
      setNotFound(false);
      setSubscriptionInactive(false);
      setError(null);
      return;
    }
    if (slug === 'preview') {
      setLoading(false);
      setBusiness(null);
      setNotFound(false);
      setSubscriptionInactive(false);
      setError(null);
      return;
    }
    setError(null);
    setNotFound(false);
    const hit = peekPublicGymBundle(slug);
    if (hit) {
      setBusiness(hit.business);
      setSubscriptionInactive(!hit.subscription.has_active_subscription);
      setLoading(false);
    } else {
      setLoading(true);
      setBusiness(null);
      setSubscriptionInactive(false);
    }

    let cancelled = false;
    fetchPublicGymBundle(slug)
      .then((bundle) => {
        if (cancelled) return;
        setBusiness(bundle.business);
        setSubscriptionInactive(!bundle.subscription.has_active_subscription);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof PublicBusinessNotFoundError) {
          invalidatePublicGymBundleCache(slug);
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (slug !== 'preview') return;
    const bump = () => setPreviewStorageRev((n) => n + 1);
    const onStorage = (e: StorageEvent) => {
      if (e.key != null && e.key !== CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY) return;
      bump();
    };
    window.addEventListener('storage', onStorage);
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(CRYSTAL_WEBSITE_PREVIEW_BROADCAST_CHANNEL);
        bc.onmessage = () => bump();
      } catch {
        bc = null;
      }
    }
    return () => {
      window.removeEventListener('storage', onStorage);
      bc?.close();
    };
  }, [slug]);

  if (slug === 'preview' && !siteContent) {
    return <CrystalPreviewEmpty />;
  }

  if (slug && slug !== 'preview' && !loading && notFound) {
    return <CrystalBusinessNotFound slug={slug} />;
  }

  if (slug && slug !== 'preview' && !loading && !error && subscriptionInactive) {
    return <CrystalServiceUnavailable slug={slug} businessName={business?.name} />;
  }

  return (
    <PageContainer className="crystal-business-page crystal-business-page--client">
      <main className="crystal-business-page__main crystal-business-page__main--flush">
        <div className="crystal-business-page__content crystal-business-page__content--wide">
          {!slug ? (
            <div className="crystal-business-page__fallback">
              <p className="crystal-business-page__lead">No business selected.</p>
            </div>
          ) : loading ? (
            <div className="crystal-client-viewport crystal-client-viewport--loading" style={clientThemeCssVars}>
              <GymLoadingScreen active variant="embed" message="Loading your gym…" />
            </div>
          ) : error ? (
            <div className="crystal-business-page__fallback">
              {business && siteContent ? (
                <div className="mb-4">
                  <h1 className="crystal-business-page__heading">{siteContent.header.title}</h1>
                  <p className="crystal-business-page__slug text-muted small mb-0">/{business.slug}</p>
                </div>
              ) : null}
              <p className="crystal-business-page__error text-danger mb-0">{error}</p>
            </div>
          ) : siteContent ? (
            <>
              {slug === 'preview' && isMarketingPreview ? (
                <div
                  className="crystal-preview-banner crystal-preview-banner--marketing"
                  role="status"
                >
                  <span className="crystal-preview-banner__marketing-copy">
                    Sample site — colors, text, and layout are fully customizable.
                  </span>
                  {getAccessToken() ?
                    <Link to="/user/create-website" className="btn btn-sm btn-light fw-semibold">
                      Create now
                    </Link>
                  : <Link
                      to="/login"
                      state={{
                        from: { pathname: '/preview', search: '?from=marketing' },
                      }}
                      className="btn btn-sm btn-light fw-semibold"
                    >
                      Log in to create yours
                    </Link>
                  }
                </div>
              ) : slug === 'preview' ?
                <div className="crystal-preview-banner" role="status">
                  <span>Preview — not published</span>
                  <Link
                    to="/user/create-website"
                    replace
                    state={{ fromPreview: true }}
                    className="crystal-preview-banner__link"
                  >
                    Edit setup
                  </Link>
                </div>
              : null}
              <div className="crystal-client-viewport" style={clientThemeCssVars}>
                <GymClientSiteView
                  content={siteContent}
                  businessSlug={
                    slug === 'preview' ?
                      isMarketingPreview ? 'demo'
                      : (previewDraft?.slug ?? 'preview')
                    : (slug ?? '')
                  }
                  themeCssVars={clientThemeCssVars}
                  suppressPublicLeads={slug === 'preview'}
                />
              </div>
            </>
          ) : null}
        </div>
      </main>
    </PageContainer>
  );
}
