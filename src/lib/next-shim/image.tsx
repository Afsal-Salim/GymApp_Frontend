/* eslint-disable @typescript-eslint/no-unused-vars -- Next.js props accepted then ignored. */
/**
 * Drop-in replacement for `next/image` that renders a plain `<img>`.
 *
 * Accepts both string sources and Vite's static-imported `{ src, width?, height? }` shape
 * (so existing `import logo from '@/assets/logo.svg'` keeps working without code changes).
 * `priority`, `quality`, `placeholder`, `unoptimized`, `loader`, `fill` etc. are silently ignored.
 */
import { forwardRef, type ImgHTMLAttributes } from 'react';

type StaticImageData = { src: string; width?: number; height?: number; blurDataURL?: string };

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'loading'> {
  src: string | StaticImageData;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | `data:image/${string}`;
  blurDataURL?: string;
  unoptimized?: boolean;
  loading?: 'eager' | 'lazy';
  loader?: (...args: unknown[]) => string;
  onLoadingComplete?: (img: HTMLImageElement) => void;
}

function resolveSrc(src: string | StaticImageData): string {
  if (typeof src === 'string') return src;
  return src.src;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    width,
    height,
    fill,
    sizes: _sizes,
    quality: _quality,
    priority,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    unoptimized: _unoptimized,
    loading,
    loader: _loader,
    onLoadingComplete,
    style,
    onLoad,
    ...rest
  },
  ref,
) {
  const resolvedSrc = resolveSrc(src);
  const computedLoading = loading ?? (priority ? 'eager' : 'lazy');
  const fillStyle = fill
    ? { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', objectFit: 'cover' as const, ...style }
    : style;

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : (width as number | undefined)}
      height={fill ? undefined : (height as number | undefined)}
      loading={computedLoading}
      decoding="async"
      style={fillStyle}
      onLoad={(event) => {
        onLoad?.(event);
        onLoadingComplete?.(event.currentTarget);
      }}
      {...rest}
    />
  );
});

export default Image;
export type { StaticImageData };
