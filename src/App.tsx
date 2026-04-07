import { useEffect, useLayoutEffect, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { EnquiryModalProvider } from './contexts/EnquiryModalContext';
import { MainLayout } from './layouts';
import { ProtectedRoute } from './components';
import {
  getPublicGymSlugFromHost,
  isPublicSiteSubdomainRoutingActive,
  MARKETING_APP_PATH_FIRST_SEGMENTS,
  publicGymSiteUrl,
} from './config/env';
import {
  HomePage,
  PaymentPage,
  LoginPage,
  ForgotPasswordPage,
  SignupPage,
  UserPage,
  AdminDashboardPage,
  ManageBusinessPage,
  CreateWebsitePage,
  CrystalBusinessPage,
  PlansPage,
  ServiceEnquiryPage,
  UserContentPolicyPage,
  PrivacyPolicyPage,
  SupportFeedbackPage,
  NotFoundPage,
} from './pages';
import './App.css';

/** Toggle off (or remove this component and its usage below) when the app is production-ready. */
const SHOW_IN_DEVELOPMENT_BANNER = true;

function InDevelopmentBanner() {
  const { pathname } = useLocation();
  if (!SHOW_IN_DEVELOPMENT_BANNER) return null;
  const pathOnly = pathname.split('?')[0];
  if (pathOnly === '/404' || pathOnly.startsWith('/404/')) return null;
  return (
    <div
      role="status"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        background: '#b45309',
        color: '#fff',
        textAlign: 'center',
        padding: '6px 12px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      In development
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Old bookmarks: `/crystal` → `/`, `/crystal/foo` → `/foo`. */
function LegacyCrystalPathRedirect() {
  const { pathname, search, hash } = useLocation();
  const path = pathname.replace(/^\/crystal(?=\/|$)/, '') || '/';
  return <Navigate to={`${path}${search}${hash}`} replace />;
}

/**
 * On the marketing host, `/some-slug` redirects to `https://some-slug.{publicSiteDomain}/…` when configured.
 */
function PathBasedPublicCrystalRoute() {
  const { slug, '*': rest } = useParams<{ slug: string; '*'?: string }>();
  const { search, hash } = useLocation();

  const shouldRedirect =
    isPublicSiteSubdomainRoutingActive() &&
    typeof slug === 'string' &&
    !MARKETING_APP_PATH_FIRST_SEGMENTS.has(slug) &&
    slug !== 'preview' &&
    slug !== 'crystal';

  useLayoutEffect(() => {
    if (!shouldRedirect || !slug) return;
    const pathSuffix = rest ? `/${rest}` : '/';
    window.location.replace(publicGymSiteUrl(slug, pathSuffix) + search + hash);
  }, [shouldRedirect, slug, rest, search, hash]);

  if (shouldRedirect) {
    return (
      <div className="container py-5 text-center text-muted small" role="status">
        Redirecting to your gym site…
      </div>
    );
  }
  return <CrystalBusinessPage />;
}

function App() {
  const gymHostSlug = useMemo(() => getPublicGymSlugFromHost(), []);

  return (
    <ToastProvider>
      <EnquiryModalProvider>
      <InDevelopmentBanner />
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          {gymHostSlug ? (
            <>
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<CrystalBusinessPage />} />
            </>
          ) : (
            <>
              <Route path="/crystal/*" element={<LegacyCrystalPathRedirect />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/plans/:businessSlug" element={<PlansPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/services/custom" element={<ServiceEnquiryPage />} />
              <Route path="/starter" element={<PaymentPage plan="starter" />} />
              <Route path="/pro" element={<PaymentPage plan="pro" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/legal/user-content" element={<UserContentPolicyPage />} />
              <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/support" element={<SupportFeedbackPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/user/create-website" element={<CreateWebsitePage />} />
                <Route path="/user/business/:slug/manage" element={<ManageBusinessPage />} />
                <Route path="/user/business/:slug/edit" element={<CreateWebsitePage />} />
                <Route path="/user/admin" element={<AdminDashboardPage />} />
                <Route path="/user" element={<UserPage />} />
              </Route>
              <Route path="/:slug/*" element={<PathBasedPublicCrystalRoute />} />
            </>
          )}
        </Route>
      </Routes>
      </EnquiryModalProvider>
    </ToastProvider>
  );
}

export default App;
