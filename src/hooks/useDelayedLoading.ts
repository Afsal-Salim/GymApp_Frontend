import { useEffect, useState } from 'react';

/**
 * Returns true only after `isLoading` has stayed true for `delayMs`, so fast requests never flash a spinner.
 * Resets immediately when loading ends.
 */
export function useDelayedLoading(isLoading: boolean, delayMs: number): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      setShow(false);
      return;
    }
    const id = window.setTimeout(() => setShow(true), delayMs);
    return () => window.clearTimeout(id);
  }, [isLoading, delayMs]);
  return show;
}
