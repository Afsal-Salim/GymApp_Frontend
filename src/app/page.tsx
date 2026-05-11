import { Sora } from 'next/font/google';
import HomeInitialLoaderClient from '@/app/_components/HomeInitialLoaderClient';
import HomeInitialLoaderSsr from '@/app/_components/HomeInitialLoaderSsr';
import HomeLandingJsonLd from '@/app/_components/HomeLandingJsonLd';
import HomePage from '@/features/home/HomePage/HomePage';
import { getMarketingSiteOrigin } from '@/lib/siteUrl';

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-home-heading',
  weight: ['400', '500', '600', '700', '800'],
});

const origin = getMarketingSiteOrigin().origin;
const canonical = `${origin}/`;
const ogImage = `${origin}/images/hero-bg.jpg`;

const PAGE_TITLE = 'Create a gym website — Crystal | No-code gym website builder & themes';
const PAGE_DESCRIPTION =
  'Create a website for your gym with Crystal: no-code builder, mobile-ready themes, WhatsApp enquiries, and analytics. Launch a fitness studio site in minutes.';

export default function Home() {
  return (
    <div className={sora.variable}>
      <title>{PAGE_TITLE}</title>
      <meta name="description" content={PAGE_DESCRIPTION} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index,follow" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content="Create a website for your gym — Crystal" />
      <meta
        property="og:description"
        content="Gym website builder for fitness studios: professional themes, WhatsApp leads, and easy publishing. No coding required."
      />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content="Create a website for your gym — Crystal" />
      <meta
        name="twitter:description"
        content="Build your gym or fitness website in minutes. Themes, WhatsApp, analytics—no code."
      />
      <meta name="twitter:image" content={ogImage} />
      <HomeLandingJsonLd />
      <HomeInitialLoaderSsr />
      <HomeInitialLoaderClient />
      <HomePage />
    </div>
  );
}
