/**
 * Client-side replacement for the original Next.js `middleware.ts`.
 *
 * Logic preserved from the middleware:
 * - Redirect legacy `/crystal/...` URLs to the same path without the prefix.
 * - When the browser host is a gym subdomain (`{slug}.{publicSiteDomain}`), rewrite the
 *   in-app path to `/gym-by-host/{slug}{originalPath}` so the SPA renders the public gym site
 *   the same way the middleware used to.
 *
 * `useHostRouting()` runs once at app mount and applies an in-app navigation; subsequent
 * route changes are handled by React Router directly.
 */
import { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicGymSlugFromHost } from '@/config/env';

export function useHostRouting(): void {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const { pathname, search, hash } = window.location;

    /** Legacy `/crystal/...` prefix → strip. */
    if (pathname === '/crystal' || pathname.startsWith('/crystal/')) {
      const stripped = pathname.replace(/^\/crystal(?=\/|$)/, '') || '/';
      navigate(stripped + search + hash, { replace: true });
      return;
    }

    /** API and dev-only legacy route handler paths must never be rewritten as gym sites. */
    if (
      pathname === '/api' ||
      pathname.startsWith('/api/') ||
      pathname === '/gjs-pro-template' ||
      pathname.startsWith('/gjs-pro-template/')
    ) {
      return;
    }

    /** Already rewritten — nothing to do. */
    if (pathname.startsWith('/gym-by-host/')) return;

    const slug = getPublicGymSlugFromHost();
    if (!slug) return;

    const target = `/gym-by-host/${encodeURIComponent(slug)}${pathname === '/' ? '' : pathname}` + search + hash;
    navigate(target, { replace: true });
  }, [navigate]);
}
