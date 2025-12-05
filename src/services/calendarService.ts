import type { CalendarEvent } from "../types";

/**
 * Calendar Service for managing calendar events
 * Integrates with Microsoft Graph API for Outlook calendar operations
 */
export class CalendarService {
  private graphBaseUrl: string = "https://graph.microsoft.com/v1.0";
  private accessToken: string | null = null;

  /**
   * Set the access token for API calls
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    if (!this.accessToken) {
      throw new Error("Access token not set. Please authenticate first.");
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Get calendar events for a date range
   */
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();

    const url = `${this.graphBaseUrl}/me/calendar/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$orderby=start/dateTime`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get calendar events: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToCalendarEvents(data.value || []);
  }

  /**
   * Get a single calendar event by ID
   */
  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    const response = await fetch(`${this.graphBaseUrl}/me/events/${eventId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get event: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToCalendarEvent(data);
  }

  /**
   * Create a new calendar event
   */
  async createEvent(event: Omit<CalendarEvent, "id">): Promise<CalendarEvent> {
    const graphEvent = this.mapToGraphEvent(event);

    const response = await fetch(`${this.graphBaseUrl}/me/events`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(graphEvent),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToCalendarEvent(data);
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const graphEvent = this.mapToGraphEvent(event as Omit<CalendarEvent, "id">);

    const response = await fetch(`${this.graphBaseUrl}/me/events/${eventId}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(graphEvent),
    });

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapToCalendarEvent(data);
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(`${this.graphBaseUrl}/me/events/${eventId}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`);
    }
  }

  /**
   * Get today's events
   */
  async getTodaysEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    return this.getEvents(startOfDay, endOfDay);
  }

  /**
   * Get events for the current week
   */
  async getWeekEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.getEvents(startOfWeek, endOfWeek);
  }

  /**
   * Map Graph API event to CalendarEvent
   */
  private mapToCalendarEvent(graphEvent: Record<string, unknown>): CalendarEvent {
    const start = graphEvent.start as Record<string, string>;
    const end = graphEvent.end as Record<string, string>;
    const location = graphEvent.location as Record<string, string> | undefined;
    const attendees = graphEvent.attendees as Record<string, unknown>[] | undefined;
    const recurrence = graphEvent.recurrence as Record<string, unknown> | undefined;

    return {
      id: String(graphEvent.id || ""),
      title: String(graphEvent.subject || ""),
      description: String(graphEvent.bodyPreview || ""),
      start: new Date(start?.dateTime || new Date()),
      end: new Date(end?.dateTime || new Date()),
      isAllDay: Boolean(graphEvent.isAllDay),
      location: location?.displayName,
      attendees: attendees?.map((a) => String((a.emailAddress as Record<string, string>)?.address)),
      isRecurring: Boolean(recurrence),
      recurrencePattern: recurrence ? JSON.stringify(recurrence) : undefined,
    };
  }

  /**
   * Map multiple Graph API events to CalendarEvent array
   */
  private mapToCalendarEvents(graphEvents: Record<string, unknown>[]): CalendarEvent[] {
    return graphEvents.map((event) => this.mapToCalendarEvent(event));
  }

  /**
   * Map CalendarEvent to Graph API event format
   */
  private mapToGraphEvent(event: Omit<CalendarEvent, "id">): Record<string, unknown> {
    const graphEvent: Record<string, unknown> = {
      subject: event.title,
      body: {
        contentType: "HTML",
        content: event.description || "",
      },
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      isAllDay: event.isAllDay || false,
    };

    if (event.location) {
      graphEvent.location = {
        displayName: event.location,
      };
    }

    if (event.attendees && event.attendees.length > 0) {
      graphEvent.attendees = event.attendees.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: "required",
      }));
    }

    return graphEvent;
  }
}

export const calendarService = new CalendarService();
