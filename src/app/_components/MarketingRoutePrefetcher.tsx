'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * High-value marketing/auth routes — prefetched after idle so clicks feel instant.
 * Skips when Save-Data is enabled. Only mounted under marketing chrome.
 */
const PREFETCH_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/user',
  '/user/create-website',
  '/plans',
  '/services/custom',
  '/support',
] as const;

function shouldDeferPrefetch(): boolean {
  if (typeof navigator === 'undefined') return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

function runWhenIdle(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const ric = window.requestIdleCallback;
  if (typeof ric === 'function') {
    const id = ric(() => fn(), { timeout: 2800 });
    return () => window.cancelIdleCallback?.(id);
  }
  const t = window.setTimeout(fn, 900);
  return () => clearTimeout(t);
}

export default function MarketingRoutePrefetcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (shouldDeferPrefetch()) return undefined;

    return runWhenIdle(() => {
      for (const href of PREFETCH_PATHS) {
        if (href === pathname) continue;
        try {
          router.prefetch(href);
        } catch {
          /* ignore */
        }
      }
    });
  }, [router, pathname]);

  return null;
}
