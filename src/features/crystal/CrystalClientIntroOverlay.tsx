'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import './CrystalClientIntroOverlay.css';

export type CrystalClientIntroOverlayProps = {
  style?: CSSProperties;
  /** Resolved logo URL (bundled default or gym logo). */
  logoSrc: string;
  /** Gym name shown after shimmer (uppercased in UI). */
  brandName: string;
  tagline: string;
  /** True when public bundle + site model are ready (intro can finish). */
  contentReady: boolean;
  /** When this fetch began (ms); used so the sequence runs at least ~1.5s before exit. */
  loadStartedAt: number | null;
  /** Fired once when exit begins so the page can crossfade in under the overlay. */
  onExitStart?: () => void;
  /** Fired after exit animation; parent should persist session skip + unmount. */
  onComplete: () => void;
};

const PHASE_SHIMMER = 2;
const PHASE_TITLE = 3;
const PHASE_PULSE = 4;
const PHASE_ARMED = 5;

/**
 * Full-screen branded intro: logo reveal → shimmer sweep → title + tagline → energy pulse → exit blur/fade.
 * Parent only mounts when slow fetch (over 500ms) and session / motion checks pass.
 */
export function CrystalClientIntroOverlay({
  style,
  logoSrc,
  brandName,
  tagline,
  contentReady,
  loadStartedAt,
  onExitStart,
  onComplete,
}: CrystalClientIntroOverlayProps) {
  const [phase, setPhase] = useState(1);
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
    let cancelled = false;
    const tick = (ms: number, fn: () => void) =>
      window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    const t1 = tick(1500, () => setPhase(PHASE_SHIMMER));
    const t2 = tick(3000, () => setPhase(PHASE_TITLE));
    const t3 = tick(4000, () => setPhase(PHASE_PULSE));
    const t4 = tick(5000, () => setPhase(PHASE_ARMED));
    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [reducedMotion, finish]);

  useEffect(() => {
    if (reducedMotion) return;
    if (phase < PHASE_ARMED || !contentReady || exiting) return;
    const minHoldMs = 1500;
    const extra =
      loadStartedAt != null ? Math.max(0, minHoldMs - (Date.now() - loadStartedAt)) : 0;
    const id = window.setTimeout(() => {
      onExitStart?.();
      setExiting(true);
    }, extra);
    return () => window.clearTimeout(id);
  }, [phase, contentReady, exiting, reducedMotion, loadStartedAt, onExitStart]);

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

  const displayName = (brandName.trim() || 'Crystal Gym').toUpperCase();

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
        <div
          className={`crystal-intro__logo-wrap${phase >= 2 ? ' crystal-intro__logo-wrap--settled' : ''}${
            phase >= PHASE_SHIMMER ? ' crystal-intro__logo-wrap--shimmer' : ''
          }`}
        >
          <img src={logoSrc} alt="" className="crystal-intro__logo" decoding="async" />
          <div className="crystal-intro__shimmer-sweep" aria-hidden />
          {phase >= PHASE_PULSE && !exiting ?
            <div className="crystal-intro__energy" aria-hidden>
              <span className="crystal-intro__energy-ring" />
            </div>
          : null}
        </div>

        <div className={`crystal-intro__titles${phase >= PHASE_TITLE ? ' crystal-intro__titles--visible' : ''}`}>
          <p className="crystal-intro__name">{displayName}</p>
          <p className="crystal-intro__tag">{tagline}</p>
        </div>
      </div>
    </div>
  );
}
