import emberArt from '../../assets/ember.png';
import oceanArt from '../../assets/ocean.png';
import forestArt from '../../assets/forest.png';
import royalArt from '../../assets/royal.png';
import crimsonArt from '../../assets/crimson.png';

function bundledImageUrl(m: string | { src: string }): string {
  return typeof m === 'string' ? m : m.src;
}

/** Default body / light hex values aligned with {@link GYM_CLIENT_DEFAULT_TEXT_HEX} / {@link GYM_CLIENT_DEFAULT_LIGHT_HEX}. */
const DEFAULT_TEXT_HEX = '#1c1917';
const DEFAULT_LIGHT_HEX = '#ffffff';

function normalizeHexColor(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  if (s.startsWith('#')) s = s.slice(1);
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(s)) return null;
  if (s.length === 3) {
    s = s
      .split('')
      .map((c) => c + c)
      .join('');
  }
  return `#${s.toLowerCase()}`;
}

function hexColorsEqual(a: string, b: string): boolean {
  const na = normalizeHexColor(a);
  const nb = normalizeHexColor(b);
  return na !== null && nb !== null && na === nb;
}

export type WebsiteThemePreset = {
  id: string;
  name: string;
  accentColor: string;
  darkColor: string;
  textColor: string;
  lightColor: string;
  /** Bundled reference artwork for this palette (About background + card preview). */
  artworkSrc: string;
};

export const WEBSITE_THEME_PRESETS: WebsiteThemePreset[] = [
  {
    id: 'ember',
    name: 'Ember',
    accentColor: '#ea580c',
    darkColor: '#0c0a09',
    textColor: DEFAULT_TEXT_HEX,
    lightColor: DEFAULT_LIGHT_HEX,
    artworkSrc: bundledImageUrl(emberArt),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    accentColor: '#0891b2',
    darkColor: '#164e63',
    textColor: '#0f172a',
    lightColor: '#ecfeff',
    artworkSrc: bundledImageUrl(oceanArt),
  },
  {
    id: 'forest',
    name: 'Forest',
    accentColor: '#16a34a',
    darkColor: '#14532d',
    textColor: '#1c1917',
    lightColor: '#f7fee7',
    artworkSrc: bundledImageUrl(forestArt),
  },
  {
    id: 'royal',
    name: 'Royal',
    accentColor: '#7c3aed',
    darkColor: '#1e1b4b',
    textColor: '#312e81',
    lightColor: '#faf5ff',
    artworkSrc: bundledImageUrl(royalArt),
  },
  {
    id: 'crimson',
    name: 'Crimson',
    accentColor: '#dc2626',
    darkColor: '#450a0a',
    textColor: '#1c1917',
    lightColor: '#fff7f7',
    artworkSrc: bundledImageUrl(crimsonArt),
  },
];

export type ThemeColorsForPresetMatch = {
  accentColor: string;
  darkColor: string;
  textColor: string;
  lightColor: string;
};

export function formMatchesThemePreset(
  form: ThemeColorsForPresetMatch,
  preset: WebsiteThemePreset
): boolean {
  return (
    hexColorsEqual(form.accentColor, preset.accentColor) &&
    hexColorsEqual(form.darkColor, preset.darkColor) &&
    hexColorsEqual(form.textColor, preset.textColor) &&
    hexColorsEqual(form.lightColor, preset.lightColor)
  );
}

/** First preset whose colors match the form, else `null`. */
export function findMatchingThemePreset(form: ThemeColorsForPresetMatch): WebsiteThemePreset | null {
  return WEBSITE_THEME_PRESETS.find((p) => formMatchesThemePreset(form, p)) ?? null;
}

/** Artwork URL for the matching palette; falls back to Ember if colours are customised. */
export function getPresetArtworkUrlForColors(form: ThemeColorsForPresetMatch): string {
  return (findMatchingThemePreset(form) ?? WEBSITE_THEME_PRESETS[0]).artworkSrc;
}
