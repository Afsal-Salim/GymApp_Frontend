import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const revalidate = 3600;

const SupportFeedbackPage = dynamic(() => import('@/features/legal/SupportFeedbackPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <SupportFeedbackPage />;
}
