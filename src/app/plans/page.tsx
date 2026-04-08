import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const PlansPage = dynamic(() => import('@/features/plans/PlansPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <PlansPage />;
}
