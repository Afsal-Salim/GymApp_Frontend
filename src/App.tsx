import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { MainLayout } from './layouts';
import { ProtectedRoute } from './components';
import {
  HomePage,
  PaymentPage,
  LoginPage,
  ForgotPasswordPage,
  SignupPage,
  UserPage,
  CreateWebsitePage,
  CrystalBusinessPage,
  PlansPage,
  UserContentPolicyPage,
  PrivacyPolicyPage,
} from './pages';
import './App.css';

/** Toggle off (or remove this component and its usage below) when the app is production-ready. */
const SHOW_IN_DEVELOPMENT_BANNER = true;

function InDevelopmentBanner() {
  if (!SHOW_IN_DEVELOPMENT_BANNER) return null;
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

function App() {
  return (
    <ToastProvider>
      <InDevelopmentBanner />
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/crystal/*" element={<LegacyCrystalPathRedirect />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/plans/:businessSlug" element={<PlansPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/starter" element={<PaymentPage plan="starter" />} />
          <Route path="/pro" element={<PaymentPage plan="pro" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/legal/user-content" element={<UserContentPolicyPage />} />
          <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/user/create-website" element={<CreateWebsitePage />} />
            <Route path="/user/business/:slug/edit" element={<CreateWebsitePage />} />
            <Route path="/user" element={<UserPage />} />
          </Route>
          <Route path="/:slug/*" element={<CrystalBusinessPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
