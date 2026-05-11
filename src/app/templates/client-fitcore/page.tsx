import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

/**
 * Pro template. Edit `src/assets/templates/fitcore.html` + `fitcore.css`.
 * Route: `/templates/client-fitcore` — not linked from marketing nav.
 */
export default function ClientFitcoreTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('fitcore.html'));
  const css = loadProTemplateCss('fitcore.css');
  return (
    <>

        <title>FitCore gym template (Pro)</title>
        <meta
          name="description"
          content="Standalone gym / studio landing template. Edit HTML/CSS under src/assets/templates/fitcore.*"
        />
        <meta name="robots" content="noindex,nofollow" />

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
