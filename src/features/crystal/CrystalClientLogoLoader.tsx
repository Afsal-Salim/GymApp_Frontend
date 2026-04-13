'use client';

import type { CSSProperties } from 'react';
import crystalLogo from '../../assets/logo.svg';
import './CrystalClientLogoLoader.css';

const LOGO_SRC = typeof crystalLogo === 'string' ? crystalLogo : crystalLogo.src;

/** Minimal full-viewport loader: Crystal mark only (replaces generic dots + copy on public client). */
export function CrystalClientLogoLoader({ style }: { style?: CSSProperties }) {
  return (
    <div className="crystal-client-logo-loader" style={style} role="status" aria-busy="true" aria-label="Loading">
      <img
        src={LOGO_SRC}
        alt=""
        className="crystal-client-logo-loader__mark"
        width={96}
        height={96}
        decoding="async"
      />
    </div>
  );
}
