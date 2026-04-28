import { NextResponse } from 'next/server';
import {
  DESIGN_SYSTEM_SETS,
  getDesignSystemTemplatePayloadForBuilder,
  type DesignSystemSetId,
} from '@/features/website/websiteBuilderDesignSystemBlocks/websiteBuilderDesignSystemBlocks';
import {
  WEBSITE_BUILDER_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS,
  WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS,
  WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS,
} from '@/features/website/websiteBuilderConstants/websiteBuilderConstants';
import { WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF } from '@/features/website/websiteBuilderDesignSystemFonts/websiteBuilderDesignSystemFonts';
import { WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS } from '@/features/website/websiteBuilderDesignSystems.css/websiteBuilderDesignSystems.css';

/**
 * Read-only full-page preview for a design system (used by template picker iframes).
 * Not under `/api/` so Django rewrites do not intercept.
 */
export async function GET(_request: Request, context: { params: Promise<{ setId: string }> }) {
  const { setId: raw } = await context.params;
  const id = (raw ?? '').trim().toLowerCase();
  if (!DESIGN_SYSTEM_SETS.some((s) => s.id === id)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { html: bodyInner } = getDesignSystemTemplatePayloadForBuilder(id as DesignSystemSetId);
  const label = DESIGN_SYSTEM_SETS.find((s) => s.id === id)?.label ?? id;

  const doc = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${label} — preview</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF}" />
    <style>
      ${WEBSITE_BUILDER_ANIMATION_CSS}
      ${WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS}
      ${WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS}
      ${WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS}
      ${WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS}
    </style>
  </head>
  <body>
    <div class="wb-template-root ds-${id}-template">${bodyInner}</div>
    <script defer src="/wb-component-animations.js"></script>
  </body>
</html>`;

  return new NextResponse(doc, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
