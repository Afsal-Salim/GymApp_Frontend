import { Card, Table, Spinner, Alert, Row, Col, Form } from 'react-bootstrap';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  ANALYTICS_RANGE_OPTIONS,
  type WebsiteAnalytics,
  type WebsiteAnalyticsLineGraphPoint,
  type AnalyticsRangePreset,
} from '../../api/businesses';
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

function unitsFromByLeadTypeEntry(raw: unknown): number {
  if (raw == null) return 0;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const u = o.units ?? o.unit_count;
    if (typeof u === 'number' && Number.isFinite(u)) return u;
    if (typeof u === 'string' && u.trim() !== '' && !Number.isNaN(Number(u))) return Number(u);
  }
  return 0;
}

function rangeSelectOptions(allowed: string[] | undefined): { value: AnalyticsRangePreset; label: string }[] {
  if (!allowed?.length) return [...ANALYTICS_RANGE_OPTIONS];
  const set = new Set(allowed);
  return ANALYTICS_RANGE_OPTIONS.filter((o) => set.has(o.value));
}

function sortLeadTypeKeysForSeries(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = LEAD_TYPE_ORDER.indexOf(a as (typeof LEAD_TYPE_ORDER)[number]);
    const ib = LEAD_TYPE_ORDER.indexOf(b as (typeof LEAD_TYPE_ORDER)[number]);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b);
  });
}

/** Rows for Recharts from API `line_graph`; `seriesKeys` are dataKeys for per–lead-type lines (prefix `lt_`). */
function buildLineGraphChartRows(
  points: WebsiteAnalyticsLineGraphPoint[] | undefined,
  bucket: string | undefined
): { rows: Record<string, string | number>[]; seriesKeys: string[]; humanNames: Record<string, string> } {
  if (!points?.length) return { rows: [], seriesKeys: [], humanNames: {} };
  const leadKeys = new Set<string>();
  for (const p of points) {
    const blt = p.by_lead_type;
    if (blt && typeof blt === 'object' && !Array.isArray(blt)) {
      Object.keys(blt).forEach((k) => leadKeys.add(k));
    }
  }
  const sortedLeadKeys = sortLeadTypeKeysForSeries([...leadKeys]);
  const humanNames: Record<string, string> = {};
  const seriesKeys = sortedLeadKeys.map((k) => {
    const dk = `lt_${k}`;
    humanNames[dk] = humanizeLeadTypeKey(k);
    return dk;
  });

  const rows = points.map((p) => {
    const row: Record<string, string | number> = {
      period_start: p.period_start,
      label: formatPeriodAxisLabel(p.period_start, bucket),
      events: Number(p.events) || 0,
      units: Number(p.units) || 0,
    };
    const blt = p.by_lead_type;
    for (const k of sortedLeadKeys) {
      const dk = `lt_${k}`;
      row[dk] = blt && typeof blt === 'object' && !Array.isArray(blt) ? unitsFromByLeadTypeEntry((blt as Record<string, unknown>)[k]) : 0;
    }
    return row;
  });
  return { rows, seriesKeys, humanNames };
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
  pieSlices,
  showPieColumn,
  leadMixEmptyDetail,
  lineRows,
  lineSeriesKeys,
  lineSeriesLabels,
  bucket,
}: {
  /** Non-zero slices only (for the pie). */
  pieSlices: { name: string; value: number }[];
  /** When true, left column shows pie or lead-mix placeholder (individual manage view). */
  showPieColumn: boolean;
  /** Rows for the “all types” list when there are no pie slices yet (all-time counts, incl. zeros). */
  leadMixEmptyDetail: { name: string; events: number }[] | null;
  lineRows: Record<string, string | number>[];
  lineSeriesKeys: string[];
  lineSeriesLabels: Record<string, string>;
  bucket: string | undefined;
}) {
  const pieSum = pieSlices.reduce((s, d) => s + d.value, 0);
  const hasLine = lineRows.length > 0;

  if (!showPieColumn && !hasLine) {
    return (
      <p className="text-muted small mb-0 py-3 text-center">No lead data to chart yet — activity will appear here.</p>
    );
  }

  const xAxisBottom = bucket === 'hour' ? 52 : 40;

  return (
    <Row className="g-3 website-analytics-panel__chart-row">
      {showPieColumn ?
        <Col lg={5}>
          <div className="website-analytics-panel__chart-wrap">
            <p className="website-analytics-panel__chart-caption">Lead types (all-time)</p>
            <p className="text-muted small mb-2 website-analytics-panel__pie-hint">
              Join now · Book free trial · Plan visit · WhatsApp click
            </p>
            {pieSum > 0 ?
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieSlices}
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
                    {pieSlices.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<LeadPieTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            : (
              <div className="website-analytics-panel__pie-empty text-muted small py-3 px-2">
                <p className="mb-2">No events recorded yet for these types.</p>
                {leadMixEmptyDetail && leadMixEmptyDetail.length > 0 ?
                  <ul className="list-unstyled mb-0 website-analytics-panel__pie-empty-list">
                    {leadMixEmptyDetail.map((row) => (
                      <li key={row.name} className="d-flex justify-content-between gap-2 py-1 border-bottom border-light">
                        <span>{row.name}</span>
                        <span className="text-nowrap">{row.events} events</span>
                      </li>
                    ))}
                  </ul>
                : null}
              </div>
            )}
          </div>
        </Col>
      : null}
      {hasLine ?
        <Col lg={showPieColumn ? 7 : 12}>
          <div className="website-analytics-panel__chart-wrap">
            <p className="website-analytics-panel__chart-caption">Leads over selected range</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineRows} margin={{ top: 8, right: 8, left: 0, bottom: xAxisBottom }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  interval="preserveStartEnd"
                  angle={lineRows.length > 14 ? -35 : 0}
                  textAnchor={lineRows.length > 14 ? 'end' : 'middle'}
                  height={lineRows.length > 14 ? 48 : 28}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ fontWeight: 600 }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="events" name="Events" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                <Line type="monotone" dataKey="units" name="Units" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} connectNulls />
                {lineSeriesKeys.map((dk, i) => (
                  <Line
                    key={dk}
                    type="monotone"
                    dataKey={dk}
                    name={lineSeriesLabels[dk] ?? dk}
                    stroke={CHART_COLORS[(i + 2) % CHART_COLORS.length]}
                    strokeWidth={1.5}
                    dot={{ r: 1.5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Col>
      : showPieColumn ?
        <Col lg={7}>
          <p className="text-muted small mb-0 py-4 text-center">No time-series points for this range yet.</p>
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
  /** When set with `onAnalyticsRangeChange`, shows a range control (refetch in the parent). */
  analyticsRange?: AnalyticsRangePreset;
  onAnalyticsRangeChange?: (range: AnalyticsRangePreset) => void;
  /**
   * Individual manage view: always show the lead-type column (pie or typed list) so Join now / Book trial / Plan visit / WhatsApp stay visible.
   */
  showLeadMixPieAlways?: boolean;
};

export function WebsiteAnalyticsPanel({
  data,
  loading,
  error,
  showBusinessHeader = true,
  analyticsRange,
  onAnalyticsRangeChange,
  showLeadMixPieAlways = false,
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

  const pieKeysFull = showLeadMixPieAlways
    ? [...LEAD_TYPE_ORDER, ...keysFromApi.filter((k) => !LEAD_TYPE_ORDER.includes(k as (typeof LEAD_TYPE_ORDER)[number])).sort()].filter(
        (k, i, a) => a.indexOf(k) === i
      )
    : orderedLeadKeys;

  const pieSlices = pieKeysFull
    .map((key) => {
      const stats = normalizeLeadStats(rawLeads[key]);
      return { name: humanizeLeadTypeKey(key), value: stats.events };
    })
    .filter((d) => d.value > 0);

  const pieSumAllTime = pieSlices.reduce((s, d) => s + d.value, 0);
  const showPieColumn = showLeadMixPieAlways || pieSumAllTime > 0;
  const leadMixEmptyDetail =
    showLeadMixPieAlways && pieSumAllTime === 0 ?
      pieKeysFull.map((key) => ({
        name: humanizeLeadTypeKey(key),
        events: normalizeLeadStats(rawLeads[key]).events,
      }))
    : null;

  const tr = data.time_range;
  const bucket = tr?.bucket;
  const { rows: lineRows, seriesKeys: lineSeriesKeys, humanNames: lineSeriesLabels } = buildLineGraphChartRows(
    data.line_graph,
    bucket
  );
  const rangeOptions = rangeSelectOptions(tr?.allowed_presets);

  const rawLeadsInRange = data.leads_by_type_in_range ?? {};
  const keysInRange = Object.keys(rawLeadsInRange);
  const orderedLeadKeysInRange = [
    ...LEAD_TYPE_ORDER.filter((k) => k in rawLeadsInRange),
    ...keysInRange.filter((k) => !LEAD_TYPE_ORDER.includes(k as (typeof LEAD_TYPE_ORDER)[number])).sort(),
  ];

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

  const tir = data.totals_in_range;
  const evInRange = typeof tir?.lead_events === 'number' && Number.isFinite(tir.lead_events) ? tir.lead_events : null;
  const uInRange = typeof tir?.units === 'number' && Number.isFinite(tir.units) ? tir.units : null;
  const totalInRangeBar = evInRange != null && uInRange != null ? evInRange + uInRange : null;

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

      {onAnalyticsRangeChange && analyticsRange !== undefined ?
        <div className="website-analytics-panel__range-row d-flex flex-wrap align-items-center gap-2 mb-3">
          <Form.Label className="small text-muted mb-0">Time range</Form.Label>
          <Form.Select
            size="sm"
            className="website-analytics-panel__range-select"
            style={{ maxWidth: 220 }}
            value={analyticsRange}
            onChange={(e) => onAnalyticsRangeChange(e.target.value as AnalyticsRangePreset)}
            aria-label="Analytics time range"
          >
            {rangeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Form.Select>
        </div>
      : null}

      <div className="website-analytics-panel__meta text-muted small mb-3">
        Computed at <time dateTime={data.computed_at}>{formatComputedAt(data.computed_at)}</time>
        {tr?.label ?
          <>
            {' '}
            · <span className="website-analytics-panel__range-meta">{tr.label}</span>
            {tr.start && tr.end ?
              <span className="d-block mt-1">
                {formatComputedAt(tr.start)} — {formatComputedAt(tr.end)}
                {tr.bucket ? ` · ${tr.bucket} buckets` : ''}
              </span>
            : null}
          </>
        : null}
      </div>

      <Row className="g-3 mb-3">
        <Col sm={6}>
          <div className="website-analytics-panel__stat-card website-analytics-panel__stat-card--events">
            <span className="website-analytics-panel__stat-label">Lead events (all-time)</span>
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
            <span className="website-analytics-panel__stat-label">Units (all-time)</span>
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

      {tir && (evInRange !== null || uInRange !== null) ?
        <Row className="g-3 mb-3">
          <Col sm={6}>
            <div className="website-analytics-panel__stat-card website-analytics-panel__stat-card--events website-analytics-panel__stat-card--in-range">
              <span className="website-analytics-panel__stat-label">Lead events (selected range)</span>
              <span className="website-analytics-panel__stat-value">{evInRange ?? '—'}</span>
              {totalInRangeBar != null && totalInRangeBar > 0 && evInRange != null ?
                <div className="website-analytics-panel__stat-bar" aria-hidden>
                  <span
                    className="website-analytics-panel__stat-bar-fill website-analytics-panel__stat-bar-fill--events"
                    style={{ width: `${Math.min(100, Math.round((evInRange / totalInRangeBar) * 100))}%` }}
                  />
                </div>
              : null}
            </div>
          </Col>
          <Col sm={6}>
            <div className="website-analytics-panel__stat-card website-analytics-panel__stat-card--units website-analytics-panel__stat-card--in-range">
              <span className="website-analytics-panel__stat-label">Units (selected range)</span>
              <span className="website-analytics-panel__stat-value">{uInRange ?? '—'}</span>
              {totalInRangeBar != null && totalInRangeBar > 0 && uInRange != null ?
                <div className="website-analytics-panel__stat-bar" aria-hidden>
                  <span
                    className="website-analytics-panel__stat-bar-fill website-analytics-panel__stat-bar-fill--units"
                    style={{ width: `${Math.min(100, Math.round((uInRange / totalInRangeBar) * 100))}%` }}
                  />
                </div>
              : null}
            </div>
          </Col>
        </Row>
      : null}

      <Card className="website-analytics-panel__card mb-3">
        <Card.Header className="website-analytics-panel__card-head">Leads overview</Card.Header>
        <Card.Body className="pt-3 pb-2">
          <LeadTypesVisuals
            pieSlices={pieSlices}
            showPieColumn={showPieColumn}
            leadMixEmptyDetail={leadMixEmptyDetail}
            lineRows={lineRows}
            lineSeriesKeys={lineSeriesKeys}
            lineSeriesLabels={lineSeriesLabels}
            bucket={bucket}
          />
          <p className="text-muted small mb-1 mt-2">All-time by type</p>
          <Table responsive size="sm" className="website-analytics-panel__table website-analytics-panel__table--after-chart mb-0">
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
          {orderedLeadKeysInRange.length > 0 ?
            <>
              <p className="text-muted small mb-1 mt-3">Selected range by type</p>
              <Table responsive size="sm" className="website-analytics-panel__table mb-0">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th className="text-end">Events</th>
                    <th className="text-end">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedLeadKeysInRange.map((key) => {
                    const stats = normalizeLeadStats(rawLeadsInRange[key]);
                    return (
                      <tr key={key}>
                        <td>{humanizeLeadTypeKey(key)}</td>
                        <td className="text-end">{stats.events}</td>
                        <td className="text-end">{stats.units}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </>
          : null}
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
