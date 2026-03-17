import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../components';
import { getActiveSubscription } from '../api';
import type { ActiveSubscriptionResponse } from '../api';
import { Badge, Spinner } from 'react-bootstrap';
import { PLANS_PAGE_PATH } from './PlansPage';
import './CrystalBusinessPage.css';

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return s;
  }
}

/**
 * Common public page for a business. URL: /crystal/:slug/
 * Content is driven by the business (slug); active subscription checked via public API.
 */
export default function CrystalBusinessPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<ActiveSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getActiveSubscription(slug)
      .then((data) => {
        if (!data.has_active_subscription) {
          navigate(PLANS_PAGE_PATH, { replace: true });
          return;
        }
        setSubscription(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  return (
    <PageContainer className="crystal-business-page">
      <main className="crystal-business-page__main">
        <div className="crystal-business-page__content">
          {!slug ? (
            <p className="crystal-business-page__lead">No business selected.</p>
          ) : loading ? (
            <div className="crystal-business-page__loading">
              <Spinner animation="border" size="sm" /> Checking subscription…
            </div>
          ) : error ? (
            <p className="crystal-business-page__error text-danger">{error}</p>
          ) : (
            <>
              <h1 className="crystal-business-page__title">/{slug}</h1>
              <div className="crystal-business-page__status mb-3">
                <Badge bg={subscription?.has_active_subscription ? 'success' : 'secondary'} className="crystal-business-page__badge">
                  {subscription?.has_active_subscription ? 'Active subscription' : 'Inactive'}
                </Badge>
              </div>
              {subscription?.has_active_subscription && subscription?.subscription && (
                <div className="crystal-business-page__subscription card border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="h6 text-muted mb-2">Current plan</h3>
                    <p className="mb-1 fw-semibold">{subscription.subscription.plan_name}</p>
                    <p className="small text-muted mb-0">
                      {formatDate(subscription.subscription.subscription_start_date)} – {formatDate(subscription.subscription.subscription_end_date)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </PageContainer>
  );
}
