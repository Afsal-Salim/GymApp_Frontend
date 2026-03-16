import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts';
import { HomePage, PaymentPage } from './pages';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/myapp" element={<HomePage />} />
        <Route path="/starter" element={<PaymentPage plan="starter" />} />
        <Route path="/pro" element={<PaymentPage plan="pro" />} />
        <Route path="/" element={<Navigate to="/myapp" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
