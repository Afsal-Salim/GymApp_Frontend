/**
 * Drop-in replacement for `next/font/google` / `next/font/local`.
 *
 * Real font loading now happens via the Google Fonts `<link>` in `index.html` and CSS variables
 * declared there. Each Next font factory just returns an object whose `variable` matches the
 * CSS variable name we already use for that family, so callers that do
 * `<div className={inter.variable}>` keep working.
 */

export type GoogleFontResult = {
  className: string;
  variable: string;
  style: { fontFamily: string };
};

type FontInit = {
  subsets?: string[];
  weight?: string | string[];
  style?: string | string[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  variable?: string;
};

function fontFromInit(family: string, defaultVariable: string, init: FontInit = {}): GoogleFontResult {
  return {
    className: '',
    variable: init.variable ?? defaultVariable,
    style: { fontFamily: family },
  };
}

export function Inter(init?: FontInit): GoogleFontResult {
  return fontFromInit('Inter', '--font-inter', init);
}

export function Sora(init?: FontInit): GoogleFontResult {
  return fontFromInit('Sora', '--font-home-heading', init);
}

export function Playfair_Display(init?: FontInit): GoogleFontResult {
  return fontFromInit('Playfair Display', '--font-pro-display', init);
}

/**
 * Generic factory: callers using less common Google fonts get a result whose CSS variable name is
 * derived from the family. Add Google Fonts `<link>` for the family in `index.html` if you start
 * using it.
 */
function genericFont(family: string) {
  const safeName = family.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
  return (init?: FontInit): GoogleFontResult =>
    fontFromInit(family.replace(/_/g, ' '), `--font-${safeName}`, init);
}

export const Roboto = genericFont('Roboto');
export const Open_Sans = genericFont('Open Sans');
export const Poppins = genericFont('Poppins');
export const Montserrat = genericFont('Montserrat');
export const Lato = genericFont('Lato');
export const Nunito = genericFont('Nunito');
export const Raleway = genericFont('Raleway');
export const Outfit = genericFont('Outfit');
export const DM_Sans = genericFont('DM Sans');
export const Manrope = genericFont('Manrope');

export default function localFont(init?: FontInit): GoogleFontResult {
  return fontFromInit('system-ui', init?.variable ?? '--font-local', init);
}
