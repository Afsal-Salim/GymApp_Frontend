import emberArt from '@/assets/ember.png';
import oceanArt from '@/assets/ocean.png';
import forestArt from '@/assets/forest.png';
import royalArt from '@/assets/royal.png';
import crimsonArt from '@/assets/crimson.png';

function bundledImageUrl(m: string | { src: string }): string {
  return typeof m === 'string' ? m : m.src;
}

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

/** Shared near-black base for nav/hero/dark UI — pairs with each accent for a bold gym look. */
const PRESET_DARK_BLACK = '#09090b';

export const WEBSITE_THEME_PRESETS: WebsiteThemePreset[] = [
  {
    id: 'ember',
    name: 'Ember',
    accentColor: '#f97316',
    darkColor: PRESET_DARK_BLACK,
    textColor: '#0f172a',
    lightColor: '#fff7ed',
    artworkSrc: bundledImageUrl(emberArt),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    accentColor: '#0ea5e9',
    darkColor: PRESET_DARK_BLACK,
    textColor: '#0f172a',
    lightColor: '#f0f9ff',
    artworkSrc: bundledImageUrl(oceanArt),
  },
  {
    id: 'forest',
    name: 'Forest',
    accentColor: '#22c55e',
    darkColor: PRESET_DARK_BLACK,
    textColor: '#0f172a',
    lightColor: '#f0fdf4',
    artworkSrc: bundledImageUrl(forestArt),
  },
  {
    id: 'royal',
    name: 'Royal',
    accentColor: '#a855f7',
    darkColor: PRESET_DARK_BLACK,
    textColor: '#0f172a',
    lightColor: '#faf5ff',
    artworkSrc: bundledImageUrl(royalArt),
  },
  {
    id: 'crimson',
    name: 'Crimson',
    accentColor: '#ef4444',
    darkColor: PRESET_DARK_BLACK,
    textColor: '#0f172a',
    lightColor: '#fff1f2',
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
