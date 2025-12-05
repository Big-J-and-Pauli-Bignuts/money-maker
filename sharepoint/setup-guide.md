# SharePoint Setup Guide

Step-by-step instructions for creating and configuring the SharePoint site.

## Prerequisites

- SharePoint Online license
- SharePoint Administrator or Site Collection Administrator role
- Access to SharePoint admin center
- Permissions to create new sites

---

## Phase 1: Site Creation

### Step 1: Create the Site

1. Navigate to SharePoint admin center (admin.microsoft.com → SharePoint)
2. Click **Sites** → **Active sites**
3. Click **+ Create**
4. Select **Team site**
5. Fill in details:
   - **Site name:** CODE App Administrative Hub
   - **Site description:** Centralized platform for administrative automation and document management
   - **Primary administrator:** Your email
   - **Language:** English
   - **Privacy settings:** Private (only members can access)
6. Click **Next** and then **Finish**

### Step 2: Access Site Settings

1. Navigate to your new site
2. Click the gear icon (⚙️) → **Site settings**
3. Note the site URL for later configuration

---

## Phase 2: Document Library Setup

### Create Meeting Documents Library

1. From home page, click **+ New** → **Document library**
2. Name: **Meeting Documents**
3. Description: Store meeting agendas, notes, and materials
4. Click **Create**

5. Add folder structure:
   - Click **+ New** → **Folder**
   - Create: 2025, Templates
   - Within 2025: Create Q1, Q2, Q3, Q4
   - Within Q1: Create January, February, March

6. Add custom columns:
   - Click gear icon → **Library settings** → **Create column**
   
   **Column 1: Meeting Date**
   - Name: Meeting Date
   - Type: Date and Time
   - Format: Date Only
   - Required: Yes
   
   **Column 2: Meeting Type**
   - Name: Meeting Type
   - Type: Choice
   - Choices (one per line):
     - Team Meeting
     - Client Meeting
     - Board Meeting
     - One-on-One
   - Default: Team Meeting
   
   **Column 3: Attendees**
   - Name: Attendees
   - Type: Person or Group
   - Allow multiple selections: Yes
   
   **Column 4: Related Calendar Event ID**
   - Name: Related Calendar Event ID
   - Type: Single line of text
   - Max characters: 100
   
   **Column 5: Status**
   - Name: Status
   - Type: Choice
   - Choices: Draft, Final, Archived
   - Default: Draft

7. Enable versioning:
   - Library settings → **Versioning settings**
   - Content approval: No
   - Document version history: Create major and minor versions
   - Keep major versions: 50
   - Keep minor versions: 10

### Create Other Libraries

Repeat similar process for:
- **Administrative Reports**
- **Company Information**
- **Shared Documents**

(Refer to site-structure.md for specific columns and folders)

---

## Phase 3: Lists Setup

### Create Tasks List

1. Click **+ New** → **List**
2. Select **Blank list**
3. Name: **Tasks**
4. Click **Create**

5. Modify Title column:
   - Click **Title** column → **Column settings** → **Edit**
   - Make required

6. Add columns (click **+ Add column**):

   **Description:**
   - Type: Multiple lines of text
   - Plain text
   
   **Assigned To:**
   - Type: Person
   - Allow multiple: No
   
   **Due Date:**
   - Type: Date and Time
   - Include time: Yes
   
   **Priority:**
   - Type: Choice
   - Choices: Low, Medium, High, Critical
   - Default: Medium
   
   **Status:**
   - Type: Choice
   - Choices: Not Started, In Progress, Completed, Blocked
   - Default: Not Started
   
   **Category:**
   - Type: Choice
   - Choices: Administrative, Meeting Prep, Follow-up, Other
   
   **Dataverse Task ID:**
   - Type: Single line of text
   
   **% Complete:**
   - Type: Number
   - Min: 0, Max: 100
   - Show as percentage: Yes

7. Create views:
   - Click **All items** view dropdown → **Edit current view**
   - Create filtered views for "My Tasks", "High Priority", etc.

### Create Other Lists

Follow similar process for:
- **Notification Audit**
- **Document Metadata**
- **Calendar Events** (use Calendar template instead of blank)

---

## Phase 4: Site Pages Configuration

### Create Home Page

1. Click **+ New** → **Page**
2. Select **Blank** template
3. Name: **Home**

4. Add web parts:
   - Click **+** icon to add sections
   
   **Section 1: Hero**
   - Add **Hero** web part
   - Upload company image
   - Add title: "CODE App Administrative Hub"
   - Add description
   
   **Section 2: News and Quick Links**
   - Left column: Add **News** web part
     - Source: This site
     - Layout: Hub news
   - Right column: Add **Quick links** web part
     - Add links to libraries and external resources
   
   **Section 3: Power Apps**
   - Add **Power Apps** web part
   - Select CODE App (after it's created)
   
   **Section 4: Calendar**
   - Add **Events** web part
   - Source: Calendar Events list
   
   **Section 5: Recent Documents**
   - Add **Document library** web part
   - Source: Meeting Documents
   - View: Recent

5. Click **Publish**

### Set as Home Page

1. On the page, click **...** → **Make homepage**

---

## Phase 5: Permissions Configuration

### Create Security Groups

1. Click gear icon → **Site permissions**
2. Click **Advanced permissions settings**

3. Create custom permission levels:
   - **Ribbon** → **Permission Levels** → **Add a Permission Level**
   
   **Restricted Access:**
   - Name: Restricted Access
   - Description: Limited access to confidential content
   - Permissions: Check only:
     - View Items
     - Open Items
     - View Pages

### Assign Permissions

1. **Owners group:**
   - Add IT Administrators
   - Add System Administrators

2. **Members group:**
   - Add all employees who need edit access
   
3. **Visitors group:**
   - Add external stakeholders (if needed)

4. **Confidential Documents:**
   - Navigate to Administrative Reports → Confidential folder
   - Break permission inheritance
   - Grant access only to specific users

---

## Phase 6: Content Types Setup

### Create Meeting Document Content Type

1. Click gear icon → **Site settings**
2. Under **Web Designer Galleries**, click **Site content types**
3. Click **Create**

4. Fill in:
   - Name: Meeting Document
   - Description: Content type for meeting-related documents
   - Parent: Document Content Types → Document
   - Group: CODE App Content Types

5. Click **OK**

6. Add columns:
   - Click **Add from existing site columns**
   - Select: Meeting Date, Meeting Type, Attendees, Related Calendar Event ID
   - Click **OK**

7. Apply to library:
   - Go to Meeting Documents library
   - Library settings → **Advanced settings**
   - Allow management of content types: Yes
   - Click **OK**
   - Under Content Types, click **Add from existing site content types**
   - Select "Meeting Document"

### Create Other Content Types

Repeat for:
- Report Content Type
- Policy Content Type

---

## Phase 7: Integration Configuration

### Enable Power Apps Integration

1. In any list, click **Integrate** → **Power Apps**
2. Click **Create an app**
3. This will open Power Apps Studio
4. Create or select existing CODE App

### Set Up Power Automate Flows

1. In document library, click **Automate** → **Power Automate** → **Create a flow**
2. Select templates or create custom flows:
   - "When a file is created in SharePoint..."
   - "When an item is created or modified..."
3. Configure flows to sync with Dataverse

### Configure Microsoft Graph Access

1. Register app in Azure AD:
   - Navigate to Azure Portal → Azure Active Directory
   - App registrations → New registration
   - Name: CODE App Graph Connector
   - Supported account types: Single tenant
   - Click **Register**

2. Configure API permissions:
   - API permissions → Add a permission
   - Microsoft Graph → Delegated permissions
   - Select: Sites.ReadWrite.All, Files.ReadWrite.All
   - Grant admin consent

3. Create client secret:
   - Certificates & secrets → New client secret
   - Save the value securely

4. Note Application (client) ID and Directory (tenant) ID

---

## Phase 8: Search Configuration

### Configure Search Settings

1. Click gear icon → **Site settings**
2. Under **Search**, click **Search Settings**
3. Configure:
   - Enable search in this site: Yes
   - Index site content: Yes

### Set Up Search Refiners

1. Navigate to **Site contents**
2. Click gear icon → **Site settings**
3. Under **Search**, click **Search Schema**
4. Map crawled properties to managed properties
5. Enable refiners for: Department, Document Type, Date Modified

---

## Phase 9: Compliance and Retention

### Set Up Retention Policies

1. Navigate to Microsoft 365 Compliance Center
2. **Information governance** → **Retention policies**
3. Click **+ New retention policy**

4. **Meeting Documents Policy:**
   - Name: Meeting Documents Retention
   - Locations: SharePoint sites (select your site)
   - Retain for: 7 years
   - Then: Delete automatically

5. Create additional policies for other content types

### Enable Auditing

1. Microsoft 365 Compliance Center
2. **Audit** → **Start recording user and admin activity**
3. Select activities to log

---

## Phase 10: Testing and Validation

### Test Checklist

- [ ] All document libraries created with correct structure
- [ ] All lists created with correct columns
- [ ] Custom columns added to libraries
- [ ] Metadata columns appear in document upload forms
- [ ] Folder structure in place
- [ ] Versioning enabled on libraries
- [ ] Permissions configured correctly
- [ ] Home page displays all web parts correctly
- [ ] Content types applied to libraries
- [ ] Search returns expected results
- [ ] Upload test documents to each library
- [ ] Create test items in lists
- [ ] Verify sync with Dataverse (after Dataverse setup complete)
- [ ] Test Power Apps embedding
- [ ] Test Power Automate flows

---

## Troubleshooting

### Issue: Cannot create document library
**Solution:** Verify you have Site Owner or Full Control permissions

### Issue: Custom columns not showing in forms
**Solution:** Check if column is required and not hidden. Edit form in list/library settings.

### Issue: Permissions not applying correctly
**Solution:** Check for inheritance. Break inheritance if needed at folder/item level.

### Issue: Search not returning results
**Solution:** Allow 24 hours for search indexing. Force crawl from SharePoint admin center.

---

## Next Steps

- Complete Dataverse setup for integration
- Create Power Automate flows for synchronization
- Build Power Apps interface
- Train users on document management
- Schedule regular reviews of permissions and content
