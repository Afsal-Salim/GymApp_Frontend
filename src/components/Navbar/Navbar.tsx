import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar as BSNavbar, Button, Modal } from 'react-bootstrap';
import { getAccessToken, clearTokens, getUserInfo } from '../../api';
import logo from '../../assets/logo.svg';
import './Navbar.css';

const AVATAR_URL_KEY = 'user_avatar_url';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Contacts', href: '#contacts' },
  { label: 'Packages', href: '#packages' },
] as const;

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profileModalShow, setProfileModalShow] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isCrystal = location.pathname === '/crystal' || location.pathname === '/';

  useEffect(() => {
    setIsSignedIn(!!getAccessToken());
  }, [location]);

  const closeMenu = () => setExpanded(false);

  const userInfo = getUserInfo();
  const avatarUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(AVATAR_URL_KEY) : null;
  const initial = (userInfo.username?.[0] ?? userInfo.email?.[0] ?? '?').toUpperCase();

  const openProfileModal = () => {
    setProfileModalShow(true);
    closeMenu();
  };

  const closeProfileModal = () => setProfileModalShow(false);

  const handleLogout = () => {
    closeProfileModal();
    clearTokens();
    setIsSignedIn(false);
    closeMenu();
    navigate('/crystal');
  };

  const goToProfile = () => {
    closeProfileModal();
    navigate('/user');
  };

  return (
    <>
      <BSNavbar expand="lg" className="crystal-navbar" sticky="top" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <BSNavbar.Brand as={Link} to="/crystal" className="crystal-brand d-flex align-items-center gap-2" onClick={closeMenu}>
          <img src={logo} alt="Crystal" width="36" height="36" className="crystal-logo" />
          <span>Crystal</span>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="crystal-nav" />
        <BSNavbar.Collapse id="crystal-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {navItems.map(({ label, href }) => (
              <Nav.Link
                key={href}
                href={isCrystal ? href : `/crystal${href}`}
                className="crystal-nav-link px-3"
                onClick={closeMenu}
              >
                {label}
              </Nav.Link>
            ))}
            {isSignedIn ? (
              <Nav.Item className="mt-2 mt-lg-0">
                <button
                  type="button"
                  className="crystal-nav-avatar"
                  onClick={openProfileModal}
                  aria-label="Open profile menu"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="crystal-nav-avatar__img" />
                  ) : (
                    <span className="crystal-nav-avatar__letter" aria-hidden>{initial}</span>
                  )}
                </button>
              </Nav.Item>
            ) : (
              <Nav.Item className="d-flex gap-2 flex-nowrap mt-2 mt-lg-0">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-light"
                  size="sm"
                  className="crystal-nav-btn crystal-nav-btn--login"
                  onClick={closeMenu}
                >
                  Log in
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  variant="primary"
                  size="sm"
                  className="crystal-nav-btn crystal-nav-btn--signup"
                  onClick={closeMenu}
                >
                  Sign up
                </Button>
              </Nav.Item>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>

      <Modal show={profileModalShow} onHide={closeProfileModal} centered className="crystal-nav-profile-modal">
        <Modal.Header closeButton>
          <Modal.Title>Account</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column align-items-center py-4">
          <div className="crystal-nav-profile-modal__avatar mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="crystal-nav-profile-modal__img" />
            ) : (
              <span className="crystal-nav-profile-modal__letter" aria-hidden>{initial}</span>
            )}
          </div>
          <p className="mb-1 fw-semibold text-dark">{userInfo.username || userInfo.email || '—'}</p>
          {userInfo.email && userInfo.username && (
            <p className="small text-muted mb-0">{userInfo.email}</p>
          )}
        </Modal.Body>
        <Modal.Footer className="flex-column gap-2">
          <Button variant="primary" className="w-100" onClick={goToProfile}>
            Profile
          </Button>
          <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
            Log out
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
