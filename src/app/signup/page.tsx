import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const SignupPage = dynamic(() => import('@/features/auth/SignupPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <SignupPage />;
}
