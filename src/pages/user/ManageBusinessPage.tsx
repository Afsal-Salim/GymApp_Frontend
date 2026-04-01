import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { PageContainer } from '../../components';
import { getBusinessWebsiteAnalytics } from '../../api';
import type { WebsiteAnalytics, AnalyticsRangePreset } from '../../api/businesses';
import { PLANS_PAGE_PATH } from '../plans/PlansPage';
import { WebsiteAnalyticsPanel } from './WebsiteAnalyticsPanel';
import './ManageBusinessPage.css';

function ManageBusinessPageLoaded({ slug }: { slug: string }) {
  const [data, setData] = useState<WebsiteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRangePreset>('10d');
  const slugEnc = encodeURIComponent(slug);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBusinessWebsiteAnalytics(slug, { range: analyticsRange })
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
      <main className="manage-business-page">
        <Container className="manage-business-page__container py-4">
          <div className="manage-business-page__head d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
            <div>
              <nav className="manage-business-page__crumb small text-muted mb-1">
                <Link to="/user">Profile</Link>
                <span aria-hidden> / </span>
                <span>Manage</span>
              </nav>
              <h1 className="manage-business-page__title h3 mb-1">Manage website</h1>
              <p className="manage-business-page__subtitle text-muted small mb-0">
                Analytics for your public gym page. Subscription and billing are under Plans.
              </p>
            </div>
            <div className="manage-business-page__actions d-flex flex-wrap gap-2">
              <Link to={`/user/business/${slugEnc}/edit`} className="btn btn-outline-secondary btn-sm">
                Edit website
              </Link>
              <Link to={`${PLANS_PAGE_PATH}/${slugEnc}`} className="btn btn-primary btn-sm">
                Plans &amp; billing
              </Link>
            </div>
          </div>

          {loading && !data ?
            <div className="manage-business-page__loading text-center py-5">
              <Spinner animation="border" className="mb-2" />
              <p className="text-muted small mb-0">Loading analytics…</p>
            </div>
          : (
            <WebsiteAnalyticsPanel
              data={data}
              loading={loading}
              error={error}
              showBusinessHeader
              showLeadMixPieAlways
              analyticsRange={analyticsRange}
              onAnalyticsRangeChange={setAnalyticsRange}
            />
          )}
        </Container>
      </main>
    </PageContainer>
  );
}

export default function ManageBusinessPage() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const normalizedSlug = routeSlug?.trim() ?? '';

  if (!normalizedSlug) {
    return (
      <PageContainer>
        <main className="manage-business-page">
          <Container className="manage-business-page__container py-4">
            <div className="manage-business-page__head mb-4">
              <h1 className="manage-business-page__title h3 mb-1">Manage website</h1>
            </div>
            <WebsiteAnalyticsPanel data={null} loading={false} error="Missing business slug." showBusinessHeader={false} />
          </Container>
        </main>
      </PageContainer>
    );
  }

  return <ManageBusinessPageLoaded key={normalizedSlug} slug={normalizedSlug} />;
}
