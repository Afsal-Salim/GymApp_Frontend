import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#about' },
    { label: 'Packages', href: '#packages' },
    { label: 'Pricing', href: '#packages' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contacts' },
    { label: 'Careers', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="crystal-footer">
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
              {FOOTER_LINKS.product.map(({ label, href }) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={12} sm={4} md={2} lg={2}>
            <h6 className="crystal-footer__heading">Company</h6>
            <ul className="crystal-footer__list">
              {FOOTER_LINKS.company.map(({ label, href }) => (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </Col>
          <Col xs={12} sm={4} md={2} lg={2}>
            <h6 className="crystal-footer__heading">Legal</h6>
            <ul className="crystal-footer__list">
              {FOOTER_LINKS.legal.map(({ label, href }) => (
                <li key={label}>
                  <a href={href}>{label}</a>
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
