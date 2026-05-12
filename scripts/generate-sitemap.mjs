#!/usr/bin/env node
/**
 * Build-time sitemap generator.
 *
 * Run this whenever the marketing route list changes. It writes a static `sitemap.xml` into
 * `public/` which Vite then copies into the production `dist/` bundle.
 *
 *   node scripts/generate-sitemap.mjs
 *
 * Origin is read from `SITE_URL`, falling back to `PUBLIC_SITE_DOMAIN`.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STATIC_PATHS = [
  { path: '/', changefreq: 'weekly', priority: 1 },
  { path: '/plans', changefreq: 'weekly', priority: 0.95 },
  { path: '/services/custom', changefreq: 'monthly', priority: 0.85 },
  { path: '/login', changefreq: 'monthly', priority: 0.75 },
  { path: '/signup', changefreq: 'monthly', priority: 0.75 },
  { path: '/forgot-password', changefreq: 'yearly', priority: 0.3 },
  { path: '/support', changefreq: 'monthly', priority: 0.65 },
  { path: '/base', changefreq: 'monthly', priority: 0.7 },
  { path: '/legal/privacy', changefreq: 'yearly', priority: 0.35 },
  { path: '/legal/user-content', changefreq: 'yearly', priority: 0.35 },
];

function resolveOrigin() {
  const env = process.env;
  const explicit = (env.SITE_URL ?? '').trim();
  if (explicit) {
    try {
      return new URL(explicit.includes('://') ? explicit : `https://${explicit}`).origin;
    } catch {
      /* fall through */
    }
  }
  const domain = (env.PUBLIC_SITE_DOMAIN ?? '').trim();
  if (domain) {
    return `https://${domain.replace(/^https?:\/\//, '').split('/')[0]}`;
  }
  return 'http://localhost:3000';
}

const origin = resolveOrigin();
const now = new Date().toISOString();

const urls = STATIC_PATHS.map(
  ({ path, changefreq, priority }) => `  <url>
    <loc>${new URL(path, `${origin}/`).href}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const out = resolve(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(out, xml);
console.log(`Wrote ${out}`);
