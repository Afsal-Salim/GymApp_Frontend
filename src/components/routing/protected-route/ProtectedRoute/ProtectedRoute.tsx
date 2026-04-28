'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken } from '@/api';

/**
 * Protects routes that require authentication.
 * Redirects to `/login?from=` when there is no access token.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setToken(getAccessToken());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) {
      const q = searchParams.toString();
      const path = q ? `${pathname}?${q}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(path)}`);
    }
  }, [mounted, token, pathname, router, searchParams]);

  /* Keep server and initial client render identical; decide auth only after mount. */
  if (!mounted || !token) {
    return null;
  }

  return <>{children}</>;
}
