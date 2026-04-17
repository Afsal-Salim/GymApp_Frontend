'use client';

import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 350;

/**
 * Route / dynamic-import fallback: avoids a “Loading…” flash when the chunk or segment resolves quickly.
 */
export default function RouteSegmentLoading({ delayMs = DEFAULT_DELAY_MS }: { delayMs?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(id);
  }, [delayMs]);

  if (!visible) {
    return <div className="min-vh-100" aria-hidden />;
  }

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
