import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

export default function ClientGrapesWelcomeTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('grapes-welcome.html'));
  const css = loadProTemplateCss('grapes-welcome.css');
  return (
    <>

        <title>GrapesJS core welcome (default)</title>
        <meta
          name="description"
          content="Sample adapted from packages/core/index.html in the GrapesJS repository."
        />
        <meta name="robots" content="noindex,nofollow" />

      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".grapes-welcome-root" />
      <div
        className="gjs-t-body"
        data-pro-template="client-grapes-welcome"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
