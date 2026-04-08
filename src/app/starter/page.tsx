import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const revalidate = 3600;

const PaymentPage = dynamic(() => import('@/features/payment/PaymentPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function StarterPaymentPage() {
  return <PaymentPage plan="starter" />;
}
