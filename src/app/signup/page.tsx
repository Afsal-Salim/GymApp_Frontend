import nextDynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const dynamic = 'force-dynamic';

const SignupPage = nextDynamic(() => import('@/features/auth/SignupPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <SignupPage />;
}
