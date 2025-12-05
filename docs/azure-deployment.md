# Azure Static Web Apps Deployment Guide

## Overview

This guide explains how to deploy the CODE App to Azure Static Web Apps using GitHub Actions.

## Prerequisites

- Azure subscription
- GitHub repository access
- Azure CLI installed (optional, for manual setup)

## Setup Steps

### 1. Create Azure Static Web App

#### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Static Web App"**
4. Click **"Create"**

**Configuration:**
- **Subscription**: Select your subscription
- **Resource Group**: Create new or select existing
- **Name**: `code-app-admin` (or your preferred name)
- **Plan type**: Free (or Standard for production)
- **Region**: Choose closest region
- **Source**: GitHub
- **Organization**: Your GitHub org
- **Repository**: `money-maker`
- **Branch**: `main`
- **Build Presets**: React
- **App location**: `/code-app`
- **Api location**: (leave empty)
- **Output location**: `dist`

5. Click **"Review + create"**
6. Click **"Create"**

#### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name rg-code-app --location eastus

# Create Static Web App
az staticwebapp create \
  --name code-app-admin \
  --resource-group rg-code-app \
  --source https://github.com/YOUR_ORG/money-maker \
  --location eastus \
  --branch main \
  --app-location "/code-app" \
  --output-location "dist" \
  --login-with-github
```

### 2. Get Deployment Token

After creating the Static Web App:

1. Go to your Static Web App in Azure Portal
2. Click **"Manage deployment token"** in Overview
3. Copy the deployment token
4. Save it securely (you'll need it for GitHub Secrets)

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add the following secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | (deployment token from Azure) | Required for deployment |
| `VITE_TENANT_ID` | `7a5bf294-6ae8-47c4-b0c4-b2f9166d7a3f` | Azure AD Tenant ID |
| `VITE_CLIENT_ID` | `e71845d1-4e33-499b-b5c5-190cdee961a7` | Azure AD Client ID |
| `VITE_REDIRECT_URI` | `https://yellow-meadow-0f274e410.1azurestaticapps.net/` | Production redirect URI |
| `VITE_DATAVERSE_URL` | `https://org05385a1b.crm6.dynamics.com` | Dataverse URL |
| `VITE_DATAVERSE_API_VERSION` | `9.2` | Dataverse API version |
| `VITE_SHAREPOINT_SITE_URL` | `https://365evergreen.sharepoint.com` | SharePoint site URL |
| `VITE_SHAREPOINT_TENANT` | `365evergreen` | SharePoint tenant name |
| `VITE_GRAPH_API_ENDPOINT` | `https://graph.microsoft.com/v1.0` | Graph API endpoint |
| `VITE_APP_NAME` | `CODE App - Admin Automation` | Application name |
| `VITE_APP_VERSION` | `1.0.0` | Application version |

### 4. Update Azure AD App Registration

After deployment, update your Azure AD app registration:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your app (`e71845d1-4e33-499b-b5c5-190cdee961a7`)
4. Go to **Authentication**
5. Add new redirect URI:
   - Type: **Single-page application (SPA)**
   - URI: `https://YOUR-APP-NAME.azurestaticapps.net/`
6. Click **"Save"**

### 5. Configure Custom Domain (Optional)

1. In Azure Portal, go to your Static Web App
2. Click **"Custom domains"**
3. Click **"Add"**
4. Choose **"Custom domain on Azure DNS"** or **"Custom domain on other DNS"**
5. Follow the wizard to add your domain
6. Update `VITE_REDIRECT_URI` secret with your custom domain

## Deployment Process

### Automatic Deployment

The GitHub Actions workflow automatically triggers on:

- **Push to main branch** → Deploys to production
- **Pull request** → Creates preview deployment
- **Manual trigger** → Via GitHub Actions UI

### Manual Deployment

Trigger manually from GitHub:

1. Go to **Actions** tab
2. Select **"Deploy to Azure Static Web Apps"**
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

## Workflow Features

✅ **Automated builds** on push to main
✅ **PR preview deployments** for testing
✅ **Environment variables** injected at build time
✅ **Node.js 18** with npm caching
✅ **Optimized builds** with Vite
✅ **SPA routing** configured
✅ **Security headers** included
✅ **Custom 404 handling** (redirects to index.html)

## Build Configuration

### Package.json Scripts

The workflow uses the following npm scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Build Output

- **Input**: `/code-app` directory
- **Output**: `/code-app/dist` directory
- **Build tool**: Vite
- **Bundle**: Optimized, minified, code-split

## Static Web App Configuration

The `staticwebapp.config.json` file configures:

- **SPA routing**: All routes fallback to `/index.html`
- **Security headers**: CSP, X-Frame-Options, etc.
- **MIME types**: Proper content types
- **API runtime**: Node.js 18 (for future API functions)

## Monitoring & Logs

### View Deployment Logs

1. Go to GitHub repository
2. Click **Actions** tab
3. Click on a workflow run
4. View logs for each step

### View Application Logs

1. Go to Azure Portal
2. Navigate to your Static Web App
3. Click **"Application Insights"** (if enabled)
4. View logs and metrics

### Enable Application Insights

```bash
az staticwebapp appsettings set \
  --name code-app-admin \
  --setting-names APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string>
```

## URLs

After deployment, your app will be available at:

- **Production**: `https://YOUR-APP-NAME.azurestaticapps.net`
- **PR Preview**: `https://YOUR-APP-NAME-{pr-number}.azurestaticapps.net`

## Rollback

To rollback to a previous version:

1. Go to Azure Portal → Static Web App
2. Click **"Deployments"**
3. Find the previous deployment
4. Click **"Activate"**

Or redeploy from a previous commit:

```bash
git revert HEAD
git push origin main
```

## Cost Estimation

### Free Tier
- ✅ 100 GB bandwidth/month
- ✅ 0.5 GB storage
- ✅ 2 custom domains
- ✅ Free SSL certificates
- ✅ Perfect for development/testing

### Standard Tier ($9/month)
- ✅ 100 GB bandwidth (additional costs apply)
- ✅ 0.5 GB storage (additional costs apply)
- ✅ 5 custom domains
- ✅ SLA guarantee
- ✅ Production-ready

## Troubleshooting

### Build Fails

**Check:**
- All secrets are set correctly
- Node version matches (18)
- Dependencies install successfully
- Build script runs locally

**Fix:**
```bash
cd code-app
npm ci
npm run build
```

### Environment Variables Not Working

**Check:**
- Variables are prefixed with `VITE_`
- Secrets are added to GitHub repository
- Workflow references correct secret names

### Routing 404 Errors

**Check:**
- `staticwebapp.config.json` exists in build output
- `navigationFallback` is configured
- React Router uses `BrowserRouter` (not HashRouter)

### Authentication Errors

**Check:**
- Redirect URI matches deployed URL exactly
- Azure AD app registration has SPA redirect URI
- Scopes are correctly configured
- Token endpoint is accessible

## Security Best Practices

✅ **Never commit secrets** to repository
✅ **Use GitHub Secrets** for sensitive data
✅ **Enable branch protection** on main
✅ **Review PR previews** before merging
✅ **Monitor Application Insights** for errors
✅ **Keep dependencies updated** with Dependabot
✅ **Use HTTPS only** (automatic with Azure SWA)
✅ **Configure CSP headers** (already in config)

## CI/CD Pipeline Flow

```
┌─────────────────┐
│   Push to main  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   Triggered     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Checkout Code   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Setup Node 18   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ npm ci install  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ npm run build   │
│ (with env vars) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy to Azure │
│  Static Web App │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  App Live! 🚀   │
└─────────────────┘
```

## Next Steps

1. ✅ Push to main branch to trigger first deployment
2. ✅ Verify app is accessible at Azure URL
3. ✅ Update Azure AD redirect URI
4. ✅ Test authentication flow
5. ✅ Configure custom domain (optional)
6. ✅ Enable Application Insights
7. ✅ Set up monitoring alerts

## Support

For issues:
- **GitHub Actions**: Check workflow logs
- **Azure Support**: [Azure Portal Support](https://portal.azure.com/#blade/Microsoft_Azure_Support/HelpAndSupportBlade)
- **Documentation**: [Azure Static Web Apps Docs](https://docs.microsoft.com/en-us/azure/static-web-apps/)
