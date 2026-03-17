import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { MainLayout } from './layouts';
import { ProtectedRoute } from './components';
import { HomePage, PaymentPage, LoginPage, ForgotPasswordPage, SignupPage, UserPage, CrystalBusinessPage, PlansPage } from './pages';
import './App.css';

function App() {
  return (
    <ToastProvider>
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
            <Route path="/user" element={<UserPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/crystal" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
