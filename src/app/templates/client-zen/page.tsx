import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';

export const metadata: Metadata = {
  title: 'Zen gym template (Pro)',
  description: 'Standalone gym landing template. Edit HTML/CSS under src/assets/templates/zen.*',
  robots: { index: false, follow: false },
};

function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : '';
}

export default function ClientZenTemplatePage() {
  const filePath = path.join(process.cwd(), 'src/assets/templates/zen.html');
  const raw = fs.readFileSync(filePath, 'utf8');
  const css = loadProTemplateCss('zen.css');
  const innerHtml = extractBodyInnerHtml(raw);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".zen-pro-template" />
      <div
        className="zen-pro-template gjs-t-body"
        data-pro-template="client-zen"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
