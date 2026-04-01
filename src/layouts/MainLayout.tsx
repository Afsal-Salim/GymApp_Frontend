import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { getPublicGymSlugFromHost, MARKETING_APP_PATH_FIRST_SEGMENTS } from '../config/env';
import { RouteTransitionLoader } from './RouteTransitionLoader';
import './MainLayout.css';

/** Hide navbar/footer on public gym pages (e.g. `/my-gym`, `/preview`, or `{slug}.domain`). */
function isGymPublicSitePath(pathname: string): boolean {
  if (getPublicGymSlugFromHost()) return true;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return false;
  return !MARKETING_APP_PATH_FIRST_SEGMENTS.has(seg);
}

/**
 * Full-screen “Loading your gym…” only when entering a **client public gym** URL — not marketing,
 * not `/preview` (Crystal preview), not legacy `/crystal`.
 */
const CLIENT_GYM_ROUTE_LOADER_EXCLUDED_SEGMENTS = new Set<string>([
  ...MARKETING_APP_PATH_FIRST_SEGMENTS,
  'preview',
  'crystal',
]);

function shouldShowClientGymRouteLoader(pathname: string): boolean {
  if (getPublicGymSlugFromHost()) return true;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return false;
  if (CLIENT_GYM_ROUTE_LOADER_EXCLUDED_SEGMENTS.has(seg)) return false;
  return true;
}

export default function MainLayout() {
  const location = useLocation();
  const [showRouteLoader, setShowRouteLoader] = useState(false);
  const hideMarketingChrome = isGymPublicSitePath(location.pathname);

  useEffect(() => {
    if (!shouldShowClientGymRouteLoader(location.pathname)) {
      setShowRouteLoader(false);
      return;
    }
    setShowRouteLoader(true);
    const t = setTimeout(() => setShowRouteLoader(false), 780);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <RouteTransitionLoader active={showRouteLoader} />
      {!hideMarketingChrome && <Navbar />}
      <div className="main-layout__content">
        <div key={location.pathname} className="main-layout__page">
          <Outlet />
        </div>
      </div>
      {!hideMarketingChrome && <Footer />}
    </div>
  );
}
