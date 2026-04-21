import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { PRO_WEBSITE_TEMPLATE_KEYS } from '@/features/crystal/gymClientSiteContent';

const TEMPLATES_DIR = path.join(process.cwd(), 'src/assets/templates');

const ALLOWED_KEYS = new Set<string>(PRO_WEBSITE_TEMPLATE_KEYS);

function extractBodyInnerHtml(fullHtml: string): string {
  const match = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1]!.trim() : fullHtml.trim();
}

function loadProTemplateCssBundle(filename: string): string {
  const main = fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf8');
  const typography = fs.readFileSync(path.join(TEMPLATES_DIR, 'pro-templates-typography.css'), 'utf8');
  return `${main}\n${typography}`;
}

/**
 * Serves raw Pro template body HTML + CSS for the GrapesJS builder.
 * **Path is not under `/api/`** so `next.config` rewrites that proxy `/api/*` → Django do not intercept it.
 */
export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key: raw } = await context.params;
  const key = (raw ?? '').trim().toLowerCase();
  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: 'Unknown template key' }, { status: 400 });
  }

  const htmlPath = path.join(TEMPLATES_DIR, `${key}.html`);
  if (!fs.existsSync(htmlPath)) {
    return NextResponse.json({ error: 'Template HTML not found' }, { status: 404 });
  }

  const fullHtml = fs.readFileSync(htmlPath, 'utf8');
  const bodyInner = extractBodyInnerHtml(fullHtml);
  const css = loadProTemplateCssBundle(`${key}.css`);

  return NextResponse.json({
    key,
    html: bodyInner,
    css,
  });
}
