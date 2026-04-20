import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const SelectWebsiteTemplatePage = dynamic(() => import('@/features/website/SelectWebsiteTemplatePage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return (
    <Suspense fallback={<RouteSegmentLoading />}>
      <SelectWebsiteTemplatePage mode="edit" />
    </Suspense>
  );
}
