import type { Metadata } from 'next';
import PrivacyPolicyPage from '@/features/legal/PrivacyPolicyPage';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Privacy Policy — Crystal',
  description: 'How Crystal handles your data and privacy.',
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
