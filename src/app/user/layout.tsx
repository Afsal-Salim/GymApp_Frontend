import { Suspense } from 'react';
import ProtectedRoute from '@/components/routing/protected-route/ProtectedRoute/ProtectedRoute';

/** Auth is client-only; `UserPage` uses `useSearchParams` so the segment stays dynamic without `force-dynamic`. */

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Suspense>
  );
}
