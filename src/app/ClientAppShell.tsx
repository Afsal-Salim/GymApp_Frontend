'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar, Footer } from '@/components';
import { getPublicGymSlugFromHost, MARKETING_APP_PATH_FIRST_SEGMENTS } from '@/config/env';
import { PageTransitionBar } from '@/layouts/PageTransitionBar';
import { RouteTransitionLoader } from '@/layouts/RouteTransitionLoader';
import MarketingRoutePrefetcher from '@/app/_components/MarketingRoutePrefetcher';
import '@/layouts/MainLayout.css';

const SHOW_IN_DEVELOPMENT_BANNER = true;

function InDevelopmentBanner({ pathname }: { pathname: string }) {
  if (!SHOW_IN_DEVELOPMENT_BANNER) return null;
  const pathOnly = pathname.split('?')[0];
  if (pathOnly === '/404' || pathOnly.startsWith('/404/')) return null;
  return (
    <div
      role="status"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        background: '#b45309',
        color: '#fff',
        textAlign: 'center',
        padding: '6px 12px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
      }}
    >
      In development
    </div>
  );
}

function ScrollToTop({ pathname }: { pathname: string }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function isDedicatedNotFoundPath(pathname: string): boolean {
  const path = pathname.split('?')[0];
  return path === '/404' || path.startsWith('/404/');
}

function isGymPublicSitePath(pathname: string): boolean {
  if (getPublicGymSlugFromHost()) return true;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return false;
  return !MARKETING_APP_PATH_FIRST_SEGMENTS.has(seg);
}

function shouldHideMainLayoutChrome(pathname: string): boolean {
  return isDedicatedNotFoundPath(pathname) || isGymPublicSitePath(pathname);
}

const CLIENT_GYM_ROUTE_LOADER_EXCLUDED_SEGMENTS = new Set<string>([
  ...MARKETING_APP_PATH_FIRST_SEGMENTS,
  'preview',
  'crystal',
]);

function shouldShowClientGymRouteLoader(pathname: string): boolean {
  if (isDedicatedNotFoundPath(pathname)) return false;
  if (getPublicGymSlugFromHost()) return true;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return false;
  if (CLIENT_GYM_ROUTE_LOADER_EXCLUDED_SEGMENTS.has(seg)) return false;
  return true;
}

/**
 * Public gym UI (`CrystalBusinessPage`) already shows skeleton + branded intro — skip the global
 * Crystal overlay so the logo does not flash twice (overlay feels like a static pop on top of intro).
 */
function shouldSuppressRouteLoaderForCrystalGymClient(pathname: string): boolean {
  if (getPublicGymSlugFromHost()) return true;
  const pathOnly = pathname.split('?')[0];
  const parts = pathOnly.split('/').filter(Boolean);
  if (parts.length !== 1) return false;
  return !MARKETING_APP_PATH_FIRST_SEGMENTS.has(parts[0]!);
}

/** Per-gym dashboard routes (`/user/business/...`) — excluded from gym loader; show overlay only after leaving the session’s first URL. */
function shouldShowUserBusinessRouteLoader(pathname: string, sessionBootPath: string): boolean {
  if (isDedicatedNotFoundPath(pathname)) return false;
  if (!pathname.startsWith('/user/business/')) return false;
  return pathname !== sessionBootPath;
}

export default function ClientAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showRouteLoader, setShowRouteLoader] = useState(false);
  const bootPathRef = useRef<string | null>(null);
  if (bootPathRef.current === null) {
    bootPathRef.current = pathname;
  }
  /** Avoid page-enter motion on the first URL (prevents a second “pop” from React Strict remounts / layout). */
  const showPageRouteEnterMotion = pathname !== bootPathRef.current;
  const hideMarketingChrome = shouldHideMainLayoutChrome(pathname);
  const notFoundLayout = isDedicatedNotFoundPath(pathname);

  useEffect(() => {
    const boot = bootPathRef.current ?? pathname;
    const gym =
      shouldShowClientGymRouteLoader(pathname) && !shouldSuppressRouteLoaderForCrystalGymClient(pathname);
    const userBiz = shouldShowUserBusinessRouteLoader(pathname, boot);
    if (!gym && !userBiz) {
      setShowRouteLoader(false);
      return;
    }
    setShowRouteLoader(true);
    const ms = userBiz ? 1200 : 780;
    const t = setTimeout(() => setShowRouteLoader(false), ms);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className={`main-layout${notFoundLayout ? ' main-layout--not-found' : ''}`}>
      <InDevelopmentBanner pathname={pathname} />
      <ScrollToTop pathname={pathname} />
      {!hideMarketingChrome && <PageTransitionBar pathname={pathname} />}
      <RouteTransitionLoader active={showRouteLoader} />
      {!hideMarketingChrome && <MarketingRoutePrefetcher />}
      {!hideMarketingChrome && <Navbar />}
      <div className="main-layout__content">
        <div
          key={pathname}
          className={`main-layout__page${showPageRouteEnterMotion ? ' main-layout__page--route-enter' : ''}`.trim()}
        >
          {children}
        </div>
      </div>
      {!hideMarketingChrome && <Footer />}
    </div>
  );
}
