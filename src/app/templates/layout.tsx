import { Outlet } from 'react-router-dom';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-pro-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

/**
 * Wraps `/templates/*` preview routes. Loads Playfair Display as a CSS variable for shared
 * `pro-templates-typography.css` (concatenated into each page's inline `<style>`).
 */
export default function TemplatesLayout() {
  return (
    <div className={`templates-pro-font-scope ${playfair.variable}`}>
      <Outlet />
    </div>
  );
}
