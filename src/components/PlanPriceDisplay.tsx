import { useEffect, useState } from 'react';
import './PlanPriceDisplay.css';

type PlanPriceDisplayProps = {
  listFormatted: string;
  firstFormatted: string | null;
  period: string;
  /** When true and firstFormatted is set, show first-activation price plus struck-through list amount (no extra label). */
  showIntro: boolean;
  size?: 'lg' | 'md';
  className?: string;
};

/** Last numeric run in a formatted price (handles ₹499, $1,234.00, etc.). */
function extractPriceParts(formatted: string): { prefix: string; value: number } | null {
  const s = formatted.trim();
  const re = /([\d,]+(?:\.\d+)?)/g;
  let m: RegExpExecArray | null;
  let last: RegExpExecArray | null = null;
  while ((m = re.exec(s)) !== null) last = m;
  if (!last) return null;
  const value = parseFloat(last[1].replace(/,/g, ''));
  if (Number.isNaN(value)) return null;
  return { prefix: s.slice(0, last.index), value };
}

function decimalPlaces(n: number): number {
  if (Math.floor(n) === n) return 0;
  const t = String(n).split('.')[1];
  return t ? t.length : 0;
}

function formatAnimatedAmount(prefix: string, n: number, maxDecimals: number): string {
  if (maxDecimals > 0) return `${prefix}${n.toFixed(maxDecimals)}`;
  return `${prefix}${Math.round(n).toLocaleString('en-IN')}`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

function IntroPriceBlock({
  listFormatted,
  firstFormatted,
  period,
  primaryMod,
}: {
  listFormatted: string;
  firstFormatted: string;
  period: string;
  primaryMod: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const listParts = extractPriceParts(listFormatted);
  const firstParts = extractPriceParts(firstFormatted);
  const prefixMatch =
    listParts &&
    firstParts &&
    listParts.prefix.replace(/\s/g, '') === firstParts.prefix.replace(/\s/g, '');
  const canAnimate =
    Boolean(listParts && firstParts && prefixMatch && listParts.value > firstParts.value);

  const from = listParts?.value ?? 0;
  const to = firstParts?.value ?? 0;
  const maxDecimals = Math.max(decimalPlaces(from), decimalPlaces(to));
  const prefix = firstParts?.prefix ?? listParts?.prefix ?? '';

  const [display, setDisplay] = useState(() =>
    canAnimate && !reducedMotion ? from : to
  );
  const [land, setLand] = useState(false);

  useEffect(() => {
    if (!canAnimate || reducedMotion) {
      setDisplay(to);
      return;
    }

    setLand(false);
    const durationMs = 1300;
    const start = performance.now();
    let raf = 0;
    const easeOut = (t: number) => 1 - (1 - t) ** 3;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = easeOut(t);
      const v = from + (to - from) * eased;
      const next =
        maxDecimals > 0 ? Math.round(v * 10 ** maxDecimals) / 10 ** maxDecimals : Math.round(v);
      setDisplay(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(to);
        setLand(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canAnimate, reducedMotion, from, to, maxDecimals, listFormatted, firstFormatted]);

  const amountShown =
    canAnimate && !reducedMotion ?
      formatAnimatedAmount(prefix, display, maxDecimals)
    : firstFormatted;

  return (
    <>
      <div className="plan-price-display__badge-row">
        <span className="plan-price-display__badge">First activation</span>
      </div>
      <div className={`plan-price-display__primary ${primaryMod}`}>
        <span
          className={`plan-price-display__amount ${land ? 'plan-price-display__amount--land' : ''}`}
          aria-live={canAnimate && !reducedMotion ? 'polite' : undefined}
        >
          {amountShown}
        </span>
        <span className="plan-price-display__period text-muted">{period}</span>
      </div>
      <div className="plan-price-display__was" aria-label={`Was ${listFormatted}`}>
        <span className="plan-price-display__strike">{listFormatted}</span>
      </div>
    </>
  );
}

export function PlanPriceDisplay({
  listFormatted,
  firstFormatted,
  period,
  showIntro,
  size = 'md',
  className = '',
}: PlanPriceDisplayProps) {
  const primaryMod = size === 'lg' ? 'plan-price-display__primary--lg' : 'plan-price-display__primary--md';
  if (showIntro && firstFormatted) {
    return (
      <div className={`plan-price-display ${className}`.trim()}>
        <IntroPriceBlock
          key={`${listFormatted}__${firstFormatted}`}
          listFormatted={listFormatted}
          firstFormatted={firstFormatted}
          period={period}
          primaryMod={primaryMod}
        />
      </div>
    );
  }
  return (
    <div className={`plan-price-display ${className}`.trim()}>
      <div className={`plan-price-display__primary ${primaryMod}`}>
        <span className="plan-price-display__amount">{listFormatted}</span>
        <span className="plan-price-display__period text-muted">{period}</span>
      </div>
    </div>
  );
}
