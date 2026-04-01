import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import './GymLoadingScreen.css';

const DOT_COLORS = ['#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb923c', '#f87171'] as const;

export type GymLoadingScreenProps = {
  active: boolean;
  /** `fixed` = route overlay; `embed` = fills positioned parent (e.g. public gym viewport). */
  variant?: 'fixed' | 'embed';
  message?: string;
  zIndex?: number;
};

export function GymLoadingScreen({
  active,
  variant = 'fixed',
  message = 'LOADING YOUR GYM...',
  zIndex = 1000,
}: GymLoadingScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const displayMessage = variant === 'embed' ? message : message.toUpperCase();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const stage = stageRef.current;
      const glow = glowRef.current;
      if (!stage || !glow) return;

      const chars = stage.querySelectorAll<HTMLElement>('.gym-loading-screen__char');

      if (!active) {
        gsap.to(root, {
          opacity: 0,
          duration: reducedMotion.current ? 0.05 : 0.22,
          ease: 'power2.in',
          onComplete: () => {
            if (variant === 'fixed') {
              root.style.visibility = 'hidden';
              root.style.pointerEvents = 'none';
            }
          },
        });
        return;
      }

      root.style.visibility = 'visible';
      if (variant === 'fixed') {
        root.style.pointerEvents = 'auto';
      }

      if (reducedMotion.current) {
        gsap.set(root, { opacity: 1 });
        gsap.set(glow, { opacity: 0.45, scale: 1 });
        gsap.set(chars, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(root, { opacity: 0 });
      gsap.set(glow, { scale: 0.5, opacity: 0 });
      gsap.set(chars, { opacity: 0.2, y: 12 });

      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .to(root, { opacity: 1, duration: 0.3 })
        .to(glow, { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' }, 0.04)
        .to(
          chars,
          { opacity: 1, y: 0, duration: 0.42, stagger: 0.025, ease: 'power2.out' },
          0.1
        );

      gsap.to(glow, {
        scale: 1.12,
        opacity: 0.9,
        duration: 1.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.3,
      });

      gsap.to(chars, {
        opacity: 0.65,
        duration: 0.82,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.055, from: 'random' },
        delay: 0.48,
      });
    }, root);

    return () => ctx.revert();
  }, [active, variant, displayMessage]);

  const rootClass =
    variant === 'fixed' ? 'gym-loading-screen gym-loading-screen--fixed' : 'gym-loading-screen gym-loading-screen--embed';

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={variant === 'fixed' ? { zIndex } : undefined}
      aria-hidden={!active}
      aria-busy={active}
      role="status"
    >
      <div ref={stageRef} className="gym-loading-screen__stage">
        <div ref={glowRef} className="gym-loading-screen__glow" aria-hidden />
        <div className="gym-loading-screen__sound-wrap" aria-label="Loading">
          <div className="gym-loading-screen__sound">
            {DOT_COLORS.map((color, i) => (
              <span
                key={color}
                className="gym-loading-screen__dot"
                style={{
                  background: color,
                  animationDelay: `${i * 0.14}s`,
                }}
              />
            ))}
          </div>
        </div>
        <p className={`gym-loading-screen__label${variant === 'embed' ? ' gym-loading-screen__label--sentence' : ''}`}>
          {displayMessage.split('').map((ch, i) => (
            <span key={`${i}-${ch}`} className="gym-loading-screen__char">
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
