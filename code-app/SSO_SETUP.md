# SSO Authentication Setup Guide

## Current Configuration

The app is configured to use Azure AD authentication with the following settings:

- **Tenant ID**: `7a5bf294-6ae8-47c4-b0c4-b2f9166d7a3f`
- **Client ID**: `e71845d1-4e33-499b-b5c5-190cdee961a7`
- **Redirect URI**: `https://super-goldfish-gr574xqrw6qh95v9-5176.app.github.dev/`

## Azure AD App Registration Requirements

For SSO to work properly, ensure the following in your Azure AD App Registration:

### 1. Redirect URIs

In the Azure Portal, go to **App Registrations** → Your App → **Authentication**:

- Add the following redirect URI as **Single-page application (SPA)**:
  ```
  https://super-goldfish-gr574xqrw6qh95v9-5176.app.github.dev/
  ```

- For local development, also add:
  ```
  http://localhost:5176/
  ```

### 2. Implicit Grant and Hybrid Flows

Under **Authentication** → **Implicit grant and hybrid flows**, ensure:
- ✅ **Access tokens** (used for implicit flows)
- ✅ **ID tokens** (used for implicit and hybrid flows)

### 3. API Permissions

Under **API permissions**, ensure you have:
- ✅ Microsoft Graph → User.Read (Delegated)
- ✅ Microsoft Graph → Calendars.ReadWrite (Delegated)
- ✅ Microsoft Graph → Mail.ReadWrite (Delegated)
- ✅ Microsoft Graph → Files.ReadWrite.All (Delegated)
- ✅ Microsoft Graph → Sites.ReadWrite.All (Delegated)
- ✅ Dynamics CRM → user_impersonation (Delegated)

**Important**: Click **"Grant admin consent"** after adding permissions.

### 4. Supported Account Types

Ensure the app is configured for:
- **Accounts in this organizational directory only** (Single tenant)

### 5. Token Configuration (Optional Claims)

Under **Token configuration**, you may want to add optional claims:
- `email`
- `preferred_username`
- `family_name`
- `given_name`

## Troubleshooting SSO Issues

### Issue: Redirect Loop or "AADSTS50011" Error

**Cause**: Redirect URI mismatch

**Solution**:
1. Verify the redirect URI in `.env` matches exactly what's in Azure AD
2. Ensure the URI is registered as **SPA** type, not **Web**
3. Check that the URL includes the trailing slash if configured that way

### Issue: "AADSTS700016" Error (App not found)

**Cause**: Client ID or Tenant ID mismatch

**Solution**:
1. Verify `VITE_CLIENT_ID` in `.env` matches the Application (client) ID in Azure AD
2. Verify `VITE_TENANT_ID` matches your Directory (tenant) ID

### Issue: "Consent Required" Error

**Cause**: User hasn't consented to permissions

**Solution**:
1. Have an admin grant consent in Azure AD
2. Or have users consent during first login

### Issue: CORS Errors

**Cause**: Browser blocking cross-origin requests

**Solution**:
1. Ensure using MSAL redirect flow (not popup) - already configured ✅
2. Verify `storeAuthStateInCookie: true` in auth config
3. Check that Codespace port is set to **Public** visibility

### Issue: Silent Token Acquisition Fails

**Cause**: No active session or token expired

**Solution**:
1. The app will automatically fall back to interactive login
2. Ensure refresh tokens are enabled in Azure AD

## Testing SSO

1. **Clear browser cache and storage** to test fresh login
2. Open browser DevTools → Console to see MSAL logs
3. Check Network tab for authentication requests
4. Verify redirect to `login.microsoftonline.com`
5. After successful login, should redirect back to app

## Current Implementation

The app uses:
- **MSAL Browser** v3.7.0
- **Redirect flow** (not popup) for better SSO support
- **LocalStorage** for token caching
- **Cookie storage** for auth state (for better redirect handling)

## Required Azure Configuration Checklist

- [ ] Redirect URI added to Azure AD app registration (SPA type)
- [ ] Implicit grant tokens enabled (Access + ID tokens)
- [ ] API permissions added and admin consent granted
- [ ] App is single-tenant configuration
- [ ] Client ID and Tenant ID match `.env` file
- [ ] Codespace port 5176 set to Public visibility

## Notes

- The Codespace URL may change if the Codespace is restarted
- Update the redirect URI in both `.env` and Azure AD if URL changes
- For production, use a stable domain instead of Codespace URL
