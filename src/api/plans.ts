import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';

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

export type PlanListMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

/** Raw API response: results + meta. */
type PlanListApiResponse = {
  results?: PlanListItem[];
  meta?: PlanListMeta;
};

export async function getPlanList(): Promise<PlanListItem[]> {
  try {
    const { data } = await publicApi.get<PlanListApiResponse | PlanListItem[]>('/plans/plan_list/');
    if (Array.isArray((data as PlanListApiResponse).results)) {
      return (data as PlanListApiResponse).results ?? [];
    }
    if (Array.isArray(data)) {
      return data as PlanListItem[];
    }
    return [];
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, 'Failed to fetch plans'));
  }
}
