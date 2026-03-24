import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageContainer } from '../../components';
import { forgotPasswordRequest, verifyResetOtp, resetPassword } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import './AuthPage.css';

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailVal = email.trim();
    if (!emailVal) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const data = await forgotPasswordRequest(emailVal);
      setOtpToken(data.token);
      setStep(2);
      showToast('Reset code sent to your email.', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset code';
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
      setError('Session expired. Please request a new code.');
      return;
    }
    setLoading(true);
    try {
      await verifyResetOtp(email.trim(), otpToken, otpVal);
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired OTP';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!otpToken) {
      setError('Session expired. Please start again.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim(), otpToken, otp, newPassword, confirmPassword);
      showToast('Password reset successfully. You can log in now.', 'success');
      navigate('/login', { state: { email: email.trim(), message: 'Password reset successfully. You can log in now.' } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password';
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
                  <h1 className="auth-page__title">Forgot password</h1>

                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  {step === 1 && (
                    <>
                      <p className="auth-page__subtitle text-muted mb-4">
                        Enter your email and we&apos;ll send you a code to reset your password.
                      </p>
                      <Form onSubmit={handleRequestOtp}>
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
                          {loading ? <><Spinner animation="border" size="sm" className="me-2" />Sending…</> : 'Send code'}
                        </Button>
                      </Form>
                    </>
                  )}

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

                  {step === 3 && (
                    <>
                      <p className="auth-page__subtitle text-muted mb-4">
                        Enter your new password. Email <strong>{email}</strong> is verified.{' '}
                        <Button type="button" variant="link" className="p-0 align-baseline auth-page__link" onClick={goBackToOtp}>
                          Verify again
                        </Button>
                      </p>
                      <Form onSubmit={handleResetPassword}>
                        <Form.Group className="mb-3">
                          <Form.Label className="required">New password</Form.Label>
                          <div className="auth-page__password-wrap">
                            <Form.Control
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              autoComplete="new-password"
                              disabled={loading}
                              className="auth-page__password-input"
                            />
                            <Button
                              type="button"
                              variant="outline-secondary"
                              className="auth-page__password-toggle"
                              onClick={() => setShowPassword((p) => !p)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <span className="auth-page__icon" aria-hidden>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                </span>
                              ) : (
                                <span className="auth-page__icon" aria-hidden>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                </span>
                              )}
                            </Button>
                          </div>
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
                          {loading ? <><Spinner animation="border" size="sm" className="me-2" />Resetting…</> : 'Reset password'}
                        </Button>
                      </Form>
                    </>
                  )}

                  <p className="auth-page__switch text-center mt-4 mb-0">
                    Remember your password?{' '}
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
