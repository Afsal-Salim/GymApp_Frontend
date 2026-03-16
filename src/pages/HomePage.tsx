import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './HomePage.css';

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

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$9',
    period: '/month',
    features: ['Up to 3 projects', 'Basic analytics', 'Email support'],
    cta: 'Get started',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/month',
    popular: true,
    features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom workflows'],
    cta: 'Start free trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Pro', 'Multi-team', 'API access', 'Dedicated success manager'],
    cta: 'Contact sales',
  },
];

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

export default function HomePage() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pro');
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);
  const packagesScrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheel(featuresScrollRef);
  useHorizontalWheel(testimonialsScrollRef);
  useHorizontalWheel(packagesScrollRef);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem('crystalReturnScroll');
    if (saved !== null) {
      sessionStorage.removeItem('crystalReturnScroll');
      const y = parseInt(saved, 10);
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
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

      {/* Horizontal scroll: Features */}
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

      {/* Horizontal scroll: Testimonials */}
      <section className="crystal-scroll-section crystal-scroll-testimonials">
        <div ref={testimonialsScrollRef} className="crystal-scroll-inner">
          {TESTIMONIALS_SCROLL.map((t, i) => (
            <Card key={i} className="crystal-scroll-card crystal-testimonial flex-shrink-0">
              <Card.Body>
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
          {/* Horizontal scroll on small, grid on large */}
          <div ref={packagesScrollRef} className="crystal-packages-scroll">
            <div className="crystal-packages-inner">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <Card
                    key={pkg.id}
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
                      <ul className="list-unstyled small text-start mb-3">
                        {pkg.features.map((f) => (
                          <li key={f} className="mb-1">✓ {f}</li>
                        ))}
                      </ul>
                      {(pkg.id === 'starter' || pkg.id === 'pro') ? (
                        <Button
                          variant={isSelected || pkg.popular ? 'primary' : 'outline-primary'}
                          className="w-100"
                          onClick={() => {
                        sessionStorage.setItem('crystalReturnScroll', String(window.scrollY));
                        navigate(`/${pkg.id}`);
                      }}
                        >
                          {pkg.cta}
                        </Button>
                      ) : (
                        <Button variant={isSelected || pkg.popular ? 'primary' : 'outline-primary'} className="w-100">
                          {pkg.cta}
                        </Button>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

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
