/**
 * Google Maps “Share” / place / directions URLs are not meant to be used as iframe `src`.
 * They often redirect inside the frame (e.g. to a generic city view). This helper turns
 * common URL shapes into the classic embed form:
 * `https://maps.google.com/maps?q=…&z=…&output=embed`
 *
 * Short links (`maps.app.goo.gl`, `goo.gl/…`) cannot be expanded without a server redirect;
 * those are returned unchanged — use “Embed a map” from Google Maps for a guaranteed `…/maps/embed?pb=…` URL.
 */

function withHttps(url: string): string {
  const t = url.trim();
  if (!t) return t;
  if (t.startsWith('//')) return `https:${t}`;
  if (!/^https?:/i.test(t)) return `https://${t}`;
  return t;
}

/** True if this string is likely a Google Maps URL we can try to normalize. */
export function looksLikeGoogleMapsUrl(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  return (
    s.includes('google.com/maps') ||
    s.includes('maps.google.com') ||
    s.includes('maps.app.goo.gl') ||
    s.includes('goo.gl/maps')
  );
}

/**
 * Returns an embed-friendly Maps URL when the pattern is recognized; otherwise returns `raw` trimmed.
 */
export function normalizeGoogleMapsIframeSrc(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const lower = trimmed.toLowerCase();
  if (!looksLikeGoogleMapsUrl(trimmed)) {
    return trimmed;
  }

  /* Already an embed URL — only ensure scheme. */
  if (lower.includes('/maps/embed') || lower.includes('output=embed')) {
    return withHttps(trimmed);
  }

  let u: URL;
  try {
    u = new URL(withHttps(trimmed));
  } catch {
    return trimmed;
  }

  const path = u.pathname + (u.search || '');

  /* ?ll=lat,lng (and optional z=) */
  const ll = u.searchParams.get('ll');
  if (ll) {
    const parts = ll.split(',').map((p) => p.trim());
    if (parts.length >= 2 && /^-?\d/.test(parts[0]!) && /^-?\d/.test(parts[1]!)) {
      const z = u.searchParams.get('z') || u.searchParams.get('zoom') || '14';
      return `https://maps.google.com/maps?q=${encodeURIComponent(`${parts[0]},${parts[1]}`)}&z=${z}&output=embed`;
    }
  }

  /* ?q=… without embed */
  const qParam = u.searchParams.get('q');
  if (qParam && /google\.com$/i.test(u.hostname.replace(/^www\./, '')) && u.pathname.includes('/maps')) {
    const z = u.searchParams.get('z') || u.searchParams.get('zoom') || '14';
    return `https://maps.google.com/maps?q=${encodeURIComponent(qParam)}&z=${z}&output=embed`;
  }

  /* Path contains @lat,lng,zoom (standard place / view URLs) */
  const at = path.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?)z)?/i);
  if (at) {
    const lat = at[1];
    const lng = at[2];
    const z = at[3] ? String(Math.min(21, Math.max(1, Math.round(Number(at[3]))))) : '15';
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${z}&output=embed`;
  }

  /* !3dLAT!4dLNG fragment (some share URLs) */
  const m3d = path.match(/!3d(-?\d+(?:\.\d+)?)/);
  const m4d = path.match(/!4d(-?\d+(?:\.\d+)?)/);
  if (m3d && m4d) {
    const lat = m3d[1];
    const lng = m4d[1];
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  }

  /* /maps/place/Name+Encoded — geocode by name (works when no coords in URL) */
  const place = u.pathname.match(/\/maps\/place\/([^/]+)/);
  if (place) {
    let name = place[1];
    try {
      name = decodeURIComponent(name.replace(/\+/g, ' '));
    } catch {
      /* keep encoded */
    }
    if (name.length > 1) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&z=15&output=embed`;
    }
  }

  return trimmed;
}
