/* eslint-disable @typescript-eslint/no-unused-vars -- Next.js props accepted then ignored. */
/**
 * Drop-in replacement for `next/link` backed by `react-router-dom`.
 *
 * Behavioural notes:
 * - `href` is treated like RR's `to`. Absolute URLs (with scheme) and pure hash links
 *   are rendered as `<a>` so React Router doesn't try to navigate inside the app.
 * - `prefetch`, `scroll`, `replace`, `shallow`, `legacyBehavior`, `passHref`, `locale`
 *   are accepted but only `replace` is honoured.
 */
import { forwardRef, type AnchorHTMLAttributes, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export type LinkHref = string | { pathname?: string; query?: Record<string, string | number | undefined>; hash?: string };

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: LinkHref;
  as?: string;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean | null;
  locale?: string | false;
  legacyBehavior?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

function stringifyHref(href: LinkHref): string {
  if (typeof href === 'string') return href;
  const path = href.pathname ?? '';
  const query = href.query
    ? `?${new URLSearchParams(
        Object.entries(href.query)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()}`
    : '';
  const hash = href.hash ? (href.hash.startsWith('#') ? href.hash : `#${href.hash}`) : '';
  return `${path}${query}${hash}`;
}

function isExternalOrHashOrSpecial(href: string): boolean {
  if (!href) return true;
  if (href.startsWith('#')) return true;
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('whatsapp:')) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return true;
  return false;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, as: _as, replace, scroll: _scroll, shallow: _shallow, passHref: _passHref, prefetch: _prefetch, locale: _locale, legacyBehavior: _legacyBehavior, onClick, children, ...rest },
  ref,
) {
  const stringHref = stringifyHref(href);

  if (isExternalOrHashOrSpecial(stringHref)) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
    };
    return (
      <a ref={ref} href={stringHref} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const linkExtras = rest as any;
  return (
    <RouterLink
      ref={ref}
      to={stringHref}
      replace={replace}
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      onClick={onClick as any}
      {...linkExtras}
    >
      {children}
    </RouterLink>
  );
});

export default Link;
