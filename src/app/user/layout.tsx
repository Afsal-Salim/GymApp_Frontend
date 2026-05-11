import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sora } from 'next/font/google';
import ProtectedRoute from '@/components/routing/protected-route/ProtectedRoute/ProtectedRoute';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-user-heading',
  weight: ['400', '500', '600', '700', '800'],
});

/**
 * Wraps every `/user/*` route with `ProtectedRoute` and the dashboard font scope.
 * Used as a layout route in `src/router.tsx` (renders nested routes via `<Outlet />`).
 */
export default function UserLayout() {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <div className={`user-workspace-font-scope ${sora.variable}`}>
          <Outlet />
        </div>
      </ProtectedRoute>
    </Suspense>
  );
}
