import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageContainer } from '../components';
import { sendOtp, verifyOtp, signup, loginWithGoogle, setTokens, getProfile, setUserInfo } from '../api';
import { useToast } from '../contexts/ToastContext';
import './AuthPage.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, config: { theme?: string; size?: string; type?: string; text?: string; width?: number }) => void;
        };
      };
    };
  }
}

const SIGNUP_PANEL_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

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
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => setGoogleReady(true);
    document.head.appendChild(script);
    return () => {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      existing?.remove();
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleReady || !window.google || !googleButtonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (res) => {
        setError(null);
        setLoading(true);
        try {
          const data = await loginWithGoogle(res.credential);
          const access = data.access ?? data.access_token ?? data.token;
          const refresh = data.refresh ?? data.refresh_token;
          if (!access) {
            setError('Invalid response from server.');
            return;
          }
          setTokens(access, refresh ?? access);
          const payload = data as {
            customer?: { email?: string; username?: string };
            email?: string;
            username?: string;
            user?: { email?: string; username?: string };
          };
          const loginEmail =
            payload.customer?.email ?? payload.email ?? payload.user?.email ?? '';
          const loginUsername =
            payload.customer?.username ?? payload.username ?? payload.user?.username;
          setUserInfo(loginEmail, loginUsername);
          getProfile()
            .then((p) => setUserInfo(p.email ?? loginEmail, p.username ?? loginUsername))
            .catch(() => {});
          navigate('/user', { replace: true });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Google sign-up failed';
          setError(msg);
          showToast(msg);
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signup_with',
      width: 320,
    });
  }, [googleReady, navigate, showToast]);

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
    <PageContainer className="auth-page-wrapper">
      <main className="auth-page auth-page--split">
        <Row className="auth-page__row g-0">
          <Col lg={6} className="auth-page__form-col">
            <div className="auth-page__form-inner">
              <Link to="/crystal" className="auth-page__logo">
                Crystal
              </Link>
              <h1 className="auth-page__title">Sign up</h1>

              <div className="auth-page__steps mb-3">
                <span className={step >= 1 ? 'auth-page__step auth-page__step--active' : 'auth-page__step'}>1</span>
                <span className="auth-page__step-line" />
                <span className={step >= 2 ? 'auth-page__step auth-page__step--active' : 'auth-page__step'}>2</span>
                <span className="auth-page__step-line" />
                <span className={step >= 3 ? 'auth-page__step auth-page__step--active' : 'auth-page__step'}>3</span>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="auth-page__alert">
                  {error}
                </Alert>
              )}

              {/* Step 1: Verify email (send OTP) or Sign up with Google */}
              {step === 1 && (
                <>
                  {GOOGLE_CLIENT_ID ? (
                    <div className="auth-page__google-wrap mb-3">
                      <div ref={googleButtonRef} className="auth-page__google-button" />
                      {loading && (
                        <div className="auth-page__google-loading">
                          <Spinner animation="border" size="sm" className="me-2" />
                          Signing up…
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="lg"
                      className="w-100 auth-page__google-btn mb-3"
                      onClick={() => navigate('/login')}
                      disabled={loading}
                    >
                      <GoogleIcon />
                      Sign up with Google
                    </Button>
                  )}
                  <div className="auth-page__or mb-3">
                      <span className="auth-page__or-line" />
                      <span className="auth-page__or-text">OR</span>
                      <span className="auth-page__or-line" />
                    </div>
                  <p className="auth-page__subtitle text-muted mb-4">
                    Enter your email. We&apos;ll send you a verification code.
                  </p>
                  <Form onSubmit={handleSendOtp}>
                    <Form.Group className="mb-4">
                      <Form.Label className="required">Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
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
                        disabled={loading}
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
                        disabled={loading}
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
                      {loading ? <><Spinner animation="border" size="sm" className="me-2" />Creating account…</> : 'Sign up'}
                    </Button>
                  </Form>
                </>
              )}

              <p className="auth-page__switch text-center mt-4 mb-0">
                Already have an account?{' '}
                <Link to="/login" className="auth-page__link">Log in</Link>
              </p>
            </div>
          </Col>
          <Col lg={6} className="auth-page__panel-col">
            <div
              className="auth-page__panel"
              style={{ backgroundImage: `url(${SIGNUP_PANEL_IMAGE})` }}
            >
              <div className="auth-page__panel-overlay" />
              <div className="auth-page__panel-content">
                <h2 className="auth-page__panel-title">Empowering fitter communities</h2>
                <p className="auth-page__panel-subtitle">Your gym, your brand, one professional website.</p>
              </div>
            </div>
          </Col>
        </Row>
      </main>
    </PageContainer>
  );
}
