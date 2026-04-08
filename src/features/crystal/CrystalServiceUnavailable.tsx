import Link from 'next/link';
import { PageContainer } from '../../components';
import {
  crystalMarketingAbsoluteUrl,
  getPublicGymSlugFromHost,
  publicGymSiteUrl,
  publicSiteDomain,
} from '../../config/env';
import './CrystalServiceUnavailable.css';

type CrystalServiceUnavailableProps = {
  slug?: string;
  /** Shown when the business profile loaded but the site is inactive (subscription). */
  businessName?: string;
};

function OopsIllustration() {
  return (
    <svg
      className="crystal-unavailable__svg"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="100" cy="82" r="56" fill="url(#crystal-unavailable-grad)" opacity="0.95" />
      <circle cx="100" cy="80" r="44" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2" />
      <ellipse cx="86" cy="74" rx="5" ry="7" fill="#475569" />
      <ellipse cx="114" cy="74" rx="5" ry="7" fill="#475569" />
      <path
        d="M 82 96 Q 100 88 118 96"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 132 48 c 6 -8 14 -6 12 4 c -2 8 -10 6 -14 2"
        stroke="#0ea5e9"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="138" cy="42" r="3" fill="#7dd3fc" opacity="0.9" />
      <defs>
        <linearGradient id="crystal-unavailable-grad" x1="44" y1="26" x2="156" y2="138" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Shown when a public `/:slug` gym URL is opened but the business has no active subscription.
 * (Profile “Visit website” still routes inactive businesses to /plans instead.)
 */
export default function CrystalServiceUnavailable({ slug, businessName }: CrystalServiceUnavailableProps) {
  const onGymSubdomain = Boolean(getPublicGymSlugFromHost());
  const pageLabel = slug ? (publicSiteDomain ? publicGymSiteUrl(slug) : `/${slug}`) : null;
  return (
    <PageContainer className="crystal-unavailable">
      <main className="crystal-unavailable__main">
        <div className="crystal-unavailable__backdrop" aria-hidden />
        <div
          className="crystal-unavailable__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crystal-unavailable-oops crystal-unavailable-title"
        >
          <div className="crystal-unavailable__art">
            <OopsIllustration />
          </div>
          <p className="crystal-unavailable__oops" id="crystal-unavailable-oops">
            Oops!
          </p>
          <h1 className="crystal-unavailable__title" id="crystal-unavailable-title">
            Service temporarily unavailable
          </h1>
          {businessName ? (
            <p className="crystal-unavailable__business-name fw-semibold text-dark mb-2">{businessName}</p>
          ) : null}
          <p className="crystal-unavailable__lead">
            This site is not available right now. The business may need to renew their plan, or there could be a
            short disruption. Please try again later.
          </p>
          {slug ? (
            <p className="crystal-unavailable__slug text-muted small mb-0" aria-live="polite">
              <span className="crystal-unavailable__slug-label">Page:</span>{' '}
              <code className="crystal-unavailable__slug-code">{pageLabel}</code>
            </p>
          ) : null}
          <div className="crystal-unavailable__actions">
            {onGymSubdomain ? (
              <a href={crystalMarketingAbsoluteUrl('/')} className="crystal-unavailable__home btn btn-primary">
                Back to Crystal home
              </a>
            ) : (
              <Link href="/" className="crystal-unavailable__home btn btn-primary">
                Back to Crystal home
              </Link>
            )}
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
