import nextDynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const dynamic = 'force-dynamic';

const ForgotPasswordPage = nextDynamic(() => import('@/features/auth/ForgotPasswordPage/ForgotPasswordPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <ForgotPasswordPage />;
}
