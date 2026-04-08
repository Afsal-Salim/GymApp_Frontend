'use client';

import { Suspense, useLayoutEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import {
  isPublicSiteSubdomainRoutingActive,
  MARKETING_APP_PATH_FIRST_SEGMENTS,
  publicGymSiteUrl,
} from '@/config/env';
import CrystalBusinessPage from '@/ui-pages/crystal/CrystalBusinessPage';

export default function PublicCrystalCatchAllClient() {
  const params = useParams<{ slug: string; rest?: string[] }>();
  const slug = params.slug;
  const rest = params.rest?.join('/') ?? '';

  if (!slug || MARKETING_APP_PATH_FIRST_SEGMENTS.has(slug)) {
    notFound();
  }

  useLayoutEffect(() => {
    if (!isPublicSiteSubdomainRoutingActive() || !slug || slug === 'preview' || slug === 'crystal') return;
    const pathSuffix = rest ? `/${rest}` : '/';
    window.location.replace(publicGymSiteUrl(slug, pathSuffix) + window.location.search + window.location.hash);
  }, [slug, rest]);

  if (isPublicSiteSubdomainRoutingActive() && slug && slug !== 'preview' && slug !== 'crystal') {
    return (
      <div className="container py-5 text-center text-muted small" role="status">
        Redirecting to your gym site…
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <CrystalBusinessPage />
    </Suspense>
  );
}
