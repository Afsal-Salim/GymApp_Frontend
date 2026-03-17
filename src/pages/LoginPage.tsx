import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PageContainer } from '../components';
import { login, setTokens, getProfile, setUserInfo } from '../api';
import { useToast } from '../contexts/ToastContext';
import './AuthPage.css';

type LocationState = { email?: string; message?: string; from?: { pathname: string } } | null;

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
      // Persist email and username from login response (backend uses "customer" object)
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

  return (
    <PageContainer>
      <main className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="auth-page__card shadow-sm">
                <Card.Body className="p-4 p-md-5">
                  <h1 className="auth-page__title">Log in</h1>
                  <p className="auth-page__subtitle text-muted mb-4">
                    Enter your credentials to access your account.
                  </p>

                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
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
                    <Form.Group className="mb-4">
                      <Form.Label className="required">Password</Form.Label>
                      <div className="auth-page__password-wrap">
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          placeholder=""
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
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                            </span>
                          ) : (
                            <span className="auth-page__icon" aria-hidden>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </span>
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 auth-page__submit"
                      disabled={loading}
                    >
                      {loading ? <><Spinner animation="border" size="sm" className="me-2" />Logging in…</> : 'Log in'}
                    </Button>
                    <p className="text-center mt-2 mb-0">
                      <Link to="/forgot-password" className="auth-page__link small">Forgot password?</Link>
                    </p>
                  </Form>

                  <p className="auth-page__switch text-center mt-4 mb-0">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="auth-page__link">Sign up</Link>
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
