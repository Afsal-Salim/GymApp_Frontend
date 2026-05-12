import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config for the Crystal frontend. The app was migrated from Next.js (App Router) to a Vite + React SPA.
 *
 * - `@` path alias mirrors the old `tsconfig.paths` mapping.
 * - `next/*` import specifiers are remapped onto local shims under `src/lib/next-shim/`,
 *   so existing source files that still write `import Link from 'next/link'` continue to work
 *   without touching every file.
 * - `/api/*` dev proxy preserves the old `next.config.ts` `rewrites()` behaviour so the
 *   frontend can keep calling `/api/...` and hit Django on a separate port without CORS.
 * - **Env vars**: instead of relying on Vite's default `VITE_*` prefix, we explicitly whitelist
 *   the public keys in `PUBLIC_ENV_KEYS` below and inline them via `define` as
 *   `import.meta.env.<KEY>`. The `.env` file therefore uses plain names (e.g. `API_BASE_URL`).
 *   Anything not in the whitelist (e.g. `ADMIN`) stays server-side.
 */

/**
 * Keys from `.env` that get exposed to the browser bundle.
 * Add a key here AND declare it on `ImportMetaEnv` in `env.d.ts` before reading it from app code.
 */
const PUBLIC_ENV_KEYS = [
  'API_BASE_URL',
  'PUBLIC_SITE_DOMAIN',
  'SITE_URL',
  'BASE_PATH',
  'HOMEPAGE_TUTORIAL_VIDEO_URL',
  'GOOGLE_CLIENT_ID',
  'CONTACT_EMAIL',
  'CONTACT_PHONE',
  'CONTACT_PHONE_TEL',
  'WHATSAPP_PHONE',
  'WHATSAPP_MESSAGE',
  'MARKETING_ENQUIRY_PATH',
  'SERVICE_ENQUIRY_PATH',
  'BUSINESS_IMAGE_FILE_SEGMENT',
  'BUSINESS_IMAGE_USE_API_FILE',
] as const;

function resolvedApiBase(env: Record<string, string>): string {
  return (env.API_BASE_URL ?? '').trim().replace(/\/$/, '');
}

function shouldEnableApiProxy(base: string, devPort: number): boolean {
  if (!base) return false;
  try {
    const u = new URL(base.endsWith('/') ? base : `${base}/`);
    const port = Number(u.port || (u.protocol === 'https:' ? 443 : 80));
    const isThisDev =
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1') && port === devPort;
    return !isThisDev;
  } catch {
    return false;
  }
}

const NEXT_SHIM_DIR = path.resolve(__dirname, './src/lib/next-shim');

const nextShimAliases = [
  { find: /^next\/link$/, replacement: path.join(NEXT_SHIM_DIR, 'link') },
  { find: /^next\/image$/, replacement: path.join(NEXT_SHIM_DIR, 'image') },
  { find: /^next\/script$/, replacement: path.join(NEXT_SHIM_DIR, 'script') },
  { find: /^next\/dynamic$/, replacement: path.join(NEXT_SHIM_DIR, 'dynamic') },
  { find: /^next\/navigation$/, replacement: path.join(NEXT_SHIM_DIR, 'navigation') },
  { find: /^next\/headers$/, replacement: path.join(NEXT_SHIM_DIR, 'headers') },
  { find: /^next\/server$/, replacement: path.join(NEXT_SHIM_DIR, 'server') },
  { find: /^next\/font\/google$/, replacement: path.join(NEXT_SHIM_DIR, 'font') },
  { find: /^next\/font\/local$/, replacement: path.join(NEXT_SHIM_DIR, 'font') },
  { find: /^next$/, replacement: path.join(NEXT_SHIM_DIR, 'types') },
];

const DEV_PORT = 3000;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiBase = resolvedApiBase(env);
  const useProxy = shouldEnableApiProxy(apiBase, DEV_PORT);

  /**
   * Vite's `define` performs literal text replacement at build time. Each whitelisted key gets
   * its current value baked into the bundle wherever `import.meta.env.<KEY>` appears in source.
   */
  const publicEnvDefines: Record<string, string> = {};
  for (const key of PUBLIC_ENV_KEYS) {
    publicEnvDefines[`import.meta.env.${key}`] = JSON.stringify(env[key] ?? '');
  }

  return {
    plugins: [react()],
    define: publicEnvDefines,
    server: {
      port: DEV_PORT,
      proxy: useProxy
        ? {
            '/api': {
              target: apiBase.replace(/\/api$/, ''),
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    preview: {
      port: DEV_PORT,
    },
    resolve: {
      alias: [
        ...nextShimAliases,
        { find: '@', replacement: path.resolve(__dirname, './src') },
      ],
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
