import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

export default function ClientZenTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('zen.html'));
  const css = loadProTemplateCss('zen.css');
  return (
    <>

        <title>Zen gym template (Pro)</title>
        <meta
          name="description"
          content="Standalone gym landing template. Edit HTML/CSS under src/assets/templates/zen.*"
        />
        <meta name="robots" content="noindex,nofollow" />

      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".zen-pro-template" />
      <div
        className="zen-pro-template gjs-t-body"
        data-pro-template="client-zen"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
