import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useParams, notFound } from 'next/navigation';
import { getPublicGymSlugFromHostHeader } from '@/config/env';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';

const CrystalBusinessPage = dynamic(
  () => import('@/features/crystal/CrystalBusinessPage/CrystalBusinessPage'),
  { loading: () => <RouteSegmentLoading /> },
);

/**
 * Mirrors `/gym-by-host/[slug]/[[...path]]`. Originally a Next server component that read the
 * `host` header to confirm the URL came from the gym subdomain; in the SPA we resolve the slug
 * from `window.location.host` instead.
 */
export default function GymByHostPage() {
  const { slug = '' } = useParams<{ slug: string; path?: string[] }>();
  const host = typeof window !== 'undefined' ? window.location.host : null;
  const fromHost = getPublicGymSlugFromHostHeader(host);
  if (!fromHost || decodeURIComponent(slug) !== fromHost) notFound();
  return (
    <Suspense fallback={<RouteSegmentLoading />}>
      <CrystalBusinessPage />
    </Suspense>
  );
}
