# Dataverse Table Creation Guide

Step-by-step instructions for creating the required Dataverse tables.

## Prerequisites

- Access to Power Apps maker portal (make.powerapps.com)
- Environment with Dataverse database
- System Administrator or System Customizer role

---

## Step 1: Access Dataverse

1. Navigate to https://make.powerapps.com
2. Select your environment from the top-right dropdown
3. Click **Tables** in the left navigation
4. Click **+ New table** → **Add columns and data**

---

## Step 2: Create User Profile Table

### Basic Information
- **Display name:** User Profile
- **Plural name:** User Profiles
- **Schema name:** code_userprofile
- **Primary column:** code_name (rename from default)
- **Enable attachments:** No
- **Track changes:** Yes
- **Provide custom help:** Optional

### Add Columns

Click **+ New column** for each:

1. **Email**
   - Display name: Email
   - Data type: Single line of text
   - Format: Email
   - Required: Business required

2. **Preferred Language**
   - Display name: Preferred Language
   - Data type: Choice
   - Choices: English, Spanish, French
   - Default: English

3. **Time Zone**
   - Display name: Time Zone
   - Data type: Single line of text
   - Max length: 100

4. **Notification Preferences**
   - Display name: Notification Preferences
   - Data type: Multiple lines of text
   - Format: Text
   - Max length: 4000

5. **Azure AD User ID**
   - Display name: Azure AD User ID
   - Data type: Single line of text
   - Max length: 100

---

## Step 3: Create Calendar Events Table

### Basic Information
- **Display name:** Calendar Event
- **Plural name:** Calendar Events
- **Schema name:** code_calendarevent
- **Primary column:** code_title
- **Track changes:** Yes

### Add Columns

1. **Description**
   - Data type: Multiple lines of text
   - Max length: 4000

2. **Start Date Time**
   - Data type: Date and Time
   - Format: Date and Time
   - Required: Business required

3. **End Date Time**
   - Data type: Date and Time
   - Format: Date and Time
   - Required: Business required

4. **Location**
   - Data type: Single line of text
   - Max length: 200

5. **Attendees**
   - Data type: Multiple lines of text
   - Format: Text
   - Max length: 4000

6. **Outlook Event ID**
   - Data type: Single line of text
   - Max length: 100
   - Format: Text

7. **Status**
   - Data type: Choice
   - Choices: Scheduled, Completed, Cancelled
   - Default: Scheduled

8. **Created By**
   - Data type: Lookup
   - Related table: User Profile (code_userprofile)

9. **Meeting Type**
   - Data type: Choice
   - Choices: In-Person, Virtual, Hybrid

---

## Step 4: Create Tasks Table

### Basic Information
- **Display name:** Task
- **Plural name:** Tasks
- **Schema name:** code_task
- **Primary column:** code_title
- **Track changes:** Yes

### Add Columns

1. **Description**
   - Data type: Multiple lines of text

2. **Due Date**
   - Data type: Date and Time

3. **Priority**
   - Data type: Choice
   - Choices: Low, Medium, High, Critical
   - Default: Medium

4. **Status**
   - Data type: Choice
   - Choices: Not Started, In Progress, Completed, Blocked
   - Default: Not Started

5. **Assigned To**
   - Data type: Lookup
   - Related table: User Profile

6. **Category**
   - Data type: Choice
   - Choices: Administrative, Meeting Prep, Follow-up, Other

7. **SharePoint Item ID**
   - Data type: Single line of text
   - Max length: 50

---

## Step 5: Create Notification History Table

### Basic Information
- **Display name:** Notification History
- **Plural name:** Notification History
- **Schema name:** code_notificationhistory
- **Enable for activities:** No
- **Track changes:** Yes
- **Audit changes:** Yes

### Add Columns

1. **Recipient**
   - Data type: Lookup
   - Related table: User Profile
   - Required: Business required

2. **Notification Type**
   - Data type: Choice
   - Choices: Reminder, Deadline, Meeting Alert, System

3. **Title**
   - Data type: Single line of text
   - Required: Business required

4. **Message**
   - Data type: Multiple lines of text

5. **Sent Date Time**
   - Data type: Date and Time
   - Required: Business required

6. **Status**
   - Data type: Choice
   - Choices: Sent, Delivered, Failed

7. **Channel**
   - Data type: Choice
   - Choices: Teams, Email, Push Notification

8. **Related Entity Type**
   - Data type: Single line of text

9. **Related Entity ID**
   - Data type: Single line of text

---

## Step 6: Create Chat Logs Table

### Basic Information
- **Display name:** Chat Log
- **Plural name:** Chat Logs
- **Schema name:** code_chatlog
- **Track changes:** Yes
- **Audit changes:** Yes

### Add Columns

1. **User**
   - Data type: Lookup
   - Related table: User Profile
   - Required: Business required

2. **Session ID**
   - Data type: Single line of text

3. **User Message**
   - Data type: Multiple lines of text

4. **Bot Response**
   - Data type: Multiple lines of text

5. **Intent**
   - Data type: Single line of text

6. **Confidence**
   - Data type: Decimal number
   - Min value: 0
   - Max value: 1

7. **Timestamp**
   - Data type: Date and Time
   - Required: Business required

8. **Action Taken**
   - Data type: Single line of text

---

## Step 7: Create Alert Rules Table

### Basic Information
- **Display name:** Alert Rule
- **Plural name:** Alert Rules
- **Schema name:** code_alertrule
- **Primary column:** code_name

### Add Columns

1. **Rule Type**
   - Data type: Choice
   - Choices: Time-based, Event-based, Recurring

2. **Condition**
   - Data type: Multiple lines of text
   - Format: Text

3. **Owner**
   - Data type: Lookup
   - Related table: User Profile

4. **Is Active**
   - Data type: Yes/No
   - Default: Yes

5. **Notification Template**
   - Data type: Multiple lines of text

6. **Trigger Time**
   - Data type: Whole number
   - Min value: 0
   - Description: Minutes before event

---

## Step 8: Configure Security Roles

1. Navigate to **Settings** → **Security** → **Security Roles**
2. Create custom security roles:
   - **CODE App Admin**
   - **CODE App User**
   - **CODE App Guest**
3. Configure privileges for each table based on the schema overview

---

## Step 9: Enable Auditing

1. Navigate to **Settings** → **Auditing**
2. Enable auditing for:
   - Notification History
   - Chat Logs
   - User Profile (optional)

---

## Verification Checklist

- [ ] All 6 tables created with correct schema names
- [ ] All columns added with correct data types
- [ ] Lookup relationships configured
- [ ] Security roles created and assigned
- [ ] Auditing enabled on sensitive tables
- [ ] Test records created for validation
- [ ] Forms and views configured (optional at this stage)

---

## Common Issues & Solutions

### Issue: Cannot create lookup relationship
**Solution:** Ensure the related table exists first. Create tables in this order: User Profile → Others

### Issue: Schema name conflicts
**Solution:** Use prefix "code_" consistently to avoid conflicts with system tables

### Issue: Permission errors
**Solution:** Verify you have System Administrator or System Customizer role
