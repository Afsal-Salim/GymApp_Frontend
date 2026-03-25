import { Link } from 'react-router-dom';
import { PageContainer } from '../../components';
import PrivacyPolicyArticle from './PrivacyPolicyArticle';
import './UserContentPolicyPage.css';

export default function PrivacyPolicyPage() {
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
          <h1 className="user-content-policy-page__title h3 mb-4">Privacy Policy</h1>
          <div className="user-content-policy-page__body">
            <PrivacyPolicyArticle />
          </div>
          <p className="user-content-policy-page__footer small text-muted mt-4 mb-0">
            For content and intellectual-property rules, see{' '}
            <Link to="/legal/user-content">User Content Responsibility</Link>.
          </p>
        </div>
      </main>
    </PageContainer>
  );
}
