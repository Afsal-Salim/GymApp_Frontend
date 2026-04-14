'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Form, Pagination, Spinner } from 'react-bootstrap';
import { PageContainer } from '../../components';
import {
  CLIENT_SUPPORT_LIST_PAGE_SIZE,
  getAccessToken,
  listClientSupportMessages,
  postClientSupportMessage,
  type ClientSupportMessage,
  type ClientSupportMessageKind,
} from '../../api';
import { useToast } from '../../contexts/ToastContext';
import './UserContentPolicyPage.css';
import './SupportFeedbackPage.css';

const MESSAGE_MIN = 3;
const MESSAGE_MAX = 5000;
const SUBJECT_MAX = 200;

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function kindLabel(kind: ClientSupportMessageKind): string {
  return kind === 'feedback' ? 'Feedback' : 'Support';
}

export default function SupportFeedbackPage() {
  const { showToast } = useToast();
  const [authed] = useState(() => Boolean(getAccessToken()));

  const [kind, setKind] = useState<ClientSupportMessageKind>('support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [items, setItems] = useState<ClientSupportMessage[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listTotalPages, setListTotalPages] = useState(1);
  const [listTotalCount, setListTotalCount] = useState(0);
  const [listLoading, setListLoading] = useState(authed);
  const [listError, setListError] = useState<string | null>(null);
  const [listReloadKey, setListReloadKey] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    if (!getAccessToken()) return;
    setListLoading(true);
    setListError(null);
    try {
      const { results, meta } = await listClientSupportMessages({
        page: listPage,
        page_size: CLIENT_SUPPORT_LIST_PAGE_SIZE,
      });
      setItems(results);
      setListTotalPages(Math.max(1, meta.total_pages));
      setListTotalCount(meta.total);
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Could not load your messages.');
    } finally {
      setListLoading(false);
    }
  }, [listPage]);

  useEffect(() => {
    if (!authed) return;
    void loadList();
  }, [authed, listPage, listReloadKey, loadList]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    const trimmed = message.trim();
    if (trimmed.length < MESSAGE_MIN) {
      setSubmitError(`Message must be at least ${MESSAGE_MIN} characters.`);
      return;
    }
    if (trimmed.length > MESSAGE_MAX) {
      setSubmitError(`Message must be at most ${MESSAGE_MAX} characters.`);
      return;
    }
    if (subject.trim().length > SUBJECT_MAX) {
      setSubmitError(`Subject must be at most ${SUBJECT_MAX} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      await postClientSupportMessage({
        kind,
        message: trimmed,
        subject: subject.trim() || undefined,
      });
      setListPage(1);
      setListReloadKey((k) => k + 1);
      setMessage('');
      setSubject('');
      showToast('Message sent. We will get back to you as soon as we can.', 'success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not send your message.');
    } finally {
      setSubmitting(false);
    }
  }

  const messageLen = message.trim().length;

  return (
    <PageContainer className="user-content-policy-page support-feedback-page">
      <main className="user-content-policy-page__main">
        <div className="user-content-policy-page__inner">
          <p className="user-content-policy-page__crumb mb-2">
            <Link href="/">Crystal</Link>
            <span className="text-muted" aria-hidden>
              {' '}
              /{' '}
            </span>
            <span className="text-muted">Support</span>
          </p>
          <h1 className="user-content-policy-page__title h3 mb-3">Support &amp; feedback</h1>
          <p className="text-muted small mb-4">
            Signed-in customers can send support requests and product feedback directly to our team. Messages are tied
            to your account.
          </p>

          {!authed ? (
            <Alert variant="light" className="border support-feedback-page__guest-alert">
              <p className="mb-2">
                <strong>Sign in</strong> to send a support or feedback message.
              </p>
              <Link href="/login?from=%2Fsupport" className="btn btn-primary btn-sm">
                Sign in
              </Link>
              <p className="small text-muted mb-0 mt-3">
                Not a customer yet? You can still reach us from the homepage <strong>Contacts</strong> section or{' '}
                <strong>Enquiry</strong> in the footer.
              </p>
            </Alert>
          ) : (
            <>
              <Form onSubmit={handleSubmit} className="support-feedback-page__form mb-5">
                {submitError ? (
                  <Alert variant="danger" className="mb-3">
                    {submitError}
                  </Alert>
                ) : null}
                <Form.Group className="mb-3" controlId="support-kind">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={kind}
                    onChange={(ev) => setKind(ev.target.value as ClientSupportMessageKind)}
                    aria-label="Message type"
                  >
                    <option value="support">Support</option>
                    <option value="feedback">Feedback</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="support-subject">
                  <Form.Label>
                    Subject <span className="text-muted fw-normal">(optional)</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={SUBJECT_MAX}
                    value={subject}
                    onChange={(ev) => setSubject(ev.target.value)}
                    placeholder="e.g. Billing question"
                    autoComplete="off"
                  />
                  <Form.Text muted>
                    {subject.length}/{SUBJECT_MAX} characters
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId="support-message">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={message}
                    onChange={(ev) => setMessage(ev.target.value)}
                    placeholder="Describe your question or feedback…"
                    required
                    minLength={MESSAGE_MIN}
                    maxLength={MESSAGE_MAX}
                    aria-describedby="support-message-hint"
                  />
                  <Form.Text id="support-message-hint" muted>
                    {messageLen} / {MESSAGE_MAX} characters (minimum {MESSAGE_MIN})
                  </Form.Text>
                </Form.Group>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    'Send'
                  )}
                </Button>
              </Form>

              <section className="support-feedback-page__history" aria-labelledby="support-history-heading">
                <h2 id="support-history-heading" className="h5 mb-3">
                  Your messages
                </h2>
                {listLoading ? (
                  <div className="text-muted d-flex align-items-center gap-2 py-3">
                    <Spinner animation="border" size="sm" role="status" />
                    <span>Loading…</span>
                  </div>
                ) : listError ? (
                  <Alert variant="warning" className="mb-0">
                    {listError}{' '}
                    <Button variant="outline-dark" size="sm" className="ms-2" type="button" onClick={() => void loadList()}>
                      Retry
                    </Button>
                  </Alert>
                ) : items.length === 0 ? (
                  <p className="text-muted small mb-0">No messages yet. Your submissions will appear here.</p>
                ) : (
                  <ul className="support-feedback-page__history-list list-unstyled mb-0">
                    {items.map((row) => (
                      <li key={row.id} className="support-feedback-page__history-item border rounded p-3 mb-3">
                        <div className="d-flex flex-wrap gap-2 align-items-baseline justify-content-between mb-2">
                          <span className="badge text-bg-secondary">{kindLabel(row.kind)}</span>
                          <time className="small text-muted" dateTime={row.created_at}>
                            {formatSubmittedAt(row.created_at)}
                          </time>
                        </div>
                        {row.subject ? <p className="fw-semibold small mb-2">{row.subject}</p> : null}
                        <p className="mb-0 small support-feedback-page__history-message">{row.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {!listLoading && !listError && listTotalCount > 0 ? (
                  <div className="support-feedback-page__pagination d-flex flex-wrap align-items-center justify-content-between gap-2 pt-1">
                    <p className="small text-muted mb-0">
                      {listTotalCount} total · {CLIENT_SUPPORT_LIST_PAGE_SIZE} per page · page {listPage} of{' '}
                      {listTotalPages}
                    </p>
                    {listTotalPages > 1 ? (
                      <Pagination className="mb-0">
                        <Pagination.Prev
                          disabled={listPage <= 1}
                          onClick={() => setListPage((p) => Math.max(1, p - 1))}
                        />
                        <Pagination.Next
                          disabled={listPage >= listTotalPages}
                          onClick={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                        />
                      </Pagination>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </>
          )}
        </div>
      </main>
    </PageContainer>
  );
}
