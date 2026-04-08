import dynamic from 'next/dynamic';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const PublicCrystalCatchAllClient = dynamic(() => import('./PublicCrystalCatchAllClient'), {
  loading: () => <RouteSegmentLoading />,
});

export default function PublicCrystalCatchAllPage() {
  return <PublicCrystalCatchAllClient />;
}
