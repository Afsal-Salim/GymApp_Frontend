import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const ManageBusinessPage = dynamic(() => import('@/features/user/ManageBusinessPage/ManageBusinessPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <ManageBusinessPage />;
}
