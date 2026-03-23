import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import './MainLayout.css';

/** Marketing app shell (navbar/footer) is hidden — URL is the gym’s public site under /crystal/:slug. */
function isCrystalClientSitePath(pathname: string): boolean {
  return /^\/crystal\/[^/]+/.test(pathname);
}

export default function MainLayout() {
  const location = useLocation();
  const [showRouteLoader, setShowRouteLoader] = useState(false);
  const hideMarketingChrome = isCrystalClientSitePath(location.pathname);

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
