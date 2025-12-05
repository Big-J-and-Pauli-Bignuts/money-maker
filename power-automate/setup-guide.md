# Power Automate Setup Guide

Step-by-step instructions for creating and configuring Power Automate flows.

## Prerequisites

- Power Automate Premium license (for Dataverse connector)
- Access to Power Automate portal (make.powerautomate.com)
- Completed Dataverse setup
- Completed SharePoint setup
- Microsoft 365 subscriptions for Outlook, Teams
- Azure subscription (for Cognitive Services and OpenAI)

---

## Setup Phase 1: Environment Configuration

### Step 1: Access Power Automate

1. Navigate to https://make.powerautomate.com
2. Select your environment (same as Dataverse environment)
3. Verify environment has Dataverse database

### Step 2: Create Service Principal (Recommended)

1. Navigate to Azure Portal (portal.azure.com)
2. Azure Active Directory → App registrations → New registration
3. Fill in:
   - Name: CODE App Flow Service Principal
   - Supported account types: Single tenant
   - Click **Register**

4. Note the Application (client) ID and Directory (tenant) ID

5. Create client secret:
   - Certificates & secrets → New client secret
   - Description: CODE App Flows
   - Expiration: 24 months
   - Click **Add**
   - **IMPORTANT:** Copy the secret value immediately (won't be shown again)

6. Configure API permissions:
   - API permissions → Add a permission
   - Microsoft Graph → Application permissions
   - Select:
     - Calendars.ReadWrite
     - Mail.ReadWrite
     - Mail.Send
     - User.Read.All
     - Files.ReadWrite.All
   - Click **Grant admin consent**

7. Add to Dataverse:
   - Power Platform admin center → Environments
   - Select environment → Settings → Users + permissions → Application users
   - New app user
   - Select your app registration
   - Business unit: Default
   - Security role: System Administrator (or custom role)

---

## Setup Phase 2: Create Connections

### Step 1: Create Dataverse Connection

1. In Power Automate, click **Data** → **Connections**
2. Click **+ New connection**
3. Search for "Microsoft Dataverse"
4. Click **Create**
5. Sign in with service principal or user account

### Step 2: Create SharePoint Connection

1. **+ New connection**
2. Search for "SharePoint"
3. Click **Create**
4. Sign in with your account
5. Verify access to CODE App site

### Step 3: Create Office 365 Outlook Connection

1. **+ New connection**
2. Search for "Office 365 Outlook"
3. Click **Create**
4. Sign in

### Step 4: Create Microsoft Teams Connection

1. **+ New connection**
2. Search for "Microsoft Teams"
3. Click **Create**
4. Sign in

### Step 5: Create Azure Cognitive Services Connection

1. First, create Cognitive Services resource in Azure:
   - Azure Portal → Create a resource
   - Search "Cognitive Services"
   - Create multi-service resource
   - Note the Key and Endpoint

2. In Power Automate:
   - **+ New connection**
   - Search for "Azure Cognitive Services"
   - Or use HTTP connector with authentication

### Step 6: Create Azure OpenAI Connection (for AI features)

1. Create Azure OpenAI resource:
   - Azure Portal → Create a resource
   - Search "Azure OpenAI"
   - Create resource
   - Deploy a model (e.g., gpt-4, gpt-35-turbo)
   - Note the endpoint and key

2. Use HTTP connector in flows to call OpenAI API

---

## Setup Phase 3: Create Environment Variables

Environment variables allow you to change configuration without modifying flows.

### Step 1: Create Environment Variables

1. Power Apps maker portal → Solutions → New solution
   - Name: CODE App Configuration
   - Publisher: Create new or select existing
   - Version: 1.0.0.0

2. Open solution → New → More → Environment variable

**Create these variables:**

**1. SharePoint Site URL**
- Display name: SharePoint Site URL
- Name: code_sharepointsiteurl
- Data type: Text
- Default value: https://yourtenant.sharepoint.com/sites/codeapp

**2. Admin Email**
- Display name: Admin Email
- Name: code_adminemail
- Data type: Text
- Default value: admin@yourtenant.com

**3. Notification Interval**
- Display name: Notification Check Interval
- Name: code_notificationinterval
- Data type: Number
- Default value: 5

**4. Azure OpenAI Endpoint**
- Display name: Azure OpenAI Endpoint
- Name: code_openaiendpoint
- Data type: Text
- Default value: https://yourresource.openai.azure.com

**5. Azure OpenAI Key**
- Display name: Azure OpenAI Key
- Name: code_openaikey
- Data type: Secret (use Azure Key Vault reference)
- Default value: [Your key]

---

## Setup Phase 4: Create Flows

### Flow 1: Calendar Sync to Dataverse

1. Click **+ Create** → **Scheduled cloud flow**

2. **Flow name:** Calendar Sync to Dataverse
3. **Run this flow:** Recurrence
4. **Repeat every:** 15 minutes

5. Click **Create**

6. **Add action:** List rows (Dataverse)
   - Table: User Profiles (code_userprofiles)
   - Click **Show advanced options**
   - Select columns: code_userprofileid, code_azureaduserid, code_email

7. **Add action:** Apply to each
   - Select output: value (from List rows)

8. **Inside Apply to each, add action:** HTTP
   - Method: GET
   - URI: `https://graph.microsoft.com/v1.0/users/@{items('Apply_to_each')?['code_azureaduserid']}/calendar/events?$filter=start/dateTime ge '@{utcNow()}'&$top=100`
   - Authentication: OAuth 2.0
   - Tenant: [Your tenant ID]
   - Audience: https://graph.microsoft.com
   - Client ID: [Service principal client ID]
   - Client Secret: [Service principal secret]

9. **Add action:** Parse JSON
   - Content: Body (from HTTP)
   - Schema: Click "Use sample payload" and paste:
   ```json
   {
     "value": [
       {
         "id": "string",
         "subject": "string",
         "start": {"dateTime": "string", "timeZone": "string"},
         "end": {"dateTime": "string", "timeZone": "string"},
         "location": {"displayName": "string"},
         "attendees": []
       }
     ]
   }
   ```

10. **Add action:** Apply to each (nested)
    - Select output: value (from Parse JSON)

11. **Inside nested Apply to each:**
    
    **Add action:** List rows (Dataverse)
    - Table: Calendar Events
    - Filter rows: `code_outlookeventid eq '@{items('Apply_to_each_2')?['id']}'`
    
    **Add action:** Condition
    - Condition: value (from List rows) is not equal to empty
    
    **If yes (event exists):**
    - Update a row (Dataverse)
      - Table: Calendar Events
      - Row ID: `@{first(outputs('List_rows_2')?['body/value'])?['code_calendareventid']}`
      - Fields: Map all fields
    
    **If no (new event):**
    - Add a new row (Dataverse)
      - Table: Calendar Events
      - Fields:
        - Title: `@{items('Apply_to_each_2')?['subject']}`
        - Start DateTime: `@{items('Apply_to_each_2')?['start']?['dateTime']}`
        - End DateTime: `@{items('Apply_to_each_2')?['end']?['dateTime']}`
        - Location: `@{items('Apply_to_each_2')?['location']?['displayName']}`
        - Outlook Event ID: `@{items('Apply_to_each_2')?['id']}`
        - Status: Scheduled
        - Created By: [Link to user profile]

12. **Add error handling:**
    - Add a scope around steps 6-11 named "Try"
    - Add a scope after named "Catch"
    - Configure "Catch" scope → Settings → Configure run after → Check "has failed"
    - Inside Catch: Send email notification to admin

13. **Save and Test**

### Flow 2: Meeting Creation from Voice

1. Click **+ Create** → **Instant cloud flow**

2. **Flow name:** Meeting Creation from Voice
3. **Choose trigger:** Power Apps

4. Click **Create**

5. **Add Power Apps trigger inputs:**
   - Click "+ Add an input"
   - Add these inputs:
     - MeetingTitle (Text)
     - StartDateTime (Text)
     - EndDateTime (Text)
     - Location (Text)
     - Attendees (Text)
     - Description (Text)
     - UserId (Text)

6. **Add action:** Initialize variable
   - Name: AttendeesArray
   - Type: Array
   - Value: `@split(triggerBody()['Attendees_Value'], ',')`

7. **Add action:** Create event (V4) - Office 365 Outlook
   - Calendar ID: Calendar
   - Subject: `@{triggerBody()['MeetingTitle_Value']}`
   - Start time: `@{triggerBody()['StartDateTime_Value']}`
   - End time: `@{triggerBody()['EndDateTime_Value']}`
   - Time zone: UTC
   - Location: `@{triggerBody()['Location_Value']}`
   - Required attendees: `@{join(variables('AttendeesArray'), ';')}`
   - Body: `@{triggerBody()['Description_Value']}`

8. **Add action:** Add a new row (Dataverse)
   - Table: Calendar Events
   - Fields:
     - Title: `@{triggerBody()['MeetingTitle_Value']}`
     - Start DateTime: `@{triggerBody()['StartDateTime_Value']}`
     - End DateTime: `@{triggerBody()['EndDateTime_Value']}`
     - Location: `@{triggerBody()['Location_Value']}`
     - Attendees: `@{triggerBody()['Attendees_Value']}`
     - Description: `@{triggerBody()['Description_Value']}`
     - Outlook Event ID: `@{outputs('Create_event_(V4)')?['body/id']}`
     - Status: Scheduled
     - Created By: `@{triggerBody()['UserId_Value']}`

9. **Add action:** Post message in a chat or channel (Teams)
   - Post as: Flow bot
   - Post in: Chat with Flow bot
   - Recipient: `@{triggerBody()['UserId_Value']}`
   - Message: `Meeting "@{triggerBody()['MeetingTitle_Value']}" created successfully for @{triggerBody()['StartDateTime_Value']}`

10. **Add action:** Respond to a PowerApp or flow
    - Add outputs:
      - Success (Yes/No): Yes
      - EventId (Text): `@{outputs('Add_a_new_row')?['body/code_calendareventid']}`
      - Message (Text): "Meeting created successfully"

11. **Add error handling** (similar to Flow 1)

12. **Save and Test** from Power Apps

### Continue Creating Other Flows

Follow similar patterns from flow-templates.md for:
- Smart Reminder Notifications
- Email Dictation Handler
- Inbox Summary Generator
- Document Upload Notification
- Task Sync SharePoint-Dataverse
- Chat Log Storage
- Meeting Notes Backup

---

## Setup Phase 5: Create Solution

Package all flows in a solution for easier management and deployment.

1. Power Apps → Solutions → Open "CODE App Configuration"

2. Add existing flows:
   - Click **Add existing** → **Automation** → **Cloud flow**
   - Select all CODE App flows
   - Click **Add**

3. Export solution:
   - Select solution → **Export**
   - Choose Managed or Unmanaged
   - Download

4. Import to other environments:
   - Target environment → Solutions → **Import**
   - Upload exported solution
   - Configure connections and environment variables
   - Import

---

## Setup Phase 6: Monitoring & Alerts

### Step 1: Enable Flow Analytics

1. Power Automate → **Monitor** → **Cloud flow activity**
2. Review:
   - Run history
   - Success/failure rates
   - Performance metrics

### Step 2: Configure Alerts

1. For critical flows, add email notifications on failure
2. Use Application Insights for advanced monitoring (optional)

### Step 3: Create Admin Dashboard

1. Power BI Desktop → **Get Data** → Power Automate Management Connector
2. Create dashboard showing:
   - Flow runs by status
   - Failure trends
   - Most used flows
   - Performance metrics

---

## Testing Checklist

### Calendar Sync Flow
- [ ] Trigger runs on schedule
- [ ] Retrieves Outlook events
- [ ] Creates new Dataverse records
- [ ] Updates existing records
- [ ] Handles users with no events
- [ ] Error handling works

### Meeting Creation Flow
- [ ] Triggers from Power Apps
- [ ] Creates Outlook event
- [ ] Creates Dataverse record
- [ ] Sends Teams notification
- [ ] Returns success response
- [ ] Handles invalid inputs

### Notification Flow
- [ ] Evaluates alert rules correctly
- [ ] Sends timely notifications
- [ ] Doesn't send duplicates
- [ ] Logs to Notification History
- [ ] Works with different rule types

### Document Upload Flow
- [ ] Triggers on file upload
- [ ] Identifies correct recipients
- [ ] Sends Teams notification
- [ ] Creates Dataverse record
- [ ] Handles large files

### Task Sync Flow
- [ ] Syncs SharePoint to Dataverse
- [ ] Syncs Dataverse to SharePoint
- [ ] Handles updates correctly
- [ ] Prevents sync loops
- [ ] Maintains data integrity

---

## Troubleshooting

### Issue: Flow fails with "Forbidden" error
**Solutions:**
- Check service principal permissions
- Verify Dataverse security roles
- Check SharePoint site permissions
- Ensure Graph API permissions granted

### Issue: Flow runs slowly
**Solutions:**
- Use pagination for large datasets
- Implement parallel branches
- Filter at source instead of in flow
- Check for unnecessary loops

### Issue: Connections expire
**Solutions:**
- Use service principal instead of user
- Regularly renew client secrets
- Set up alerts for expiring credentials

### Issue: Data sync conflicts
**Solutions:**
- Implement last-write-wins strategy
- Add conflict resolution logic
- Use version tracking
- Implement locking mechanism

---

## Best Practices

1. **Naming Conventions:**
   - Prefix all flows with "CODE - "
   - Use descriptive names
   - Version flows (v1, v2)

2. **Error Handling:**
   - Always implement try-catch scopes
   - Log errors to Dataverse or Application Insights
   - Send admin notifications for critical failures

3. **Performance:**
   - Use pagination for large datasets
   - Implement caching where appropriate
   - Use parallel branches for independent operations

4. **Security:**
   - Use service principals for scheduled flows
   - Store secrets in Azure Key Vault
   - Implement least privilege access
   - Regular audit of permissions

5. **Maintenance:**
   - Document all flows
   - Use environment variables for configuration
   - Package flows in solutions
   - Regular testing in non-production environment

---

## Next Steps

1. Complete all flow creation
2. Test integrated scenarios end-to-end
3. Set up monitoring and alerts
4. Document any customizations
5. Train administrators on flow management
6. Plan for future enhancements
