/**
 * Public Crystal gym client — lead & engagement API (no auth).
 *
 * Backend contract: `POST {apiBaseUrl}/businesses/public/{slug}/crystal-leads/` with JSON body
 * (`lead_type`: join_now | book_free_trial | plan_visit | whatsapp_click, etc.).
 */
import { apiBaseUrl } from '../config/env';
import { getAxiosErrorMessage } from './http/axiosErrorMessage';
import { publicApi } from './http/publicApi';

export type CrystalJoinNowLeadBody = {
  lead_type: 'join_now';
  business_slug: string;
  submitted_at_ms: number;
  name: string;
  phone: string;
  focus: string;
  frequency: string;
};

export type CrystalBookFreeTrialLeadBody = {
  lead_type: 'book_free_trial';
  business_slug: string;
  submitted_at_ms: number;
  name: string;
  phone: string;
  visit_when: string;
  interests: string[];
  notes: string;
};

export type CrystalPlanVisitLeadBody = {
  lead_type: 'plan_visit';
  business_slug: string;
  submitted_at_ms: number;
  name: string;
  phone: string;
  preferred_when: string;
  notes: string;
};

export type CrystalWhatsAppClickBody = {
  lead_type: 'whatsapp_click';
  business_slug: string;
  submitted_at_ms: number;
  source: 'fab' | 'inline';
  click_count: number;
};

export type CrystalPublicLeadBody =
  | CrystalJoinNowLeadBody
  | CrystalBookFreeTrialLeadBody
  | CrystalPlanVisitLeadBody
  | CrystalWhatsAppClickBody;

/** Absolute URL for lead POST (e.g. logging or tests). Preserves `apiBaseUrl` path prefix. */
export function crystalPublicLeadsUrl(slug: string): string {
  const base = apiBaseUrl.replace(/\/$/, '');
  return `${base}/businesses/public/${encodeURIComponent(slug.trim())}/crystal-leads/`;
}

/** Persist a lead or WhatsApp engagement. Public; no Authorization header. */
export async function postCrystalPublicLead(slug: string, body: CrystalPublicLeadBody): Promise<void> {
  const key = slug.trim();
  if (!key) return;
  try {
    await publicApi.post(`/businesses/public/${encodeURIComponent(key)}/crystal-leads/`, body);
  } catch (e) {
    throw new Error(getAxiosErrorMessage(e, `Lead API failed`));
  }
}
