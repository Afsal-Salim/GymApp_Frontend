'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import homeHeroBg from '../../assets/home-hero-bg.png';
import homeHeroSideBg from '../../assets/home-hero-side-bg.png';

const homeHeroSideW = typeof homeHeroSideBg === 'object' ? homeHeroSideBg.width : 800;
const homeHeroSideH = typeof homeHeroSideBg === 'object' ? homeHeroSideBg.height : 600;
import { Accordion, Container, Row, Col, Card, Button } from 'react-bootstrap';
import { PlanPriceDisplay } from '../../components';
import { useEnquiryModal } from '../../contexts/EnquiryModalContext';
import { buildMarketingContactRows, homepageTutorialVideoUrl } from '../../config/env';
import { HOME_PAGE_FAQ } from './homeFaq';
import { WhatsAppLogoIcon } from '../../components';
import './HomePage.css';

type DisplayPlan = {
  id: string;
  name: string;
  listPriceFormatted: string;
  firstActivationFormatted: string | null;
  showIntroPrice: boolean;
  period: string;
  currency: string;
  features: string[];
  cta: string;
  paymentSlug: 'starter' | 'pro' | null;
  popular: boolean;
  comingSoon: boolean;
  /** When true, omit price UI (e.g. Pro while features are in development). */
  hidePrice?: boolean;
  /** Shown under the plan title when `hidePrice` is true. */
  priceStatusMessage?: string;
};

const STARTER_FEATURE_LIST = [
  'Dynamic website for your gym — Showcase your services, timings, and facilities with a modern, responsive page.',
  '5 ready-made themes (fully customizable) — Match your brand with colors and style that fit your gym’s vibe.',
  'WhatsApp integration — Let potential members contact you instantly—no missed leads.',
  'Basic client analytics — Understand who’s visiting your page and what they’re interested in.',
  'Upload up to 10 images — Highlight your equipment, space, and transformations.',
  'Email notifications for enquiries — Get notified instantly when someone shows interest.',
  'User activity insights — Track how visitors interact with your page to improve conversions.',
];

const STARTER_PLAN: DisplayPlan = {
  id: 'starter',
  name: 'Starter',
  listPriceFormatted: '₹499',
  firstActivationFormatted: '₹299',
  showIntroPrice: true,
  period: ' / 28 days',
  currency: 'INR',
  features: STARTER_FEATURE_LIST,
  cta: 'Get now for ₹299',
  paymentSlug: 'starter',
  popular: false,
  comingSoon: false,
};

const PRO_PLAN: DisplayPlan = {
  id: 'pro',
  name: 'Pro',
  listPriceFormatted: '',
  firstActivationFormatted: null,
  showIntroPrice: false,
  period: '',
  currency: 'INR',
  features: [],
  cta: 'Coming soon',
  paymentSlug: null,
  popular: true,
  comingSoon: true,
  hidePrice: true,
  priceStatusMessage: 'Coming soon',
};

const HERO_BADGE = '#1 PLATFORM FOR GYMS';
const HERO_TAGLINE =
  'Create a website for your gym in minutes—no coding. Crystal is a gym website builder: themes, WhatsApp leads, and analytics so you can grow online.';
const HERO_HIGHLIGHTS = [
  { title: 'Lightning Fast', sub: 'Launch in minutes', Icon: BoltOutlinedIcon },
  { title: 'Member Management', sub: 'Built-in CRM', Icon: GroupsOutlinedIcon },
  { title: 'Grow Your Business', sub: 'More members, less effort', Icon: BarChartOutlinedIcon },
] as const;
const HERO_TRUST_AVATARS = ['A', 'B', 'C', 'D', 'E'] as const;
const HERO_BOTTOM_FEATURES = [
  { title: 'No Coding', sub: 'Easy to use builder', Icon: WidgetsOutlinedIcon },
  { title: 'Mobile Ready', sub: 'Looks perfect anywhere', Icon: SmartphoneOutlinedIcon },
  { title: 'SEO Optimized', sub: 'Rank higher on Google', Icon: TravelExploreOutlinedIcon },
  { title: 'Secure & Reliable', sub: 'Your data is safe', Icon: LockOutlinedIcon },
] as const;
const muiHeroIconSx = { fontSize: '1.25rem' } as const;

const HOW_IT_WORKS = [
    {
      title: 'Create your account',
      text: 'Sign up in seconds and get started with your gym website setup.',
    },
    {
      title: 'Add your details & preview',
      text: 'Enter your gym info, services, images, and pricing—see your website update in real time.',
    },
    {
      title: 'Publish instantly',
      text: 'Go live with one click. Your professional gym website is ready to share.',
    },
  ];

const ABOUT = {
    title: 'Why Crystal',
    tagline: 'Launch your gym online—fast and hassle-free.',
    vision: 'Empowering small and growing businesses with high-quality websites at prices they can truly afford.',
    mission: [
      'We believe every business—no matter how small—deserves a professional online presence.',
      "That's why we build powerful, affordable websites that help you grow.",
    ] as const,
    description:
      'Crystal is built to help you create a fitness or gym website without a developer. Turn your timetable, pricing, and photos into a polished site in minutes—then publish and share your link.',
    stats: [
      { value: '3', label: 'Simple steps to launch' },
      { value: '<5 min', label: 'Setup time' },
      { value: '0', label: 'Technical skills needed' },
    ],
  };

const CONTACTS = {
  title: 'Need help getting started?',
  subtitle: 'Our team is here to help you launch your gym website smoothly.',
  items: buildMarketingContactRows(),
};

function CrystalContactMailGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M4 6h16v12H4V6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4 8l8 5.5L20 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrystalContactPhoneGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.86.3 1.7.54 2.5a2 2 0 01-.45 2.11L8.09 9.9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0122 16.92z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES_SCROLL = [
    { icon: '◇', title: 'Add your details', text: 'Enter your gym info in minutes' },
    { icon: '◆', title: 'Live preview', text: 'See your website update instantly' },
    { icon: '◇', title: 'One-click publish', text: 'Go live without any setup' },
    { icon: '◆', title: 'Edit anytime', text: 'Update content whenever you need' },
    { icon: '◇', title: 'Built-in support', text: 'Get help whenever you need it' },
  ];

const TESTIMONIALS_SCROLL = [
    { quote: 'We launched our gym website in under 10 minutes. Super आसान!', author: 'Vaishak U K, Gym Owner' },
    { quote: 'Didn’t expect it to be this simple. No developer needed at all.', author: 'LijuMon, Fitness Studio' },
    { quote: 'The live preview feature is amazing—we could see everything instantly.', author: 'Akshay, Trainer' },
    { quote: 'Perfect solution for small gyms wanting to go online quickly.', author: 'Sahal, Gym Manager' },
  ];
  
const CUSTOM_PLAN: DisplayPlan = {
  id: 'custom',
  name: 'Custom build',
  listPriceFormatted: 'Custom',
  firstActivationFormatted: null,
  showIntroPrice: false,
  period: '',
  currency: 'INR',
  features: [
    'For service-based businesses — salons, clinics, consultants, local services, and more',
    'You tell us what you need; we design and build the website for you',
    'Custom layout, branding, and features beyond standard templates',
    'We scope, build, and launch with you step by step',
  ],
  cta: 'Tell us what you need',
  paymentSlug: null,
  popular: false,
  comingSoon: false,
};

const HOMEPAGE_PACKAGES: DisplayPlan[] = [STARTER_PLAN, PRO_PLAN, CUSTOM_PLAN];

function getYoutubeEmbedUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${url.pathname.replace(/^\//, '')}`;
    }
    if (url.pathname.includes('/embed/')) return rawUrl;
    const videoId = url.searchParams.get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

const hasHomepageTutorialVideo = Boolean(homepageTutorialVideoUrl.trim());
const homepageTutorialEmbedUrl = hasHomepageTutorialVideo
  ? getYoutubeEmbedUrl(homepageTutorialVideoUrl)
  : '';

function useCrystalHomeReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-crystal-reveal]');
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('crystal-reveal-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

function useHorizontalWheel(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);
      if (isVerticalScroll) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [ref]);
}

function PlanFeatures({ planId, features }: { planId: string; features: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const hasMore = el.scrollHeight > el.clientHeight + 2;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setShowScrollHint(hasMore && !atBottom);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollHint();
    const ro = new ResizeObserver(updateScrollHint);
    ro.observe(el);
    el.addEventListener('scroll', updateScrollHint);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateScrollHint);
    };
  }, [features.length, updateScrollHint]);

  return (
    <div className="crystal-package-features-wrapper">
      <div className="crystal-package-features" ref={containerRef}>
        <ul className="crystal-package-features-list list-unstyled mb-0">
          {features.map((name, idx) => (
            <li key={`${planId}-${idx}`} className="crystal-package-features-list__item">
              <span className="crystal-package-features-list__check" aria-hidden>
                ✓
              </span>
              <span className="crystal-package-features-list__text">{name}</span>
            </li>
          ))}
        </ul>
      </div>
      {showScrollHint && (
        <button
          type="button"
          className="crystal-features-scroll-hint"
          onClick={(e) => {
            e.stopPropagation();
            containerRef.current?.scrollBy({ top: 96, behavior: 'smooth' });
          }}
          aria-label="Scroll to see more features"
        >
          More features below
          <span className="crystal-features-scroll-hint__chev" aria-hidden>
            ↓
          </span>
        </button>
      )}
    </div>
  );
}

const PACKAGES_AUTOPLAY_MS = 3000;
const PACKAGES_LOOP_BREAKPOINT = 992;
const FEATURES_AUTOPLAY_MS = 3000;
const TESTIMONIALS_AUTOPLAY_MS = 3000;

/** Dev Strict Mode remounts mount twice; avoid a second scrollTo/hash strip that feels like a reload. */
let crystalHomeInitialViewportApplied = false;

export default function HomePage() {
  const { openEnquiryModal } = useEnquiryModal();
  const [packagesScrollMode, setPackagesScrollMode] = useState(false);
  const packagesAutoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const packagesPausedRef = useRef(false);
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);
  const packagesScrollRef = useRef<HTMLDivElement>(null);
  const homeMainRef = useRef<HTMLElement>(null);
  useCrystalHomeReveal(homeMainRef);
  useHorizontalWheel(featuresScrollRef);
  useHorizontalWheel(testimonialsScrollRef);
  useHorizontalWheel(packagesScrollRef);
  const pathname = usePathname();

  /* Scroll to section when user clicks an in-page link with hash (not on initial open). */
  const isInitialLoadRef = useRef(true);
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    if (!hash) return;
    const id = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      if (isInitialLoadRef.current) return;
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const check = () => setPackagesScrollMode(window.innerWidth < PACKAGES_LOOP_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Always open homepage from the top; clear any saved scroll position and hash. */
  useEffect(() => {
    if (crystalHomeInitialViewportApplied) return;
    crystalHomeInitialViewportApplied = true;
    sessionStorage.removeItem('crystalReturnScroll');
    window.scrollTo(0, 0);
    if (location.hash && location.pathname === '/') {
      window.history.replaceState(null, '', location.pathname + location.search);
    }
  }, []);

  const [footerVisible, setFooterVisible] = useState(false);
  const [scrollFabMounted, setScrollFabMounted] = useState(false);
  useEffect(() => {
    setScrollFabMounted(true);
  }, []);

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

  /* Packages carousel: auto-scroll, loop back to start when at end (only in horizontal scroll mode) */
  useEffect(() => {
    const el = packagesScrollRef.current;
    if (!el || !packagesScrollMode || HOMEPAGE_PACKAGES.length === 0) return;

    const step = () => {
      const firstCard = el.querySelector('.crystal-package-card') as HTMLElement | null;
      const gap = 24;
      const cardWidth = firstCard ? firstCard.offsetWidth + gap : 304;
      el.scrollBy({ left: cardWidth, behavior: 'smooth' });
    };

    const handleScroll = () => {
      const max = el.scrollWidth - el.clientWidth - 2;
      if (max > 0 && el.scrollLeft >= max) el.scrollLeft = 0;
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    const startAutoplay = () => {
      if (packagesAutoplayRef.current) return;
      packagesAutoplayRef.current = setInterval(step, PACKAGES_AUTOPLAY_MS);
    };
    const stopAutoplay = () => {
      if (packagesAutoplayRef.current) {
        clearInterval(packagesAutoplayRef.current);
        packagesAutoplayRef.current = null;
      }
    };

    startAutoplay();

    const onEnter = () => {
      packagesPausedRef.current = true;
      stopAutoplay();
    };
    const onLeave = () => {
      packagesPausedRef.current = false;
      startAutoplay();
    };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      stopAutoplay();
    };
  }, [packagesScrollMode]);

  const packagesToRender = HOMEPAGE_PACKAGES;

  const featuresAutoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const testimonialsAutoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Features carousel: auto-scroll, loop back to start when at end */
  useEffect(() => {
    const el = featuresScrollRef.current;
    if (!el) return;
    const gap = 16;
    const step = () => {
      const card = el.querySelector('.crystal-scroll-card') as HTMLElement | null;
      const w = (card?.offsetWidth ?? 200) + gap;
      el.scrollBy({ left: w, behavior: 'smooth' });
    };
    const handleScroll = () => {
      const max = el.scrollWidth - el.clientWidth - 2;
      if (max > 0 && el.scrollLeft >= max) el.scrollLeft = 0;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    const start = () => {
      featuresAutoplayRef.current = setInterval(step, FEATURES_AUTOPLAY_MS);
    };
    const stop = () => {
      if (featuresAutoplayRef.current) {
        clearInterval(featuresAutoplayRef.current);
        featuresAutoplayRef.current = null;
      }
    };
    start();
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('mouseenter', stop);
      el.removeEventListener('mouseleave', start);
      stop();
    };
  }, []);

  /* Testimonials carousel: auto-scroll, loop back to start when at end */
  useEffect(() => {
    const el = testimonialsScrollRef.current;
    if (!el) return;
    const gap = 16;
    const step = () => {
      const card = el.querySelector('.crystal-testimonial') as HTMLElement | null;
      const w = (card?.offsetWidth ?? 280) + gap;
      el.scrollBy({ left: w, behavior: 'smooth' });
    };
    const handleScroll = () => {
      const max = el.scrollWidth - el.clientWidth - 2;
      if (max > 0 && el.scrollLeft >= max) el.scrollLeft = 0;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    const start = () => {
      testimonialsAutoplayRef.current = setInterval(step, TESTIMONIALS_AUTOPLAY_MS);
    };
    const stop = () => {
      if (testimonialsAutoplayRef.current) {
        clearInterval(testimonialsAutoplayRef.current);
        testimonialsAutoplayRef.current = null;
      }
    };
    start();
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('mouseenter', stop);
      el.removeEventListener('mouseleave', start);
      stop();
    };
  }, []);

  return (
    <>
    <main ref={homeMainRef} className="crystal-home">
      {/* Hero section */}
      <section id="home" className="crystal-hero crystal-hero-v2">
        {/* Full-bleed gym photo: use <Image> like the side art so CSP / asset URLs match production (inline bg url() is often blocked). */}
        <div className="crystal-hero-v2__bg" aria-hidden>
          {/* Large PNG (~2MB+): skip `/_next/image` so CDN/origin never serves a truncated or flaky optimized response; browser loads the built static file as-is. */}
          <Image
            src={homeHeroBg}
            alt=""
            fill
            priority
            unoptimized
            className="crystal-hero-v2__bg-image"
            sizes="100vw"
          />
        </div>
        <div className="crystal-hero-v2__veil" aria-hidden />
        <div className="crystal-hero-v2__stage">
          <Container fluid className="crystal-hero-v2__main position-relative">
            <div className="crystal-hero-v2__stack">
              <div className="crystal-hero-v2__copy-panel">
                <div className="crystal-hero-v2__layout">
                  <div className="crystal-hero-v2__layout-copy">
                    <Row className="align-items-center gy-5 py-4 py-lg-5">
                      <Col xs={12} className="crystal-hero-v2__copy">
                    <p className="crystal-hero-v2-badge crystal-hero-seq crystal-hero-seq--1 small fw-semibold mb-3">
                      {HERO_BADGE}
                    </p>
                    <h1 className="crystal-hero-v2-title crystal-hero-seq crystal-hero-seq--2 fw-bold mb-3">
                      <span className="crystal-hero-v2-title__line crystal-hero-v2-title__plain">Build. Manage.</span>
                      <span className="crystal-hero-v2-title__line crystal-hero-v2-title__grow">Grow Your Gym.</span>
                    </h1>
                    <p className="crystal-hero-v2-tagline crystal-hero-seq crystal-hero-seq--3 mb-4">
                      {HERO_TAGLINE}
                    </p>
                    <div className="crystal-hero-v2-highlights crystal-hero-seq crystal-hero-seq--4 mb-4">
                      {HERO_HIGHLIGHTS.map(({ title, sub, Icon }) => (
                        <div key={title} className="crystal-hero-v2-highlight">
                          <span className="crystal-hero-v2-highlight__icon" aria-hidden>
                            <Icon sx={muiHeroIconSx} />
                          </span>
                          <span className="crystal-hero-v2-highlight__text">
                            <span className="crystal-hero-v2-highlight__title">{title}</span>
                            <span className="crystal-hero-v2-highlight__sub">{sub}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="crystal-hero-v2__ctas crystal-hero-seq crystal-hero-seq--5 d-flex flex-wrap gap-3 mb-4">
                      <Link
                        href="/user/create-website"
                        className="btn btn-lg crystal-hero-v2-cta-primary d-inline-flex align-items-center gap-2"
                      >
                        Create Your Gym Website
                        <ArrowForwardOutlinedIcon sx={{ fontSize: '1.35rem' }} aria-hidden />
                      </Link>
                      <Link
                        href="/preview?from=marketing"
                        className="btn btn-lg crystal-hero-v2-cta-secondary d-inline-flex align-items-center gap-2"
                      >
                        <PlayArrowOutlinedIcon sx={{ fontSize: '1.45rem' }} aria-hidden />
                        See It In Action
                      </Link>
                    </div>
                    <div className="crystal-hero-v2-trust crystal-hero-seq crystal-hero-seq--6">
                      <div className="crystal-hero-v2-trust__avatars" aria-hidden>
                        {HERO_TRUST_AVATARS.map((letter, i) => (
                          <span
                            key={letter}
                            className="crystal-hero-v2-trust__avatar"
                            style={{ zIndex: HERO_TRUST_AVATARS.length - i }}
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                      <div className="crystal-hero-v2-trust__meta">
                        <div className="crystal-hero-v2-trust__stars" aria-hidden>
                          {'★★★★★'}
                        </div>
                        <p className="crystal-hero-v2-trust__text mb-0">Trusted by 1,000+ gym owners</p>
                      </div>
                    </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
              <div className="crystal-hero-v2__media-panel">
                <div className="crystal-hero-v2__media-frame">
                  <Image
                    src={homeHeroSideBg}
                    alt="Crystal gym website builder: preview of a fitness business site on laptop and phone"
                    className="crystal-hero-v2__hero-image"
                    width={homeHeroSideW}
                    height={homeHeroSideH}
                    sizes="(max-width: 991px) 100vw, 42vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </Container>
        </div>
        <div className="crystal-hero-v2-bottom">
          <Container>
            <Row className="g-3 g-md-4 py-4 text-center text-md-start">
              {HERO_BOTTOM_FEATURES.map(({ title, sub, Icon }) => (
                <Col key={title} xs={6} md={3}>
                  <div className="crystal-hero-v2-bottom__item">
                    <Icon sx={{ fontSize: '1.75rem' }} className="crystal-hero-v2-bottom__icon" aria-hidden />
                    <div>
                      <div className="crystal-hero-v2-bottom__title">{title}</div>
                      <div className="crystal-hero-v2-bottom__sub">{sub}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </section>

      {/* Why a website helps your gym – right below hero */}
      <section id="value" className="crystal-section crystal-value py-5 crystal-section-bg">
        <Container data-crystal-reveal>
          <Row className="justify-content-center">
            <Col xs={12} lg={10} xl={8} className="text-center crystal-value__inner">
              <p className="crystal-section-kicker text-primary fw-semibold text-uppercase small mb-2">Grow your gym</p>
              <h2 className="crystal-section-title display-6 fw-bold mb-3">
              Turn visitors into paying gym members with your own website.
              </h2>
              <p className="text-muted mb-3">
                Whether someone searches for your gym by name or for classes nearby, a dedicated site builds trust, shows your classes and timings, and helps new members choose you. Stand out with a polished online presence—no tech skills needed.
              </p>
              <p className="text-muted mb-4">
                Show your plans, promote offers, and receive instant enquiries on WhatsApp — all in one place.
              </p>
              <div className="crystal-value-points d-flex flex-wrap justify-content-center gap-3">
                <span className="crystal-value-badge">Reach more members</span>
                <span className="crystal-value-badge">Show schedules &amp; pricing</span>
                <span className="crystal-value-badge">Look professional 24/7</span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Horizontal scroll: Features (auto-scroll, loops back to start) */}
      <section className="crystal-scroll-section crystal-scroll-features" data-crystal-reveal>
        <div ref={featuresScrollRef} className="crystal-scroll-inner">
          {FEATURES_SCROLL.map((f, i) => (
            <Card key={i} className="crystal-scroll-card flex-shrink-0">
              <Card.Body className="text-center">
                <span className="crystal-scroll-icon">{f.icon}</span>
                <Card.Title className="h6 mt-2">{f.title}</Card.Title>
                <Card.Text className="small text-muted mb-0">{f.text}</Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </section>

      {/* Action statement – above tutorial */}
      <section className="crystal-section crystal-action-statement">
        <Container data-crystal-reveal>
          <Row className="justify-content-center text-center">
            <Col lg={10} xl={9}>
              <h2 className="crystal-action-title fw-bold mb-4">Build your gym website today.</h2>
              <p className="crystal-action-lead text-muted mb-5">
                No coding. Just add your details and go live. Start in minutes.
              </p>
              <div className="d-flex flex-wrap justify-content-center crystal-action-btns">
                <Link href="/login" className="btn btn-primary crystal-cta">
                  Create your website now
                </Link>
                <Link
                  href="/preview?from=marketing"
                  className="btn btn-outline-primary crystal-cta-outline crystal-action-preview-btn"
                >
                  Preview
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Tutorial */}
      <section id="tutorial" className="crystal-section crystal-tutorial py-5 crystal-section-bg">
        <Container data-crystal-reveal>
          <Row className="g-4 align-items-center">
            <Col lg={hasHomepageTutorialVideo ? 6 : 8} className={hasHomepageTutorialVideo ? undefined : 'mx-auto'}>
              <p className="crystal-section-kicker text-primary fw-semibold text-uppercase small mb-2">
                Build it fast
              </p>
              <h2 className="crystal-section-title display-6 fw-bold mb-3">
                Learn how to build your website by filling in simple data
              </h2>
              <p className="text-muted mb-4">
                Follow the quick tutorial, add your business details, and let the website come together step by step.
              </p>
              <div className="crystal-how-grid">
                {HOW_IT_WORKS.map((step, index) => (
                  <Card key={step.title} className="crystal-how-card">
                    <Card.Body className="d-flex gap-3">
                      <div className="crystal-how-step">{index + 1}</div>
                      <div>
                        <Card.Title className="h6 mb-1">{step.title}</Card.Title>
                        <Card.Text className="small text-muted mb-0">{step.text}</Card.Text>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
            {hasHomepageTutorialVideo && (
              <Col lg={6}>
                <Card className="crystal-video-card">
                  <div className="crystal-video-frame">
                    <iframe
                      src={homepageTutorialEmbedUrl}
                      title="Website tutorial video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <Card.Body>
                    <Card.Title className="h5 mb-2">Watch the setup tutorial</Card.Title>
                    <Card.Text className="text-muted mb-0">
                      Use the video as a guide, then fill in the data and launch your site with confidence.
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Container>
      </section>

      {/* About */}
      <section id="about" className="crystal-section crystal-about py-5 crystal-section-bg">
        <Container data-crystal-reveal>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="crystal-section-title display-6 fw-bold mb-2">{ABOUT.title}</h2>
              <p className="text-primary fw-medium mb-3">{ABOUT.tagline}</p>
              <div className="crystal-about__vision-mission text-start mx-auto mb-4">
                <h3 className="crystal-about__vm-heading h6 text-uppercase fw-semibold text-primary mb-2">
                  Our vision
                </h3>
                <p className="text-muted mb-4 mb-lg-5">{ABOUT.vision}</p>
                <h3 className="crystal-about__vm-heading h6 text-uppercase fw-semibold text-primary mb-2">
                  Our mission
                </h3>
                {ABOUT.mission.map((paragraph, i) => (
                  <p
                    key={paragraph}
                    className={`text-muted ${i < ABOUT.mission.length - 1 ? 'mb-2' : 'mb-0'}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <p className="text-muted mb-4">{ABOUT.description}</p>
              <Row className="g-3 justify-content-center">
                {ABOUT.stats.map(({ value, label }) => (
                  <Col xs="auto" key={label}>
                    <div className="crystal-stat rounded-3 p-3 text-center">
                      <span className="d-block crystal-stat-value text-primary">{value}</span>
                      <span className="small text-muted">{label}</span>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Horizontal scroll: Testimonials (auto-scroll, loops back to start) */}
      <section className="crystal-scroll-section crystal-scroll-testimonials" data-crystal-reveal>
        <div ref={testimonialsScrollRef} className="crystal-scroll-inner">
          {TESTIMONIALS_SCROLL.map((t, i) => (
            <Card key={i} className="crystal-scroll-card crystal-testimonial flex-shrink-0">
              <Card.Body className="text-center">
                <blockquote className="mb-2">"{t.quote}"</blockquote>
                <footer className="text-muted small">— {t.author}</footer>
              </Card.Body>
            </Card>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="crystal-section crystal-packages py-5">
        <Container data-crystal-reveal>
          <h2 className="crystal-section-title text-center display-6 fw-bold mb-2">Pricing</h2>
          <p className="text-center text-muted mb-4">
            Get now for just the price that fits your launch. Upgrade or downgrade anytime.
          </p>
          <p className="text-center crystal-pricing-trust mb-2">
            <span className="crystal-trust-badge">Used by 100+ gyms</span>
          </p>
          <div className="text-center crystal-pricing-trust mb-4">
            <span className="crystal-trust-item">Free trial</span>
            <span className="crystal-trust-sep" aria-hidden>·</span>
            <span className="crystal-trust-item">No credit card required</span>
            <span className="crystal-trust-sep" aria-hidden>·</span>
            <span className="crystal-trust-item fw-semibold">Cancel anytime</span>
          </div>
          <div className="text-center mb-4" data-crystal-reveal>
            <Link href="/user/create-website" className="crystal-pricing-trial-cta">
              Start 7 day free trial now
            </Link>
          </div>
          <div
            ref={packagesScrollRef}
            className="crystal-packages-scroll"
            role="region"
            aria-label="Payment plans carousel"
          >
            <div className="crystal-packages-inner">
              {packagesToRender.map((pkg) => (
                <Card
                  key={pkg.id}
                  data-plan-id={pkg.id}
                  className={`crystal-package-card flex-shrink-0 ${pkg.popular ? 'border-primary' : ''}`}
                >
                  {pkg.popular && !pkg.comingSoon && (
                    <div className="crystal-package-badge bg-primary text-white small py-1">Popular</div>
                  )}
                  {pkg.comingSoon && (
                    <div className="crystal-package-badge crystal-package-badge--soon text-white small py-1">
                      Coming soon
                    </div>
                  )}
                  <Card.Body className="text-center crystal-package-card__body">
                    <Card.Title className="h5">{pkg.name}</Card.Title>
                    {pkg.id === 'custom' ?
                      <div className="mb-2 crystal-package-price-wrap">
                        <span className="crystal-package-custom-price">Custom</span>
                        <p className="crystal-package-custom-teaser small text-muted mb-0 mt-2 px-1">
                          For <strong>service-based</strong> companies: share your requirements and we&apos;ll build a
                          site tailored to your business — not a DIY template.
                        </p>
                      </div>
                    : pkg.hidePrice ?
                      <div className="mb-3 crystal-package-price-wrap crystal-package-price-wrap--pro-soon">
                        <p className="crystal-package-pro-soon-title fw-bold text-primary mb-0">
                          {pkg.priceStatusMessage ?? 'Coming soon'}
                        </p>
                      </div>
                    : (
                      <div className="mb-3 crystal-package-price-wrap">
                        <PlanPriceDisplay
                          listFormatted={pkg.listPriceFormatted}
                          firstFormatted={pkg.firstActivationFormatted}
                          period={pkg.period}
                          showIntro={pkg.showIntroPrice}
                          size="lg"
                          className="text-center w-100"
                        />
                      </div>
                    )}
                    {pkg.features.length > 0 && (
                      <PlanFeatures planId={pkg.id} features={pkg.features} />
                    )}
                    {pkg.id === 'custom' && (
                      <Link
                        href="/services/custom"
                        className="btn btn-outline-primary btn-sm w-100 mt-3 crystal-package-custom-cta"
                      >
                        {pkg.cta}
                      </Link>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
          <p className="text-center mt-4 mb-0">
            <Link href="/plans" className="crystal-packages-seemore">
              See more →
            </Link>
          </p>
        </Container>
      </section>

      {/* FAQ — copy matches JSON-LD FAQPage on this route */}
      <section id="faq" className="crystal-section crystal-faq py-5 crystal-section-bg">
        <Container data-crystal-reveal>
          <h2 className="crystal-section-title text-center display-6 fw-bold mb-2">Common questions</h2>
          <p className="text-center text-muted mb-4 mx-auto" style={{ maxWidth: '36rem' }}>
            Quick answers about using Crystal to create a website for your gym or fitness studio.
          </p>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Accordion className="crystal-home-faq">
                {HOME_PAGE_FAQ.map((item, i) => (
                  <Accordion.Item eventKey={String(i)} key={item.question} className="crystal-home-faq__item border-0">
                    <Accordion.Header className="crystal-home-faq__header">{item.question}</Accordion.Header>
                    <Accordion.Body className="text-muted pt-0">{item.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contacts */}
      <section id="contacts" className="crystal-section crystal-contacts py-5 crystal-section-bg crystal-contacts--pro">
        <Container data-crystal-reveal>
          <header className="crystal-contacts__header text-center mx-auto">
            <h2 className="crystal-contacts__title">{CONTACTS.title}</h2>
            {CONTACTS.subtitle ?
              <p className="crystal-contacts__subtitle">{CONTACTS.subtitle}</p>
            : null}
          </header>
          <Row className="justify-content-center g-4 crystal-contacts-row">
            {CONTACTS.items.map(({ type, value, href }) => (
              <Col md={4} key={type} className="d-flex">
                <article className="crystal-contact-card w-100 text-center">
                  <div className="crystal-contact-card__icon-wrap">
                    {type === 'WhatsApp' && href ?
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="crystal-contact-card__icon-btn crystal-contact-card__icon-btn--whatsapp"
                        aria-label="Chat on WhatsApp"
                      >
                        <WhatsAppLogoIcon className="crystal-contact-card__wa-logo" />
                      </a>
                    : type === 'WhatsApp' ?
                      <div
                        className="crystal-contact-card__icon-disk crystal-contact-card__icon-disk--whatsapp-muted"
                        aria-hidden
                      >
                        <WhatsAppLogoIcon className="crystal-contact-card__wa-logo" />
                      </div>
                    : type === 'Email' ?
                      <div className="crystal-contact-card__icon-disk crystal-contact-card__icon-disk--email">
                        <CrystalContactMailGlyph className="crystal-contact-card__glyph" />
                      </div>
                    : (
                      <div className="crystal-contact-card__icon-disk crystal-contact-card__icon-disk--phone">
                        <CrystalContactPhoneGlyph className="crystal-contact-card__glyph" />
                      </div>
                    )}
                  </div>
                  <h3 className="crystal-contact-card__label">{type}</h3>
                  <div className="crystal-contact-card__value">
                    {type === 'WhatsApp' && href ?
                      <a href={href} target="_blank" rel="noopener noreferrer" className="crystal-contact-card__link">
                        {value}
                      </a>
                    : href ?
                      <a href={href} className="crystal-contact-card__link">
                        {value}
                      </a>
                    : (
                      <span className="crystal-contact-card__text">{value}</span>
                    )}
                  </div>
                </article>
              </Col>
            ))}
          </Row>
          <div className="crystal-contacts__cta-wrap text-center">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="crystal-contacts__enquiry-btn"
              onClick={openEnquiryModal}
            >
              Send an enquiry
            </Button>
          </div>
        </Container>
      </section>
    </main>
    {scrollFabMounted &&
      createPortal(
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
        </button>,
        document.body
      )}
    </>
  );
}
