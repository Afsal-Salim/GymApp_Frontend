import { Card, Table, Spinner, Alert, Row, Col } from 'react-bootstrap';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import type { WebsiteAnalytics } from '../../api/businesses';
import './WebsiteAnalyticsPanel.css';

const LEAD_TYPE_ORDER = ['join_now', 'book_free_trial', 'plan_visit', 'whatsapp_click'] as const;

const LEAD_TYPE_LABELS: Record<string, string> = {
  join_now: 'Join now',
  book_free_trial: 'Book free trial',
  plan_visit: 'Plan visit',
  whatsapp_click: 'WhatsApp click',
};

/** Distinct fills for pie / bars (teal / violet / emerald / amber / rose / indigo). */
const CHART_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
};

function humanizeLeadTypeKey(key: string): string {
  return LEAD_TYPE_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeLeadStats(raw: unknown): { events: number; units: number } {
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const events = Number(o.events ?? o.event_count ?? 0) || 0;
    const units = Number(o.units ?? o.unit_count ?? 0) || 0;
    return { events, units };
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return { events: raw, units: raw };
  }
  return { events: 0, units: 0 };
}

const WHATSAPP_TOTAL_KEYS: { keys: string[]; label: string }[] = [
  { keys: ['today', 'today_total', 'today_count'], label: 'Today' },
  { keys: ['last_7_days', 'last_7d', 'd7', 'seven_days'], label: 'Last 7 days' },
  { keys: ['last_30_days', 'last_30d', 'd30', 'thirty_days'], label: 'Last 30 days' },
  { keys: ['last_90_days', 'last_90d', 'd90', 'ninety_days'], label: 'Last 90 days' },
];

function pickNumeric(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === 'object' && !Array.isArray(x);
}

function extractSeriesTables(whatsapp: Record<string, unknown>): { label: string; rows: Record<string, unknown>[] }[] {
  const out: { label: string; rows: Record<string, unknown>[] }[] = [];

  const tryPush = (label: string, raw: unknown) => {
    if (!Array.isArray(raw) || raw.length === 0) return;
    const rows = raw.filter(isPlainObject) as Record<string, unknown>[];
    if (rows.length) out.push({ label, rows });
  };

  tryPush('By day', whatsapp.day_series ?? whatsapp.by_day ?? whatsapp.daily);
  tryPush('By week', whatsapp.week_series ?? whatsapp.by_week ?? whatsapp.weekly);
  tryPush('By month', whatsapp.month_series ?? whatsapp.by_month ?? whatsapp.monthly);

  const series = whatsapp.series;
  if (isPlainObject(series)) {
    tryPush('By day', series.day ?? series.days ?? series.daily);
    tryPush('By week', series.week ?? series.weeks ?? series.weekly);
    tryPush('By month', series.month ?? series.months ?? series.monthly);
  }

  return out;
}

/** Pick label + numeric column for line/area charts from arbitrary series rows. */
function seriesRowsToChartData(rows: Record<string, unknown>[]): { name: string; value: number }[] {
  if (!rows.length) return [];
  const sample = rows[0];
  const cols = Object.keys(sample);
  const labelCol =
    cols.find((c) => /date|day|label|period|bucket|week|month|start|end/i.test(c)) ?? cols[0];
  const valueCol =
    cols.find((c) => {
      if (c === labelCol) return false;
      const v = sample[c];
      if (typeof v === 'number' && Number.isFinite(v)) return true;
      if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return true;
      return false;
    }) ?? cols.find((c) => c !== labelCol);
  if (!valueCol) return [];
  return rows.map((r) => {
    const raw = r[valueCol];
    const value = typeof raw === 'number' ? raw : Number(raw) || 0;
    let name = String(r[labelCol] ?? '');
    if (name.length > 16) name = `${name.slice(0, 14)}…`;
    return { name: name || '—', value };
  });
}

function SeriesTable({ label, rows }: { label: string; rows: Record<string, unknown>[] }) {
  const cols = Object.keys(rows[0] ?? {});
  if (!cols.length) return null;
  return (
    <div className="website-analytics-panel__series">
      <h6 className="website-analytics-panel__series-title">{label} (detail)</h6>
      <div className="website-analytics-panel__series-scroll">
        <Table size="sm" striped bordered responsive className="website-analytics-panel__table mb-0">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c}>{formatCell(row[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
}

function formatComputedAt(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function LeadPieTooltip({ active, payload }: { active?: boolean; payload?: { name?: string; value?: number }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="website-analytics-panel__chart-tooltip" style={TOOLTIP_STYLE}>
      <strong>{item.name}</strong>
      <div className="text-muted small">{item.value} events</div>
    </div>
  );
}

function LeadTypesVisuals({
  pieData,
  barData,
}: {
  pieData: { name: string; value: number }[];
  barData: { name: string; events: number; units: number }[];
}) {
  const pieSum = pieData.reduce((s, d) => s + d.value, 0);
  const hasBar = barData.some((d) => d.events > 0 || d.units > 0);

  if (pieSum === 0 && !hasBar) {
    return (
      <p className="text-muted small mb-0 py-3 text-center">No lead data to chart yet — activity will appear here.</p>
    );
  }

  return (
    <Row className="g-3 website-analytics-panel__chart-row">
      {pieSum > 0 ?
        <Col lg={5}>
          <div className="website-analytics-panel__chart-wrap">
            <p className="website-analytics-panel__chart-caption">Share of lead events</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<LeadPieTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
      : null}
      {hasBar ?
        <Col lg={pieSum > 0 ? 7 : 12}>
          <div className="website-analytics-panel__chart-wrap">
            <p className="website-analytics-panel__chart-caption">Events vs units by type</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-22} textAnchor="end" height={56} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} width={36} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="events" name="Events" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="units" name="Units" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
      : null}
    </Row>
  );
}

function WhatsappPeriodChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return null;
  return (
    <div className="website-analytics-panel__chart-wrap mb-3">
      <p className="website-analytics-panel__chart-caption">WhatsApp activity by period</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11, fill: '#475569' }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [v, 'Count']} />
          <Bar dataKey="value" name="Count" fill="#22c55e" radius={[0, 6, 6, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SeriesTrendChart({
  chartId,
  title,
  points,
}: {
  chartId: string;
  title: string;
  points: { name: string; value: number }[];
}) {
  if (!points.length) return null;
  const gradId = `wa-area-${chartId}`;
  return (
    <div className="website-analytics-panel__chart-wrap mb-3">
      <p className="website-analytics-panel__chart-caption">{title}</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 36 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} width={36} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="value"
            name="Count"
            stroke="#0284c7"
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export type WebsiteAnalyticsPanelProps = {
  data: WebsiteAnalytics | null;
  loading: boolean;
  error: string | null;
  showBusinessHeader?: boolean;
};

export function WebsiteAnalyticsPanel({
  data,
  loading,
  error,
  showBusinessHeader = true,
}: WebsiteAnalyticsPanelProps) {
  if (loading && !data) {
    return (
      <div className="website-analytics-panel__loading text-center py-4">
        <Spinner animation="border" size="sm" className="me-2" />
        <span className="text-muted small">Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="website-analytics-panel__alert mb-0">
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <p className="text-muted small mb-0">No analytics data.</p>
    );
  }

  const w = data.whatsapp && typeof data.whatsapp === 'object' && !Array.isArray(data.whatsapp) ? (data.whatsapp as Record<string, unknown>) : {};
  const seriesTables = extractSeriesTables(w);

  const rawLeads = data.leads_by_type ?? {};
  const keysFromApi = Object.keys(rawLeads);
  const orderedLeadKeys = [
    ...LEAD_TYPE_ORDER.filter((k) => k in rawLeads),
    ...keysFromApi.filter((k) => !LEAD_TYPE_ORDER.includes(k as (typeof LEAD_TYPE_ORDER)[number])).sort(),
  ];

  const pieData = orderedLeadKeys.map((key) => {
    const stats = normalizeLeadStats(rawLeads[key]);
    return {
      name: humanizeLeadTypeKey(key),
      value: stats.events,
    };
  }).filter((d) => d.value > 0);

  const barData = orderedLeadKeys.map((key) => {
    const stats = normalizeLeadStats(rawLeads[key]);
    return {
      name: humanizeLeadTypeKey(key),
      events: stats.events,
      units: stats.units,
    };
  });

  const waPeriodData: { label: string; value: number }[] = [];
  for (const { keys, label } of WHATSAPP_TOTAL_KEYS) {
    const n = pickNumeric(w, keys);
    if (n !== undefined) waPeriodData.push({ label, value: n });
  }

  const leadEvents = data.totals?.lead_events;
  const units = data.totals?.units;
  const evNum = typeof leadEvents === 'number' && Number.isFinite(leadEvents) ? leadEvents : null;
  const uNum = typeof units === 'number' && Number.isFinite(units) ? units : null;
  const totalForBar = evNum != null && uNum != null ? evNum + uNum : null;

  return (
    <div className="website-analytics-panel">
      {showBusinessHeader && (
        <div className="website-analytics-panel__business-head mb-3">
          <h4 className="website-analytics-panel__business-name h5 mb-0">{data.business?.name || data.business?.slug || '—'}</h4>
          {data.business?.slug && (
            <code className="website-analytics-panel__business-slug text-muted small">/{data.business.slug}</code>
          )}
        </div>
      )}

      <div className="website-analytics-panel__meta text-muted small mb-3">
        Computed at <time dateTime={data.computed_at}>{formatComputedAt(data.computed_at)}</time>
      </div>

      <Row className="g-3 mb-3">
        <Col sm={6}>
          <div className="website-analytics-panel__stat-card website-analytics-panel__stat-card--events">
            <span className="website-analytics-panel__stat-label">Lead events</span>
            <span className="website-analytics-panel__stat-value">{leadEvents ?? '—'}</span>
            {totalForBar != null && totalForBar > 0 && evNum != null ?
              <div className="website-analytics-panel__stat-bar" aria-hidden>
                <span
                  className="website-analytics-panel__stat-bar-fill website-analytics-panel__stat-bar-fill--events"
                  style={{ width: `${Math.min(100, Math.round((evNum / totalForBar) * 100))}%` }}
                />
              </div>
            : null}
          </div>
        </Col>
        <Col sm={6}>
          <div className="website-analytics-panel__stat-card website-analytics-panel__stat-card--units">
            <span className="website-analytics-panel__stat-label">Units</span>
            <span className="website-analytics-panel__stat-value">{units ?? '—'}</span>
            {totalForBar != null && totalForBar > 0 && uNum != null ?
              <div className="website-analytics-panel__stat-bar" aria-hidden>
                <span
                  className="website-analytics-panel__stat-bar-fill website-analytics-panel__stat-bar-fill--units"
                  style={{ width: `${Math.min(100, Math.round((uNum / totalForBar) * 100))}%` }}
                />
              </div>
            : null}
          </div>
        </Col>
      </Row>

      <Card className="website-analytics-panel__card mb-3">
        <Card.Header className="website-analytics-panel__card-head">Leads overview</Card.Header>
        <Card.Body className="pt-3 pb-2">
          <LeadTypesVisuals pieData={pieData} barData={barData} />
          <Table responsive size="sm" className="website-analytics-panel__table website-analytics-panel__table--after-chart mb-0 mt-2">
            <thead>
              <tr>
                <th>Type</th>
                <th className="text-end">Events</th>
                <th className="text-end">Units</th>
              </tr>
            </thead>
            <tbody>
              {orderedLeadKeys.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-muted small">
                    No breakdown by type yet.
                  </td>
                </tr>
              ) : (
                orderedLeadKeys.map((key) => {
                  const stats = normalizeLeadStats(rawLeads[key]);
                  return (
                    <tr key={key}>
                      <td>{humanizeLeadTypeKey(key)}</td>
                      <td className="text-end">{stats.events}</td>
                      <td className="text-end">{stats.units}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="website-analytics-panel__card mb-0">
        <Card.Header className="website-analytics-panel__card-head">WhatsApp</Card.Header>
        <Card.Body>
          {waPeriodData.length > 0 ?
            <WhatsappPeriodChart data={waPeriodData} />
          : null}
          <dl className="website-analytics-panel__dl website-analytics-panel__whatsapp-totals row mb-3">
            {WHATSAPP_TOTAL_KEYS.map(({ keys, label }) => {
              const n = pickNumeric(w, keys);
              if (n === undefined) return null;
              return (
                <div key={label} className="col-6 col-md-3 mb-2">
                  <dt>{label}</dt>
                  <dd className="mb-0 fw-semibold">{n}</dd>
                </div>
              );
            })}
          </dl>
          {WHATSAPP_TOTAL_KEYS.every(({ keys }) => pickNumeric(w, keys) === undefined) && Object.keys(w).length === 0 && (
            <p className="text-muted small mb-0">No WhatsApp metrics in this response.</p>
          )}
          {WHATSAPP_TOTAL_KEYS.every(({ keys }) => pickNumeric(w, keys) === undefined) &&
            Object.keys(w).length > 0 &&
            seriesTables.length === 0 && (
              <p className="text-muted small mb-2">Showing raw WhatsApp keys (unrecognized shape).</p>
            )}
          {seriesTables.map(({ label, rows }, idx) => {
            const points = seriesRowsToChartData(rows);
            return (
              <div key={`${label}-${idx}`}>
                <SeriesTrendChart chartId={`${idx}-${label.replace(/\W/g, '')}`} title={`${label} (trend)`} points={points} />
                <SeriesTable label={label} rows={rows} />
              </div>
            );
          })}
        </Card.Body>
      </Card>
    </div>
  );
}
