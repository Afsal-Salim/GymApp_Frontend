import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function formatPlanPrice(price: string, currency?: string): string {
  const num = Number(price);
  const symbol =
    currency && CURRENCY_SYMBOLS[currency] ? CURRENCY_SYMBOLS[currency] : (currency ?? '₹');
  return `${symbol}${Number.isFinite(num) ? num.toFixed(0) : price}`;
}

export type PlanFeature = {
  id: number;
  name: string;
};

export type PlanListItem = {
  id: number;
  name: string;
  /** List / standard price (decimal string). */
  price: string;
  /** Lower first-time price when applicable; null if unused. */
  first_activation_price?: string | null;
  currency?: string;
  duration: number;
  coming_soon?: boolean;
  record_status?: string;
  features?: PlanFeature[];
  created_at: string;
  updated_at?: string;
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
export type PlanListApiResponse = {
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
