# SharePoint Integration - Aivana Site Content

## Overview

The app now integrates with the SharePoint site `https://365evergreen.sharepoint.com/sites/aivana` to display documents and files directly in the UI.

## What Was Added

### 1. **SharePoint Service** (`src/services/sharepoint.ts`)

A comprehensive SharePoint client that uses Microsoft Graph API to:

- ✅ Get site information
- ✅ List documents from document libraries
- ✅ Search for files across the site
- ✅ Get recent files (sorted by last modified)
- ✅ Get list items from SharePoint lists
- ✅ Upload files to SharePoint
- ✅ Get site pages/news

**Key Methods:**
- `getSiteInfo(sitePath)` - Get site metadata
- `getDocuments(sitePath, libraryName)` - List all documents from a library
- `searchFiles(sitePath, query)` - Search for files
- `getRecentFiles(sitePath, top)` - Get most recently modified files
- `getListItems(sitePath, listName)` - Get items from a list
- `uploadFile(sitePath, fileName, content)` - Upload a file
- `getSitePages(sitePath)` - Get site pages

### 2. **Documents Page Update** (`src/pages/Documents.tsx`)

The Documents page now shows live content from the Aivana SharePoint site:

**Features:**
- 📄 Displays recent files from `/sites/aivana` (up to 20 files)
- 🔍 Search functionality to find specific documents
- 📊 Data grid with sortable columns:
  - Name (with file/folder icons)
  - Modified date (formatted)
  - Modified by (user display name)
  - File size (formatted)
  - Actions (Open button)
- 🔄 Refresh button to reload documents
- ⏳ Loading states with spinner
- ❌ Error handling with retry functionality
- 📭 Empty state when no documents found
- 🖱️ Click on any row to open the document in SharePoint

**States:**
- Loading: Shows spinner while fetching
- Error: Shows error message with retry button
- Empty: Shows "No documents found" message
- Success: Shows data grid with documents

### 3. **Dashboard Widget Update** (`src/pages/Dashboard.tsx`)

The Dashboard now includes a "Recent Documents" widget:

**Features:**
- 📄 Shows 5 most recent files from Aivana site
- ⏰ Relative time formatting (e.g., "2h ago", "3d ago")
- 🔗 Quick open buttons for each document
- 🔄 Automatic loading on dashboard mount
- 📂 "Browse All Documents" link to Documents page
- ⏳ Loading state while fetching

**Display:**
- File name (truncated if too long)
- Last modified time (relative format)
- Open button (opens in new tab)

## Data Flow

1. **Authentication**: Uses MSAL to get access token with Microsoft Graph scopes
2. **API Calls**: SharePoint client uses Graph API (`/sites/{siteId}/...`)
3. **Token Injection**: Axios interceptor automatically adds Bearer token to requests
4. **State Management**: React useState hooks manage loading, error, and data states
5. **UI Updates**: Fluent UI components display the data responsively

## Required Permissions

The app requires these Microsoft Graph API permissions (already configured in `auth.ts`):

- ✅ `Sites.ReadWrite.All` - Read and write SharePoint sites
- ✅ `Files.ReadWrite.All` - Read and write files

**Note:** Admin consent must be granted in Azure AD for these permissions.

## Site Path Configuration

The SharePoint site path is configured in two places:

1. **.env file**: `VITE_SHAREPOINT_SITE_URL=https://365evergreen.sharepoint.com`
2. **Code**: Site path `/sites/aivana` is hardcoded in:
   - `Dashboard.tsx` line ~90: `sharepointClient.getRecentFiles('/sites/aivana', 5)`
   - `Documents.tsx` line ~115: `sharepointClient.getRecentFiles('/sites/aivana', 20)`
   - `Documents.tsx` line ~127: `sharepointClient.searchFiles('/sites/aivana', searchQuery)`

To change the site, update these references.

## File Type Icons

The UI automatically shows different icons:
- 📁 **Folder24Regular** for folders
- 📄 **Document24Regular** for files

## Responsive Design

All SharePoint content displays are fully responsive:

- **Desktop**: Data grid with all columns visible
- **Tablet**: Grid adjusts column widths
- **Mobile**: Cards stack vertically, full-width buttons

## Error Handling

The app gracefully handles various error scenarios:

1. **No permissions**: Shows error message
2. **Network failure**: Shows retry button
3. **Site not found**: Displays error
4. **Empty results**: Shows empty state with helpful message

## Testing Checklist

To test the SharePoint integration:

- [ ] Sign in with account that has access to Aivana site
- [ ] Check Dashboard shows recent documents widget
- [ ] Navigate to Documents page
- [ ] Verify documents load from SharePoint
- [ ] Test search functionality
- [ ] Click "Open" buttons to verify links work
- [ ] Test refresh button
- [ ] Verify error states (disconnect network)
- [ ] Test on mobile/tablet (responsive design)

## Future Enhancements

Potential features to add:

- 📤 File upload functionality (already in service)
- 🗂️ Browse folders/subfolders
- 📋 List view from SharePoint lists
- 📰 Site news/pages display
- 🏷️ Document metadata display
- 📑 Document preview
- 📊 Filter by file type
- 📅 Filter by date range
- 👥 Filter by author
- ⭐ Favorite documents

## API Rate Limits

Microsoft Graph API has throttling limits:
- **Per app per tenant**: 2,000 requests per 10 seconds
- **Per user**: 1,000 requests per 10 seconds

The app implements:
- Token caching (MSAL automatic)
- Axios interceptors for token refresh
- Error handling for throttling responses

## Security Notes

- ✅ All API calls use OAuth 2.0 Bearer tokens
- ✅ Tokens are automatically refreshed by MSAL
- ✅ User permissions are honored (users only see files they have access to)
- ✅ HTTPS enforced for all communications
- ✅ No credentials stored in code (environment variables only)
