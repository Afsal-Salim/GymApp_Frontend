/**
 * Component search: title matches rank above hidden #tags / keywords; optional intent synonyms
 * approximate “what the user meant” without a server-side embedding model.
 *
 * Lightweight “semantic” tolerance: **fuzzy token match** (Levenshtein) catches common typos
 * on words ≥3 chars — no embeddings, runs fully in the browser.
 */

import type { ComponentCatalogEntry } from './websiteBuilderComponentCatalog';

/** User-facing query: strip leading # so “#hero” matches tag “hero”. */
export function normalizeSearchToken(s: string): string {
  return s.trim().toLowerCase().replace(/^#+/, '');
}

/** Split into lowercase alphanumeric words (keeps internal # stripped per token). */
function splitSearchWords(raw: string): string[] {
  return normalizeSearchToken(raw)
    .replace(/#/g, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 2);
}

function tokensFromBlockId(blockId: string): string[] {
  return blockId
    .toLowerCase()
    .replace(/^wb-/, '')
    .split(/[-_]/)
    .filter((p) => p.length > 1);
}

export type PaletteCardLike = {
  title: string;
  desc: string;
  titleLine2?: string;
  blockId?: string;
  designSystemSetId?: string;
  searchTags?: readonly string[];
};

/** Max allowed edit distance vs word length (keeps matches tight, avoids noise). */
function maxEditBudgetForWord(wordLen: number): number {
  if (wordLen < 3) return 0;
  if (wordLen <= 4) return 1;
  if (wordLen <= 8) return 2;
  return 2;
}

/** Classic Levenshtein; inputs are small (word-level) — O(nm) is fine. */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  if (m > 48 || n > 48) return Math.abs(m - n) + 1;

  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0]!;
    row[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n]!;
}

/** Best fuzzy score for one query word against many candidates (0 = no fuzzy hit). */
function fuzzyScoreForQueryWord(qw: string, candidates: readonly string[]): number {
  const budget = maxEditBudgetForWord(qw.length);
  if (budget === 0 || candidates.length === 0) return 0;

  let best = 0;
  for (const c of candidates) {
    const cw = c.length;
    if (cw < 2) continue;
    if (Math.abs(qw.length - cw) > budget) continue;
    const d = levenshteinDistance(qw, c);
    if (d === 0 || d > budget) continue;
    let tier: number;
    if (d === 1) tier = 440;
    else tier = 320;
    if (cw >= qw.length) tier += 20;
    best = Math.max(best, tier);
  }
  return best;
}

function collectFuzzyCandidateWords(e: ComponentCatalogEntry, tags: Set<string>): string[] {
  const out: string[] = [];
  const addPhrase = (s: string) => {
    out.push(...splitSearchWords(s));
  };
  addPhrase(e.title);
  addPhrase(e.description);
  for (const t of tags) addPhrase(t);
  for (const p of tokensFromBlockId(e.blockId)) out.push(p);
  return out;
}

/** Extra score from typo-tolerant token match (below exact substring matches). */
function fuzzyCatalogBoost(e: ComponentCatalogEntry, rawQuery: string, tags: Set<string>): number {
  const qWords = splitSearchWords(rawQuery);
  if (qWords.length === 0) return 0;
  const candidates = collectFuzzyCandidateWords(e, tags);
  if (candidates.length === 0) return 0;

  let total = 0;
  for (const qw of qWords) {
    if (qw.length < 3) continue;
    const hit = fuzzyScoreForQueryWord(qw, candidates);
    total += hit;
  }
  return total;
}

function collectPaletteFuzzyCandidates(card: PaletteCardLike, tagSet: Set<string>): string[] {
  const out: string[] = [];
  const add = (s: string) => out.push(...splitSearchWords(s));
  add(card.title);
  add(card.desc);
  if (card.titleLine2) add(card.titleLine2);
  if (card.designSystemSetId) add(card.designSystemSetId);
  for (const t of tagSet) add(t);
  if (card.blockId) add(card.blockId.replace(/^wb-/, '').replace(/-/g, ' '));
  return out;
}

function fuzzyPaletteBoost(card: PaletteCardLike, rawQuery: string, tagSet: Set<string>): number {
  const qWords = splitSearchWords(rawQuery);
  if (qWords.length === 0) return 0;
  const candidates = collectPaletteFuzzyCandidates(card, tagSet);
  if (candidates.length === 0) return 0;
  let total = 0;
  for (const qw of qWords) {
    if (qw.length < 3) continue;
    total += fuzzyScoreForQueryWord(qw, candidates);
  }
  return total;
}

/** Typo-tolerant match for design-system template labels (library sidebar). */
export function fuzzyDesignSystemBoost(rawQuery: string, label: string, id: string, category: string): number {
  const qWords = splitSearchWords(rawQuery);
  const candidates = [
    ...splitSearchWords(label),
    ...splitSearchWords(id),
    ...splitSearchWords(category),
  ];
  if (qWords.length === 0 || candidates.length === 0) return 0;
  let total = 0;
  for (const qw of qWords) {
    if (qw.length < 3) continue;
    total += fuzzyScoreForQueryWord(qw, candidates);
  }
  return total;
}

/** Extra hidden tags keyed by blockId (may include “#tag” or plain words). */
const EXTRA_TAGS_BY_BLOCK: Record<string, readonly string[]> = {
  'wb-cta-join': ['#signup', '#membership', 'register', 'trial', 'join', 'cta'],
  'wb-cta-trial': ['#trial', 'free', 'signup', 'book'],
  'wb-cta-visit': ['#visit', 'tour', 'book', 'schedule'],
  'wb-cta-whatsapp': ['#whatsapp', '#chat', 'wa', 'message', 'contact'],
  'wb-cta-call': ['#phone', '#call', 'tel', 'contact'],
  'wb-cta-email': ['#email', 'mailto', 'contact'],
  'wb-form-contact': ['#form', '#contact', '#enquiry', 'lead', 'message'],
  'wb-enquiry-card': ['#enquiry', '#quick', 'popup', 'lead'],
  'wb-map-location': ['#map', '#location', 'address', 'directions', 'find'],
  'wb-header-1': ['#hero', '#banner', 'header', 'intro', 'top'],
  'wb-about-1': ['#about', 'story', 'team'],
  'wb-pricing-1': ['#pricing', '#plans', 'membership', 'cost'],
  'wb-testimonial-1': ['#reviews', '#testimonials', 'trust', 'social proof'],
  'wb-nav-1': ['#nav', '#menu', 'header', 'links'],
  'wb-offers-1': ['#offer', '#promo', 'sale', 'discount'],
};

/** Query term → related intent terms (all normalized when compared). */
const INTENT_SYNONYMS: Record<string, readonly string[]> = {
  signup: ['join', 'register', 'membership', 'cta', 'trial'],
  join: ['signup', 'register', 'membership', 'cta'],
  register: ['signup', 'join', 'account'],
  contact: ['form', 'enquiry', 'email', 'message', 'lead'],
  enquiry: ['contact', 'form', 'lead', 'message', 'inquiry'],
  inquiry: ['enquiry', 'contact', 'form'],
  whatsapp: ['chat', 'wa', 'message'],
  chat: ['whatsapp', 'message'],
  map: ['location', 'address', 'directions', 'find'],
  location: ['map', 'address', 'gym'],
  hero: ['banner', 'header', 'intro', 'top'],
  banner: ['hero', 'header'],
  pricing: ['price', 'plans', 'membership', 'tiers'],
  nav: ['menu', 'navigation', 'header', 'links'],
  modal: ['popup', 'dialog', 'overlay'],
  form: ['contact', 'enquiry', 'lead'],
};

function expandIntentTerms(primary: string): Set<string> {
  const q = normalizeSearchToken(primary);
  const out = new Set<string>();
  if (q) out.add(q);
  const syn = INTENT_SYNONYMS[q];
  if (syn) {
    for (const s of syn) out.add(normalizeSearchToken(s));
  }
  return out;
}

/** Primary query + intent synonyms (for design-system / loose text match). */
export function getSearchIntentTermSet(rawQuery: string): Set<string> {
  const q = normalizeSearchToken(rawQuery);
  if (!q) return new Set();
  const out = new Set<string>([q]);
  for (const t of expandIntentTerms(q)) out.add(t);
  return out;
}

/** All searchable tags/keywords for a catalog row (hidden from UI). */
export function collectSearchTagsForCatalogEntry(e: ComponentCatalogEntry): Set<string> {
  const set = new Set<string>();
  const add = (raw: string) => {
    const t = normalizeSearchToken(raw);
    if (t.length > 0) set.add(t);
  };
  for (const t of e.searchTags ?? []) add(t);
  const extra = EXTRA_TAGS_BY_BLOCK[e.blockId];
  if (extra) for (const t of extra) add(t);
  for (const t of tokensFromBlockId(e.blockId)) add(t);
  add(e.filter);
  add(e.preview);
  return set;
}

/**
 * Higher = better match. 0 = no match (exclude from results).
 * Order intent: exact title → title prefix/contains → tag exact → tag/intent → description → blockId.
 */
export function scoreCatalogEntry(e: ComponentCatalogEntry, rawQuery: string): number {
  const q = normalizeSearchToken(rawQuery);
  if (!q) return 1;

  const title = e.title.toLowerCase();
  const desc = e.description.toLowerCase();
  const bid = e.blockId.toLowerCase();
  const tags = collectSearchTagsForCatalogEntry(e);
  const intentTerms = expandIntentTerms(q);

  let score = 0;

  if (title === q) score = Math.max(score, 1000);
  if (title.startsWith(q)) score = Math.max(score, 930);
  if (title.includes(q)) score = Math.max(score, 860);

  if (tags.has(q)) score = Math.max(score, 800);

  for (const t of tags) {
    if (t.includes(q) || q.includes(t)) score = Math.max(score, 640);
  }

  for (const term of intentTerms) {
    if (term === q) continue;
    if (tags.has(term)) score = Math.max(score, 620);
    if (title.includes(term)) score = Math.max(score, 580);
    if (desc.includes(term)) score = Math.max(score, 520);
  }

  if (desc.includes(q)) score = Math.max(score, 560);
  if (bid.includes(q)) score = Math.max(score, 520);

  const words = q.split(/\s+/).filter((w) => w.length > 1);
  if (words.length > 1) {
    let acc = 0;
    for (const w of words) {
      if (title.includes(w)) acc += 120;
      else if (desc.includes(w)) acc += 70;
      else if ([...tags].some((t) => t.includes(w) || w.includes(t))) acc += 90;
    }
    score = Math.max(score, acc);
  }

  const fuzzy = fuzzyCatalogBoost(e, rawQuery, tags);
  if (fuzzy > 0) {
    score = score > 0 ? score + Math.min(fuzzy, 260) : fuzzy;
  }

  return score;
}

/** Score palette tiles using linked catalog row tags when `blockId` is set. */
export function scorePaletteCard(card: PaletteCardLike, rawQuery: string, catalog?: ComponentCatalogEntry): number {
  const q = normalizeSearchToken(rawQuery);
  if (!q) return 1;

  const title = card.title.toLowerCase();
  const desc = card.desc.toLowerCase();
  const line2 = card.titleLine2?.toLowerCase() ?? '';
  const ds = card.designSystemSetId?.toLowerCase() ?? '';

  let score = 0;

  if (title === q) score = Math.max(score, 1000);
  if (title.startsWith(q)) score = Math.max(score, 930);
  if (title.includes(q)) score = Math.max(score, 860);
  if (line2.includes(q)) score = Math.max(score, 820);
  if (desc.includes(q)) score = Math.max(score, 560);
  if (card.blockId && card.blockId.toLowerCase().includes(q)) score = Math.max(score, 520);
  if (ds && (ds.includes(q) || q.includes(ds))) score = Math.max(score, 780);

  const tagSet = new Set<string>();
  for (const t of card.searchTags ?? []) tagSet.add(normalizeSearchToken(t));
  if (catalog) {
    for (const t of collectSearchTagsForCatalogEntry(catalog)) tagSet.add(t);
  }
  if (tagSet.has(q)) score = Math.max(score, 800);
  for (const t of tagSet) {
    if (t.includes(q) || q.includes(t)) score = Math.max(score, 640);
  }

  const intentTerms = expandIntentTerms(q);
  for (const term of intentTerms) {
    if (term === q) continue;
    if (tagSet.has(term)) score = Math.max(score, 620);
    if (title.includes(term)) score = Math.max(score, 580);
    if (desc.includes(term)) score = Math.max(score, 520);
  }

  const fuzzy = fuzzyPaletteBoost(card, rawQuery, tagSet);
  if (fuzzy > 0) {
    score = score > 0 ? score + Math.min(fuzzy, 240) : fuzzy;
  }

  return score;
}
