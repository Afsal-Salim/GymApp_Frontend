/** Lightweight fallback while a route segment’s client bundle loads (see `next/dynamic`). */
export default function RouteSegmentLoading() {
  return (
    <div
      className="d-flex min-vh-100 align-items-center justify-content-center py-5 text-muted small"
      role="status"
      aria-live="polite"
    >
      Loading…
    </div>
  );
}
