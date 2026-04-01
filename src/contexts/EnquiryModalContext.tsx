import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { submitMarketingEnquiry } from '../api/marketingEnquiry';
import { useToast } from './ToastContext';
import './EnquiryModalContext.css';

type EnquiryModalContextValue = {
  openEnquiryModal: () => void;
};

const EnquiryModalContext = createContext<EnquiryModalContextValue | null>(null);

export function useEnquiryModal(): EnquiryModalContextValue {
  const ctx = useContext(EnquiryModalContext);
  if (!ctx) {
    throw new Error('useEnquiryModal must be used within EnquiryModalProvider');
  }
  return ctx;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EnquiryModalProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const openEnquiryModal = useCallback(() => setShow(true), []);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setMessage('');
    setFieldErrors({});
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setShow(false);
    resetForm();
  }, [submitting, resetForm]);

  const validate = useCallback((): boolean => {
    const next: typeof fieldErrors = {};
    const n = name.trim();
    const e = email.trim();
    const m = message.trim();
    if (n.length < 2) next.name = 'Please enter your name.';
    if (!e) next.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(e)) next.email = 'Please enter a valid email address.';
    if (m.length < 8) next.message = 'Please enter a message (at least 8 characters).';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }, [name, email, message]);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitMarketingEnquiry({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      showToast('Thanks — we received your enquiry and will get back to you soon.', 'success');
      setShow(false);
      resetForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const value = useMemo(() => ({ openEnquiryModal }), [openEnquiryModal]);

  return (
    <EnquiryModalContext.Provider value={value}>
      {children}
      <Modal
        show={show}
        onHide={handleClose}
        centered
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
        className="crystal-enquiry-modal"
        dialogClassName="crystal-enquiry-modal__dialog"
      >
        <Modal.Header closeButton={!submitting}>
          <Modal.Title as="h2" className="h5 mb-0">
            Send an enquiry
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit} noValidate>
          <Modal.Body>
            <p className="text-muted small mb-3">
              Tell us what you need — we&apos;ll reply by email.
            </p>
            <Form.Group className="mb-3" controlId="enquiry-name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={submitting}
                isInvalid={!!fieldErrors.name}
                placeholder="Your name"
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="enquiry-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting}
                isInvalid={!!fieldErrors.email}
                placeholder="you@example.com"
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-0" controlId="enquiry-message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
                isInvalid={!!fieldErrors.message}
                placeholder="How can we help?"
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.message}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" type="button" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Sending…
                </>
              ) : (
                'Send enquiry'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </EnquiryModalContext.Provider>
  );
}
