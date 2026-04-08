import { Suspense } from 'react';
import nextDynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const dynamic = 'force-dynamic';

const LoginPage = nextDynamic(() => import('@/features/auth/LoginPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return (
    <Suspense fallback={<RouteSegmentLoading />}>
      <LoginPage />
    </Suspense>
  );
}
