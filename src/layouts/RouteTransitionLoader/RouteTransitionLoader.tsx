'use client';

import { CrystalClientLogoLoader } from '@/features/crystal/CrystalClientLogoLoader/CrystalClientLogoLoader';
import './RouteTransitionLoader.css';

/** Brief route-change overlay on gym client paths — Crystal mark only (no generic dots). */
export function RouteTransitionLoader({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="route-transition-loader" role="status" aria-live="polite">
      <CrystalClientLogoLoader />
    </div>
  );
}
