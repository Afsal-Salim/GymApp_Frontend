/** Inline SVG accents for the public gym client (mid CTAs, join modal). */

export function GymClientMidCtaIcon({
  variant,
  brandLogoSrc,
}: {
  variant: 'join' | 'membership' | 'visit';
  /** Resolved client logo (same as navbar). */
  brandLogoSrc: string;
}) {
  const cls = 'crystal-decor-icon crystal-decor-icon--mid-cta';
  if (variant === 'join') {
    return (
      <span className={`${cls} crystal-decor-icon--mark`} aria-hidden>
        <img
          src={brandLogoSrc}
          alt=""
          className="crystal-decor-icon__brand-logo"
          width={36}
          height={36}
          decoding="async"
        />
      </span>
    );
  }
  if (variant === 'membership') {
    return (
      <svg className={cls} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="14" y="18" width="36" height="28" rx="4" fill="currentColor" opacity="0.12" />
        <rect x="18" y="22" width="28" height="18" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M22 30h20M22 35h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="38" r="6" className="crystal-decor-icon__accent-fill" />
        <path
          d="M41 38l2 2 4-5"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M32 12c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z"
        fill="currentColor"
        opacity="0.14"
      />
      <circle cx="32" cy="26" r="5" stroke="currentColor" strokeWidth="2.8" fill="none" />
      <path d="M24 44c2-6 6-9 8-9s6 3 8 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function GymClientJoinModalHeaderArt({ gymName, logoSrc }: { gymName: string; logoSrc: string }) {
  return (
    <div className="crystal-join-lead-modal__art" aria-hidden>
      <div className="crystal-join-lead-modal__art-glow" />
      <div className="crystal-join-lead-modal__art-mark">
        <img
          src={logoSrc}
          alt=""
          className="crystal-join-lead-modal__art-mark-img"
          width={200}
          height={200}
          decoding="async"
        />
      </div>
      <p className="crystal-join-lead-modal__art-tagline">Train smarter at {gymName}</p>
    </div>
  );
}

export function GymClientJoinSuccessIllustration() {
  return (
    <div className="crystal-join-lead-modal__success-illu" aria-hidden>
      <div className="crystal-join-lead-modal__success-ring" />
      <svg className="crystal-join-lead-modal__success-check" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.12" />
        <path
          d="M20 33l8 8 16-18"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
