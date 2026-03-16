import { API_BASE_URL } from './config';

export type PlanFeature = {
  id: number;
  name: string;
};

export type PlanListItem = {
  id: number;
  name: string;
  price: string;
  currency?: string;
  duration: number;
  features?: PlanFeature[];
  created_at: string;
};

export async function getPlanList(): Promise<PlanListItem[]> {
  const res = await fetch(`${API_BASE_URL}/plans/plan_list/`);
  if (!res.ok) throw new Error('Failed to fetch plans');
  return res.json();
}
