import { redirect } from 'next/navigation';

/** Legacy checkout URL — use `/base`. */
export default function StarterCheckoutRedirectPage(): never {
  redirect('/base');
}
