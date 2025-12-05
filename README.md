# Power Apps CODE App - Administrative Automation

A React/Vite-based Power Apps CODE app that automates administrative tasks and integrates with Microsoft 365, Dataverse, and SharePoint.

## What is a Power Apps CODE App?

Power Apps CODE apps are custom web applications built with standard web technologies (React, Vue, Angular) that integrate deeply with Microsoft Power Platform services. Unlike Canvas or Model-driven apps, CODE apps provide full control over UI/UX while maintaining Power Platform integration.

**Learn more**: https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview

## Project Structure

```
.
├── code-app/              # React/Vite frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients (Dataverse, Graph, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   └── types/         # TypeScript definitions
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── dataverse/             # Dataverse schema definitions
│   ├── schema-overview.md
│   └── table-creation-guide.md
│
├── sharepoint/            # SharePoint site structure
│   ├── site-structure.md
│   └── setup-guide.md
│
├── power-automate/        # Power Automate flow templates
│   ├── flow-templates.md
│   └── setup-guide.md
│
├── ai-integration/        # AI services configuration
│
├── docs/                  # Project documentation
│   ├── code-app-overview.md
│   └── [other docs]
│
├── prd.md                 # Product Requirements Document
└── README.md              # This file
```

## Key Features

- **Calendar Management**: Create, update, and manage Outlook meetings with voice/text
- **Email Management**: Voice-to-text email composition and AI-powered summaries
- **Task Management**: Integrated with Microsoft Planner/To Do and Dataverse
- **Smart Notifications**: Configurable alerts and reminders
- **AI Chat Interface**: Natural language command processing
- **Document Management**: Access and manage SharePoint documents
- **Voice Commands**: Speech-to-text for hands-free operation

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Fluent UI React (Microsoft design system)
- MSAL.js (authentication)
- React Router, Zustand, React Query

### Backend/Services
- Microsoft Dataverse (data storage)
- SharePoint Online (document management)
- Power Automate (workflow automation)
- Microsoft Graph API (Outlook, Teams integration)
- Azure Cognitive Services (speech, NLP)

## Quick Start

### Prerequisites
- Node.js 18+
- Access to Microsoft 365 tenant
- Power Platform environment with Dataverse
- Azure subscription

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Big-J-and-Pauli-Bignuts/money-maker.git
   cd money-maker
   ```

2. **Install dependencies**
   ```bash
   cd code-app
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure AD, Dataverse, and API credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   Open http://localhost:5173

## Documentation

- [CODE App Overview](./docs/code-app-overview.md) - Understanding CODE apps
- [Frontend README](./code-app/README.md) - React app details
- [Dataverse Schema](./dataverse/schema-overview.md) - Database structure
- [SharePoint Setup](./sharepoint/setup-guide.md) - Document management
- [Power Automate Flows](./power-automate/flow-templates.md) - Workflow automation
- [PRD](./prd.md) - Product requirements

## Project Status

✅ **Completed**
- Project structure and scaffolding
- Dataverse schema design
- SharePoint site structure
- Power Automate flow templates
- Core documentation
- React/Vite app setup
- TypeScript configuration

🚧 **In Progress**
- Authentication implementation
- Component development
- API service integration
- AI chat interface

📋 **Planned**
- Voice command implementation
- Complete UI/UX
- Testing suite
- Deployment pipeline

## Contributing

This is an internal project. For contributions:
1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

Proprietary - Internal use only

## Support

For questions or issues, contact the development team or open an issue in this repository.