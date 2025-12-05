import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL (done lazily on first use)
let msalInitialized = false;
export const initializeMsal = async () => {
  if (!msalInitialized) {
    await msalInstance.initialize();
    msalInitialized = true;
  }
};

// Scopes for API access
export const loginRequest = {
  scopes: ['User.Read'],
};

export const dataverseScopes = {
  scopes: [`${import.meta.env.VITE_DATAVERSE_URL}/user_impersonation`],
};

export const graphScopes = {
  scopes: [
    'Calendars.ReadWrite',
    'Mail.ReadWrite',
    'Mail.Send',
    'Files.ReadWrite.All',
    'Sites.ReadWrite.All',
  ],
};

/**
 * Get access token for a specific resource
 */
export const getAccessToken = async (scopes: string[]): Promise<string> => {
  await initializeMsal();
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    throw new Error('No accounts found. Please sign in.');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes,
      account: accounts[0],
    });
    return response.accessToken;
  } catch (error) {
    // If silent acquisition fails, try interactive
    const response = await msalInstance.acquireTokenPopup({ scopes });
    return response.accessToken;
  }
};
