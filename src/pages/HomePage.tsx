import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { getPlanList, type PlanListItem } from '../api';
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
    cta: paymentSlug ? (slug === 'pro' ? 'Start free trial' : 'Get started') : 'Contact sales',
    paymentSlug,
    popular: index === 1,
  };
}

const ABOUT = {
  title: 'About Crystal',
  tagline: 'Clarity in every experience.',
  description:
    'Crystal is a product-first company focused on premium software and services. We combine elegant design with powerful functionality to help businesses and individuals achieve more.',
  stats: [
    { value: '50K+', label: 'Active users' },
    { value: '500+', label: 'Partner brands' },
    { value: '4.9', label: 'Rating' },
  ],
};

const CONTACTS = {
  title: 'Get in Touch',
  items: [
    { type: 'Email', value: 'hello@crystal.io', href: 'mailto:hello@crystal.io' },
    { type: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { type: 'Address', value: '123 Crystal Ave, San Francisco, CA 94102' },
  ],
};

const FEATURES_SCROLL = [
  { icon: '◇', title: 'Fast', text: 'Lightning performance' },
  { icon: '◆', title: 'Secure', text: 'Enterprise-grade security' },
  { icon: '◇', title: 'Scalable', text: 'Grows with you' },
  { icon: '◆', title: 'Support', text: '24/7 assistance' },
  { icon: '◇', title: 'Integrations', text: 'Connect your tools' },
];

const TESTIMONIALS_SCROLL = [
  { quote: 'Crystal transformed how we work.', author: 'Jane D., CTO' },
  { quote: 'Clean, fast, and reliable.', author: 'Mike T., Founder' },
  { quote: 'Best investment we made this year.', author: 'Sarah L., PM' },
  { quote: 'Support team is outstanding.', author: 'Alex K., Dev Lead' },
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

  useEffect(() => {
    const saved = sessionStorage.getItem('crystalReturnScroll');
    if (saved !== null) {
      sessionStorage.removeItem('crystalReturnScroll');
      const y = parseInt(saved, 10);
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, []);

  useEffect(() => {
    if (!selectedPackageId) return;
    const container = packagesScrollRef.current;
    if (!container) return;
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
                Premium software &amp; services
              </p>
              <h1 className="crystal-hero-title display-4 fw-bold mb-3">
                Welcome to Crystal
              </h1>
              <p className="crystal-hero-tagline lead mb-4 mx-auto">
                Clarity in design. Power in simplicity. Build what matters.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Button href="#packages" variant="primary" size="lg" className="crystal-cta">
                  View packages
                </Button>
                <Button href="#about" variant="outline-light" size="lg" className="crystal-cta-outline">
                  Learn more
                </Button>
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
          <h2 className="crystal-section-title text-center display-6 fw-bold mb-2">Packages</h2>
          <p className="text-center text-muted mb-4">
            Choose the plan that fits. Upgrade or downgrade anytime.
          </p>
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
          <h2 className="crystal-section-title text-center display-6 fw-bold mb-4">{CONTACTS.title}</h2>
          <Row className="justify-content-center g-3">
            {CONTACTS.items.map(({ type, value, href }) => (
              <Col md={4} key={type} className="text-center">
                <div className="p-3 bg-white rounded-3 shadow-sm">
                  <span className="d-block fw-semibold text-primary small text-uppercase">{type}</span>
                  {href ? (
                    <a href={href} className="text-dark text-decoration-none">{value}</a>
                  ) : (
                    <span className="text-dark">{value}</span>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </main>
  );
}
