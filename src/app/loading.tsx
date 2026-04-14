/**
 * Default RSC navigation fallback for routes without their own `loading.tsx`.
 * Keeps the shell (navbar/footer from layout) while the next segment streams.
 */
export default function RootLoading() {
  return (
    <div className="app-route-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="app-route-loading__inner">
        <div className="spinner-border text-primary app-route-loading__spinner" aria-hidden />
        <span className="app-route-loading__text text-muted small">Loading…</span>
      </div>
    </div>
  );
}
