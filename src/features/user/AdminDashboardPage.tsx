'use client';

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Card,
  Container,
  Form,
  Nav,
  Pagination,
  Spinner,
  Table,
} from 'react-bootstrap';
import { PageContainer } from '../../components';
import {
  CustomerRole,
  getAdminEnquiriesList,
  getAdminSupportFeedbackList,
  getAdminUsersList,
  getAdminWebsitesList,
  getProfileCached,
  isAdminProfile,
  patchAdminEnquiry,
  patchAdminSupportFeedback,
  patchAdminUser,
  patchAdminWebsite,
} from '../../api';
import type {
  AdminEnquiryItem,
  AdminSupportFeedbackItem,
  AdminUserItem,
  AdminWebsiteItem,
} from '../../api';
import { useToast } from '../../contexts/ToastContext';
import './AdminDashboardPage.css';

type AdminTab = 'support' | 'enquiries' | 'websites' | 'users';

const PAGE_SIZE = 15;

function isAdminRoleUserRow(r: AdminUserItem): boolean {
  return Number(r.role) === CustomerRole.Admin;
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

function extrasPreview(row: Record<string, unknown>, omit: string[]): string {
  const o: Record<string, unknown> = { ...row };
  for (const k of omit) delete o[k];
  const keys = Object.keys(o);
  if (keys.length === 0) return '—';
  const s = JSON.stringify(o);
  return s.length > 140 ? `${s.slice(0, 137)}…` : s;
}

const ENQUIRY_ROW_META = new Set([
  'id',
  'enquiry_status',
  'enquiry_kind',
  'record_status',
  'created_at',
  'updated_at',
]);

const ENQUIRY_FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  service_topic: 'Service topic',
  message: 'Message',
  subject: 'Subject',
  company: 'Company',
  notes: 'Notes',
};

const ENQUIRY_FIELD_ORDER = [
  'name',
  'email',
  'phone',
  'service_topic',
  'message',
  'subject',
  'company',
  'notes',
];

function formatEnquiryFieldValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function parsePayloadObject(raw: unknown): Record<string, unknown> | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
}

function enquiryPayloadEntries(row: Record<string, unknown>): { key: string; label: string; value: string }[] {
  const fromNested =
    parsePayloadObject(row.payload) ??
    parsePayloadObject(row.body) ??
    parsePayloadObject(row.data);
  const source: Record<string, unknown> = fromNested ?? {};
  if (!fromNested) {
    for (const [k, v] of Object.entries(row)) {
      if (ENQUIRY_ROW_META.has(k)) continue;
      source[k] = v;
    }
  }

  const entries = Object.entries(source).map(([key, val]) => ({
    key,
    label: ENQUIRY_FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: formatEnquiryFieldValue(val).trim(),
  }));

  entries.sort((a, b) => {
    const ia = ENQUIRY_FIELD_ORDER.indexOf(a.key);
    const ib = ENQUIRY_FIELD_ORDER.indexOf(b.key);
    const aKnown = ia !== -1;
    const bKnown = ib !== -1;
    if (aKnown && bKnown) return ia - ib;
    if (aKnown) return -1;
    if (bKnown) return 1;
    return a.key.localeCompare(b.key);
  });

  return entries;
}

function EnquiryPayloadDetails({ row }: { row: Record<string, unknown> }) {
  const entries = enquiryPayloadEntries(row);
  if (entries.length === 0) {
    return <span className="text-muted small">—</span>;
  }
  return (
    <div className="admin-dash__enquiry-payload">
      {entries.map(({ key, label, value }) => (
        <div key={key} className="admin-dash__enquiry-payload__row">
          <span className="admin-dash__enquiry-payload__label">{label}</span>
          <span className="admin-dash__enquiry-payload__value">{value ? value : '—'}</span>
        </div>
      ))}
    </div>
  );
}

function AdminPager({
  page,
  pageSize,
  count,
  onPage,
}: {
  page: number;
  pageSize: number;
  count: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
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
    <div className="admin-dash__footer">
      <span className="admin-dash__count">
        {count} record{count === 1 ? '' : 's'} · page {page} of {totalPages}
      </span>
      <Pagination className="mb-0">
        <Pagination.Prev disabled={page <= 1} onClick={() => onPage(page - 1)} />
        {items}
        <Pagination.Next disabled={page >= totalPages} onClick={() => onPage(page + 1)} />
      </Pagination>
    </div>
  );
}

function SupportFeedbackSection() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState('');
  const [supportStatus, setSupportStatus] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [recordStatus, setRecordStatus] = useState('');
  const [rows, setRows] = useState<AdminSupportFeedbackItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSupportFeedbackList({
        page,
        page_size: PAGE_SIZE,
        ...(kind === 'support' || kind === 'feedback' ? { kind } : {}),
        ...(supportStatus ? { support_status: supportStatus as 'open' | 'in_progress' | 'resolved' } : {}),
        ...(feedbackStatus ? { feedback_status: feedbackStatus as 'open' | 'resolved' } : {}),
        ...(recordStatus ? { record_status: recordStatus as 'active' | 'inactive' } : {}),
      });
      setRows(res.results);
      setCount(res.count);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Load failed.');
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, kind, supportStatus, feedbackStatus, recordStatus, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const patchOne = async (
    id: number,
    kind: 'support' | 'feedback',
    body: Parameters<typeof patchAdminSupportFeedback>[2]
  ) => {
    setSavingId(id);
    try {
      await patchAdminSupportFeedback(id, kind, body);
      showToast('Saved.');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card className="admin-dash__panel border-0 shadow-sm">
      <div className="admin-dash__filters">
        <div className="admin-dash__filter-field">
          <Form.Label>Kind</Form.Label>
          <Form.Select value={kind} onChange={(e) => { setPage(1); setKind(e.target.value); }}>
            <option value="">All</option>
            <option value="support">Support</option>
            <option value="feedback">Feedback</option>
          </Form.Select>
        </div>
        <div className="admin-dash__filter-field">
          <Form.Label>Support status</Form.Label>
          <Form.Select
            value={supportStatus}
            onChange={(e) => { setPage(1); setSupportStatus(e.target.value); }}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
          </Form.Select>
        </div>
        <div className="admin-dash__filter-field">
          <Form.Label>Feedback status</Form.Label>
          <Form.Select
            value={feedbackStatus}
            onChange={(e) => { setPage(1); setFeedbackStatus(e.target.value); }}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </Form.Select>
        </div>
        <div className="admin-dash__filter-field">
          <Form.Label>Record</Form.Label>
          <Form.Select
            value={recordStatus}
            onChange={(e) => { setPage(1); setRecordStatus(e.target.value); }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </div>
      </div>
      <div className="admin-dash__table-wrap">
        {loading ?
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" /> Loading…
          </div>
        : rows.length === 0 ?
          <p className="text-muted text-center py-4 mb-0">No rows match these filters.</p>
        : <Table responsive hover className="admin-dash__table mb-0">
            <thead>
              <tr>
                <th>Kind</th>
                <th>Subject / message</th>
                <th>Support</th>
                <th>Feedback</th>
                <th>Record</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Badge bg={r.kind === 'support' ? 'primary' : 'info'}>{r.kind}</Badge>
                  </td>
                  <td>
                    <div className="fw-semibold text-truncate" style={{ maxWidth: 200 }} title={r.subject}>
                      {r.subject || '—'}
                    </div>
                    <div className="text-muted small admin-dash__truncate" title={String(r.message ?? '')}>
                      {String(r.message ?? '—')}
                    </div>
                  </td>
                  <td>
                    {r.kind === 'support' ?
                      <Form.Select
                        size="sm"
                        className="admin-dash__mono"
                        style={{ minWidth: 130 }}
                        disabled={savingId === r.id}
                        value={(r.support_status as string) ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          patchOne(r.id, 'support', {
                            support_status:
                              v === '' ? null : (v as 'open' | 'in_progress' | 'resolved'),
                          });
                        }}
                      >
                        <option value="">—</option>
                        <option value="open">open</option>
                        <option value="in_progress">in_progress</option>
                        <option value="resolved">resolved</option>
                      </Form.Select>
                    : <span className="text-muted small">n/a</span>}
                  </td>
                  <td>
                    {r.kind === 'feedback' ?
                      <Form.Select
                        size="sm"
                        className="admin-dash__mono"
                        style={{ minWidth: 110 }}
                        disabled={savingId === r.id}
                        value={(r.feedback_status as string) ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          patchOne(r.id, 'feedback', {
                            feedback_status: v === '' ? null : (v as 'open' | 'resolved'),
                          });
                        }}
                      >
                        <option value="">—</option>
                        <option value="open">open</option>
                        <option value="resolved">resolved</option>
                      </Form.Select>
                    : <span className="text-muted small">n/a</span>}
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      className="admin-dash__mono"
                      style={{ minWidth: 100 }}
                      disabled={savingId === r.id}
                      value={(r.record_status as string) ?? 'active'}
                      onChange={(e) => {
                        patchOne(r.id, r.kind, {
                          record_status: e.target.value as 'active' | 'inactive',
                        });
                      }}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </Form.Select>
                  </td>
                  <td className="small text-muted">{formatWhen(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </div>
      {!loading && count > 0 ?
        <AdminPager page={page} pageSize={PAGE_SIZE} count={count} onPage={setPage} />
      : null}
    </Card>
  );
}

function EnquiriesSection() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [enquiryStatus, setEnquiryStatus] = useState('');
  const [enquiryKind, setEnquiryKind] = useState('');
  const [recordStatus, setRecordStatus] = useState('');
  const [rows, setRows] = useState<AdminEnquiryItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminEnquiriesList({
        page,
        page_size: PAGE_SIZE,
        ...(enquiryStatus ? { enquiry_status: enquiryStatus as 'open' | 'resolved' } : {}),
        ...(recordStatus ? { record_status: recordStatus as 'active' | 'inactive' } : {}),
        ...(enquiryKind === 'general' || enquiryKind === 'service' ?
          { enquiry_kind: enquiryKind }
        : {}),
      });
      setRows(res.results);
      setCount(res.count);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Load failed.');
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, enquiryStatus, enquiryKind, recordStatus, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const patchOne = async (id: number, body: Parameters<typeof patchAdminEnquiry>[1]) => {
    setSavingId(id);
    try {
      await patchAdminEnquiry(id, body);
      showToast('Saved.');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card className="admin-dash__panel border-0 shadow-sm">
      <div className="admin-dash__filters">
        <div className="admin-dash__filter-field">
          <Form.Label>Enquiry status</Form.Label>
          <Form.Select
            value={enquiryStatus}
            onChange={(e) => { setPage(1); setEnquiryStatus(e.target.value); }}
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </Form.Select>
        </div>
        <div className="admin-dash__filter-field">
          <Form.Label>Kind</Form.Label>
          <Form.Select
            value={enquiryKind}
            onChange={(e) => { setPage(1); setEnquiryKind(e.target.value); }}
          >
            <option value="">All</option>
            <option value="general">general</option>
            <option value="service">service</option>
          </Form.Select>
        </div>
        <div className="admin-dash__filter-field">
          <Form.Label>Record</Form.Label>
          <Form.Select
            value={recordStatus}
            onChange={(e) => { setPage(1); setRecordStatus(e.target.value); }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </div>
      </div>
      <div className="admin-dash__table-wrap">
        {loading ?
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" /> Loading…
          </div>
        : rows.length === 0 ?
          <p className="text-muted text-center py-4 mb-0">No enquiries match these filters.</p>
        : <Table responsive hover className="admin-dash__table mb-0">
            <thead>
              <tr>
                <th>Details</th>
                <th>Enquiry status</th>
                <th>Record</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="admin-dash__enquiry-cell">
                    <EnquiryPayloadDetails row={r as Record<string, unknown>} />
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      className="admin-dash__mono"
                      style={{ minWidth: 110 }}
                      disabled={savingId === r.id}
                      value={(r.enquiry_status as string) ?? 'open'}
                      onChange={(e) => {
                        patchOne(r.id, {
                          enquiry_status: e.target.value as 'open' | 'resolved',
                        });
                      }}
                    >
                      <option value="open">open</option>
                      <option value="resolved">resolved</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      className="admin-dash__mono"
                      style={{ minWidth: 100 }}
                      disabled={savingId === r.id}
                      value={(r.record_status as string) ?? 'active'}
                      onChange={(e) => {
                        patchOne(r.id, {
                          record_status: e.target.value as 'active' | 'inactive',
                        });
                      }}
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </Form.Select>
                  </td>
                  <td className="small text-muted">{formatWhen(r.created_at as string)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </div>
      {!loading && count > 0 ?
        <AdminPager page={page} pageSize={PAGE_SIZE} count={count} onPage={setPage} />
      : null}
    </Card>
  );
}

function WebsitesSection() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [recordStatus, setRecordStatus] = useState('');
  const [rows, setRows] = useState<AdminWebsiteItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminWebsitesList({
        page,
        page_size: PAGE_SIZE,
        ...(recordStatus ? { record_status: recordStatus as 'active' | 'inactive' } : {}),
      });
      setRows(res.results);
      setCount(res.count);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Load failed.');
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, recordStatus, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const patchOne = async (slug: string, body: Parameters<typeof patchAdminWebsite>[1]) => {
    setSavingKey(slug);
    try {
      await patchAdminWebsite(slug, body);
      showToast('Saved.');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <Card className="admin-dash__panel border-0 shadow-sm">
      <div className="admin-dash__filters">
        <div className="admin-dash__filter-field">
          <Form.Label>Record</Form.Label>
          <Form.Select
            value={recordStatus}
            onChange={(e) => { setPage(1); setRecordStatus(e.target.value); }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </div>
      </div>
      <div className="admin-dash__table-wrap">
        {loading ?
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" /> Loading…
          </div>
        : rows.length === 0 ?
          <p className="text-muted text-center py-4 mb-0">No websites match these filters.</p>
        : <Table responsive hover className="admin-dash__table mb-0">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Details</th>
                <th>Record</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const slug = typeof r.slug === 'string' ? r.slug : '';
                const key = slug || `row-${i}`;
                return (
                  <tr key={key}>
                    <td className="admin-dash__mono fw-semibold">{slug || '—'}</td>
                    <td>
                      <pre className="admin-dash__json mb-0">
                        {extrasPreview(r as Record<string, unknown>, ['slug', 'record_status', 'updated_at', 'created_at'])}
                      </pre>
                    </td>
                    <td>
                      {slug ?
                        <Form.Select
                          size="sm"
                          className="admin-dash__mono"
                          style={{ minWidth: 100 }}
                          disabled={savingKey === slug}
                          value={(r.record_status as string) ?? 'active'}
                          onChange={(e) => {
                            patchOne(slug, {
                              record_status: e.target.value as 'active' | 'inactive',
                            });
                          }}
                        >
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                        </Form.Select>
                      : <span className="text-muted small">No slug</span>}
                    </td>
                    <td className="small text-muted">{formatWhen(r.updated_at as string)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        }
      </div>
      {!loading && count > 0 ?
        <AdminPager page={page} pageSize={PAGE_SIZE} count={count} onPage={setPage} />
      : null}
    </Card>
  );
}

function UsersSection() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [recordStatus, setRecordStatus] = useState('');
  const [rows, setRows] = useState<AdminUserItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersList({
        page,
        page_size: PAGE_SIZE,
        ...(recordStatus ? { record_status: recordStatus as 'active' | 'inactive' } : {}),
      });
      setRows(res.results);
      setCount(res.count);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Load failed.');
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, recordStatus, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const patchOne = async (id: number, body: Parameters<typeof patchAdminUser>[1]) => {
    setSavingId(id);
    try {
      await patchAdminUser(id, body);
      showToast('Saved.');
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card className="admin-dash__panel border-0 shadow-sm">
      <div className="admin-dash__filters">
        <div className="admin-dash__filter-field">
          <Form.Label>Record</Form.Label>
          <Form.Select
            value={recordStatus}
            onChange={(e) => { setPage(1); setRecordStatus(e.target.value); }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Form.Select>
        </div>
      </div>
      <div className="admin-dash__table-wrap">
        {loading ?
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" /> Loading…
          </div>
        : rows.length === 0 ?
          <p className="text-muted text-center py-4 mb-0">No users match these filters.</p>
        : <Table responsive hover className="admin-dash__table mb-0">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Auth</th>
                <th>Record</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.username}</td>
                  <td className="small">{r.email}</td>
                  <td>
                    <Badge bg="secondary">{r.auth_provider}</Badge>
                  </td>
                  <td>
                    {isAdminRoleUserRow(r) ?
                      <span className="text-muted small text-capitalize">{String(r.record_status)}</span>
                    : <Form.Select
                        size="sm"
                        className="admin-dash__mono"
                        style={{ minWidth: 100 }}
                        disabled={savingId === r.id}
                        value={r.record_status}
                        onChange={(e) => {
                          patchOne(r.id, {
                            record_status: e.target.value as 'active' | 'inactive',
                          });
                        }}
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </Form.Select>
                    }
                  </td>
                  <td className="small text-muted">{formatWhen(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        }
      </div>
      {!loading && count > 0 ?
        <AdminPager page={page} pageSize={PAGE_SIZE} count={count} onPage={setPage} />
      : null}
    </Card>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [gate, setGate] = useState<'pending' | 'ok' | 'denied'>('pending');
  const [tab, setTab] = useState<AdminTab>('support');

  useEffect(() => {
    let cancelled = false;
    getProfileCached()
      .then((p) => {
        if (cancelled) return;
        if (!isAdminProfile(p)) {
          setGate('denied');
          router.replace('/user?as=member');
          return;
        }
        setGate('ok');
      })
      .catch(() => {
        if (!cancelled) {
          setGate('denied');
          showToast('Could not verify your account.');
          router.replace('/user?as=member');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router, showToast]);

  if (gate !== 'ok') {
    return (
      <PageContainer>
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="text-muted mt-3 mb-0">Checking access…</p>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <main className="admin-dash">
        <Container fluid="lg">
          <header className="admin-dash__header">
            <div>
              <h1 className="admin-dash__title">Admin</h1>
              <p className="admin-dash__lead">
                Support & feedback, enquiries, websites, and users from{' '}
                <code className="admin-dash__mono">/api/admin/</code>. Updates save immediately; the API returns 403 if
                your account does not have the admin role.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link href="/user?as=member" className="btn btn-outline-secondary btn-sm">
                Member dashboard
              </Link>
              <Link href="/" className="btn btn-outline-primary btn-sm">
                Home
              </Link>
            </div>
          </header>

          <Nav variant="pills" className="admin-dash__nav flex-wrap gap-2 mb-4">
            <Nav.Item>
              <Nav.Link active={tab === 'support'} onClick={() => setTab('support')}>
                Support & feedback
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={tab === 'enquiries'} onClick={() => setTab('enquiries')}>
                Enquiries
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={tab === 'websites'} onClick={() => setTab('websites')}>
                Websites
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link active={tab === 'users'} onClick={() => setTab('users')}>
                Users
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {tab === 'support' && <SupportFeedbackSection />}
          {tab === 'enquiries' && <EnquiriesSection />}
          {tab === 'websites' && <WebsitesSection />}
          {tab === 'users' && <UsersSection />}
        </Container>
      </main>
    </PageContainer>
  );
}
