/**
 * Central React Router config. Replaces Next's file-system routing.
 *
 * Every path here mirrors the original directory in `src/app/`. The route's element is
 * lazy-imported from the exact same `page.tsx` file that Next.js used, so file paths and
 * code-splitting boundaries stay consistent with the previous layout.
 */
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import RouteSegmentLoading from '@/app/_components/RouteSegmentLoading';
import UserLayoutRoute from '@/app/user/layout';
import TemplatesLayoutRoute from '@/app/templates/layout';

/** Helper: lazy-loaded element with a delayed Suspense fallback (mirrors `loading.tsx` in App Router). */
function lazyRoute(loader: () => Promise<{ default: React.ComponentType }>) {
  const Lazy = lazy(loader);
  return (
    <Suspense fallback={<RouteSegmentLoading />}>
      <Lazy />
    </Suspense>
  );
}

const HomePageRoute = lazy(() => import('@/app/page'));
const NotFoundPageRoute = lazy(() => import('@/app/404/page'));

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<RouteSegmentLoading />}>
            <HomePageRoute />
          </Suspense>
        }
      />

      {/* Auth */}
      <Route path="/login" element={lazyRoute(() => import('@/app/login/page'))} />
      <Route path="/signup" element={lazyRoute(() => import('@/app/signup/page'))} />
      <Route
        path="/forgot-password"
        element={lazyRoute(() => import('@/app/forgot-password/page'))}
      />

      {/* Plans + checkout */}
      <Route path="/plans" element={lazyRoute(() => import('@/app/plans/page'))} />
      <Route
        path="/plans/:businessSlug"
        element={lazyRoute(() => import('@/app/plans/[businessSlug]/page'))}
      />
      <Route path="/base" element={lazyRoute(() => import('@/app/base/page'))} />
      <Route path="/pro" element={lazyRoute(() => import('@/app/pro/page'))} />
      <Route path="/max" element={lazyRoute(() => import('@/app/max/page'))} />
      <Route path="/starter" element={lazyRoute(() => import('@/app/starter/page'))} />

      {/* Static marketing */}
      <Route path="/support" element={lazyRoute(() => import('@/app/support/page'))} />
      <Route
        path="/services/custom"
        element={lazyRoute(() => import('@/app/services/custom/page'))}
      />
      <Route path="/legal/privacy" element={lazyRoute(() => import('@/app/legal/privacy/page'))} />
      <Route
        path="/legal/user-content"
        element={lazyRoute(() => import('@/app/legal/user-content/page'))}
      />

      {/* Authenticated user workspace (wrapped in UserLayout → ProtectedRoute + font scope) */}
      <Route path="/user" element={<UserLayoutRoute />}>
        <Route index element={lazyRoute(() => import('@/app/user/page'))} />
        <Route path="admin" element={lazyRoute(() => import('@/app/user/admin/page'))} />
        <Route
          path="create-website"
          element={lazyRoute(() => import('@/app/user/create-website/page'))}
        />
        <Route
          path="create-website/builder"
          element={lazyRoute(() => import('@/app/user/create-website/builder/page'))}
        />
        <Route
          path="create-website/select-template"
          element={lazyRoute(() => import('@/app/user/create-website/select-template/page'))}
        />
        <Route
          path="business/:slug/builder"
          element={lazyRoute(() => import('@/app/user/business/[slug]/builder/page'))}
        />
        <Route
          path="business/:slug/edit"
          element={lazyRoute(() => import('@/app/user/business/[slug]/edit/page'))}
        />
        <Route
          path="business/:slug/edit/select-template"
          element={lazyRoute(() => import('@/app/user/business/[slug]/edit/select-template/page'))}
        />
        <Route
          path="business/:slug/manage"
          element={lazyRoute(() => import('@/app/user/business/[slug]/manage/page'))}
        />
        <Route
          path="business/:slug/settings"
          element={lazyRoute(() => import('@/app/user/business/[slug]/settings/page'))}
        />
      </Route>

      {/* Standalone Pro template previews (no marketing chrome) */}
      <Route path="/templates" element={<TemplatesLayoutRoute />}>
        <Route
          path="client-autopilot"
          element={lazyRoute(() => import('@/app/templates/client-autopilot/page'))}
        />
        <Route
          path="client-fitcore"
          element={lazyRoute(() => import('@/app/templates/client-fitcore/page'))}
        />
        <Route
          path="client-grapes-cli"
          element={lazyRoute(() => import('@/app/templates/client-grapes-cli/page'))}
        />
        <Route
          path="client-grapes-hello"
          element={lazyRoute(() => import('@/app/templates/client-grapes-hello/page'))}
        />
        <Route
          path="client-grapes-welcome"
          element={lazyRoute(() => import('@/app/templates/client-grapes-welcome/page'))}
        />
        <Route
          path="client-sole"
          element={lazyRoute(() => import('@/app/templates/client-sole/page'))}
        />
        <Route
          path="client-sonicflow"
          element={lazyRoute(() => import('@/app/templates/client-sonicflow/page'))}
        />
        <Route
          path="client-vital"
          element={lazyRoute(() => import('@/app/templates/client-vital/page'))}
        />
        <Route
          path="client-zen"
          element={lazyRoute(() => import('@/app/templates/client-zen/page'))}
        />
        <Route
          path="design-system-preview/:setId"
          element={lazyRoute(() => import('@/app/templates/design-system-preview/[setId]/page'))}
        />
      </Route>

      {/* Public gym site via host rewrite (mirrors /gym-by-host/[slug]/[[...path]]) */}
      <Route
        path="/gym-by-host/:slug/*"
        element={lazyRoute(() => import('@/app/gym-by-host/[slug]/[[...path]]/page'))}
      />

      {/* Public crystal catch-all (gym site path-based fallback when subdomain routing is off) */}
      <Route
        path="/:slug/*"
        element={lazyRoute(() => import('@/app/[slug]/[[...rest]]/page'))}
      />
      <Route
        path="/:slug"
        element={lazyRoute(() => import('@/app/[slug]/[[...rest]]/page'))}
      />

      {/* Explicit 404 page */}
      <Route
        path="/404"
        element={
          <Suspense fallback={<RouteSegmentLoading />}>
            <NotFoundPageRoute />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<RouteSegmentLoading />}>
            <NotFoundPageRoute />
          </Suspense>
        }
      />
    </Routes>
  );
}
