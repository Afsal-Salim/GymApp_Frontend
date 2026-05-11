import { TemplateMobileNav } from '@/app/templates/_components/TemplateMobileNav';
import { loadProTemplateCss } from '../loadProTemplateCss';
import { extractBodyInnerHtml, loadProTemplateHtml } from '../loadProTemplateHtml';

export default function ClientGrapesCliTemplatePage() {
  const innerHtml = extractBodyInnerHtml(loadProTemplateHtml('grapes-cli.html'));
  const css = loadProTemplateCss('grapes-cli.css');
  return (
    <>

        <title>GrapesJS CLI default</title>
        <meta
          name="description"
          content="Sample adapted from packages/cli/index.html in the GrapesJS repository."
        />
        <meta name="robots" content="noindex,nofollow" />

      <style dangerouslySetInnerHTML={{ __html: css }} />
      <TemplateMobileNav rootClass=".grapes-cli-root" />
      <div
        className="gjs-t-body"
        data-pro-template="client-grapes-cli"
        dangerouslySetInnerHTML={{ __html: innerHtml }}
      />
    </>
  );
}
