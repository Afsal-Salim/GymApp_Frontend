import { Link } from 'react-router-dom';
import { PageContainer } from '../../components';
import UserContentPolicyArticle from './UserContentPolicyArticle';
import './UserContentPolicyPage.css';

export default function UserContentPolicyPage() {
  return (
    <PageContainer className="user-content-policy-page">
      <main className="user-content-policy-page__main">
        <div className="user-content-policy-page__inner">
          <p className="user-content-policy-page__crumb mb-2">
            <Link to="/crystal">Crystal</Link>
            <span className="text-muted" aria-hidden>
              {' '}
              /{' '}
            </span>
            <span className="text-muted">Legal</span>
          </p>
          <h1 className="user-content-policy-page__title h3 mb-4">User Content Responsibility</h1>
          <div className="user-content-policy-page__body">
            <UserContentPolicyArticle />
          </div>
          <section className="user-content-policy-page__section mt-4">
            <h2 className="h5 mb-2">Basic Terms of Use</h2>
            <p className="mb-2">
              By creating an account or using Crystal, you agree to use the platform only for lawful business purposes.
            </p>
            <ul className="ps-3 mb-0">
              <li className="mb-1">You are responsible for all activity under your account.</li>
              <li className="mb-1">You must keep your login credentials secure.</li>
              <li className="mb-1">You must provide accurate business information.</li>
            </ul>
          </section>

          <section className="user-content-policy-page__section mt-4">
            <h2 className="h5 mb-2">Privacy and Personal Data</h2>
            <p className="mb-2">
              You should only submit personal data that you are permitted to collect and process. If your website
              collects customer details, you are responsible for complying with applicable privacy laws.
            </p>
            <ul className="ps-3 mb-0">
              <li className="mb-1">Do not upload sensitive personal data unless required and lawful.</li>
              <li className="mb-1">Do not share private customer information publicly.</li>
            </ul>
          </section>

          <section className="user-content-policy-page__section mt-4">
            <h2 className="h5 mb-2">Prohibited Content and Conduct</h2>
            <ul className="ps-3 mb-0">
              <li className="mb-1">No unlawful, abusive, defamatory, or misleading content.</li>
              <li className="mb-1">No malware, phishing links, or harmful code.</li>
              <li className="mb-1">No impersonation of individuals, brands, or organizations.</li>
            </ul>
          </section>

          <section className="user-content-policy-page__section mt-4">
            <h2 className="h5 mb-2">Content Moderation and Takedown</h2>
            <p className="mb-0">
              We may investigate reports and remove, disable, or restrict content that appears to violate these terms,
              legal requirements, or third-party rights.
            </p>
          </section>

          <section className="user-content-policy-page__section mt-4">
            <h2 className="h5 mb-2">Service Availability and Liability</h2>
            <p className="mb-0">
              Crystal is provided on an &quot;as is&quot; basis. While we aim for reliable service, we do not guarantee
              uninterrupted availability. To the extent permitted by law, Crystal is not liable for indirect or
              consequential losses arising from platform use.
            </p>
          </section>

          <section className="user-content-policy-page__section mt-4">
            <h2 className="h5 mb-2">Policy Updates</h2>
            <p className="mb-0">
              We may update this page as the product and legal requirements evolve. Continued use of the platform means
              you accept the latest version of these terms.
            </p>
          </section>
          <p className="user-content-policy-page__footer small text-muted mt-4 mb-0">
            See also{' '}
            <Link to="/legal/privacy">Privacy Policy</Link>. Questions? Contact support through your account or the
            details on our main site.
          </p>
        </div>
      </main>
    </PageContainer>
  );
}
