import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

export default function ClientSoleTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('sole.html'));
  const css = loadProTemplateCss('sole.css');
  return (
    <>

        <title>Sole gym template (Pro)</title>
        <meta
          name="description"
          content="Standalone gym landing template. Edit HTML/CSS under src/assets/templates/sole.*"
        />
        <meta name="robots" content="noindex,nofollow" />

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
