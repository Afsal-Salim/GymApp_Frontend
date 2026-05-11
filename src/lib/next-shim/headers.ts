/**
 * Drop-in replacement for `next/headers`.
 *
 * In a client-only SPA there is no incoming request. We expose a stub `Headers` instance whose
 * `host` is derived from `window.location` so callers like `headers().get('host')` keep working.
 */

class ClientHeaders {
  private map: Record<string, string>;

  constructor() {
    const host = typeof window !== 'undefined' ? window.location.host : '';
    this.map = { host };
  }

  get(name: string): string | null {
    return this.map[name.toLowerCase()] ?? null;
  }
}

export async function headers(): Promise<ClientHeaders> {
  return new ClientHeaders();
}

export async function cookies(): Promise<{
  get: (name: string) => { name: string; value: string } | undefined;
  getAll: () => Array<{ name: string; value: string }>;
}> {
  const parse = (): Array<{ name: string; value: string }> => {
    if (typeof document === 'undefined') return [];
    return document.cookie
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const i = p.indexOf('=');
        return i < 0
          ? { name: p, value: '' }
          : { name: p.slice(0, i), value: decodeURIComponent(p.slice(i + 1)) };
      });
  };
  return {
    get: (name) => parse().find((c) => c.name === name),
    getAll: parse,
  };
}

export async function draftMode(): Promise<{ isEnabled: boolean; enable: () => void; disable: () => void }> {
  return { isEnabled: false, enable: () => {}, disable: () => {} };
}
