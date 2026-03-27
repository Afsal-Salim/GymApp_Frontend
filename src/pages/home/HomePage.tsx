import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { getPlanList, DUMMY_BUSINESS_SLUG, type PlanListItem } from '../../api';
import { homepageTutorialVideoUrl, whatsappDefaultMessage, whatsappPhone } from '../../config/env';
import { WhatsAppLogoIcon } from '../../components';
import './HomePage.css';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

function formatPrice(price: string, currency?: string): string {
  const num = Number(price);
  const symbol = currency && CURRENCY_SYMBOLS[currency] ? CURRENCY_SYMBOLS[currency] : currency ?? '₹';
  return `${symbol}${num.toFixed(0)}`;
}

type DisplayPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  currency: string;
  features: string[];
  cta: string;
  paymentSlug: 'starter' | 'pro' | null;
  popular: boolean;
};

function mapPlanToDisplay(apiPlan: PlanListItem, index: number): DisplayPlan {
  const slug = apiPlan.name.toLowerCase() as string;
  const paymentSlug = slug === 'starter' || slug === 'pro' ? (slug as 'starter' | 'pro') : null;
  const priceFormatted = formatPrice(apiPlan.price, apiPlan.currency);
  const period = apiPlan.duration ? ` / ${apiPlan.duration} days` : '';
  return {
    id: String(apiPlan.id),
    name: apiPlan.name,
    price: priceFormatted,
    period,
    currency: apiPlan.currency ?? 'INR',
    features: apiPlan.features?.map((f) => f.name) ?? [],
    cta: paymentSlug ? `Get now for ${priceFormatted}` : 'Contact sales',
    paymentSlug,
    popular: index === 1,
  };
}

const HERO_BADGE = 'Website builder';
const HERO_TITLE = 'Create Your Gym Website in Minutes';
const HERO_TAGLINE =
  'No Coding Required. Get more members, manage bookings, and grow your gym online.';
const HERO_POINTS = [
    'Enter your gym details in minutes',
    'Preview your site before publishing',
    'Go live with one click',
  ];

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
    description:
      'Crystal turns your gym details into a professional website in minutes. No coding, no complexity—just a simple way to get your business online and attract more members.',
    stats: [
      { value: '3', label: 'Simple steps to launch' },
      { value: '<5 min', label: 'Setup time' },
      { value: '0', label: 'Technical skills needed' },
    ],
  };

const WHATSAPP_HREF = whatsappPhone
  ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappDefaultMessage)}`
  : '';

const CONTACTS = {
    title: 'Need help getting started?',
    subtitle: 'Our team is here to help you launch your gym website smoothly.',
    whatsappHref: WHATSAPP_HREF,
    items: [
      { type: 'Email', value: 'support@crystal.io', href: 'mailto:support@crystal.io' },
      { type: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
      { type: 'WhatsApp', value: 'Chat with us instantly', href: WHATSAPP_HREF },
    ],
  };

const FEATURES_SCROLL = [
    { icon: '◇', title: 'Add your details', text: 'Enter your gym info in minutes' },
    { icon: '◆', title: 'Live preview', text: 'See your website update instantly' },
    { icon: '◇', title: 'One-click publish', text: 'Go live without any setup' },
    { icon: '◆', title: 'Edit anytime', text: 'Update content whenever you need' },
    { icon: '◇', title: 'Built-in support', text: 'Get help whenever you need it' },
  ];

const TESTIMONIALS_SCROLL = [
    { quote: 'We launched our gym website in under 10 minutes. Super आसान!', author: 'Rahul S., Gym Owner' },
    { quote: 'Didn’t expect it to be this simple. No developer needed at all.', author: 'Ankit P., Fitness Studio' },
    { quote: 'The live preview feature is amazing—we could see everything instantly.', author: 'Sneha R., Trainer' },
    { quote: 'Perfect solution for small gyms wanting to go online quickly.', author: 'Faisal K., Gym Manager' },
  ];
  
const CUSTOM_PLAN: DisplayPlan = {
  id: 'custom',
  name: 'Custom',
  price: 'Custom',
  period: '',
  currency: 'INR',
  features: ['Everything in Pro', 'Multi-team', 'API access', 'Dedicated success manager'],
  cta: 'Contact sales',
  paymentSlug: null,
  popular: false,
};

const TUTORIAL_VIDEO_URL = homepageTutorialVideoUrl;

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

const TUTORIAL_EMBED_URL = getYoutubeEmbedUrl(TUTORIAL_VIDEO_URL);

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
  const [showArrow, setShowArrow] = useState(false);

  const updateArrowVisibility = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const hasMore = el.scrollHeight > el.clientHeight + 2;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    setShowArrow(hasMore && !atBottom);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateArrowVisibility();
    const ro = new ResizeObserver(updateArrowVisibility);
    ro.observe(el);
    el.addEventListener('scroll', updateArrowVisibility);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', updateArrowVisibility);
    };
  }, [features.length, updateArrowVisibility]);

  return (
    <div className="crystal-package-features-wrapper">
      <div className="crystal-package-features" ref={containerRef}>
        <ul className="list-unstyled small text-start mb-0">
          {features.map((name, idx) => (
            <li key={`${planId}-${idx}`} className="mb-1">✓ {name}</li>
          ))}
        </ul>
      </div>
      {showArrow && (
        <button
          type="button"
          className="crystal-features-scroll-down"
          onClick={(e) => {
            e.stopPropagation();
            containerRef.current?.scrollBy({ top: 80, behavior: 'smooth' });
          }}
          aria-label="Scroll features down"
        >
          <span className="crystal-chevron-down" aria-hidden>▼</span>
        </button>
      )}
    </div>
  );
}

const PACKAGES_AUTOPLAY_MS = 3000;
const PACKAGES_LOOP_BREAKPOINT = 992;
const FEATURES_AUTOPLAY_MS = 3000;
const TESTIMONIALS_AUTOPLAY_MS = 3000;

export default function HomePage() {
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
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
  const location = useLocation();

  /* Scroll to section when user clicks an in-page link with hash (not on initial open). */
  const isInitialLoadRef = useRef(true);
  useEffect(() => {
    const hash = location.hash?.replace(/^#/, '');
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    if (!hash) return;
    const id = setTimeout(() => {
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => clearTimeout(id);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const check = () => setPackagesScrollMode(window.innerWidth < PACKAGES_LOOP_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getPlanList()
      .then((data) => {
        if (cancelled) return;
        const mapped = data.map((p, i) => mapPlanToDisplay(p, i));
        setPlans([...mapped, CUSTOM_PLAN]);
      })
      .catch((err) => {
        if (!cancelled) setPlansError(err instanceof Error ? err.message : 'Failed to load plans');
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  /* Always open homepage from the top; clear any saved scroll position and hash. */
  useEffect(() => {
    sessionStorage.removeItem('crystalReturnScroll');
    window.scrollTo(0, 0);
    if (location.hash && location.pathname === '/') {
      window.history.replaceState(null, '', location.pathname + location.search);
    }
  }, []);

  const [footerVisible, setFooterVisible] = useState(false);
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
    if (!el || !packagesScrollMode || plans.length === 0) return;

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
  }, [packagesScrollMode, plans.length]);

  const packagesToRender = plans;

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
      <section id="home" className="crystal-hero">
        <Container>
          <Row className="justify-content-center align-items-center text-center">
            <Col xs={12} lg={10} xl={8} className="py-5 py-lg-0">
              <p className="crystal-hero-subtitle crystal-hero-seq crystal-hero-seq--1 text-uppercase small fw-semibold mb-2 mb-md-3">
                {HERO_BADGE}
              </p>
              <h1 className="crystal-hero-title crystal-hero-seq crystal-hero-seq--2 display-4 fw-bold mb-3">
                {HERO_TITLE}
              </h1>
              <p className="crystal-hero-tagline crystal-hero-seq crystal-hero-seq--3 lead mb-4 mx-auto">
                {HERO_TAGLINE}
              </p>
              <div className="crystal-hero-seq crystal-hero-seq--4 d-flex flex-wrap gap-2 justify-content-center">
                <Button href="#packages" variant="primary" size="lg" className="crystal-cta">
                  View pricing
                </Button>
                <Button href="#tutorial" variant="outline-light" size="lg" className="crystal-cta-outline">
                  Watch tutorial
                </Button>
              </div>
              <div className="crystal-hero-points crystal-hero-seq crystal-hero-seq--5 mt-4">
                {HERO_POINTS.map((point) => (
                  <span key={point} className="crystal-hero-point">
                    <span className="crystal-hero-point-icon" aria-hidden>✓</span>
                    {point}
                  </span>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why a website helps your gym – right below hero */}
      <section id="value" className="crystal-section crystal-value py-5 crystal-section-bg">
        <Container data-crystal-reveal>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <p className="crystal-section-kicker text-primary fw-semibold text-uppercase small mb-2">Grow your gym</p>
              <h2 className="crystal-section-title display-6 fw-bold mb-3">
              Turn visitors into paying gym members with your own website.
              </h2>
              <p className="text-muted mb-4">
                A dedicated website builds trust, shows your classes and timings, and helps new members find you. Stand out with a polished online presence—no tech skills needed.
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
      <section className="crystal-section crystal-action-statement py-5">
        <Container data-crystal-reveal>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="crystal-action-title display-5 fw-bold mb-3">Build your gym website today.</h2>
              <p className="crystal-action-lead lead text-muted mb-4">
                No coding. Just add your details and go live. Start in minutes.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center crystal-action-btns">
                <Link to="/login" className="btn btn-primary btn-lg crystal-cta">
                  Create your website now
                </Link>
                <Link
                  to={`/${DUMMY_BUSINESS_SLUG}/`}
                  className="btn btn-outline-primary btn-lg crystal-cta-outline crystal-action-preview-btn"
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
            <Col lg={6}>
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
            <Col lg={6}>
              <Card className="crystal-video-card">
                <div className="crystal-video-frame">
                  <iframe
                    src={TUTORIAL_EMBED_URL}
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
          {plansError && (
            <Alert variant="warning" className="mb-4">
              {plansError}
            </Alert>
          )}
          {plansLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
              <p className="mt-2 text-muted small">Loading plans...</p>
            </div>
          ) : (
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
                    {pkg.popular && (
                      <div className="crystal-package-badge bg-primary text-white small py-1">Popular</div>
                    )}
                    <Card.Body className="text-center">
                      <Card.Title className="h5">{pkg.name}</Card.Title>
                      <div className="mb-3">
                        <span className="display-6 fw-bold">{pkg.price}</span>
                        <span className="text-muted">{pkg.period}</span>
                      </div>
                      {pkg.features.length > 0 && (
                        <PlanFeatures planId={pkg.id} features={pkg.features} />
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          )}
          <p className="text-center mt-4 mb-0">
            <Link to="/plans" className="crystal-packages-seemore">
              See more →
            </Link>
          </p>
        </Container>
      </section>

      {/* Floating scroll button – down until footer visible, then up */}
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

      {/* Contacts */}
      <section id="contacts" className="crystal-section crystal-contacts py-5 bg-light crystal-section-bg">
        <Container data-crystal-reveal>
          <h2 className="crystal-section-title text-center display-6 fw-bold mb-2">{CONTACTS.title}</h2>
          {CONTACTS.subtitle && (
            <p className="text-center text-muted mb-4">{CONTACTS.subtitle}</p>
          )}
          <Row className="justify-content-center g-3 crystal-contacts-row">
            {CONTACTS.items.map(({ type, value, href }) => (
              <Col md={4} key={type} className="d-flex">
                <div className="crystal-contact-card p-3 bg-white rounded-3 shadow-sm w-100 text-center">
                  <span className="d-block fw-semibold text-primary small text-uppercase crystal-contact-type">{type}</span>
                  <div className="crystal-contact-value mt-2">
                    {type === 'WhatsApp' && href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="crystal-whatsapp-logo-btn"
                        aria-label="Chat on WhatsApp"
                      >
                        <WhatsAppLogoIcon className="crystal-whatsapp-logo" />
                      </a>
                    ) : href ? (
                      <a href={href} className="text-dark text-decoration-none">{value}</a>
                    ) : (
                      <span className="text-dark">{value}</span>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
    </>
  );
}
