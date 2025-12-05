import type { Configuration } from "@azure/msal-browser";
import { LogLevel, BrowserCacheLocation } from "@azure/msal-browser";

/**
 * MSAL Configuration for Azure AD authentication
 * Configure these values based on your Azure AD app registration
 */
export const msalConfig: Configuration = {
  auth: {
    // Replace with your Azure AD Application (client) ID
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "your-client-id",
    // Replace with your Azure AD tenant ID or 'common' for multi-tenant
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "common"}`,
    // Replace with your redirect URI
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
};

/**
 * Scopes for Microsoft Graph API access
 */
export const loginRequest = {
  scopes: ["User.Read", "Calendars.ReadWrite", "Sites.Read.All"],
};

/**
 * Scopes for Dataverse API access
 */
export const dataverseRequest = {
  scopes: [`https://${import.meta.env.VITE_DATAVERSE_URL || "your-org"}.crm.dynamics.com/.default`],
};

/**
 * Scopes for SharePoint API access
 */
export const sharepointRequest = {
  scopes: [`https://${import.meta.env.VITE_SHAREPOINT_URL || "your-tenant"}.sharepoint.com/.default`],
};
