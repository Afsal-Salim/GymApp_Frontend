import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const SupportFeedbackPage = dynamic(() => import('@/features/legal/SupportFeedbackPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <SupportFeedbackPage />;
}
