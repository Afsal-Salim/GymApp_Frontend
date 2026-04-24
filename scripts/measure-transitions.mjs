#!/usr/bin/env node
/**
 * Measures cold navigations + a few client-side transitions (ms).
 * Includes Navigation Timing API phases and resource entries that look like API/XHR (same-origin /api/, fetch/xhr).
 *
 * Prereqs:
 *   1) Production server: `npm run build && PORT=3000 npm run start` (or set BASE_URL).
 *   2) Browsers: `npx playwright install chromium` (once).
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3000 node scripts/measure-transitions.mjs
 *   OUT=reports/transitions/latest.json node scripts/measure-transitions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.BASE_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
const outPath = process.env.OUT ?? '';

/** Cold loads: path -> label */
const COLD_ROUTES = [
  ['/', 'home'],
  ['/login', 'login'],
  ['/signup', 'signup'],
  ['/support', 'support'],
  ['/plans', 'plans'],
  ['/services/custom', 'services_custom'],
  ['/legal/privacy', 'legal_privacy'],
  ['/user', 'user_redirects_to_login'],
  ['/forgot-password', 'forgot_password'],
  ['/404', 'not_found'],
  ['/starter', 'starter'],
];

function sumDuration(rows) {
  return rows.reduce((s, r) => s + r.durationMs, 0);
}

async function collectTimings(page) {
  return page.evaluate(() => {
    const navs = performance.getEntriesByType('navigation');
    const nav = navs[navs.length - 1];
    if (!nav || nav.entryType !== 'navigation') {
      return {
        navigation: null,
        nextRscPrefetches: [],
        sameOriginApi: [],
        otherFetchXhr: [],
        allResourceCount: 0,
      };
    }
    const n = nav;
    const navigation = {
      redirectMs: Math.round(n.redirectEnd - n.redirectStart),
      dnsMs: Math.round(n.domainLookupEnd - n.domainLookupStart),
      tcpMs: Math.round(n.connectEnd - n.connectStart),
      tlsMs:
        n.secureConnectionStart > 0 ? Math.round(n.connectEnd - Math.max(n.fetchStart, n.secureConnectionStart)) : 0,
      ttfbMs: Math.round(n.responseStart - n.requestStart),
      downloadMs: Math.round(n.responseEnd - n.responseStart),
      domInteractiveMs: Math.round(n.domInteractive - n.fetchStart),
      domContentLoadedMs: Math.round(n.domContentLoadedEventEnd - n.fetchStart),
      loadCompleteMs: Math.round(n.loadEventEnd - n.fetchStart),
      totalMs: Math.round(n.loadEventEnd - n.startTime),
    };

    const resources = performance.getEntriesByType('resource');
    const mapRow = (r) => ({
      name: r.name.length > 160 ? `${r.name.slice(0, 157)}...` : r.name,
      initiatorType: r.initiatorType,
      durationMs: Math.round(r.duration),
      startTimeMs: Math.round(r.startTime),
    });

    const nextRscPrefetches = [];
    const sameOriginApi = [];
    const otherFetchXhr = [];

    for (const r of resources) {
      const it = r.initiatorType;
      if (it !== 'fetch' && it !== 'xmlhttprequest') continue;
      let pathname = '';
      try {
        pathname = new URL(r.name).pathname;
      } catch {
        continue;
      }
      const row = mapRow(r);
      if (r.name.includes('_rsc=')) nextRscPrefetches.push(row);
      else if (pathname.startsWith('/api/')) sameOriginApi.push(row);
      else otherFetchXhr.push(row);
    }

    const sortDesc = (a, b) => b.durationMs - a.durationMs;
    nextRscPrefetches.sort(sortDesc);
    sameOriginApi.sort(sortDesc);
    otherFetchXhr.sort(sortDesc);

    return {
      navigation,
      nextRscPrefetches,
      sameOriginApi,
      otherFetchXhr,
      allResourceCount: resources.length,
    };
  });
}

async function coldNavigate(context, path) {
  const page = await context.newPage();
  try {
    const url = `${base}${path}`;
    const started = Date.now();
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    const wallClockMs = Date.now() - started;
    const status = resp?.status() ?? 0;
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    const timings = await collectTimings(page);
    return {
      path,
      requestedUrl: url,
      finalUrl: page.url(),
      httpStatus: status,
      wallClockMs,
      ...timings,
    };
  } finally {
    await page.close();
  }
}

async function clientSideTransition(context, fromPath, clickFn, urlPredicate) {
  const page = await context.newPage();
  try {
    await page.goto(`${base}${fromPath}`, { waitUntil: 'load', timeout: 60_000 });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
    const wallStart = Date.now();
    await clickFn(page);
    await page.waitForURL(urlPredicate, { timeout: 60_000 });
    await page.waitForLoadState('load');
    await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));
    const wallMs = Date.now() - wallStart;
    const timings = await collectTimings(page);
    return {
      kind: 'client_navigation',
      fromPath,
      finalUrl: page.url(),
      wallClockMs: wallMs,
      ...timings,
    };
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
  });

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: base,
    note: 'Cold navigations use a fresh page each time. wallClockMs = wall clock to load event. navigation.* = PerformanceNavigationTiming (last entry). nextRscPrefetches = App Router fetch with _rsc=; sameOriginApi = /api/* (often proxied to Django); otherFetchXhr = remaining fetch/xhr (e.g. axios to configured API host).',
    coldNavigations: [],
    clientTransitions: [],
  };

  for (const [path, label] of COLD_ROUTES) {
    try {
      const row = await coldNavigate(context, path);
      report.coldNavigations.push({ label, ...row });
      const nav = row.navigation;
      const rsc = row.nextRscPrefetches?.length ?? 0;
      const rscMs = sumDuration(row.nextRscPrefetches ?? []);
      const apiN = row.sameOriginApi?.length ?? 0;
      const apiMs = sumDuration(row.sameOriginApi ?? []);
      const oxN = row.otherFetchXhr?.length ?? 0;
      const oxMs = sumDuration(row.otherFetchXhr ?? []);
      console.log(
        `${label.padEnd(28)} wall=${String(row.wallClockMs).padStart(5)}ms  load=${nav ? String(nav.loadCompleteMs).padStart(5) : 'n/a'}ms  rsc=${rsc}(${rscMs}ms) /api=${apiN}(${apiMs}ms) fetch=${oxN}(${oxMs}ms)`,
      );
    } catch (e) {
      console.error(`${label} FAILED`, e.message);
      report.coldNavigations.push({ label, path, error: String(e) });
    }
  }

  try {
    const t1 = await clientSideTransition(context, '/', (p) => p.locator('a[href="/login"]').first().click(), /\/login/);
    report.clientTransitions.push({ label: 'home_click_login', ...t1 });
    console.log(
      `home_click_login              wall=${t1.wallClockMs}ms  load=${t1.navigation?.loadCompleteMs ?? 'n/a'}ms  rsc=${t1.nextRscPrefetches?.length ?? 0} /api=${t1.sameOriginApi?.length ?? 0}`,
    );
  } catch (e) {
    console.error('client transition FAILED', e.message);
    report.clientTransitions.push({ label: 'home_click_login', error: String(e) });
  }

  try {
    const t2 = await clientSideTransition(
      context,
      '/login',
      (p) => p.getByRole('link', { name: /sign up/i }).first().click(),
      /\/signup/,
    );
    report.clientTransitions.push({ label: 'login_click_signup', ...t2 });
    console.log(
      `login_click_signup            wall=${t2.wallClockMs}ms  load=${t2.navigation?.loadCompleteMs ?? 'n/a'}ms  rsc=${t2.nextRscPrefetches?.length ?? 0} /api=${t2.sameOriginApi?.length ?? 0}`,
    );
  } catch (e) {
    console.error('login->signup FAILED', e.message);
    report.clientTransitions.push({ label: 'login_click_signup', error: String(e) });
  }

  await browser.close();

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\nWrote ${outPath}`);
  } else {
    console.log('\n(JSON) Set OUT=reports/transitions/latest.json to save full report.)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
