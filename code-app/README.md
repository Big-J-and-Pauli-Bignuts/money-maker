# CODE App - Administrative Automation

A React/Vite Power Apps CODE app for automating administrative tasks with Microsoft 365 integration.

## What is a Power Apps CODE App?

Power Apps CODE apps are custom web applications built using standard web technologies (React, Vue, Angular, etc.) that integrate with Microsoft Dataverse and Power Platform services. Unlike Canvas or Model-driven apps, CODE apps give you full control over the UI/UX while leveraging Power Platform capabilities.

**Learn more:** https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview

## Project Structure

```
code-app/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Calendar/        # Calendar management components
│   │   ├── Chat/            # AI chat interface components
│   │   ├── Email/           # Email management components
│   │   ├── Notifications/   # Notification components
│   │   ├── Tasks/           # Task management components
│   │   └── Common/          # Shared UI components
│   ├── pages/               # Main page components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Calendar.tsx     # Calendar view
│   │   ├── Tasks.tsx        # Task management
│   │   ├── Documents.tsx    # Document management
│   │   └── Settings.tsx     # User settings
│   ├── services/            # API and service integrations
│   │   ├── dataverse.ts     # Dataverse API client
│   │   ├── sharepoint.ts    # SharePoint API client
│   │   ├── graph.ts         # Microsoft Graph API client
│   │   ├── powerAutomate.ts # Power Automate flow triggers
│   │   └── auth.ts          # Authentication service
│   ├── hooks/               # Custom React hooks
│   │   ├── useDataverse.ts  # Dataverse data hooks
│   │   ├── useAuth.ts       # Authentication hooks
│   │   ├── useNotifications.ts
│   │   └── useVoiceInput.ts # Voice input hooks
│   ├── utils/               # Utility functions
│   │   ├── dateHelpers.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── dataverse.ts     # Dataverse entity types
│   │   ├── models.ts        # App data models
│   │   └── api.ts           # API response types
│   ├── assets/              # Static assets (images, icons)
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite environment types
├── public/                  # Public static files
│   └── index.html
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json             # NPM dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Technology Stack

- **Frontend Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Library:** Fluent UI React (Microsoft's design system)
- **State Management:** React Context API / Zustand
- **API Client:** Axios / Fetch
- **Authentication:** MSAL (Microsoft Authentication Library)
- **Testing:** Vitest + React Testing Library

## Key Integrations

### Microsoft Dataverse
- Direct API access via Web API
- CRUD operations on custom tables
- Real-time data sync

### Microsoft Graph API
- Outlook calendar management
- Email operations
- User profile data
- SharePoint file operations

### Power Automate
- Trigger flows via HTTP requests
- Execute backend workflows
- Handle complex business logic

### Azure Cognitive Services
- Speech-to-text for voice commands
- Natural language understanding
- AI chat capabilities

## Features

### 1. Calendar Management
- View and manage Outlook calendar
- Create/update/delete meetings via voice or text
- Sync with Dataverse for analytics
- Smart scheduling suggestions

### 2. Email Management
- Voice-to-text email composition
- AI-powered inbox summaries
- Quick email actions

### 3. Task Management
- Sync with Microsoft Planner/To Do
- Custom task tracking in Dataverse
- Priority and deadline management

### 4. Smart Notifications
- Configurable alert rules
- Push notifications via Teams
- In-app notification center

### 5. AI Chat Interface
- Natural language command processing
- Conversational task execution
- Context-aware responses

### 6. Document Management
- Access SharePoint documents
- Quick search and filtering
- Document metadata viewing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Access to Microsoft 365 tenant
- Power Platform environment with Dataverse
- Azure subscription (for Cognitive Services)

### Installation

```bash
cd code-app
npm install
```

### Configuration

1. Copy `.env.example` to `.env`
2. Fill in your configuration:

```env
VITE_TENANT_ID=your-tenant-id
VITE_CLIENT_ID=your-app-registration-id
VITE_DATAVERSE_URL=https://yourorg.crm.dynamics.com
VITE_SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/codeapp
VITE_AZURE_OPENAI_ENDPOINT=https://yourresource.openai.azure.com
```

### Development

```bash
npm run dev
```

Access the app at `http://localhost:5173`

### Build

```bash
npm run build
```

### Deploy

The built app can be deployed to:
- Azure Static Web Apps
- Azure App Service
- Power Pages (with custom code components)
- Any static hosting service

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Authentication Setup

The app uses MSAL.js for Azure AD authentication:

1. Register app in Azure AD
2. Configure redirect URIs
3. Set up API permissions:
   - Dataverse (user_impersonation)
   - Microsoft Graph (Calendars.ReadWrite, Mail.ReadWrite, etc.)
   - Power Automate (Flows.Manage.All)

See `/docs/authentication-setup.md` for detailed instructions.

## Dataverse Integration

The app connects to Dataverse using the Web API:

```typescript
import { DataverseClient } from './services/dataverse';

const client = new DataverseClient(dataverseUrl, accessToken);
const events = await client.query('code_calendarevents');
```

See `/docs/dataverse-integration.md` for more examples.

## Power Automate Integration

Trigger flows from the app:

```typescript
import { triggerFlow } from './services/powerAutomate';

await triggerFlow('create-meeting-flow', {
  title: 'Team Sync',
  startTime: '2025-12-05T10:00:00Z',
  // ...
});
```

## Project Status

- [x] Project structure created
- [x] Dataverse schema defined
- [x] SharePoint site structure designed
- [x] Power Automate flows documented
- [ ] React app scaffolding
- [ ] MSAL authentication setup
- [ ] Dataverse service implementation
- [ ] UI components built
- [ ] AI chat integration
- [ ] Voice input implementation
- [ ] Testing suite
- [ ] Deployment pipeline

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

Proprietary - Internal use only

## Support

For issues or questions, contact the development team or open an issue in the repository.
