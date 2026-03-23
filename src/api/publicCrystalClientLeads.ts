/**
 * Public Crystal gym client — lead & engagement API (no auth).
 *
 * Endpoint (implement on backend):
 *   POST {API_BASE_URL}/businesses/public/{business_slug}/crystal-leads/
 *   Content-Type: application/json
 *
 * Request bodies (one of):
 *
 * 1) Join now (modal submit)
 * {
 *   "lead_type": "join_now",
 *   "business_slug": "power-gym",
 *   "submitted_at_ms": 1710000000000,
 *   "name": "Jane Doe",
 *   "phone": "+971501234567",
 *   "focus": "strength",
 *   "frequency": "3-4"
 * }
 *
 * 2) Book free trial (modal submit)
 * {
 *   "lead_type": "book_free_trial",
 *   "business_slug": "power-gym",
 *   "submitted_at_ms": 1710000000000,
 *   "name": "Jane Doe",
 *   "phone": "+971501234567",
 *   "visit_when": "2025-03-24 at 14:30",
 *   "interests": ["strength", "cardio", "classes"],
 *   "notes": "Prefer evenings"
 * }
 *
 * 3) Plan your visit (modal submit)
 * {
 *   "lead_type": "plan_visit",
 *   "business_slug": "power-gym",
 *   "submitted_at_ms": 1710000000000,
 *   "name": "Jane Doe",
 *   "phone": "+971501234567",
 *   "preferred_when": "2025-03-25 (time flexible)",
 *   "notes": ""
 * }
 *
 * 4) WhatsApp click (FAB or inline contact button — one POST per click)
 * {
 *   "lead_type": "whatsapp_click",
 *   "business_slug": "power-gym",
 *   "submitted_at_ms": 1710000000000,
 *   "source": "fab",
 *   "click_count": 1
 * }
 *   source: "fab" | "inline"
 *   click_count: always 1 from this client; backend should increment stored totals.
 */

import { API_BASE_URL } from './config';

export type CrystalJoinNowLeadBody = {
  lead_type: 'join_now';
  business_slug: string;
  submitted_at_ms: number;
  name: string;
  phone: string;
  /** Focus option id, e.g. strength, weight_loss, general, classes, explore */
  focus: string;
  /** Frequency option id, e.g. 1-2, 3-4, 5+, unsure */
  frequency: string;
};

export type CrystalBookFreeTrialLeadBody = {
  lead_type: 'book_free_trial';
  business_slug: string;
  submitted_at_ms: number;
  name: string;
  phone: string;
  /** Human-readable preferred slot, e.g. "2025-03-24 at 14:30" or "2025-03-24 (time flexible)" */
  visit_when: string;
  /** Interest ids from the trial form chips */
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
  /** Clicks represented by this request; client sends 1 per tap/open. */
  click_count: number;
};

export type CrystalPublicLeadBody =
  | CrystalJoinNowLeadBody
  | CrystalBookFreeTrialLeadBody
  | CrystalPlanVisitLeadBody
  | CrystalWhatsAppClickBody;

export function crystalPublicLeadsUrl(slug: string): string {
  const s = slug.trim();
  return `${API_BASE_URL}/businesses/public/${encodeURIComponent(s)}/crystal-leads/`;
}

/**
 * Persist a lead or WhatsApp engagement. Public; no Authorization header.
 * Throws on non-OK response (callers typically catch and ignore).
 */
export async function postCrystalPublicLead(slug: string, body: CrystalPublicLeadBody): Promise<void> {
  const key = slug.trim();
  if (!key) return;
  const res = await fetch(crystalPublicLeadsUrl(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(typeof err.detail === 'string' ? err.detail : `Lead API failed (${res.status})`);
  }
}
