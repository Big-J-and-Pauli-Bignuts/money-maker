# Development Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed successfully. The CODE app is now ready for development.

## 🚀 Development Server Running

The app is currently running at: **http://localhost:5173/**

```
VITE v5.4.21  ready in 412 ms
➜  Local:   http://localhost:5173/
```

## 📁 Current Project Status

### ✅ Completed Setup
- [x] Node.js dependencies installed (497 packages)
- [x] React 18 + TypeScript configured
- [x] Vite build tool set up
- [x] MSAL authentication structure
- [x] Routing with React Router
- [x] Basic page components created
- [x] Layout component with navigation
- [x] Dataverse service client
- [x] Development server running

### 📄 Pages Created
- `/` - Dashboard (default page)
- `/calendar` - Calendar management
- `/tasks` - Task management
- `/documents` - Document management
- `/settings` - User settings
- `/login` - Authentication page

### 🔧 Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript settings
- `vite.config.ts` - Build configuration
- `.env` - Environment variables (needs configuration)
- `.eslintrc.cjs` - Code linting rules
- `.prettierrc` - Code formatting rules

## ⚠️ Important Next Steps

### 1. Configure Azure AD Authentication

The app needs Azure AD credentials to work. Update `.env` file:

```bash
# Required for authentication to work
VITE_TENANT_ID=your-azure-tenant-id
VITE_CLIENT_ID=your-app-registration-client-id
VITE_REDIRECT_URI=http://localhost:5173
```

**How to get these values:**
1. Go to Azure Portal (portal.azure.com)
2. Navigate to Azure Active Directory → App registrations
3. Create new registration or use existing
4. Copy the Application (client) ID and Directory (tenant) ID

### 2. Set Up Dataverse Connection

```bash
VITE_DATAVERSE_URL=https://yourorg.crm.dynamics.com
```

### 3. Configure SharePoint

```bash
VITE_SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/codeapp
```

## 🛠️ Development Commands

```bash
# Start development server (already running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Check TypeScript types
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## 🔍 Current Warnings

There are 6 moderate severity vulnerabilities in dependencies. These are mostly in dev dependencies (ESLint deprecations) and don't affect the runtime app. To review:

```bash
npm audit
```

## 🎯 Next Development Tasks

1. **Configure Authentication**
   - Set up Azure AD app registration
   - Add credentials to `.env`
   - Test login flow

2. **Build Core Components**
   - Calendar view component
   - Task list component
   - Email management interface
   - AI chat widget

3. **Integrate APIs**
   - Complete Dataverse client
   - Add Microsoft Graph client
   - Add SharePoint client
   - Add Power Automate triggers

4. **Add Fluent UI Components**
   - Replace basic HTML with Fluent UI components
   - Implement proper styling
   - Add responsive layouts

5. **Implement Features**
   - Voice input functionality
   - AI chat interface
   - Smart notifications
   - Document management

## 📚 Documentation

- [CODE App Overview](../docs/code-app-overview.md)
- [Main README](./README.md)
- [Dataverse Schema](../dataverse/schema-overview.md)
- [Power Automate Flows](../power-automate/flow-templates.md)

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Check for type errors
npm run type-check
```

## 💡 Tips

- Hot reload is enabled - changes are reflected immediately
- Use browser DevTools for debugging
- Check browser console for errors
- Use React Developer Tools extension

## 🎨 Design System

The app uses **Fluent UI React** - Microsoft's design system. Components to explore:
- Buttons, Inputs, Cards
- Navigation, Menus
- Data grids, Lists
- Dialogs, Panels
- Icons

Documentation: https://react.fluentui.dev

## 🚀 Ready to Code!

The development environment is set up and running. You can now:
1. Open http://localhost:5173/ in your browser
2. Start editing files in `src/`
3. See changes reflected instantly with hot reload

Happy coding! 🎉
