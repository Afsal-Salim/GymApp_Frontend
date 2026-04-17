import type { Metadata } from 'next';
import HomeInitialLoaderClient from '@/app/_components/HomeInitialLoaderClient';
import HomeInitialLoaderSsr from '@/app/_components/HomeInitialLoaderSsr';
import HomeLandingJsonLd from '@/app/_components/HomeLandingJsonLd';
import HomePage from '@/features/home/HomePage';
import { getMarketingSiteOrigin } from '@/lib/siteUrl';

const origin = getMarketingSiteOrigin().origin;
const canonical = `${origin}/`;
const ogImage = `${origin}/images/hero-bg.jpg`;

export const metadata: Metadata = {
  title: {
    absolute:
      'Create a gym website — Crystal | No-code gym website builder & themes',
  },
  description:
    'Create a website for your gym with Crystal: no-code builder, mobile-ready themes, WhatsApp enquiries, and analytics. Launch a fitness studio site in minutes.',
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    url: canonical,
    title: 'Create a website for your gym — Crystal',
    description:
      'Gym website builder for fitness studios: professional themes, WhatsApp leads, and easy publishing. No coding required.',
    images: [{ url: ogImage, alt: 'Gym interior — Crystal gym website builder' }],
  },
  twitter: {
    title: 'Create a website for your gym — Crystal',
    description:
      'Build your gym or fitness website in minutes. Themes, WhatsApp, analytics—no code.',
    images: [ogImage],
  },
};

/** Marketing landing — ISR shell; home ships in the page bundle (no extra Suspense swap on first paint). */
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <HomeLandingJsonLd />
      <HomeInitialLoaderSsr />
      <HomeInitialLoaderClient />
      <HomePage />
    </>
  );
}
