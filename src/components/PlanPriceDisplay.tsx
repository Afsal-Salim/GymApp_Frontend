import './PlanPriceDisplay.css';

type PlanPriceDisplayProps = {
  listFormatted: string;
  firstFormatted: string | null;
  period: string;
  /** When true and firstFormatted is set, show intro pricing with list struck through. */
  showIntro: boolean;
  size?: 'lg' | 'md';
  className?: string;
};

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
        <div className="plan-price-display__badge-row">
          <span className="plan-price-display__badge">First activation</span>
        </div>
        <div className={`plan-price-display__primary ${primaryMod}`}>
          <span className="plan-price-display__amount">{firstFormatted}</span>
          <span className="plan-price-display__period text-muted">{period}</span>
        </div>
        <div className="plan-price-display__was" aria-label={`List price ${listFormatted}`}>
          <span className="plan-price-display__strike">{listFormatted}</span>
          <span className="plan-price-display__was-label">list price</span>
        </div>
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
