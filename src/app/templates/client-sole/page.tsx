import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';

export const metadata: Metadata = {
  title: 'Sole gym template (Pro)',
  description: 'Standalone gym landing template. Edit HTML/CSS under src/assets/templates/sole.*',
  robots: { index: false, follow: false },
};

function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : '';
}

export default function ClientSoleTemplatePage() {
  const filePath = path.join(process.cwd(), 'src/assets/templates/sole.html');
  const cssPath = path.join(process.cwd(), 'src/assets/templates/sole.css');
  const raw = fs.readFileSync(filePath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const innerHtml = extractBodyInnerHtml(raw);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".sole-pro-template" />
      <div
        className="sole-pro-template gjs-t-body"
        data-pro-template="client-sole"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
