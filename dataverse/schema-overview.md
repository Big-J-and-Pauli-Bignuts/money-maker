# Dataverse Schema Overview

This document defines the Dataverse tables required for the Power Apps CODE App.

## Table Structure

### 1. User Profiles (code_userprofile)
Stores user-specific settings and preferences.

**Columns:**
- `code_userprofileid` (Primary Key, GUID)
- `code_name` (Single Line of Text, Required)
- `code_email` (Single Line of Text, Email format)
- `code_preferredlanguage` (Choice: English, Spanish, French)
- `code_timezone` (Single Line of Text)
- `code_notificationpreferences` (Multiple Lines of Text, JSON)
- `code_azureaduserid` (Single Line of Text)
- `createdon` (Date and Time)
- `modifiedon` (Date and Time)

**Relationships:**
- One-to-Many with Calendar Events
- One-to-Many with Tasks
- One-to-Many with Notification History
- One-to-Many with Chat Logs

---

### 2. Calendar Events (code_calendarevent)
Stores meeting and calendar event metadata.

**Columns:**
- `code_calendareventid` (Primary Key, GUID)
- `code_title` (Single Line of Text, Required)
- `code_description` (Multiple Lines of Text)
- `code_startdatetime` (Date and Time, Required)
- `code_enddatetime` (Date and Time, Required)
- `code_location` (Single Line of Text)
- `code_attendees` (Multiple Lines of Text, JSON array)
- `code_outlookeventid` (Single Line of Text, Unique)
- `code_status` (Choice: Scheduled, Completed, Cancelled)
- `code_createdby` (Lookup to User Profile)
- `code_meetingtype` (Choice: In-Person, Virtual, Hybrid)
- `createdon` (Date and Time)
- `modifiedon` (Date and Time)

**Relationships:**
- Many-to-One with User Profiles

---

### 3. Tasks (code_task)
Tracks administrative tasks and to-dos.

**Columns:**
- `code_taskid` (Primary Key, GUID)
- `code_title` (Single Line of Text, Required)
- `code_description` (Multiple Lines of Text)
- `code_duedate` (Date and Time)
- `code_priority` (Choice: Low, Medium, High, Critical)
- `code_status` (Choice: Not Started, In Progress, Completed, Blocked)
- `code_assignedto` (Lookup to User Profile)
- `code_category` (Choice: Administrative, Meeting Prep, Follow-up, Other)
- `code_sharepointitemid` (Single Line of Text)
- `createdon` (Date and Time)
- `modifiedon` (Date and Time)

**Relationships:**
- Many-to-One with User Profiles

---

### 4. Notification History (code_notificationhistory)
Audit trail for all notifications sent.

**Columns:**
- `code_notificationhistoryid` (Primary Key, GUID)
- `code_recipient` (Lookup to User Profile, Required)
- `code_notificationtype` (Choice: Reminder, Deadline, Meeting Alert, System)
- `code_title` (Single Line of Text, Required)
- `code_message` (Multiple Lines of Text)
- `code_sentdatetime` (Date and Time, Required)
- `code_status` (Choice: Sent, Delivered, Failed)
- `code_channel` (Choice: Teams, Email, Push Notification)
- `code_relatedentitytype` (Single Line of Text)
- `code_relatedentityid` (Single Line of Text)
- `createdon` (Date and Time)

**Relationships:**
- Many-to-One with User Profiles

---

### 5. Chat Logs (code_chatlog)
Stores conversation history with AI assistant.

**Columns:**
- `code_chatlogid` (Primary Key, GUID)
- `code_user` (Lookup to User Profile, Required)
- `code_sessionid` (Single Line of Text)
- `code_usermessage` (Multiple Lines of Text)
- `code_botresponse` (Multiple Lines of Text)
- `code_intent` (Single Line of Text)
- `code_confidence` (Decimal Number)
- `code_timestamp` (Date and Time, Required)
- `code_actiontaken` (Single Line of Text)
- `createdon` (Date and Time)

**Relationships:**
- Many-to-One with User Profiles

---

### 6. Alert Rules (code_alertrule)
Configurable rules for smart reminders.

**Columns:**
- `code_alertruleid` (Primary Key, GUID)
- `code_name` (Single Line of Text, Required)
- `code_ruletype` (Choice: Time-based, Event-based, Recurring)
- `code_condition` (Multiple Lines of Text, JSON)
- `code_owner` (Lookup to User Profile)
- `code_isactive` (Two Options: Yes/No)
- `code_notificationtemplate` (Multiple Lines of Text)
- `code_triggertime` (Whole Number, minutes before event)
- `createdon` (Date and Time)
- `modifiedon` (Date and Time)

**Relationships:**
- Many-to-One with User Profiles

---

## Security Roles

### Admin Role
- Full CRUD access to all tables
- Can manage security settings
- Can configure system-wide alert rules

### Standard User Role
- Create, Read, Update own records
- Read shared records
- Cannot delete Chat Logs (audit compliance)

### Guest Role
- Read-only access to public resources
- Cannot access sensitive user data

---

## Relationships Summary

```
User Profile (1) → (Many) Calendar Events
User Profile (1) → (Many) Tasks
User Profile (1) → (Many) Notification History
User Profile (1) → (Many) Chat Logs
User Profile (1) → (Many) Alert Rules
```

---

## Next Steps

1. Create tables in Dataverse using Power Apps maker portal
2. Configure security roles and business rules
3. Set up views and forms for each table
4. Enable auditing on sensitive tables (Chat Logs, Notification History)
