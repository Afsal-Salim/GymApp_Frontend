import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { getMarketingSiteOrigin } from '@/lib/siteUrl';
import Providers from './providers';
import ClientAppShell from './ClientAppShell';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteUrl = getMarketingSiteOrigin();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'Crystal — Create a website for your gym',
    template: '%s | Crystal',
  },
  description:
    'Create a professional gym website in minutes—no code. Crystal is a gym website builder with themes, WhatsApp leads, and analytics for fitness studios.',
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Crystal',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <div id="root">
          <Providers>
            <ClientAppShell>{children}</ClientAppShell>
          </Providers>
        </div>
      </body>
    </html>
  );
}
