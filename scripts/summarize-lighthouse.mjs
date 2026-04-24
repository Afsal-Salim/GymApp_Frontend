#!/usr/bin/env node
/**
 * Reads Lighthouse JSON reports under reports/lighthouse/*.json (excluding summary)
 * and writes reports/lighthouse/summary.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'reports', 'lighthouse');

function score100(c) {
  if (!c || c.score == null) return null;
  return Math.round(c.score * 100);
}

function audit(j, id) {
  const a = j.audits?.[id];
  if (!a) return null;
  return {
    id,
    title: a.title,
    displayValue: a.displayValue ?? null,
    numericValue: a.numericValue ?? null,
    numericUnit: a.numericUnit ?? null,
    score: a.score,
  };
}

const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json') && f !== 'summary.json' && !f.startsWith('summary.'))
  .filter((f) => fs.statSync(path.join(dir, f)).size > 0);

const out = {
  generatedAt: new Date().toISOString(),
  preset: 'desktop',
  note: 'Scores are Lighthouse category scores (0–100). Run against local production: PORT=3001 npm run start.',
  routes: {},
};

for (const f of files.sort()) {
  const p = path.join(dir, f);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  const key = f.replace(/\.json$/, '');
  out.routes[key] = {
    requestedUrl: j.requestedUrl,
    finalUrl: j.finalUrl,
    fetchTime: j.fetchTime,
    categories: {
      performance: score100(j.categories?.performance),
      accessibility: score100(j.categories?.accessibility),
      bestPractices: score100(j.categories?.['best-practices']),
      seo: score100(j.categories?.seo),
    },
    metrics: {
      firstContentfulPaint: audit(j, 'first-contentful-paint'),
      largestContentfulPaint: audit(j, 'largest-contentful-paint'),
      speedIndex: audit(j, 'speed-index'),
      totalBlockingTime: audit(j, 'total-blocking-time'),
      cumulativeLayoutShift: audit(j, 'cumulative-layout-shift'),
      interactive: audit(j, 'interactive'),
    },
  };
}

fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
