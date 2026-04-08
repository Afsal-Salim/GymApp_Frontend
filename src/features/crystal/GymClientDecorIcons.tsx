/** Inline SVG accents for the public gym client (mid CTAs, join modal). */

const META_DISK_GLYPH = 'crystal-client__meta-disk__glyph';

function metaDiskModifier(id: string): string {
  const known = new Set(['hours', 'parking', 'slug', 'email', 'phone', 'address', 'instagram']);
  return known.has(id) ? id : 'default';
}

/**
 * Circular icon disk for Visit / Contact meta rows (visual parity with marketing Home contact cards).
 * `rowKind` should match `GymClientDetailRow.id` or contact item `id`.
 */
export function GymClientMetaRowDisk({ rowKind }: { rowKind: string }) {
  const k = metaDiskModifier(rowKind);
  return (
    <span className={`crystal-client__meta-disk crystal-client__meta-disk--${k}`} aria-hidden>
      {k === 'hours' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 7.25v5l3.25 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {k === 'parking' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 7h4.8c2.3 0 3.7 1.35 3.7 3.2S16.1 13.4 13.8 13.4H11.3V18M9 7v11"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {k === 'slug' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 13a5 5 0 0 1 0-7l1-1M14 11a5 5 0 0 1 0 7l-1 1M8 12h8"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {k === 'email' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M4 7.5l8 6 8-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {k === 'phone' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.5 4.5h2.2c.35 0 .65.22.75.55l1.1 3.65a.8.8 0 0 1-.2.75l-1.35 1.35a12 12 0 0 0 5.4 5.4l1.35-1.35c.22-.22.55-.28.85-.18l3.65 1.1c.33.1.55.4.55.75v2.2c0 1.1-.9 2-2 2h-.35C10.4 22 2 13.6 2 3.85 2 2.75 2.9 1.85 4 1.85h.35"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {k === 'address' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
      )}
      {k === 'instagram' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      )}
      {k === 'default' && (
        <svg className={META_DISK_GLYPH} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeDasharray="3 4" />
        </svg>
      )}
    </span>
  );
}

/** Map pin for “Open in Google Maps” (generic pin shape, not Google trademark artwork). */
export function GymClientMapsPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  );
}

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
