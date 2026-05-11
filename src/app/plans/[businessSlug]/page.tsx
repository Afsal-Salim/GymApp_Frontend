import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PlansPage from '@/features/plans/PlansPage/PlansPage';
import { fetchPlanListForServer } from '@/lib/plansServer';
import type { PlanListItem } from '@/api/plans';
import PlansLoading from '../loading';

export default function Page() {
  const { businessSlug = '' } = useParams<{ businessSlug: string }>();
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
    <PlansPage
      key={businessSlug}
      initialPlans={initialPlans}
      plansServerError={plansServerError}
    />
  );
}
