import { useMemo, useState, useEffect } from 'react';
import { Card, Form, ButtonGroup, Button } from 'react-bootstrap';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { WebsiteAnalytics } from '../../api/businesses';
import './OverallLeadsByWebsiteChart.css';

const CHART_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#ef4444', '#84cc16'];

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
};

function formatPeriodAxisLabel(iso: string, bucket: string | undefined): string {
  try {
    const d = new Date(iso);
    if (bucket === 'hour') {
      return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso.length > 14 ? `${iso.slice(0, 13)}…` : iso;
  }
}

function safeSeriesKey(slug: string): string {
  return `ws_${slug.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

type SiteLineMeta = {
  slug: string;
  label: string;
  dataKey: string;
  color: string;
};

function buildMergedChart(
  sites: WebsiteAnalytics[],
  metric: 'events' | 'units',
  enabledSlugs: Set<string>
): { rows: Record<string, string | number>[]; meta: SiteLineMeta[]; bucket: string | undefined } {
  const withSlug = sites.filter((s) => {
    const slug = s.business?.slug?.trim();
    return Boolean(slug && enabledSlugs.has(slug));
  });
  const bucket = withSlug.find((s) => s.time_range?.bucket)?.time_range?.bucket;

  const periodSet = new Set<string>();
  for (const s of withSlug) {
    for (const p of s.line_graph ?? []) {
      if (p.period_start) periodSet.add(p.period_start);
    }
  }
  const periods = [...periodSet].sort((a, b) => a.localeCompare(b));

  const meta: SiteLineMeta[] = withSlug.map((s, i) => {
    const slug = s.business!.slug!.trim();
    return {
      slug,
      label: s.business?.name?.trim() || slug,
      dataKey: safeSeriesKey(slug),
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });

  const rows = periods.map((period_start) => {
    const row: Record<string, string | number> = {
      period_start,
      label: formatPeriodAxisLabel(period_start, bucket),
    };
    for (const s of withSlug) {
      const slug = s.business!.slug!.trim();
      const pt = s.line_graph?.find((p) => p.period_start === period_start);
      const v =
        metric === 'events' ? (pt ? Number(pt.events) || 0 : 0) : (pt ? Number(pt.units) || 0 : 0);
      row[safeSeriesKey(slug)] = v;
    }
    return row;
  });

  return { rows, meta, bucket };
}

export type OverallLeadsByWebsiteChartProps = {
  sites: WebsiteAnalytics[];
};

export function OverallLeadsByWebsiteChart({ sites }: OverallLeadsByWebsiteChartProps) {
  const siteList = useMemo(() => {
    return sites
      .map((s) => {
        const slug = s.business?.slug?.trim();
        if (!slug) return null;
        return { slug, label: s.business?.name?.trim() || slug };
      })
      .filter((x): x is { slug: string; label: string } => x != null);
  }, [sites]);

  const [enabledSlugs, setEnabledSlugs] = useState<Set<string>>(() => new Set());
  const [metric, setMetric] = useState<'events' | 'units'>('events');

  useEffect(() => {
    setEnabledSlugs(new Set(siteList.map((s) => s.slug)));
  }, [siteList]);

  const { rows, meta, bucket } = useMemo(
    () => buildMergedChart(sites, metric, enabledSlugs),
    [sites, metric, enabledSlugs]
  );

  const toggleSlug = (slug: string) => {
    setEnabledSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = () => setEnabledSlugs(new Set(siteList.map((s) => s.slug)));
  const selectNone = () => setEnabledSlugs(new Set());

  if (siteList.length === 0) return null;

  const xAxisBottom = bucket === 'hour' ? 52 : 40;
  const hasPoints = rows.length > 0 && meta.length > 0;

  return (
    <Card className="user-page__card user-page__overall-leads-chart mb-3">
      <Card.Header className="user-page__overall-leads-chart__head py-2 px-3">
        <span className="small fw-semibold text-uppercase text-muted">All websites — leads over time</span>
      </Card.Header>
      <Card.Body className="pt-3">
        <p className="text-muted small mb-3">
          Each line is one gym ({metric === 'events' ? 'lead events' : 'units'}). Use filters to compare sites.
        </p>
        <div className="user-page__overall-leads-chart__filters d-flex flex-wrap align-items-end gap-3 mb-3">
          <div>
            <Form.Label className="small text-muted mb-1 d-block">Metric</Form.Label>
            <Form.Select
              size="sm"
              style={{ minWidth: 140 }}
              value={metric}
              onChange={(e) => setMetric(e.target.value as 'events' | 'units')}
              aria-label="Chart metric"
            >
              <option value="events">Events</option>
              <option value="units">Units</option>
            </Form.Select>
          </div>
          <div className="flex-grow-1" style={{ minWidth: 200 }}>
            <Form.Label className="small text-muted mb-1 d-block">Websites</Form.Label>
            <div className="user-page__overall-leads-chart__site-toggles d-flex flex-wrap gap-2 align-items-center">
              <ButtonGroup size="sm">
                <Button variant="outline-secondary" onClick={selectAll} type="button">
                  All
                </Button>
                <Button variant="outline-secondary" onClick={selectNone} type="button">
                  None
                </Button>
              </ButtonGroup>
              {siteList.map(({ slug, label }) => (
                <Form.Check
                  key={slug}
                  type="checkbox"
                  id={`overall-leads-${slug}`}
                  className="user-page__overall-leads-chart__check small mb-0"
                  label={label}
                  checked={enabledSlugs.has(slug)}
                  onChange={() => toggleSlug(slug)}
                />
              ))}
            </div>
          </div>
        </div>
        {!hasPoints ?
          <p className="text-muted small text-center py-4 mb-0">
            {meta.length === 0 ? 'Select at least one website to plot.' : 'No time-series points for this range.'}
          </p>
        : (
          <div className="user-page__overall-leads-chart__wrap">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: xAxisBottom }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  interval="preserveStartEnd"
                  angle={rows.length > 14 ? -35 : 0}
                  textAnchor={rows.length > 14 ? 'end' : 'middle'}
                  height={rows.length > 14 ? 48 : 28}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} width={44} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ fontWeight: 600 }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {meta.map((m) => (
                  <Line
                    key={m.slug}
                    type="monotone"
                    dataKey={m.dataKey}
                    name={m.label}
                    stroke={m.color}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
