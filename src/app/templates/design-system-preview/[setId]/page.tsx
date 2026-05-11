import { useEffect, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
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
 * Read-only full-page preview for a design system (used by template-picker iframes).
 *
 * Previously a Next Route Handler that streamed a full `<html>` document; in the SPA we render the
 * preview inline as a React page. The iframe still navigates to `/templates/design-system-preview/:setId`
 * — it just boots the SPA and lands on this page. The `<templates>` layout wraps it but has no
 * chrome, so the visible result is identical.
 */
export default function DesignSystemPreviewPage() {
  const { setId: raw = '' } = useParams<{ setId: string }>();
  const id = raw.trim().toLowerCase();
  const set = DESIGN_SYSTEM_SETS.find((s) => s.id === id);
  if (!set) notFound();

  const { html: bodyInner } = useMemo(
    () => getDesignSystemTemplatePayloadForBuilder(id as DesignSystemSetId),
    [id],
  );

  useEffect(() => {
    /** Append the design-system font stylesheet (mirrors the original `<head>` in the route handler). */
    const linkId = 'crystal-ds-preview-fonts';
    if (document.getElementById(linkId)) return;
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = WEBSITE_BUILDER_DESIGN_SYSTEM_FONTS_STYLESHEET_HREF;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  return (
    <>

        <title>{`${set!.label} — preview`}</title>
        <meta name="robots" content="noindex,nofollow" />

      <style
        dangerouslySetInnerHTML={{
          __html: [
            WEBSITE_BUILDER_ANIMATION_CSS,
            WEBSITE_BUILDER_COMPONENT_LIBRARY_CSS,
            WEBSITE_BUILDER_COMPONENT_ANIMATION_CSS,
            WEBSITE_BUILDER_DESIGN_SYSTEMS_CSS,
            WEBSITE_BUILDER_TEMPLATE_RESPONSIVE_CSS,
          ].join('\n'),
        }}
      />
      <div
        className={`wb-template-root ds-${id}-template`}
        dangerouslySetInnerHTML={{ __html: bodyInner }}
      />
      <script defer src="/wb-component-animations.js" />
    </>
  );
}
