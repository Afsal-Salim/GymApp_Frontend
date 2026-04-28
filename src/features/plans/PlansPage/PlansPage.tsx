'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { PageContainer, PaymentLoginRequiredModal, PlanPriceDisplay } from '@/components';
import type { CheckoutRedirect } from '@/components';
import {
  getAccessToken,
  getPlanList,
  getBusinessFirstRecharge,
  formatPlanPrice,
  type PlanListItem,
  type BusinessFirstRechargeResponse,
  type BusinessFirstRechargeStarter,
} from '@/api';
import { SESSION_PAYMENT_CHECKOUT_DRAFT } from '@/config/storageKeys';
import { PRO_PLAN_FEATURE_FALLBACKS, STARTER_PLAN_FEATURE_FALLBACKS } from '../planFeatureFallbacks/planFeatureFallbacks';
import './PlansPage.css';

/** Path for the standalone plans page – used for redirects when subscription is inactive. */
export const PLANS_PAGE_PATH = '/plans';
/** Custom / service enquiry landing (contacts + form). */
export const SERVICES_CUSTOM_PATH = '/services/custom';

type DisplayPlan = {
  id: string;
  name: string;
  listPriceFormatted: string;
  firstActivationFormatted: string | null;
  showIntroPrice: boolean;
  primaryLineForCheckout: string;
  period: string;
  currency: string;
  features: string[];
  cta: string;
  paymentSlug: 'starter' | 'pro' | null;
  popular: boolean;
  comingSoon: boolean;
  /** Backend plan_id for create-order (Starter may match first-recharge block). */
  checkoutPlanId: number;
};

function mapPlanToDisplay(
  apiPlan: PlanListItem,
  eligibleFirstPrice: boolean,
  firstRecharge: BusinessFirstRechargeResponse | null
): DisplayPlan {
  const slug = apiPlan.name.toLowerCase();
  const comingSoon = apiPlan.coming_soon === true;
  const paymentSlug =
    comingSoon ? null : slug === 'starter' || slug === 'pro' ? (slug as 'starter' | 'pro') : null;

  const st: BusinessFirstRechargeStarter | null =
    firstRecharge?.starter && apiPlan.id === firstRecharge.starter.plan_id ? firstRecharge.starter : null;

  const useStarterPricing = Boolean(st);

  let listPriceFormatted: string;
  let firstActivationFormatted: string | null;
  let currency: string;
  let showIntroPrice: boolean;
  let primaryLineForCheckout: string;
  let checkoutPlanId: number;

  if (useStarterPricing && st) {
    currency = st.currency;
    listPriceFormatted = formatPlanPrice(st.list_price, currency);
    const firstRaw = st.first_recharge_price?.trim();
    const firstNum = firstRaw ? Number(firstRaw) : NaN;
    firstActivationFormatted =
      firstRaw && Number.isFinite(firstNum) && firstNum > 0 ? formatPlanPrice(firstRaw, currency) : null;
    const appN = Number(st.applicable_price);
    const listN = Number(st.list_price);
    showIntroPrice =
      eligibleFirstPrice &&
      !comingSoon &&
      firstActivationFormatted !== null &&
      Number.isFinite(appN) &&
      Number.isFinite(listN) &&
      appN < listN;
    primaryLineForCheckout = formatPlanPrice(st.applicable_price, currency);
    checkoutPlanId = st.plan_id;
  } else {
    currency = apiPlan.currency ?? 'INR';
    listPriceFormatted = formatPlanPrice(apiPlan.price, apiPlan.currency);
    const firstRaw = apiPlan.first_activation_price?.trim();
    const firstNum = firstRaw ? Number(firstRaw) : NaN;
    firstActivationFormatted =
      firstRaw && Number.isFinite(firstNum) && firstNum > 0 ?
        formatPlanPrice(firstRaw, apiPlan.currency)
      : null;
    showIntroPrice = Boolean(firstActivationFormatted) && eligibleFirstPrice && !comingSoon;
    primaryLineForCheckout =
      showIntroPrice && firstActivationFormatted ? firstActivationFormatted : listPriceFormatted;
    checkoutPlanId = apiPlan.id;
  }

  const period = apiPlan.duration ? ` / ${apiPlan.duration} days` : '';

  const featureNamesFromApi = apiPlan.features?.map((f) => f.name) ?? [];
  const features =
    featureNamesFromApi.length > 0 ? featureNamesFromApi
    : slug === 'pro' ? PRO_PLAN_FEATURE_FALLBACKS
    : slug === 'starter' ? STARTER_PLAN_FEATURE_FALLBACKS
    : [];

  return {
    id: String(apiPlan.id),
    name: apiPlan.name,
    listPriceFormatted,
    firstActivationFormatted,
    showIntroPrice,
    primaryLineForCheckout,
    period,
    currency,
    features,
    cta:
      comingSoon ? 'Coming soon'
      : paymentSlug ?
        slug === 'pro' ?
          'Start free trial'
        : 'Get started'
      : 'Contact sales',
    paymentSlug,
    popular: slug === 'pro' && !comingSoon,
    comingSoon,
    checkoutPlanId,
  };
}

const CUSTOM_PLAN: DisplayPlan = {
  id: 'custom',
  name: 'Custom build',
  listPriceFormatted: 'Custom',
  firstActivationFormatted: null,
  showIntroPrice: false,
  primaryLineForCheckout: 'Custom',
  period: '',
  currency: 'INR',
  features: [
    'For service-based businesses — not limited to gyms',
    'You describe goals & requirements; we build the website for you',
    'Custom layout, branding, and integrations to match how you work',
    'Dedicated scoping, build, and launch support',
  ],
  cta: 'Tell us what you need',
  paymentSlug: null,
  popular: false,
  comingSoon: false,
  checkoutPlanId: 0,
};

function normalizePlansBusinessSlug(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const t = raw.trim().replace(/^\/+/, '');
  return t || undefined;
}

type PlansPageProps = {
  /** From RSC + `fetchPlanListForServer` (ISR). Empty → client falls back to `getPlanList()`. */
  initialPlans?: PlanListItem[];
  plansServerError?: string | null;
};

export default function PlansPage({
  initialPlans = [],
  plansServerError = null,
}: PlansPageProps = {}) {
  const router = useRouter();
  const params = useParams<{ businessSlug?: string }>();
  const businessSlugParam = typeof params.businessSlug === 'string' ? params.businessSlug : undefined;
  const plansBusinessSlug = normalizePlansBusinessSlug(businessSlugParam);
  const [rawPlans, setRawPlans] = useState<PlanListItem[]>(initialPlans);
  const [firstRecharge, setFirstRecharge] = useState<BusinessFirstRechargeResponse | null>(null);
  const [eligibleFirstPrice, setEligibleFirstPrice] = useState(true);
  const [loading, setLoading] = useState(initialPlans.length === 0);
  const [error, setError] = useState<string | null>(plansServerError);
  const [paymentLoginModalShow, setPaymentLoginModalShow] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<CheckoutRedirect | null>(null);

  const plans = useMemo(
    () => [...rawPlans.map((p) => mapPlanToDisplay(p, eligibleFirstPrice, firstRecharge)), CUSTOM_PLAN],
    [rawPlans, eligibleFirstPrice, firstRecharge]
  );

  useEffect(() => {
    if (initialPlans.length > 0) return;
    let cancelled = false;
    getPlanList()
      .then((data) => {
        if (!cancelled) {
          setRawPlans(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load plans');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialPlans.length]);

  useEffect(() => {
    if (!plansBusinessSlug || !getAccessToken()) {
      setFirstRecharge(null);
      setEligibleFirstPrice(true);
      return;
    }
    let cancelled = false;
    getBusinessFirstRecharge(plansBusinessSlug)
      .then((d) => {
        if (!cancelled) {
          setFirstRecharge(d);
          setEligibleFirstPrice(d.is_first_recharge);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFirstRecharge(null);
          setEligibleFirstPrice(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [plansBusinessSlug]);

  const handleSelectPlan = (pkg: DisplayPlan) => {
    if (!pkg.paymentSlug || pkg.comingSoon) return;
    const pathname = `/${pkg.paymentSlug}`;
    const planId = pkg.checkoutPlanId > 0 ? pkg.checkoutPlanId : Number(pkg.id);
    const navState = {
      planDetails: {
        name: pkg.name,
        price: pkg.primaryLineForCheckout,
        period: pkg.period,
        currency: pkg.currency,
        listPriceFormatted: pkg.listPriceFormatted,
        firstActivationFormatted: pkg.showIntroPrice ? pkg.firstActivationFormatted : null,
      },
      planId,
      ...(plansBusinessSlug ? { businessSlug: plansBusinessSlug } : {}),
    };
    if (!getAccessToken()) {
      setPendingCheckout({ pathname, state: navState });
      setPaymentLoginModalShow(true);
      return;
    }
    try {
      sessionStorage.setItem(SESSION_PAYMENT_CHECKOUT_DRAFT, JSON.stringify(navState));
    } catch {
      /* quota */
    }
    router.push(pathname);
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
            {plansBusinessSlug && getAccessToken() ?
              <p className="plans-page__first-price-hint text-muted small mb-0 mt-2">
                {eligibleFirstPrice ?
                  'First recharge pricing applies — no subscription on this gym yet (matches checkout).'
                : 'This gym has had a subscription — standard list price applies at checkout.'}
              </p>
            : null}
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
            <Row xs={1} md={2} lg={3} className="g-4 justify-content-center align-items-stretch plans-page__row">
              {plans.map((pkg) => (
                <Col key={pkg.id} className="plans-page__col">
                  <Card className={`plans-page__card w-100 ${pkg.popular ? 'plans-page__card--popular' : ''}`}>
                    {pkg.popular && <div className="plans-page__badge">Popular</div>}
                    {pkg.comingSoon && <div className="plans-page__badge plans-page__badge--soon">Soon</div>}
                    <Card.Body className="plans-page__card-body d-flex flex-column">
                      <Card.Title className="h5 plans-page__card-title">{pkg.name}</Card.Title>
                      {pkg.id === 'custom' ?
                        <>
                          <div className="mb-2">
                            <span className="plans-page__price plans-page__price--custom">Custom</span>
                          </div>
                          <p className="plans-page__custom-teaser small text-muted mb-3">
                            <strong>Service-based companies:</strong> this option is for businesses that want a site
                            built around their offering — you share what you need (services, audience, must-haves), and
                            our team designs and delivers it. Standard plans are great for gyms; this path is for
                            custom service setups.
                          </p>
                        </>
                      : (
                        <div className="mb-3 plans-page__price-block">
                          <PlanPriceDisplay
                            listFormatted={pkg.listPriceFormatted}
                            firstFormatted={pkg.firstActivationFormatted}
                            period={pkg.period}
                            showIntro={pkg.showIntroPrice}
                            size="md"
                          />
                        </div>
                      )}
                      {pkg.features.length > 0 && (
                        <ul className="plans-page__features list-unstyled">
                          {pkg.features.map((name, idx) => (
                            <li key={idx} className="plans-page__feature-item">
                              <span className="plans-page__feature-check" aria-hidden>
                                ✓
                              </span>
                              <span className="plans-page__feature-text">{name}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card.Body>
                    <Card.Footer className="plans-page__card-cta">
                      {pkg.id === 'custom' ?
                        <Link href={SERVICES_CUSTOM_PATH} className="btn btn-primary w-100">
                          {pkg.cta}
                        </Link>
                      : pkg.paymentSlug ?
                        <Button
                          variant={pkg.popular ? 'primary' : 'outline-primary'}
                          className="w-100"
                          onClick={() => handleSelectPlan(pkg)}
                        >
                          {pkg.cta}
                        </Button>
                      : (
                        <Button variant="outline-secondary" className="w-100" disabled>
                          {pkg.cta}
                        </Button>
                      )}
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <p className="text-center mt-4">
            <Link href="/" className="text-muted small">
              ← Back to home
            </Link>
          </p>
        </Container>
      </main>
    </PageContainer>
  );
}
