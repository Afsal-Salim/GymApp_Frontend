import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { PageContainer } from '../components';
import './PaymentPage.css';

const PLANS: Record<string, { name: string; price: string; period: string }> = {
  starter: {
    name: 'Starter',
    price: '$9',
    period: '/month',
  },
  pro: {
    name: 'Pro',
    price: '$19',
    period: '/month',
  },
};

type PaymentPageProps = {
  plan: 'starter' | 'pro';
};

export default function PaymentPage({ plan }: PaymentPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const details = PLANS[plan];
  if (!details) {
    return (
      <PageContainer>
        <p className="text-muted">Invalid plan.</p>
        <Link to="/myapp">Back to home</Link>
      </PageContainer>
    );
  }

  return (
    <main className="payment-page">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <h1 className="payment-page__title">Payment</h1>
            <p className="payment-page__subtitle text-muted mb-4">
              Complete checkout for <strong>{details.name}</strong> — {details.price}{details.period}
            </p>

            <Card className="payment-page__card shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="payment-page__summary mb-4 p-3 bg-light rounded-3">
                  <span className="d-block fw-semibold">{details.name}</span>
                  <span className="text-primary fw-bold">
                    {details.price}
                    <small className="text-muted fw-normal">{details.period}</small>
                  </span>
                </div>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Business slug (name of the webpage)</Form.Label>
                    <Form.Control type="text" placeholder="my-business" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" placeholder="you@example.com" required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Card number</Form.Label>
                    <Form.Control type="text" placeholder="4242 4242 4242 4242" maxLength={19} />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Expiry</Form.Label>
                        <Form.Control type="text" placeholder="MM/YY" maxLength={5} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CVV</Form.Label>
                        <Form.Control type="text" placeholder="123" maxLength={4} />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-4">
                    <Form.Label>Name on card</Form.Label>
                    <Form.Control type="text" placeholder="Full name" />
                  </Form.Group>
                  <Button type="submit" variant="primary" size="lg" className="w-100 payment-page__submit">
                    Pay {details.price}{details.period}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <p className="text-center">
              <Link to="/myapp" className="text-muted">
                ← Back to packages
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </main>
  );
}
