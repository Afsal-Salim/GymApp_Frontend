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
} from 'recharts';
import type { WebsiteAnalytics } from '../../api/businesses';
import './OverallLeadsByWebsiteChart.css';

const CHART_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#ef4444', '#84cc16'];

const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.1)',
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

function sitePickerEntries(sites: WebsiteAnalytics[]): { slug: string; label: string }[] {
  const rows = sites
    .map((s) => {
      const slug = s.business?.slug?.trim();
      if (!slug) return null;
      return { slug, base: s.business?.name?.trim() || slug };
    })
    .filter((x): x is { slug: string; base: string } => x != null);
  const countByBase = new Map<string, number>();
  for (const r of rows) {
    countByBase.set(r.base, (countByBase.get(r.base) ?? 0) + 1);
  }
  return rows.map((r) => ({
    slug: r.slug,
    label: (countByBase.get(r.base) ?? 0) > 1 ? `${r.base} · /${r.slug}` : r.base,
  }));
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

  const entries = sitePickerEntries(withSlug);
  const meta: SiteLineMeta[] = entries.map((e, i) => ({
    slug: e.slug,
    label: e.label,
    dataKey: safeSeriesKey(e.slug),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

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
  const siteList = useMemo(() => sitePickerEntries(sites), [sites]);

  const [enabledSlugs, setEnabledSlugs] = useState<Set<string>>(() => new Set());
  const [metric, setMetric] = useState<'events' | 'units'>('events');

  useEffect(() => {
    setEnabledSlugs(new Set(siteList.map((s) => s.slug)));
  }, [siteList]);

  const { rows, meta } = useMemo(
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

  const denseX = rows.length > 14;
  const chartBottomMargin = denseX ? 52 : 28;
  const hasPoints = rows.length > 0 && meta.length > 0;

  return (
    <Card className="user-page__overall-leads-chart mb-3">
      <Card.Header className="user-page__overall-leads-chart__head">
        <h2 className="user-page__overall-leads-chart__title">Leads over time</h2>
        <p className="user-page__overall-leads-chart__subtitle mb-0">
          Compare {metric === 'events' ? 'lead events' : 'units'} across your gyms for the selected range.
        </p>
      </Card.Header>
      <Card.Body className="user-page__overall-leads-chart__body">
        <div className="user-page__overall-leads-chart__toolbar">
          <div className="user-page__overall-leads-chart__toolbar-metric">
            <Form.Label className="user-page__overall-leads-chart__field-label">Metric</Form.Label>
            <Form.Select
              size="sm"
              className="user-page__overall-leads-chart__select"
              value={metric}
              onChange={(e) => setMetric(e.target.value as 'events' | 'units')}
              aria-label="Chart metric"
            >
              <option value="events">Events</option>
              <option value="units">Units</option>
            </Form.Select>
          </div>
          <div className="user-page__overall-leads-chart__toolbar-sites">
            <Form.Label className="user-page__overall-leads-chart__field-label">Websites</Form.Label>
            <div className="user-page__overall-leads-chart__site-toggles">
              <ButtonGroup size="sm" className="user-page__overall-leads-chart__bulk-btns">
                <Button variant="outline-secondary" onClick={selectAll} type="button">
                  All
                </Button>
                <Button variant="outline-secondary" onClick={selectNone} type="button">
                  None
                </Button>
              </ButtonGroup>
              <div className="user-page__overall-leads-chart__checks">
                {siteList.map(({ slug, label }) => (
                  <Form.Check
                    key={slug}
                    type="checkbox"
                    id={`overall-leads-${slug}`}
                    className="user-page__overall-leads-chart__check"
                    label={label}
                    checked={enabledSlugs.has(slug)}
                    onChange={() => toggleSlug(slug)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {!hasPoints ?
          <p className="user-page__overall-leads-chart__empty text-muted small text-center mb-0">
            {meta.length === 0 ? 'Select at least one website to plot.' : 'No time-series points for this range.'}
          </p>
        : (
          <>
            {meta.length > 0 ?
              <ul className="user-page__overall-leads-chart__legend" aria-label="Series">
                {meta.map((m) => (
                  <li key={m.slug} className="user-page__overall-leads-chart__legend-item">
                    <span
                      className="user-page__overall-leads-chart__legend-swatch"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="user-page__overall-leads-chart__legend-text">{m.label}</span>
                  </li>
                ))}
              </ul>
            : null}
            <div className="user-page__overall-leads-chart__wrap">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: chartBottomMargin }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8eef4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    interval="preserveStartEnd"
                    angle={denseX ? -40 : 0}
                    textAnchor={denseX ? 'end' : 'middle'}
                    height={denseX ? 52 : 28}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ fontWeight: 700, color: '#0f172a' }}
                    formatter={(value: number) => [value, metric === 'events' ? 'Events' : 'Units']}
                  />
                  {meta.map((m) => (
                    <Line
                      key={m.slug}
                      type="monotone"
                      dataKey={m.dataKey}
                      name={m.label}
                      stroke={m.color}
                      strokeWidth={2}
                      dot={{ r: 2.5, strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
