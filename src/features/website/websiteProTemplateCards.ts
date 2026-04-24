import type { ProWebsiteTemplateKey } from '../crystal/gymClientSiteContent';
import { PRO_WEBSITE_TEMPLATE_OPTIONS } from './setup/createWebsiteFormState';
import { DESIGN_SYSTEM_SETS } from './websiteBuilderDesignSystemBlocks';

export type ProTemplateKey = Exclude<ProWebsiteTemplateKey, ''>;

const DESIGN_SYSTEM_PREVIEW_PATHS = Object.fromEntries(
  DESIGN_SYSTEM_SETS.map((s) => [`ds-${s.id}`, `/templates/design-system-preview/${s.id}`]),
) as Record<string, string>;

const DESIGN_SYSTEM_CARD_DESCRIPTIONS = Object.fromEntries(
  DESIGN_SYSTEM_SETS.map((s) => [
    `ds-${s.id}`,
    `Complete ${s.label} landing (navbar → footer): premium design system for the visual editor.`,
  ]),
) as Record<string, string>;

export const PRO_TEMPLATE_PREVIEW_PATHS: Record<ProTemplateKey, string> = {
  autopilot: '/templates/client-autopilot',
  fitcore: '/templates/client-fitcore',
  sonicflow: '/templates/client-sonicflow',
  vital: '/templates/client-vital',
  sole: '/templates/client-sole',
  zen: '/templates/client-zen',
  'grapes-welcome': '/templates/client-grapes-welcome',
  'grapes-hello': '/templates/client-grapes-hello',
  'grapes-cli': '/templates/client-grapes-cli',
  ...(DESIGN_SYSTEM_PREVIEW_PATHS as Record<ProTemplateKey, string>),
};

/** True when the form holds a non-default Pro layout key (requires Pro subscription at save when enforced). */
export function isProTemplateKey(key: string): boolean {
  const t = key.trim().toLowerCase();
  return t !== '' && t in PRO_TEMPLATE_PREVIEW_PATHS;
}

/** Design system full-page seeds (`ds-*`) — shown as Max tier in the site editor template summary. */
export function isDesignSystemTemplateKey(key: string): boolean {
  return key.trim().toLowerCase().startsWith('ds-');
}

export const PRO_TEMPLATE_CARD_DESCRIPTIONS: Record<ProTemplateKey, string> = {
  autopilot: 'Bold multi-section gym layout with membership pricing and training zones.',
  fitcore: 'Modern fitness layout with clean sections and strong CTA flow.',
  sonicflow: 'Dark premium style with sections for programs and coaches.',
  vital: 'Energetic high-contrast gym landing with plan highlights.',
  sole: 'Grid-heavy commercial style adapted for gym program cards.',
  zen: 'Minimal calm visual language adapted for performance gyms.',
  'grapes-welcome': 'Official GrapesJS core dev seed: welcome card with logo (from packages/core).',
  'grapes-hello': 'Minimal “Hello World” canvas from the GrapesJS documentation demo.',
  'grapes-cli': 'Plain starter block similar to the GrapesJS CLI default page.',
  ...(DESIGN_SYSTEM_CARD_DESCRIPTIONS as Record<ProTemplateKey, string>),
};

export function buildProTemplateCards() {
  return PRO_WEBSITE_TEMPLATE_OPTIONS.filter((o): o is { value: ProTemplateKey; label: string } => Boolean(o.value)).map(
    (o) => ({
      key: o.value,
      label: o.label,
      previewPath: PRO_TEMPLATE_PREVIEW_PATHS[o.value],
      description: PRO_TEMPLATE_CARD_DESCRIPTIONS[o.value],
    }),
  );
}

/**
 * Cards for the standalone template picker — design systems are labeled **Max** (product tier);
 * saving still uses the same **Pro** subscription check as other paid templates.
 */
export function buildDesignSystemSelectPageTemplateCards() {
  return DESIGN_SYSTEM_SETS.map((s) => {
    const key = `ds-${s.id}` as ProTemplateKey;
    return {
      key,
      label: `${s.label} — design system`,
      previewPath: PRO_TEMPLATE_PREVIEW_PATHS[key],
      description: PRO_TEMPLATE_CARD_DESCRIPTIONS[key],
    };
  });
}
