/** First numeric amount in a price label (supports commas; ignores currency symbols before/after). */
export function parseLoosePrice(raw: string): { value: number | null; prefix: string; suffix: string } {
  const s = raw.trim();
  if (!s || s === '—') return { value: null, prefix: '', suffix: '' };
  const anchored = s.match(/^([\s\S]*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  if (anchored) {
    const v = parseFloat(anchored[2].replace(/,/g, ''));
    return {
      value: Number.isFinite(v) ? v : null,
      prefix: anchored[1],
      suffix: anchored[3],
    };
  }
  return { value: null, prefix: '', suffix: '' };
}

function decimalPlacesInLabel(raw: string): number {
  const m = raw.match(/\.(\d+)/);
  return m ? m[1].length : 0;
}

/** Format a computed amount using prefix/suffix from the reference label and sensible rounding. */
export function formatDerivedPrice(amount: number, styleSource: string): string {
  const { prefix, suffix } = parseLoosePrice(styleSource);
  const dp = Math.min(2, Math.max(0, decimalPlacesInLabel(styleSource)));
  const rounded =
    dp === 0 ? Math.round(amount) : Math.round(amount * 10 ** dp) / 10 ** dp;
  const body =
    dp === 0 ? String(rounded) : rounded.toFixed(dp).replace(/\.?0+$/, '') || '0';
  return `${prefix}${body}${suffix}`;
}

export function clampPercentOff(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/** Parse a % field from form text (commas stripped); empty / invalid → 0. */
export function parsePercentInputString(raw: string): number {
  return clampPercentOff(parseFloat(String(raw).replace(/,/g, '')) || 0);
}

export function saleFromOriginalAndPercent(original: number, percentOff: number): number {
  return original * (1 - clampPercentOff(percentOff) / 100);
}

export function percentFromOriginalAndSale(original: number, sale: number): number {
  if (!(original > 0) || !Number.isFinite(sale)) return 0;
  const p = (100 * (original - sale)) / original;
  return clampPercentOff(Math.round(p * 10) / 10);
}
