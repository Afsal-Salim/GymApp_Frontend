'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageContainer, PaymentLoginRequiredModal, PlanPriceDisplay } from '@/components';
import type { CheckoutRedirect } from '@/components';
import {
  createOrder,
  verifyPayment,
  getAccessToken,
  getUserInfo,
  getBusinessList,
  getPublicBusinessBySlug,
  PublicBusinessNotFoundError,
} from '@/api';
import type { VerifyPaymentRequest } from '@/api';
import { useToast } from '@/contexts/ToastContext/ToastContext';
import { publicSiteDomain } from '@/config/env';
import { SESSION_PAYMENT_CHECKOUT_DRAFT } from '@/config/storageKeys';
import './PaymentPage.css';

type PlanDetailsFallback = {
  name: string;
  price: string;
  period: string;
  currency: string;
  listPriceFormatted?: string;
  firstActivationFormatted?: string | null;
};

const FALLBACK_PLANS: Record<string, PlanDetailsFallback> = {
  base: {
    name: 'Base',
    price: '$499',
    period: ' / month',
    currency: 'USD',
    listPriceFormatted: '$499',
    firstActivationFormatted: null,
  },
};

/** Map plan slug to backend plan_id (adjust if your API uses different ids) */
const PLAN_SLUG_TO_ID: Record<string, number> = {
  base: 1,
};

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

/** Same rules as create-website / public gym URLs. */
const BUSINESS_SLUG_REGEX = /^([a-z0-9]+(?:-[a-z0-9]+)*)$/;

const SLUG_VERIFY_DEBOUNCE_MS = 450;

function useDebounced<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

type SlugVerifyStatus = 'idle' | 'checking' | 'found' | 'not-found' | 'invalid' | 'error';

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

type PaymentPageProps = {
  plan: 'base';
};

type PaymentCheckoutDraft = {
  planDetails?: PlanDetailsFallback;
  planId?: number;
  businessSlug?: string;
};

function consumePaymentCheckoutDraft(): PaymentCheckoutDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_PAYMENT_CHECKOUT_DRAFT);
    if (!raw) return null;
    sessionStorage.removeItem(SESSION_PAYMENT_CHECKOUT_DRAFT);
    return JSON.parse(raw) as PaymentCheckoutDraft;
  } catch {
    return null;
  }
}

export default function PaymentPage({ plan }: PaymentPageProps) {
  const [checkoutDraft] = useState(() => consumePaymentCheckoutDraft());
  const stateDetails = checkoutDraft?.planDetails;
  const statePlanId = checkoutDraft?.planId;
  const stateBusinessSlug = checkoutDraft?.businessSlug?.trim().replace(/^\/+/, '');
  const details: PlanDetailsFallback = stateDetails ?? FALLBACK_PLANS[plan];
  const summaryListFormatted = details.listPriceFormatted ?? details.price;
  const summaryFirstFormatted = details.firstActivationFormatted ?? null;
  const summaryShowIntro = Boolean(summaryFirstFormatted && summaryListFormatted !== summaryFirstFormatted);

  const [email, setEmail] = useState('');
  const [businessSlug, setBusinessSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(() => !getAccessToken());
  const [slugStatus, setSlugStatus] = useState<SlugVerifyStatus>('idle');
  const slugReqId = useRef(0);
  const { showToast } = useToast();

  const planId = statePlanId ?? PLAN_SLUG_TO_ID[plan] ?? 1;

  const debouncedSlugNorm = useDebounced(businessSlug.trim().toLowerCase(), SLUG_VERIFY_DEBOUNCE_MS);

  useEffect(() => {
    const s = debouncedSlugNorm;
    if (!s) {
      setSlugStatus('idle');
      return;
    }
    if (s.length < 2 || s.length > 48 || !BUSINESS_SLUG_REGEX.test(s)) {
      setSlugStatus('invalid');
      return;
    }
    const id = ++slugReqId.current;
    setSlugStatus('checking');
    getPublicBusinessBySlug(s)
      .then(() => {
        if (slugReqId.current === id) setSlugStatus('found');
      })
      .catch((err) => {
        if (slugReqId.current !== id) return;
        if (err instanceof PublicBusinessNotFoundError) setSlugStatus('not-found');
        else setSlugStatus('error');
      });
  }, [debouncedSlugNorm]);

  const pathname = usePathname();
  const checkoutRedirect = useMemo(
    (): CheckoutRedirect => ({
      pathname: pathname || `/payment/${plan}`,
      state: {
        planDetails: details,
        planId,
        businessSlug: businessSlug.trim() || stateBusinessSlug || undefined,
      },
    }),
    [pathname, plan, details, planId, businessSlug, stateBusinessSlug]
  );

  useEffect(() => {
    if (stateBusinessSlug) {
      setBusinessSlug(stateBusinessSlug);
    }
    if (getAccessToken()) {
      const user = getUserInfo();
      if (user.email) setEmail(user.email);
      if (!stateBusinessSlug) {
        getBusinessList()
          .then((list) => {
            const first = list?.[0];
            if (first?.slug) setBusinessSlug(first.slug);
          })
          .catch(() => {});
      }
    }
  }, [stateBusinessSlug]);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollToTop();
    const id = requestAnimationFrame(() => {
      scrollToTop();
      requestAnimationFrame(scrollToTop);
    });
    return () => cancelAnimationFrame(id);
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!getAccessToken()) {
      setLoginModalOpen(true);
      showToast('Please log in to continue to checkout.');
      return;
    }
    const emailVal = email.trim();
    const slug = businessSlug.trim().toLowerCase();
    if (!emailVal) {
      setError('Please enter your email.');
      return;
    }
    if (!slug) {
      setError('Please enter your business slug.');
      return;
    }
    if (slug.length < 2 || slug.length > 48 || !BUSINESS_SLUG_REGEX.test(slug)) {
      setError('Use a valid slug: 2–48 characters, lowercase letters, numbers, and hyphens only.');
      return;
    }
    if (slugStatus !== 'found') {
      setError('This slug is not registered. Enter the slug for an existing gym page.');
      return;
    }
    try {
      await getPublicBusinessBySlug(slug);
    } catch (err) {
      if (err instanceof PublicBusinessNotFoundError) {
        setError('No business found for that slug.');
        showToast('No business found for that slug.');
        return;
      }
      const msg = 'Could not verify your slug. Try again.';
      setError(msg);
      showToast(msg);
      return;
    }

    setLoading(true);
    try {
      const orderData = await createOrder(emailVal, slug, planId);
      const keyId = orderData.key_id;
      if (!orderData.order_id || !keyId) {
        const msg = 'Invalid response from server.';
        setError(msg);
        showToast(msg);
        setLoading(false);
        return;
      }

      await loadRazorpayScript();
      const Razorpay = (window as unknown as { Razorpay: new (o: RazorpayOptions) => RazorpayInstance }).Razorpay;

      const rzp = new Razorpay({
        key: keyId,
        order_id: orderData.order_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: details?.name ?? 'Crystal',
        description: `Payment for ${details?.name ?? plan}`,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const payload: VerifyPaymentRequest = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            email: emailVal,
            business_slug: slug,
            plan_id: planId,
          };
          try {
            await verifyPayment(payload);
            setSuccess(true);
            setLoading(false);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Payment verification failed.';
            setError(msg);
            showToast(msg);
            setLoading(false);
          }
        },
      });

      rzp.on('payment.failed', () => {
        const msg = 'Payment failed or was cancelled.';
        setError(msg);
        showToast(msg);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not start payment.';
      setError(msg);
      showToast(msg);
      setLoading(false);
    }
  };

  if (!details) {
    return (
      <PageContainer>
        <p className="text-muted">Invalid plan.</p>
        <Link href="/">Back to home</Link>
      </PageContainer>
    );
  }

  if (success) {
    return (
      <main className="payment-page payment-page--success">
        <div className="payment-page__success-wrap">
          <div className="payment-page__success-card">
            <div className="payment-page__success-icon" aria-hidden>✓</div>
            <h2 className="payment-page__success-title">Payment successful</h2>
            <p className="payment-page__success-text">Your subscription is active.</p>
            <Link href="/" className="payment-page__success-link">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
    <main className="payment-page">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <h1 className="payment-page__title">Payment</h1>
            <p className="payment-page__subtitle text-muted mb-4">
              Complete checkout for <strong>{details.name}</strong>
              {summaryShowIntro ?
                <span> — amount at checkout follows first-time or renewal rules for your gym.</span>
              : (
                <span>
                  {' '}
                  — {details.price}
                  {details.period}
                </span>
              )}
            </p>

            <Card className="payment-page__card shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="payment-page__summary mb-4 p-3 bg-light rounded-3">
                  <span className="d-block fw-semibold mb-2">{details.name}</span>
                  <PlanPriceDisplay
                    listFormatted={summaryListFormatted}
                    firstFormatted={summaryFirstFormatted}
                    period={details.period}
                    showIntro={summaryShowIntro}
                    size="md"
                  />
                </div>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="required">Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="test@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="required">Business slug</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="my-gym"
                      value={businessSlug}
                      onChange={(e) => setBusinessSlug(e.target.value)}
                      disabled={loading}
                      isValid={slugStatus === 'found'}
                      isInvalid={slugStatus === 'not-found' || slugStatus === 'invalid' || slugStatus === 'error'}
                    />
                    <Form.Text className="text-muted d-block">
                      {publicSiteDomain ?
                        <>
                          Must match an existing public gym site (
                          <code>{`https://your-slug.${publicSiteDomain}`}</code>).
                        </>
                      : <>
                          Must match an existing public gym page (<code>/your-slug</code>).
                        </>
                      }
                    </Form.Text>
                    {businessSlug.trim() === '' ? null : slugStatus === 'checking' ? (
                      <span className="text-muted small d-flex align-items-center gap-2 mt-1">
                        <Spinner animation="border" size="sm" /> Checking slug…
                      </span>
                    ) : slugStatus === 'found' ? (
                      <span className="text-success small d-block mt-1">This business exists — you can continue to payment.</span>
                    ) : slugStatus === 'not-found' ? (
                      <span className="text-danger small d-block mt-1">No business found for this slug.</span>
                    ) : slugStatus === 'invalid' ? (
                      <span className="text-danger small d-block mt-1">
                        Use 2–48 characters: lowercase letters, numbers, and hyphens only.
                      </span>
                    ) : slugStatus === 'error' ? (
                      <span className="text-danger small d-block mt-1">Could not verify slug. Check your connection.</span>
                    ) : null}
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 payment-page__submit"
                    disabled={
                      loading ||
                      (businessSlug.trim() !== '' && slugStatus !== 'found')
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Opening payment…
                      </>
                    ) : (
                      <>Pay {details.price}{details.period}</>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <p className="text-center">
              <Link href="/" className="text-muted">
                ← Back to packages
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </main>
    <PaymentLoginRequiredModal
      show={loginModalOpen}
      onHide={() => setLoginModalOpen(false)}
      checkout={checkoutRedirect}
    />
    </>
  );
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: () => void) => void;
}
