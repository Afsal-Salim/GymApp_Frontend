'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar, Footer } from '@/components/index/index';
import { getPublicGymSlugFromHost, MARKETING_APP_PATH_FIRST_SEGMENTS } from '@/config/env';
import { PageTransitionBar } from '@/layouts/PageTransitionBar/PageTransitionBar';
import { RouteTransitionLoader } from '@/layouts/RouteTransitionLoader/RouteTransitionLoader';
import MarketingRoutePrefetcher from '@/app/_components/MarketingRoutePrefetcher';
import '@/layouts/MainLayout/MainLayout.css';

/** Overlay duration — long enough to cover slow dev compiles and dynamic route RSC. */
const ROUTE_TRANSITION_OVERLAY_MS = 2800;

/**
 * Static marketing / legal pages (footer: Services, Support, Privacy, Terms). No transition overlay —
 * they are mostly static and should feel instant.
 */
function isStaticMarketingShellPath(pathname: string): boolean {
  const pathOnly = pathname.split('?')[0];
  if (pathOnly.startsWith('/legal/')) return true;
  if (pathOnly === '/services/custom') return true;
  if (pathOnly === '/support') return true;
  return false;
}

function isAuthPath(pathname: string): boolean {
  const pathOnly = pathname.split('?')[0];
  return pathOnly === '/login' || pathOnly === '/signup';
}

/** Member dashboard (`/user`, settings, manage, etc.) — no global Crystal route overlay; pages handle their own UI. */
function isUserAppPath(pathname: string): boolean {
  const pathOnly = pathname.split('?')[0];
  return pathOnly === '/user' || pathOnly.startsWith('/user/');
}

function ScrollToTop({ pathname }: { pathname: string }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function isStandaloneTemplatePath(pathname: string): boolean {
  const pathOnly = pathname.split('?')[0];
  return pathOnly.startsWith('/templates/');
}

/** Full-screen Grapes builder — hide global marketing navbar/footer chrome. */
function isWebsiteBuilderPath(pathname: string): boolean {
  const pathOnly = pathname.split('?')[0];
  return pathOnly.endsWith('/builder');
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
  return (
    isDedicatedNotFoundPath(pathname) ||
    isGymPublicSitePath(pathname) ||
    isStandaloneTemplatePath(pathname) ||
    isWebsiteBuilderPath(pathname)
  );
}

function shouldHideFooter(pathname: string): boolean {
  const pathOnly = pathname.split('?')[0];
  return pathOnly === '/user' || pathOnly.startsWith('/user/');
}

/**
 * Marketing host `/:slug` public gym — `CrystalBusinessPage` already shows intro/skeleton; skip the
 * global Crystal overlay so it does not stack. Gym **subdomain** navigations still use the global loader.
 */
function shouldSuppressRouteLoaderForCrystalGymClient(pathname: string): boolean {
  if (getPublicGymSlugFromHost()) return false;
  const pathOnly = pathname.split('?')[0];
  const parts = pathOnly.split('/').filter(Boolean);
  if (parts.length !== 1) return false;
  return !MARKETING_APP_PATH_FIRST_SEGMENTS.has(parts[0]!);
}

export default function ClientAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showRouteLoader, setShowRouteLoader] = useState(false);
  /** Frozen first pathname for this shell instance (enter motion on later navigations). */
  const [bootPath] = useState(() => pathname);
  const prevPathnameRef = useRef<string | null>(null);

  const showPageRouteEnterMotion = pathname !== bootPath;
  const hideMarketingChrome = shouldHideMainLayoutChrome(pathname);
  const hideFooter = shouldHideFooter(pathname);
  const notFoundLayout = isDedicatedNotFoundPath(pathname);

  useEffect(() => {
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    const prevOnly = prevPathnameRef.current.split('?')[0];
    const pathOnly = pathname.split('?')[0];
    if (prevOnly === pathOnly) {
      return;
    }

    prevPathnameRef.current = pathname;

    if (isDedicatedNotFoundPath(pathname)) {
      setShowRouteLoader(false);
      return;
    }

    if (isAuthPath(pathname)) {
      setShowRouteLoader(false);
      return;
    }

    if (isUserAppPath(pathname)) {
      setShowRouteLoader(false);
      return;
    }

    if (shouldSuppressRouteLoaderForCrystalGymClient(pathname)) {
      setShowRouteLoader(false);
      return;
    }

    if (isStaticMarketingShellPath(pathname)) {
      setShowRouteLoader(false);
      return;
    }

    if (isStandaloneTemplatePath(pathname)) {
      setShowRouteLoader(false);
      return;
    }

    setShowRouteLoader(true);
    const t = window.setTimeout(() => setShowRouteLoader(false), ROUTE_TRANSITION_OVERLAY_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div className={`main-layout${notFoundLayout ? ' main-layout--not-found' : ''}`}>
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
      {!hideMarketingChrome && !hideFooter && <Footer />}
    </div>
  );
}
