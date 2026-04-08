import { Suspense } from 'react';
import ProtectedRoute from '@/components/routing/protected-route/ProtectedRoute/ProtectedRoute';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Suspense>
  );
}
