import type { MetadataRoute } from 'next';
import { getMarketingSiteOrigin } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const origin = getMarketingSiteOrigin().origin;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/user/', '/api/', '/gym-by-host/', '/_next/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, ''),
  };
}
