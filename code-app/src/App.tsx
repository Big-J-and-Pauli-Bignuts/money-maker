import { FC, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { EventType } from '@azure/msal-browser';
import { msalInstance } from './services/auth';
import AppRoutes from './routes';

// Handle redirect promise on app load (for SSO)
msalInstance
  .handleRedirectPromise()
  .then((response) => {
    if (response) {
      console.log('SSO successful:', response.account);
    }
  })
  .catch((error) => {
    console.error('SSO redirect error:', error);
  });

const App: FC = () => {
  useEffect(() => {
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
  }, []);

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
