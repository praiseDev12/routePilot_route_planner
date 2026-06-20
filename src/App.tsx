import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

const App = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route path='/' element={<DashboardPage />} />

      {/* Login */}
      <Route path='/login' element={<LoginPage />} />

      {/* Catch-all */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

export default App;
