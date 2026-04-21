import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RESERVED_PUBLIC_SITE_SUBDOMAINS = new Set([
  'www',
  'api',
  'app',
  'mail',
  'admin',
  'staging',
  'dev',
  'cdn',
  'static',
  'preview',
  'localhost',
]);

function gymSlugFromHost(host: string, publicSiteDomain: string): string | null {
  const domain = publicSiteDomain.toLowerCase();
  const h = host.toLowerCase();
  if (h === domain || h === `www.${domain}`) return null;
  const suffix = `.${domain}`;
  if (!h.endsWith(suffix)) return null;
  const sub = h.slice(0, -suffix.length);
  if (!sub || sub.includes('.')) return null;
  if (RESERVED_PUBLIC_SITE_SUBDOMAINS.has(sub)) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(sub)) return null;
  return sub;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /** Let Next rewrites forward `/api/*` to Django — never treat as a public-gym `[slug]`. */
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  /** Next Route Handler for Grapes template seeds — must not be rewritten as a gym-by-host path. */
  if (pathname === '/gjs-pro-template' || pathname.startsWith('/gjs-pro-template/')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/gym-by-host/')) {
    return NextResponse.next();
  }

  if (pathname === '/crystal' || pathname.startsWith('/crystal/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/crystal(?=\/|$)/, '') || '/';
    return NextResponse.redirect(url);
  }

  const domain = (process.env.NEXT_PUBLIC_PUBLIC_SITE_DOMAIN ?? '').trim().toLowerCase();
  if (!domain) return NextResponse.next();

  const rawHost = request.headers.get('host') ?? '';
  const host = rawHost.split(':')[0]?.toLowerCase() ?? '';
  if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return NextResponse.next();

  const slug = gymSlugFromHost(host, domain);
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/gym-by-host/${encodeURIComponent(slug)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
