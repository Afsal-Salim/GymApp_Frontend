/** Normalize user hex input to `#rrggbb` or return null if invalid. */
export function normalizeHexColor(raw: string): string | null {
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

export function hexColorsEqual(a: string, b: string): boolean {
  const na = normalizeHexColor(a);
  const nb = normalizeHexColor(b);
  return na !== null && nb !== null && na === nb;
}
