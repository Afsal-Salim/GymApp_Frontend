import typography from '@/assets/templates/pro-templates-typography.css?raw';
import autopilotCss from '@/assets/templates/autopilot.css?raw';
import fitcoreCss from '@/assets/templates/fitcore.css?raw';
import grapesCliCss from '@/assets/templates/grapes-cli.css?raw';
import grapesHelloCss from '@/assets/templates/grapes-hello.css?raw';
import grapesWelcomeCss from '@/assets/templates/grapes-welcome.css?raw';
import soleCss from '@/assets/templates/sole.css?raw';
import sonicflowCss from '@/assets/templates/sonicflow.css?raw';
import vitalCss from '@/assets/templates/vital.css?raw';
import zenCss from '@/assets/templates/zen.css?raw';

/**
 * In the original Next.js build these CSS files were read off disk with `fs.readFileSync`.
 * Vite ships them through `?raw` imports so the same content is inlined into the SPA bundle.
 */
const TEMPLATE_CSS_BY_FILENAME: Record<string, string> = {
  'autopilot.css': autopilotCss,
  'fitcore.css': fitcoreCss,
  'grapes-cli.css': grapesCliCss,
  'grapes-hello.css': grapesHelloCss,
  'grapes-welcome.css': grapesWelcomeCss,
  'sole.css': soleCss,
  'sonicflow.css': sonicflowCss,
  'vital.css': vitalCss,
  'zen.css': zenCss,
};

/** Template CSS followed by shared Pro typography (Playfair + Inter). */
export function loadProTemplateCss(filename: string): string {
  const main = TEMPLATE_CSS_BY_FILENAME[filename];
  if (main === undefined) {
    throw new Error(`Unknown Pro template CSS file: ${filename}`);
  }
  return `${main}\n${typography}`;
}

export function loadProTemplateCssMain(filename: string): string {
  const main = TEMPLATE_CSS_BY_FILENAME[filename];
  if (main === undefined) {
    throw new Error(`Unknown Pro template CSS file: ${filename}`);
  }
  return main;
}

export { typography as proTemplatesTypographyCss };
