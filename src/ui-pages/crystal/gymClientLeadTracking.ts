/**
 * Client-side lead / engagement stats per gym slug (localStorage), plus
 * best-effort sync to POST /businesses/public/{slug}/crystal-leads/ (see api/publicCrystalClientLeads.ts).
 */

import { postCrystalPublicLead, type CrystalPublicLeadBody } from '../../api/publicCrystalClientLeads';
import { GYM_CRYSTAL_LEAD_STATS_STORAGE_KEY } from '../../config/storageKeys';

const STORAGE_KEY = GYM_CRYSTAL_LEAD_STATS_STORAGE_KEY;
const MAX_EVENTS = 100;
const MAX_JOIN_LEADS = 40;
const MAX_TRIAL_LEADS = 40;
const MAX_VISIT_LEADS = 40;

export type GymClientLeadEventType =
  | 'whatsapp_fab'
  | 'whatsapp_inline'
  | 'cta_join_now'
  | 'cta_membership_today'
  | 'cta_visit_gym'
  | 'join_lead_submitted'
  | 'book_trial_submitted'
  | 'plan_visit_submitted';

export type GymClientLeadEvent = { t: number; type: GymClientLeadEventType };

/** Saved when someone completes the Join now lead form (name, gym focus, phone). */
export type GymClientJoinLeadRecord = {
  t: number;
  name: string;
  phone: string;
  /** What they want to focus on (label id). */
  focus: string;
  /** How often they plan to train (label id). */
  frequency: string;
};

/** Book free trial form submissions. */
export type GymClientBookTrialRecord = {
  t: number;
  name: string;
  phone: string;
  /** Combined date + optional time for visit. */
  visitWhen: string;
  /** Comma-separated interest ids. */
  interests: string;
  notes: string;
};

/** Plan your visit form submissions (mid-page visit CTA). */
export type GymClientVisitLeadRecord = {
  t: number;
  name: string;
  phone: string;
  /** Combined date + optional time. */
  preferredWhen: string;
  notes: string;
};

export type GymClientLeadStats = {
  whatsappClicks: number;
  ctaJoinNow: number;
  ctaMembershipToday: number;
  ctaVisitGym: number;
  events: GymClientLeadEvent[];
  joinLeads: GymClientJoinLeadRecord[];
  bookTrialLeads: GymClientBookTrialRecord[];
  visitLeads: GymClientVisitLeadRecord[];
};

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function emptyStats(): GymClientLeadStats {
  return {
    whatsappClicks: 0,
    ctaJoinNow: 0,
    ctaMembershipToday: 0,
    ctaVisitGym: 0,
    events: [],
    joinLeads: [],
    bookTrialLeads: [],
    visitLeads: [],
  };
}

function coerceStats(raw: unknown): GymClientLeadStats {
  if (!raw || typeof raw !== 'object') return emptyStats();
  const o = raw as Partial<GymClientLeadStats> & {
    joinLeads?: unknown;
    bookTrialLeads?: unknown;
    visitLeads?: unknown;
  };
  const joinLeads = Array.isArray(o.joinLeads) ? (o.joinLeads as GymClientJoinLeadRecord[]).slice(-MAX_JOIN_LEADS) : [];
  const bookTrialLeads = Array.isArray(o.bookTrialLeads)
    ? (o.bookTrialLeads as GymClientBookTrialRecord[]).slice(-MAX_TRIAL_LEADS)
    : [];
  const visitLeads = Array.isArray(o.visitLeads)
    ? (o.visitLeads as GymClientVisitLeadRecord[]).slice(-MAX_VISIT_LEADS)
    : [];
  return {
    whatsappClicks: Number(o.whatsappClicks) || 0,
    ctaJoinNow: Number(o.ctaJoinNow) || 0,
    ctaMembershipToday: Number(o.ctaMembershipToday) || 0,
    ctaVisitGym: Number(o.ctaVisitGym) || 0,
    events: Array.isArray(o.events) ? o.events.slice(-MAX_EVENTS) : [],
    joinLeads,
    bookTrialLeads,
    visitLeads,
  };
}

function readAll(): Record<string, GymClientLeadStats> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, GymClientLeadStats> = {};
    for (const k of Object.keys(parsed)) {
      out[k] = coerceStats(parsed[k]);
    }
    return out;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, GymClientLeadStats>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

function pushEvent(stats: GymClientLeadStats, type: GymClientLeadEventType): GymClientLeadStats {
  const nextEvents = [...stats.events, { t: Date.now(), type }];
  if (nextEvents.length > MAX_EVENTS) {
    nextEvents.splice(0, nextEvents.length - MAX_EVENTS);
  }
  return { ...stats, events: nextEvents };
}

function updateSlug(slug: string, updater: (s: GymClientLeadStats) => GymClientLeadStats): void {
  const key = normalizeSlug(slug);
  if (!key) return;
  const all = readAll();
  const prev = coerceStats(all[key]);
  all[key] = updater(prev);
  writeAll(all);
}

/** Fire-and-forget; failures do not affect UX or localStorage. */
function syncCrystalLeadToApi(slug: string, body: CrystalPublicLeadBody): void {
  const key = normalizeSlug(slug);
  if (!key) return;
  void postCrystalPublicLead(key, body).catch(() => {
    /* backend optional until deployed */
  });
}

/** Increment WhatsApp opens (FAB or inline contact button). */
export function recordGymClientWhatsAppClick(slug: string, source: 'fab' | 'inline'): void {
  const type: GymClientLeadEventType = source === 'fab' ? 'whatsapp_fab' : 'whatsapp_inline';
  updateSlug(slug, (s) => {
    const next = pushEvent(s, type);
    return { ...next, whatsappClicks: next.whatsappClicks + 1 };
  });
  const key = normalizeSlug(slug);
  if (key) {
    syncCrystalLeadToApi(slug, {
      lead_type: 'whatsapp_click',
      business_slug: key,
      submitted_at_ms: Date.now(),
      source,
      click_count: 1,
    });
  }
}

/** Mid-page CTA strip clicks. */
export function recordGymClientLeadCta(
  slug: string,
  kind: 'cta_join_now' | 'cta_membership_today' | 'cta_visit_gym'
): void {
  updateSlug(slug, (s) => {
    const next = pushEvent(s, kind);
    if (kind === 'cta_join_now') return { ...next, ctaJoinNow: next.ctaJoinNow + 1 };
    if (kind === 'cta_membership_today') return { ...next, ctaMembershipToday: next.ctaMembershipToday + 1 };
    return { ...next, ctaVisitGym: next.ctaVisitGym + 1 };
  });
}

/** Read stats for a slug (e.g. debugging in console: getGymClientLeadStats('my-gym')). */
export function getGymClientLeadStats(slug: string): GymClientLeadStats {
  const key = normalizeSlug(slug);
  if (!key) return emptyStats();
  return coerceStats(readAll()[key]);
}

/** After Join now multi-step form — bumps `ctaJoinNow`, logs event, appends `joinLeads`. */
export function recordGymClientJoinLeadSubmission(
  slug: string,
  payload: Omit<GymClientJoinLeadRecord, 't'>
): void {
  const lead: GymClientJoinLeadRecord = { ...payload, t: Date.now() };
  updateSlug(slug, (s) => {
    const nextLeads = [...s.joinLeads, lead].slice(-MAX_JOIN_LEADS);
    let next = pushEvent(s, 'join_lead_submitted');
    next = { ...next, joinLeads: nextLeads, ctaJoinNow: next.ctaJoinNow + 1 };
    return next;
  });
  const key = normalizeSlug(slug);
  if (key) {
    syncCrystalLeadToApi(slug, {
      lead_type: 'join_now',
      business_slug: key,
      submitted_at_ms: lead.t,
      name: lead.name,
      phone: lead.phone,
      focus: lead.focus,
      frequency: lead.frequency,
    });
  }
}

export function recordGymClientBookTrialSubmission(
  slug: string,
  payload: Omit<GymClientBookTrialRecord, 't'>
): void {
  const row: GymClientBookTrialRecord = { ...payload, t: Date.now() };
  updateSlug(slug, (s) => {
    const nextTrials = [...s.bookTrialLeads, row].slice(-MAX_TRIAL_LEADS);
    return { ...pushEvent(s, 'book_trial_submitted'), bookTrialLeads: nextTrials };
  });
  const key = normalizeSlug(slug);
  if (key) {
    syncCrystalLeadToApi(slug, {
      lead_type: 'book_free_trial',
      business_slug: key,
      submitted_at_ms: row.t,
      name: row.name,
      phone: row.phone,
      visit_when: row.visitWhen,
      interests: row.interests
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
      notes: row.notes,
    });
  }
}

export function recordGymClientPlanVisitSubmission(
  slug: string,
  payload: Omit<GymClientVisitLeadRecord, 't'>
): void {
  const row: GymClientVisitLeadRecord = { ...payload, t: Date.now() };
  updateSlug(slug, (s) => {
    const nextVisits = [...s.visitLeads, row].slice(-MAX_VISIT_LEADS);
    return { ...pushEvent(s, 'plan_visit_submitted'), visitLeads: nextVisits };
  });
  const key = normalizeSlug(slug);
  if (key) {
    syncCrystalLeadToApi(slug, {
      lead_type: 'plan_visit',
      business_slug: key,
      submitted_at_ms: row.t,
      name: row.name,
      phone: row.phone,
      preferred_when: row.preferredWhen,
      notes: row.notes,
    });
  }
}
