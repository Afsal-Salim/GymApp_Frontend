import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const NotFoundPage = dynamic(() => import('@/ui-pages/NotFound'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <NotFoundPage />;
}
