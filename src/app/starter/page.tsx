import { redirect } from 'next/navigation';

export const revalidate = 3600;

/** Legacy checkout URL — use `/base`. */
export default function StarterCheckoutRedirectPage() {
  redirect('/base');
}
