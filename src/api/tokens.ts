import {
  STORAGE_ACCESS_TOKEN,
  STORAGE_REFRESH_TOKEN,
  STORAGE_USER_EMAIL,
  STORAGE_USER_USERNAME,
} from '../config/storageKeys';

/** Access and refresh tokens are stored in localStorage and used by the protected API interceptor. */
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_REFRESH_TOKEN);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(STORAGE_ACCESS_TOKEN, token);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(STORAGE_REFRESH_TOKEN, token);
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
    localStorage.setItem(STORAGE_USER_EMAIL, email);
  } else {
    localStorage.removeItem(STORAGE_USER_EMAIL);
  }
  if (username != null && username !== '') {
    localStorage.setItem(STORAGE_USER_USERNAME, username);
  } else {
    localStorage.removeItem(STORAGE_USER_USERNAME);
  }
}

export function getUserInfo(): StoredUserInfo {
  return {
    email: localStorage.getItem(STORAGE_USER_EMAIL),
    username: localStorage.getItem(STORAGE_USER_USERNAME),
  };
}

function clearUserInfo(): void {
  localStorage.removeItem(STORAGE_USER_EMAIL);
  localStorage.removeItem(STORAGE_USER_USERNAME);
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN);
  clearUserInfo();
}
