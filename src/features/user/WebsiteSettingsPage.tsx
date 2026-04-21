'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  Modal,
  Spinner,
} from 'react-bootstrap';
import { PageContainer } from '../../components';
import {
  BusinessDeactivateBlockedError,
  checkBusinessSlugAvailability,
  getActiveSubscription,
  getBusinessDetail,
  invalidatePublicGymBundleCache,
  invalidateUserAnalyticsCache,
  invalidateUserBusinessListCache,
  patchBusiness,
  postBusinessRecordStatus,
  resolveBusinessLogoDisplayUrl,
} from '../../api';
import type { ActiveSubscriptionResponse, BusinessDetail, BusinessSubscription } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { publicGymSiteHostLabel, publicGymSiteUrl, visitPublicGymSite } from '../../config/env';
import { PLANS_PAGE_PATH } from '../plans/PlansPage';
import { GYM_CLIENT_BRAND_LOGO_SRC, isLegacyCrystalGemLogoUrl } from '../crystal/gymClientBrandLogo';
import logo from '../../assets/logo.svg';
import './ManageBusinessPage.css';
import './UserPage.css';

const SLUG_REGEX = /^([a-z0-9]+(?:-[a-z0-9]+)*)$/;

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function formatDate(s: string | undefined): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return s;
  }
}

function publicSiteDisplayLabel(slug: string | null | undefined): string {
  const label = publicGymSiteHostLabel(slug ?? '');
  return label === '—' ? '—' : label.replace(/\/$/, '');
}

function isSubscriptionActive(endDate: string | undefined): boolean {
  if (!endDate) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end >= today;
  } catch {
    return false;
  }
}

function isBusinessArchived(detail: BusinessDetail): boolean {
  return detail.record_status === 'inactive';
}

/** Until GET `/businesses/<slug>/` returns, derive a minimal row from active-subscription (fast path, no blocking loader). */
function businessDetailFromActiveSubscription(routeSlug: string, sub: ActiveSubscriptionResponse | null): BusinessDetail {
  const slug = routeSlug.trim();
  const siteActive = sub ? sub.is_active !== false : true;
  const subs: BusinessSubscription[] =
    sub?.has_active_subscription && sub.subscription_end_date ?
      [
        {
          id: 0,
          plan: 0,
          plan_name: sub.plan_name?.trim() || sub.plan_tier || 'Plan',
          payment_id: '—',
          subscription_start_date: sub.subscription_start_date ?? '',
          subscription_end_date: sub.subscription_end_date,
        },
      ]
    : [];
  return {
    slug,
    name: sub?.plan_name?.trim() || slug,
    record_status: siteActive ? 'active' : 'inactive',
    subscriptions: subs,
  };
}

function isBundledDefaultClientLogoUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return true;
  const path = t.split(/[?#]/)[0].toLowerCase();
  if (path === GYM_CLIENT_BRAND_LOGO_SRC.toLowerCase()) return true;
  return /\/clientlogo\.png$/i.test(path) || /\/assets\/clientlogo[-.a-z0-9]*\.png$/i.test(path);
}

function resolveSettingsLogoUrl(b: BusinessDetail): string | null {
  const raw = resolveBusinessLogoDisplayUrl(b).trim();
  if (!raw || isLegacyCrystalGemLogoUrl(raw) || isBundledDefaultClientLogoUrl(raw)) return null;
  return raw;
}

function SiteQrLogoOverlay({ business }: { business: BusinessDetail }) {
  const url = useMemo(() => resolveSettingsLogoUrl(business), [business]);
  const [bad, setBad] = useState(false);

  useEffect(() => {
    setBad(false);
  }, [url]);

  if (!url || bad) return null;

  return (
    <div className="user-page__site-qr-logo-wrap" aria-hidden>
      <img src={url} alt="" className="user-page__site-qr-logo" onError={() => setBad(true)} />
    </div>
  );
}

function WebsiteSettingsLoaded({ routeSlug }: { routeSlug: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const slugEnc = encodeURIComponent(routeSlug);

  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<ActiveSubscriptionResponse | null>(null);
  const [slugDraft, setSlugDraft] = useState('');
  const [slugSaving, setSlugSaving] = useState(false);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeBusy, setRemoveBusy] = useState(false);

  const [visitLoading, setVisitLoading] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);

  const [recordActionBusy, setRecordActionBusy] = useState(false);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const debouncedSlug = useDebounced(slugDraft.trim().toLowerCase(), 450);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
  const [slugDetail, setSlugDetail] = useState<string | undefined>();
  const slugReqId = useRef(0);

  const baselineSlug = (business?.slug ?? routeSlug).trim().toLowerCase();

  const reload = useCallback(async () => {
    setLoadError(null);
    try {
      const sub = await getActiveSubscription(routeSlug);
      setSubscription(sub);
      setBusiness(businessDetailFromActiveSubscription(routeSlug, sub));
      setSlugDraft((prev) => prev || sub.slug || routeSlug);
      void getBusinessDetail(routeSlug)
        .then((d) => {
          setBusiness(d);
          setSlugDraft(d.slug ?? routeSlug);
        })
        .catch(() => {
          /* keep minimal row from subscription API */
        });
    } catch (e) {
      setSubscription(null);
      setBusiness(null);
      setLoadError(e instanceof Error ? e.message : 'Could not load subscription.');
    }
  }, [routeSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!business?.slug?.trim()) {
      setQrDataUrl(null);
      setQrLoading(false);
      return;
    }
    const landingUrl = publicGymSiteUrl(business.slug.trim());
    let cancelled = false;
    setQrLoading(true);
    setQrDataUrl(null);
    void import('qrcode')
      .then((qr) =>
        qr.toDataURL(landingUrl, {
          width: 256,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#0f172a', light: '#ffffff' },
        })
      )
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
          showToast('Could not generate QR code.');
        }
      })
      .finally(() => {
        if (!cancelled) setQrLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [business?.slug, showToast]);

  useEffect(() => {
    if (!debouncedSlug) {
      setSlugStatus('idle');
      setSlugDetail(undefined);
      return;
    }
    if (!SLUG_REGEX.test(debouncedSlug) || debouncedSlug.length < 2 || debouncedSlug.length > 48) {
      setSlugStatus('invalid');
      setSlugDetail(undefined);
      return;
    }
    if (debouncedSlug === baselineSlug) {
      setSlugStatus('available');
      setSlugDetail(undefined);
      return;
    }
    const id = ++slugReqId.current;
    setSlugStatus('checking');
    setSlugDetail(undefined);
    void checkBusinessSlugAvailability(debouncedSlug, { reservedSlug: baselineSlug }).then((r) => {
      if (slugReqId.current !== id) return;
      setSlugStatus(r.available ? 'available' : 'unavailable');
      setSlugDetail(r.message);
    });
  }, [debouncedSlug, baselineSlug]);

  const slugNormalized = slugDraft.trim().toLowerCase();
  const slugChanged = Boolean(business && slugNormalized && slugNormalized !== baselineSlug);
  const canSaveSlug =
    Boolean(business && slugChanged && slugStatus === 'available' && SLUG_REGEX.test(slugNormalized));

  const handleSaveSlug = async () => {
    if (!business?.slug || !canSaveSlug) return;
    const next = slugNormalized;
    const prev = business.slug.trim();
    setSlugSaving(true);
    try {
      const updated = await patchBusiness(prev, { slug: next });
      invalidateUserBusinessListCache();
      invalidateUserAnalyticsCache();
      invalidatePublicGymBundleCache(prev);
      invalidatePublicGymBundleCache(next);
      showToast('Site address updated.');
      router.replace(`/user/business/${encodeURIComponent(updated.slug ?? next)}/settings`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not update address.');
    } finally {
      setSlugSaving(false);
    }
  };

  const handleVisit = () => {
    const s = business?.slug;
    if (!s) return;
    setVisitLoading(true);
    getActiveSubscription(s)
      .then((data) => {
        if (data.has_active_subscription && data.is_active !== false) {
          visitPublicGymSite(s, (to, opts) => (opts?.replace ? router.replace(to) : router.push(to)));
        } else {
          setRechargeOpen(true);
        }
      })
      .catch(() => showToast('Could not check subscription status.'))
      .finally(() => setVisitLoading(false));
  };

  const handleRestore = async () => {
    if (!business?.slug) return;
    setRecordActionBusy(true);
    try {
      await postBusinessRecordStatus(business.slug, { record_status: 'active' });
      showToast('Website is live again.');
      invalidateUserBusinessListCache();
      invalidateUserAnalyticsCache();
      await reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not restore.');
    } finally {
      setRecordActionBusy(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!business?.slug) return;
    setRemoveBusy(true);
    try {
      await postBusinessRecordStatus(business.slug, { record_status: 'inactive' });
      setRemoveOpen(false);
      showToast('Website hidden. Restore it from your profile when you are ready.');
      invalidateUserBusinessListCache();
      invalidateUserAnalyticsCache();
      await reload();
    } catch (e) {
      if (e instanceof BusinessDeactivateBlockedError) {
        showToast(e.message);
      } else {
        showToast(e instanceof Error ? e.message : 'Could not remove website.');
      }
    } finally {
      setRemoveBusy(false);
    }
  };

  const archived = business ? isBusinessArchived(business) : false;
  const displayName = (business?.name ?? subscription?.plan_name ?? routeSlug).trim() || routeSlug;

  if (loadError || !business) {
    return (
      <PageContainer>
        <main className="manage-business-page">
          <Container className="manage-business-page__container py-3 py-md-4 px-3">
            <Alert variant="danger">{loadError ?? 'Website not found.'}</Alert>
            <Link href="/user" className="btn btn-outline-secondary btn-sm">
              Back to profile
            </Link>
          </Container>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <main className="manage-business-page website-settings-page">
        <Container className="manage-business-page__container py-3 py-md-4 px-3">
          <div className="manage-business-page__head d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
            <div>
              <nav className="manage-business-page__crumb small text-muted mb-1">
                <Link href="/user">Profile</Link>
                <span aria-hidden> / </span>
                <span>Settings</span>
              </nav>
              <h1 className="manage-business-page__title h3 mb-1">Website settings</h1>
              <p className="manage-business-page__subtitle text-muted small mb-0">
                {displayName}
                {business.slug ?
                  <>
                    {' '}
                    · <span className="text-body">{publicSiteDisplayLabel(business.slug)}</span>
                  </>
                : null}
              </p>
            </div>
            {subscription != null && (
              <Badge
                pill
                className={`user-page__status-badge align-self-start ${
                  subscription.has_active_subscription && subscription.is_active !== false ?
                    'user-page__status-badge--active'
                  : 'user-page__status-badge--inactive'
                }`}
              >
                <span className="user-page__status-badge-text">
                  {subscription.has_active_subscription && subscription.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </Badge>
            )}
          </div>

          {archived ?
            <Alert variant="warning" className="mb-4">
              <p className="mb-2">This site is hidden from the public.</p>
              <Button
                variant="primary"
                size="sm"
                disabled={recordActionBusy}
                onClick={() => void handleRestore()}
              >
                {recordActionBusy ?
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Restoring…
                  </>
                : 'Restore website'}
              </Button>
            </Alert>
          : null}

          <Card className="border mb-4 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <h2 className="h6 mb-3">Actions</h2>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={visitLoading || archived}
                  onClick={() => handleVisit()}
                >
                  {visitLoading ? 'Checking…' : 'Visit live site'}
                </Button>
                <Link href={`/user/business/${slugEnc}/manage`} className="btn btn-outline-primary btn-sm">
                  Manage
                </Link>
                <Link href={`/user/business/${slugEnc}/edit/select-template`} className="btn btn-outline-secondary btn-sm">
                  Edit website
                </Link>
                <Link href={`${PLANS_PAGE_PATH}/${slugEnc}`} className="btn btn-primary btn-sm">
                  Plans &amp; billing
                </Link>
              </div>
              <p className="text-muted small mt-3 mb-0">
                <strong>Manage</strong> opens analytics, leads, and enquiries. <strong>Edit website</strong> opens the builder.
              </p>
            </Card.Body>
          </Card>

          <Card className="border mb-4 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <h2 className="h6 mb-3">QR code</h2>
              <p className="small text-muted mb-3">
                Scan to open your public landing page. Download the image for posters and signage.
              </p>
              <code className="user-page__site-qr-url d-block small mb-3">{publicGymSiteUrl(business.slug ?? routeSlug)}</code>
              {qrLoading ?
                <div className="py-4 text-center">
                  <Spinner animation="border" role="status" />
                </div>
              : qrDataUrl ?
                <div className="user-page__site-qr-frame mb-3">
                  <img src={qrDataUrl} alt="" className="user-page__site-qr-img" width={256} height={256} />
                  <SiteQrLogoOverlay business={business} />
                </div>
              : (
                <p className="text-danger small">Could not create QR code.</p>
              )}
              <div className="d-flex flex-wrap gap-2">
                {qrDataUrl ?
                  <Button as="a" variant="primary" size="sm" href={qrDataUrl} download={`${baselineSlug}-website-qr.png`}>
                    Download PNG
                  </Button>
                : null}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    void (async () => {
                      try {
                        await navigator.clipboard.writeText(publicGymSiteUrl(business.slug ?? routeSlug));
                        showToast('Link copied', 'success');
                      } catch {
                        showToast('Could not copy link');
                      }
                    })();
                  }}
                >
                  Copy link
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="border mb-4 shadow-sm">
            <Card.Body className="p-3 p-md-4">
              <h2 className="h6 mb-2">Public site address</h2>
              <p className="small text-muted mb-3">
                This is the subdomain or path visitors use to reach your gym page. Use lowercase letters, numbers, and
                hyphens.
              </p>
              <Form.Group className="mb-2" controlId="website-settings-slug">
                <Form.Label className="small">Site slug</Form.Label>
                <Form.Control
                  value={slugDraft}
                  onChange={(e) => setSlugDraft(e.target.value)}
                  disabled={slugSaving || archived}
                  spellCheck={false}
                  autoComplete="off"
                />
              </Form.Group>
              {slugStatus === 'checking' ?
                <p className="small text-muted mb-2">Checking availability…</p>
              : slugStatus === 'invalid' ?
                <p className="small text-danger mb-2">Use 2–48 characters: lowercase letters, numbers, and hyphens only.</p>
              : slugStatus === 'unavailable' ?
                <p className="small text-danger mb-2">{slugDetail ?? 'This address is not available.'}</p>
              : slugChanged && slugStatus === 'available' ?
                <p className="small text-success mb-2">This address is available.</p>
              : null}
              <Button
                variant="primary"
                size="sm"
                disabled={!canSaveSlug || slugSaving || archived}
                onClick={() => void handleSaveSlug()}
              >
                {slugSaving ?
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    Saving…
                  </>
                : 'Save address'}
              </Button>
            </Card.Body>
          </Card>

          <section className="mb-4">
            <h2 className="h6 mb-3">Subscriptions</h2>
            {!business.subscriptions?.length ?
              <p className="text-muted small mb-0">No subscriptions</p>
            : (
              <div className="user-page__subscriptions">
                {business.subscriptions.map((sub) => (
                  <div key={sub.id} className="user-page__subscription-card">
                    <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                      <span className="user-page__subscription-plan">{sub.plan_name}</span>
                      {!isSubscriptionActive(sub.subscription_end_date) ?
                        <Badge pill className="user-page__status-badge user-page__status-badge--inactive">
                          <span className="user-page__status-badge-text">Expired</span>
                        </Badge>
                      : null}
                    </div>
                    <dl className="user-page__subscription-dl mb-0">
                      <dt>Payment ID</dt>
                      <dd>
                        <code className="user-page__slug-code">{sub.payment_id}</code>
                      </dd>
                      <dt>Start date</dt>
                      <dd>{formatDate(sub.subscription_start_date)}</dd>
                      <dt>End date</dt>
                      <dd>{formatDate(sub.subscription_end_date)}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Card className="border border-danger-subtle mb-4">
            <Card.Body className="p-3 p-md-4">
              <h2 className="h6 text-danger mb-2">Remove website</h2>
              <p className="small text-muted mb-3">
                Hides your public gym page until you restore it from your profile. Removal may be blocked while a paid plan
                is active.
              </p>
              <Button variant="outline-danger" size="sm" disabled={archived || removeBusy} onClick={() => setRemoveOpen(true)}>
                Remove from dashboard…
              </Button>
            </Card.Body>
          </Card>

          <p className="small mb-0">
            <Link href="/user">← Back to profile</Link>
          </p>
        </Container>
      </main>

      <Modal show={rechargeOpen} onHide={() => setRechargeOpen(false)} centered backdrop="static" aria-labelledby="ws-recharge-title">
        <Modal.Header closeButton>
          <Modal.Title id="ws-recharge-title">Recharge to view your live site</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            This gym does not have an active subscription right now. Go to the pricing page to recharge and restore public
            access.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button type="button" variant="outline-secondary" onClick={() => setRechargeOpen(false)}>
            Not now
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setRechargeOpen(false);
              router.push(`${PLANS_PAGE_PATH}/${slugEnc}`);
            }}
          >
            Recharge now
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={removeOpen}
        onHide={() => !removeBusy && setRemoveOpen(false)}
        centered
        backdrop={removeBusy ? 'static' : true}
        keyboard={!removeBusy}
        dialogClassName="user-page__remove-website-modal"
        contentClassName="user-page__remove-website-modal-content"
      >
        <Modal.Header closeButton className="user-page__remove-website-modal-header border-0">
          <div className="user-page__remove-website-modal-header-main">
            <Image src={logo} alt="" className="user-page__remove-website-modal-logo" width={48} height={48} />
            <Modal.Title as="h2" className="user-page__remove-website-modal-title">
              Remove website?
            </Modal.Title>
            <p className="user-page__remove-website-modal-business text-muted small mb-0">
              {business.name ?? '—'}
              {business.slug ?
                <span className="user-page__remove-website-modal-slug">
                  {' '}
                  · {publicSiteDisplayLabel(business.slug)}
                </span>
              : null}
            </p>
          </div>
        </Modal.Header>
        <Modal.Body className="user-page__remove-website-modal-body">
          <p className="mb-2 mb-md-3">Your public gym page will be hidden until you restore it from your business list.</p>
          <p className="text-muted small mb-0">
            If you still have an active paid plan, removal may be blocked until the subscription ends or is cancelled.
          </p>
        </Modal.Body>
        <Modal.Footer className="user-page__remove-website-modal-footer border-0">
          <Button variant="secondary" onClick={() => setRemoveOpen(false)} disabled={removeBusy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void handleConfirmRemove()} disabled={removeBusy}>
            {removeBusy ?
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Removing…
              </>
            : 'Remove'}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
}

export default function WebsiteSettingsPage() {
  const params = useParams<{ slug: string }>();
  const routeSlug = typeof params.slug === 'string' ? params.slug.trim() : '';
  if (!routeSlug) {
    return (
      <PageContainer>
        <main className="manage-business-page">
          <Container className="manage-business-page__container py-3 py-md-4 px-3">
            <Alert variant="warning">Missing website address.</Alert>
            <Link href="/user">Back to profile</Link>
          </Container>
        </main>
      </PageContainer>
    );
  }
  return <WebsiteSettingsLoaded key={routeSlug} routeSlug={routeSlug} />;
}
