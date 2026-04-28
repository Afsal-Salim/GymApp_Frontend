'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Thin top bar on route changes (not on first paint) — pairs with `.main-layout__page` enter animation.
 */
export function PageTransitionBar({ pathname }: { pathname: string }) {
  const skipFirst = useRef(true);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    setPulse((p) => p + 1);
  }, [pathname]);

  if (pulse === 0) return null;
  return <div key={pulse} className="page-transition-bar" aria-hidden />;
}
