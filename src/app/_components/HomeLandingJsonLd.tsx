import { HOME_PAGE_FAQ } from '@/features/home/homeFaq/homeFaq';
import { getMarketingSiteOrigin } from '@/lib/siteUrl';

const ORG_ID = '#organization';

/**
 * Structured data for the marketing homepage (Organization, WebSite, WebPage, FAQ).
 * Helps search engines understand "create gym website" / fitness site builder intent.
 */
export default function HomeLandingJsonLd() {
  const base = getMarketingSiteOrigin();
  const origin = base.origin;
  const homeUrl = `${origin}/`;

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${homeUrl}${ORG_ID}`,
        name: 'Crystal',
        url: homeUrl,
        description:
          'Crystal helps gyms and fitness studios create a professional website, capture WhatsApp leads, and grow online—no coding required.',
        logo: `${origin}/favicon.svg`,
      },
      {
        '@type': 'WebSite',
        '@id': `${homeUrl}#website`,
        name: 'Crystal — Gym website builder',
        url: homeUrl,
        description:
          'Create a website for your gym in minutes. Themes, WhatsApp leads, and analytics for fitness businesses.',
        publisher: { '@id': `${homeUrl}${ORG_ID}` },
        inLanguage: 'en',
      },
      {
        '@type': 'WebPage',
        '@id': `${homeUrl}#webpage`,
        url: homeUrl,
        name: 'Create a gym website — Crystal',
        isPartOf: { '@id': `${homeUrl}#website` },
        about: { '@id': `${homeUrl}${ORG_ID}` },
        description:
          'Build and launch a gym or fitness studio website with Crystal. No-code builder, mobile-ready themes, and member-ready pages.',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Crystal gym website builder',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web browser',
        description:
          'Software to create a website for your gym: guided setup, themes, WhatsApp integration, and analytics.',
        provider: { '@id': `${homeUrl}${ORG_ID}` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: HOME_PAGE_FAQ.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
