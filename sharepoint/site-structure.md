# SharePoint Site Structure

This document outlines the SharePoint Online site architecture for the CODE App.

## Site Overview

**Site Type:** Team Site
**Site Name:** CODE App Administrative Hub
**URL Suggestion:** /sites/codeapp
**Template:** Team site (no Microsoft 365 group)

---

## Document Libraries

### 1. Meeting Documents
**Purpose:** Store meeting agendas, notes, and supporting materials

**Structure:**
```
/Meeting Documents
  /2025
    /Q1
      /January
      /February
      /March
    /Q2
    /Q3
    /Q4
  /Templates
    - Meeting Agenda Template.docx
    - Meeting Minutes Template.docx
```

**Metadata Columns:**
- Meeting Date (Date)
- Meeting Type (Choice: Team Meeting, Client Meeting, Board Meeting, One-on-One)
- Attendees (Person or Group, Multiple)
- Related Calendar Event ID (Text)
- Status (Choice: Draft, Final, Archived)

**Document Library Settings:**
- Versioning: Enabled (Keep major and minor versions)
- Content approval: Optional
- Check out required: No

---

### 2. Administrative Reports
**Purpose:** Store generated reports, analytics, and administrative documents

**Structure:**
```
/Administrative Reports
  /Financial
  /Operational
  /Analytics
  /Compliance
```

**Metadata Columns:**
- Report Type (Choice: Financial, Operational, Analytics, Compliance)
- Period (Date)
- Department (Choice: HR, Finance, Operations, IT, General)
- Confidentiality (Choice: Public, Internal, Confidential, Restricted)
- Owner (Person or Group)

---

### 3. Company Information
**Purpose:** Central repository for company policies, procedures, and reference materials

**Structure:**
```
/Company Information
  /Policies
  /Procedures
  /Forms
  /News
  /Training Materials
```

**Metadata Columns:**
- Document Type (Choice: Policy, Procedure, Form, News, Training)
- Effective Date (Date)
- Review Date (Date)
- Department (Choice)
- Published (Yes/No)

---

### 4. Shared Documents
**Purpose:** General document storage for collaborative work

**Metadata Columns:**
- Project (Text)
- Owner (Person or Group)
- Status (Choice: Draft, In Review, Approved)

---

## SharePoint Lists

### 1. Tasks List (Enhanced)
**Purpose:** Task tracking with integration to Dataverse

**Columns:**
- Title (Single line of text, Required)
- Description (Multiple lines of text)
- Assigned To (Person or Group)
- Due Date (Date and Time)
- Priority (Choice: Low, Medium, High, Critical)
- Status (Choice: Not Started, In Progress, Completed, Blocked)
- Category (Choice: Administrative, Meeting Prep, Follow-up, Other)
- Dataverse Task ID (Text) - for sync
- % Complete (Number)
- Related Documents (Lookup to Document Libraries)

**Views:**
- My Tasks
- High Priority Tasks
- Tasks Due This Week
- Completed Tasks
- All Tasks (grouped by status)

---

### 2. Notification Audit
**Purpose:** Backup audit trail for notifications (supplementary to Dataverse)

**Columns:**
- Title (Single line of text)
- Notification Type (Choice)
- Recipient (Person or Group)
- Sent Date (Date and Time)
- Status (Choice: Sent, Delivered, Failed)
- Message (Multiple lines of text)
- Dataverse Record ID (Text)

**Views:**
- Recent Notifications
- Failed Notifications
- Notifications by User

---

### 3. Document Metadata
**Purpose:** Extended metadata tracking for documents across libraries

**Columns:**
- Document Name (Single line of text)
- Document URL (Hyperlink)
- Tags (Multi-choice)
- Last Reviewed (Date)
- Next Review Date (Date)
- Reviewer (Person or Group)

---

### 4. Calendar Events (SharePoint Calendar)
**Purpose:** Visual calendar view synced with Outlook and Dataverse

**Columns:**
- Title (Required)
- Location
- Start Time
- End Time
- Description
- Category (Choice: Meeting, Deadline, Event, Holiday)
- All Day Event (Yes/No)
- Recurrence (Yes/No)
- Outlook Event ID (Text)
- Dataverse Event ID (Text)

---

## Site Pages

### Home Page
**Components:**
- Hero web part with company branding
- News web part (from Company Information/News)
- Quick Links (to frequently used libraries and apps)
- Embedded Power Apps (CODE App)
- Calendar web part
- Recent documents web part

### Forms Hub Page
**Components:**
- Document library web part filtered for Forms
- Links to Power Apps forms
- Instructions and help documentation

### Reports Dashboard
**Components:**
- Power BI embedded reports
- Document library filtered for Reports
- Quick stats web parts

---

## Permissions Structure

### Site Owners (Full Control)
- IT Administrators
- System Administrators

### Site Members (Edit)
- All employees
- Can create, edit, and delete their own content
- Cannot modify site structure

### Site Visitors (Read)
- External stakeholders (as needed)
- Limited to specific libraries based on need

### Custom Permission Levels

**Restricted Access:**
- For highly confidential documents
- Assigned to specific users/groups only

---

## Integration Points

### Power Apps Integration
1. Embed CODE App on home page
2. Enable Power Apps custom forms for lists
3. Link document libraries to Dataverse for attachments

### Power Automate Integration
1. Document approval workflows
2. Notification triggers when documents are uploaded
3. Sync with Dataverse tables
4. Automatic folder creation for new calendar events

### Microsoft Graph API
- Read/Write documents programmatically
- Sync list items with Dataverse
- Query site contents from Power Apps

---

## Content Types

### Meeting Document Content Type
**Parent:** Document
**Columns:**
- Meeting Date
- Meeting Type
- Attendees
- Related Event ID

### Report Content Type
**Parent:** Document
**Columns:**
- Report Type
- Period
- Department
- Confidentiality

### Policy Content Type
**Parent:** Document
**Columns:**
- Effective Date
- Review Date
- Department
- Version Number

---

## Search Configuration

**Searchable Columns:**
- All text columns
- Metadata columns
- Document content

**Promoted Results:**
- Company policies
- Common forms
- Training materials

**Search Refiners:**
- Document Type
- Department
- Date Modified
- Author

---

## Retention and Archival

### Retention Policies
- Meeting Documents: Retain for 7 years
- Reports: Retain for 5 years
- Chat Logs: Retain for 3 years
- Temporary Documents: Delete after 1 year

### Archival Process
- Automatic archival to separate library after retention period
- Manual archival option for sensitive documents
- Integration with Microsoft 365 Compliance Center

---

## Backup and Recovery

- Site backed up as part of Microsoft 365 backup
- Document versioning enabled
- Recycle bin retention: 93 days
- Second-stage recycle bin for site collection administrators

---

## Next Steps

1. Create SharePoint site using Microsoft 365 admin center or SharePoint admin center
2. Set up document libraries with defined structure
3. Create and configure lists
4. Apply metadata columns and content types
5. Configure permissions and security
6. Design and publish site pages
7. Test integration with Power Apps and Dataverse
8. Train users on document management practices
