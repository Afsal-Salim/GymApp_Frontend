import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';

export const metadata: Metadata = {
  title: 'GrapesJS core welcome (default)',
  description: 'Sample adapted from packages/core/index.html in the GrapesJS repository.',
  robots: { index: false, follow: false },
};

function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : '';
}

export default function ClientGrapesWelcomeTemplatePage() {
  const filePath = path.join(process.cwd(), 'src/assets/templates/grapes-welcome.html');
  const raw = fs.readFileSync(filePath, 'utf8');
  const css = loadProTemplateCss('grapes-welcome.css');
  const innerHtml = extractBodyInnerHtml(raw);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".grapes-welcome-root" />
      <div className="gjs-t-body" data-pro-template="client-grapes-welcome" dangerouslySetInnerHTML={{ __html: innerHtml }} />
    </>
  );
}
