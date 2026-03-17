const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_EMAIL_KEY = 'user_email';
const USER_USERNAME_KEY = 'user_username';

/** Access and refresh tokens are stored in localStorage and used by the API interceptor (Bearer auth + refresh on 401). */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setTokens(access: string, refresh: string): void {
  setAccessToken(access);
  setRefreshToken(refresh);
}

export type StoredUserInfo = {
  email: string | null;
  username: string | null;
};

export function setUserInfo(email: string | undefined, username: string | undefined): void {
  if (email != null && email !== '') {
    localStorage.setItem(USER_EMAIL_KEY, email);
  } else {
    localStorage.removeItem(USER_EMAIL_KEY);
  }
  if (username != null && username !== '') {
    localStorage.setItem(USER_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(USER_USERNAME_KEY);
  }
}

export function getUserInfo(): StoredUserInfo {
  return {
    email: localStorage.getItem(USER_EMAIL_KEY),
    username: localStorage.getItem(USER_USERNAME_KEY),
  };
}

function clearUserInfo(): void {
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_USERNAME_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  clearUserInfo();
}
