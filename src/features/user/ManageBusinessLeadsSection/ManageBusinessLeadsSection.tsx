import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { Card, Form, Pagination, Spinner, Table } from 'react-bootstrap';
import {
  getBusinessCrystalLeadsPaginated,
  getBusinessEnquiriesPaginated,
  isAxiosOrAbortCanceled,
  patchBusinessEnquiry,
  type BusinessEnquiryItem,
  type BusinessListMeta,
  type ModalCrystalLeadType,
  type OwnerCrystalLeadItem,
} from '@/api';
import { useToast } from '@/contexts/ToastContext/ToastContext';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;
/** Long payload strings (email, message, notes, etc.) collapse past this length until expanded. */
const LEAD_DETAIL_COLLAPSE_CHARS = 160;
const ENQUIRY_MESSAGE_COLLAPSE_CHARS = 160;

function ExpandableText({
  text,
  collapseAt = LEAD_DETAIL_COLLAPSE_CHARS,
  className,
}: {
  text: string;
  collapseAt?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const needToggle = text.length > collapseAt;
  if (!needToggle) {
    return (
      <span className={`manage-business-page__expandable-text-body${className ? ` ${className}` : ''}`}>{text}</span>
    );
  }
  return (
    <span className={`manage-business-page__expandable-text-wrap${className ? ` ${className}` : ''}`}>
      <span className="manage-business-page__expandable-text-body">
        {expanded ? text : `${text.slice(0, collapseAt)}…`}
      </span>
      <button
        type="button"
        className="manage-business-page__expandable-text-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        aria-expanded={expanded}
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </span>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

const LEAD_TYPE_LABEL: Record<ModalCrystalLeadType, string> = {
  join_now: 'Join now',
  book_free_trial: 'Book free trial',
  plan_visit: 'Plan a visit',
};

const PAYLOAD_SKIP_KEYS = new Set([
  'lead_type',
  'business_slug',
  'submitted_at_ms',
  'seed_owner_demo',
]);

function strFromPayload(v: unknown): string {
  if (v == null) return '';
  if (Array.isArray(v)) {
    return v
      .map((x) => (x == null ? '' : String(x).trim()))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof v === 'object') return '';
  return String(v).trim();
}

/** Mirrors server crystal-leads search: payload name, email, message, notes (plus id / type for client refinement). */
function leadMatchesSearch(row: OwnerCrystalLeadItem, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const p =
    row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload) ?
      (row.payload as Record<string, unknown>)
    : {};
  const blob = [
    String(row.id),
    String(row.lead_type),
    strFromPayload(p.name),
    strFromPayload(p.email),
    strFromPayload(p.message),
    strFromPayload(p.notes),
  ]
    .join(' ')
    .toLowerCase();
  return blob.includes(q);
}

function enquiryMatchesSearch(row: BusinessEnquiryItem, raw: string): boolean {
  const q = raw.trim().toLowerCase();
  if (!q) return true;
  const blob = [row.name, row.email, row.message].join(' ').toLowerCase();
  return blob.includes(q);
}

function humanizeFieldKey(k: string): string {
  return k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function LeadTypeBadge({ leadType }: { leadType: string }) {
  const label = LEAD_TYPE_LABEL[leadType as ModalCrystalLeadType] ?? leadType.replace(/_/g, ' ');
  const mod: ModalCrystalLeadType | 'other' =
    leadType === 'join_now' || leadType === 'book_free_trial' || leadType === 'plan_visit' ?
      leadType
    : 'other';
  return (
    <span className={`manage-business-page__lead-type-badge manage-business-page__lead-type-badge--${mod}`}>
      {label}
    </span>
  );
}

type DetailRow = { label: string; value: string };

function ModalLeadPayloadSummary({ leadType, payload }: { leadType: string; payload: unknown }) {
  const p =
    payload && typeof payload === 'object' && !Array.isArray(payload) ?
      (payload as Record<string, unknown>)
    : {};
  const isDemo = p.seed_owner_demo === true;

  const sections: { title: string; rows: DetailRow[] }[] = [];

  const contactRows: DetailRow[] = [];
  const name = strFromPayload(p.name);
  const phone = strFromPayload(p.phone);
  if (name) contactRows.push({ label: 'Name', value: name });
  if (phone) contactRows.push({ label: 'Phone', value: phone });
  if (contactRows.length) sections.push({ title: 'Contact', rows: contactRows });

  const pick = (label: string, key: string): DetailRow | null => {
    const value = strFromPayload(p[key]);
    return value ? { label, value } : null;
  };

  if (leadType === 'join_now') {
    const rows: DetailRow[] = [];
    const a = pick('Training focus', 'focus');
    const b = pick('How often', 'frequency');
    if (a) rows.push(a);
    if (b) rows.push(b);
    if (rows.length) sections.push({ title: 'Goals', rows });
  } else if (leadType === 'book_free_trial') {
    const rows: DetailRow[] = [];
    const w = pick('Visit timing', 'visit_when');
    const interests = strFromPayload(p.interests);
    const n = pick('Notes', 'notes');
    if (w) rows.push(w);
    if (interests) rows.push({ label: 'Interests', value: interests });
    if (n) rows.push(n);
    if (rows.length) sections.push({ title: 'Free trial', rows });
  } else if (leadType === 'plan_visit') {
    const rows: DetailRow[] = [];
    const w = pick('Preferred time', 'preferred_when');
    const n = pick('Notes', 'notes');
    if (w) rows.push(w);
    if (n) rows.push(n);
    if (rows.length) sections.push({ title: 'Visit', rows });
  }

  const usedKeys = new Set<string>([
    ...PAYLOAD_SKIP_KEYS,
    'name',
    'phone',
    'focus',
    'frequency',
    'visit_when',
    'interests',
    'notes',
    'preferred_when',
  ]);
  const fallback: DetailRow[] = [];
  for (const [k, v] of Object.entries(p)) {
    if (usedKeys.has(k)) continue;
    const value = strFromPayload(v);
    if (!value) continue;
    fallback.push({ label: humanizeFieldKey(k), value });
  }
  if (fallback.length) sections.push({ title: 'More', rows: fallback });

  const fullJson =
    Object.keys(p).length > 0 ?
      JSON.stringify(p, null, 2)
    : '';

  if (sections.length === 0) {
    return (
      <div className="manage-business-page__lead-details" title={fullJson || undefined}>
        {isDemo ?
          <span className="manage-business-page__lead-demo-pill mb-1">Sample data</span>
        : null}
        <span className="text-muted small">No visitor details for this lead.</span>
      </div>
    );
  }

  return (
    <div className="manage-business-page__lead-details" title={fullJson || undefined}>
      {isDemo ?
        <span className="manage-business-page__lead-demo-pill">Sample data</span>
      : null}
      {sections.map((sec) => (
        <div key={sec.title} className="manage-business-page__lead-detail-section">
          <div className="manage-business-page__lead-detail-heading">{sec.title}</div>
          {sec.rows.map((r) => (
            <div key={`${sec.title}-${r.label}`} className="manage-business-page__lead-detail-row">
              <span className="manage-business-page__lead-detail-k">{r.label}</span>
              <span className="manage-business-page__lead-detail-v">
                <ExpandableText text={r.value} collapseAt={LEAD_DETAIL_COLLAPSE_CHARS} />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function formatWhen(s: string | undefined): string {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return s;
  }
}

function ListPager({
  meta,
  onPage,
}: {
  meta: BusinessListMeta;
  onPage: (p: number) => void;
}) {
  const { page, total_pages: totalPages, total } = meta;
  const items: ReactElement[] = [];
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  for (const p of Array.from({ length: end - start + 1 }, (_, i) => start + i)) {
    items.push(
      <Pagination.Item key={p} active={p === page} onClick={() => onPage(p)}>
        {p}
      </Pagination.Item>
    );
  }
  return (
    <div className="manage-business-page__list-footer d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
      <span className="small text-muted">
        {total} total · page {page} of {totalPages}
      </span>
      <Pagination className="mb-0">
        <Pagination.Prev disabled={page <= 1} onClick={() => onPage(page - 1)} />
        {items}
        <Pagination.Next disabled={page >= totalPages} onClick={() => onPage(page + 1)} />
      </Pagination>
    </div>
  );
}

export function ManageBusinessLeadsSection({ slug }: { slug: string }) {
  const { showToast } = useToast();

  const [leadPage, setLeadPage] = useState(1);
  const [leadType, setLeadType] = useState<'' | ModalCrystalLeadType>('');
  const [leadSearch, setLeadSearch] = useState('');
  const debouncedLeadSearch = useDebouncedValue(leadSearch, SEARCH_DEBOUNCE_MS);
  const [leads, setLeads] = useState<OwnerCrystalLeadItem[]>([]);
  const [leadMeta, setLeadMeta] = useState<BusinessListMeta | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  const [enqPage, setEnqPage] = useState(1);
  const [enqStatus, setEnqStatus] = useState<'' | 'open' | 'resolved'>('');
  const [enqSearch, setEnqSearch] = useState('');
  const debouncedEnqSearch = useDebouncedValue(enqSearch, SEARCH_DEBOUNCE_MS);
  const [enquiries, setEnquiries] = useState<BusinessEnquiryItem[]>([]);
  const [enqMeta, setEnqMeta] = useState<BusinessListMeta | null>(null);
  const [enqLoading, setEnqLoading] = useState(true);
  const [enqError, setEnqError] = useState<string | null>(null);
  const [enqSavingId, setEnqSavingId] = useState<number | null>(null);

  useEffect(() => {
    setLeadPage(1);
  }, [debouncedLeadSearch]);

  const loadLeads = useCallback(async (signal?: AbortSignal) => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const search = debouncedLeadSearch.trim();
      const res = await getBusinessCrystalLeadsPaginated(
        slug,
        {
          page: leadPage,
          page_size: PAGE_SIZE,
          ...(leadType ? { lead_type: leadType } : {}),
          ...(search ? { search } : {}),
        },
        signal ? { signal } : undefined
      );
      if (signal?.aborted) return;
      setLeads(res.results);
      setLeadMeta(res.meta);
    } catch (e) {
      if (isAxiosOrAbortCanceled(e)) return;
      setLeads([]);
      setLeadMeta(null);
      setLeadsError(e instanceof Error ? e.message : 'Failed to load modal leads.');
    } finally {
      if (!signal?.aborted) {
        setLeadsLoading(false);
      }
    }
  }, [slug, leadPage, leadType, debouncedLeadSearch]);

  useEffect(() => {
    const ac = new AbortController();
    void loadLeads(ac.signal);
    return () => ac.abort();
  }, [loadLeads]);

  useEffect(() => {
    setEnqPage(1);
  }, [debouncedEnqSearch]);

  const loadEnquiries = useCallback(async (signal?: AbortSignal) => {
    setEnqLoading(true);
    setEnqError(null);
    try {
      const search = debouncedEnqSearch.trim();
      const res = await getBusinessEnquiriesPaginated(
        slug,
        {
          page: enqPage,
          page_size: PAGE_SIZE,
          ...(enqStatus ? { enquiry_status: enqStatus } : {}),
          ...(search ? { search } : {}),
        },
        signal ? { signal } : undefined
      );
      if (signal?.aborted) return;
      setEnquiries(res.results);
      setEnqMeta(res.meta);
    } catch (e) {
      if (isAxiosOrAbortCanceled(e)) return;
      setEnquiries([]);
      setEnqMeta(null);
      setEnqError(e instanceof Error ? e.message : 'Failed to load enquiries.');
    } finally {
      if (!signal?.aborted) {
        setEnqLoading(false);
      }
    }
  }, [slug, enqPage, enqStatus, debouncedEnqSearch]);

  useEffect(() => {
    const ac = new AbortController();
    void loadEnquiries(ac.signal);
    return () => ac.abort();
  }, [loadEnquiries]);

  const displayLeads = useMemo(
    () => leads.filter((row) => leadMatchesSearch(row, debouncedLeadSearch)),
    [leads, debouncedLeadSearch]
  );

  const displayEnquiries = useMemo(
    () => enquiries.filter((row) => enquiryMatchesSearch(row, debouncedEnqSearch)),
    [enquiries, debouncedEnqSearch]
  );

  const patchEnquiry = async (id: number, body: Parameters<typeof patchBusinessEnquiry>[2]) => {
    setEnqSavingId(id);
    try {
      const updated = await patchBusinessEnquiry(slug, id, body);
      setEnquiries((prev) => prev.map((row) => (row.id === id ? { ...row, ...updated } : row)));
      showToast('Enquiry updated.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Update failed.');
      setEnqSavingId(null);
      return;
    }
    try {
      await loadEnquiries();
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : 'Could not refresh the list.',
        'warning'
      );
    } finally {
      setEnqSavingId(null);
    }
  };

  return (
    <div className="manage-business-page__leads-stack mt-5">
      <h2 className="manage-business-page__section-title h5 mb-3">Leads &amp; enquiries</h2>
      <p className="text-muted small mb-4">
        Modal submissions from your public gym page (Join now, Book free trial, Plan a visit) and messages sent via the
        business enquiry form. WhatsApp clicks stay in analytics only.
      </p>

      <Card className="manage-business-page__lead-card border-0 shadow-sm mb-4">
        <Card.Header className="manage-business-page__lead-card-head bg-white py-3">
          <div className="fw-semibold text-dark">Modal crystal leads</div>
          <div className="small text-muted">Join now · Book free trial · Plan a visit</div>
        </Card.Header>
        <Card.Body className="pt-0">
          <div className="manage-business-page__filters d-flex flex-wrap gap-3 align-items-end mb-3">
            <div>
              <Form.Label className="manage-business-page__filter-label small text-muted mb-1">Lead type</Form.Label>
              <Form.Select
                size="sm"
                value={leadType}
                onChange={(e) => {
                  setLeadPage(1);
                  setLeadType(e.target.value as typeof leadType);
                }}
                style={{ minWidth: 180 }}
              >
                <option value="">All</option>
                <option value="join_now">{LEAD_TYPE_LABEL.join_now}</option>
                <option value="book_free_trial">{LEAD_TYPE_LABEL.book_free_trial}</option>
                <option value="plan_visit">{LEAD_TYPE_LABEL.plan_visit}</option>
              </Form.Select>
            </div>
            <div className="manage-business-page__filter-search flex-grow-1">
              <Form.Label className="manage-business-page__filter-label small text-muted mb-1">Search</Form.Label>
              <Form.Control
                type="search"
                size="sm"
                placeholder="Name, email, message, or notes…"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                aria-label="Search modal leads"
              />
            </div>
          </div>

          {leadsLoading && leads.length === 0 ?
            <div className="text-center py-4 text-muted">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading leads…
            </div>
          : leadsError ?
            <p className="text-danger small mb-0">{leadsError}</p>
          : leads.length === 0 ?
            <p className="text-muted small mb-0">No modal leads match these filters.</p>
          : displayLeads.length === 0 ?
            <p className="text-muted small mb-0">No modal leads on this page match your search.</p>
          : (
            <>
              <div className="manage-business-page__table-scroll table-responsive">
                <Table
                  hover
                  size="sm"
                  className="manage-business-page__table manage-business-page__table--leads mb-0 align-middle"
                >
                  <thead>
                    <tr>
                      <th className="manage-business-page__th-id">ID</th>
                      <th className="manage-business-page__th-type">Type</th>
                      <th className="manage-business-page__th-details">Details</th>
                      <th className="manage-business-page__th-created">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLeads.map((row) => (
                      <tr key={row.id}>
                        <td className="manage-business-page__td-id text-muted font-monospace">{row.id}</td>
                        <td className="manage-business-page__td-type">
                          <LeadTypeBadge leadType={String(row.lead_type)} />
                        </td>
                        <td className="manage-business-page__lead-details-cell">
                          <ModalLeadPayloadSummary leadType={String(row.lead_type)} payload={row.payload} />
                        </td>
                        <td
                          className="manage-business-page__td-created small text-muted"
                          title={formatWhen(row.created_at as string)}
                        >
                          {formatWhen(row.created_at as string)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {leadMeta && leadMeta.total > 0 ?
                <ListPager meta={leadMeta} onPage={setLeadPage} />
              : null}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="manage-business-page__lead-card border-0 shadow-sm">
        <Card.Header className="manage-business-page__lead-card-head bg-white py-3">
          <div className="fw-semibold text-dark">Business enquiries</div>
          <div className="small text-muted">Contact form submissions on your public page</div>
        </Card.Header>
        <Card.Body className="pt-0">
          <div className="manage-business-page__filters d-flex flex-wrap gap-3 align-items-end mb-3">
            <div>
              <Form.Label className="manage-business-page__filter-label small text-muted mb-1">Enquiry status</Form.Label>
              <Form.Select
                size="sm"
                value={enqStatus}
                onChange={(e) => {
                  setEnqPage(1);
                  setEnqStatus(e.target.value as typeof enqStatus);
                }}
                style={{ minWidth: 130 }}
              >
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </Form.Select>
            </div>
            <div className="manage-business-page__filter-search flex-grow-1">
              <Form.Label className="manage-business-page__filter-label small text-muted mb-1">Search</Form.Label>
              <Form.Control
                type="search"
                size="sm"
                placeholder="Name, email, or message"
                value={enqSearch}
                onChange={(e) => setEnqSearch(e.target.value)}
                aria-label="Search business enquiries"
              />
            </div>
          </div>

          {enqLoading && enquiries.length === 0 ?
            <div className="text-center py-4 text-muted">
              <Spinner animation="border" size="sm" className="me-2" />
              Loading enquiries…
            </div>
          : enqError ?
            <p className="text-danger small mb-0">{enqError}</p>
          : enquiries.length === 0 ?
            <p className="text-muted small mb-0">No enquiries match these filters.</p>
          : displayEnquiries.length === 0 ?
            <p className="text-muted small mb-0">No enquiries on this page match your search.</p>
          : (
            <>
              <div className="manage-business-page__table-scroll table-responsive">
                <Table
                  hover
                  size="sm"
                  className="manage-business-page__table manage-business-page__table--enquiries mb-0 align-middle"
                >
                  <thead>
                    <tr>
                      <th className="manage-business-page__th-id">ID</th>
                      <th className="manage-business-page__th-name">Name</th>
                      <th className="manage-business-page__th-email">Email</th>
                      <th className="manage-business-page__th-message">Message</th>
                      <th className="manage-business-page__th-enquiry">Enquiry</th>
                      <th className="manage-business-page__th-created">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayEnquiries.map((row) => (
                      <tr key={row.id}>
                        <td className="manage-business-page__td-id text-muted font-monospace">{row.id}</td>
                        <td className="small">{row.name}</td>
                        <td className="small manage-business-page__td-email">
                          {row.email.length > ENQUIRY_MESSAGE_COLLAPSE_CHARS ?
                            <ExpandableText text={row.email} collapseAt={ENQUIRY_MESSAGE_COLLAPSE_CHARS} />
                          : (
                            <a href={`mailto:${encodeURIComponent(row.email)}`}>{row.email}</a>
                          )}
                        </td>
                        <td className="small">
                          <span className="manage-business-page__message-cell">
                            <ExpandableText text={row.message} collapseAt={ENQUIRY_MESSAGE_COLLAPSE_CHARS} />
                          </span>
                        </td>
                        <td className="manage-business-page__td-enquiry">
                          <Form.Select
                            size="sm"
                            className="manage-business-page__enquiry-select"
                            disabled={enqSavingId === row.id}
                            value={row.enquiry_status}
                            onChange={(e) => {
                              patchEnquiry(row.id, {
                                enquiry_status: e.target.value as 'open' | 'resolved',
                              });
                            }}
                          >
                            <option value="open">open</option>
                            <option value="resolved">resolved</option>
                          </Form.Select>
                        </td>
                        <td
                          className="manage-business-page__td-created small text-muted"
                          title={formatWhen(row.created_at)}
                        >
                          {formatWhen(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {enqMeta && enqMeta.total > 0 ? <ListPager meta={enqMeta} onPage={setEnqPage} /> : null}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
