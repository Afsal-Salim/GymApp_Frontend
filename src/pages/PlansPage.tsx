import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { PageContainer, PaymentLoginRequiredModal } from '../components';
import type { CheckoutRedirect } from '../components';
import { getAccessToken } from '../api';
import { getPlanList, type PlanListItem } from '../api';
import './PlansPage.css';

/** Path for the standalone plans page – used for redirects when subscription is inactive. */
export const PLANS_PAGE_PATH = '/plans';

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

export default function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoginModalShow, setPaymentLoginModalShow] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<CheckoutRedirect | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPlanList()
      .then((data) => {
        if (!cancelled) setPlans([...data.map((p, i) => mapPlanToDisplay(p, i)), CUSTOM_PLAN]);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load plans');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSelectPlan = (pkg: DisplayPlan) => {
    if (!pkg.paymentSlug) return;
    const pathname = `/${pkg.paymentSlug}`;
    const navState = {
      planDetails: { name: pkg.name, price: pkg.price, period: pkg.period, currency: pkg.currency },
      planId: Number(pkg.id),
    };
    if (!getAccessToken()) {
      setPendingCheckout({ pathname, state: navState });
      setPaymentLoginModalShow(true);
      return;
    }
    navigate(pathname, { state: navState });
  };

  return (
    <PageContainer className="plans-page">
      <PaymentLoginRequiredModal
        show={paymentLoginModalShow}
        onHide={() => {
          setPaymentLoginModalShow(false);
          setPendingCheckout(null);
        }}
        checkout={pendingCheckout}
      />
      <main className="plans-page__main">
        <Container>
          <header className="plans-page__header text-center mb-5">
            <h1 className="plans-page__title">Choose your plan</h1>
            <p className="plans-page__subtitle text-muted">
              Subscribe to access your business dashboard. Upgrade or downgrade anytime.
            </p>
          </header>

          {error && (
            <Alert variant="warning" className="mb-4">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="plans-page__loading text-center py-5">
              <Spinner animation="border" role="status" />
              <p className="mt-2 text-muted small">Loading plans…</p>
            </div>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4 justify-content-center">
              {plans.map((pkg) => (
                <Col key={pkg.id}>
                  <Card className={`plans-page__card h-100 ${pkg.popular ? 'plans-page__card--popular' : ''}`}>
                    {pkg.popular && (
                      <div className="plans-page__badge">Popular</div>
                    )}
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h5">{pkg.name}</Card.Title>
                      <div className="mb-3">
                        <span className="plans-page__price">{pkg.price}</span>
                        <span className="text-muted">{pkg.period}</span>
                      </div>
                      {pkg.features.length > 0 && (
                        <ul className="plans-page__features list-unstyled mb-4">
                          {pkg.features.map((name, idx) => (
                            <li key={idx}>✓ {name}</li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-auto">
                        {pkg.paymentSlug ? (
                          <Button
                            variant={pkg.popular ? 'primary' : 'outline-primary'}
                            className="w-100"
                            onClick={() => handleSelectPlan(pkg)}
                          >
                            {pkg.cta}
                          </Button>
                        ) : (
                          <Button variant="outline-secondary" className="w-100" disabled>
                            {pkg.cta}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <p className="text-center mt-4">
            <Link to="/crystal" className="text-muted small">
              ← Back to home
            </Link>
          </p>
        </Container>
      </main>
    </PageContainer>
  );
}
