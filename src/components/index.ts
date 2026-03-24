/**
 * Shared UI barrel. Physical files live under domain folders (`layout/`, `routing/`, …).
 */
export { default as Footer } from './layout/footer/Footer/Footer';
export { default as Navbar } from './layout/navbar/Navbar/Navbar';
export { default as PageContainer } from './layout/page-container/PageContainer/PageContainer';
export { default as ProtectedRoute } from './routing/protected-route/ProtectedRoute/ProtectedRoute';
export { default as PaymentLoginRequiredModal } from './payment/payment-login-modal/PaymentLoginRequiredModal/PaymentLoginRequiredModal';
export type { CheckoutRedirect } from './payment/payment-login-modal/PaymentLoginRequiredModal/PaymentLoginRequiredModal';
export { default as WhatsAppLogoIcon } from './icons/WhatsAppLogoIcon';
