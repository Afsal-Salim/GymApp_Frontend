import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

/**
 * Pro template (sonicflow assets, gym-focused copy). Edit `sonicflow.html` + `sonicflow.css`.
 * Route: `/templates/client-sonicflow` — not linked from marketing nav.
 */
export default function ClientSonicflowTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('sonicflow.html'));
  const css = loadProTemplateCss('sonicflow.css');
  return (
    <>

        <title>IronPulse gym template (Pro)</title>
        <meta
          name="description"
          content="Standalone gym landing template (SonicFlow layout). Edit HTML/CSS under src/assets/templates/sonicflow.*"
        />
        <meta name="robots" content="noindex,nofollow" />

      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".sonicflow-pro-template" />
      <div
        className="sonicflow-pro-template gjs-t-body"
        data-pro-template="client-sonicflow"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
