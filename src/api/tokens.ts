import {
  STORAGE_ACCESS_TOKEN,
  STORAGE_REFRESH_TOKEN,
  STORAGE_USER_EMAIL,
  STORAGE_USER_PROFILE_CACHE,
  STORAGE_USER_BUSINESS_LIST_CACHE,
  STORAGE_USER_ANALYTICS_CACHE,
  STORAGE_USER_USERNAME,
} from '../config/storageKeys';

/** Fired on same-tab login / logout / token refresh so the navbar can update without a full reload. */
export const CRYSTAL_AUTH_CHANGED_EVENT = 'crystal-auth-changed';

export function dispatchAuthChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CRYSTAL_AUTH_CHANGED_EVENT));
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Access and refresh tokens are stored in localStorage and used by the protected API interceptor. */
export function getAccessToken(): string | null {
  return getLocalStorage()?.getItem(STORAGE_ACCESS_TOKEN) ?? null;
}

export function getRefreshToken(): string | null {
  return getLocalStorage()?.getItem(STORAGE_REFRESH_TOKEN) ?? null;
}

export function setAccessToken(token: string): void {
  getLocalStorage()?.setItem(STORAGE_ACCESS_TOKEN, token);
  dispatchAuthChanged();
}

export function setRefreshToken(token: string): void {
  getLocalStorage()?.setItem(STORAGE_REFRESH_TOKEN, token);
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
  const ls = getLocalStorage();
  if (!ls) return;
  if (email != null && email !== '') {
    ls.setItem(STORAGE_USER_EMAIL, email);
  } else {
    ls.removeItem(STORAGE_USER_EMAIL);
  }
  if (username != null && username !== '') {
    ls.setItem(STORAGE_USER_USERNAME, username);
  } else {
    ls.removeItem(STORAGE_USER_USERNAME);
  }
}

export function getUserInfo(): StoredUserInfo {
  const ls = getLocalStorage();
  if (!ls) {
    return { email: null, username: null };
  }
  return {
    email: ls.getItem(STORAGE_USER_EMAIL),
    username: ls.getItem(STORAGE_USER_USERNAME),
  };
}

function clearUserInfo(): void {
  const ls = getLocalStorage();
  if (!ls) return;
  ls.removeItem(STORAGE_USER_EMAIL);
  ls.removeItem(STORAGE_USER_USERNAME);
}

export function clearTokens(): void {
  const ls = getLocalStorage();
  if (!ls) return;
  ls.removeItem(STORAGE_ACCESS_TOKEN);
  ls.removeItem(STORAGE_REFRESH_TOKEN);
  ls.removeItem(STORAGE_USER_PROFILE_CACHE);
  ls.removeItem(STORAGE_USER_BUSINESS_LIST_CACHE);
  ls.removeItem(STORAGE_USER_ANALYTICS_CACHE);
  clearUserInfo();
  dispatchAuthChanged();
}
