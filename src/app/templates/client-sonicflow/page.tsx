import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';

export const metadata: Metadata = {
  title: 'IronPulse gym template (Pro)',
  description:
    'Standalone gym landing template (SonicFlow layout). Edit HTML/CSS under src/assets/templates/sonicflow.*',
  robots: { index: false, follow: false },
};

function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : '';
}

/**
 * Pro template (sonicflow assets, gym-focused copy). Edit `sonicflow.html` + `sonicflow.css`.
 * Route: `/templates/client-sonicflow` — not linked from marketing nav.
 */
export default function ClientSonicflowTemplatePage() {
  const filePath = path.join(process.cwd(), 'src/assets/templates/sonicflow.html');
  const cssPath = path.join(process.cwd(), 'src/assets/templates/sonicflow.css');
  const raw = fs.readFileSync(filePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const innerHtml = extractBodyInnerHtml(raw);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".sonicflow-pro-template" />
      <div
        className="sonicflow-pro-template gjs-t-body"
        data-pro-template="client-sonicflow"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
