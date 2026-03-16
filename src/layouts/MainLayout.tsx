import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Navbar />
      <div className="main-layout__content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
