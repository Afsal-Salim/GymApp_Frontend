/**
 * Pro template seed loader for the GrapesJS builder canvas.
 *
 * Originally a Next.js Route Handler (`GET /gjs-pro-template/[key]`). In the Vite SPA the same
 * logic is exposed as a plain async function (`fetchGjsProTemplate`) so consumers can call it
 * directly — there's no HTTP round-trip in the browser. A thin `handleGjsProTemplate` wrapper
 * keeps the original "request → JSON response" shape for the dev-only Vite middleware that
 * preserves the legacy `/gjs-pro-template/:key` URL during local debugging.
 */
import { PRO_WEBSITE_TEMPLATE_KEYS } from '@/features/crystal/gymClientSiteContent/gymClientSiteContent';
import {
  DESIGN_SYSTEM_SETS,
  getDesignSystemTemplatePayloadForBuilder,
  type DesignSystemSetId,
} from '@/features/website/websiteBuilderDesignSystemBlocks/websiteBuilderDesignSystemBlocks';
import { loadProTemplateCss } from '@/app/templates/loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '@/app/templates/loadProTemplateHtml';

const ALLOWED_KEYS = new Set<string>(PRO_WEBSITE_TEMPLATE_KEYS);

/** Builder canvas expects a stable root class so scoped template CSS applies. */
function wrapTemplateBodyForBuilder(key: string, bodyInner: string): string {
  const scopedRootClass = `${key}-pro-template`;
  return `<div class="wb-template-root ${scopedRootClass}">${bodyInner}</div>`;
}

export interface GjsProTemplatePayload {
  key: string;
  html: string;
  css: string;
}

export class GjsProTemplateError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchGjsProTemplate(rawKey: string): Promise<GjsProTemplatePayload> {
  const key = (rawKey ?? '').trim().toLowerCase();
  if (!ALLOWED_KEYS.has(key)) {
    throw new GjsProTemplateError('Unknown template key', 400);
  }

  if (key.startsWith('ds-')) {
    const setId = key.slice(3);
    if (!DESIGN_SYSTEM_SETS.some((s) => s.id === setId)) {
      throw new GjsProTemplateError('Unknown design system', 404);
    }
    const { html: inner } = getDesignSystemTemplatePayloadForBuilder(setId as DesignSystemSetId);
    return { key, html: wrapTemplateBodyForBuilder(key, inner), css: '' };
  }

  const fullHtml = loadProTemplateHtml(`${key}.html`);
  const bodyInner = extractBodyInnerHtml(fullHtml);
  const css = loadProTemplateCss(`${key}.css`);
  return {
    key,
    html: wrapTemplateBodyForBuilder(key, bodyInner),
    css,
  };
}

/** Dev-server adapter used by `vite.config.ts` to preserve the legacy `/gjs-pro-template/:key` URL. */
export async function handleGjsProTemplate(key: string): Promise<{ status: number; body: string; contentType: string }> {
  try {
    const payload = await fetchGjsProTemplate(key);
    return {
      status: 200,
      body: JSON.stringify(payload),
      contentType: 'application/json',
    };
  } catch (err) {
    if (err instanceof GjsProTemplateError) {
      return {
        status: err.status,
        body: JSON.stringify({ error: err.message }),
        contentType: 'application/json',
      };
    }
    return {
      status: 500,
      body: JSON.stringify({ error: 'Internal error' }),
      contentType: 'application/json',
    };
  }
}
