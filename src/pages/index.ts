/**
 * Route-level UI grouped by domain. Import from `src/pages` in `App.tsx` only when possible;
 * cross-page imports should use the same barrel or a path under `pages/<domain>/`.
 */
export { LoginPage, SignupPage, ForgotPasswordPage } from './auth';
export { HomePage } from './home';
export { PaymentPage } from './payment';
export { PlansPage, PLANS_PAGE_PATH } from './plans';
export { UserPage } from './user';
export { CreateWebsitePage } from './website';
export { Welcome } from './welcome';
export { CrystalBusinessPage } from './crystal';
