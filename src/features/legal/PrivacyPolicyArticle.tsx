/**
 * Shared copy for `/legal/privacy` and the sign-up acknowledgement step.
 */
export default function PrivacyPolicyArticle({ className }: { className?: string }) {
  return (
    <article className={className}>
      <p className="mb-3">
        This Privacy Policy describes how we expect you to handle information about people who interact with your gym
        business through Crystal (your <strong>end users</strong>), such as website visitors, leads, and members whose
        details you collect or display.
      </p>
      <p className="mb-3">
        <strong>
          As a Crystal account holder, you agree that you will not share end-user personal details with third parties
        </strong>{' '}
        except where you have a lawful basis to do so (for example, consent, a legal obligation, or a necessary service
        provider bound by confidentiality) and in line with applicable privacy laws.
      </p>
      <p className="mb-2">You must not:</p>
      <ul className="mb-3 ps-3">
        <li className="mb-1">Sell, rent, or trade end-user contact or identity data to marketers or data brokers.</li>
        <li className="mb-1">Publish or expose private end-user information on your site without a valid reason and permission where required.</li>
        <li className="mb-1">Use end-user data for purposes that are hidden, unrelated, or broader than what you disclosed to them.</li>
      </ul>
      <p className="mb-3">
        You are responsible for any forms, booking flows, or contact fields on your published website. You should only
        collect data you need, keep it secure, and honor requests from end users where the law requires (for example,
        access or deletion, depending on your jurisdiction).
      </p>
      <p className="mb-0">
        Crystal may process account and technical data to operate the platform. If we change how we handle platform-level
        data, we will update this page. Continued use of Crystal after updates means you accept the revised policy.
      </p>
    </article>
  );
}
