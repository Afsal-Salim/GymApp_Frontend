import { describe, expect, it } from 'vitest';
import { filterCssUsedByPageHtml } from '@/features/website/editor/canvas/websiteBuilderPageUsedCss/websiteBuilderPageUsedCss';

describe('filterCssUsedByPageHtml', () => {
  it('returns empty output for blank CSS', () => {
    expect(filterCssUsedByPageHtml('<div class="x"></div>', '   ')).toBe('');
  });

  it('returns a string for typical builder inputs without throwing', () => {
    const html = '<div class="wb-hero"></div>';
    const css = '.wb-hero { color: #111; }';
    expect(() => filterCssUsedByPageHtml(html, css)).not.toThrow();
    const out = filterCssUsedByPageHtml(html, css);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThanOrEqual(0);
  });
});
