/**
 * Reduce injected GrapesJS canvas CSS to rules that match the current page HTML
 * (used by the "Current page code" modal — not full export).
 */

const PSEUDO_ELEMENT_RE = /::[\w-]+(\([^)]*\))?/g;

/** State / interaction pseudos we strip from the end so `querySelector` can still match. */
const TRAILING_STATE_PSEUDO_RE =
  /:(?:hover|active|focus(?:-visible|-within)?|visited|link|any-link|target(?:-within)?|enabled|disabled|checked|indeterminate|default|optional|required|valid|invalid|user-invalid|in-range|out-of-range|read-only|read-write|placeholder-shown|autofill|popover-open|modal|fullscreen|picture-in-picture)(?:\([^)]*\))?$/i;

const ANIMATION_NAME_RE = /\banimation-name\s*:\s*([^;}\n]+)/gi;

const ANIMATION_SHORTHAND_RE = /\banimation\s*:\s*([^;}\n]+)/gi;

const ANIM_KEYWORDS = new Set(
  [
    'none',
    'auto',
    'inherit',
    'initial',
    'unset',
    'revert',
    'revert-layer',
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'step-start',
    'step-end',
    'infinite',
    'alternate',
    'alternate-reverse',
    'normal',
    'reverse',
    'forwards',
    'backwards',
    'both',
    'running',
    'paused',
  ].map((s) => s.toLowerCase()),
);

function parsePageDocument(pageHtml: string): Document {
  const trimmed = pageHtml.trim();
  if (!trimmed) {
    return new DOMParser().parseFromString(
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>',
      'text/html',
    );
  }
  if (/^\s*<!DOCTYPE/i.test(trimmed) || /<\s*html[\s>]/i.test(trimmed)) {
    return new DOMParser().parseFromString(trimmed, 'text/html');
  }
  const wrapped = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${pageHtml}</body></html>`;
  return new DOMParser().parseFromString(wrapped, 'text/html');
}

/** Split a selector list on commas, respecting strings and brackets. */
function splitSelectorList(selectorText: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: "'" | '"' | null = null;
  let buf = '';
  for (let i = 0; i < selectorText.length; i++) {
    const c = selectorText[i]!;
    if (quote) {
      buf += c;
      if (c === quote && selectorText[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      buf += c;
      continue;
    }
    if (c === '(' || c === '[') depth++;
    if ((c === ')' || c === ']') && depth > 0) depth--;
    if (c === ',' && depth === 0) {
      const t = buf.trim();
      if (t) parts.push(t);
      buf = '';
      continue;
    }
    buf += c;
  }
  const t = buf.trim();
  if (t) parts.push(t);
  return parts;
}

function selectorVariantsForMatch(sel: string): string[] {
  const out: string[] = [];
  let s = sel.replace(PSEUDO_ELEMENT_RE, '').trim();
  for (let guard = 0; guard < 32 && s; guard++) {
    out.push(s);
    const next = s.replace(TRAILING_STATE_PSEUDO_RE, '').trim();
    if (next === s) break;
    s = next;
  }
  return out;
}

function selectorMatchesDocument(doc: Document, selectorText: string): boolean {
  for (const part of splitSelectorList(selectorText)) {
    for (const variant of selectorVariantsForMatch(part)) {
      try {
        if (doc.querySelector(variant)) return true;
      } catch {
        return true;
      }
    }
  }
  return false;
}

function styleRuleUsed(rule: CSSStyleRule, doc: Document): boolean {
  return selectorMatchesDocument(doc, rule.selectorText);
}

function wrapGroupingFiltered(rule: CSSGroupingRule, inner: string[]): string | null {
  if (!inner.length) return null;
  const full = rule.cssText;
  const open = full.indexOf('{');
  if (open === -1) return inner.join('\n\n');
  const prelude = full.slice(0, open).trimEnd();
  return `${prelude} {\n${inner.join('\n\n')}\n}`;
}

function filterRuleList(rules: CSSRuleList, doc: Document, out: string[]): void {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]!;
    if (rule instanceof CSSKeyframesRule) continue;
    if (rule instanceof CSSStyleRule) {
      if (styleRuleUsed(rule, doc)) out.push(rule.cssText);
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      const inner: string[] = [];
      filterRuleList(rule.cssRules, doc, inner);
      const wrapped = wrapGroupingFiltered(rule, inner);
      if (wrapped) out.push(wrapped);
    } else if (rule instanceof CSSLayerBlockRule) {
      const inner: string[] = [];
      filterRuleList(rule.cssRules, doc, inner);
      const wrapped = wrapGroupingFiltered(rule, inner);
      if (wrapped) out.push(wrapped);
    } else if (rule instanceof CSSLayerStatementRule) {
      out.push(rule.cssText);
    } else if (typeof CSSContainerRule !== 'undefined' && rule instanceof CSSContainerRule) {
      const inner: string[] = [];
      filterRuleList(rule.cssRules, doc, inner);
      const wrapped = wrapGroupingFiltered(rule, inner);
      if (wrapped) out.push(wrapped);
    } else if (typeof CSSStartingStyleRule !== 'undefined' && rule instanceof CSSStartingStyleRule) {
      const inner: string[] = [];
      filterRuleList(rule.cssRules, doc, inner);
      const wrapped = wrapGroupingFiltered(rule, inner);
      if (wrapped) out.push(wrapped);
    } else if (typeof CSSScopeRule !== 'undefined' && rule instanceof CSSScopeRule) {
      const inner: string[] = [];
      filterRuleList(rule.cssRules, doc, inner);
      const wrapped = wrapGroupingFiltered(rule, inner);
      if (wrapped) out.push(wrapped);
    } else if (rule instanceof CSSGroupingRule && !(rule instanceof CSSKeyframesRule)) {
      const inner: string[] = [];
      filterRuleList(rule.cssRules, doc, inner);
      const wrapped = wrapGroupingFiltered(rule, inner);
      if (wrapped) out.push(wrapped);
    } else if (rule instanceof CSSFontFaceRule) {
      continue;
    } else {
      out.push(rule.cssText);
    }
  }
}

function findMatchingCloseBrace(css: string, openBraceIndex: number): number {
  let depth = 0;
  for (let i = openBraceIndex; i < css.length; i++) {
    const c = css[i]!;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractKeyframeBlocks(css: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /@keyframes\s+(["']?)([\w-]+)\1\s*\{/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const name = m[2]!;
    const braceOpen = m.index + m[0].length - 1;
    const close = findMatchingCloseBrace(css, braceOpen);
    if (close === -1) continue;
    map.set(name, css.slice(m.index, close + 1));
  }
  return map;
}

function collectAnimationNames(css: string): Set<string> {
  const names = new Set<string>();
  let m: RegExpExecArray | null;
  ANIMATION_NAME_RE.lastIndex = 0;
  while ((m = ANIMATION_NAME_RE.exec(css)) !== null) {
    for (const part of m[1]!.split(',')) {
      const tok = part.trim().replace(/^["']|["']$/g, '');
      if (tok && tok.toLowerCase() !== 'none') names.add(tok);
    }
  }
  ANIMATION_SHORTHAND_RE.lastIndex = 0;
  while ((m = ANIMATION_SHORTHAND_RE.exec(css)) !== null) {
    const raw = m[1]!.trim();
    for (const group of raw.split(',')) {
      const tokens = group
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      for (const t of tokens) {
        const lower = t.toLowerCase();
        if (ANIM_KEYWORDS.has(lower)) continue;
        if (/^\d/.test(t)) continue;
        if (/^[\d.]+m?s$/i.test(t)) continue;
        if (/^[\d.]+$/i.test(t)) continue;
        if (/^cubic-bezier\(/i.test(t)) continue;
        if (/^steps\(/i.test(t)) continue;
        if (/^[\w-]+$/.test(t)) names.add(t);
      }
    }
  }
  return names;
}

function appendUsedKeyframes(fullCss: string, filteredCss: string): string {
  const blocks = extractKeyframeBlocks(fullCss);
  if (!blocks.size) return filteredCss;
  const needed = collectAnimationNames(filteredCss);
  const extra: string[] = [];
  for (const name of needed) {
    const block = blocks.get(name);
    if (block) extra.push(block);
  }
  if (!extra.length) return filteredCss;
  return `${filteredCss.trimEnd()}\n\n${extra.join('\n\n')}\n`;
}

/**
 * Returns CSS rules from `fullCss` whose selectors match at least one node in `pageHtml`,
 * plus `@font-face` / `@import` / `@layer` statements and any `@keyframes` referenced by kept rules.
 */
export function filterCssUsedByPageHtml(pageHtml: string, fullCss: string): string {
  const trimmed = fullCss.trim();
  if (!trimmed) return '';

  const doc = parsePageDocument(pageHtml);
  const sheet = new CSSStyleSheet();
  try {
    sheet.replaceSync(trimmed);
  } catch {
    return trimmed;
  }

  const kept: string[] = [];
  filterRuleList(sheet.cssRules, doc, kept);
  let result = kept.join('\n\n').trim();

  if (result) result = appendUsedKeyframes(trimmed, result);

  return result.trim();
}
