import autopilotHtml from '@/assets/templates/autopilot.html?raw';
import fitcoreHtml from '@/assets/templates/fitcore.html?raw';
import grapesCliHtml from '@/assets/templates/grapes-cli.html?raw';
import grapesHelloHtml from '@/assets/templates/grapes-hello.html?raw';
import grapesWelcomeHtml from '@/assets/templates/grapes-welcome.html?raw';
import soleHtml from '@/assets/templates/sole.html?raw';
import sonicflowHtml from '@/assets/templates/sonicflow.html?raw';
import vitalHtml from '@/assets/templates/vital.html?raw';
import zenHtml from '@/assets/templates/zen.html?raw';

const TEMPLATE_HTML_BY_FILENAME: Record<string, string> = {
  'autopilot.html': autopilotHtml,
  'fitcore.html': fitcoreHtml,
  'grapes-cli.html': grapesCliHtml,
  'grapes-hello.html': grapesHelloHtml,
  'grapes-welcome.html': grapesWelcomeHtml,
  'sole.html': soleHtml,
  'sonicflow.html': sonicflowHtml,
  'vital.html': vitalHtml,
  'zen.html': zenHtml,
};

export function loadProTemplateHtml(filename: string): string {
  const html = TEMPLATE_HTML_BY_FILENAME[filename];
  if (html === undefined) {
    throw new Error(`Unknown Pro template HTML file: ${filename}`);
  }
  return html;
}

/** Strip everything outside `<body>` — same logic as the original Next pages. */
export function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : fullHtml.trim();
}
