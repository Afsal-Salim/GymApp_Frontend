import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts';
import { Welcome } from './pages';
import './App.css';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/myapp" element={<Welcome />} />
        <Route path="/" element={<Navigate to="/myapp" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
