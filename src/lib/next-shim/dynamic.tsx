/**
 * Drop-in replacement for `next/dynamic` backed by `React.lazy` + `Suspense`.
 *
 * Usage parity:
 * - `dynamic(() => import('./X'))` returns a component that auto-suspends.
 * - `dynamic(() => import('./X'), { loading: () => <Spinner /> })` uses the loader as fallback.
 * - `ssr: false` is accepted and effectively a no-op (this is a SPA build).
 *
 * The loader callback can return either a module with a `default` export OR a component value
 * directly (mirrors Next.js).
 */
import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';

export interface DynamicOptions<TProps = unknown> {
  loading?: () => ReactNode;
  ssr?: boolean;
  suspense?: boolean;
  /** Some Next callers pass `{ Component }` as a shape; not supported here. */
  loadableGenerated?: unknown;
  __props?: TProps;
}

type Importer<TProps> = () => Promise<ComponentType<TProps> | { default: ComponentType<TProps> }>;

export default function dynamic<TProps = Record<string, unknown>>(
  loader: Importer<TProps>,
  options: DynamicOptions<TProps> = {},
): ComponentType<TProps> {
  const Lazy = lazy(async () => {
    const mod = await loader();
    if (mod && typeof mod === 'object' && 'default' in mod) {
      return mod as { default: ComponentType<TProps> };
    }
    return { default: mod as ComponentType<TProps> };
  });

  const Loading = options.loading;

  function Dynamic(props: TProps) {
    return (
      <Suspense fallback={Loading ? Loading() : null}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Lazy {...(props as any)} />
      </Suspense>
    );
  }
  Dynamic.displayName = 'NextDynamic';
  return Dynamic as ComponentType<TProps>;
}
