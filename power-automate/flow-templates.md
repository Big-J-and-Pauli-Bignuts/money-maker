# Power Automate Flow Templates

This document provides templates and specifications for Power Automate flows required for the CODE App.

## Flow Overview

| Flow Name | Trigger | Purpose | Integration Points |
|-----------|---------|---------|-------------------|
| Calendar Sync to Dataverse | Schedule (Every 15 min) | Sync Outlook calendar with Dataverse | Outlook, Dataverse |
| Meeting Creation from Voice | HTTP Request | Create meeting from AI assistant command | Dataverse, Outlook, Teams |
| Smart Reminder Notifications | Schedule (Every 5 min) | Send notifications based on alert rules | Dataverse, Teams, Email |
| Email Dictation Handler | Power Apps trigger | Process voice-to-text email drafts | Azure Cognitive Services, Outlook |
| Inbox Summary Generator | Manual/Schedule | Generate AI summary of inbox | Outlook, Azure OpenAI |
| Document Upload Notification | SharePoint (When file created) | Notify users of new documents | SharePoint, Dataverse, Teams |
| Task Sync SharePoint-Dataverse | SharePoint (When item modified) | Bidirectional task sync | SharePoint, Dataverse |
| Chat Log Storage | HTTP Request | Store AI conversation logs | Dataverse |
| Meeting Notes Backup | Outlook (When event ends) | Save meeting notes to SharePoint | Outlook, SharePoint, Dataverse |

---

## Flow 1: Calendar Sync to Dataverse

### Purpose
Synchronize Outlook calendar events with Dataverse Calendar Events table for centralized management and reporting.

### Trigger
- **Type:** Recurrence
- **Interval:** 15 minutes

### Actions Flow

```
1. Get User Profiles from Dataverse
   └─ For each User Profile:
      └─ 2. Get Calendar Events from Outlook (Microsoft Graph)
         ├─ Filter: Start time in next 30 days
         ├─ Select: id, subject, start, end, location, attendees
         └─ 3. For each Outlook Event:
            └─ 4. Check if Event exists in Dataverse
               ├─ Filter: code_outlookeventid eq '@{items('Outlook_Event')?['id']}'
               └─ 5. Condition: Event exists?
                  ├─ YES: Update Dataverse record
                  │  └─ Update a row (Dataverse)
                  │     ├─ Table: Calendar Events
                  │     ├─ Row ID: [Dataverse Event ID]
                  │     └─ Fields: title, start/end time, location, attendees, status
                  │
                  └─ NO: Create new Dataverse record
                     └─ Add a new row (Dataverse)
                        ├─ Table: Calendar Events
                        └─ Fields: All event details + Outlook Event ID
```

### Key Configurations

**Microsoft Graph Connection:**
- API: `/me/calendar/events`
- Parameters: `$filter=start/dateTime ge '${utcNow()}'&$top=100`

**Dataverse Connection:**
- Use service principal or user context
- Ensure permissions for Calendar Events table

**Error Handling:**
- Scope action with Run After = has failed
- Send email notification to admin on failure
- Log errors to Dataverse

---

## Flow 2: Meeting Creation from Voice

### Purpose
Create Outlook meetings from voice commands processed through the AI assistant.

### Trigger
- **Type:** Power Apps (Manual)
- **Parameters:** 
  - MeetingTitle (string)
  - StartDateTime (string)
  - EndDateTime (string)
  - Location (string)
  - Attendees (string, comma-separated)
  - Description (string)
  - UserId (string, Dataverse User Profile ID)

### Actions Flow

```
1. Parse Attendees
   └─ Compose action to split attendees string into array
   
2. Create Event in Outlook
   └─ Create event (V4) - Office 365 Outlook
      ├─ Calendar: Calendar
      ├─ Subject: @{triggerBody()['MeetingTitle']}
      ├─ Start time: @{triggerBody()['StartDateTime']}
      ├─ End time: @{triggerBody()['EndDateTime']}
      ├─ Location: @{triggerBody()['Location']}
      ├─ Required attendees: @{variables('AttendeesArray')}
      └─ Body: @{triggerBody()['Description']}
   
3. Create Event in Dataverse
   └─ Add a new row (Dataverse)
      ├─ Table: Calendar Events
      ├─ Title: Meeting title
      ├─ Outlook Event ID: @{outputs('Create_Event')?['body/id']}
      ├─ Start/End DateTime: From trigger
      ├─ Location: From trigger
      ├─ Attendees: JSON string
      ├─ Status: Scheduled
      └─ Created By: Lookup to User Profile
   
4. Send Confirmation Notification
   └─ Post message in a chat or channel (Teams)
      ├─ Recipient: User
      └─ Message: "Meeting '${MeetingTitle}' created for ${StartDateTime}"
   
5. Respond to Power Apps
   └─ Respond to a PowerApp or flow
      └─ Output: Success=true, EventId, Message
```

### Error Handling
- Try-Catch scope around Outlook creation
- If fails, send error message to Teams
- Do not create Dataverse record if Outlook fails

---

## Flow 3: Smart Reminder Notifications

### Purpose
Check alert rules and send notifications for upcoming events and deadlines.

### Trigger
- **Type:** Recurrence
- **Interval:** 5 minutes

### Actions Flow

```
1. Get Active Alert Rules
   └─ List rows (Dataverse)
      ├─ Table: Alert Rules
      └─ Filter: code_isactive eq true
   
2. For each Alert Rule:
   └─ 3. Parse Rule Condition (JSON)
      └─ 4. Evaluate Rule Type
         ├─ Time-based: Check upcoming events within trigger window
         ├─ Event-based: Check for specific event types
         └─ Recurring: Check against schedule
      
      └─ 5. Get Relevant Events/Tasks
         └─ List rows (Dataverse)
            ├─ Table: Calendar Events or Tasks
            └─ Filter: Based on rule condition
         
         └─ 6. For each Event/Task matching rule:
            └─ 7. Check if notification already sent
               ├─ List rows (Dataverse)
               │  ├─ Table: Notification History
               │  └─ Filter: Related entity ID and sent in last 24 hours
               │
               └─ 8. Condition: Notification exists?
                  ├─ YES: Skip
                  └─ NO: Send notification
                     ├─ 9. Apply notification template
                     │  └─ Replace placeholders with event details
                     │
                     ├─ 10. Send via Teams
                     │  └─ Post adaptive card or message
                     │
                     ├─ 11. Send via Email (optional)
                     │  └─ Send email (V2)
                     │
                     └─ 12. Log to Notification History
                        └─ Add a new row (Dataverse)
                           ├─ Recipient: User
                           ├─ Type: From rule
                           ├─ Sent DateTime: utcNow()
                           ├─ Status: Sent
                           └─ Related Entity: Event/Task ID
```

### Notification Template Example

```json
{
  "type": "AdaptiveCard",
  "body": [
    {
      "type": "TextBlock",
      "text": "⏰ Reminder: ${EventTitle}",
      "weight": "Bolder",
      "size": "Large"
    },
    {
      "type": "TextBlock",
      "text": "Starting in ${MinutesUntil} minutes"
    },
    {
      "type": "FactSet",
      "facts": [
        {
          "title": "Time:",
          "value": "${StartTime}"
        },
        {
          "title": "Location:",
          "value": "${Location}"
        }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "Open in Outlook",
      "url": "${OutlookUrl}"
    },
    {
      "type": "Action.OpenUrl",
      "title": "Join Meeting",
      "url": "${MeetingUrl}"
    }
  ]
}
```

---

## Flow 4: Email Dictation Handler

### Purpose
Process voice-to-text for email composition and send emails on behalf of users.

### Trigger
- **Type:** Power Apps (Manual)
- **Parameters:**
  - VoiceText (string, transcribed text)
  - UserId (string)
  - Action (string: "Draft" or "Send")

### Actions Flow

```
1. Call Azure Cognitive Services - Text Analytics
   └─ Detect Language and Extract Key Phrases
      └─ Input: @{triggerBody()['VoiceText']}
   
2. Parse Email Components using AI
   └─ HTTP action to Azure OpenAI
      ├─ Method: POST
      ├─ URI: https://[resource].openai.azure.com/openai/deployments/[model]/chat/completions
      ├─ Headers: api-key, Content-Type
      └─ Body:
         {
           "messages": [
             {
               "role": "system",
               "content": "Extract email components (recipient, subject, body) from this dictation."
             },
             {
               "role": "user",
               "content": "@{triggerBody()['VoiceText']}"
             }
           ]
         }
   
3. Parse AI Response
   └─ Parse JSON
      └─ Extract: Recipient, Subject, Body
   
4. Condition: Action = "Draft" or "Send"?
   ├─ Draft:
   │  └─ Create draft message (V3)
   │     ├─ To: @{body('Parse_JSON')?['recipient']}
   │     ├─ Subject: @{body('Parse_JSON')?['subject']}
   │     └─ Body: @{body('Parse_JSON')?['body']}
   │
   └─ Send:
      └─ Send email (V2)
         ├─ To: @{body('Parse_JSON')?['recipient']}
         ├─ Subject: @{body('Parse_JSON')?['subject']}
         └─ Body: @{body('Parse_JSON')?['body']}
   
5. Respond to Power Apps
   └─ Return: Status, MessageId, ParsedComponents
```

---

## Flow 5: Inbox Summary Generator

### Purpose
Generate AI-powered summary of user's inbox for quick review.

### Trigger
- **Type:** Power Apps (Manual) or Schedule (daily at 8 AM)
- **Parameters:** UserId (optional)

### Actions Flow

```
1. Get emails from past 24 hours
   └─ List emails (V3) - Office 365 Outlook
      ├─ Folder: Inbox
      ├─ Top: 50
      └─ Filter: receivedDateTime ge ${addDays(utcNow(), -1)}
   
2. Extract email details
   └─ Select action
      └─ Map: From, Subject, ReceivedDateTime, BodyPreview, Importance
   
3. Generate AI Summary
   └─ HTTP to Azure OpenAI
      ├─ Prompt: "Summarize these emails by category and priority"
      └─ Input: JSON array of emails
   
4. Parse AI Response
   └─ Extract: Summary text, Priority items, Action items
   
5. Create Adaptive Card
   └─ Compose adaptive card with summary sections
   
6. Send to Teams
   └─ Post adaptive card in chat
   
7. Store summary in Dataverse (optional)
   └─ Add row to custom Summary table
```

---

## Flow 6: Document Upload Notification

### Purpose
Notify relevant users when new documents are uploaded to SharePoint.

### Trigger
- **Type:** When a file is created (SharePoint)
- **Site Address:** CODE App site
- **Library:** All relevant libraries

### Actions Flow

```
1. Get file properties
   └─ Get file metadata (SharePoint)
   
2. Check if notification needed
   └─ Condition: File size > 0 AND not in Temp folder
   
3. Get document owner/creator
   └─ Get user profile (SharePoint/Office 365)
   
4. Determine recipients
   └─ Based on library and metadata (Department, etc.)
   
5. Create notification record in Dataverse
   └─ Add row to Notification History
   
6. Send Teams notification
   └─ Post adaptive card with:
      ├─ Document name
      ├─ Uploaded by
      ├─ Library location
      └─ Quick link to document
   
7. Send email (if configured)
   └─ To: Recipients
      └─ Include document link
```

---

## Flow 7: Task Sync SharePoint-Dataverse

### Purpose
Bidirectional synchronization between SharePoint Tasks list and Dataverse Tasks table.

### Trigger
- **Type:** When an item is created or modified (SharePoint)
- **Site Address:** CODE App site
- **List:** Tasks

### Actions Flow

```
1. Check for Dataverse Task ID in SharePoint item
   └─ Condition: code_dataversetaskid is not null?
   
   ├─ YES (Update existing):
   │  └─ Update row (Dataverse)
   │     ├─ Table: Tasks
   │     ├─ Row ID: @{triggerBody()?['DataverseTaskID']}
   │     └─ Fields: Title, Description, Due Date, Status, Priority, etc.
   │
   └─ NO (Create new):
      └─ Add row (Dataverse)
         ├─ Table: Tasks
         ├─ Fields: All from SharePoint
         └─ 2. Update SharePoint item with Dataverse ID
            └─ Update item (SharePoint)
               └─ Set: DataverseTaskID = new Dataverse record ID
```

### Reverse Flow (Dataverse to SharePoint)

Create a separate flow with Dataverse trigger:
- When a row is added or modified (Dataverse)
- Sync to SharePoint using similar logic

---

## Flow 8: Chat Log Storage

### Purpose
Store AI chatbot conversation logs in Dataverse.

### Trigger
- **Type:** HTTP Request (from Power Virtual Agents or Copilot)
- **Method:** POST
- **Schema:**
```json
{
  "type": "object",
  "properties": {
    "userId": {"type": "string"},
    "sessionId": {"type": "string"},
    "userMessage": {"type": "string"},
    "botResponse": {"type": "string"},
    "intent": {"type": "string"},
    "confidence": {"type": "number"},
    "actionTaken": {"type": "string"}
  }
}
```

### Actions Flow

```
1. Parse HTTP request body
   └─ Parse JSON
   
2. Get User Profile from Dataverse
   └─ List rows with filter: azureaduserid eq userId
   
3. Add Chat Log to Dataverse
   └─ Add row (Dataverse)
      ├─ Table: Chat Logs
      ├─ User: Lookup to User Profile
      ├─ Session ID: From request
      ├─ User Message: From request
      ├─ Bot Response: From request
      ├─ Intent: From request
      ├─ Confidence: From request
      ├─ Timestamp: utcNow()
      └─ Action Taken: From request
   
4. Response (200 OK)
   └─ Return success status
```

---

## Flow 9: Meeting Notes Backup

### Purpose
Automatically save meeting notes to SharePoint after meetings end.

### Trigger
- **Type:** Recurrence (Every 30 minutes)

### Actions Flow

```
1. Get recent ended meetings
   └─ List rows (Dataverse)
      ├─ Table: Calendar Events
      └─ Filter: code_enddatetime lt '${utcNow()}' and code_enddatetime gt '${addHours(utcNow(), -1)}' and code_status eq 'Completed'
   
2. For each meeting:
   └─ 3. Get meeting details from Outlook
      └─ Get event (V4)
         └─ Event ID: From Dataverse
      
      └─ 4. Check if meeting has notes
         └─ Condition: Body contains content
         
         └─ 5. Create Word document in SharePoint
            ├─ Create file (SharePoint)
            │  ├─ Site: CODE App
            │  ├─ Folder: /Meeting Documents/[Year]/[Month]
            │  ├─ File name: Meeting Notes - ${EventTitle} - ${Date}.docx
            │  └─ Content: Template with meeting details and notes
            │
            └─ 6. Update file metadata
               └─ Update file properties (SharePoint)
                  ├─ Meeting Date: Event date
                  ├─ Meeting Type: From Dataverse
                  ├─ Related Calendar Event ID: Dataverse ID
                  └─ Status: Final
```

---

## Common Components & Best Practices

### Error Handling Pattern

```
Scope: Try
├─ [Main flow actions]
└─ Scope: Catch (Configure run after: has failed)
   ├─ Compose: Error details
   ├─ Send email to admin
   └─ Log to Application Insights (optional)
```

### Authentication

**Recommended:**
- Use service principals for scheduled flows
- Use user context for user-triggered flows
- Store credentials in Azure Key Vault
- Reference via Key Vault connector

### Performance Optimization

- Use pagination for large datasets
- Implement caching where appropriate
- Use parallel branches for independent operations
- Filter data at source (Dataverse, SharePoint)

### Testing

- Create separate flows for Development and Production
- Use environment variables for configurations
- Test with small datasets first
- Monitor run history regularly

---

## Deployment Checklist

- [ ] All connections configured (Dataverse, SharePoint, Outlook, Teams)
- [ ] Service principal created with appropriate permissions
- [ ] Environment variables configured
- [ ] Error handling implemented in all flows
- [ ] Flows tested with sample data
- [ ] Flows assigned to solution for ALM
- [ ] Documentation created for each flow
- [ ] Monitoring and alerts configured
- [ ] Flows shared with appropriate users

---

## Next Steps

1. Create flows in Power Automate portal (make.powerautomate.com)
2. Test each flow individually
3. Test integrated scenarios (e.g., voice command → meeting creation → notification)
4. Monitor for errors and optimize
5. Document any customizations or business-specific logic
