import { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Login from './pages/Login';

const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="documents" element={<Documents />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
