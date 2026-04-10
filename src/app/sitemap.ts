import type { MetadataRoute } from 'next';
import { getMarketingSiteOrigin } from '@/lib/siteUrl';

const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }[] =
  [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/plans', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/services/custom', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/login', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/signup', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/forgot-password', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/support', changeFrequency: 'monthly', priority: 0.65 },
    { path: '/starter', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/pro', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.35 },
    { path: '/legal/user-content', changeFrequency: 'yearly', priority: 0.35 },
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getMarketingSiteOrigin().origin;
  const now = new Date();

  return STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, `${origin}/`).href,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
