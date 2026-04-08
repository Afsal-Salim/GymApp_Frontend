import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const PrivacyPolicyPage = dynamic(() => import('@/ui-pages/legal/PrivacyPolicyPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <PrivacyPolicyPage />;
}
