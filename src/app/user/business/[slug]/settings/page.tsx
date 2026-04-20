import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const WebsiteSettingsPage = dynamic(() => import('@/features/user/WebsiteSettingsPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function BusinessWebsiteSettingsRoutePage() {
  return <WebsiteSettingsPage />;
}
