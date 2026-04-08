import { useEffect, useState } from 'react';

/**
 * Approximates React Router's `useNavigationType()` for Next.js App Router.
 * Used for back-button handling on the create-website flow.
 */
export function useNavigationTypeCompat(): 'POP' | 'PUSH' | 'REPLACE' {
  const [type, setType] = useState<'POP' | 'PUSH' | 'REPLACE'>(() => {
    if (typeof window === 'undefined') return 'PUSH';
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === 'back_forward') return 'POP';
    return 'PUSH';
  });

  useEffect(() => {
    const onPop = () => setType('POP');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return type;
}
