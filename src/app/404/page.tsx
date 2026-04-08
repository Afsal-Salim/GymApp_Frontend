import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const NotFoundPage = dynamic(() => import('@/features/NotFound'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <NotFoundPage />;
}
