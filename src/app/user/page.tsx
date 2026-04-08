import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const UserPage = dynamic(() => import('@/features/user/UserPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return (
    <Suspense fallback={<RouteSegmentLoading />}>
      <UserPage />
    </Suspense>
  );
}
