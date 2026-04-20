import { Suspense } from 'react';
import { Sora } from 'next/font/google';
import ProtectedRoute from '@/components/routing/protected-route/ProtectedRoute/ProtectedRoute';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-user-heading',
  weight: ['400', '500', '600', '700', '800'],
});

/** Auth is client-only; `UserPage` uses `useSearchParams` so the segment stays dynamic without `force-dynamic`. */

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <div className={`user-workspace-font-scope ${sora.variable}`}>{children}</div>
      </ProtectedRoute>
    </Suspense>
  );
}
