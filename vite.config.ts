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
 */

function resolvedApiBase(env: Record<string, string>): string {
  return (env.VITE_API_BASE_URL ?? env.NEXT_PUBLIC_API_BASE_URL ?? '')
    .trim()
    .replace(/\/$/, '');
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

  return {
    plugins: [react()],
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
