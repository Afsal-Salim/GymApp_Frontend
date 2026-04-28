import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const CreateWebsitePage = dynamic(() => import('@/features/website/pages/create/CreateWebsitePage/CreateWebsitePage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return (
    <Suspense fallback={<RouteSegmentLoading />}>
      <CreateWebsitePage />
    </Suspense>
  );
}
