import PlansPage from '@/features/plans/PlansPage';
import { fetchPlanListForServer } from '@/lib/plansServer';

/** Public plan catalog — refresh periodically to reduce API load (EC2). */
export const revalidate = 60;

export default async function Page() {
  let initialPlans: Awaited<ReturnType<typeof fetchPlanListForServer>> = [];
  let plansServerError: string | null = null;
  try {
    initialPlans = await fetchPlanListForServer();
  } catch {
    plansServerError = 'Failed to load plans.';
  }
  return (
    <PlansPage key="plans-root" initialPlans={initialPlans} plansServerError={plansServerError} />
  );
}
