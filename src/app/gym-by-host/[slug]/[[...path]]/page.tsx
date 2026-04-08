import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import { getPublicGymSlugFromHostHeader } from '@/config/env';
import { notFound } from 'next/navigation';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const CrystalBusinessPage = dynamic(() => import('@/ui-pages/crystal/CrystalBusinessPage'), {
  loading: () => <RouteSegmentLoading />,
});

type Props = { params: Promise<{ slug: string; path?: string[] }> };

export default async function GymByHostPage({ params }: Props) {
  const { slug } = await params;
  const host = (await headers()).get('host');
  const fromHost = getPublicGymSlugFromHostHeader(host);
  if (!fromHost || decodeURIComponent(slug) !== fromHost) notFound();
  return (
    <Suspense fallback={<RouteSegmentLoading />}>
      <CrystalBusinessPage />
    </Suspense>
  );
}
