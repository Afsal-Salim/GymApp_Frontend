import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { submitMarketingEnquiry } from '@/api/marketingEnquiry';
import { submitPublicServiceEnquiry } from '@/api/serviceEnquiry';
import { useToast } from '../ToastContext/ToastContext';
import { clampPhoneDigitsInput, isTenDigitPhone } from '@/utils/phoneDigits';
import './EnquiryModalContext.css';

type EnquiryMode = 'general' | 'service';

type EnquiryModalContextValue = {
  openEnquiryModal: () => void;
  openServiceEnquiryModal: () => void;
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
  const [mode, setMode] = useState<EnquiryMode>('general');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceTopic, setServiceTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
    phone?: string;
  }>({});

  const openEnquiryModal = useCallback(() => {
    setMode('general');
    setShow(true);
  }, []);

  const openServiceEnquiryModal = useCallback(() => {
    setMode('service');
    setShow(true);
  }, []);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setMessage('');
    setPhone('');
    setServiceTopic('');
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
    const p = phone.trim();
    if (n.length < 2) next.name = 'Please enter your name.';
    if (!e) next.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(e)) next.email = 'Please enter a valid email address.';
    if (mode === 'general') {
      if (m.length < 8) next.message = 'Please enter a message (at least 8 characters).';
    } else {
      const phoneDigits = clampPhoneDigitsInput(p);
      if (!isTenDigitPhone(phoneDigits)) next.phone = 'Enter a valid 10-digit mobile number.';
      if (m.length < 3) next.message = 'Please describe what you need (at least 3 characters).';
      if (m.length > 5000) next.message = 'Message must be at most 5000 characters.';
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }, [name, email, message, phone, mode]);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === 'general') {
        await submitMarketingEnquiry({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        });
        showToast('Thanks — we received your enquiry and will get back to you soon.', 'success');
      } else {
        await submitPublicServiceEnquiry({
          name: name.trim().slice(0, 200),
          email: email.trim(),
          phone: clampPhoneDigitsInput(phone),
          message: message.trim(),
          ...(serviceTopic.trim() ? { service_topic: serviceTopic.trim().slice(0, 255) } : {}),
        });
        showToast('Thanks — we received your service enquiry and will reply soon.', 'success');
      }
      setShow(false);
      resetForm();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const value = useMemo(
    () => ({ openEnquiryModal, openServiceEnquiryModal }),
    [openEnquiryModal, openServiceEnquiryModal]
  );

  const isService = mode === 'service';

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
            {isService ? 'Service enquiry' : 'Send an enquiry'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit} noValidate>
          <Modal.Body>
            <p className="text-muted small mb-3">
              {isService ?
                'Tell us about custom websites, integrations, or other services — include a phone number so we can reach you.'
              : 'Tell us what you need — we&apos;ll reply by email.'}
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
                maxLength={isService ? 200 : undefined}
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
            {isService && (
              <>
                <Form.Group className="mb-3" controlId="enquiry-phone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(clampPhoneDigitsInput(e.target.value))}
                    autoComplete="tel"
                    disabled={submitting}
                    isInvalid={!!fieldErrors.phone}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                  <Form.Control.Feedback type="invalid">{fieldErrors.phone}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="enquiry-service-topic">
                  <Form.Label>What you&apos;re looking for (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={serviceTopic}
                    onChange={(e) => setServiceTopic(e.target.value)}
                    disabled={submitting}
                    placeholder="e.g. Custom website, API access"
                    maxLength={255}
                  />
                </Form.Group>
              </>
            )}
            <Form.Group className="mb-0" controlId="enquiry-message">
              <Form.Label>{isService ? 'Details' : 'Message'}</Form.Label>
              <Form.Control
                as="textarea"
                rows={isService ? 5 : 4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
                isInvalid={!!fieldErrors.message}
                placeholder={isService ? 'Goals, timeline, must-haves…' : 'How can we help?'}
                maxLength={isService ? 5000 : undefined}
              />
              <Form.Control.Feedback type="invalid">{fieldErrors.message}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="outline-secondary" type="button" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ?
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Sending…
                </>
              : isService ?
                'Send service enquiry'
              : 'Send enquiry'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </EnquiryModalContext.Provider>
  );
}
