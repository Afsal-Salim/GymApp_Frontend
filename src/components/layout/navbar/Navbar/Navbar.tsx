'use client';

import { useState, useLayoutEffect, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Container, Nav, Navbar as BSNavbar, Button, Modal } from 'react-bootstrap';
import { getAccessToken, clearTokens, getUserInfo, CRYSTAL_AUTH_CHANGED_EVENT } from '@/api';
import { STORAGE_ACCESS_TOKEN, STORAGE_USER_AVATAR_URL } from '@/config/storageKeys';
import logo from '@/assets/logo.svg';
import './Navbar.css';

const navHashItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Packages', href: '#packages' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacts', href: '#contacts' },
] as const;

type NavAuthState = 'pending' | 'in' | 'out';

function subscribeNavAuth(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_ACCESS_TOKEN || e.key === null) onChange();
  };
  const onAuth = () => onChange();
  window.addEventListener('storage', onStorage);
  window.addEventListener(CRYSTAL_AUTH_CHANGED_EVENT, onAuth);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CRYSTAL_AUTH_CHANGED_EVENT, onAuth);
  };
}

function readNavAuth(): NavAuthState {
  return getAccessToken() ? 'in' : 'out';
}

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);
  const [profileModalShow, setProfileModalShow] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMarketingHome = pathname === '/';
  const [authState, setAuthState] = useState<NavAuthState>('pending');

  useLayoutEffect(() => {
    setAuthState(readNavAuth());
  }, []);

  useEffect(() => {
    return subscribeNavAuth(() => setAuthState(readNavAuth()));
  }, []);

  const isSignedIn = authState === 'in';
  const authPending = authState === 'pending';

  const closeMenu = () => setExpanded(false);

  const userInfo = getUserInfo();
  const avatarUrl =
    typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_USER_AVATAR_URL) : null;
  const initial = (userInfo.username?.[0] ?? userInfo.email?.[0] ?? '?').toUpperCase();

  const openProfileModal = () => {
    setProfileModalShow(true);
    closeMenu();
  };

  const closeProfileModal = () => setProfileModalShow(false);

  const handleLogout = () => {
    closeProfileModal();
    clearTokens();
    closeMenu();
    router.push('/');
  };

  const goToProfile = () => {
    closeProfileModal();
    router.push('/user');
  };

  const goToSupport = () => {
    closeProfileModal();
    router.push('/support');
  };

  return (
    <>
      <BSNavbar expand="lg" className="crystal-navbar" sticky="top" expanded={expanded} onToggle={setExpanded}>
      <Container fluid className="crystal-navbar-container">
        <BSNavbar.Brand
          as={Link}
          href="/"
          className="crystal-brand crystal-brand--start d-flex align-items-center"
          onClick={closeMenu}
        >
          <Image src={logo} alt="" className="crystal-logo" width={48} height={48} priority />
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
                href="/services/custom"
                className="nav-link crystal-nav-link crystal-nav-link--services px-3 w-100 w-lg-auto text-start"
                onClick={closeMenu}
              >
                Services
              </Link>
            </Nav.Item>
            {authPending ? (
              <Nav.Item className="mt-2 mt-lg-0 d-flex align-items-center" aria-hidden>
                <span className="crystal-nav-auth-placeholder" title="" />
              </Nav.Item>
            ) : isSignedIn ? (
              <Nav.Item className="mt-2 mt-lg-0">
                <button
                  type="button"
                  className="crystal-nav-avatar"
                  onClick={openProfileModal}
                  aria-label="Open profile menu"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="crystal-nav-avatar__img"
                      unoptimized
                    />
                  ) : (
                    <span className="crystal-nav-avatar__letter" aria-hidden>{initial}</span>
                  )}
                </button>
              </Nav.Item>
            ) : (
              <Nav.Item className="d-flex gap-2 flex-nowrap mt-2 mt-lg-0">
                <Link
                  href="/login"
                  className="text-decoration-none"
                  onClick={closeMenu}
                >
                  <Button as="span" variant="outline-light" size="sm" className="crystal-nav-btn crystal-nav-btn--login">
                    Log in
                  </Button>
                </Link>
                <Link
                  href="/signup"
                  className="text-decoration-none"
                  onClick={closeMenu}
                >
                  <Button as="span" variant="primary" size="sm" className="crystal-nav-btn crystal-nav-btn--signup">
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
        <Modal.Header closeButton className="crystal-account-modal__header crystal-account-modal__header--menu">
          <Modal.Title id="crystal-account-modal-title" className="visually-hidden">
            Account menu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="crystal-account-modal__body crystal-account-modal__body--menu">
          <div className="crystal-account-modal__user-block">
            <div className="crystal-account-modal__avatar-wrap crystal-account-modal__avatar-wrap--inline">
              <div className="crystal-nav-profile-modal__avatar crystal-nav-profile-modal__avatar--menu">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="crystal-nav-profile-modal__img"
                    unoptimized
                  />
                ) : (
                  <span className="crystal-nav-profile-modal__letter" aria-hidden>{initial}</span>
                )}
                <span className="crystal-account-modal__status-dot" title="Online" aria-hidden />
              </div>
            </div>
            <div className="crystal-account-modal__user-text">
              <p className="crystal-account-modal__name">{userInfo.username || userInfo.email || '—'}</p>
              {userInfo.email ? <p className="crystal-account-modal__email">{userInfo.email}</p> : null}
            </div>
          </div>

          <div className="crystal-account-modal__divider" role="separator" />

          <div className="crystal-account-modal__section">
            <button type="button" className="crystal-account-modal__menu-item" onClick={goToProfile}>
              <PersonOutlineIcon className="crystal-account-modal__menu-icon" fontSize="small" aria-hidden />
              <span>View profile</span>
            </button>
          </div>
          <div className="crystal-account-modal__divider" role="separator" />
          <div className="crystal-account-modal__section">
            <button type="button" className="crystal-account-modal__menu-item" onClick={goToSupport}>
              <HeadsetMicOutlinedIcon className="crystal-account-modal__menu-icon" fontSize="small" aria-hidden />
              <span>Support</span>
            </button>
          </div>

          <div className="crystal-account-modal__divider" role="separator" />

          <div className="crystal-account-modal__section crystal-account-modal__section--footer">
            <button
              type="button"
              className="crystal-account-modal__menu-item crystal-account-modal__menu-item--logout"
              onClick={handleLogout}
            >
              <LogoutOutlinedIcon className="crystal-account-modal__menu-icon" fontSize="small" aria-hidden />
              <span>Log out</span>
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
