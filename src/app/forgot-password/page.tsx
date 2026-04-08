import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const ForgotPasswordPage = dynamic(() => import('@/features/auth/ForgotPasswordPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <ForgotPasswordPage />;
}
