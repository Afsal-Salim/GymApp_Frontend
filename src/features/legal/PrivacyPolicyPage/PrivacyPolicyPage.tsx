import Link from 'next/link';
import { PageContainer } from '@/components';
import PrivacyPolicyArticle from '../PrivacyPolicyArticle/PrivacyPolicyArticle';
import '../UserContentPolicyPage/UserContentPolicyPage.css';

export default function PrivacyPolicyPage() {
  return (
    <PageContainer className="user-content-policy-page">
      <main className="py-4 pb-5">
        <div className="user-content-policy-page__inner">
          <p className="user-content-policy-page__crumb mb-2">
            <Link href="/" className="text-decoration-none">
              Crystal
            </Link>
            <span className="text-muted" aria-hidden>
              {' '}
              /{' '}
            </span>
            <span className="text-muted">Legal</span>
          </p>
          <h1 className="h3 fw-bold mb-4">Privacy Policy</h1>
          <div className="lh-lg">
            <PrivacyPolicyArticle />
          </div>
          <p className="user-content-policy-page__footer small text-muted mt-4 mb-0">
            For content and intellectual-property rules, see{' '}
            <Link href="/legal/user-content">User Content Responsibility</Link>.
          </p>
        </div>
      </main>
    </PageContainer>
  );
}
