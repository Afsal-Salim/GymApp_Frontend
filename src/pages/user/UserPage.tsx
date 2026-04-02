import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Modal, Button, ListGroup, Badge, Nav, Pagination, Alert, Form } from 'react-bootstrap';
import { PageContainer } from '../../components';
import {
  getProfileCached,
  peekProfileCache,
  getBusinessListPaginatedCached,
  peekBusinessListPage,
  getBusinessDetail,
  getActiveSubscription,
  getAllWebsitesAnalytics,
  getUserInfo,
  setUserInfo,
  isAdminProfile,
  ANALYTICS_RANGE_OPTIONS,
  postBusinessRecordStatus,
  BusinessDeactivateBlockedError,
  invalidateUserBusinessListCache,
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
import { visitPublicGymSite } from '../../config/env';
import { PLANS_PAGE_PATH } from '../plans/PlansPage';
import { WebsiteAnalyticsPanel } from './WebsiteAnalyticsPanel';
import { OverallLeadsByWebsiteChart } from './OverallLeadsByWebsiteChart';
import logo from '../../assets/logo.svg';
import './UserPage.css';

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

/** Public site hidden (soft-deleted); not shown as a “record status” label in the UI. */
function isBusinessArchived(b: BusinessListItem): boolean {
  return (b as BusinessDetail).record_status === 'inactive';
}

function BusinessCardLocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c-3.5-3.2-6-6.4-6-10a6 6 0 1 1 12 0c0 3.6-2.5 6.8-6 10z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function BusinessCardPhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8.5 3h2.2c.35 0 .65.22.75.55l1.1 3.65a.8.8 0 0 1-.2.75l-1.35 1.35a12 12 0 0 0 5.4 5.4l1.35-1.35c.22-.22.55-.28.85-.18l3.65 1.1c.33.1.55.4.55.75v2.2c0 1.1-.9 2-2 2h-.35C10.4 22 2 13.6 2 3.85 2 2.75 2.9 1.85 4 1.85h.35"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
}: {
  b: BusinessListItem;
  onOpen: (slug: string) => void;
  isActive: (x: BusinessListItem) => boolean;
  actionSlug: string | null;
  onRequestRemove: (b: BusinessListItem) => void;
  onRestore: (b: BusinessListItem) => void;
}) {
  const active = isActive(b);
  const archived = isBusinessArchived(b);
  const slugBusy = Boolean(b.slug && actionSlug === b.slug);
  const address = b.address != null && String(b.address).trim() !== '' ? String(b.address).trim() : '';
  const phone = b.phone != null && String(b.phone).trim() !== '' ? String(b.phone).trim() : '';
  return (
    <Card
      className={`user-page__business-card-item h-100${archived ? ' user-page__business-card-item--archived' : ''}`}
    >
      <Card.Body className="user-page__business-card-body">
        <div className="user-page__business-card-header">
          <div className="user-page__business-icon" aria-hidden>
            <span className="user-page__business-icon-mark">◆</span>
          </div>
          <div
            className={`user-page__business-card-head${!archived && b.slug ? ' user-page__business-card-head--pad-trash' : ''}`}
          >
            <div className="user-page__business-card-title-row">
              <Card.Title as="h3" className="user-page__business-card-title">
                {b.name || b.slug || '—'}
              </Card.Title>
              <Badge
                pill
                bg={active ? 'success' : 'secondary'}
                className="user-page__status-badge"
              >
                {active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {b.slug ?
              <p className="user-page__business-slug">
                <span className="user-page__business-slug-label">Site</span>
                <span className="user-page__business-slug-value">/{b.slug}</span>
              </p>
            : null}
            {archived ?
              <p className="user-page__business-card-archived-note mb-0">
                Hidden from the web. Restore anytime to publish again.
              </p>
            : null}
          </div>
        </div>

        <dl className="user-page__business-meta-list">
          <div className="user-page__business-meta-row">
            <dt className="user-page__business-meta-dt">
              <BusinessCardLocationIcon className="user-page__meta-glyph" />
              <span className="visually-hidden">Address</span>
            </dt>
            <dd className={`user-page__business-meta-dd ${address ? '' : 'user-page__business-meta-dd--empty'}`}>
              {address || 'No address on file'}
            </dd>
          </div>
          <div className="user-page__business-meta-row">
            <dt className="user-page__business-meta-dt">
              <BusinessCardPhoneIcon className="user-page__meta-glyph" />
              <span className="visually-hidden">Phone</span>
            </dt>
            <dd className={`user-page__business-meta-dd ${phone ? '' : 'user-page__business-meta-dd--empty'}`}>
              {phone || 'No phone on file'}
            </dd>
          </div>
        </dl>

        {archived && b.slug ?
          <div className="user-page__business-card-actions user-page__business-card-actions--archived">
            <Button
              variant="outline-secondary"
              size="sm"
              className="user-page__business-action-btn"
              disabled={slugBusy}
              onClick={(e) => {
                e.stopPropagation();
                onOpen(b.slug!);
              }}
            >
              View
            </Button>
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
              : 'Restore website'}
            </Button>
          </div>
        : (
          <>
            <div
              className={`user-page__business-card-actions${b.slug ? '' : ' user-page__business-card-actions--single'}`}
            >
              <Button
                variant="primary"
                size="sm"
                className="user-page__btn-view user-page__business-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (b.slug) onOpen(b.slug);
                }}
              >
                View
              </Button>
              {b.slug ?
                <>
                  <Link
                    to={`/user/business/${encodeURIComponent(b.slug)}/manage`}
                    className="btn btn-outline-primary btn-sm user-page__btn-manage user-page__business-action-btn"
                    title="Analytics, leads & enquiries"
                  >
                    Manage
                  </Link>
                  <Link
                    to={`/user/business/${encodeURIComponent(b.slug)}/edit`}
                    className="btn btn-outline-secondary btn-sm user-page__business-action-btn user-page__business-action-btn--icon"
                    title="Edit website content & design"
                    aria-label="Edit website"
                  >
                    <BusinessCardEditIcon />
                  </Link>
                </>
              : null}
            </div>
            {b.slug ?
              <button
                type="button"
                className="user-page__business-remove-fab"
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
            : null}
          </>
        )}
      </Card.Body>
    </Card>
  );
}

export default function UserPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [removeConfirmBusiness, setRemoveConfirmBusiness] = useState<BusinessListItem | null>(null);
  const [recordActionSlug, setRecordActionSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'analytics'>('businesses');
  const [allAnalytics, setAllAnalytics] = useState<WebsiteAnalytics[] | null>(null);
  const [allAnalyticsLoading, setAllAnalyticsLoading] = useState(false);
  const [allAnalyticsError, setAllAnalyticsError] = useState<string | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRangePreset>('10d');

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
      navigate('/user/admin', { replace: true });
    }
  }, [asMemberDashboard, profileLoading, profile, navigate]);

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
    if (activeTab !== 'analytics') return;
    let cancelled = false;
    setAllAnalyticsLoading(true);
    setAllAnalyticsError(null);
    getAllWebsitesAnalytics(analyticsRange)
      .then((sites) => {
        if (!cancelled) setAllAnalytics(sites);
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
        if (data.has_active_subscription) {
          closeModal();
          visitPublicGymSite(slug, navigate);
        } else {
          closeModal();
          navigate(`${PLANS_PAGE_PATH}/${encodeURIComponent(slug)}`);
          showToast('No active subscription. Choose a plan to continue.');
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
  const activeCount = businesses.filter(isBusinessActive).length;
  const inactiveCount = businesses.length - activeCount;
  const analyticsAllowedPresets = allAnalytics?.find((s) => s.time_range?.allowed_presets?.length)?.time_range
    ?.allowed_presets;
  const userPageRangeOptions =
    analyticsAllowedPresets?.length ?
      ANALYTICS_RANGE_OPTIONS.filter((o) => analyticsAllowedPresets.includes(o.value))
    : ANALYTICS_RANGE_OPTIONS;

  const detailArchived = selectedBusiness ? isBusinessArchived(selectedBusiness) : false;
  const removeBusySlug = removeConfirmBusiness?.slug?.trim();
  const removeDialogBusy = Boolean(removeBusySlug && recordActionSlug === removeBusySlug);

  return (
    <PageContainer>
      <main className="user-page">
        <Container className="user-page__container">
          <Row className="user-page__row">
            {/* Main content */}
            <Col lg={8} className="user-page__main">
              {/* Profile header card with wavy top */}
              <Card className="user-page__profile-header-card">
                <div className="user-page__profile-wavy" aria-hidden />
                <Card.Body className="user-page__profile-body">
                  <div className="user-page__profile-top">
                    <div className="user-page__avatar-wrap">
                      <div className="user-page__avatar" aria-hidden>
                        {profileLoading ? (
                          <Spinner animation="border" size="sm" className="user-page__avatar-spinner" />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                      <span className="user-page__avatar-badge" aria-hidden>✓</span>
                    </div>
                    <div className="user-page__profile-info">
                      {profileLoading ? (
                        <div className="user-page__loading user-page__loading--profile">
                          <Spinner animation="border" size="sm" /> Loading profile…
                        </div>
                      ) : (
                        <>
                          <div className="user-page__profile-name-row">
                            <h2 className="user-page__profile-name">{displayName}</h2>
                            <span className="user-page__profile-check" aria-hidden>✓</span>
                          </div>
                          <p className="user-page__profile-role">Member</p>
                          <div className="user-page__profile-contact">
                            <div className="user-page__contact-row">
                              <span className="user-page__contact-icon" aria-hidden>✉</span>
                              <span>{displayEmail}</span>
                            </div>
                            {profilePhone && (
                              <div className="user-page__contact-row">
                                <span className="user-page__contact-icon" aria-hidden>📞</span>
                                <span>{profilePhone}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="user-page__profile-actions d-flex gap-2 align-items-center flex-wrap">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm user-page__btn-create-website"
                        onClick={() => navigate('/user/create-website')}
                      >
                        Create website
                      </button>
                      <Button variant="outline-secondary" size="sm" className="user-page__btn-edit-profile" disabled aria-label="Edit profile (not available)">Edit Profile</Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Tabs: Overview | Businesses */}
              <Nav variant="tabs" className="user-page__tabs">
                <Nav.Item>
                  <Nav.Link eventKey="overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="businesses" active={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')}>Businesses</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>Analytics</Nav.Link>
                </Nav.Item>
              </Nav>

              {/* Tab content */}
              {activeTab === 'overview' && (
                <Card className="user-page__card user-page__overview-card">
                  <Card.Body>
                    <h3 className="user-page__overview-title">Profile</h3>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="user-page__overview-item">
                        <span className="user-page__profile-label">Username</span>
                        <span className="user-page__profile-value">{displayUsername}</span>
                      </ListGroup.Item>
                      <ListGroup.Item className="user-page__overview-item">
                        <span className="user-page__profile-label">Email</span>
                        <span className="user-page__profile-value">{displayEmail}</span>
                      </ListGroup.Item>
                    </ListGroup>
                    <Link to="/" className="user-page__back-link mt-3">← Back to home</Link>
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'businesses' && (
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
                    <Row xs={1} md={2} className="g-3 g-xl-4 user-page__business-grid">
                      {businesses.map((b, index) => (
                        <Col
                          key={(b as { id?: string }).id ?? b.slug ?? `business-${index}`}
                          className="d-flex"
                        >
                          <BusinessCard
                            b={b}
                            onOpen={openBusinessDetail}
                            isActive={isBusinessActive}
                            actionSlug={recordActionSlug}
                            onRequestRemove={setRemoveConfirmBusiness}
                            onRestore={handleRestoreBusiness}
                          />
                        </Col>
                      ))}
                    </Row>
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
                          const items = [];
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
                <div className="user-page__analytics-tab">
                  <p className="text-muted small mb-2">
                    Compare lead trends across gyms (same time window as Manage when using the same range). Per-site cards below include full detail.
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
                    <OverallLeadsByWebsiteChart sites={allAnalytics} />
                  : null}
                  {allAnalytics?.map((site) => {
                    const s = site.business?.slug;
                    if (!s) return null;
                    return (
                      <Card key={s} className="user-page__card user-page__analytics-site-card mb-3">
                        <Card.Header className="user-page__analytics-site-head d-flex flex-wrap justify-content-between align-items-center gap-2 py-2 px-3">
                          <span className="small fw-semibold text-uppercase text-muted mb-0">Website</span>
                          <Link
                            to={`/user/business/${encodeURIComponent(s)}/manage`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Manage
                          </Link>
                        </Card.Header>
                        <Card.Body className="pt-3">
                          <WebsiteAnalyticsPanel data={site} loading={false} error={null} showBusinessHeader />
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Col>

            {/* Sidebar */}
            <Col lg={4} className="user-page__sidebar">
              <Card className="user-page__sidebar-card">
                <Card.Body>
                  <h3 className="user-page__sidebar-title">Rating</h3>
                  <p className="user-page__sidebar-rating-value">—</p>
                  <p className="user-page__sidebar-rating-hint text-muted small mb-0">Not available</p>
                </Card.Body>
              </Card>
              <Card className="user-page__sidebar-card">
                <Card.Body>
                  <h3 className="user-page__sidebar-title">Business Performance</h3>
                  <div className="user-page__perf-bars">
                    <div className="user-page__perf-row">
                      <span className="user-page__perf-label">Active</span>
                      <div className="user-page__perf-bar-wrap">
                        <div className="user-page__perf-bar user-page__perf-bar--active" style={{ width: businesses.length ? `${(activeCount / businesses.length) * 100}%` : '0%' }} />
                      </div>
                      <span className="user-page__perf-count">{activeCount}</span>
                    </div>
                    <div className="user-page__perf-row">
                      <span className="user-page__perf-label">Inactive</span>
                      <div className="user-page__perf-bar-wrap">
                        <div className="user-page__perf-bar user-page__perf-bar--inactive" style={{ width: businesses.length ? `${(inactiveCount / businesses.length) * 100}%` : '0%' }} />
                      </div>
                      <span className="user-page__perf-count">{inactiveCount}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              <Card className="user-page__sidebar-card">
                <Card.Body>
                  <h3 className="user-page__sidebar-title">Stats</h3>
                  <ul className="user-page__stats-list">
                    <li>Total Businesses: <strong>{businessTotalCount}</strong></li>
                    <li>Active: <strong>{activeCount}</strong></li>
                    <li>Growth: <span className="text-muted">—</span></li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      {/* Business detail modal */}
      <Modal show={selectedBusiness !== null || detailLoading} onHide={closeModal} className="user-page__modal">
        <Modal.Header closeButton className="user-page__modal-header">
          {detailLoading ? (
            <Modal.Title>Loading…</Modal.Title>
          ) : selectedBusiness ? (
            <>
              <div className="user-page__modal-header-content">
                <div className="user-page__modal-hero-icon" aria-hidden>◆</div>
                <div className="user-page__modal-hero-text">
                  <h2 className="user-page__modal-hero-title">{selectedBusiness.name ?? '—'}</h2>
                  <p className="user-page__modal-hero-slug">/{selectedBusiness.slug ?? '—'}</p>
                </div>
              </div>
              {activeSubscriptionApi != null && (
                <Badge bg={activeSubscriptionApi.has_active_subscription ? 'success' : 'secondary'} className="user-page__modal-header-status">
                  {activeSubscriptionApi.has_active_subscription ? 'Active' : 'Inactive'}
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
                  <h3 className="user-page__detail-heading">Business details</h3>
                  <dl className="user-page__detail-dl">
                    <dt>Name</dt>
                    <dd>{selectedBusiness.name ?? '—'}</dd>
                    <dt>Slug</dt>
                    <dd><code className="user-page__slug-code">/{selectedBusiness.slug ?? '—'}</code></dd>
                    {selectedBusiness.description != null && selectedBusiness.description !== '' && (
                      <>
                        <dt>Description</dt>
                        <dd>{selectedBusiness.description}</dd>
                      </>
                    )}
                    <dt>Phone</dt>
                    <dd>{selectedBusiness.phone ?? '—'}</dd>
                    <dt>Address</dt>
                    <dd>{selectedBusiness.address ?? '—'}</dd>
                    {selectedBusiness.owner_email != null && (
                      <>
                        <dt>Owner email</dt>
                        <dd>{selectedBusiness.owner_email}</dd>
                      </>
                    )}
                    {selectedBusiness.owner_username != null && (
                      <>
                        <dt>Owner username</dt>
                        <dd>{selectedBusiness.owner_username}</dd>
                      </>
                    )}
                    <dt>Created</dt>
                    <dd>{formatDate(selectedBusiness.created_at)}</dd>
                    <dt>Updated</dt>
                    <dd>{formatDate(selectedBusiness.updated_at)}</dd>
                  </dl>
                </section>
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
                            <Badge
                              bg={isSubscriptionActive(sub.subscription_end_date) ? 'success' : 'secondary'}
                              className="user-page__status-badge"
                            >
                              {isSubscriptionActive(sub.subscription_end_date) ? 'Active' : 'Inactive'}
                            </Badge>
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
            <>
              <Button
                variant="outline-secondary"
                className="user-page__visit-btn"
                disabled={visitCheckLoading}
                onClick={handleVisitWebsite}
              >
                {visitCheckLoading ? 'Checking…' : 'Visit website'}
              </Button>
              <Link
                to={`/user/business/${encodeURIComponent(selectedBusiness.slug)}/manage`}
                className="btn btn-outline-primary btn-sm user-page__modal-manage-btn"
                onClick={closeModal}
              >
                Manage
              </Link>
              <Link
                to={`${PLANS_PAGE_PATH}/${encodeURIComponent(selectedBusiness.slug)}`}
                className="btn btn-outline-secondary btn-sm user-page__modal-plans-btn"
                onClick={closeModal}
              >
                Plans
              </Link>
              <Link
                to={`/user/business/${encodeURIComponent(selectedBusiness.slug)}/edit`}
                className="btn btn-outline-secondary btn-sm user-page__modal-edit-btn"
                onClick={closeModal}
              >
                Edit website
              </Link>
              <Button
                variant="outline-danger"
                size="sm"
                className="user-page__modal-remove-icon-btn"
                onClick={() => setRemoveConfirmBusiness(selectedBusiness)}
                aria-label="Remove website"
                title="Remove website"
              >
                <BusinessCardTrashIcon />
              </Button>
            </>
          : null}
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
            <img src={logo} alt="" className="user-page__remove-website-modal-logo" width={48} height={48} />
            <Modal.Title as="h2" className="user-page__remove-website-modal-title">
              Remove website?
            </Modal.Title>
            {removeConfirmBusiness?.name ?
              <p className="user-page__remove-website-modal-business text-muted small mb-0">
                {removeConfirmBusiness.name}
                {removeConfirmBusiness.slug ?
                  <span className="user-page__remove-website-modal-slug"> · /{removeConfirmBusiness.slug}</span>
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
