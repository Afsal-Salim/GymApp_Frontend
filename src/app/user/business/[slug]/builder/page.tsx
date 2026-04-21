import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const WebsiteBuilderPage = dynamic(() => import('@/features/website/WebsiteBuilderPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function EditWebsiteBuilderRoutePage() {
  return <WebsiteBuilderPage />;
}
