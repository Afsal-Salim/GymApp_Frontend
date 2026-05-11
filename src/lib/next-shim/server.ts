/**
 * Drop-in replacement for `next/server`.
 *
 * In the SPA there are no real Route Handlers or Middleware. The few legacy `route.ts`
 * files that referenced `NextResponse` are still loaded for type-checking and (in dev only)
 * served via a small Vite middleware plugin that calls a plain `handle*()` export.
 *
 * `NextResponse.json(body, init?)` and `new NextResponse(body, init?)` both produce a value
 * shape compatible with the dev plugin's expectations.
 */

export type NextResponseInit = {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
};

export class NextResponse {
  readonly body: string;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;

  constructor(body: BodyInit | null = null, init: NextResponseInit = {}) {
    this.body = typeof body === 'string' ? body : '';
    this.status = init.status ?? 200;
    this.statusText = init.statusText ?? '';
    this.headers = init.headers ?? {};
  }

  static json(body: unknown, init: NextResponseInit = {}): NextResponse {
    return new NextResponse(JSON.stringify(body), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
    });
  }

  static next(): NextResponse {
    return new NextResponse(null);
  }

  static rewrite(url: URL | string): NextResponse {
    return new NextResponse(String(url));
  }

  static redirect(url: URL | string, status = 302): NextResponse {
    return new NextResponse(null, { status, headers: { location: String(url) } });
  }
}

/** Minimal `NextRequest`-like type for the legacy `middleware.ts` (no longer wired up at runtime). */
export interface NextRequest extends Request {
  nextUrl: URL;
}
