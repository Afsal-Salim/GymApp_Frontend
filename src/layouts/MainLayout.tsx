import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import './MainLayout.css';

/** App routes that use the marketing shell; all other first path segments are treated as public gym sites (`/:slug`). */
const MARKETING_FIRST_SEGMENTS = new Set([
  'plans',
  'starter',
  'pro',
  'login',
  'signup',
  'forgot-password',
  'legal',
  'user',
]);

/** Hide navbar/footer on public gym pages (e.g. `/my-gym`, `/preview`). */
function isGymPublicSitePath(pathname: string): boolean {
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return false;
  return !MARKETING_FIRST_SEGMENTS.has(seg);
}

export default function MainLayout() {
  const location = useLocation();
  const [showRouteLoader, setShowRouteLoader] = useState(false);
  const hideMarketingChrome = isGymPublicSitePath(location.pathname);

  useEffect(() => {
    setShowRouteLoader(true);
    const t = setTimeout(() => setShowRouteLoader(false), 600);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <div
        className={`main-layout__route-loader ${showRouteLoader ? 'main-layout__route-loader--active' : ''}`}
        aria-hidden
      />
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
