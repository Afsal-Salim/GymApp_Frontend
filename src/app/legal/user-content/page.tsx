import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const UserContentPolicyPage = dynamic(() => import('@/features/legal/UserContentPolicyPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <UserContentPolicyPage />;
}
