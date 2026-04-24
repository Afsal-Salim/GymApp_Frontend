import { describe, expect, it } from 'vitest';
import {
  CLIENT_THEME_FALLBACK,
  cloneGymClientSiteDefaults,
  parseGymClientWebsiteThemeFromApi,
} from '../../crystal/gymClientSiteContent';
import { type CrystalWebsiteDraftPayload, withPreviewEditReturn } from './createWebsiteFormState';

function minimalDraft(overrides: Partial<CrystalWebsiteDraftPayload> = {}): CrystalWebsiteDraftPayload {
  return {
    slug: 'acme-gym',
    theme: parseGymClientWebsiteThemeFromApi(null, CLIENT_THEME_FALLBACK),
    content: cloneGymClientSiteDefaults(),
    ...overrides,
  };
}

describe('withPreviewEditReturn', () => {
  it('adds normalized editBusinessSlug', () => {
    const out = withPreviewEditReturn(minimalDraft(), '  MyGym ');
    expect(out.editBusinessSlug).toBe('mygym');
  });

  it('strips editBusinessSlug when slug cleared', () => {
    const base = minimalDraft({ editBusinessSlug: 'old' });
    const out = withPreviewEditReturn(base, null);
    expect('editBusinessSlug' in out).toBe(false);
  });

  it('returns same reference when nothing to change', () => {
    const base = minimalDraft();
    const out = withPreviewEditReturn(base, undefined);
    expect(out).toBe(base);
  });
});
