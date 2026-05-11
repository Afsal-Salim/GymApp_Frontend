/* eslint-disable @typescript-eslint/no-unused-vars -- Next.js props accepted then ignored. */
/**
 * Drop-in replacement for `next/script` that uses a `useEffect` to attach a `<script>` tag.
 *
 * Notes:
 * - `strategy` (`beforeInteractive` / `afterInteractive` / `lazyOnload` / `worker`) is ignored.
 *   Scripts are appended once on mount and removed on unmount.
 * - Inline scripts via `children` or `dangerouslySetInnerHTML` are supported.
 */
import { useEffect, type ReactNode } from 'react';

export interface ScriptProps {
  id?: string;
  src?: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
  type?: string;
  async?: boolean;
  defer?: boolean;
  noModule?: boolean;
  nonce?: string;
  crossOrigin?: string;
  referrerPolicy?: string;
  onLoad?: (event: Event) => void;
  onReady?: () => void;
  onError?: (event: Event | string) => void;
  dangerouslySetInnerHTML?: { __html: string };
  children?: ReactNode;
}

export default function Script({
  id,
  src,
  strategy: _strategy,
  type,
  async,
  defer,
  noModule,
  nonce,
  crossOrigin,
  referrerPolicy,
  onLoad,
  onReady,
  onError,
  dangerouslySetInnerHTML,
  children,
}: ScriptProps) {
  useEffect(() => {
    if (id && document.getElementById(id)) {
      onReady?.();
      return;
    }
    const el = document.createElement('script');
    if (id) el.id = id;
    if (type) el.type = type;
    if (async) el.async = true;
    if (defer) el.defer = true;
    if (noModule) el.noModule = true;
    if (nonce) el.nonce = nonce;
    if (crossOrigin) el.crossOrigin = crossOrigin;
    if (referrerPolicy) el.referrerPolicy = referrerPolicy;

    if (src) {
      el.src = src;
      if (onLoad) el.addEventListener('load', onLoad);
      if (onError) el.addEventListener('error', onError);
    } else {
      const inline =
        (dangerouslySetInnerHTML ? dangerouslySetInnerHTML.__html : null) ??
        (typeof children === 'string' ? children : null);
      if (inline) {
        el.text = inline;
      }
    }

    document.head.appendChild(el);
    onReady?.();
    return () => {
      el.remove();
    };
  }, [src, id, type, async, defer, noModule, nonce, crossOrigin, referrerPolicy, dangerouslySetInnerHTML, children, onLoad, onReady, onError]);

  return null;
}
