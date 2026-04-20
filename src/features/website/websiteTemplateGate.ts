import type { ProWebsiteTemplateKey } from '../crystal/gymClientSiteContent';

export const SESSION_CRYSTAL_TEMPLATE_STEP_CREATE_OK = 'crystal_template_step_create_ok_v1';
export const SESSION_CRYSTAL_TEMPLATE_STEP_EDIT_SLUG = 'crystal_template_step_edit_slug_v1';
export const SESSION_CRYSTAL_PENDING_PRO_TEMPLATE_KEY = 'crystal_pending_pro_template_key_v1';
export const SESSION_CRYSTAL_TEMPLATE_SELECT_INITIAL = 'crystal_template_select_initial_v1';

const PRO_KEYS = new Set<string>(['autopilot', 'fitcore', 'sonicflow', 'vital', 'sole', 'zen']);

export type PendingProTemplateKey = '' | ProWebsiteTemplateKey;

function isProKey(s: string): s is ProWebsiteTemplateKey {
  return PRO_KEYS.has(s);
}

export function setPendingProTemplateKey(key: PendingProTemplateKey): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_CRYSTAL_PENDING_PRO_TEMPLATE_KEY, JSON.stringify(key));
}

/** Returns parsed key and clears storage. */
export function consumePendingProTemplateKey(): PendingProTemplateKey | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SESSION_CRYSTAL_PENDING_PRO_TEMPLATE_KEY);
  if (raw == null) return null;
  sessionStorage.removeItem(SESSION_CRYSTAL_PENDING_PRO_TEMPLATE_KEY);
  try {
    const p = JSON.parse(raw) as unknown;
    if (p === '' || p === null) return '';
    if (typeof p === 'string' && isProKey(p)) return p;
    return null;
  } catch {
    return null;
  }
}

export function grantCreateTemplateGate(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_CRYSTAL_TEMPLATE_STEP_CREATE_OK, '1');
}

export function grantEditTemplateGate(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_CRYSTAL_TEMPLATE_STEP_EDIT_SLUG, slug.trim().toLowerCase());
}

export function isCreateTemplateGateOk(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_CRYSTAL_TEMPLATE_STEP_CREATE_OK) === '1';
}

export function isEditTemplateGateOk(slug: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_CRYSTAL_TEMPLATE_STEP_EDIT_SLUG) === slug.trim().toLowerCase();
}

/** Call when opening the builder from preview (`?fromPreview=1`) so the template step is not enforced. */
export function grantTemplateGateFromPreview(isEdit: boolean, slug?: string): void {
  if (typeof window === 'undefined') return;
  if (!isEdit) grantCreateTemplateGate();
  else if (slug?.trim()) grantEditTemplateGate(slug);
}

/** Before navigating to the standalone template picker from the builder (pre-select current choice). */
export function stashInitialTemplateForSelectPage(key: PendingProTemplateKey): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_CRYSTAL_TEMPLATE_SELECT_INITIAL, JSON.stringify(key));
}

export function consumeInitialTemplateForSelectPage(): PendingProTemplateKey | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SESSION_CRYSTAL_TEMPLATE_SELECT_INITIAL);
  if (raw == null) return null;
  sessionStorage.removeItem(SESSION_CRYSTAL_TEMPLATE_SELECT_INITIAL);
  try {
    const p = JSON.parse(raw) as unknown;
    if (p === '' || p === null) return '';
    if (typeof p === 'string' && isProKey(p)) return p;
    return null;
  } catch {
    return null;
  }
}
