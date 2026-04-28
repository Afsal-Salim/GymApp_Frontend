'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Card, Container, Spinner } from 'react-bootstrap';
import { PageContainer } from '@/components';
import { getBusinessWebsiteAnalyticsCached, peekBusinessWebsiteAnalytics } from '@/api';
import type { WebsiteAnalytics, AnalyticsRangePreset } from '@/api/businesses';
import { PLANS_PAGE_PATH } from '../../plans/PlansPage/PlansPage';
import { ManageBusinessLeadsSection } from '../ManageBusinessLeadsSection/ManageBusinessLeadsSection';

const WebsiteAnalyticsPanel = dynamic(
  () => import('../WebsiteAnalyticsPanel/WebsiteAnalyticsPanel').then((m) => ({ default: m.WebsiteAnalyticsPanel })),
  {
    ssr: false,
    loading: () => (
      <div className="manage-business-page__loading text-center py-5">
        <Spinner animation="border" className="mb-2" />
        <p className="text-muted small mb-0">Loading charts…</p>
      </div>
    ),
  },
);
import './ManageBusinessPage.css';
import '../WebsiteSettingsPage/WebsiteSettingsPage.css';

function ManageBusinessPageLoaded({ slug }: { slug: string }) {
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRangePreset>('10d');
  const slugEnc = encodeURIComponent(slug);
  const [data, setData] = useState<WebsiteAnalytics | null>(() => peekBusinessWebsiteAnalytics(slug, '10d'));
  const [loading, setLoading] = useState(() => peekBusinessWebsiteAnalytics(slug, '10d') === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hit = peekBusinessWebsiteAnalytics(slug, analyticsRange);
    if (hit) {
      setData(hit);
      setError(null);
      setLoading(false);
    } else {
      setLoading(true);
    }
    getBusinessWebsiteAnalyticsCached(slug, { range: analyticsRange })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setData(null);
          setError(e instanceof Error ? e.message : 'Failed to load analytics.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, analyticsRange]);

  return (
    <PageContainer>
      <main className="manage-business-page website-settings-page">
        <Container className="manage-business-page__container py-3 py-md-4 px-3">
          <div className="manage-business-page__head mb-4">
            <nav className="manage-business-page__crumb small text-muted mb-1">
              <Link href="/user">Profile</Link>
              <span aria-hidden> / </span>
              <Link href={`/user/business/${slugEnc}/settings`}>Settings</Link>
              <span aria-hidden> / </span>
              <span>Manage</span>
            </nav>
            <h1 className="website-settings-page__title">Manage website</h1>
            <p className="website-settings-page__subtitle">
              Analytics, modal leads (join / trial / visit), and business enquiries for your public gym page. Subscription
              and billing are under Plans.
            </p>
          </div>

          <Card className="website-settings-page__card mb-4">
            <Card.Body className="p-3 p-md-4">
              <h2 className="website-settings-page__card-title">Website actions</h2>
              <p className="website-settings-page__card-lead">
                Edit your site or open plans and billing — same shortcuts as on Settings.
              </p>
              <div className="website-settings-page__action-rows manage-business-page__manage-action-rows">
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

          {loading && !data ?
            <div className="manage-business-page__loading text-center py-5">
              <Spinner animation="border" className="mb-2" />
              <p className="text-muted small mb-0">Loading analytics…</p>
            </div>
          : (
            <div className="manage-business-page__analytics-scroll">
              <WebsiteAnalyticsPanel
                data={data}
                loading={loading}
                error={error}
                showBusinessHeader
                showLeadMixPieAlways
                analyticsRange={analyticsRange}
                onAnalyticsRangeChange={setAnalyticsRange}
              />
            </div>
          )}
          <ManageBusinessLeadsSection slug={slug} />
        </Container>
      </main>
    </PageContainer>
  );
}

export default function ManageBusinessPage() {
  const params = useParams<{ slug: string }>();
  const routeSlug = typeof params.slug === 'string' ? params.slug : undefined;
  const normalizedSlug = routeSlug?.trim() ?? '';

  if (!normalizedSlug) {
    return (
      <PageContainer>
        <main className="manage-business-page website-settings-page">
          <Container className="manage-business-page__container py-3 py-md-4 px-3">
            <div className="manage-business-page__head mb-4">
              <h1 className="website-settings-page__title">Manage website</h1>
            </div>
            <WebsiteAnalyticsPanel data={null} loading={false} error="Missing business slug." showBusinessHeader={false} />
          </Container>
        </main>
      </PageContainer>
    );
  }

  return <ManageBusinessPageLoaded key={normalizedSlug} slug={normalizedSlug} />;
}
