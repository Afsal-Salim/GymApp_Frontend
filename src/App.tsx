/**
 * Top-level app shell. Composes the global providers and renders the router.
 *
 * `useHostRouting()` ports the legacy `src/middleware.ts` behaviour (host-based gym slug rewrites
 * and `/crystal/...` redirects) into a single client-side hook.
 */
import Providers from './app/providers';
import ClientAppShell from './app/ClientAppShell';
import AppRouter from './router';
import { useHostRouting } from './lib/hostRouting';
import NotFoundBoundary from './app/_components/NotFoundBoundary';

export default function App() {
  useHostRouting();
  return (
    <Providers>
      <ClientAppShell>
        <NotFoundBoundary>
          <AppRouter />
        </NotFoundBoundary>
      </ClientAppShell>
    </Providers>
  );
}
