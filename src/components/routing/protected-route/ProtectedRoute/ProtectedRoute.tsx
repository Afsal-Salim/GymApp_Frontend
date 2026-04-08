'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken } from '../../../../api';

/**
 * Protects routes that require authentication.
 * Redirects to `/login?from=` when there is no access token.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      const q = searchParams.toString();
      const path = q ? `${pathname}?${q}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(path)}`);
    }
  }, [pathname, router, searchParams]);

  if (!getAccessToken()) {
    return null;
  }

  return <>{children}</>;
}
