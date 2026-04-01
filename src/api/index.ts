/**
 * API surface: **public** vs **protected** HTTP clients, then feature modules.
 * - `publicApi` — no Bearer token (public pages, auth login/signup, Crystal leads).
 * - `protectedApi` / `privateApi` — Bearer + refresh (dashboard, payments, owner APIs).
 */
export { publicApi } from './http/publicApi';
export { protectedApi } from './http/protectedApi';
export { privateApi } from './interceptor';
export { getAxiosErrorMessage } from './http/axiosErrorMessage';
export { getAccessToken, getRefreshToken, setTokens, clearTokens, setUserInfo, getUserInfo, type StoredUserInfo } from './tokens';
export { API_BASE_URL, REFRESH_ENDPOINT } from './config';
export { getPlanList, type PlanListItem, type PlanFeature, type PlanListMeta } from './plans';
export { submitMarketingEnquiry, type SubmitMarketingEnquiryPayload } from './marketingEnquiry';
export {
  createOrder,
  verifyPayment,
  type CreateOrderResponse,
  type VerifyPaymentRequest,
  type VerifyPaymentResponse,
} from './payments';
export {
  sendOtp,
  verifyOtp,
  signup,
  login,
  loginWithGoogle,
  getProfile,
  forgotPasswordRequest,
  verifyResetOtp,
  resetPassword,
  type SignupRequest,
  type SignupResponse,
  type LoginRequest,
  type LoginResponse,
  type UserProfile,
  type PolicyAcceptanceFlags,
} from './auth';
export { getProfileCached, peekProfileCache } from './profileCache';
export {
  getBusinessListPaginatedCached,
  peekBusinessListPage,
  invalidateUserBusinessListCache,
} from './userBusinessListCache';
export {
  fetchPublicGymBundle,
  peekPublicGymBundle,
  invalidatePublicGymBundleCache,
} from './publicGymCache';
export {
  getBusinessDetail,
  getBusinessList,
  getBusinessListPaginated,
  getAllWebsitesAnalytics,
  getBusinessWebsiteAnalytics,
  getActiveSubscription,
  getPublicBusinessBySlug,
  checkBusinessSlugAvailability,
  getPublicCheckSlug,
  submitWebsiteSetupDraft,
  patchBusiness,
  patchWebsiteSetupDraft,
  type CrystalWebsiteSetupPayload,
  type PatchBusinessRequest,
  type PublicCheckSlugResponse,
  DUMMY_BUSINESS_SLUG,
  PublicBusinessNotFoundError,
  type BusinessDetail,
  type BusinessListItem,
  type BusinessSubscription,
  type ActiveSubscriptionResponse,
  type BusinessListPaginatedResponse,
  type BusinessListMeta,
  type PublicBusinessDetail,
  type WebsiteAnalytics,
  type WebsiteAnalyticsWhatsapp,
  type WebsiteLeadTypeStats,
  type AllWebsitesAnalyticsResponse,
} from './businesses';
export {
  postCrystalPublicLead,
  crystalPublicLeadsUrl,
  type CrystalPublicLeadBody,
  type CrystalJoinNowLeadBody,
  type CrystalBookFreeTrialLeadBody,
  type CrystalPlanVisitLeadBody,
  type CrystalWhatsAppClickBody,
} from './publicCrystalClientLeads';
export {
  listClientSupportMessages,
  postClientSupportMessage,
  type ClientSupportMessage,
  type ClientSupportMessageKind,
  type PostClientSupportPayload,
} from './support';
