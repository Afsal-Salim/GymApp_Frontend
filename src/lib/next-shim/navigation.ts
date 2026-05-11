/**
 * Drop-in replacement for `next/navigation` backed by `react-router-dom`.
 *
 * What's supported:
 * - `useRouter()`: `.push(href)`, `.replace(href)`, `.back()`, `.forward()`, `.refresh()`, `.prefetch()` (no-op).
 * - `usePathname()`: returns the current pathname (no query).
 * - `useSearchParams()`: returns the live URLSearchParams.
 * - `useParams()`: returns React Router params, recovering Next-style catch-all arrays for `[[...rest]]`
 *   segments by splitting `*` on `/`.
 * - `notFound()`: throws a typed sentinel that the `NotFoundBoundary` catches and renders 404.
 * - `redirect()`, `permanentRedirect()`: client-side navigation via `window.location` (sync semantics).
 */
import { useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from 'react-router-dom';

export class NextNotFoundError extends Error {
  readonly _isNextNotFound = true;
  constructor() {
    super('NEXT_NOT_FOUND');
    this.name = 'NextNotFoundError';
  }
}

export class NextRedirectError extends Error {
  readonly _isNextRedirect = true;
  readonly to: string;
  readonly permanent: boolean;
  constructor(to: string, permanent = false) {
    super(`NEXT_REDIRECT:${to}`);
    this.name = 'NextRedirectError';
    this.to = to;
    this.permanent = permanent;
  }
}

export function isNextNotFoundError(err: unknown): err is NextNotFoundError {
  return Boolean(err) && typeof err === 'object' && (err as { _isNextNotFound?: boolean })._isNextNotFound === true;
}

export function isNextRedirectError(err: unknown): err is NextRedirectError {
  return Boolean(err) && typeof err === 'object' && (err as { _isNextRedirect?: boolean })._isNextRedirect === true;
}

export function notFound(): never {
  throw new NextNotFoundError();
}

export function redirect(href: string): never {
  if (typeof window !== 'undefined') {
    window.location.replace(href);
  }
  throw new NextRedirectError(href, false);
}

export function permanentRedirect(href: string): never {
  if (typeof window !== 'undefined') {
    window.location.replace(href);
  }
  throw new NextRedirectError(href, true);
}

export interface AppRouterInstance {
  push: (href: string, options?: { scroll?: boolean }) => void;
  replace: (href: string, options?: { scroll?: boolean }) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string) => void;
}

export function useRouter(): AppRouterInstance {
  const navigate = useNavigate();
  return useMemo<AppRouterInstance>(
    () => ({
      push: (href: string) => {
        if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) {
          window.location.assign(href);
          return;
        }
        navigate(href);
      },
      replace: (href: string) => {
        if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) {
          window.location.replace(href);
          return;
        }
        navigate(href, { replace: true });
      },
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      },
      prefetch: () => {
        /* no-op: Vite bundles, no RSC prefetch */
      },
    }),
    [navigate],
  );
}

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams(): URLSearchParams {
  const [params] = useRouterSearchParams();
  return params;
}

/**
 * Mirrors Next's `useParams<T>()`. Catch-all RR params (`*`) become string arrays
 * keyed by the configured name (see {@link useParams}/`router.tsx`).
 */
export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>>(): T {
  const raw = useRouterParams();
  const out: Record<string, string | string[] | undefined> = { ...raw };
  /** React Router's `*` → split into the named catch-all key (e.g. `rest`, `path`). */
  if (typeof out['*'] === 'string') {
    const splat = (out['*'] as string).split('/').filter(Boolean);
    out['rest'] = splat;
    out['path'] = splat;
    delete out['*'];
  }
  return out as T;
}
