'use client';

import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type FormEvent,
  type RefObject,
  type CSSProperties,
} from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button, Container, Row, Col, Card, Form, Modal, Navbar, Nav } from 'react-bootstrap';
import { PageContainer, WhatsAppLogoIcon } from '../../components';
import { CrystalClientIntroOverlay } from './CrystalClientIntroOverlay';
import { CrystalClientLogoLoader } from './CrystalClientLogoLoader';
import { CrystalClientPageSkeleton } from './CrystalClientPageSkeleton';
import {
  fetchPublicGymBundle,
  getAccessToken,
  getActiveSubscription,
  getBusinessDetail,
  invalidatePublicGymBundleCache,
  listBusinessImages,
  peekPublicGymBundle,
  PublicBusinessNotFoundError,
  resolveBusinessImageDisplayUrl,
} from '../../api';
import type {
  ActiveSubscriptionPlanTier,
  ActiveSubscriptionResponse,
  BusinessUploadedImage,
  PublicBusinessDetail,
} from '../../api';
import CrystalServiceUnavailable from './CrystalServiceUnavailable';
import GymClientBookTrialModal from './GymClientBookTrialModal';
import GymClientPlanVisitModal from './GymClientPlanVisitModal';
import {
  applyPublicWebsiteContentOverlay,
  cloneGymClientSiteDefaults,
  type GymClientVisualBuilderState,
  parseGymClientWebsiteThemeFromApi,
  resolveGymClientSiteContent,
  getHeroRatingDisplayText,
  gymVideoUrlToEmbedSrc,
  isGymClientDiscountOfferFilled,
  isGymClientPackageItemFilled,
  withLegacyHeroBackgroundMigrated,
  type GymClientAboutFeature,
  type GymClientSiteContent,
  type GymClientWebsiteParsedTheme,
  type ProWebsiteTemplateKey,
} from './gymClientSiteContent';
import { apiBaseUrl, crystalMarketingAbsoluteUrl, getPublicGymSlugFromHost, serviceEnquiryPath } from '../../config/env';
import { PLANS_PAGE_PATH } from '../plans/PlansPage';
import {
  CRYSTAL_WEBSITE_PREVIEW_BROADCAST_CHANNEL,
  STORAGE_ACCESS_TOKEN,
  sessionCrystalClientIntroKey,
} from '../../config/storageKeys';
import {
  CRYSTAL_WEBSITE_PREVIEW_STORAGE_KEY,
  GYM_CLIENT_DEFAULT_TEXT_HEX,
  readCrystalWebsitePreviewFromStorage,
} from '../website/setup/createWebsiteFormState';
import { withBundledDefaultClientLogo } from './gymClientBrandLogo';
import { buildGymClientWhatsAppHref, buildGymClientWhatsAppHrefWithCustomText } from './gymClientWhatsApp';
import { recordGymClientLeadCta, recordGymClientWhatsAppClick } from './gymClientLeadTracking';
import GymClientJoinLeadModal from './GymClientJoinLeadModal';
import { GymClientMetaRowDisk, GymClientMidCtaIcon } from './GymClientDecorIcons';
import { normalizeHexColor } from '../../utils/hexColor';
import { clampPhoneDigitsInput } from '../../utils/phoneDigits';
import {
  WEBSITE_BUILDER_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS,
  WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS,
} from '../website/websiteBuilderConstants';
import './CrystalBusinessPage.css';

const PRO_TEMPLATE_PUBLIC_PATHS: Record<ProWebsiteTemplateKey, string> = {
  autopilot: '/templates/client-autopilot',
  fitcore: '/templates/client-fitcore',
  sonicflow: '/templates/client-sonicflow',
  vital: '/templates/client-vital',
  sole: '/templates/client-sole',
  zen: '/templates/client-zen',
  'grapes-welcome': '/templates/client-grapes-welcome',
  'grapes-hello': '/templates/client-grapes-hello',
  'grapes-cli': '/templates/client-grapes-cli',
};

function appendMailtoSubjectBody(mailtoHref: string, subject: string, body: string): string {
  try {
    const u = new URL(mailtoHref);
    if (u.protocol !== 'mailto:') return mailtoHref;
    u.searchParams.set('subject', subject);
    u.searchParams.set('body', body);
    return u.toString();
  } catch {
    return mailtoHref;
  }
}

function gymClientFooterEmailLooksValid(email: string): boolean {
  const t = email.trim();
  if (t.length < 5) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function GymClientFooterEnquiryForm({
  gymName,
  emailMailtoHref,
  phoneDisplayForWa,
  hasWhatsappLink,
}: {
  gymName: string;
  emailMailtoHref: string | null;
  phoneDisplayForWa: string | null;
  hasWhatsappLink: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState<'idle' | 'sent' | 'blocked'>('idle');

  const digits = clampPhoneDigitsInput(phone);
  const phoneOk = digits.length === 10;
  const emailOk = gymClientFooterEmailLooksValid(email);
  const contactOk = emailOk || phoneOk;
  const canRoute = Boolean(emailMailtoHref || (hasWhatsappLink && phoneDisplayForWa));
  const canSubmit =
    canRoute &&
    name.trim().length >= 2 &&
    message.trim().length >= 4 &&
    contactOk;

  const buildBody = () => {
    const lines = [`Name: ${name.trim()}`];
    if (emailOk) lines.push(`Email: ${email.trim()}`);
    if (phoneOk) lines.push(`Phone: ${digits}`);
    lines.push('');
    lines.push(message.trim());
    return lines.join('\n');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const body = buildBody();
    const subject = `Website enquiry · ${gymName.trim() || 'Gym'}`;
    if (emailMailtoHref) {
      window.location.href = appendMailtoSubjectBody(emailMailtoHref, subject, body);
      setNotice('sent');
      return;
    }
    const wa =
      phoneDisplayForWa ? buildGymClientWhatsAppHrefWithCustomText(phoneDisplayForWa, body) : null;
    if (wa) {
      window.open(wa, '_blank', 'noopener,noreferrer');
      setNotice('sent');
      return;
    }
    setNotice('blocked');
  };

  return (
    <div className="crystal-client-footer__enquiry">
      <h3 className="crystal-client-footer__enquiry-title">Enquiry</h3>
      {!canRoute ?
        <p className="crystal-client-footer__enquiry-hint mb-0">
          Add a contact email (mailto) or phone number in your site settings so visitors can send an enquiry from here.
        </p>
      : (
        <Form className="crystal-client-footer__enquiry-form" onSubmit={handleSubmit}>
          <Form.Group className="mb-2" controlId="footer-enquiry-name">
            <Form.Label className="crystal-client-footer__enquiry-label">Name</Form.Label>
            <Form.Control
              className="crystal-client-footer__enquiry-input"
              placeholder="Your name"
              autoComplete="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              maxLength={80}
            />
          </Form.Group>
          <Row className="g-2 mb-2">
            <Col xs={12} sm={6}>
              <Form.Group controlId="footer-enquiry-email">
                <Form.Label className="crystal-client-footer__enquiry-label">Email</Form.Label>
                <Form.Control
                  type="email"
                  className="crystal-client-footer__enquiry-input"
                  placeholder="Email address"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  maxLength={120}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6}>
              <Form.Group controlId="footer-enquiry-phone">
                <Form.Label className="crystal-client-footer__enquiry-label">Phone</Form.Label>
                <Form.Control
                  type="tel"
                  inputMode="numeric"
                  className="crystal-client-footer__enquiry-input"
                  placeholder="10-digit mobile"
                  autoComplete="tel"
                  value={phone}
                  onChange={(ev) => setPhone(clampPhoneDigitsInput(ev.target.value))}
                  maxLength={10}
                />
              </Form.Group>
            </Col>
          </Row>
          <p className="crystal-client-footer__enquiry-rule small mb-2">
            Enter a valid email or a 10-digit phone number — at least one is required.
          </p>
          <Form.Group className="mb-3" controlId="footer-enquiry-message">
            <Form.Label className="crystal-client-footer__enquiry-label">Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              className="crystal-client-footer__enquiry-input crystal-client-footer__enquiry-textarea"
              placeholder="Your message"
              value={message}
              onChange={(ev) => setMessage(ev.target.value)}
              maxLength={2000}
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="crystal-client-footer__enquiry-submit" disabled={!canSubmit}>
            Send enquiry
          </Button>
          {notice === 'sent' ?
            <p className="crystal-client-footer__enquiry-sent small mb-0 mt-2" role="status">
              If nothing opened, check your email app or try the contact section above.
            </p>
          : notice === 'blocked' ?
            <p className="crystal-client-footer__enquiry-error small mb-0 mt-2" role="alert">
              Could not open email or WhatsApp. Use the contact details on this page.
            </p>
          : null}
        </Form>
      )}
    </div>
  );
}

/** Default theme for the marketing demo at `/preview?from=marketing` (matches website builder defaults). */
const MARKETING_PREVIEW_THEME: GymClientWebsiteParsedTheme = {
  accentHex: '#ea580c',
  darkHex: '#0c0a09',
  textHex: GYM_CLIENT_DEFAULT_TEXT_HEX,
  lightHex: '#ffffff',
};

/** Fallback when no draft / API theme (matches `.crystal-client-viewport` CSS defaults). */
const CLIENT_THEME_FALLBACK: GymClientWebsiteParsedTheme = {
  accentHex: '#ea580c',
  darkHex: '#0c0a09',
  textHex: GYM_CLIENT_DEFAULT_TEXT_HEX,
  lightHex: '#ffffff',
};

function gymClientThemeToCssVars(theme: GymClientWebsiteParsedTheme): CSSProperties {
  const vars: CSSProperties = {
    ['--gym-client-accent' as string]: theme.accentHex,
    ['--gym-client-dark' as string]: theme.darkHex,
    ['--gym-client-text' as string]: theme.textHex,
    ['--gym-client-light' as string]: theme.lightHex,
  };
  if (theme.aboutSectionBg) (vars as Record<string, string>)['--gym-section-about-bg'] = theme.aboutSectionBg;
  if (theme.aboutFeatureCardBg) (vars as Record<string, string>)['--gym-section-about-feature-card-bg'] = theme.aboutFeatureCardBg;
  if (theme.packagesSectionBg) (vars as Record<string, string>)['--gym-section-packages-bg'] = theme.packagesSectionBg;
  if (theme.packageCardBg) (vars as Record<string, string>)['--gym-section-package-card-bg'] = theme.packageCardBg;
  if (theme.metaSectionBg) (vars as Record<string, string>)['--gym-section-meta-bg'] = theme.metaSectionBg;
  if (theme.metaPanelBg) (vars as Record<string, string>)['--gym-section-meta-panel-bg'] = theme.metaPanelBg;
  if (theme.metaRowBg) (vars as Record<string, string>)['--gym-section-meta-row-bg'] = theme.metaRowBg;
  return vars;
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

/** Insert a word space between inline fragments when neither side already has boundary whitespace (avoids “membersget”). */
function joinLeadNeedsSpace(left: string, right: string): boolean {
  if (!left.trim() || !right.trim()) return false;
  return !/\s$/.test(left) && !/^\s/.test(right);
}

function GymClientAboutLeadInline({ lead }: { lead: { before: string; accent: string; after: string } }) {
  const before = lead.before ?? '';
  const accent = lead.accent ?? '';
  const after = lead.after ?? '';
  const anchorBeforeAfter = accent.trim() ? accent : before;
  return (
    <>
      {before}
      {accent.trim() ?
        <>
          {joinLeadNeedsSpace(before, accent) ? ' ' : null}
          <span className="crystal-client__about-lead-accent">{accent}</span>
        </>
      : null}
      {after ?
        <>
          {joinLeadNeedsSpace(anchorBeforeAfter, after) ? ' ' : null}
          {after}
        </>
      : null}
    </>
  );
}

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
  enquiry,
}: {
  content: GymClientSiteContent;
  showTrainers: boolean;
  showDeals: boolean;
  showPackages: boolean;
  enquiry: {
    gymName: string;
    emailMailtoHref: string | null;
    phoneDisplayForWa: string | null;
    hasWhatsappLink: boolean;
  };
}) {
  return (
    <footer id="crystal-footer" className="crystal-client-footer">
      <Container>
        <div className="crystal-client-footer__top py-4">
          <div className="crystal-client-footer__enquiry-aside text-center text-md-start">
            <GymClientFooterEnquiryForm
              gymName={enquiry.gymName}
              emailMailtoHref={enquiry.emailMailtoHref}
              phoneDisplayForWa={enquiry.phoneDisplayForWa}
              hasWhatsappLink={enquiry.hasWhatsappLink}
            />
          </div>
          <div className="crystal-client-footer__brand-stack text-center text-md-start">
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
          </div>
          <nav className="crystal-client-footer__trail-nav small" aria-label="Footer">
            <ul className="crystal-client-footer__links crystal-client-footer__links--footer-nav-grid list-unstyled mb-0 small">
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
          <div className="crystal-client-footer__trail-meta small">
            {content.footer.finePrint ? (
              <p className="crystal-client-footer__fine-print crystal-client-footer__trail-line mb-0">{content.footer.finePrint}</p>
            ) : null}
            {getPublicGymSlugFromHost() ? (
              <a
                href={crystalMarketingAbsoluteUrl('/')}
                className="crystal-client-footer__crystal crystal-client-footer__trail-line d-inline-block"
              >
                ← Crystal home
              </a>
            ) : (
              <Link href="/" className="crystal-client-footer__crystal crystal-client-footer__trail-line d-inline-block">
                ← Crystal home
              </Link>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}

/** Root-relative or dev-server image paths resolve against the current page origin (important for `/preview`). */
function resolveSiteBackgroundImageUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return u;
  if (typeof window === 'undefined') return u;
  if (u.startsWith('data:') || /^https?:\/\//i.test(u)) return u;
  try {
    return new URL(u, window.location.origin).href;
  } catch {
    return u;
  }
}

/** Gallery `<img src>` on `/preview` — supports blob/data/https and root-relative paths. */
function resolvePreviewGalleryImageUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return u;
  if (typeof window === 'undefined') return u;
  if (u.startsWith('blob:') || u.startsWith('data:') || /^https?:\/\//i.test(u)) return u;
  try {
    return new URL(u, window.location.origin).href;
  } catch {
    return u;
  }
}

type VisualBuilderPublicPage = {
  id: string;
  name: string;
  slug: string;
  html: string;
  css: string;
};

function slugifyVisualPage(raw: string, fallback: string): string {
  const t = raw.trim().toLowerCase();
  const slug = t
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return slug || fallback;
}

function normalizeVisualBuilderPages(vb: GymClientVisualBuilderState | undefined): VisualBuilderPublicPage[] {
  if (!vb) return [];
  const pages = vb.pageSnapshots;
  if (Array.isArray(pages) && pages.length > 0) {
    const out: VisualBuilderPublicPage[] = [];
    for (let i = 0; i < pages.length; i += 1) {
      const p = pages[i];
      if (!p || typeof p !== 'object') continue;
      const id = String(p.id ?? `page-${i + 1}`).trim() || `page-${i + 1}`;
      const nameRaw = String(p.name ?? '').trim();
      const name = nameRaw || `Page ${i + 1}`;
      const html = String(p.html ?? '');
      const css = String(p.css ?? '');
      const fallbackSlug = i === 0 ? 'home' : `page-${i + 1}`;
      out.push({
        id,
        name,
        html,
        css,
        slug: slugifyVisualPage(String(p.slug ?? name), fallbackSlug),
      });
    }
    if (out.length > 0) return out;
  }
  if (vb.htmlSnapshot?.trim()) {
    return [
      {
        id: 'home',
        name: 'Home',
        slug: 'home',
        html: vb.htmlSnapshot,
        css: vb.cssSnapshot ?? '',
      },
    ];
  }
  return [];
}

function pickVisualBuilderPage(pages: VisualBuilderPublicPage[], requestSlug: string): VisualBuilderPublicPage | null {
  if (!pages.length) return null;
  if (!requestSlug) return pages[0];
  const wanted = requestSlug.trim().toLowerCase();
  const exact = pages.find((p) => p.slug === wanted);
  if (exact) return exact;
  const byName = pages.find((p) => slugifyVisualPage(p.name, p.slug) === wanted);
  if (byName) return byName;
  return pages[0];
}

function GymClientSiteView({
  content,
  businessSlug,
  themeCssVars,
  suppressPublicLeads = false,
  galleryStrip,
}: {
  content: GymClientSiteContent;
  businessSlug: string;
  /** CSS variables for `--gym-client-*` (modals portal to `body` and need the same theme as the page). */
  themeCssVars: CSSProperties;
  /** True on `/preview` — no lead API or local lead stats; gym is not published. */
  suppressPublicLeads?: boolean;
  /** Live site: from GET `/businesses/<slug>/images/` (hidden for trial). Preview: from draft `gallery.imageOrder`. */
  galleryStrip?: { url: string; caption?: string }[];
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [joinLeadModalOpen, setJoinLeadModalOpen] = useState(false);
  const [bookTrialModalOpen, setBookTrialModalOpen] = useState(false);
  const [planVisitModalOpen, setPlanVisitModalOpen] = useState(false);
  /** `null` = closed; index into `galleryStrip` for lightbox. */
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState<number | null>(null);
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

  useEffect(() => {
    if (galleryLightboxIndex === null || !galleryStrip?.length) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setGalleryLightboxIndex((i) =>
          i === null || !galleryStrip.length ? null : (i + 1) % galleryStrip.length
        );
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setGalleryLightboxIndex((i) =>
          i === null || !galleryStrip.length ? null : (i - 1 + galleryStrip.length) % galleryStrip.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [galleryLightboxIndex, galleryStrip]);

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
  const emailMailtoHref =
    content.contacts.items.find((c) => c.id === 'email' && c.href?.trim().toLowerCase().startsWith('mailto:'))?.href ??
    null;

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
  const aboutBodyBgImageUrl = resolveSiteBackgroundImageUrl(aboutBodyBackground?.imageUrl?.trim() ?? '');
  const aboutBodyBlend = aboutBodyBackground?.blendColor?.trim() ?? '#111827CC';
  const aboutBodyBgEnabled = Boolean(aboutBodyBackground?.enabled && aboutBodyBgImageUrl);
  const aboutBodyStyle = aboutBodyBgEnabled ?
    ({
      ['--gym-about-body-bg-image' as string]: `url(${JSON.stringify(aboutBodyBgImageUrl)})`,
      ['--gym-about-body-bg-blend' as string]: aboutBodyBlend,
    } as CSSProperties)
  : undefined;

  const rawHeroBg = (content.layout.heroBackgroundImage ?? '').trim();
  const resolvedHeroBg = rawHeroBg ? resolveSiteBackgroundImageUrl(rawHeroBg) : '';
  const heroOverlayRaw = Number(content.layout.heroOverlay);
  const heroOverlayAlpha =
    Number.isFinite(heroOverlayRaw) ? Math.min(1, Math.max(0, heroOverlayRaw)) : 0.55;
  const heroStyle = {
    '--gym-hero-bg': resolvedHeroBg ? `url(${JSON.stringify(resolvedHeroBg)})` : 'none',
    '--gym-hero-overlay-alpha': String(heroOverlayAlpha),
  } as CSSProperties;

  const heroTextResolved = normalizeHexColor(content.layout.heroTextColor?.trim() ?? '');
  const heroInnerTextStyle = heroTextResolved ?
    ({ ['--gym-hero-text' as string]: heroTextResolved } as CSSProperties)
  : undefined;

  /** Edge glow blobs use accent color; hide them when overlay is off so the photo stays clean at the sides. */
  const showHeroAccentBlobs = heroOverlayAlpha > 0.001;

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
        {showHeroAccentBlobs ? (
          <>
            <div className="crystal-client__hero-blob crystal-client__hero-blob--1" aria-hidden />
            <div className="crystal-client__hero-blob crystal-client__hero-blob--2" aria-hidden />
          </>
        ) : null}
        <div className="crystal-client__hero-overlay" aria-hidden />
        <Container className="crystal-client__hero-container position-relative">
          <div className="crystal-client__hero-inner text-center text-lg-start" style={heroInnerTextStyle}>
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
                <GymClientAboutLeadInline lead={content.description.lead} />
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

      {galleryStrip && galleryStrip.length > 0 ? (
        <section
          className="crystal-client__section crystal-client__section--gallery"
          id="gallery"
          aria-labelledby="crystal-client-gallery"
        >
          <Container fluid className="px-0">
            <h2 id="crystal-client-gallery" className="crystal-client__section-title text-center px-3 mb-3" data-reveal>
              {content.gallery?.sectionTitle?.trim() || 'Gallery'}
            </h2>
            <p className="crystal-client__gallery-hint small text-muted text-center px-3 mb-3 mb-md-2" data-reveal>
              {galleryStrip.length <= 1 ?
                'Tap the photo to enlarge'
              : 'Swipe or scroll sideways to browse · tap a photo to enlarge'}
            </p>
            <div
              className={`crystal-client__gallery-scroller px-3 crystal-client__gallery-layout--${
                galleryStrip.length <= 1 ? 'one' : galleryStrip.length === 2 ? 'two' : galleryStrip.length === 3 ? 'three' : 'many'
              }`}
              data-reveal
            >
              <div className="crystal-client__gallery-track">
                {galleryStrip.map((item, idx) => (
                  <figure key={`${item.url}-${idx}`} className="crystal-client__gallery-card">
                    <button
                      type="button"
                      className="crystal-client__gallery-thumb-btn"
                      onClick={() => setGalleryLightboxIndex(idx)}
                      aria-haspopup="dialog"
                      aria-label={
                        item.caption?.trim() ? `Enlarge photo: ${item.caption.trim()}` : `Enlarge photo ${idx + 1} of ${galleryStrip.length}`
                      }
                    >
                      <span className="crystal-client__gallery-card-img-wrap">
                        <img
                          src={item.url}
                          alt=""
                          className="crystal-client__gallery-card-img"
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="crystal-client__gallery-expand-hint" aria-hidden>
                          <svg className="crystal-client__gallery-expand-icon" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                    </button>
                    {item.caption?.trim() ?
                      <figcaption className="crystal-client__gallery-card-caption small text-muted mt-2 mb-0 px-1">
                        {item.caption.trim()}
                      </figcaption>
                    : null}
                  </figure>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

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
        <section
          className="crystal-client__section crystal-client__section--meta"
          aria-labelledby="crystal-client-meta-section"
        >
          <Container className="crystal-client__meta-container">
            <header className="crystal-client__meta-section-header">
              <h2 id="crystal-client-meta-section" className="crystal-client__meta-section-title" data-reveal>
                {(content.metaSectionHeading ?? '').trim() || 'Contact Us'}
              </h2>
            </header>
            <Row className="crystal-client__meta-row g-3 g-lg-3 justify-content-center align-items-stretch">
              {visibleDetails.length > 0 ? (
                <Col xs={12} md={6} lg={6} id="visit" className="crystal-client__meta-col">
                  <div className="crystal-client__meta-panel">
                    <h2 id="crystal-client-visit-h" className="crystal-client__section-title crystal-client__section-title--meta" data-reveal>
                      {content.details.sectionTitle}
                    </h2>
                    <dl className="crystal-client__dl crystal-client__dl--meta-panel crystal-client__dl--pro" data-reveal>
                      {visibleDetails.map((row) => (
                        <div key={row.id} className="crystal-client__dl-row crystal-client__dl-row--pro">
                          <GymClientMetaRowDisk rowKind={row.id} />
                          <div className="crystal-client__dl-row__body">
                            <dt>{row.label}</dt>
                            <dd>
                              {row.href ?
                                <a
                                  href={row.href}
                                  className="crystal-client__detail-value-link"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {row.value}
                                </a>
                              : row.value}
                            </dd>
                          </div>
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
                    <h2 id="crystal-client-contact-h" className="crystal-client__section-title crystal-client__section-title--meta" data-reveal>
                      {content.contacts.sectionTitle}
                    </h2>
                    <ul className="crystal-client__contact-list crystal-client__contact-list--pro list-unstyled mb-0" data-reveal>
                      {visibleContacts.map((item) => (
                        <li key={item.id} className="crystal-client__contact-item crystal-client__contact-item--pro">
                          <GymClientMetaRowDisk rowKind={item.id} />
                          <div className="crystal-client__contact-item__body">
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
                            <a
                              href={locationMapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="crystal-client__link crystal-client__contact-line crystal-client__address-text crystal-client__address-map-link mb-0"
                              aria-label={`Open map: ${item.value}`}
                            >
                              {item.value}
                            </a>
                          ) : item.href ? (
                            <a href={item.href} className="crystal-client__link crystal-client__contact-line">
                              {item.value}
                            </a>
                          ) : (
                            <span className="crystal-client__contact-value crystal-client__contact-line">{item.value}</span>
                          )}
                          </div>
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
        enquiry={{
          gymName: content.header.title,
          emailMailtoHref,
          phoneDisplayForWa: phoneContact?.value ?? null,
          hasWhatsappLink: Boolean(whatsappHref),
        }}
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

      {galleryStrip && galleryStrip.length > 0 ?
        <Modal
          show={galleryLightboxIndex !== null}
          onHide={() => setGalleryLightboxIndex(null)}
          centered
          size="xl"
          dialogClassName="crystal-client-gallery-lightbox"
          contentClassName="crystal-client-gallery-lightbox__shell border-0 shadow-lg"
          backdropClassName="crystal-client-gallery-lightbox-backdrop"
          aria-labelledby="crystal-gallery-lightbox-title"
        >
          <Modal.Body className="crystal-client-gallery-lightbox__body position-relative p-2 p-sm-3">
            <button
              type="button"
              className="btn-close btn-close-white crystal-client-gallery-lightbox__close"
              aria-label="Close gallery"
              onClick={() => setGalleryLightboxIndex(null)}
            />
            {galleryLightboxIndex !== null ?
              <>
                <p id="crystal-gallery-lightbox-title" className="visually-hidden">
                  Photo {galleryLightboxIndex + 1} of {galleryStrip.length}
                </p>
                <div className="crystal-client-gallery-lightbox__frame">
                  <img
                    src={galleryStrip[galleryLightboxIndex].url}
                    alt={galleryStrip[galleryLightboxIndex].caption?.trim() || 'Gym photo'}
                    className="crystal-client-gallery-lightbox__img"
                  />
                </div>
                {galleryStrip[galleryLightboxIndex].caption?.trim() ?
                  <p className="crystal-client-gallery-lightbox__caption text-white-50 small text-center mb-0 mt-2 px-2">
                    {galleryStrip[galleryLightboxIndex].caption.trim()}
                  </p>
                : null}
                {galleryStrip.length > 1 ?
                  <>
                    <button
                      type="button"
                      className="crystal-client-gallery-lightbox__nav crystal-client-gallery-lightbox__nav--prev"
                      aria-label="Previous photo"
                      onClick={() =>
                        setGalleryLightboxIndex(
                          (i) =>
                            i === null ? null : (i - 1 + galleryStrip.length) % galleryStrip.length
                        )
                      }
                    >
                      <span aria-hidden>‹</span>
                    </button>
                    <button
                      type="button"
                      className="crystal-client-gallery-lightbox__nav crystal-client-gallery-lightbox__nav--next"
                      aria-label="Next photo"
                      onClick={() =>
                        setGalleryLightboxIndex((i) => (i === null ? null : (i + 1) % galleryStrip.length))
                      }
                    >
                      <span aria-hidden>›</span>
                    </button>
                    <div className="crystal-client-gallery-lightbox__dots" role="tablist" aria-label="Gallery photos">
                      {galleryStrip.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          role="tab"
                          aria-selected={dotIdx === galleryLightboxIndex}
                          aria-label={`Photo ${dotIdx + 1}`}
                          className={`crystal-client-gallery-lightbox__dot${dotIdx === galleryLightboxIndex ? ' is-active' : ''}`}
                          onClick={() => setGalleryLightboxIndex(dotIdx)}
                        />
                      ))}
                    </div>
                  </>
                : null}
              </>
            : null}
          </Modal.Body>
        </Modal>
      : null}

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
              href={crystalMarketingAbsoluteUrl('/user/create-website/select-template')}
              className="btn btn-primary mt-4 crystal-business-page__back"
            >
              Create website
            </a>
          ) : (
            <Link href="/user/create-website/select-template" className="btn btn-primary mt-4 crystal-business-page__back">
              Create website
            </Link>
          )}
          {onGymSubdomain ? (
            <a href={crystalMarketingAbsoluteUrl('/')} className="btn btn-link mt-2 d-block">
              Crystal home
            </a>
          ) : (
            <Link href="/" className="btn btn-link mt-2 d-block">
              Crystal home
            </Link>
          )}
        </div>
      </main>
    </PageContainer>
  );
}

function formatSubscriptionEndDateLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'long' });
  } catch {
    return iso;
  }
}

function resolvePlanTier(sub: ActiveSubscriptionResponse): ActiveSubscriptionPlanTier | null {
  return sub.plan_tier ?? null;
}

function resolveSubscriptionEndDate(sub: ActiveSubscriptionResponse): string | null {
  return sub.subscription_end_date;
}

/** Public gym is “off” for visitors when the subscription API says no access. */
function subscriptionPublicGateInactive(sub: ActiveSubscriptionResponse): boolean {
  return !sub.has_active_subscription || sub.is_active === false;
}

/** Live client “Recharge now” modal: logged-in owner on a **trial** plan (`GET …/active-subscription/` tier). */
function ownerIsOnTrialForClientRechargeModal(sub: ActiveSubscriptionResponse): boolean {
  return resolvePlanTier(sub) === 'trial';
}

function CrystalOwnerRechargeModal({
  show,
  onHide,
  businessSlug,
  subscription,
  themeCssVars,
}: {
  show: boolean;
  onHide: () => void;
  businessSlug: string;
  subscription: ActiveSubscriptionResponse;
  themeCssVars: CSSProperties;
}) {
  const onGymSubdomain = Boolean(getPublicGymSlugFromHost());
  const slugEnc = encodeURIComponent(businessSlug);
  const plansPath = `${PLANS_PAGE_PATH}/${slugEnc}`;
  const plansHref = onGymSubdomain ? crystalMarketingAbsoluteUrl(plansPath) : plansPath;

  const endRaw = resolveSubscriptionEndDate(subscription);
  const endLabel = endRaw ? formatSubscriptionEndDateLabel(endRaw) : null;
  const inactive = subscriptionPublicGateInactive(subscription);
  const trialActive =
    subscription.has_active_subscription &&
    subscription.is_active !== false &&
    resolvePlanTier(subscription) === 'trial';

  const lead =
    trialActive && endLabel ?
      `Your free trial is active and ends on ${endLabel}. Recharge now to choose a paid plan and keep your gym site online.`
    : trialActive ?
      "You're on a free trial. Recharge now to move to a paid plan and extend your service."
    : inactive && endLabel ?
      `Your subscription is no longer active. It ended on ${endLabel}. Recharge now to bring your gym site back online.`
    : inactive ?
      'Your subscription is not active. Recharge now to restore service for your gym site.'
    : endLabel ?
      `Your current subscription ends on ${endLabel}. Recharge now for extended, uninterrupted service.`
    : 'Recharge now to extend your service.';

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="crystal-owner-recharge-modal" style={themeCssVars}>
      <Modal.Header closeButton>
        <Modal.Title>Recharge now</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{lead}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Later
        </Button>
        {onGymSubdomain ? (
          <Button variant="primary" href={plansHref} as="a" onClick={onHide}>
            Recharge now
          </Button>
        ) : (
          <Link href={plansHref} className="btn btn-primary" onClick={onHide}>
            Recharge now
          </Link>
        )}
      </Modal.Footer>
    </Modal>
  );
}

function GymClientVisualBuilderView({
  page,
  businessSlug,
  themeCssVars,
  knownSlugs,
}: {
  page: VisualBuilderPublicPage;
  businessSlug: string;
  themeCssVars: CSSProperties;
  knownSlugs: string[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostSlug = getPublicGymSlugFromHost();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || hostSlug || !businessSlug || businessSlug === 'preview') return;
    const prefix = `/${encodeURIComponent(businessSlug)}`;
    const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href]');
    const slugSet = new Set(knownSlugs.map((s) => s.trim().toLowerCase()).filter(Boolean));
    anchors.forEach((a) => {
      const raw = (a.getAttribute('href') ?? '').trim();
      if (!raw) return;
      if (raw.startsWith('#')) return;
      if (/^(mailto:|tel:|https?:\/\/|\/\/|javascript:)/i.test(raw)) return;
      if (raw.startsWith(prefix)) return;
      const normalized =
        raw.startsWith('/') ? raw.slice(1)
        : raw.startsWith('./') ? raw.slice(2)
        : raw;
      const firstSeg = normalized.split('/')[0]?.trim().toLowerCase() ?? '';
      if (!firstSeg || (!slugSet.has(firstSeg) && firstSeg !== 'home')) return;
      if (raw.startsWith('/')) {
        a.setAttribute('href', `${prefix}${raw}`);
        return;
      }
      const tail = raw.replace(/^\.?\//, '');
      a.setAttribute('href', `${prefix}/${tail}`);
    });
  }, [businessSlug, hostSlug, knownSlugs, page.html, page.slug]);

  return (
    <>
      <div className="crystal-client-viewport" style={themeCssVars}>
        <style>{`${WEBSITE_BUILDER_ANIMATION_CSS}\n${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}\n${WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS}\n${WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS}\n${page.css}`}</style>
        <div ref={rootRef} className="wb-page wb-template-root" dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
      <Script src="/wb-component-animations.js" strategy="afterInteractive" />
    </>
  );
}

function CrystalProTemplateFrame({ templateKey }: { templateKey: ProWebsiteTemplateKey }) {
  const src = PRO_TEMPLATE_PUBLIC_PATHS[templateKey];
  return (
    <div className="crystal-client-template-host">
      <iframe src={src} title="Client page template" className="crystal-client-template-frame" loading="lazy" />
    </div>
  );
}

export default function CrystalBusinessPage() {
  const params = useParams<{ slug?: string | string[]; rest?: string[]; path?: string[] }>();
  const routeSlug =
    typeof params.slug === 'string' ? params.slug
    : Array.isArray(params.slug) && params.slug[0] ?
      String(params.slug[0])
    : undefined;
  const routePathSegments = useMemo(() => {
    const raw = Array.isArray(params.path) ? params.path : Array.isArray(params.rest) ? params.rest : [];
    return raw.map((seg) => {
      try {
        return decodeURIComponent(String(seg));
      } catch {
        return String(seg);
      }
    });
  }, [params.path, params.rest]);
  const routePageSlug = useMemo(() => {
    const first = routePathSegments[0]?.trim().toLowerCase() ?? '';
    return first;
  }, [routePathSegments]);
  const router = useRouter();
  const hostSlug = getPublicGymSlugFromHost();
  const slug = (hostSlug ?? routeSlug) ?? '';
  const searchParams = useSearchParams();
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
    return hit ? subscriptionPublicGateInactive(hit.subscription) : false;
  });
  const [publicSubscription, setPublicSubscription] = useState<ActiveSubscriptionResponse | null>(() => {
    if (!slug || slug === 'preview') return null;
    return peekPublicGymBundle(slug)?.subscription ?? null;
  });
  /** Whether the logged-in user owns this business (`null` while verifying with the API). */
  const [isOwner, setIsOwner] = useState<boolean | null>(() =>
    !slug || slug === 'preview' || !getAccessToken() ? false : null
  );
  const [rechargeModalDismissed, setRechargeModalDismissed] = useState(false);
  const [publicGalleryImages, setPublicGalleryImages] = useState<BusinessUploadedImage[]>([]);
  /** Bumped when another tab writes the preview draft so we re-read localStorage. */
  const [previewStorageRev, setPreviewStorageRev] = useState(0);
  /** After layout on the client — avoids SSR + first paint showing “No preview yet” before localStorage is read. */
  const [canReadPreviewStorage, setCanReadPreviewStorage] = useState(false);
  /** Bumped on cross-tab login/logout (`storage` event) so we re-check gym ownership. */
  const [authSessionRev, setAuthSessionRev] = useState(0);
  /** True after loading has stayed active ≥500ms (enables branded intro overlay). */
  const [introSlowGate, setIntroSlowGate] = useState(false);
  /** Session + motion: allow branded intro for this slug (read on client). */
  const [clientIntroAllowed, setClientIntroAllowed] = useState(false);
  /** After intro exit completes; reset when slug changes. */
  const [introDismissedAfterComplete, setIntroDismissedAfterComplete] = useState(false);
  /** Timestamp when this slug entered `loading` (public routes); drives ≥1.5s dwell before site reveal. */
  const [loadStartedAt, setLoadStartedAt] = useState<number | null>(null);
  /** True after min dwell from `loadStartedAt` once data is ready (syncs intro exit + skeleton → site). */
  const [shellRevealReady, setShellRevealReady] = useState(false);
  /** Page shell fades in under the intro overlay during exit (crossfade bridge). */
  const [introCrossfade, setIntroCrossfade] = useState(false);

  useLayoutEffect(() => {
    setCanReadPreviewStorage(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_ACCESS_TOKEN || e.key === null) {
        setAuthSessionRev((n) => n + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    setIntroDismissedAfterComplete(false);
    setIntroSlowGate(false);
    setLoadStartedAt(null);
    setShellRevealReady(false);
    setIntroCrossfade(false);
  }, [slug]);

  /** Visual-builder HTML blocks: `public/wb-crystal-lead-modals.js` reads these from `<body>`. */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!slug || slug === 'preview') {
      document.body.removeAttribute('data-wb-public-gym-slug');
      document.body.removeAttribute('data-wb-api-base');
      document.body.removeAttribute('data-wb-service-enquiry-path');
      return;
    }
    document.body.setAttribute('data-wb-public-gym-slug', slug);
    if (apiBaseUrl) document.body.setAttribute('data-wb-api-base', apiBaseUrl);
    if (serviceEnquiryPath) document.body.setAttribute('data-wb-service-enquiry-path', serviceEnquiryPath);
    return () => {
      document.body.removeAttribute('data-wb-public-gym-slug');
      document.body.removeAttribute('data-wb-api-base');
      document.body.removeAttribute('data-wb-service-enquiry-path');
    };
  }, [slug]);

  useEffect(() => {
    if (!slug || slug === 'preview') {
      setClientIntroAllowed(false);
      return;
    }
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setClientIntroAllowed(false);
        return;
      }
      if (window.sessionStorage.getItem(sessionCrystalClientIntroKey(slug)) === '1') {
        setClientIntroAllowed(false);
        return;
      }
    } catch {
      setClientIntroAllowed(false);
      return;
    }
    setClientIntroAllowed(true);
  }, [slug]);

  useEffect(() => {
    if (!slug || slug === 'preview' || !loading) return;
    setIntroSlowGate(false);
    const id = window.setTimeout(() => setIntroSlowGate(true), 500);
    return () => window.clearTimeout(id);
  }, [slug, loading]);

  useEffect(() => {
    if (error) setIntroDismissedAfterComplete(true);
  }, [error]);

  useEffect(() => {
    if (slug && slug !== 'preview' && loading) {
      setLoadStartedAt(Date.now());
    }
  }, [slug, loading]);

  const previewDraft = useMemo(() => {
    if (slug !== 'preview' || isMarketingPreview) return null;
    if (!canReadPreviewStorage) return null;
    return readCrystalWebsitePreviewFromStorage();
  }, [slug, isMarketingPreview, canReadPreviewStorage, previewStorageRev]);

  const marketingDemoContent = useMemo(
    () => (isMarketingPreview ? cloneGymClientSiteDefaults() : null),
    [isMarketingPreview]
  );

  const siteContentFromBusiness = useMemo(() => {
    if (!business) return null;
    const base = resolveGymClientSiteContent(business);
    const wc = business.website_content;
    if (wc && typeof wc === 'object') {
      return applyPublicWebsiteContentOverlay(base, wc as Record<string, unknown>);
    }
    return base;
  }, [business]);

  const siteContent = useMemo(() => {
    if (slug !== 'preview') return siteContentFromBusiness;
    if (isMarketingPreview && marketingDemoContent) return marketingDemoContent;
    if (previewDraft?.content) {
      return withBundledDefaultClientLogo(withLegacyHeroBackgroundMigrated(previewDraft.content));
    }
    return null;
  }, [slug, isMarketingPreview, marketingDemoContent, previewDraft, siteContentFromBusiness]);

  const clientGalleryStrip = useMemo(() => {
    if (!slug || slug === 'preview' || !publicSubscription || !siteContent) return undefined;
    if (resolvePlanTier(publicSubscription) === 'trial') return undefined;
    const rows = publicGalleryImages.filter((i) => !i.asset || i.asset === 'gallery');
    if (rows.length === 0) return undefined;
    const caps = siteContent.gallery?.captionsByUrl;
    const order = siteContent.gallery?.imageOrder;
    const withIndex = rows.map((r, i) => ({ r, i }));
    if (order && order.length > 0) {
      const idx = new Map(order.map((u, j) => [u, j]));
      withIndex.sort((a, b) => {
        const ia = idx.get(a.r.image_url);
        const ib = idx.get(b.r.image_url);
        const va = ia !== undefined ? ia : 10_000 + a.i;
        const vb = ib !== undefined ? ib : 10_000 + b.i;
        return va - vb;
      });
    }
    return withIndex.map(({ r: i }) => ({
      url: resolveBusinessImageDisplayUrl(slug, i),
      caption: caps?.[i.image_url]?.trim() || undefined,
    }));
  }, [slug, publicSubscription, publicGalleryImages, siteContent]);

  /** `/preview` — show gallery from saved draft so users see the same strip as the public site (trial included). */
  const previewGalleryStrip = useMemo(() => {
    if (slug !== 'preview' || !siteContent) return undefined;
    const previewOrder = siteContent.gallery?.previewImageOrder;
    const order =
      previewOrder && previewOrder.length > 0 ? previewOrder : siteContent.gallery?.imageOrder;
    if (!order || order.length === 0) return undefined;
    const caps = siteContent.gallery?.captionsByUrl;
    return order
      .map((raw) => raw.trim())
      .filter(Boolean)
      .map((rawUrl) => ({
        url: resolvePreviewGalleryImageUrl(rawUrl),
        caption: caps?.[rawUrl]?.trim() || undefined,
      }));
  }, [slug, siteContent]);

  /** Same tokens on viewport + portaled modals (navbar, hero, modal header gradient, etc.). */
  const resolvedGymClientTheme = useMemo((): GymClientWebsiteParsedTheme => {
    if (slug === 'preview' && isMarketingPreview) {
      return { ...MARKETING_PREVIEW_THEME };
    }
    if (slug === 'preview' && previewDraft) {
      return parseGymClientWebsiteThemeFromApi(previewDraft.theme, {
        accentHex: CLIENT_THEME_FALLBACK.accentHex,
        darkHex: CLIENT_THEME_FALLBACK.darkHex,
        textHex: GYM_CLIENT_DEFAULT_TEXT_HEX,
        lightHex: CLIENT_THEME_FALLBACK.lightHex,
      });
    }
    return parseGymClientWebsiteThemeFromApi(business?.website_theme, CLIENT_THEME_FALLBACK);
  }, [slug, isMarketingPreview, previewDraft, business]);

  const clientThemeCssVars = useMemo(
    () => gymClientThemeToCssVars(resolvedGymClientTheme),
    [resolvedGymClientTheme]
  );

  const visualBuilderPages = useMemo(
    () => normalizeVisualBuilderPages(siteContent?.visualBuilder),
    [siteContent?.visualBuilder],
  );
  const activeVisualBuilderPage = useMemo(
    () => pickVisualBuilderPage(visualBuilderPages, routePageSlug),
    [visualBuilderPages, routePageSlug],
  );

  const dataReadyPublic = Boolean(slug && slug !== 'preview' && !loading && siteContent);
  const publicLoadShell = Boolean(slug && slug !== 'preview' && !error && !notFound && (loading || dataReadyPublic));
  const publicIntroLayer = Boolean(
    publicLoadShell && introSlowGate && clientIntroAllowed && !introDismissedAfterComplete
  );
  /** No skeleton under the single Crystal splash — theme bridge background only until intro or site. */
  const publicLoadMinimalIntro =
    Boolean(slug && slug !== 'preview' && !error && !notFound && clientIntroAllowed && !introDismissedAfterComplete);

  useEffect(() => {
    if (!dataReadyPublic) {
      setShellRevealReady(false);
      return;
    }
    if (loadStartedAt == null) {
      setShellRevealReady(true);
      return;
    }
    const wait = Math.max(0, 1500 - (Date.now() - loadStartedAt));
    const id = window.setTimeout(() => setShellRevealReady(true), wait);
    return () => window.clearTimeout(id);
  }, [dataReadyPublic, loadStartedAt, slug]);

  useEffect(() => {
    if (!publicLoadShell || typeof document === 'undefined') return;
    const html = document.documentElement;
    html.style.setProperty('--crystal-bridge-bg', resolvedGymClientTheme.darkHex);
    html.classList.add('crystal-public-load-bridge');
    return () => {
      html.classList.remove('crystal-public-load-bridge');
      html.style.removeProperty('--crystal-bridge-bg');
    };
  }, [publicLoadShell, resolvedGymClientTheme.darkHex]);

  useEffect(() => {
    if (!dataReadyPublic || !siteContent || !slug || slug === 'preview') return;
    const raw = (siteContent.layout.heroBackgroundImage ?? '').trim();
    if (!raw) return;
    const url = resolveSiteBackgroundImageUrl(raw);
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('data-crystal-hero-preload', '1');
    document.head.appendChild(link);
    const img = new Image();
    img.src = url;
    return () => {
      try {
        link.parentNode?.removeChild(link);
      } catch {
        /* ignore */
      }
    };
  }, [dataReadyPublic, siteContent, slug]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setBusiness(null);
      setNotFound(false);
      setSubscriptionInactive(false);
      setPublicSubscription(null);
      setError(null);
      return;
    }
    if (slug === 'preview') {
      setLoading(false);
      setBusiness(null);
      setNotFound(false);
      setSubscriptionInactive(false);
      setPublicSubscription(null);
      setError(null);
      return;
    }
    setError(null);
    setNotFound(false);
    const hit = peekPublicGymBundle(slug);
    if (hit) {
      setBusiness(hit.business);
      setPublicSubscription(hit.subscription);
      setSubscriptionInactive(subscriptionPublicGateInactive(hit.subscription));
      setLoading(false);
    } else {
      setLoading(true);
      setBusiness(null);
      setSubscriptionInactive(false);
      setPublicSubscription(null);
    }

    let cancelled = false;
    fetchPublicGymBundle(slug)
      .then((bundle) => {
        if (cancelled) return;
        setBusiness(bundle.business);
        setPublicSubscription(bundle.subscription);
        setSubscriptionInactive(subscriptionPublicGateInactive(bundle.subscription));
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

  /**
   * Owner-only refresh of `GET /businesses/<slug>/active-subscription/`.
   * Anonymous visitors already get subscription data from `fetchPublicGymBundle`; refetching here for every
   * `isOwner` transition caused 3–4 duplicate calls on load (bundle + this effect + Strict Mode).
   */
  useEffect(() => {
    if (!slug || slug === 'preview') return;
    if (isOwner !== true) return;
    let cancelled = false;
    getActiveSubscription(slug)
      .then((data) => {
        if (cancelled) return;
        setPublicSubscription(data);
        setSubscriptionInactive(subscriptionPublicGateInactive(data));
      })
      .catch(() => {
        /* keep bundle-derived subscription state */
      });
    return () => {
      cancelled = true;
    };
  }, [slug, isOwner]);

  useEffect(() => {
    if (!slug || slug === 'preview') {
      setPublicGalleryImages([]);
      return;
    }
    if (!publicSubscription) {
      setPublicGalleryImages([]);
      return;
    }
    if (resolvePlanTier(publicSubscription) === 'trial') {
      setPublicGalleryImages([]);
      return;
    }
    let cancelled = false;
    listBusinessImages(slug)
      .then((res) => {
        if (!cancelled) setPublicGalleryImages(res.images);
      })
      .catch(() => {
        if (!cancelled) setPublicGalleryImages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, publicSubscription]);

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

  useEffect(() => {
    if (!slug || slug === 'preview') {
      setIsOwner(false);
      return;
    }
    if (!getAccessToken()) {
      setIsOwner(false);
      return;
    }
    let cancelled = false;
    setIsOwner(null);
    getBusinessDetail(slug)
      .then(() => {
        if (!cancelled) setIsOwner(true);
      })
      .catch(() => {
        if (!cancelled) setIsOwner(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, authSessionRev]);

  useEffect(() => {
    setRechargeModalDismissed(false);
  }, [slug]);

  useEffect(() => {
    if (slug && slug !== 'preview' && !loading && notFound) {
      router.replace('/404');
    }
  }, [slug, loading, notFound, router]);

  if (slug === 'preview' && !isMarketingPreview && !canReadPreviewStorage) {
    return (
      <PageContainer className="crystal-business-page crystal-business-page--client">
        <main className="crystal-business-page__main crystal-business-page__main--flush">
          <div className="crystal-client-viewport crystal-client-viewport--loading" style={clientThemeCssVars}>
            <CrystalClientLogoLoader style={clientThemeCssVars} />
          </div>
        </main>
      </PageContainer>
    );
  }

  if (slug === 'preview' && !siteContent) {
    return <CrystalPreviewEmpty />;
  }

  if (slug && slug !== 'preview' && !loading && notFound) {
    return null;
  }

  const ownerCheckPending = Boolean(
    slug && slug !== 'preview' && subscriptionInactive && getAccessToken() && isOwner === null
  );

  if (slug && slug !== 'preview' && !loading && !error && subscriptionInactive) {
    if (ownerCheckPending) {
      return (
        <PageContainer className="crystal-business-page crystal-business-page--client">
          <main className="crystal-business-page__main crystal-business-page__main--flush">
            <div className="crystal-client-viewport crystal-client-viewport--loading" style={clientThemeCssVars}>
              <CrystalClientLogoLoader style={clientThemeCssVars} />
            </div>
          </main>
        </PageContainer>
      );
    }
    if (isOwner !== true) {
      return <CrystalServiceUnavailable slug={slug} businessName={business?.name} />;
    }
  }

  const showCrystalOwnerRechargeModal = Boolean(
    slug &&
      slug !== 'preview' &&
      Boolean(getAccessToken()) &&
      isOwner === true &&
      publicSubscription &&
      ownerIsOnTrialForClientRechargeModal(publicSubscription) &&
      !rechargeModalDismissed
  );
  const activeProTemplateKey =
    !activeVisualBuilderPage &&
    siteContent?.proTemplateKey &&
    (slug === 'preview' || (publicSubscription && resolvePlanTier(publicSubscription) === 'pro')) ?
      siteContent.proTemplateKey
    : null;

  return (
    <PageContainer
      className={`crystal-business-page crystal-business-page--client${publicLoadShell ? ' crystal-business-page--load-bridge' : ''}`}
    >
      <main className="crystal-business-page__main crystal-business-page__main--flush">
        <div className="crystal-business-page__content crystal-business-page__content--wide">
          {!slug ? (
            <div className="crystal-business-page__fallback">
              <p className="crystal-business-page__lead">No business selected.</p>
            </div>
          ) : publicLoadShell ? (
            <div
              className={`crystal-client-viewport crystal-intro-load-shell${
                loading || publicIntroLayer ? ' crystal-client-viewport--loading' : ''
              }`}
              style={clientThemeCssVars}
            >
              {publicLoadMinimalIntro ?
                null
              : loading || (publicLoadShell && !shellRevealReady) ?
                <CrystalClientPageSkeleton />
              : null}
              {dataReadyPublic && siteContent && shellRevealReady ? (
                <div className="crystal-client-intro-host">
                  <>
                    <div
                      className={`crystal-client-viewport${resolvedGymClientTheme.metaSectionBg ? ' crystal-client-viewport--meta-bg-override' : ''}${
                        publicIntroLayer ? ' crystal-client-viewport--behind-intro' : ''
                      }${introCrossfade ? ' crystal-client-viewport--crossfade-reveal' : ''}`}
                      style={clientThemeCssVars}
                    >
                      {activeVisualBuilderPage ? (
                        <GymClientVisualBuilderView
                          page={activeVisualBuilderPage}
                          businessSlug={slug ?? ''}
                          themeCssVars={clientThemeCssVars}
                          knownSlugs={visualBuilderPages.map((p) => p.slug)}
                        />
                      ) : activeProTemplateKey ? (
                        <CrystalProTemplateFrame templateKey={activeProTemplateKey} />
                      ) : (
                        <GymClientSiteView
                          content={siteContent}
                          businessSlug={slug ?? ''}
                          themeCssVars={clientThemeCssVars}
                          suppressPublicLeads={false}
                          galleryStrip={clientGalleryStrip}
                        />
                      )}
                    </div>
                    {showCrystalOwnerRechargeModal && publicSubscription && slug !== 'preview' ? (
                      <CrystalOwnerRechargeModal
                        show
                        onHide={() => setRechargeModalDismissed(true)}
                        businessSlug={slug}
                        subscription={publicSubscription}
                        themeCssVars={clientThemeCssVars}
                      />
                    ) : null}
                  </>
                </div>
              ) : null}
              {publicIntroLayer ? (
                <CrystalClientIntroOverlay
                  style={clientThemeCssVars}
                  contentReady={dataReadyPublic && shellRevealReady}
                  loadStartedAt={loadStartedAt}
                  onExitStart={() => setIntroCrossfade(true)}
                  onComplete={() => {
                    if (slug && slug !== 'preview') {
                      try {
                        window.sessionStorage.setItem(sessionCrystalClientIntroKey(slug), '1');
                      } catch {
                        /* ignore quota / private mode */
                      }
                    }
                    setIntroCrossfade(false);
                    setIntroDismissedAfterComplete(true);
                  }}
                />
              ) : null}
            </div>
          ) : loading ? (
            <div className="crystal-client-viewport crystal-client-viewport--loading" style={clientThemeCssVars}>
              <CrystalClientLogoLoader style={clientThemeCssVars} />
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
                    <Link href="/user/create-website/select-template" className="btn btn-sm btn-light fw-semibold">
                      Create now
                    </Link>
                  : <Link
                      href={`/login?from=${encodeURIComponent('/preview?from=marketing')}`}
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
                    href={
                      previewDraft?.editBusinessSlug ?
                        `/user/business/${encodeURIComponent(previewDraft.editBusinessSlug)}/edit?fromPreview=1`
                      : '/user/create-website?fromPreview=1'
                    }
                    replace
                    className="crystal-preview-banner__link"
                  >
                    Edit setup
                  </Link>
                </div>
              : null}
              <div
                className={`crystal-client-viewport${resolvedGymClientTheme.metaSectionBg ? ' crystal-client-viewport--meta-bg-override' : ''}`}
                style={clientThemeCssVars}
              >
                {activeVisualBuilderPage ? (
                  <GymClientVisualBuilderView
                    page={activeVisualBuilderPage}
                    businessSlug={
                      slug === 'preview' ?
                        isMarketingPreview ? 'demo'
                        : (previewDraft?.slug ?? 'preview')
                      : (slug ?? '')
                    }
                    themeCssVars={clientThemeCssVars}
                    knownSlugs={visualBuilderPages.map((p) => p.slug)}
                  />
                ) : activeProTemplateKey ? (
                  <CrystalProTemplateFrame templateKey={activeProTemplateKey} />
                ) : (
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
                    galleryStrip={slug === 'preview' ? previewGalleryStrip : clientGalleryStrip}
                  />
                )}
              </div>
              {showCrystalOwnerRechargeModal && publicSubscription && slug !== 'preview' ? (
                <CrystalOwnerRechargeModal
                  show
                  onHide={() => setRechargeModalDismissed(true)}
                  businessSlug={slug}
                  subscription={publicSubscription}
                  themeCssVars={clientThemeCssVars}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </main>
      {slug && slug !== 'preview' ?
        <>
          <Script src="/wb-component-animations.js" strategy="afterInteractive" />
          <Script src="/wb-crystal-lead-modals.js" strategy="afterInteractive" />
        </>
      : null}
    </PageContainer>
  );
}
