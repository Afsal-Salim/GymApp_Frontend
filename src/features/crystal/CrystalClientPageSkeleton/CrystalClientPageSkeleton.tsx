'use client';

import './CrystalClientPageSkeleton.css';

/**
 * Shimmer skeleton for the public gym shell while data loads — structure-first UX (navbar, hero, cards).
 * Uses theme tokens from the parent viewport (`--gym-client-dark`, `--gym-client-accent`, etc.).
 */
export function CrystalClientPageSkeleton() {
  return (
    <div className="crystal-client-skeleton" aria-hidden>
      <div className="crystal-client-skeleton__nav">
        <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__nav-brand" />
        <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__nav-link" />
        <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__nav-link" />
        <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__nav-cta" />
      </div>
      <div className="crystal-client-skeleton__hero">
        <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__hero-line crystal-client-skeleton__hero-line--lg" />
        <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__hero-line crystal-client-skeleton__hero-line--md" />
        <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__hero-line crystal-client-skeleton__hero-line--sm" />
        <div className="crystal-client-skeleton__hero-actions">
          <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__hero-btn" />
          <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__hero-btn crystal-client-skeleton__hero-btn--ghost" />
        </div>
      </div>
      <div className="crystal-client-skeleton__cards">
        {[0, 1, 2].map((i) => (
          <div key={i} className="crystal-client-skeleton__card">
            <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__card-title" />
            <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__card-line" />
            <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__card-line crystal-client-skeleton__card-line--short" />
            <span className="crystal-client-skeleton__shimmer crystal-client-skeleton__card-cta" />
          </div>
        ))}
      </div>
    </div>
  );
}
