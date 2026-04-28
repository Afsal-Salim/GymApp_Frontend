/**
 * Shared copy for `/legal/user-content` and the sign-up acknowledgement step.
 */
export default function UserContentPolicyArticle({ className }: { className?: string }) {
  return (
    <article className={className}>
      <p className="mb-3">
        Users are solely responsible for any content they upload, link, or display on their websites, including images,
        videos, and text.
      </p>
      <p className="mb-3">
        By using this platform, you confirm that you have the necessary rights, licenses, or permissions to use all
        content you provide.
      </p>
      <p className="mb-2">You must not upload or use:</p>
      <ul className="mb-3 ps-3">
        <li className="mb-1">Copyrighted content without permission</li>
        <li className="mb-1">Images of celebrities or individuals for commercial use without consent</li>
        <li className="mb-1">Any content that violates intellectual property or privacy rights</li>
      </ul>
      <p className="mb-0">
        We reserve the right to remove or disable access to any content that is reported or found to be in violation of
        these terms.
      </p>
    </article>
  );
}
