import type { Reminder, Alert } from "../types";

/**
 * Reminder Service for managing reminders and alerts
 */
export class ReminderService {
  private reminders: Reminder[] = [];
  private alerts: Alert[] = [];
  private storageKey = "powerApps_reminders";
  private alertsStorageKey = "powerApps_alerts";

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load reminders from local storage
   */
  private loadFromStorage(): void {
    try {
      const storedReminders = localStorage.getItem(this.storageKey);
      if (storedReminders) {
        const parsed = JSON.parse(storedReminders);
        this.reminders = parsed.map((r: Reminder) => ({
          ...r,
          dueDate: new Date(r.dueDate),
        }));
      }

      const storedAlerts = localStorage.getItem(this.alertsStorageKey);
      if (storedAlerts) {
        const parsed = JSON.parse(storedAlerts);
        this.alerts = parsed.map((a: Alert) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }));
      }
    } catch (error) {
      console.error("Error loading from storage:", error);
    }
  }

  /**
   * Save reminders to local storage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reminders));
      localStorage.setItem(this.alertsStorageKey, JSON.stringify(this.alerts));
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  }

  /**
   * Get all reminders
   */
  getReminders(): Reminder[] {
    return [...this.reminders].sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
    );
  }

  /**
   * Get pending reminders (not completed)
   */
  getPendingReminders(): Reminder[] {
    return this.getReminders().filter((r) => !r.isCompleted);
  }

  /**
   * Get completed reminders
   */
  getCompletedReminders(): Reminder[] {
    return this.getReminders().filter((r) => r.isCompleted);
  }

  /**
   * Get reminders due today
   */
  getTodaysReminders(): Reminder[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getPendingReminders().filter(
      (r) => r.dueDate >= today && r.dueDate < tomorrow
    );
  }

  /**
   * Get overdue reminders
   */
  getOverdueReminders(): Reminder[] {
    const now = new Date();
    return this.getPendingReminders().filter((r) => r.dueDate < now);
  }

  /**
   * Get a reminder by ID
   */
  getReminderById(id: string): Reminder | undefined {
    return this.reminders.find((r) => r.id === id);
  }

  /**
   * Create a new reminder
   */
  createReminder(
    reminder: Omit<Reminder, "id" | "isCompleted">
  ): Reminder {
    const newReminder: Reminder = {
      ...reminder,
      id: this.generateId(),
      isCompleted: false,
    };
    this.reminders.push(newReminder);
    this.saveToStorage();
    this.scheduleNotification(newReminder);
    return newReminder;
  }

  /**
   * Update a reminder
   */
  updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
    const index = this.reminders.findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.reminders[index] = { ...this.reminders[index], ...updates };
    this.saveToStorage();
    return this.reminders[index];
  }

  /**
   * Mark a reminder as complete
   */
  completeReminder(id: string): Reminder | null {
    return this.updateReminder(id, { isCompleted: true });
  }

  /**
   * Delete a reminder
   */
  deleteReminder(id: string): boolean {
    const index = this.reminders.findIndex((r) => r.id === id);
    if (index === -1) return false;

    this.reminders.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  /**
   * Schedule a browser notification for a reminder
   */
  private scheduleNotification(reminder: Reminder): void {
    if (!("Notification" in window)) return;

    const notifyTime = reminder.notifyBefore
      ? new Date(reminder.dueDate.getTime() - reminder.notifyBefore * 60 * 1000)
      : reminder.dueDate;

    const delay = notifyTime.getTime() - Date.now();

    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(reminder.title, {
            body: reminder.description || `Due: ${reminder.dueDate.toLocaleString()}`,
            icon: "/vite.svg",
            tag: reminder.id,
          });
        }
      }, delay);
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      return "denied";
    }
    return Notification.requestPermission();
  }

  // Alert methods

  /**
   * Get all alerts
   */
  getAlerts(): Alert[] {
    return [...this.alerts].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get unread alerts
   */
  getUnreadAlerts(): Alert[] {
    return this.getAlerts().filter((a) => !a.isRead);
  }

  /**
   * Get unread alert count
   */
  getUnreadAlertCount(): number {
    return this.getUnreadAlerts().length;
  }

  /**
   * Create a new alert
   */
  createAlert(
    alert: Omit<Alert, "id" | "timestamp" | "isRead">
  ): Alert {
    const newAlert: Alert = {
      ...alert,
      id: this.generateId(),
      timestamp: new Date(),
      isRead: false,
    };
    this.alerts.push(newAlert);
    this.saveToStorage();
    return newAlert;
  }

  /**
   * Mark an alert as read
   */
  markAlertAsRead(id: string): Alert | null {
    const index = this.alerts.findIndex((a) => a.id === id);
    if (index === -1) return null;

    this.alerts[index] = { ...this.alerts[index], isRead: true };
    this.saveToStorage();
    return this.alerts[index];
  }

  /**
   * Mark all alerts as read
   */
  markAllAlertsAsRead(): void {
    this.alerts = this.alerts.map((a) => ({ ...a, isRead: true }));
    this.saveToStorage();
  }

  /**
   * Delete an alert
   */
  deleteAlert(id: string): boolean {
    const index = this.alerts.findIndex((a) => a.id === id);
    if (index === -1) return false;

    this.alerts.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    this.saveToStorage();
  }
}

export const reminderService = new ReminderService();
