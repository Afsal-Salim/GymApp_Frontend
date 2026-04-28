'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Form,
  InputGroup,
  Modal,
  Spinner,
} from 'react-bootstrap';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { PageContainer } from '@/components';
import {
  BusinessDeactivateBlockedError,
  checkBusinessSlugAvailability,
  getActiveSubscription,
  getBusinessDetail,
  invalidatePublicGymBundleCache,
  invalidateUserAnalyticsCache,
  invalidateUserBusinessListCache,
  peekBusinessListItemBySlug,
  patchBusiness,
  postBusinessRecordStatus,
  resolveBusinessLogoDisplayUrl,
} from '@/api';
import type { ActiveSubscriptionResponse, BusinessDetail, BusinessSubscription } from '@/api';
import { useToast } from '@/contexts/ToastContext/ToastContext';
import { publicGymSiteHostLabel, publicGymSiteUrl, visitPublicGymSite } from '@/config/env';
import { PLANS_PAGE_PATH } from '../../plans/PlansPage/PlansPage';
import { GYM_CLIENT_BRAND_LOGO_SRC, isLegacyCrystalGemLogoUrl } from '../../crystal/gymClientBrandLogo/gymClientBrandLogo';
import '../ManageBusinessPage/ManageBusinessPage.css';
import '../UserPage/UserPage.css';
import './WebsiteSettingsPage.css';

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

function minimalBusinessRow(routeSlug: string): BusinessDetail {
  const s = routeSlug.trim();
  return { slug: s, name: s };
}

function businessFromListPrefetch(routeSlug: string): BusinessDetail {
  if (typeof window === 'undefined') return minimalBusinessRow(routeSlug);
  return peekBusinessListItemBySlug(routeSlug) ?? minimalBusinessRow(routeSlug);
}

/** Merges subscription API row into list-prefetched detail (keeps gym name from list until GET `/businesses/<slug>/`). */
function mergePrefetchWithSubscription(
  routeSlug: string,
  sub: ActiveSubscriptionResponse | null,
  prev: BusinessDetail | null
): BusinessDetail {
  const fromSub = businessDetailFromActiveSubscription(routeSlug, sub);
  if (!prev) return fromSub;
  const keepName = (prev.name ?? '').trim() && prev.name !== prev.slug ? prev.name : undefined;
  return {
    ...prev,
    ...fromSub,
    ...(keepName ? { name: keepName } : {}),
    subscriptions:
      fromSub.subscriptions?.length ? fromSub.subscriptions
      : prev.subscriptions,
  };
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

/** Remove-website modal: gym logo from business detail (not Crystal mark); letter if no custom asset. */
function RemoveWebsiteModalLogo({ business }: { business: BusinessDetail }) {
  const url = useMemo(() => resolveSettingsLogoUrl(business), [business]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  const label = (business.name || business.slug || 'Website').trim() || 'Website';
  const initial = label.charAt(0).toUpperCase();

  if (url && !failed) {
    return (
      <div className="user-page__remove-website-modal-logo-wrap user-page__remove-website-modal-logo-wrap--photo">
        <img
          src={url}
          alt=""
          className="user-page__remove-website-modal-logo--img"
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="user-page__remove-website-modal-logo-wrap" aria-hidden>
      <span className="user-page__remove-website-modal-logo-fallback">{initial}</span>
    </div>
  );
}

function WebsiteSettingsLoaded({ routeSlug }: { routeSlug: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const slugEnc = encodeURIComponent(routeSlug);

  const [business, setBusiness] = useState<BusinessDetail>(() => businessFromListPrefetch(routeSlug));

  const [subscription, setSubscription] = useState<ActiveSubscriptionResponse | null>(null);
  const [subscriptionFetchError, setSubscriptionFetchError] = useState<string | null>(null);
  /** Active-subscription GET finished (success or failure). */
  const [subscriptionReady, setSubscriptionReady] = useState(false);
  /** Business detail GET finished (success or failure) — unlocks QR generation with full logo/theme. */
  const [businessDetailReady, setBusinessDetailReady] = useState(false);

  const [slugDraft, setSlugDraft] = useState(() => {
    const fromList = typeof window !== 'undefined' ? peekBusinessListItemBySlug(routeSlug) : null;
    return fromList?.slug ?? routeSlug;
  });
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugSaveConfirmOpen, setSlugSaveConfirmOpen] = useState(false);

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
    setSubscriptionFetchError(null);
    setSubscriptionReady(false);
    setBusinessDetailReady(false);
    const pref = typeof window !== 'undefined' ? peekBusinessListItemBySlug(routeSlug) : null;
    setBusiness(pref ?? businessFromListPrefetch(routeSlug));
    setSlugDraft((prev) => prev || pref?.slug || routeSlug);

    void getBusinessDetail(routeSlug)
      .then((d) => {
        setBusiness(d);
        setSlugDraft(d.slug ?? routeSlug);
      })
      .catch(() => {
        /* keep list / subscription overlay */
      })
      .finally(() => {
        setBusinessDetailReady(true);
      });

    try {
      const sub = await getActiveSubscription(routeSlug);
      setSubscription(sub);
      setBusiness((prev) => mergePrefetchWithSubscription(routeSlug, sub, prev));
    } catch (e) {
      setSubscription(null);
      setSubscriptionFetchError(e instanceof Error ? e.message : 'Could not load subscription.');
    } finally {
      setSubscriptionReady(true);
    }
  }, [routeSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!businessDetailReady || !business?.slug?.trim()) {
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
  }, [businessDetailReady, business?.slug, showToast]);

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
      const recheck = await checkBusinessSlugAvailability(next, { reservedSlug: baselineSlug });
      if (!recheck.available) {
        setSlugStatus('unavailable');
        setSlugDetail(recheck.message ?? 'This address is not available.');
        showToast(recheck.message ?? 'This address is not available.', 'warning');
        return;
      }
      const updated = await patchBusiness(prev, { slug: next });
      setSlugSaveConfirmOpen(false);
      invalidateUserBusinessListCache();
      invalidateUserAnalyticsCache();
      invalidatePublicGymBundleCache(prev);
      invalidatePublicGymBundleCache(next);
      showToast('Site address updated.', 'success');
      router.replace(`/user/business/${encodeURIComponent(updated.slug ?? next)}/settings`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not update address.';
      showToast(msg, 'danger');
      const lower = msg.toLowerCase();
      if (
        lower.includes('already exists') ||
        lower.includes('already taken') ||
        (lower.includes('slug') && (lower.includes('exists') || lower.includes('unique')))
      ) {
        setSlugStatus('unavailable');
        setSlugDetail(msg);
      }
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
      showToast('Website is live again.', 'success');
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
      showToast('Website hidden. Restore it from your profile when you are ready.', 'warning');
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

  const archived = isBusinessArchived(business);
  const publicLiveUrl = publicGymSiteUrl((business.slug ?? routeSlug).trim());
  const siteHostLabel = publicSiteDisplayLabel(business.slug ?? routeSlug);
  const subscriptionLive =
    Boolean(subscription?.has_active_subscription && subscription.is_active !== false);

  return (
    <PageContainer>
      <main className="manage-business-page website-settings-page">
        <Container className="manage-business-page__container py-3 py-md-4 px-3">
          <div className="website-settings-page__header">
            <div className="website-settings-page__hero">
              <nav className="manage-business-page__crumb small text-muted mb-1">
                <Link href="/user">Profile</Link>
                <span aria-hidden> / </span>
                <span>Settings</span>
              </nav>
              <h1 className="website-settings-page__title">Website settings</h1>
              <p className="website-settings-page__subtitle">
                Manage your public website and online presence
              </p>
            </div>
            <div className="website-settings-page__header-meta">
              {subscriptionReady && subscription != null && (
                <div
                  className={`website-settings-page__active-pill ${
                    subscriptionLive ? 'website-settings-page__active-pill--on' : 'website-settings-page__active-pill--off'
                  }`}
                >
                  {subscriptionLive ?
                    <span className="website-settings-page__active-pill-icon" aria-hidden>
                      <CheckRoundedIcon sx={{ fontSize: 20 }} />
                    </span>
                  : null}
                  <span>{subscriptionLive ? 'Active' : 'Inactive'}</span>
                </div>
              )}
              {business.slug?.trim() ?
                <a
                  href={publicLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="website-settings-page__header-url"
                >
                  <span>{siteHostLabel}</span>
                  <OpenInNewIcon className="website-settings-page__header-url-icon" aria-hidden />
                </a>
              : null}
            </div>
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

          <Card className="website-settings-page__card">
            <Card.Body className="p-3 p-md-4">
              <h2 className="website-settings-page__card-title">Website actions</h2>
              <p className="website-settings-page__card-lead">
                Manage your website, view it live, or update your plans and billing.
              </p>
              <div className="website-settings-page__action-rows">
                <button
                  type="button"
                  className="website-settings-page__action-row"
                  disabled={visitLoading || archived}
                  onClick={() => handleVisit()}
                >
                  <span className="website-settings-page__action-icon">
                    <VisibilityOutlinedIcon fontSize="small" />
                  </span>
                  <span className="website-settings-page__action-text">
                    <span className="website-settings-page__action-title">
                      {visitLoading ? 'Checking…' : 'Visit live site'}
                    </span>
                    <span className="website-settings-page__action-desc">Open your website</span>
                  </span>
                  <ChevronRightIcon className="website-settings-page__action-chevron" aria-hidden />
                </button>
                <Link
                  href={`/user/business/${slugEnc}/edit/select-template`}
                  className="website-settings-page__action-row"
                >
                  <span className="website-settings-page__action-icon">
                    <EditOutlinedIcon fontSize="small" />
                  </span>
                  <span className="website-settings-page__action-text">
                    <span className="website-settings-page__action-title">Edit website</span>
                    <span className="website-settings-page__action-desc">Edit content &amp; design</span>
                  </span>
                  <ChevronRightIcon className="website-settings-page__action-chevron" aria-hidden />
                </Link>
                <Link href={`${PLANS_PAGE_PATH}/${slugEnc}`} className="website-settings-page__action-row">
                  <span className="website-settings-page__action-icon">
                    <CreditCardOutlinedIcon fontSize="small" />
                  </span>
                  <span className="website-settings-page__action-text">
                    <span className="website-settings-page__action-title">Plans &amp; billing</span>
                    <span className="website-settings-page__action-desc">View plans &amp; invoices</span>
                  </span>
                  <ChevronRightIcon className="website-settings-page__action-chevron" aria-hidden />
                </Link>
              </div>
            </Card.Body>
          </Card>

          <Card className="website-settings-page__card">
            <Card.Body className="p-3 p-md-4">
              <div className="website-settings-page__qr-head">
                <div>
                  <h2 className="website-settings-page__card-title mb-1">QR code</h2>
                  <p className="website-settings-page__card-lead mb-0">
                    Scan to open your public landing page. Download the image for posters and signage.
                  </p>
                </div>
                <div className="website-settings-page__qr-tip">
                  <InfoOutlinedIcon className="website-settings-page__qr-tip-icon" aria-hidden />
                  <span>Keep it visible to attract more leads.</span>
                </div>
              </div>

              {!businessDetailReady ?
                <div className="website-settings-page__section-loader py-4" role="status" aria-busy>
                  <Spinner animation="border" size="sm" className="mb-2" />
                  <p className="text-muted small mb-0">Loading site details…</p>
                </div>
              : (
                <div className="website-settings-page__qr-body">
                  <div className="website-settings-page__qr-frame-wrap">
                    {qrLoading ?
                      <div className="py-5 px-3 text-center website-settings-page__section-loader">
                        <Spinner animation="border" size="sm" className="mb-2" />
                        <p className="text-muted small mb-0">Generating QR…</p>
                      </div>
                    : qrDataUrl ?
                      <div className="user-page__site-qr-frame">
                        <img src={qrDataUrl} alt="" className="user-page__site-qr-img" width={256} height={256} />
                        <SiteQrLogoOverlay business={business} />
                      </div>
                    : (
                      <p className="text-danger small mb-0">Could not create QR code.</p>
                    )}
                  </div>
                  <div>
                    <div className="website-settings-page__url-field-label">Website URL</div>
                    <InputGroup className="website-settings-page__url-input">
                      <Form.Control readOnly value={publicLiveUrl} aria-label="Public website URL" />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        title="Copy URL"
                        aria-label="Copy website URL"
                        onClick={() => {
                          void (async () => {
                            try {
                              await navigator.clipboard.writeText(publicLiveUrl);
                              showToast('Copied', 'success');
                            } catch {
                              showToast('Could not copy');
                            }
                          })();
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </Button>
                    </InputGroup>
                    <div className="website-settings-page__qr-actions">
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
                              await navigator.clipboard.writeText(publicLiveUrl);
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
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {!archived && subscriptionLive && (
            <div className="website-settings-page__live-banner">
              <div className="website-settings-page__live-banner-icon" aria-hidden>
                <LanguageIcon />
              </div>
              <div className="website-settings-page__live-banner-text">
                <p className="website-settings-page__live-banner-title">Your website is live and ready</p>
                <p className="website-settings-page__live-banner-desc">
                  Share your website link or QR code to grow your gym community.
                </p>
              </div>
              <div className="website-settings-page__live-banner-art" aria-hidden>
                <svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="56" height="28" rx="4" fill="#fff" stroke="#0ea5e9" strokeWidth="2" />
                  <rect x="4" y="8" width="56" height="7" rx="2" fill="#e0f2fe" />
                  <circle cx="10" cy="11.5" r="1.5" fill="#94a3b8" />
                  <circle cx="15" cy="11.5" r="1.5" fill="#94a3b8" />
                  <path
                    d="M32 28l3 3 7-8"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}

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
                onClick={() => setSlugSaveConfirmOpen(true)}
              >
                Save address
              </Button>
            </Card.Body>
          </Card>

          <section className="mb-4">
            <h2 className="h6 mb-3">Subscriptions</h2>
            {!subscriptionReady ?
              <div className="py-4 text-center website-settings-page__section-loader border rounded" role="status" aria-busy>
                <Spinner animation="border" size="sm" className="mb-2" />
                <p className="text-muted small mb-0">Loading subscription…</p>
              </div>
            : subscriptionFetchError ?
              <Alert variant="warning" className="mb-0">
                {subscriptionFetchError}
              </Alert>
            : !business.subscriptions?.length ?
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

      <Modal
        show={slugSaveConfirmOpen}
        onHide={() => !slugSaving && setSlugSaveConfirmOpen(false)}
        centered
        backdrop={slugSaving ? 'static' : true}
        keyboard={!slugSaving}
        aria-labelledby="ws-slug-change-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="ws-slug-change-title">Change site address?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            You are changing your public address from{' '}
            <strong className="text-break">{publicSiteDisplayLabel(baselineSlug)}</strong> to{' '}
            <strong className="text-break">{publicSiteDisplayLabel(slugNormalized)}</strong>.
          </p>
          <ul className="mb-0 ps-3 small">
            <li className="mb-2">
              This updates your live site URL and affects how your current active website is reached.
            </li>
            <li className="mb-2">
              Your QR code will update to the new address — download it again if you use posters or signage.
            </li>
            <li>The previous URL will no longer work for visitors.</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button type="button" variant="outline-secondary" onClick={() => setSlugSaveConfirmOpen(false)} disabled={slugSaving}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={() => void handleSaveSlug()} disabled={slugSaving || !canSaveSlug}>
            {slugSaving ?
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Saving…
              </>
            : 'Save new address'}
          </Button>
        </Modal.Footer>
      </Modal>

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
            <RemoveWebsiteModalLogo business={business} />
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
