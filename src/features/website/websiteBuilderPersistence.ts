import type { Editor } from 'grapesjs';
import {
  getBusinessDetail,
  invalidatePublicGymBundleCache,
  invalidateUserBusinessListCache,
  patchWebsiteSetupDraft,
  type BusinessDetail,
} from '../../api';
import {
  cloneGymClientSiteDefaults,
  parseGymClientWebsiteThemeFromApi,
  type CrystalWebsiteSetupPayload,
  type GymClientSiteContent,
  type GymClientVisualBuilderState,
  parseProWebsiteTemplateKey,
  type ProWebsiteTemplateKey,
  withLegacyHeroBackgroundMigrated,
} from '../crystal/gymClientSiteContent';
import {
  GYM_CLIENT_DEFAULT_LIGHT_HEX,
  GYM_CLIENT_DEFAULT_TEXT_HEX,
  readCrystalWebsitePreviewFromStorage,
  withPreviewEditReturn,
  writeCrystalWebsitePreviewToStorage,
  type CrystalWebsiteDraftPayload,
} from './setup/createWebsiteFormState';
import {
  PRO_TEMPLATE_LABELS,
  WEBSITE_BUILDER_ANIMATION_CSS,
  WEBSITE_BUILDER_CANVAS_DOCUMENT_SHELL_CSS,
  WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS,
  WEBSITE_BUILDER_CUSTOM_SCRATCH,
  WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS,
} from './websiteBuilderConstants';
import { WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT } from './websiteBuilderDesignSystemFonts';
import { WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS } from './websiteBuilderDesignSystems.css';

function defaultTheme(): CrystalWebsiteSetupPayload['theme'] {
  return parseGymClientWebsiteThemeFromApi(
    {},
    {
      accentHex: '#ea580c',
      darkHex: '#0c0a09',
      textHex: GYM_CLIENT_DEFAULT_TEXT_HEX,
      lightHex: GYM_CLIENT_DEFAULT_LIGHT_HEX,
    }
  );
}

function themeFromBusinessDetail(detail: BusinessDetail): CrystalWebsiteSetupPayload['theme'] {
  const wt = detail.website_theme;
  if (!wt || typeof wt !== 'object') return defaultTheme();
  return parseGymClientWebsiteThemeFromApi(wt, {
    accentHex: '#ea580c',
    darkHex: '#0c0a09',
    textHex: GYM_CLIENT_DEFAULT_TEXT_HEX,
    lightHex: GYM_CLIENT_DEFAULT_LIGHT_HEX,
  });
}

/** Marker so reload/save round-trips do not stack duplicate baseline CSS in the composer. */
export const WB_CANVAS_CSS_BASELINE_TOKEN = '__WB_CANVAS_BASELINE_BUNDLE__';

export function canvasCssWithBuilderHelpers(css: string): string {
  const raw = typeof css === 'string' ? css : '';
  if (raw.includes(WB_CANVAS_CSS_BASELINE_TOKEN)) return raw;
  const banner = `/* ${WB_CANVAS_CSS_BASELINE_TOKEN} */\n`;
  return `${banner}${WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_IMPORT}\n${WEBSITE_BUILDER_CANVAS_DOCUMENT_SHELL_CSS}\n${WEBSITE_BUILDER_ANIMATION_CSS}\n${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}\n${WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS}\n${WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS}\n${raw}\n${WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS}`;
}

/** Ensures Grapes CssComposer includes library blocks (fixes washed-out CTAs after grapesProject load). */
export function ensureCanvasCssBaselineInComposer(editor: Editor): void {
  try {
    const css = editor.getCss() ?? '';
    if (css.includes(WB_CANVAS_CSS_BASELINE_TOKEN)) return;
    editor.setStyle(canvasCssWithBuilderHelpers(css));
  } catch {
    /* ignore */
  }
}

function isNonEmptyProject(raw: unknown): raw is Record<string, unknown> {
  return Boolean(raw && typeof raw === 'object' && Object.keys(raw as object).length > 0);
}

function proTemplateKeyFromSeed(seed: string): ProWebsiteTemplateKey | undefined {
  return parseProWebsiteTemplateKey(seed);
}

export function displayLabelForTemplateSeedKey(key: string): string {
  const k = key.trim().toLowerCase();
  if (k === 'custom') return WEBSITE_BUILDER_CUSTOM_SCRATCH.name;
  return PRO_TEMPLATE_LABELS[k] ?? (k ? `Template · ${k}` : 'Custom');
}

function firstSeedKey(...vals: (string | undefined | null)[]): string {
  for (const v of vals) {
    const t = typeof v === 'string' ? v.trim().toLowerCase() : '';
    if (t) return t;
  }
  return '';
}

function slugifyBuilderPageName(raw: string, fallback: string): string {
  const t = raw.trim().toLowerCase();
  const slug = t
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return slug || fallback;
}

function collectBuilderPageSnapshots(editor: Editor): GymClientVisualBuilderState['pageSnapshots'] {
  const pages = editor.Pages.getAll();
  const selected = editor.Pages.getSelected();
  const selectedId = selected ? String(selected.get('id') ?? '') : '';
  const out: NonNullable<GymClientVisualBuilderState['pageSnapshots']> = [];

  for (let i = 0; i < pages.length; i += 1) {
    const page = pages.at(i);
    if (!page) continue;
    editor.Pages.select(page);
    const id = String(page.get('id') ?? `page-${i + 1}`);
    const nameRaw = String(page.get('name') ?? '').trim();
    const name = nameRaw || `Page ${i + 1}`;
    const isSelected = Boolean(selectedId && id === selectedId);
    const isFirst = i === 0;
    const fallbackSlug = isSelected || isFirst ? 'home' : `page-${i + 1}`;
    out.push({
      id,
      name,
      slug: slugifyBuilderPageName(name, fallbackSlug),
      html: editor.getHtml() ?? '',
      css: editor.getCss() ?? '',
    });
  }

  if (selected) {
    editor.Pages.select(selected);
  }
  return out;
}

async function fetchProTemplateHtmlCss(key: string): Promise<{ html: string; css: string }> {
  /** Next-only route (not under `/api/`) so `next.config` rewrites proxying `/api/*` → Django cannot steal this request. */
  const r = await fetch(`/gjs-pro-template/${encodeURIComponent(key)}`);
  if (!r.ok) {
    throw new Error(`Could not load template assets (${r.status}).`);
  }
  return r.json() as Promise<{ html: string; css: string }>;
}

async function resolveTemplateHtmlFromSeed(seed: string): Promise<WebsiteBuilderResolvedLoad> {
  if (seed === 'custom') {
    return {
      kind: 'html',
      html: WEBSITE_BUILDER_CUSTOM_SCRATCH.html,
      css: canvasCssWithBuilderHelpers(WEBSITE_BUILDER_CUSTOM_SCRATCH.css),
      templateSeedKey: 'custom',
      displayLabel: WEBSITE_BUILDER_CUSTOM_SCRATCH.name,
    };
  }
  const { html, css } = await fetchProTemplateHtmlCss(seed);
  return {
    kind: 'html',
    html,
    css: canvasCssWithBuilderHelpers(css),
    templateSeedKey: seed,
    displayLabel: displayLabelForTemplateSeedKey(seed),
  };
}

function mergeSiteContentFromDetail(detail: BusinessDetail): GymClientSiteContent {
  const raw = detail.website_content;
  if (raw && typeof raw === 'object') {
    return withLegacyHeroBackgroundMigrated({ ...(raw as GymClientSiteContent) });
  }
  return cloneGymClientSiteDefaults();
}

function defaultCreateDraft(): CrystalWebsiteDraftPayload {
  return {
    slug: 'preview',
    theme: defaultTheme(),
    content: cloneGymClientSiteDefaults(),
  };
}

/** Ensures the Crystal preview draft uses this slug (create flow before publish redirect). */
export function mergePreviewDraftWithSlug(slug: string): boolean {
  const key = slug.trim().toLowerCase();
  if (!key) return false;
  const draft = readCrystalWebsitePreviewFromStorage() ?? defaultCreateDraft();
  return writeCrystalWebsitePreviewToStorage({ ...draft, slug: key });
}

export type WebsiteBuilderResolvedLoad =
  | {
      kind: 'project';
      project: Record<string, unknown>;
      templateSeedKey: string;
      displayLabel: string;
    }
  | {
      kind: 'html';
      html: string;
      css: string;
      templateSeedKey: string;
      displayLabel: string;
    };

/**
 * Resolves initial GrapesJS load: saved project, snapshots, Pro template fetch, or scratch.
 */
export async function resolveWebsiteBuilderInitialCanvas(opts: {
  mode: 'create' | 'edit';
  routeSlug: string;
  templateQuery: string | null;
}): Promise<WebsiteBuilderResolvedLoad> {
  const q = (opts.templateQuery ?? '').trim().toLowerCase();
  const forcedSeed = q === 'custom' ? 'custom' : parseProWebsiteTemplateKey(q);

  /**
   * Template picker `Continue` uses `?template=...`; when present, always force-load that seed
   * instead of restoring an older saved visual-builder snapshot.
   */
  if (forcedSeed) {
    return resolveTemplateHtmlFromSeed(forcedSeed);
  }

  if (opts.mode === 'edit' && opts.routeSlug) {
    const detail = await getBusinessDetail(opts.routeSlug);
    const content = mergeSiteContentFromDetail(detail);
    const vb = content.visualBuilder;

    if (vb?.grapesProject && isNonEmptyProject(vb.grapesProject)) {
      /** `?template=...` from picker should override previously saved builder seed. */
      const seed = firstSeedKey(q, vb.templateSeedKey, content.proTemplateKey) || 'custom';
      return {
        kind: 'project',
        project: vb.grapesProject,
        templateSeedKey: seed,
        displayLabel: displayLabelForTemplateSeedKey(seed),
      };
    }

    if (vb?.htmlSnapshot?.trim() && vb?.cssSnapshot != null) {
      const seed = firstSeedKey(q, vb.templateSeedKey, content.proTemplateKey) || 'custom';
      return {
        kind: 'html',
        html: vb.htmlSnapshot,
        css: canvasCssWithBuilderHelpers(vb.cssSnapshot),
        templateSeedKey: seed,
        displayLabel: displayLabelForTemplateSeedKey(seed),
      };
    }

    const seed = firstSeedKey(content.proTemplateKey) || 'custom';
    return resolveTemplateHtmlFromSeed(seed);
  }

  const preview = readCrystalWebsitePreviewFromStorage();
  const content = preview?.content ? withLegacyHeroBackgroundMigrated({ ...preview.content }) : undefined;
  const vb = content?.visualBuilder;

  if (vb?.grapesProject && isNonEmptyProject(vb.grapesProject)) {
    /** `?template=...` from picker should override previously saved builder seed. */
    const seed = firstSeedKey(q, vb.templateSeedKey, content?.proTemplateKey) || 'custom';
    return {
      kind: 'project',
      project: vb.grapesProject,
      templateSeedKey: seed,
      displayLabel: displayLabelForTemplateSeedKey(seed),
    };
  }

  if (vb?.htmlSnapshot?.trim() && vb?.cssSnapshot != null) {
    const seed = firstSeedKey(q, vb.templateSeedKey, content?.proTemplateKey) || 'custom';
    return {
      kind: 'html',
      html: vb.htmlSnapshot,
      css: canvasCssWithBuilderHelpers(vb.cssSnapshot),
      templateSeedKey: seed,
      displayLabel: displayLabelForTemplateSeedKey(seed),
    };
  }

  const seed = firstSeedKey(content?.proTemplateKey) || 'custom';
  return resolveTemplateHtmlFromSeed(seed);
}

export function buildVisualBuilderStateFromEditor(editor: Editor, templateSeedKey: string): GymClientVisualBuilderState {
  const pageSnapshots = collectBuilderPageSnapshots(editor);
  return {
    grapesProject: editor.getProjectData() as Record<string, unknown>,
    htmlSnapshot: editor.getHtml() ?? '',
    cssSnapshot: editor.getCss() ?? '',
    pageSnapshots,
    templateSeedKey,
    savedAt: new Date().toISOString(),
  };
}

export async function persistVisualBuilderToEdit(slug: string, editor: Editor, templateSeedKey: string): Promise<void> {
  const key = slug.trim().toLowerCase();
  if (!key) throw new Error('Missing business slug.');
  const detail = await getBusinessDetail(key);
  const theme = themeFromBusinessDetail(detail);
  const base = mergeSiteContentFromDetail(detail);
  const vb = buildVisualBuilderStateFromEditor(editor, templateSeedKey);
  const pro = proTemplateKeyFromSeed(templateSeedKey);
  const content: GymClientSiteContent = {
    ...base,
    ...(pro ? { proTemplateKey: pro } : {}),
    visualBuilder: vb,
  };
  await patchWebsiteSetupDraft({
    slug: detail.slug?.trim().toLowerCase() || key,
    theme,
    content,
  });
  invalidateUserBusinessListCache();
  invalidatePublicGymBundleCache(key);
}

export function persistVisualBuilderToCreate(editor: Editor, templateSeedKey: string): boolean {
  const draft = readCrystalWebsitePreviewFromStorage() ?? defaultCreateDraft();
  const vb = buildVisualBuilderStateFromEditor(editor, templateSeedKey);
  const pro = proTemplateKeyFromSeed(templateSeedKey);
  return writeCrystalWebsitePreviewToStorage({
    ...draft,
    content: {
      ...draft.content,
      ...(pro ? { proTemplateKey: pro } : {}),
      visualBuilder: vb,
    },
  });
}

/**
 * Writes the current canvas into the same `/preview` localStorage draft used by the Crystal preview page.
 * Create flow merges into the wizard draft; edit flow merges API content so the preview tab has a valid model.
 */
export async function syncVisualBuilderDraftForPreviewTab(
  editor: Editor,
  templateSeedKey: string,
  mode: 'create' | 'edit',
  routeSlug: string,
): Promise<boolean> {
  if (mode === 'create') {
    return persistVisualBuilderToCreate(editor, templateSeedKey);
  }
  const key = routeSlug.trim().toLowerCase();
  if (!key) return false;
  const detail = await getBusinessDetail(key);
  const theme = themeFromBusinessDetail(detail);
  const base = mergeSiteContentFromDetail(detail);
  const vb = buildVisualBuilderStateFromEditor(editor, templateSeedKey);
  const pro = proTemplateKeyFromSeed(templateSeedKey);
  const content: GymClientSiteContent = {
    ...base,
    ...(pro ? { proTemplateKey: pro } : {}),
    visualBuilder: vb,
  };
  const slugForDraft = typeof detail.slug === 'string' && detail.slug.trim() ? detail.slug.trim().toLowerCase() : key;
  return writeCrystalWebsitePreviewToStorage(withPreviewEditReturn({ slug: slugForDraft, theme, content }, key));
}
