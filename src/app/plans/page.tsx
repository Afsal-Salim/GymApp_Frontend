import { useEffect, useState } from 'react';
import PlansPage from '@/features/plans/PlansPage/PlansPage';
import { fetchPlanListForServer } from '@/lib/plansServer';
import type { PlanListItem } from '@/api/plans';
import PlansLoading from './loading';

/**
 * Public plan catalog. In the Vite SPA the list is fetched client-side once on mount and passed
 * down to `PlansPage` the same way it used to be passed from the Next RSC.
 */
export default function Page() {
  const [initialPlans, setInitialPlans] = useState<PlanListItem[] | null>(null);
  const [plansServerError, setPlansServerError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlanListForServer()
      .then((plans) => {
        if (!cancelled) setInitialPlans(plans);
      })
      .catch(() => {
        if (!cancelled) {
          setInitialPlans([]);
          setPlansServerError('Failed to load plans.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (initialPlans === null) {
    return <PlansLoading />;
  }

  return (
    <PlansPage key="plans-root" initialPlans={initialPlans} plansServerError={plansServerError} />
  );
}
