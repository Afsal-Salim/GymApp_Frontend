import type { ProWebsiteTemplateKey } from '../crystal/gymClientSiteContent';
import { PRO_WEBSITE_TEMPLATE_OPTIONS } from './setup/createWebsiteFormState';

export type ProTemplateKey = Exclude<ProWebsiteTemplateKey, ''>;

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
};

/** True when the form holds a non-default Pro layout key (requires Pro subscription at save when enforced). */
export function isProTemplateKey(key: string): boolean {
  const t = key.trim().toLowerCase();
  return t !== '' && t in PRO_TEMPLATE_PREVIEW_PATHS;
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
};

export function buildProTemplateCards() {
  return PRO_WEBSITE_TEMPLATE_OPTIONS.filter((o): o is { value: ProTemplateKey; label: string } => Boolean(o.value)).map(
    (o) => ({
      key: o.value,
      label: o.label,
      previewPath: PRO_TEMPLATE_PREVIEW_PATHS[o.value],
      description: PRO_TEMPLATE_CARD_DESCRIPTIONS[o.value],
    })
  );
}
