import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

/** API base from `.env` only (`NEXT_PUBLIC_*` or legacy `VITE_API_BASE_URL`). No default URL in code. */
function resolvedApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? '')
    .trim()
    .replace(/\/$/, '');
}

/**
 * Proxy `/api/*` on the Next origin → real backend so:
 * - `curl http://localhost:3000/api/auth/login` hits Django, not the `[slug]` catch-all.
 * - Optional same-origin API base (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`) avoids CORS.
 * Skip when the configured base already points at this dev server (would loop).
 *
 * **Note:** Next-only Route Handlers must live outside `/api/` (e.g. `/gjs-pro-template/[key]`) or they get
 * proxied to Django and return 404. The visual builder uses `app/gjs-pro-template/[key]/route.ts`.
 */
function shouldEnableApiProxy(): boolean {
  const base = resolvedApiBase();
  if (!base) return false;
  try {
    const u = new URL(base.endsWith('/') ? base : `${base}/`);
    const port = u.port || (u.protocol === 'https:' ? '443' : '80');
    const isThisNextDev =
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1') && port === '3000';
    return !isThisNextDev;
  } catch {
    return false;
  }
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Hide `X-Powered-By: Next.js` in production responses. */
  poweredByHeader: false,
  transpilePackages: ['@mui/material', '@mui/icons-material'],
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    /**
     * Client Router Cache: keep prefetched / recently visited segments warm briefly so back-nav and
     * repeat visits feel instant without disabling fresh data for long.
     */
    staleTimes: {
      dynamic: 60,
      static: 300,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    if (!shouldEnableApiProxy()) return [];
    const base = resolvedApiBase();
    return [{ source: '/api/:path*', destination: `${base}/:path*` }];
  },
};

export default withBundleAnalyzer(nextConfig);
