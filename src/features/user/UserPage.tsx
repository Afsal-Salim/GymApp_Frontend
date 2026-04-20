'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Row, Col, Card, Spinner, Modal, Button, ListGroup, Badge, Pagination, Alert, Form } from 'react-bootstrap';
import { PageContainer } from '../../components';
import {
  getProfileCached,
  peekProfileCache,
  getBusinessListPaginatedCached,
  peekBusinessListPage,
  getBusinessDetail,
  getActiveSubscription,
  getAllWebsitesAnalyticsCached,
  peekAllWebsitesAnalytics,
  getUserInfo,
  setUserInfo,
  isAdminProfile,
  ANALYTICS_RANGE_OPTIONS,
  postBusinessRecordStatus,
  BusinessDeactivateBlockedError,
  invalidateUserBusinessListCache,
  invalidateUserAnalyticsCache,
  resolveBusinessLogoDisplayUrl,
} from '../../api';
import type {
  UserProfile,
  BusinessListItem,
  BusinessDetail,
  ActiveSubscriptionResponse,
  WebsiteAnalytics,
  AnalyticsRangePreset,
} from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { publicGymSiteHostLabel, publicGymSiteUrl, visitPublicGymSite } from '../../config/env';
import { PLANS_PAGE_PATH } from '../plans/PlansPage';
import { GYM_CLIENT_BRAND_LOGO_SRC, isLegacyCrystalGemLogoUrl } from '../crystal/gymClientBrandLogo';
import logo from '../../assets/logo.svg';
import './UserPage.css';

const OverallLeadsByWebsiteChart = dynamic(
  () => import('./OverallLeadsByWebsiteChart').then((mod) => ({ default: mod.OverallLeadsByWebsiteChart })),
  {
    loading: () => (
      <div className="user-page__loading user-page__loading--center py-4 text-muted small">
        <Spinner animation="border" size="sm" className="me-2" aria-hidden />
        Loading chart…
      </div>
    ),
  }
);

function formatDate(s: string | undefined): string {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return s;
  }
}

/** Active if subscription end date is today or in the future. */
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

function isBusinessActive(b: { subscriptions?: { subscription_end_date?: string }[] }): boolean {
  const subs = b.subscriptions;
  if (!subs?.length) return false;
  return subs.some((sub) => isSubscriptionActive(sub.subscription_end_date));
}

/**
 * “Active” for Websites list badge, counts, and sort: subscription end dates when the list payload includes
 * subscriptions; otherwise `is_active` from the API so active gyms still rank above inactive ones.
 */
function isGymActiveForList(b: BusinessListItem): boolean {
  const subs = b.subscriptions;
  if (Array.isArray(subs) && subs.length > 0) {
    return isBusinessActive(b);
  }
  return b.is_active === true;
}

/** Public site hostname for UI (e.g. `mygym.example.com`); path-style when no public domain is configured. */
function publicSiteDisplayLabel(slug: string | null | undefined): string {
  const label = publicGymSiteHostLabel(slug ?? '');
  return label === '—' ? '—' : label.replace(/\/$/, '');
}

function toMetricNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
  if (typeof value === 'string') {
    const n = Number(value.trim());
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  }
  return null;
}

function pickBusinessMetric(b: BusinessListItem, keys: string[]): number | null {
  for (const k of keys) {
    const v = toMetricNumber((b as Record<string, unknown>)[k]);
    if (v != null) return v;
  }
  return null;
}

function getBusinessCardMetrics(b: BusinessListItem): { visits: number; leads: number; clicks: number } {
  const visits =
    pickBusinessMetric(b, ['total_visits', 'visits', 'website_visits', 'total_views', 'views', 'visit_count']) ?? 0;
  const leads = pickBusinessMetric(b, ['total_leads', 'leads', 'lead_count']) ?? 0;
  const clicks = pickBusinessMetric(b, ['whatsapp_clicks', 'total_clicks', 'clicks', 'click_count']) ?? 0;
  return { visits, leads, clicks };
}

/** Public site hidden (soft-deleted); not shown as a “record status” label in the UI. */
function isBusinessArchived(b: BusinessListItem): boolean {
  return (b as BusinessDetail).record_status === 'inactive';
}

function BusinessCardEditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModalVisitExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModalManageSettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0-1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.74 1.08 1.34 1.34H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModalPlansLayersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** True when the URL is the generic bundled client logo (not site-specific). */
function isBundledDefaultClientLogoUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return true;
  const path = t.split(/[?#]/)[0].toLowerCase();
  if (path === GYM_CLIENT_BRAND_LOGO_SRC.toLowerCase()) return true;
  return /\/clientlogo\.png$/i.test(path) || /\/assets\/clientlogo[-.a-z0-9]*\.png$/i.test(path);
}

/**
 * Prefer structured `logo.url`, then `logo_url`, then `website_content.logo.src` when it is a real custom asset.
 */
function resolveBusinessListLogoUrl(b: BusinessListItem): string | null {
  const raw = resolveBusinessLogoDisplayUrl(b).trim();
  if (!raw || isLegacyCrystalGemLogoUrl(raw) || isBundledDefaultClientLogoUrl(raw)) return null;
  return raw;
}

function SiteQrLogoOverlay({ business }: { business: BusinessListItem }) {
  const url = useMemo(() => resolveBusinessListLogoUrl(business), [business]);
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

function BusinessCardSiteLogo({
  business,
  label,
}: {
  business: BusinessListItem;
  label: string;
}) {
  const url = useMemo(() => resolveBusinessListLogoUrl(business), [business]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    return (
      <div className="user-page__business-icon" aria-hidden>
        <span className="user-page__business-icon-mark">◆</span>
      </div>
    );
  }

  return (
    <div className="user-page__business-icon user-page__business-icon--photo">
      <img
        src={url}
        alt={`${label} logo`}
        className="user-page__business-logo-img"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function BusinessCardQrIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm4-8h2v2h-2v-2zm0 4h2v2h-2v-2z" />
    </svg>
  );
}

function BusinessCardTrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BusinessCard({
  b,
  onOpen,
  isActive,
  actionSlug,
  onRequestRemove,
  onRestore,
  onOpenSiteQr,
}: {
  b: BusinessListItem;
  onOpen: (slug: string) => void;
  isActive: (x: BusinessListItem) => boolean;
  actionSlug: string | null;
  onRequestRemove: (b: BusinessListItem) => void;
  onRestore: (b: BusinessListItem) => void;
  onOpenSiteQr: (b: BusinessListItem) => void;
}) {
  const active = isActive(b);
  const archived = isBusinessArchived(b);
  const slugBusy = Boolean(b.slug && actionSlug === b.slug);
  const logoLabel = (b.name || b.slug || 'Website').trim() || 'Website';
  const metrics = useMemo(() => getBusinessCardMetrics(b), [b]);

  const openDetail = () => {
    if (b.slug) onOpen(b.slug);
  };

  return (
    <div
      className={`user-page__business-list-item${archived ? ' user-page__business-list-item--archived' : ''}`}
    >
      <div className="user-page__business-list-item-body">
        <div
          className="user-page__business-list-item-main user-page__business-list-item-main--clickable"
          role={b.slug ? 'button' : undefined}
          tabIndex={b.slug ? 0 : -1}
          onClick={() => openDetail()}
          onKeyDown={(e) => {
            if (!b.slug) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openDetail();
            }
          }}
          aria-label={b.slug ? `Open details for ${logoLabel}` : undefined}
        >
          <div className="user-page__business-card-header">
            <BusinessCardSiteLogo business={b} label={logoLabel} />
            <div className="user-page__business-card-head">
              <div className="user-page__business-card-title-row">
                <Card.Title as="h3" className="user-page__business-card-title mb-0">
                  {b.name || b.slug || '—'}
                </Card.Title>
                <Badge
                  pill
                  className={`user-page__status-badge ${active ? 'user-page__status-badge--active' : 'user-page__status-badge--inactive'}`}
                >
                  <span className="user-page__status-badge-text">{active ? 'Active' : 'Inactive'}</span>
                </Badge>
              </div>
              {b.slug ?
                <p className="user-page__business-slug mb-0">
                  <span className="user-page__business-slug-label">Site</span>
                  <span className="user-page__business-slug-value">{publicSiteDisplayLabel(b.slug)}</span>
                </p>
              : null}
              <p className="user-page__business-metrics mb-0" aria-label="Website metrics">
                <span className="user-page__business-metric">
                  <strong>{metrics.leads.toLocaleString()}</strong> Leads
                </span>
                <span className="user-page__business-metric">
                  <strong>{metrics.clicks.toLocaleString()}</strong> Clicks
                </span>
              </p>
              {archived ?
                <p className="user-page__business-card-archived-note mb-0">
                  Hidden from the web. Restore anytime to publish again.
                </p>
              : null}
            </div>
          </div>
        </div>

        {archived && b.slug ?
          <div
            className="user-page__business-list-actions user-page__business-list-actions--archived"
            role="group"
            aria-label="Website actions"
          >
            <Button
              variant="primary"
              size="sm"
              className="user-page__business-action-btn user-page__btn-view"
              disabled={slugBusy}
              onClick={(e) => {
                e.stopPropagation();
                onRestore(b);
              }}
            >
              {slugBusy ?
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Restoring…
                </>
              : 'Restore'}
            </Button>
          </div>
        : (
          <div className="user-page__business-list-actions" role="group" aria-label="Website actions">
            {b.slug ?
              <>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="user-page__btn-manage user-page__business-action-btn"
                  title="Analytics, leads & enquiries — opens details"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetail();
                  }}
                >
                  Manage
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="user-page__business-action-btn user-page__business-action-btn--icon"
                  title="Edit website — opens details"
                  aria-label="Edit website"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetail();
                  }}
                >
                  <BusinessCardEditIcon />
                </Button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm user-page__business-action-btn user-page__business-action-btn--icon"
                  title="QR code linking to your live site"
                  aria-label="Generate QR code for website"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenSiteQr(b);
                  }}
                >
                  <BusinessCardQrIcon />
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm user-page__business-action-btn user-page__business-action-btn--icon user-page__business-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestRemove(b);
                  }}
                  disabled={slugBusy}
                  aria-label="Remove website from dashboard"
                  title="Remove website"
                >
                  <BusinessCardTrashIcon />
                </button>
              </>
            : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const asMemberDashboard = searchParams.get('as') === 'member';
  const [profile, setProfile] = useState<UserProfile | null>(() => peekProfileCache());
  const [profileLoading, setProfileLoading] = useState(() => peekProfileCache() === null);
  const businessPageSize = 5;
  const [businessPage, setBusinessPage] = useState(1);
  const initialBusinessList = peekBusinessListPage(1, businessPageSize);
  const [businesses, setBusinesses] = useState<BusinessListItem[]>(() => initialBusinessList?.results ?? []);
  const [businessesLoading, setBusinessesLoading] = useState(() => initialBusinessList === null);
  const [businessTotalCount, setBusinessTotalCount] = useState(() => initialBusinessList?.count ?? 0);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeSubscriptionApi, setActiveSubscriptionApi] = useState<ActiveSubscriptionResponse | null>(null);
  const [visitCheckLoading, setVisitCheckLoading] = useState(false);
  /** Shown when “Visit website” is blocked by missing subscription (modal instead of toast + redirect). */
  const [visitNeedsRechargeSlug, setVisitNeedsRechargeSlug] = useState<string | null>(null);
  const [removeConfirmBusiness, setRemoveConfirmBusiness] = useState<BusinessListItem | null>(null);
  const [recordActionSlug, setRecordActionSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'websites' | 'analytics'>('dashboard');
  const [allAnalytics, setAllAnalytics] = useState<WebsiteAnalytics[] | null>(null);
  const [allAnalyticsLoading, setAllAnalyticsLoading] = useState(false);
  const [allAnalyticsError, setAllAnalyticsError] = useState<string | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRangePreset>('10d');
  const [siteQrFor, setSiteQrFor] = useState<BusinessListItem | null>(null);
  const [siteQrDataUrl, setSiteQrDataUrl] = useState<string | null>(null);
  const [siteQrLoading, setSiteQrLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfileCached()
      .then((data) => {
        if (!cancelled) {
          setProfile(data);
          setUserInfo(data.email, data.username);
        }
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (asMemberDashboard || profileLoading) return;
    if (isAdminProfile(profile)) {
      router.replace('/user/admin');
    }
  }, [asMemberDashboard, profileLoading, profile, router]);

  useEffect(() => {
    let cancelled = false;
    const hit = peekBusinessListPage(businessPage, businessPageSize);
    if (hit) {
      setBusinesses(hit.results);
      setBusinessTotalCount(hit.count);
      setBusinessesLoading(false);
    } else {
      setBusinessesLoading(true);
    }

    getBusinessListPaginatedCached(businessPage, businessPageSize)
      .then(({ results, count }) => {
        if (!cancelled) {
          setBusinesses(results);
          setBusinessTotalCount(count);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBusinesses([]);
          setBusinessTotalCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setBusinessesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [businessPage, businessPageSize]);

  useEffect(() => {
    if (!siteQrFor?.slug?.trim()) {
      setSiteQrDataUrl(null);
      setSiteQrLoading(false);
      return;
    }
    const landingUrl = publicGymSiteUrl(siteQrFor.slug.trim());
    let cancelled = false;
    setSiteQrLoading(true);
    setSiteQrDataUrl(null);
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
        if (!cancelled) setSiteQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setSiteQrDataUrl(null);
          showToast('Could not generate QR code.');
        }
      })
      .finally(() => {
        if (!cancelled) setSiteQrLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [siteQrFor, showToast]);

  useEffect(() => {
    if (activeTab !== 'analytics') return;
    let cancelled = false;
    const hit = peekAllWebsitesAnalytics(analyticsRange);
    if (hit) {
      setAllAnalytics(hit);
      setAllAnalyticsError(null);
      setAllAnalyticsLoading(false);
    } else {
      setAllAnalyticsLoading(true);
      setAllAnalyticsError(null);
    }
    getAllWebsitesAnalyticsCached(analyticsRange)
      .then((sites) => {
        if (!cancelled) {
          setAllAnalytics(sites);
          setAllAnalyticsError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setAllAnalytics(null);
          setAllAnalyticsError(e instanceof Error ? e.message : 'Failed to load analytics.');
        }
      })
      .finally(() => {
        if (!cancelled) setAllAnalyticsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, analyticsRange]);

  const refetchBusinessesSilently = useCallback(async () => {
    invalidateUserBusinessListCache();
    invalidateUserAnalyticsCache();
    try {
      const res = await getBusinessListPaginatedCached(businessPage, businessPageSize, { force: true });
      setBusinesses(res.results);
      setBusinessTotalCount(res.count);
    } catch {
      setBusinesses([]);
      setBusinessTotalCount(0);
    }
  }, [businessPage, businessPageSize]);

  const handleRestoreBusiness = useCallback(
    async (b: BusinessListItem) => {
      const slug = b.slug?.trim();
      if (!slug) return;
      setRecordActionSlug(slug);
      try {
        await postBusinessRecordStatus(slug, { record_status: 'active' });
        showToast('Website is live again.');
        await refetchBusinessesSilently();
        if (selectedBusiness?.slug === slug) {
          try {
            const d = await getBusinessDetail(slug);
            setSelectedBusiness(d);
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Could not restore.');
      } finally {
        setRecordActionSlug(null);
      }
    },
    [refetchBusinessesSilently, selectedBusiness?.slug, showToast]
  );

  const openBusinessDetail = (slug: string) => {
    if (!slug) return;
    setDetailLoading(true);
    setSelectedBusiness(null);
    setActiveSubscriptionApi(null);
    setVisitNeedsRechargeSlug(null);
    getBusinessDetail(slug)
      .then((data) => {
        setSelectedBusiness(data);
        getActiveSubscription(slug)
          .then(setActiveSubscriptionApi)
          .catch(() => setActiveSubscriptionApi(null));
      })
      .catch(() => showToast('Failed to load business details.'))
      .finally(() => setDetailLoading(false));
  };

  const closeModal = useCallback(() => {
    setSelectedBusiness(null);
    setDetailLoading(false);
    setActiveSubscriptionApi(null);
    setVisitNeedsRechargeSlug(null);
  }, []);

  const confirmRemoveBusiness = useCallback(async () => {
    const slug = removeConfirmBusiness?.slug?.trim();
    if (!slug) return;
    setRecordActionSlug(slug);
    try {
      await postBusinessRecordStatus(slug, { record_status: 'inactive' });
      setRemoveConfirmBusiness(null);
      showToast('Website hidden. Use Restore on the card to bring it back.');
      if (selectedBusiness?.slug === slug) closeModal();
      await refetchBusinessesSilently();
    } catch (e) {
      if (e instanceof BusinessDeactivateBlockedError) {
        showToast(e.message);
      } else {
        showToast(e instanceof Error ? e.message : 'Could not remove website.');
      }
    } finally {
      setRecordActionSlug(null);
    }
  }, [removeConfirmBusiness?.slug, refetchBusinessesSilently, selectedBusiness?.slug, showToast, closeModal]);

  const handleVisitWebsite = () => {
    const slug = selectedBusiness?.slug;
    if (!slug) return;
    setVisitCheckLoading(true);
    getActiveSubscription(slug)
      .then((data) => {
        if (data.has_active_subscription && data.is_active !== false) {
          closeModal();
          visitPublicGymSite(slug, (to, opts) => (opts?.replace ? router.replace(to) : router.push(to)));
        } else {
          setVisitNeedsRechargeSlug(slug);
        }
      })
      .catch(() => showToast('Could not check subscription status.'))
      .finally(() => setVisitCheckLoading(false));
  };

  const stored = getUserInfo();
  const displayName = profile?.username ?? profile?.email ?? stored.username ?? stored.email ?? '—';
  const initial = (profile?.username?.[0] ?? profile?.email?.[0] ?? stored.username?.[0] ?? stored.email?.[0] ?? '?').toUpperCase();
  const displayUsername = profile?.username ?? stored.username ?? '—';
  const displayEmail = profile?.email ?? stored.email ?? '—';
  const profilePhone = (profile as { phone?: string })?.phone;
  const activeCount = businesses.filter(isGymActiveForList).length;
  const inactiveCount = businesses.length - activeCount;

  /** Websites tab: all active gyms first, then inactive; non-archived before archived; then name. */
  const websitesSorted = useMemo(() => {
    return [...businesses].sort((a, b) => {
      const aOn = isGymActiveForList(a);
      const bOn = isGymActiveForList(b);
      if (aOn !== bOn) return aOn ? -1 : 1;
      const aArc = isBusinessArchived(a);
      const bArc = isBusinessArchived(b);
      if (aArc !== bArc) return aArc ? 1 : -1;
      const an = (a.name || a.slug || '').toLowerCase();
      const bn = (b.name || b.slug || '').toLowerCase();
      return an.localeCompare(bn);
    });
  }, [businesses]);
  const analyticsAllowedPresets = allAnalytics?.find((s) => s.time_range?.allowed_presets?.length)?.time_range
    ?.allowed_presets;
  const userPageRangeOptions =
    analyticsAllowedPresets?.length ?
      ANALYTICS_RANGE_OPTIONS.filter((o) => analyticsAllowedPresets.includes(o.value))
    : ANALYTICS_RANGE_OPTIONS;

  const detailArchived = selectedBusiness ? isBusinessArchived(selectedBusiness) : false;
  const removeBusySlug = removeConfirmBusiness?.slug?.trim();
  const removeDialogBusy = Boolean(removeBusySlug && recordActionSlug === removeBusySlug);

  const navItems: { id: typeof activeTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Profile' },
    { id: 'websites', label: 'Websites' },
    { id: 'analytics', label: 'Analytics' },
  ];

  const mainPanelRef = useRef<HTMLDivElement | null>(null);
  const mainPanelScrollCleanupRef = useRef<(() => void) | null>(null);
  const [showScrollTopFab, setShowScrollTopFab] = useState(false);
  const [scrollFabMounted, setScrollFabMounted] = useState(false);

  useEffect(() => {
    setScrollFabMounted(true);
  }, []);

  const SCROLL_TOP_FAB_THRESHOLD = 72;

  const mainPanelRefCallback = useCallback((node: HTMLDivElement | null) => {
    mainPanelScrollCleanupRef.current?.();
    mainPanelScrollCleanupRef.current = null;
    mainPanelRef.current = node;

    if (!node) return;

    const updateFab = () => {
      const panelScrollable = node.scrollHeight > node.clientHeight + 2;
      if (panelScrollable) {
        setShowScrollTopFab(node.scrollTop > SCROLL_TOP_FAB_THRESHOLD);
      } else if (typeof window !== 'undefined') {
        setShowScrollTopFab(window.scrollY > SCROLL_TOP_FAB_THRESHOLD);
      } else {
        setShowScrollTopFab(false);
      }
    };

    const onPanelScroll = () => updateFab();
    const onWindowScroll = () => {
      if (node.scrollHeight > node.clientHeight + 2) return;
      updateFab();
    };

    node.addEventListener('scroll', onPanelScroll, { passive: true });
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateFab()) : null;
    ro?.observe(node);
    updateFab();

    mainPanelScrollCleanupRef.current = () => {
      node.removeEventListener('scroll', onPanelScroll);
      window.removeEventListener('scroll', onWindowScroll);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => () => mainPanelScrollCleanupRef.current?.(), []);

  useEffect(() => {
    const el = mainPanelRef.current;
    if (el) el.scrollTop = 0;
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
    setShowScrollTopFab(false);
    requestAnimationFrame(() => {
      const n = mainPanelRef.current;
      if (!n) return;
      const panelScrollable = n.scrollHeight > n.clientHeight + 2;
      if (panelScrollable) {
        setShowScrollTopFab(n.scrollTop > SCROLL_TOP_FAB_THRESHOLD);
      } else {
        setShowScrollTopFab(typeof window !== 'undefined' && window.scrollY > SCROLL_TOP_FAB_THRESHOLD);
      }
    });
  }, [activeTab]);

  const scrollMainToTop = useCallback(() => {
    const el = mainPanelRef.current;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduce ? 'auto' : 'smooth';
    if (el && el.scrollHeight > el.clientHeight + 2) {
      el.scrollTo({ top: 0, behavior });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior });
    }
  }, []);

  const sidebarNav = (variant: 'desktop' | 'mobile') => (
    <nav
      className={variant === 'mobile' ? 'user-page__mob-nav' : 'user-page__sidebar-nav-links'}
      aria-label={variant === 'mobile' ? 'Section' : undefined}
    >
      {navItems.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`user-page__nav-item${activeTab === id ? ' user-page__nav-item--active' : ''}`}
          onClick={() => setActiveTab(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <PageContainer className="user-page__page-container">
      <main className="user-page">
        <div className="user-page__shell">
          <aside className="user-page__sidebar-nav" aria-label="Account">
            <div className="user-page__sidebar-brand-block">
              <p className="user-page__sidebar-brand-kicker">Your dashboard</p>
              <p className="user-page__sidebar-brand-title">Workspace</p>
            </div>
            <div className="user-page__sidebar-user">
              <div className="user-page__sidebar-avatar" aria-hidden>
                {profileLoading ?
                  <Spinner animation="border" size="sm" className="user-page__sidebar-avatar-spinner" />
                : <span>{initial}</span>}
              </div>
              <div className="user-page__sidebar-user-text">
                <p className="user-page__sidebar-user-name">{profileLoading ? '…' : displayName}</p>
                <p className="user-page__sidebar-user-role">Member</p>
                {!profileLoading && (
                  <p className="user-page__sidebar-user-email text-truncate" title={displayEmail}>
                    {displayEmail}
                  </p>
                )}
              </div>
            </div>
            {sidebarNav('desktop')}
            <div className="user-page__sidebar-divider" aria-hidden />
            <div className="user-page__sidebar-mini-stats">
              <p className="user-page__sidebar-mini-label">Sites</p>
              <div className="user-page__perf-bars user-page__perf-bars--sidebar">
                <div className="user-page__perf-row">
                  <span className="user-page__perf-label">Active</span>
                  <div className="user-page__perf-bar-wrap">
                    <div
                      className="user-page__perf-bar user-page__perf-bar--active"
                      style={{ width: businesses.length ? `${(activeCount / businesses.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="user-page__perf-count">{activeCount}</span>
                </div>
                <div className="user-page__perf-row">
                  <span className="user-page__perf-label">Inactive</span>
                  <div className="user-page__perf-bar-wrap">
                    <div
                      className="user-page__perf-bar user-page__perf-bar--inactive"
                      style={{ width: businesses.length ? `${(inactiveCount / businesses.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="user-page__perf-count">{inactiveCount}</span>
                </div>
              </div>
              <ul className="user-page__sidebar-stats-compact">
                <li>
                  Total <strong>{businessTotalCount}</strong>
                </li>
              </ul>
            </div>
            <div className="user-page__sidebar-footer">
              <Link href={PLANS_PAGE_PATH} className="user-page__sidebar-footer-link">
                Plans &amp; pricing
              </Link>
              <Link href="/" className="user-page__sidebar-footer-link">
                ← Marketing home
              </Link>
            </div>
          </aside>

          <div className="user-page__main-panel" ref={mainPanelRefCallback}>
            <div className="user-page__main-hero-strip" aria-hidden />
            {sidebarNav('mobile')}
            <div className="user-page__main-inner">
              <div className="user-page__main-toolbar d-flex flex-wrap align-items-start justify-content-between gap-3">
                <div className="user-page__main-toolbar-text min-w-0">
                  <h1 className="user-page__main-title mb-0">
                    {activeTab === 'dashboard' && 'Dashboard'}
                    {activeTab === 'profile' && 'Profile'}
                    {activeTab === 'websites' && 'Your websites'}
                    {activeTab === 'analytics' && 'Analytics'}
                  </h1>
                  {activeTab === 'websites' && (
                    <p className="user-page__main-subtitle mb-0">
                      Open, manage, or edit any gym site — everything stays in this workspace until you navigate away.
                    </p>
                  )}
                  {activeTab === 'profile' && (
                    <p className="user-page__main-subtitle mb-0">Account details we have on file.</p>
                  )}
                  {activeTab === 'analytics' && (
                    <p className="user-page__main-subtitle mb-0">Combined lead trends across all your websites.</p>
                  )}
                </div>
                <div className="d-flex flex-wrap gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="user-page__btn-create-website"
                    onClick={() => router.push('/user/create-website/select-template')}
                  >
                    Create website
                  </Button>
                </div>
              </div>

              {activeTab === 'dashboard' && (
                <div className="user-page__dashboard">
                  <p className="user-page__dashboard-lead text-muted mb-4">
                    Welcome back{displayName && displayName !== '—' ? `, ${displayName.split(' ')[0]}` : ''}. Here is a
                    quick snapshot of your Crystal workspace — open Websites to manage gyms or Analytics for lead trends.
                  </p>
                  <Row className="g-3 mb-4">
                    <Col sm={6} xl={3}>
                      <Card className="user-page__stat-card h-100">
                        <Card.Body className="py-3">
                          <p className="user-page__stat-label mb-1">Total websites</p>
                          <p className="user-page__stat-value mb-0">{businessTotalCount}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} xl={3}>
                      <Card className="user-page__stat-card h-100">
                        <Card.Body className="py-3">
                          <p className="user-page__stat-label mb-1">Active</p>
                          <p className="user-page__stat-value user-page__stat-value--accent mb-0">{activeCount}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} xl={3}>
                      <Card className="user-page__stat-card h-100">
                        <Card.Body className="py-3">
                          <p className="user-page__stat-label mb-1">Inactive</p>
                          <p className="user-page__stat-value mb-0">{inactiveCount}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} xl={3}>
                      <Card className="user-page__stat-card h-100">
                        <Card.Body className="py-3">
                          <p className="user-page__stat-label mb-1">Account</p>
                          <p className="user-page__stat-value user-page__stat-value--small mb-0 text-truncate" title={displayEmail}>
                            {displayEmail}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  <Card className="user-page__card user-page__dashboard-cta-card">
                    <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                      <div>
                        <h3 className="h6 mb-1">Launch a new gym site</h3>
                        <p className="text-muted small mb-0">Use the builder to add branding, themes, and content.</p>
                      </div>
                      <Button className="user-page__btn-create-website" onClick={() => router.push('/user/create-website/select-template')}>
                        Start create flow
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {activeTab === 'profile' && (
                <Card className="user-page__card user-page__overview-card">
                  <Card.Body>
                    <h3 className="user-page__overview-title">Account details</h3>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="user-page__overview-item">
                        <span className="user-page__profile-label">Username</span>
                        <span className="user-page__profile-value">{displayUsername}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="user-page__overview-item">
                        <span className="user-page__profile-label">Email</span>
                        <span className="user-page__profile-value">{displayEmail}</span>
                      </ListGroup.Item>
                      {profilePhone ?
                        <ListGroup.Item className="user-page__overview-item">
                          <span className="user-page__profile-label">Phone</span>
                          <span className="user-page__profile-value">{profilePhone}</span>
                        </ListGroup.Item>
                      : null}
                    </ListGroup>
                    <Button variant="outline-secondary" size="sm" className="mt-3" disabled aria-label="Edit profile (not available)">
                      Edit profile
                    </Button>
                    <Link href="/" className="user-page__back-link d-block mt-3">
                      ← Back to home
                    </Link>
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'websites' && (
                <>
                  {businessesLoading ? (
                    <div className="user-page__loading user-page__loading--center py-5">
                      <Spinner animation="border" /> Loading businesses…
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="user-page__empty">
                      <div className="user-page__empty-icon-wrap"><span className="user-page__empty-icon" aria-hidden>◇</span></div>
                      <p className="user-page__empty-title">No businesses yet</p>
                      <p className="user-page__empty-hint">Your connected businesses will appear here.</p>
                    </div>
                  ) : (
                    <div className="user-page__business-list">
                      {websitesSorted.map((b, index) => (
                        <BusinessCard
                          key={(b as { id?: string }).id ?? b.slug ?? `business-${index}`}
                          b={b}
                          onOpen={openBusinessDetail}
                          isActive={isGymActiveForList}
                          actionSlug={recordActionSlug}
                          onRequestRemove={setRemoveConfirmBusiness}
                          onRestore={handleRestoreBusiness}
                          onOpenSiteQr={setSiteQrFor}
                        />
                      ))}
                    </div>
                  )}
                  {!businessesLoading && businesses.length > 0 && businessTotalCount > businessPageSize && (
                    <div className="user-page__pagination-wrap">
                      <Pagination className="user-page__pagination justify-content-center mb-0">
                        <Pagination.First disabled={businessPage <= 1} onClick={(e: React.MouseEvent) => { e.preventDefault(); setBusinessPage(1); }} />
                        <Pagination.Prev disabled={businessPage <= 1} onClick={(e: React.MouseEvent) => { e.preventDefault(); setBusinessPage((p) => Math.max(1, p - 1)); }} />
                        {(() => {
                          const totalPages = Math.ceil(businessTotalCount / businessPageSize);
                          const start = Math.max(1, businessPage - 2);
                          const end = Math.min(totalPages, businessPage + 2);
                          const items: React.ReactNode[] = [];
                          for (let i = start; i <= end; i++) {
                            items.push(<Pagination.Item key={i} active={i === businessPage} onClick={(e: React.MouseEvent) => { e.preventDefault(); setBusinessPage(i); }}>{i}</Pagination.Item>);
                          }
                          return items;
                        })()}
                        <Pagination.Next disabled={businessPage >= Math.ceil(businessTotalCount / businessPageSize)} onClick={(e: React.MouseEvent) => { e.preventDefault(); setBusinessPage((p) => Math.min(Math.ceil(businessTotalCount / businessPageSize), p + 1)); }} />
                        <Pagination.Last disabled={businessPage >= Math.ceil(businessTotalCount / businessPageSize)} onClick={(e: React.MouseEvent) => { e.preventDefault(); setBusinessPage(Math.ceil(businessTotalCount / businessPageSize)); }} />
                      </Pagination>
                      <p className="user-page__pagination-info text-center text-muted small mt-2 mb-0">Page {businessPage} of {Math.ceil(businessTotalCount / businessPageSize)} · {businessTotalCount} total</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'analytics' && (
                <div className="user-page__analytics-tab user-page__analytics-tab--panel">
                  <p className="text-muted small mb-2">
                    Overall lead trends across your gyms. For site-specific charts and breakdowns, open that website’s Manage page.
                  </p>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <Form.Label className="small text-muted mb-0">Time range</Form.Label>
                    <Form.Select
                      size="sm"
                      style={{ maxWidth: 220 }}
                      value={analyticsRange}
                      onChange={(e) => setAnalyticsRange(e.target.value as AnalyticsRangePreset)}
                      aria-label="Analytics time range for all sites"
                    >
                      {userPageRangeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  {allAnalyticsLoading && (!allAnalytics || allAnalytics.length === 0) ?
                    <div className="user-page__loading user-page__loading--center py-5">
                      <Spinner animation="border" /> Loading analytics…
                    </div>
                  : null}
                  {allAnalyticsError ?
                    <Alert variant="danger">{allAnalyticsError}</Alert>
                  : null}
                  {!allAnalyticsLoading && !allAnalyticsError && allAnalytics && allAnalytics.length === 0 ?
                    <Card className="user-page__card">
                      <Card.Body className="text-muted small">No businesses yet — analytics will appear here once you create a gym.</Card.Body>
                    </Card>
                  : null}
                  {!allAnalyticsLoading && !allAnalyticsError && allAnalytics && allAnalytics.length > 0 ?
                    <>
                      <OverallLeadsByWebsiteChart sites={allAnalytics} />
                      <Card className="user-page__card user-page__analytics-manage-hint mt-3">
                        <Card.Body className="py-3">
                          <h3 className="h6 mb-2">Per-website analytics</h3>
                          <p className="text-muted small mb-3 mb-md-2">
                            Select a site to open its Manage page — detailed analytics for that gym are there.
                          </p>
                          <ListGroup variant="flush" className="user-page__analytics-manage-list rounded border">
                            {allAnalytics.map((site) => {
                              const s = site.business?.slug?.trim();
                              if (!s) return null;
                              const label = site.business?.name?.trim() || s;
                              return (
                                <ListGroup.Item
                                  key={s}
                                  action
                                  as={Link}
                                  href={`/user/business/${encodeURIComponent(s)}/manage`}
                                  className="d-flex justify-content-between align-items-center py-3"
                                >
                                  <span className="fw-medium text-body">{label}</span>
                                  <span className="text-primary small fw-semibold">Manage →</span>
                                </ListGroup.Item>
                              );
                            })}
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </>
                  : null}
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
      {scrollFabMounted &&
        showScrollTopFab &&
        createPortal(
          <button
            type="button"
            className="user-page__scroll-fab user-page__scroll-fab--up"
            onClick={scrollMainToTop}
            aria-label="Scroll to top"
          >
            <svg
              className="user-page__scroll-fab__chevron"
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

      <Modal
        show={siteQrFor !== null}
        onHide={() => setSiteQrFor(null)}
        centered
        className="user-page__site-qr-modal"
        aria-labelledby="user-page-site-qr-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="user-page-site-qr-title">Site QR code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="user-page__site-qr-body">
          {(() => {
            const slugSafe = siteQrFor?.slug?.trim() ?? '';
            if (!slugSafe || !siteQrFor) return null;
            const landingUrl = publicGymSiteUrl(slugSafe);
            const displayName = (siteQrFor.name ?? slugSafe).trim() || slugSafe;
            return (
              <>
                <p className="small text-muted mb-2">
                  Scan to open <strong>{displayName}</strong>
                  {"'"}s public landing page.
                </p>
                <code className="user-page__site-qr-url d-block">{landingUrl}</code>
                {siteQrLoading ?
                  <div className="py-4">
                    <Spinner animation="border" role="status" />
                  </div>
                : siteQrDataUrl ?
                  <div className="user-page__site-qr-frame">
                    <img src={siteQrDataUrl} alt="" className="user-page__site-qr-img" width={256} height={256} />
                    <SiteQrLogoOverlay business={siteQrFor} />
                  </div>
                : (
                  <p className="text-danger small mb-0">Could not create QR code.</p>
                )}
                <div className="user-page__site-qr-actions">
                  {siteQrDataUrl ?
                    <Button
                      as="a"
                      variant="primary"
                      size="sm"
                      href={siteQrDataUrl}
                      download={`${slugSafe}-website-qr.png`}
                    >
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
                          await navigator.clipboard.writeText(landingUrl);
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
              </>
            );
          })()}
        </Modal.Body>
      </Modal>

      {/* Business detail modal */}
      <Modal
        show={selectedBusiness !== null || detailLoading}
        onHide={closeModal}
        centered
        className="user-page__modal"
      >
        <Modal.Header closeButton className="user-page__modal-header">
          {detailLoading ? (
            <Modal.Title>Loading…</Modal.Title>
          ) : selectedBusiness ? (
            <>
              <div className="user-page__modal-header-content">
                <div className="user-page__modal-hero-icon" aria-hidden>◆</div>
                <div className="user-page__modal-hero-text">
                  <h2 className="user-page__modal-hero-title">{selectedBusiness.name ?? '—'}</h2>
                  <p className="user-page__modal-hero-slug">{publicSiteDisplayLabel(selectedBusiness.slug)}</p>
                </div>
              </div>
              {activeSubscriptionApi != null && (
                <Badge
                  pill
                  className={`user-page__modal-header-status user-page__status-badge ${
                    activeSubscriptionApi.has_active_subscription && activeSubscriptionApi.is_active !== false ?
                      'user-page__status-badge--active'
                    : 'user-page__status-badge--inactive'
                  }`}
                >
                  <span className="user-page__status-badge-text">
                    {activeSubscriptionApi.has_active_subscription && activeSubscriptionApi.is_active !== false ?
                      'Active'
                    : 'Inactive'}
                  </span>
                </Badge>
              )}
            </>
          ) : (
            <Modal.Title>Business details</Modal.Title>
          )}
        </Modal.Header>
        <Modal.Body className="user-page__modal-body p-0">
          {detailLoading ? (
            <div className="user-page__loading user-page__loading--center py-5">
              <Spinner animation="border" /> Loading…
            </div>
          ) : selectedBusiness ? (
            <>
              <div className="user-page__modal-content">
                {detailArchived ?
                  <Alert variant="warning" className="user-page__modal-archived-alert rounded-0 border-0 mb-0">
                    This site is hidden from the public. Restore it from the actions below when you are ready to publish
                    again.
                  </Alert>
                : null}
                <section className="user-page__detail-section">
                  <h3 className="user-page__detail-heading">Subscriptions</h3>
                  {!selectedBusiness.subscriptions?.length ? (
                    <p className="user-page__detail-empty text-muted mb-0">No subscriptions</p>
                  ) : (
                    <div className="user-page__subscriptions">
                      {selectedBusiness.subscriptions.map((sub) => (
                        <div key={sub.id} className="user-page__subscription-card">
                          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                            <span className="user-page__subscription-plan">{sub.plan_name}</span>
                            {!isSubscriptionActive(sub.subscription_end_date) ?
                              <Badge pill className="user-page__status-badge user-page__status-badge--inactive">
                                <span className="user-page__status-badge-text">Expired</span>
                              </Badge>
                            : null}
                          </div>
                          <dl className="user-page__subscription-dl">
                            <dt>Payment ID</dt>
                            <dd><code className="user-page__slug-code">{sub.payment_id}</code></dd>
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
              </div>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="user-page__modal-footer user-page__modal-footer--actions">
          {selectedBusiness?.slug && detailArchived ?
            <Button
              variant="primary"
              size="sm"
              disabled={recordActionSlug === selectedBusiness.slug}
              onClick={() => handleRestoreBusiness(selectedBusiness)}
            >
              {recordActionSlug === selectedBusiness.slug ?
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Restoring…
                </>
              : 'Restore website'}
            </Button>
          : selectedBusiness?.slug ?
            <div className="user-page__modal-footer-actions">
              <Button
                variant="outline-secondary"
                size="sm"
                className="user-page__visit-btn user-page__modal-action-btn"
                disabled={visitCheckLoading}
                onClick={handleVisitWebsite}
              >
                <ModalVisitExternalIcon />
                {visitCheckLoading ? 'Checking…' : 'Visit website'}
              </Button>
              <Link
                href={`/user/business/${encodeURIComponent(selectedBusiness.slug)}/manage`}
                className="btn btn-outline-primary btn-sm user-page__modal-manage-btn user-page__modal-action-btn"
                onClick={closeModal}
              >
                <ModalManageSettingsIcon />
                Manage
              </Link>
              <Link
                href={`${PLANS_PAGE_PATH}/${encodeURIComponent(selectedBusiness.slug)}`}
                className="btn btn-outline-secondary btn-sm user-page__modal-plans-btn user-page__modal-action-btn"
                onClick={closeModal}
              >
                <ModalPlansLayersIcon />
                Plans
              </Link>
              <div className="user-page__modal-footer-icon-group">
                <Link
                  href={`/user/business/${encodeURIComponent(selectedBusiness.slug)}/edit/select-template`}
                  className="btn btn-outline-primary btn-sm user-page__modal-edit-icon-btn user-page__modal-action-btn user-page__modal-action-btn--icon-only"
                  onClick={closeModal}
                  aria-label="Edit website content and design"
                  title="Edit website content & design"
                >
                  <BusinessCardEditIcon />
                </Link>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="user-page__modal-remove-icon-btn user-page__modal-action-btn user-page__modal-action-btn--icon-only"
                  onClick={() => setRemoveConfirmBusiness(selectedBusiness)}
                  aria-label="Remove website"
                  title="Remove website"
                >
                  <BusinessCardTrashIcon />
                </Button>
              </div>
            </div>
          : null}
        </Modal.Footer>
      </Modal>

      <Modal
        show={visitNeedsRechargeSlug !== null}
        onHide={() => setVisitNeedsRechargeSlug(null)}
        centered
        backdrop="static"
        aria-labelledby="user-page-recharge-modal-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="user-page-recharge-modal-title">Recharge to view your live site</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">
            This gym does not have an active subscription right now. Go to the pricing page to recharge and restore
            public access.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button type="button" variant="outline-secondary" onClick={() => setVisitNeedsRechargeSlug(null)}>
            Not now
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              const s = visitNeedsRechargeSlug;
              setVisitNeedsRechargeSlug(null);
              if (s) {
                closeModal();
                router.push(`${PLANS_PAGE_PATH}/${encodeURIComponent(s)}`);
              }
            }}
          >
            Recharge now
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={removeConfirmBusiness !== null}
        onHide={() => !removeDialogBusy && setRemoveConfirmBusiness(null)}
        centered
        backdrop={removeDialogBusy ? 'static' : true}
        keyboard={!removeDialogBusy}
        dialogClassName="user-page__remove-website-modal"
        contentClassName="user-page__remove-website-modal-content"
      >
        <Modal.Header closeButton className="user-page__remove-website-modal-header border-0">
          <div className="user-page__remove-website-modal-header-main">
            <Image src={logo} alt="" className="user-page__remove-website-modal-logo" width={48} height={48} />
            <Modal.Title as="h2" className="user-page__remove-website-modal-title">
              Remove website?
            </Modal.Title>
            {removeConfirmBusiness?.name ?
              <p className="user-page__remove-website-modal-business text-muted small mb-0">
                {removeConfirmBusiness.name}
                {removeConfirmBusiness.slug ?
                  <span className="user-page__remove-website-modal-slug">
                    {' '}
                    · {publicSiteDisplayLabel(removeConfirmBusiness.slug)}
                  </span>
                : null}
              </p>
            : null}
          </div>
        </Modal.Header>
        <Modal.Body className="user-page__remove-website-modal-body">
          <p className="mb-2 mb-md-3">
            Your public gym page will be hidden until you restore it from your business list.
          </p>
          <p className="text-muted small mb-0">
            If you still have an active paid plan, removal may be blocked until the subscription ends or is cancelled.
          </p>
        </Modal.Body>
        <Modal.Footer className="user-page__remove-website-modal-footer border-0">
          <Button variant="secondary" onClick={() => setRemoveConfirmBusiness(null)} disabled={removeDialogBusy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRemoveBusiness} disabled={removeDialogBusy}>
            {removeDialogBusy ?
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
