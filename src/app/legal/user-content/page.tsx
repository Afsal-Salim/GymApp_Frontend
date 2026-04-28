import type { Metadata } from 'next';
import UserContentPolicyPage from '@/features/legal/UserContentPolicyPage/UserContentPolicyPage';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'User Content Responsibility — Crystal',
  description: 'Content and intellectual property rules for Crystal users.',
};

export default function Page() {
  return <UserContentPolicyPage />;
}
