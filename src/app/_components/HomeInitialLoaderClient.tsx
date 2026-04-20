'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Dismisses `#home-initial-loader-ssr` after a minimum visible time. Skips intro when the user
 * returns to `/` in the same document (soft nav) via `homeInitialLoaderConsumedThisDocument`.
 */
let homeInitialLoaderConsumedThisDocument = false;

const MIN_VISIBLE_MS = 1150;
const EXIT_FADE_MS = 320;

export default function HomeInitialLoaderClient() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname !== '/') return;

    const el = document.getElementById('home-initial-loader-ssr');
    if (homeInitialLoaderConsumedThisDocument) {
      el?.remove();
      return;
    }
    homeInitialLoaderConsumedThisDocument = true;

    if (!el) return;

    const t1 = window.setTimeout(() => {
      el.classList.add('home-initial-loader-ssr--exit');
    }, MIN_VISIBLE_MS);
    const t2 = window.setTimeout(() => {
      el.remove();
    }, MIN_VISIBLE_MS + EXIT_FADE_MS);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
