import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { getPlanList, DUMMY_BUSINESS_SLUG, type PlanListItem } from '../api';
import './HomePage.css';

function WhatsAppLogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
const HERO_TITLE = 'Hey, Want to built your own website?';
const HERO_TAGLINE =
  'Create your gym website in minutes—no coding, just launch.';
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

const WHATSAPP_PHONE = (import.meta.env.VITE_WHATSAPP_PHONE as string) ?? '';
const WHATSAPP_MESSAGE = (import.meta.env.VITE_WHATSAPP_MESSAGE as string) ?? 'Hello I am interested in your service';
const WHATSAPP_HREF = WHATSAPP_PHONE
  ? `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
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

const TUTORIAL_VIDEO_URL =
  import.meta.env.VITE_HOMEPAGE_TUTORIAL_VIDEO_URL ?? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

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
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [packagesScrollMode, setPackagesScrollMode] = useState(false);
  const packagesAutoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const packagesPausedRef = useRef(false);
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);
  const packagesScrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheel(featuresScrollRef);
  useHorizontalWheel(testimonialsScrollRef);
  useHorizontalWheel(packagesScrollRef);
  const navigate = useNavigate();
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
        if (mapped.length > 0 && !selectedPackageId) setSelectedPackageId(mapped[0].id);
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
    if (location.hash && (location.pathname === '/crystal' || location.pathname === '/')) {
      window.history.replaceState(null, '', location.pathname + location.search);
    }
  }, []);

  const isInitialPackageSelection = useRef(true);
  useEffect(() => {
    if (!selectedPackageId) return;
    const container = packagesScrollRef.current;
    if (!container) return;
    /* Only scroll to the selected plan when the user clicks a card, not on initial load. */
    if (isInitialPackageSelection.current) {
      isInitialPackageSelection.current = false;
      return;
    }
    const selectedEl = container.querySelector(`[data-plan-id="${selectedPackageId}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedPackageId]);

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
    <main className="crystal-home">
      {/* Hero section */}
      <section id="home" className="crystal-hero">
        <Container>
          <Row className="justify-content-center align-items-center text-center">
            <Col xs={12} lg={10} xl={8} className="py-5 py-lg-0">
              <p className="crystal-hero-subtitle text-uppercase small fw-semibold mb-2 mb-md-3">
                {HERO_BADGE}
              </p>
              <h1 className="crystal-hero-title display-4 fw-bold mb-3">
                {HERO_TITLE}
              </h1>
              <p className="crystal-hero-tagline lead mb-4 mx-auto">
                {HERO_TAGLINE}
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button href="#packages" variant="primary" size="lg" className="crystal-cta">
                  View pricing
                </Button>
                <Button href="#tutorial" variant="outline-light" size="lg" className="crystal-cta-outline">
                  Watch tutorial
                </Button>
              </div>
              <div className="crystal-hero-points mt-4">
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
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <p className="crystal-section-kicker text-primary fw-semibold text-uppercase small mb-2">Grow your gym</p>
              <h2 className="crystal-section-title display-6 fw-bold mb-3">
                Get more gym members with your own professional website
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
      <section className="crystal-scroll-section crystal-scroll-features">
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
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="crystal-action-title display-5 fw-bold mb-3">Create your website now</h2>
              <p className="crystal-action-lead lead text-muted mb-4">
                No coding. Just add your details and go live. Start in minutes.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center crystal-action-btns">
                <Link to="/login" className="btn btn-primary btn-lg crystal-cta">
                  Create your website now
                </Link>
                <Link
                  to={`/crystal/${DUMMY_BUSINESS_SLUG}/`}
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
        <Container>
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
        <Container>
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
      <section className="crystal-scroll-section crystal-scroll-testimonials">
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
        <Container>
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
                {packagesToRender.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <Card
                      key={pkg.id}
                      data-plan-id={pkg.id}
                      className={`crystal-package-card flex-shrink-0 ${pkg.popular ? 'border-primary' : ''} ${isSelected ? 'crystal-package-card--selected' : ''}`}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPackageId(pkg.id)}
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
                        {pkg.paymentSlug ? (
                          <Button
                            variant={isSelected || pkg.popular ? 'primary' : 'outline-primary'}
                            className="w-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              sessionStorage.setItem('crystalReturnScroll', String(window.scrollY));
                              navigate(`/${pkg.paymentSlug}`, {
                                state: {
                                  planDetails: { name: pkg.name, price: pkg.price, period: pkg.period, currency: pkg.currency },
                                  planId: Number(pkg.id),
                                },
                              });
                            }}
                          >
                            {pkg.cta}
                          </Button>
                        ) : (
                          <Button variant={isSelected || pkg.popular ? 'primary' : 'outline-primary'} className="w-100" onClick={(e) => e.stopPropagation()}>
                            {pkg.cta}
                          </Button>
                        )}
                      </Card.Body>
                    </Card>
                  );
                })}
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
        <span className="crystal-scroll-down-arrow" aria-hidden>{footerVisible ? '↑' : '↓'}</span>
      </button>

      {/* Contacts */}
      <section id="contacts" className="crystal-section crystal-contacts py-5 bg-light crystal-section-bg">
        <Container>
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
  );
}
