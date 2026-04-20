import { Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-pro-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

/**
 * Wraps standalone Pro template preview routes. Loads Playfair Display as CSS variable for
 * shared `pro-templates-typography.css` (concatenated in each page’s inline &lt;style&gt;).
 */
export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return <div className={`templates-pro-font-scope ${playfair.variable}`}>{children}</div>;
}
