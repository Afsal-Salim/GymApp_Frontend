import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const WebsiteBuilderPage = dynamic(() => import('@/features/website/pages/editor/WebsiteBuilderPage/WebsiteBuilderPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function CreateWebsiteBuilderRoutePage() {
  return <WebsiteBuilderPage />;
}
