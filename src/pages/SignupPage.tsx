import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageContainer } from '../components';
import { sendOtp, verifyOtp, signup } from '../api';
import { useToast } from '../contexts/ToastContext';
import './AuthPage.css';

type Step = 1 | 2 | 3;

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailVal = email.trim();
    if (!emailVal) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const data = await sendOtp(emailVal);
      if (!data.token) {
        const msg = 'Invalid response from server.';
        setError(msg);
        showToast(msg);
        return;
      }
      setOtpToken(data.token);
      setStep(2);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpVal = otp.trim();
    if (!otpVal) {
      setError('Please enter the OTP.');
      return;
    }
    if (!otpToken) {
      setError('Session expired. Please request a new OTP.');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(otpToken, otpVal);
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired OTP';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please fill in password fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!otpToken) {
      setError('Session expired. Please complete email verification again.');
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        username: username.trim(),
        password,
        token: otpToken,
      });
      navigate('/login', { state: { message: 'Account created. You can log in now.', email: email.trim() } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep(1);
    setOtpToken(null);
    setOtp('');
    setError(null);
  };

  const goBackToOtp = () => {
    setStep(2);
    setError(null);
  };

  return (
    <PageContainer>
      <main className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <div className="auth-page__steps mb-3">
                <span className={step >= 1 ? 'auth-page__step auth-page__step--active' : 'auth-page__step'}>1</span>
                <span className="auth-page__step-line" />
                <span className={step >= 2 ? 'auth-page__step auth-page__step--active' : 'auth-page__step'}>2</span>
                <span className="auth-page__step-line" />
                <span className={step >= 3 ? 'auth-page__step auth-page__step--active' : 'auth-page__step'}>3</span>
              </div>

              <Card className="auth-page__card shadow-sm">
                <Card.Body className="p-4 p-md-5">
                  <h1 className="auth-page__title">Sign up</h1>

                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  {/* Step 1: Verify email (send OTP) */}
                  {step === 1 && (
                    <>
                      <p className="auth-page__subtitle text-muted mb-4">
                        Enter your email. We&apos;ll send you a verification code.
                      </p>
                      <Form onSubmit={handleSendOtp}>
                        <Form.Group className="mb-4">
                          <Form.Label className="required">Email</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            disabled={loading}
                          />
                        </Form.Group>
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          className="w-100 auth-page__submit"
                          disabled={loading}
                        >
                          {loading ? <><Spinner animation="border" size="sm" className="me-2" />Sending…</> : 'Send OTP'}
                        </Button>
                      </Form>
                    </>
                  )}

                  {/* Step 2: Enter OTP */}
                  {step === 2 && (
                    <>
                      <p className="auth-page__subtitle text-muted mb-4">
                        Enter the 6-digit code sent to <strong>{email}</strong>.{' '}
                        <Button type="button" variant="link" className="p-0 align-baseline auth-page__link" onClick={goBackToEmail}>
                          Change email
                        </Button>
                      </p>
                      <Form onSubmit={handleVerifyOtp}>
                        <Form.Group className="mb-4">
                          <Form.Label className="required">OTP</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            autoComplete="one-time-code"
                            disabled={loading}
                            className="auth-page__otp-input"
                          />
                        </Form.Group>
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          className="w-100 auth-page__submit"
                          disabled={loading || otp.length < 4}
                        >
                          {loading ? <><Spinner animation="border" size="sm" className="me-2" />Verifying…</> : 'Verify OTP'}
                        </Button>
                      </Form>
                    </>
                  )}

                  {/* Step 3: Username & password */}
                  {step === 3 && (
                    <>
                      <p className="auth-page__subtitle text-muted mb-4">
                        Create your username and password. Email <strong>{email}</strong> is verified.{' '}
                        <Button type="button" variant="link" className="p-0 align-baseline auth-page__link" onClick={goBackToOtp}>
                          Verify again
                        </Button>
                      </p>
                      <Form onSubmit={handleSignup}>
                        <Form.Group className="mb-3">
                          <Form.Label className="required">Username</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="johndoe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="required">Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                          />
                          <Form.Text className="text-muted">At least 8 characters.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label className="required">Confirm password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                          />
                        </Form.Group>
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          className="w-100 auth-page__submit"
                          disabled={loading}
                        >
                          {loading ? <><Spinner animation="border" size="sm" className="me-2" />Creating account…</> : 'Sign up'}
                        </Button>
                      </Form>
                    </>
                  )}

                  <p className="auth-page__switch text-center mt-4 mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-page__link">Log in</Link>
                  </p>
                </Card.Body>
              </Card>

              <p className="text-center mt-3">
                <Link to="/crystal" className="text-muted">← Back to home</Link>
              </p>
            </Col>
          </Row>
        </Container>
      </main>
    </PageContainer>
  );
}
