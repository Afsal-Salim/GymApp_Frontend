import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAccessToken } from '../../../../api';

/**
 * Protects routes that require authentication.
 * If there is no access token, redirects to /login with return URL in state.
 * Otherwise renders the child route (Outlet).
 */
export default function ProtectedRoute() {
  const location = useLocation();
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
