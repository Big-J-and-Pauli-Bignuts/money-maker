# GitHub Actions Workflows

This repository includes automated deployment workflows for the CODE App.

## Available Workflows

### 1. Azure Static Web Apps Deployment
**File**: `.github/workflows/azure-static-web-apps-deploy.yml`

Deploys to Azure Static Web Apps with:
- ✅ Automatic deployment on push to main
- ✅ PR preview deployments
- ✅ Custom domain support
- ✅ Global CDN
- ✅ Free SSL certificates
- ✅ Integrated authentication

**Setup**: See [docs/azure-deployment.md](/docs/azure-deployment.md)

### 2. GitHub Pages Deployment
**File**: `.github/workflows/github-pages-deploy.yml`

Deploys to GitHub Pages with:
- ✅ Free hosting
- ✅ Custom domain support (via CNAME)
- ✅ SSL/HTTPS
- ✅ Simple setup

**Setup**:
1. Go to repository **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save and push to main
4. Access at: `https://YOUR_USERNAME.github.io/money-maker/`

## Required GitHub Secrets

Add these in **Settings** → **Secrets and variables** → **Actions**:

| Secret Name | Example Value | Required For |
|------------|---------------|--------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | `***` | Azure deployment |
| `VITE_TENANT_ID` | `7a5bf294-6ae8-47c4-b0c4-b2f9166d7a3f` | Both |
| `VITE_CLIENT_ID` | `e71845d1-4e33-499b-b5c5-190cdee961a7` | Both |
| `VITE_REDIRECT_URI` | `https://your-app.azurestaticapps.net/` | Both |
| `VITE_DATAVERSE_URL` | `https://org05385a1b.crm6.dynamics.com` | Both |
| `VITE_DATAVERSE_API_VERSION` | `9.2` | Both |
| `VITE_SHAREPOINT_SITE_URL` | `https://365evergreen.sharepoint.com` | Both |
| `VITE_SHAREPOINT_TENANT` | `365evergreen` | Both |
| `VITE_GRAPH_API_ENDPOINT` | `https://graph.microsoft.com/v1.0` | Both |
| `VITE_APP_NAME` | `CODE App` | Both |
| `VITE_APP_VERSION` | `1.0.0` | Both |

## Which Deployment Option to Choose?

### Azure Static Web Apps (Recommended)
**Choose if:**
- ✅ Need global CDN performance
- ✅ Want integrated authentication
- ✅ Need custom domains with free SSL
- ✅ Want staging/preview environments
- ✅ Need API functions (future)
- ✅ Enterprise production deployment

**Cost**: Free tier available, $9/month for Standard

### GitHub Pages
**Choose if:**
- ✅ Simple hosting needs
- ✅ Want completely free hosting
- ✅ Personal/demo project
- ✅ Don't need backend APIs

**Cost**: Free

## Manual Workflow Trigger

You can manually trigger deployments:

1. Go to **Actions** tab
2. Select workflow (Azure or GitHub Pages)
3. Click **"Run workflow"**
4. Select branch
5. Click **"Run workflow"**

## Workflow Status Badges

Add to your README.md:

### Azure Static Web Apps
```markdown
![Azure Deploy](https://github.com/YOUR_ORG/money-maker/actions/workflows/azure-static-web-apps-deploy.yml/badge.svg)
```

### GitHub Pages
```markdown
![GitHub Pages](https://github.com/YOUR_ORG/money-maker/actions/workflows/github-pages-deploy.yml/badge.svg)
```

## Disabling a Workflow

To disable a workflow without deleting it:

1. Go to **Actions** tab
2. Select the workflow
3. Click **"..."** menu
4. Select **"Disable workflow"**

Or delete the `.yml` file from `.github/workflows/`

## Troubleshooting

### Build Fails
- Check secrets are set correctly
- Verify Node.js version (18)
- Test build locally: `cd code-app && npm run build`

### Deployment Fails
- Check deployment token is valid
- Verify permissions are correct
- Check workflow logs for specific errors

### Environment Variables Not Working
- Ensure all secrets have `VITE_` prefix
- Secrets are case-sensitive
- Rebuild required after secret changes

## CI/CD Best Practices

✅ **Test locally** before pushing
✅ **Use PR previews** to test changes
✅ **Monitor workflow runs** for failures
✅ **Keep secrets secure** - never commit to repo
✅ **Update dependencies** regularly
✅ **Review security alerts** from Dependabot

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
