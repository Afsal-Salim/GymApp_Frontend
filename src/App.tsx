import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
} from './pages';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/crystal" element={<HomePage />} />
          <Route path="/crystal/:slug/*" element={<CrystalBusinessPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/starter" element={<PaymentPage plan="starter" />} />
          <Route path="/pro" element={<PaymentPage plan="pro" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/user/create-website" element={<CreateWebsitePage />} />
            <Route path="/user" element={<UserPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/crystal" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
