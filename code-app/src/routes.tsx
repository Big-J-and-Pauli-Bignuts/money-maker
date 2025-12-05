import { FC, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Spinner } from '@fluentui/react-components';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UIConfig from './pages/admin/UIConfig';
import NavigationConfig from './pages/admin/NavigationConfig';
import SharePointAdmin from './pages/admin/SharePointAdmin';
import DataverseAdmin from './pages/admin/DataverseAdmin';
import { loginRequest } from './services/auth';

const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [checkingSSO, setCheckingSSO] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setCheckingSSO(false);
      return;
    }

    // Try SSO (silent sign-in) before redirecting to login
    const attemptSSO = async () => {
      try {
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          // Try to acquire token silently
          await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          setCheckingSSO(false);
          navigate('/'); // Redirect to home after successful SSO
        } else {
          // Try SSO by checking if user is signed in to Microsoft
          await instance.ssoSilent(loginRequest);
          setCheckingSSO(false);
          navigate('/');
        }
      } catch (error) {
        console.log('SSO not available, showing login page', error);
        setCheckingSSO(false);
        navigate('/login');
      }
    };

    attemptSSO();
  }, [isAuthenticated, instance, navigate]);

  if (checkingSSO) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spinner size="large" label="Checking authentication..." />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
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
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/ui-config" element={<UIConfig />} />
        <Route path="admin/navigation" element={<NavigationConfig />} />
        <Route path="admin/sharepoint" element={<SharePointAdmin />} />
        <Route path="admin/dataverse" element={<DataverseAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
