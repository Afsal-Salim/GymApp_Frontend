# Apex landing page (`crystal-co.in` / `www.crystal-co.in`)

Static, self-contained HTML that lives **outside the React app**. It does two jobs:

1. **Instant client-side redirect** to `https://home.crystal-co.in/` (path, query, and hash
   are preserved, so a hit on `https://www.crystal-co.in/plans?ref=x#faq` lands the user
   on `https://home.crystal-co.in/plans?ref=x#faq`).
2. **SEO payload** — full meta tags, OpenGraph, Twitter Cards, and a JSON-LD `@graph`
   (Organization, WebSite, WebPage, SoftwareApplication, FAQPage) so search engines can
   index the apex domain with rich content even though humans never see the page.

## What's in this folder

| File           | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `index.html`   | The landing page. Inlines CSS + JS + JSON-LD; no external requests besides the redirect preconnect. |
| `robots.txt`   | Allow all crawlers; points at the sitemap below.                        |
| `sitemap.xml`  | Single canonical entry for `https://www.crystal-co.in/`.                |

The whole bundle is under ~6 KB uncompressed, so first paint is essentially TTFB. The
inline script triggers `window.location.replace(...)` while the rest of `<head>` is still
parsing, so users typically see only a brief blank flash before the React app loads.

## How the redirect works

```html
<link rel="preconnect" href="https://home.crystal-co.in" crossorigin>
<script>
  // Preserves /path?query#hash when redirecting to the app subdomain
  location.replace('https://home.crystal-co.in' + location.pathname + location.search + location.hash);
</script>
<noscript><meta http-equiv="refresh" content="0; url=https://home.crystal-co.in/"></noscript>
```

- **`preconnect`** warms the TLS + HTTP/2 connection so the navigation is instant.
- **`location.replace`** runs as soon as JS parses, doesn't push a history entry (so the
  back button skips the landing page).
- **`<noscript>` meta refresh** is the only fallback for clients without JS — covers
  ancient browsers and the small subset of crawlers that don't run JS.

## How SEO works without breaking the redirect

- The page declares **itself** as canonical (`<link rel="canonical" href="https://www.crystal-co.in/">`).
  Search engines index the apex/www URL but the actual product lives at the home subdomain.
- The full marketing copy, FAQ, and JSON-LD structured data are in the static HTML, so
  crawlers see them on first fetch — before they decide whether to execute the redirect.
- Keep the visible `<body>` copy in sync with the React homepage (`src/app/page.tsx` and
  `src/app/_components/HomeLandingJsonLd.tsx`) whenever you change H1, description, or FAQ.

## Deployment

Drop the three files at the **document root** of whatever serves `crystal-co.in` and
`www.crystal-co.in`. A few common options:

### S3 + CloudFront

```bash
aws s3 cp landing/index.html  s3://crystal-co-in-apex/index.html  --content-type text/html --cache-control "public, max-age=300"
aws s3 cp landing/robots.txt  s3://crystal-co-in-apex/robots.txt  --content-type text/plain
aws s3 cp landing/sitemap.xml s3://crystal-co-in-apex/sitemap.xml --content-type application/xml
```

### Cloudflare Pages / Netlify / Vercel (static)

Create a project pointed at this `landing/` directory; set the production domain to
`crystal-co.in` (and `www.crystal-co.in` as an alias). No build command needed.

### Plain nginx / Apache

Copy the three files into the docroot and ensure correct MIME types (`.html` →
`text/html`, `.xml` → `application/xml`). Example nginx snippet:

```nginx
server {
  server_name crystal-co.in www.crystal-co.in;
  root /var/www/crystal-co-in;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
}
```

A `try_files ... /index.html` fallback is important: any unknown path on the apex (e.g.
`/plans`) should still serve `index.html` so the inline redirect can forward the path to
the app.

### DNS / TLS

- Make sure both apex `crystal-co.in` and `www.crystal-co.in` resolve to this static host.
- `home.crystal-co.in` should point at wherever the React SPA is served.
- TLS is required for `<link rel="preconnect">` to do its job — both apex and home should
  be on the same certificate (or have HSTS).

## Updating

When the marketing pitch changes:

1. Edit the H1, description, FAQ, and JSON-LD in `index.html`.
2. Mirror the same change in `src/app/page.tsx` (title/meta) and
   `src/app/_components/HomeLandingJsonLd.tsx` (JSON-LD).
3. Redeploy `landing/` to the apex host (separate from the React build).
