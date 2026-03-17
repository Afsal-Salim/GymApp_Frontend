import { API_BASE_URL } from './config';
import { privateApi } from './interceptor';

const SEND_OTP_URL = '/auth/send-otp/';
const VERIFY_OTP_URL = '/auth/verify-otp/';
const SIGNUP_URL = '/auth/signup/';
const LOGIN_URL = '/auth/login/';
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
  const res = await fetch(`${API_BASE_URL}${SEND_OTP_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to send OTP');
  }
  return res.json();
}

export async function verifyOtp(token: string, otp: string): Promise<VerifyOtpResponse> {
  const res = await fetch(`${API_BASE_URL}${VERIFY_OTP_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, otp: otp.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Invalid or expired OTP');
  }
  return res.json();
}

export type SignupRequest = {
  email: string;
  username: string;
  password: string;
  token: string;
};

export type SignupResponse = {
  message?: string;
  [key: string]: unknown;
};

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE_URL}${SIGNUP_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: payload.email.trim(),
      username: payload.username.trim(),
      password: payload.password,
      token: payload.token,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Sign up failed');
  }
  return res.json();
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

/** Login response: tokens saved to localStorage and used by privateApi interceptor */
export type LoginResponse = {
  access?: string;
  refresh?: string;
  access_token?: string;
  refresh_token?: string;
  token?: string;
  [key: string]: unknown;
};

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}${LOGIN_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Login failed');
  }
  return res.json();
}

/** Forgot password: request OTP for the given email. Returns token for verify step. */
export async function forgotPasswordRequest(email: string): Promise<{ token: string; message?: string }> {
  const res = await fetch(`${API_BASE_URL}${FORGOT_PASSWORD_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to send reset code');
  }
  const data = await res.json();
  const token = (data as { token?: string }).token;
  if (!token) throw new Error('Invalid response from server');
  return data as { token: string; message?: string };
}

/** Forgot password: verify OTP sent to email (use this instead of verifyOtp for reset flow). */
export async function verifyResetOtp(email: string, token: string, otp: string): Promise<{ message?: string }> {
  const res = await fetch(`${API_BASE_URL}${VERIFY_RESET_OTP_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), token, otp: otp.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Invalid or expired OTP');
  }
  return res.json();
}

/** Forgot password: set new password. Requires email, token and otp from previous steps. */
export async function resetPassword(
  email: string,
  token: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message?: string }> {
  const res = await fetch(`${API_BASE_URL}${RESET_PASSWORD_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.trim(),
      token,
      otp: otp.trim(),
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to reset password');
  }
  return res.json();
}
