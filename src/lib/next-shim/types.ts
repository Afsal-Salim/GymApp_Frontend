/**
 * Type-only stubs that stand in for the bare `next` package. The Vite SPA build doesn't ship any
 * runtime metadata API — files that exported `const metadata: Metadata = { ... }` continue to do
 * so for documentation, but the values are now consumed by per-page `<Helmet>` blocks or simply
 * ignored.
 */

export type Metadata = {
  title?: string | { default?: string; template?: string; absolute?: string };
  description?: string;
  metadataBase?: URL | null;
  alternates?: {
    canonical?: string | URL;
    languages?: Record<string, string | URL>;
  };
  robots?:
    | string
    | {
        index?: boolean;
        follow?: boolean;
        noarchive?: boolean;
        nosnippet?: boolean;
        nocache?: boolean;
        googleBot?: string | { index?: boolean; follow?: boolean };
      };
  formatDetection?: { telephone?: boolean; email?: boolean; address?: boolean };
  appleWebApp?: { capable?: boolean; statusBarStyle?: string; title?: string };
  openGraph?: {
    type?: string;
    url?: string | URL;
    title?: string;
    description?: string;
    siteName?: string;
    locale?: string;
    images?: Array<{ url: string | URL; alt?: string; width?: number; height?: number }>;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: Array<string | URL> | string | URL;
  };
  icons?: unknown;
  manifest?: string;
  themeColor?: string;
  viewport?: string;
  [key: string]: unknown;
};

export type Viewport = {
  width?: string | number;
  initialScale?: number;
  maximumScale?: number;
  minimumScale?: number;
  userScalable?: boolean;
  viewportFit?: 'auto' | 'contain' | 'cover';
  themeColor?: string | Array<{ media?: string; color: string }>;
  colorScheme?: string;
};

export type ResolvingMetadata = Promise<Metadata>;
export type ResolvingViewport = Promise<Viewport>;

export type NextConfig = Record<string, unknown>;
