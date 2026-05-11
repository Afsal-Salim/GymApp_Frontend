import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

export default function ClientVitalTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('vital.html'));
  const css = loadProTemplateCss('vital.css');
  return (
    <>

        <title>Vital gym template (Pro)</title>
        <meta
          name="description"
          content="Standalone gym landing template. Edit HTML/CSS under src/assets/templates/vital.*"
        />
        <meta name="robots" content="noindex,nofollow" />

      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".vital-pro-template" />
      <div
        className="vital-pro-template gjs-t-body"
        data-pro-template="client-vital"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
