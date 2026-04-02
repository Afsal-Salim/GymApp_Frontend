import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageContainer, WhatsAppLogoIcon } from '../../components';
import { submitPublicServiceEnquiry } from '../../api';
import { clampPhoneDigitsInput, isTenDigitPhone } from '../../utils/phoneDigits';
import { whatsappDefaultMessage, whatsappPhone } from '../../config/env';
import { useToast } from '../../contexts/ToastContext';
import './ServiceEnquiryPage.css';

const WHATSAPP_HREF = whatsappPhone
  ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappDefaultMessage)}`
  : '';

const CONTACT_ITEMS = [
  { type: 'Email', value: 'crystal.gym.in@gmail.com', href: 'mailto:crystal.gym.in@gmail.com' },
  { type: 'Phone', value: '+91 82379 51793', href: 'tel:+918237951793' },
  { type: 'WhatsApp', value: 'Chat with us instantly', href: WHATSAPP_HREF },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SERVICE_TOPIC = 'Custom website & services';

export default function ServiceEnquiryPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceTopic, setServiceTopic] = useState(DEFAULT_SERVICE_TOPIC);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  const validate = (): boolean => {
    const next: typeof fieldErrors = {};
    const n = name.trim();
    const e = email.trim();
    const p = phone.trim();
    const m = message.trim();
    if (n.length < 2 || n.length > 200) next.name = 'Enter your name (2–200 characters).';
    if (!e) next.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(e)) next.email = 'Please enter a valid email address.';
    const phoneDigits = clampPhoneDigitsInput(p);
    if (!isTenDigitPhone(phoneDigits)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (m.length < 3 || m.length > 5000) next.message = 'Tell us what you need (3–5000 characters).';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitPublicServiceEnquiry({
        name: name.trim(),
        email: email.trim(),
        phone: clampPhoneDigitsInput(phone),
        message: message.trim(),
        ...(serviceTopic.trim() ? { service_topic: serviceTopic.trim().slice(0, 255) } : {}),
      });
      showToast('Thanks — we received your request and will get back to you soon.', 'success');
      setName('');
      setEmail('');
      setPhone('');
      setServiceTopic(DEFAULT_SERVICE_TOPIC);
      setMessage('');
      setFieldErrors({});
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="service-enquiry-page">
      <main className="service-enquiry-page__main">
        <Container>
          <nav className="service-enquiry-page__crumb small text-muted mb-3">
            <Link to="/">Home</Link>
            <span aria-hidden> / </span>
            <span>Custom &amp; services</span>
          </nav>

          <header className="service-enquiry-page__header text-center mb-4 mb-md-5">
            <h1 className="service-enquiry-page__title">Custom webpage &amp; services</h1>
            <p className="service-enquiry-page__lead text-muted mx-auto mb-0">
              Create a fully customised experience beyond standard plans — extra branding, integrations, or
              multi-location setups. Tell us what you&apos;re looking for and we&apos;ll follow up.
            </p>
          </header>

          <Row className="g-4 justify-content-center">
            <Col lg={5}>
              <Card className="service-enquiry-page__contact-card border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h2 className="h6 text-uppercase text-muted fw-bold letter-spacing mb-3">Contact us</h2>
                  <ul className="list-unstyled service-enquiry-page__contact-list mb-0">
                    {CONTACT_ITEMS.map(({ type, value, href }) => (
                      <li key={type} className="mb-3">
                        <div className="small text-muted fw-semibold text-uppercase mb-1">{type}</div>
                        {href ?
                          <a
                            href={href}
                            className="service-enquiry-page__contact-link"
                            {...(type === 'WhatsApp' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            {type === 'WhatsApp' ?
                              <span className="d-inline-flex align-items-center gap-2">
                                <WhatsAppLogoIcon className="service-enquiry-page__wa-icon" />
                                {value}
                              </span>
                            : value}
                          </a>
                        : (
                          <span className="text-muted">{value} (configure WhatsApp in env)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="service-enquiry-page__form-card border-0 shadow-sm">
                <Card.Body className="p-4 p-md-5">
                  <h2 className="h5 mb-3">Send a service enquiry</h2>
                  <p className="text-muted small mb-4">
                    Required fields help us respond faster. Your details are only used to discuss your project.
                  </p>
                  <Form onSubmit={handleSubmit} noValidate>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group controlId="svc-name">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={submitting}
                            isInvalid={!!fieldErrors.name}
                            autoComplete="name"
                            maxLength={200}
                          />
                          <Form.Control.Feedback type="invalid">{fieldErrors.name}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="svc-email">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitting}
                            isInvalid={!!fieldErrors.email}
                            autoComplete="email"
                          />
                          <Form.Control.Feedback type="invalid">{fieldErrors.email}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="svc-phone">
                          <Form.Label>Phone</Form.Label>
                          <Form.Control
                            type="tel"
                            inputMode="numeric"
                            value={phone}
                            onChange={(e) => setPhone(clampPhoneDigitsInput(e.target.value))}
                            disabled={submitting}
                            isInvalid={!!fieldErrors.phone}
                            autoComplete="tel"
                            maxLength={10}
                            placeholder="10-digit mobile number"
                          />
                          <Form.Control.Feedback type="invalid">{fieldErrors.phone}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="svc-topic">
                          <Form.Label>What you&apos;re looking for</Form.Label>
                          <Form.Control
                            value={serviceTopic}
                            onChange={(e) => setServiceTopic(e.target.value)}
                            disabled={submitting}
                            maxLength={255}
                            placeholder="e.g. Custom website, API, multi-gym"
                          />
                          <Form.Text className="text-muted">Optional short label (max 255 characters).</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group controlId="svc-message">
                          <Form.Label>Details</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={submitting}
                            isInvalid={!!fieldErrors.message}
                            placeholder="Describe goals, timeline, and any must-have features."
                            maxLength={5000}
                          />
                          <Form.Control.Feedback type="invalid">{fieldErrors.message}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex flex-wrap gap-2 justify-content-end mt-4">
                      <Link
                        to="/plans"
                        className={`btn btn-outline-secondary${submitting ? ' disabled' : ''}`}
                        aria-disabled={submitting}
                        tabIndex={submitting ? -1 : undefined}
                        onClick={(e) => {
                          if (submitting) e.preventDefault();
                        }}
                      >
                        Back to plans
                      </Link>
                      <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ?
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Sending…
                          </>
                        : 'Submit enquiry'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Alert variant="light" className="service-enquiry-page__note mt-4 mb-0 border">
            <strong>General questions?</strong>{' '}
            <Link to="/#contacts">Use the homepage contact section</Link> or the quick enquiry form — this form is
            for <strong>service</strong> and custom-build requests (10-digit mobile required).
          </Alert>
        </Container>
      </main>
    </PageContainer>
  );
}
