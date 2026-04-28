import PlansPage from '@/features/plans/PlansPage/PlansPage';
import { fetchPlanListForServer } from '@/lib/plansServer';

export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ businessSlug: string }> }) {
  const { businessSlug } = await params;
  let initialPlans: Awaited<ReturnType<typeof fetchPlanListForServer>> = [];
  let plansServerError: string | null = null;
  try {
    initialPlans = await fetchPlanListForServer();
  } catch {
    plansServerError = 'Failed to load plans.';
  }
  return (
    <PlansPage
      key={businessSlug}
      initialPlans={initialPlans}
      plansServerError={plansServerError}
    />
  );
}
