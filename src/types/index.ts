/**
 * Type definitions for the Power Apps application
 */

/**
 * Calendar Event interface
 */
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  location?: string;
  attendees?: string[];
  isRecurring?: boolean;
  recurrencePattern?: string;
  color?: string;
}

/**
 * Reminder interface
 */
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: "low" | "medium" | "high" | "urgent";
  isCompleted: boolean;
  linkedEventId?: string;
  notifyBefore?: number; // minutes before due date
  tags?: string[];
}

/**
 * Alert interface
 */
export interface Alert {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  source?: string;
}

/**
 * Chat Message interface
 */
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  isLoading?: boolean;
}

/**
 * NLP Intent interface
 */
export interface NLPIntent {
  intent: string;
  confidence: number;
  entities: NLPEntity[];
  originalText: string;
}

/**
 * NLP Entity interface
 */
export interface NLPEntity {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Dataverse Record interface
 */
export interface DataverseRecord {
  id: string;
  entityType: string;
  attributes: Record<string, unknown>;
  createdOn: Date;
  modifiedOn: Date;
}

/**
 * SharePoint Item interface
 */
export interface SharePointItem {
  id: string;
  name: string;
  webUrl: string;
  itemType: "file" | "folder" | "list";
  createdDateTime: Date;
  lastModifiedDateTime: Date;
  size?: number;
  mimeType?: string;
}

/**
 * User interface
 */
export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}
