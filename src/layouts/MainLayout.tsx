import { Outlet } from 'react-router-dom';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="main-layout">
      <Outlet />
    </div>
  );
}
