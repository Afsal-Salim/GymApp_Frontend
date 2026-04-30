import { notFound } from 'next/navigation';

export const revalidate = 3600;

/** Retired plan route — Base checkout is `/base`; Trial exists for new gyms. */
export default function MaxPlanRetiredPage() {
  notFound();
}
