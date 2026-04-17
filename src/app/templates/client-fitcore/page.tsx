import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';

export const metadata: Metadata = {
  title: 'FitCore gym template (Pro)',
  description:
    'Standalone gym / studio landing template. Edit HTML/CSS under src/assets/templates/fitcore.*',
  robots: { index: false, follow: false },
};

function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : '';
}

/**
 * Pro template. Edit `src/assets/templates/fitcore.html` + `fitcore.css`.
 * Route: `/templates/client-fitcore` — not linked from marketing nav.
 */
export default function ClientFitcoreTemplatePage() {
  const filePath = path.join(process.cwd(), 'src/assets/templates/fitcore.html');
  const cssPath = path.join(process.cwd(), 'src/assets/templates/fitcore.css');
  const raw = fs.readFileSync(filePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const innerHtml = extractBodyInnerHtml(raw);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".fitcore-pro-template" />
      <div
        className="fitcore-pro-template gjs-t-body"
        data-pro-template="client-fitcore"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
