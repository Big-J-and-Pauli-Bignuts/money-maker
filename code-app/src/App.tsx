import { FC, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { FluentProvider, webLightTheme, Spinner } from '@fluentui/react-components';
import { EventType } from '@azure/msal-browser';
import { msalInstance, initializeMsal } from './services/auth';
import AppRoutes from './routes';

// Force rebuild - CSP updated for Microsoft OAuth

const App: FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize MSAL and handle redirect promise on app load (for SSO)
    const initAuth = async () => {
      try {
        await initializeMsal();
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log('SSO successful:', response.account);
          // Clean up the URL by removing the hash after successful authentication
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('MSAL initialization or SSO redirect error:', error);
        setIsInitialized(true); // Still render the app even if there's an error
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Set up MSAL event callbacks
    const callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) {
        console.log('Login successful');
      }
      if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        console.log('Token acquired');
      }
    });

    return () => {
      if (callbackId) {
        msalInstance.removeEventCallback(callbackId);
      }
    };
  }, [isInitialized]);

  // Show loading spinner while initializing MSAL
  if (!isInitialized) {
    return (
      <FluentProvider theme={webLightTheme}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Spinner size="large" label="Initializing authentication..." />
        </div>
      </FluentProvider>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <FluentProvider theme={webLightTheme}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </FluentProvider>
    </MsalProvider>
  );
};

export default App;
