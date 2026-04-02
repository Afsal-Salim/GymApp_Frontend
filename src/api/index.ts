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
export {
  getPlanList,
  formatPlanPrice,
  type PlanListItem,
  type PlanFeature,
  type PlanListMeta,
} from './plans';
export { submitMarketingEnquiry, type SubmitMarketingEnquiryPayload } from './marketingEnquiry';
export {
  submitPublicServiceEnquiry,
  type SubmitServiceEnquiryPayload,
  type SubmitServiceEnquiryResponse,
} from './serviceEnquiry';
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
  type Customer,
  type PolicyAcceptanceFlags,
  CustomerRole,
  isAdminProfile,
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
  getBusinessFirstRecharge,
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
  postBusinessRecordStatus,
  BusinessDeactivateBlockedError,
  type PostBusinessRecordStatusBody,
  type CrystalWebsiteSetupPayload,
  type PatchBusinessRequest,
  type PublicCheckSlugResponse,
  DUMMY_BUSINESS_SLUG,
  PublicBusinessNotFoundError,
  type BusinessDetail,
  type BusinessFirstRechargeResponse,
  type BusinessFirstRechargeStarter,
  type BusinessListItem,
  type BusinessSubscription,
  type ActiveSubscriptionResponse,
  type BusinessListPaginatedResponse,
  type BusinessListMeta,
  type PublicBusinessDetail,
  type WebsiteAnalytics,
  type WebsiteAnalyticsWhatsapp,
  type WebsiteAnalyticsLineGraphPoint,
  type WebsiteAnalyticsTimeRange,
  type WebsiteLeadTypeStats,
  type AllWebsitesAnalyticsResponse,
  type AnalyticsRangePreset,
  ANALYTICS_RANGE_OPTIONS,
  ANALYTICS_RANGE_PRESETS,
  getBusinessCrystalLeadsPaginated,
  getBusinessCrystalLeadDetail,
  patchBusinessCrystalLead,
  getBusinessEnquiriesPaginated,
  getBusinessEnquiryDetail,
  patchBusinessEnquiry,
  postPublicBusinessEnquiry,
  type ModalCrystalLeadType,
  type OwnerCrystalLeadItem,
  type OwnerCrystalLeadsListParams,
  type PatchOwnerCrystalLeadBody,
  type BusinessEnquiryItem,
  type BusinessEnquiriesListParams,
  type PostPublicBusinessEnquiryBody,
  type PatchBusinessEnquiryBody,
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
export {
  getAdminSupportFeedbackList,
  patchAdminSupportFeedback,
  getAdminEnquiriesList,
  patchAdminEnquiry,
  getAdminWebsitesList,
  patchAdminWebsite,
  getAdminUsersList,
  patchAdminUser,
  type AdminPaginated,
  type AdminSupportFeedbackItem,
  type AdminSupportFeedbackListParams,
  type PatchAdminSupportFeedbackBody,
  type AdminEnquiryItem,
  type AdminEnquiryListParams,
  type PatchAdminEnquiryBody,
  type AdminWebsiteItem,
  type AdminWebsiteListParams,
  type PatchAdminWebsiteBody,
  type AdminUserItem,
  type AdminUserListParams,
  type PatchAdminUserBody,
} from './admin';
