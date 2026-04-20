import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';

export const metadata: Metadata = {
  title: 'Client page template (Pro)',
  description:
    'Standalone editable landing template for Pro client sites. Not linked from the main app.',
  robots: { index: false, follow: false },
};

function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : '';
}

/**
 * Pro-only client page template. Edit markup in `src/assets/templates/autopilot.html`
 * and styles in `src/assets/templates/autopilot.css`, then reload this route.
 *
 * Route: `/templates/client-autopilot` (intentionally not linked from marketing nav).
 */
export default function ClientAutopilotTemplatePage() {
  const filePath = path.join(process.cwd(), 'src/assets/templates/autopilot.html');
  const raw = fs.readFileSync(filePath, 'utf8');
  const css = loadProTemplateCss('autopilot.css');
  const innerHtml = extractBodyInnerHtml(raw);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".autopilot-pro-template" />
      <div
        className="autopilot-pro-template gjs-t-body"
        data-pro-template="client-autopilot"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
