import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageContainer } from '../components';
import { login, loginWithGoogle, setTokens, getProfile, setUserInfo } from '../api';
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

const LOGIN_PANEL_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80';

type LocationState = { email?: string; message?: string; from?: { pathname: string } } | null;

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LocationState) ?? {};
  const { showToast } = useToast();
  const didShowSignupToast = useRef(false);

  const [email, setEmail] = useState(() => (state.email && typeof state.email === 'string' ? state.email : ''));
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

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

  const redirectPathRef = useRef((state.from?.pathname) ?? '/user');
  redirectPathRef.current = (state.from?.pathname) ?? '/user';

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
          navigate(redirectPathRef.current, { replace: true });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Google sign-in failed';
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

  useEffect(() => {
    if (state.email && typeof state.email === 'string' && !email) {
      setEmail(state.email);
    }
  }, [state.email]);

  useEffect(() => {
    if (state.message && !didShowSignupToast.current) {
      didShowSignupToast.current = true;
      showToast(state.message, 'success');
    }
  }, [state.message, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      const access = data.access ?? data.access_token ?? data.token;
      const refresh = data.refresh ?? data.refresh_token;
      if (!access) {
        setError('Invalid response from server.');
        setLoading(false);
        return;
      }
      setTokens(access, refresh ?? access);
      const res = data as {
        customer?: { email?: string; username?: string };
        email?: string;
        username?: string;
        user?: { email?: string; username?: string };
      };
      const loginEmail =
        res.customer?.email ?? res.email ?? res.user?.email ?? email.trim();
      const loginUsername =
        res.customer?.username ?? res.username ?? res.user?.username;
      setUserInfo(loginEmail, loginUsername);
      getProfile()
        .then((p) => setUserInfo(p.email ?? loginEmail, p.username ?? loginUsername))
        .catch(() => {});
      navigate((state.from?.pathname) ?? '/user', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFallback = () => {
    navigate('/signup');
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
              <h1 className="auth-page__title">Log in to your account</h1>
              <p className="auth-page__subtitle text-muted">Please enter your details</p>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="auth-page__alert">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
                  <Form.Label className="required">Password</Form.Label>
                  <div className="auth-page__password-wrap">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        </span>
                      ) : (
                        <span className="auth-page__icon" aria-hidden>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </span>
                      )}
                    </Button>
                  </div>
                </Form.Group>
                <div className="auth-page__options d-flex justify-content-end mb-4">
                  <Link to="/forgot-password" className="auth-page__link small">Forgot password?</Link>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 auth-page__submit mb-3"
                  disabled={loading}
                >
                  {loading ? <><Spinner animation="border" size="sm" className="me-2" />Logging in…</> : 'Log in'}
                </Button>
                <div className="auth-page__or">
                  <span className="auth-page__or-line" />
                  <span className="auth-page__or-text">OR</span>
                  <span className="auth-page__or-line" />
                </div>
                {GOOGLE_CLIENT_ID ? (
                  <div className="auth-page__google-wrap mb-4">
                    <div ref={googleButtonRef} className="auth-page__google-button" />
                    {loading && (
                      <div className="auth-page__google-loading">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing in…
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="lg"
                    className="w-100 auth-page__google-btn mb-4"
                    onClick={handleGoogleFallback}
                    disabled={loading}
                  >
                    <GoogleIcon />
                    Sign up with Google
                  </Button>
                )}
                <p className="auth-page__terms small text-muted mb-0">
                  By creating an account, you agree to our{' '}
                  <Link to="/crystal" className="auth-page__link">Terms of Use</Link>.
                </p>
              </Form>
              <p className="auth-page__switch text-center mt-3 mb-0">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="auth-page__link">Sign up</Link>
              </p>
            </div>
          </Col>
          <Col lg={6} className="auth-page__panel-col">
            <div
              className="auth-page__panel"
              style={{ backgroundImage: `url(${LOGIN_PANEL_IMAGE})` }}
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
