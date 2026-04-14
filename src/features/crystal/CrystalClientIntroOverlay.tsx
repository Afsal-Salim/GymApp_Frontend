'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CRYSTAL_LOGO_MARK_SRC } from './CrystalClientLogoLoader';
import './CrystalClientIntroOverlay.css';

export type CrystalClientIntroOverlayProps = {
  style?: CSSProperties;
  /** True when public bundle + site model are ready (intro can finish). */
  contentReady: boolean;
  /** When this fetch began (ms); used for a short minimum dwell before exit. */
  loadStartedAt: number | null;
  /** Fired once when exit begins so the page can crossfade in under the overlay. */
  onExitStart?: () => void;
  /** Fired after exit animation; parent should persist session skip + unmount. */
  onComplete: () => void;
};

/** One motion: Crystal mark + “Crystal” wordmark, then exit when content is ready. */
const BRAND_MOTION_MS = 1200;
const MIN_DWELL_FROM_LOAD_MS = 800;

/**
 * Full-screen splash: single entrance animation (product logo + wordmark only), then fade out
 * when the gym page is ready. No shimmer, gym title, tagline, or pulse phases.
 */
export function CrystalClientIntroOverlay({
  style,
  contentReady,
  loadStartedAt,
  onExitStart,
  onComplete,
}: CrystalClientIntroOverlayProps) {
  const [brandMotionDone, setBrandMotionDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const completeRef = useRef(false);
  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const finish = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (reducedMotion) {
      finish();
      return;
    }
    const id = window.setTimeout(() => setBrandMotionDone(true), BRAND_MOTION_MS);
    return () => window.clearTimeout(id);
  }, [reducedMotion, finish]);

  useEffect(() => {
    if (reducedMotion) return;
    if (!brandMotionDone || !contentReady || exiting) return;
    const extra =
      loadStartedAt != null ? Math.max(0, MIN_DWELL_FROM_LOAD_MS - (Date.now() - loadStartedAt)) : 0;
    const id = window.setTimeout(() => {
      onExitStart?.();
      setExiting(true);
    }, extra);
    return () => window.clearTimeout(id);
  }, [brandMotionDone, contentReady, exiting, reducedMotion, loadStartedAt, onExitStart]);

  useEffect(() => {
    if (!exiting || reducedMotion) return;
    const el = rootRef.current;
    if (!el) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'opacity') return;
      finish();
    };
    el.addEventListener('transitionend', onEnd, { once: true });
    const fallback = window.setTimeout(finish, 900);
    return () => {
      el.removeEventListener('transitionend', onEnd);
      window.clearTimeout(fallback);
    };
  }, [exiting, finish, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`crystal-intro${exiting ? ' crystal-intro--exiting' : ''}`}
      style={style}
      role="presentation"
      aria-hidden
    >
      <div className="crystal-intro__vignette" aria-hidden />
      <div className="crystal-intro__inner">
        <div className="crystal-intro__brand">
          <div className="crystal-intro__logo-wrap">
            <img src={CRYSTAL_LOGO_MARK_SRC} alt="" className="crystal-intro__logo" decoding="async" />
          </div>
          <p className="crystal-intro__wordmark">Crystal</p>
        </div>
      </div>
    </div>
  );
}
