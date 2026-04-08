import { Suspense } from 'react';
import ProtectedRoute from '@/components/routing/protected-route/ProtectedRoute/ProtectedRoute';

/** Dashboard & editor — session-specific; never statically cache as marketing pages. */
export const dynamic = 'force-dynamic';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Suspense>
  );
}
