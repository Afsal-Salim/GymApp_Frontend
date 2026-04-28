import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const AdminDashboardPage = dynamic(() => import('@/features/user/AdminDashboardPage/AdminDashboardPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <AdminDashboardPage />;
}
