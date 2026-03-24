/**
 * Back-compat re-exports for the authenticated Axios instance.
 *
 * - **`protectedApi`** — preferred name (mirrors public vs protected API split).
 * - **`privateApi`** — historical alias; same instance, same interceptors.
 */
export { protectedApi, protectedApi as privateApi } from './http/protectedApi';
