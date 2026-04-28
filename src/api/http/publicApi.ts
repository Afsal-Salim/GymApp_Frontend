import axios from 'axios';
import { apiBaseUrl } from '@/config/env';

/**
 * **Public API layer** — no `Authorization` header, no token refresh.
 * Use for unauthenticated endpoints: public business profile, slug checks, auth login/signup, Crystal leads, plan list, etc.
 */
export const publicApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
