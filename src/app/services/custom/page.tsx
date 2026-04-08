import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const ServiceEnquiryPage = dynamic(() => import('@/ui-pages/services/ServiceEnquiryPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <ServiceEnquiryPage />;
}
