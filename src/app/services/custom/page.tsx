import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

export const revalidate = 3600;

const ServiceEnquiryPage = dynamic(() => import('@/features/services/ServiceEnquiryPage'), {
  loading: () => <RouteSegmentLoading />,
});

export default function Page() {
  return <ServiceEnquiryPage />;
}
