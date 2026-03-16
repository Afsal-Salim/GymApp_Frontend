import { Link } from 'react-router-dom';
import { Container, Nav, Navbar as BSNavbar } from 'react-bootstrap';
import logo from '../../assets/logo.svg';
import './Navbar.css';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Contacts', href: '#contacts' },
  { label: 'Packages', href: '#packages' },
] as const;

export default function Navbar() {
  return (
    <BSNavbar expand="lg" className="crystal-navbar" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/myapp" className="crystal-brand d-flex align-items-center gap-2">
          <img src={logo} alt="Crystal" width="36" height="36" className="crystal-logo" />
          <span>Crystal</span>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="crystal-nav" />
        <BSNavbar.Collapse id="crystal-nav">
          <Nav className="ms-auto">
            {navItems.map(({ label, href }) => (
              <Nav.Link key={href} href={href} className="crystal-nav-link px-3">
                {label}
              </Nav.Link>
            ))}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
