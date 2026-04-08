import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const revalidate = 3600;

const NotFoundPage = dynamic(() => import('@/features/NotFound'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <NotFoundPage />;
}
