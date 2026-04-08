import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const PaymentPage = dynamic(() => import('@/ui-pages/payment/PaymentPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function ProPaymentPage() {
  return <PaymentPage plan="pro" />;
}
