import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const PaymentPage = dynamic(() => import('@/features/payment/PaymentPage/PaymentPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function BasePaymentPage() {
  return <PaymentPage plan="base" />;
}
