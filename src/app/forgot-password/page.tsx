import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const ForgotPasswordPage = dynamic(() => import('@/ui-pages/auth/ForgotPasswordPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <ForgotPasswordPage />;
}
