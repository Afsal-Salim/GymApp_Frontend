import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar as BSNavbar, Button, Modal } from 'react-bootstrap';
import { getAccessToken, clearTokens, getUserInfo } from '../../../../api';
import { STORAGE_USER_AVATAR_URL } from '../../../../config/storageKeys';
import logo from '../../../../assets/logo.svg';
import './Navbar.css';

const navHashItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Packages', href: '#packages' },
  { label: 'Contacts', href: '#contacts' },
] as const;

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profileModalShow, setProfileModalShow] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMarketingHome = location.pathname === '/';

  useEffect(() => {
    setIsSignedIn(!!getAccessToken());
  }, [location]);

  const closeMenu = () => setExpanded(false);

  const userInfo = getUserInfo();
  const avatarUrl =
    typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_USER_AVATAR_URL) : null;
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
    navigate('/');
  };

  const goToProfile = () => {
    closeProfileModal();
    navigate('/user');
  };

  return (
    <>
      <BSNavbar expand="lg" className="crystal-navbar" sticky="top" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="crystal-brand d-flex align-items-center" onClick={closeMenu}>
          <img src={logo} alt="Crystal" width="42" height="42" className="crystal-logo" />
          <span>Crystal</span>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="crystal-nav" />
        <BSNavbar.Collapse id="crystal-nav">
          <Nav className="ms-auto align-items-center gap-2">
            {navHashItems.map(({ label, href }) => (
              <Nav.Link
                key={href}
                href={isMarketingHome ? href : `/#${href.replace(/^#/, '')}`}
                className="crystal-nav-link px-3"
                onClick={closeMenu}
              >
                {label}
              </Nav.Link>
            ))}
            <Nav.Item className="d-lg-inline-flex align-items-stretch">
              <Link
                to="/services/custom"
                className="nav-link crystal-nav-link crystal-nav-link--services px-3 w-100 w-lg-auto text-start"
                onClick={closeMenu}
              >
                Services
              </Link>
            </Nav.Item>
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
                <Link
                  to="/login"
                  className="text-decoration-none"
                  onClick={closeMenu}
                >
                  <Button variant="outline-light" size="sm" className="crystal-nav-btn crystal-nav-btn--login" as="span">
                    Log in
                  </Button>
                </Link>
                <Link
                  to="/signup"
                  className="text-decoration-none"
                  onClick={closeMenu}
                >
                  <Button variant="primary" size="sm" className="crystal-nav-btn crystal-nav-btn--signup" as="span">
                    Sign up
                  </Button>
                </Link>
              </Nav.Item>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>

      <Modal
        show={profileModalShow}
        onHide={closeProfileModal}
        centered
        className="crystal-nav-profile-modal"
        dialogClassName="crystal-account-modal-dialog"
        contentClassName="crystal-account-modal-shell"
        aria-labelledby="crystal-account-modal-title"
      >
        <Modal.Header closeButton className="crystal-account-modal__header">
          <Modal.Title id="crystal-account-modal-title" as="h2" className="crystal-account-modal__title">
            Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="crystal-account-modal__body">
          <div className="crystal-account-modal__avatar-wrap">
            <div className="crystal-nav-profile-modal__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="crystal-nav-profile-modal__img" />
              ) : (
                <span className="crystal-nav-profile-modal__letter" aria-hidden>{initial}</span>
              )}
            </div>
          </div>
          <p className="crystal-account-modal__name">{userInfo.username || userInfo.email || '—'}</p>
          {userInfo.email ? <p className="crystal-account-modal__email">{userInfo.email}</p> : null}
        </Modal.Body>
        <Modal.Footer className="crystal-account-modal__footer">
          <Button className="crystal-account-modal__btn crystal-account-modal__btn--profile w-100" onClick={goToProfile}>
            Profile
          </Button>
          <Button
            variant="link"
            className="crystal-account-modal__btn crystal-account-modal__btn--logout w-100"
            onClick={handleLogout}
          >
            Log out
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
