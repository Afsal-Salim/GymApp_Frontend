'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Row, Col } from 'react-bootstrap';
import { useEnquiryModal } from '../../../../contexts/EnquiryModalContext';
import './Footer.css';

const HOME_PATH = '/';

const FOOTER_LINKS = {
  product: [
    { label: 'Features', hash: 'about' },
    { label: 'Packages', hash: 'packages' },
    { label: 'Pricing', hash: 'packages' },
    { label: 'Services', path: '/services/custom' },
  ] as (
    | { label: string; hash: string }
    | { label: string; path: string }
  )[],
  company: [
    { label: 'About', hash: 'about' },
    { label: 'Contact', hash: 'contacts' },
    { label: 'Enquiry', action: 'enquiry' as const },
    { label: 'Support', path: '/support' },
    { label: 'Careers', hash: null as string | null },
  ] as const,
  legal: [
    { label: 'Privacy', path: '/legal/privacy' },
    { label: 'Terms', path: '/legal/user-content' },
  ] as { label: string; path?: string }[],
};

function footerHref(hash: string | null): string {
  if (!hash) return '#';
  return `${HOME_PATH}#${hash}`;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const { openEnquiryModal } = useEnquiryModal();

  const handleSectionClick = (hash: string | null, e: React.MouseEvent) => {
    if (!hash) return;
    const isHome = pathname === HOME_PATH || pathname === '/';
    if (isHome) {
      e.preventDefault();
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer id="crystal-footer" className="crystal-footer">
      <Container>
        <Row className="crystal-footer__row g-4 py-5">
          <Col xs={12} md={4} lg={4} className="crystal-footer__brand-col">
            <div className="crystal-footer__brand">Crystal</div>
            <p className="crystal-footer__tagline small mb-0 mt-2">
              Clarity in design. Power in simplicity.
            </p>
          </Col>
          <Col xs={12} sm={4} md={2} lg={2}>
            <h6 className="crystal-footer__heading">Product</h6>
            <ul className="crystal-footer__list">
              {FOOTER_LINKS.product.map((item) => (
                <li key={item.label}>
                  {'path' in item ? (
                    <Link href={item.path}>{item.label}</Link>
                  ) : item.hash ? (
                    <Link href={footerHref(item.hash)} onClick={(e) => handleSectionClick(item.hash, e)}>
                      {item.label}
                    </Link>
                  ) : (
                    <a href="#">{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={12} sm={4} md={2} lg={2}>
            <h6 className="crystal-footer__heading">Company</h6>
            <ul className="crystal-footer__list">
              {FOOTER_LINKS.company.map((item) => (
                <li key={item.label}>
                  {'path' in item && item.path ? (
                    <Link href={item.path}>{item.label}</Link>
                  ) : 'action' in item && item.action === 'enquiry' ? (
                    <button type="button" className="crystal-footer__link-btn" onClick={openEnquiryModal}>
                      {item.label}
                    </button>
                  ) : 'hash' in item && item.hash ? (
                    <Link href={footerHref(item.hash)} onClick={(e) => handleSectionClick(item.hash, e)}>
                      {item.label}
                    </Link>
                  ) : (
                    <a href="#">{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={12} sm={4} md={2} lg={2}>
            <h6 className="crystal-footer__heading">Legal</h6>
            <ul className="crystal-footer__list">
              {FOOTER_LINKS.legal.map(({ label, path }) => (
                <li key={label}>
                  {path ?
                    <Link href={path}>{label}</Link>
                  : <a href="#">{label}</a>}
                </li>
              ))}
            </ul>
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="crystal-footer__bottom py-3 text-muted small">
            © {year} Crystal. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
