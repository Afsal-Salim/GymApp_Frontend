import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

/**
 * Pro-only client page template. Edit markup in `src/assets/templates/autopilot.html`
 * and styles in `src/assets/templates/autopilot.css`, then reload this route.
 *
 * Route: `/templates/client-autopilot` (intentionally not linked from marketing nav).
 */
export default function ClientAutopilotTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('autopilot.html'));
  const css = loadProTemplateCss('autopilot.css');

  return (
    <>

        <title>Client page template (Pro)</title>
        <meta
          name="description"
          content="Standalone editable landing template for Pro client sites. Not linked from the main app."
        />
        <meta name="robots" content="noindex,nofollow" />

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
