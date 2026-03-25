/**
 * Authentication API: public routes (login, OTP, signup) use `publicApi`;
 * session profile uses `privateApi` (Bearer + refresh interceptor).
 */
import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';
import { privateApi } from './interceptor';

const SEND_OTP_URL = '/auth/send-otp/';
const VERIFY_OTP_URL = '/auth/verify-otp/';
const SIGNUP_URL = '/auth/signup/';
const LOGIN_URL = '/auth/login/';
const GOOGLE_AUTH_URL = '/auth/google/';
const ME_URL = '/auth/me/';
const FORGOT_PASSWORD_URL = '/auth/forgot-password/';
const VERIFY_RESET_OTP_URL = '/auth/verify-reset-otp/';
const RESET_PASSWORD_URL = '/auth/reset-password/';

export type SendOtpRequest = {
  email: string;
};

export type SendOtpResponse = {
  token: string;
  message?: string;
  [key: string]: unknown;
};

export type VerifyOtpRequest = {
  token: string;
  otp: string;
};

export type VerifyOtpResponse = {
  message?: string;
  verified?: boolean;
  [key: string]: unknown;
};

export async function sendOtp(email: string): Promise<SendOtpResponse> {
  try {
    const { data } = await publicApi.post<SendOtpResponse>(SEND_OTP_URL, { email: email.trim() });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Failed to send OTP'));
  }
}

export async function verifyOtp(token: string, otp: string): Promise<VerifyOtpResponse> {
  try {
    const { data } = await publicApi.post<VerifyOtpResponse>(VERIFY_OTP_URL, { token, otp: otp.trim() });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Invalid or expired OTP'));
  }
}

/** Policy acknowledgement flags sent to the backend (integer 0 or 1). */
export type PolicyAcceptanceFlags = {
  user_content_policy_accepted: 0 | 1;
  privacy_policy_accepted: 0 | 1;
};

export type SignupRequest = {
  email: string;
  username: string;
  password: string;
  token: string;
} & PolicyAcceptanceFlags;

export type SignupResponse = {
  message?: string;
  [key: string]: unknown;
};

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  try {
    const { data } = await publicApi.post<SignupResponse>(SIGNUP_URL, {
      email: payload.email.trim(),
      username: payload.username.trim(),
      password: payload.password,
      token: payload.token,
      user_content_policy_accepted: payload.user_content_policy_accepted,
      privacy_policy_accepted: payload.privacy_policy_accepted,
    });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Sign up failed'));
  }
}

export type UserProfile = {
  username?: string;
  email?: string;
  [key: string]: unknown;
};

export async function getProfile(): Promise<UserProfile> {
  const { data } = await privateApi.get<UserProfile>(ME_URL);
  return data;
}

export type LoginRequest = {
  email: string;
  password: string;
};

/** Login response: tokens saved to localStorage and used by the protected API client. */
export type LoginResponse = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  [key: string]: unknown;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const { data } = await publicApi.post<LoginResponse>(LOGIN_URL, { email: email.trim(), password });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Login failed'));
  }
}

/**
 * Sign in or sign up with Google.
 * Body includes `id_token` and policy flags (0/1). Use `1` for both on the sign-up page when the user has accepted;
 * sign-in on the login page typically sends `0` for both.
 */
export async function loginWithGoogle(
  idToken: string,
  policyAcceptance: PolicyAcceptanceFlags = {
    user_content_policy_accepted: 0,
    privacy_policy_accepted: 0,
  }
): Promise<LoginResponse> {
  try {
    const { data } = await publicApi.post<LoginResponse>(GOOGLE_AUTH_URL, {
      id_token: idToken,
      user_content_policy_accepted: policyAcceptance.user_content_policy_accepted,
      privacy_policy_accepted: policyAcceptance.privacy_policy_accepted,
    });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Google sign-in failed'));
  }
}

/** Forgot password: request OTP for the given email. Returns token for verify step. */
export async function forgotPasswordRequest(email: string): Promise<{ token: string; message?: string }> {
  try {
    const { data } = await publicApi.post<{ token?: string; message?: string }>(FORGOT_PASSWORD_URL, {
      email: email.trim(),
    });
    if (!data.token) throw new Error('Invalid response from server');
    return data as { token: string; message?: string };
  } catch (e) {
    if (e instanceof Error && e.message === 'Invalid response from server') throw e;
    throw new Error(getAxiosErrorMessage(e, 'Failed to send reset code'));
  }
}

/** Forgot password: verify OTP sent to email (use this instead of verifyOtp for reset flow). */
export async function verifyResetOtp(email: string, token: string, otp: string): Promise<{ message?: string }> {
  try {
    const { data } = await publicApi.post<{ message?: string }>(VERIFY_RESET_OTP_URL, {
      email: email.trim(),
      token,
      otp: otp.trim(),
    });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Invalid or expired OTP'));
  }
}

/** Forgot password: set new password. Requires email, token and otp from previous steps. */
export async function resetPassword(
  email: string,
  token: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message?: string }> {
  try {
    const { data } = await publicApi.post<{ message?: string }>(RESET_PASSWORD_URL, {
      email: email.trim(),
      token,
      otp: otp.trim(),
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return data;
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Failed to reset password'));
  }
}
