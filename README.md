# Power Apps - Administrative Task Automation

A React/Vite application designed to automate day-to-day administrative tasks and organize operations under one roof.

## Features

### 📅 Calendar Management
- View, create, and manage calendar events
- Integration with Microsoft Outlook via Microsoft Graph API
- Visual calendar interface with day, week, and month views

### ⏰ Smart Reminders and Alerts
- Create reminders with natural language
- Priority levels (low, medium, high, urgent)
- Browser notifications for due reminders
- Tag-based organization

### 🤖 Natural Language Processing (NLP)
- Understand natural language commands
- Intent recognition for common tasks
- Entity extraction (dates, times, people, locations)
- Context-aware responses

### 💬 AI Chat Interface
- Conversational UI for task management
- Quick actions for common operations
- Help and guidance built-in
- Natural language interaction

### 💾 Dataverse Access
- Query Dataverse entities (contacts, accounts, leads, etc.)
- Permission-based access control
- Search and filter capabilities

### 📁 SharePoint Integration
- Browse SharePoint document libraries
- Search for files and documents
- Permission-based content access

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Azure AD app registration (for Microsoft integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Big-J-and-Pauli-Bignuts/money-maker.git
cd money-maker
```

2. Install dependencies:
```bash
npm install
```

3. Configure Azure AD (optional for full Microsoft integration):
   - Create an app registration in Azure AD
   - Add redirect URIs
   - Grant necessary API permissions

4. Create a \`.env\` file with your configuration:
```env
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_REDIRECT_URI=http://localhost:5173
VITE_DATAVERSE_URL=your-org
VITE_SHAREPOINT_URL=your-tenant
```

5. Start the development server:
```bash
npm run dev
```

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run lint\` - Run ESLint
- \`npm run preview\` - Preview production build

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Authentication**: MSAL (Microsoft Authentication Library)
- **Routing**: React Router v7
- **Date Handling**: date-fns
- **Styling**: CSS with CSS Variables

## Project Structure

\`\`\`
src/
├── components/          # React components
│   ├── Calendar/        # Calendar management
│   ├── Chat/            # AI Chat interface
│   ├── Dashboard/       # Main dashboard
│   ├── Layout/          # App layout and navigation
│   ├── NLP/             # SharePoint and Dataverse pages
│   └── Reminders/       # Reminders management
├── config/              # Configuration files
│   └── authConfig.ts    # MSAL configuration
├── services/            # Service layer
│   ├── calendarService.ts
│   ├── chatService.ts
│   ├── dataverseService.ts
│   ├── nlpService.ts
│   ├── reminderService.ts
│   └── sharepointService.ts
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx              # Main App component
├── main.tsx             # Entry point
└── index.css            # Global styles
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
