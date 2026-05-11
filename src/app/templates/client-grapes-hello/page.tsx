import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

export default function ClientGrapesHelloTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('grapes-hello.html'));
  const css = loadProTemplateCss('grapes-hello.css');
  return (
    <>

        <title>GrapesJS hello demo (default)</title>
        <meta
          name="description"
          content="Sample adapted from DemoCanvasOnly in the GrapesJS documentation."
        />
        <meta name="robots" content="noindex,nofollow" />

      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".grapes-hello-root" />
      <div
        className="gjs-t-body"
        data-pro-template="client-grapes-hello"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
