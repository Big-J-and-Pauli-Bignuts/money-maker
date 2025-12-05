import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import type { Reminder } from "../../types";
import { reminderService } from "../../services";
import "./Reminders.css";

/**
 * Reminders Component for managing reminders and alerts
 */
const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() =>
    reminderService.getReminders()
  );
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">(
    "pending"
  );
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
    dueTime: "09:00",
    priority: "medium" as Reminder["priority"],
    tags: "",
    notifyBefore: 15,
  });

  // Filtered reminders based on current filter
  const filteredReminders = useMemo(() => {
    const now = new Date();
    switch (filter) {
      case "pending":
        return reminders.filter((r) => !r.isCompleted);
      case "completed":
        return reminders.filter((r) => r.isCompleted);
      case "overdue":
        return reminders.filter((r) => !r.isCompleted && r.dueDate < now);
      default:
        return reminders;
    }
  }, [reminders, filter]);

  // Group reminders by date
  const groupedReminders = useMemo(() => {
    const groups: Record<string, Reminder[]> = {};
    filteredReminders.forEach((reminder) => {
      const dateKey = format(reminder.dueDate, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(reminder);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredReminders]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: reminders.length,
      pending: reminders.filter((r) => !r.isCompleted).length,
      completed: reminders.filter((r) => r.isCompleted).length,
      overdue: reminders.filter((r) => !r.isCompleted && r.dueDate < now).length,
    };
  }, [reminders]);

  // Handle creating a new reminder
  const handleCreateReminder = () => {
    if (!newReminder.title) return;

    const dueDateTime = new Date(`${newReminder.dueDate}T${newReminder.dueTime}`);

    const reminder = reminderService.createReminder({
      title: newReminder.title,
      description: newReminder.description,
      dueDate: dueDateTime,
      priority: newReminder.priority,
      tags: newReminder.tags.split(",").map((t) => t.trim()).filter(Boolean),
      notifyBefore: newReminder.notifyBefore,
    });

    setReminders(reminderService.getReminders());
    setShowModal(false);
    setNewReminder({
      title: "",
      description: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
      dueTime: "09:00",
      priority: "medium",
      tags: "",
      notifyBefore: 15,
    });

    // Show notification permission request if needed
    if ("Notification" in window && Notification.permission === "default") {
      reminderService.requestNotificationPermission();
    }

    return reminder;
  };

  // Handle toggling reminder completion
  const handleToggleComplete = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      if (reminder.isCompleted) {
        reminderService.updateReminder(id, { isCompleted: false });
      } else {
        reminderService.completeReminder(id);
      }
      setReminders(reminderService.getReminders());
    }
  };

  // Handle deleting a reminder
  const handleDeleteReminder = (id: string) => {
    reminderService.deleteReminder(id);
    setReminders(reminderService.getReminders());
  };

  // Get priority color
  const getPriorityColor = (priority: Reminder["priority"]): string => {
    switch (priority) {
      case "urgent":
        return "#ef4444";
      case "high":
        return "#f97316";
      case "medium":
        return "#00d4ff";
      case "low":
        return "#22c55e";
      default:
        return "#666";
    }
  };

  // Format relative date
  const formatRelativeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "EEEE, MMMM d, yyyy");
    }
  };

  return (
    <div className="reminders-page">
      <div className="reminders-header">
        <h1>⏰ Reminders & Tasks</h1>
        <button className="add-reminder-btn" onClick={() => setShowModal(true)}>
          + New Reminder
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card completed">
          <span className="stat-value">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card overdue">
          <span className="stat-value">{stats.overdue}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {(["pending", "all", "completed", "overdue"] as const).map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="reminders-content">
        {filteredReminders.length === 0 ? (
          <div className="no-reminders">
            <p>No {filter !== "all" ? filter : ""} reminders found.</p>
            <button
              className="create-reminder-btn"
              onClick={() => setShowModal(true)}
            >
              Create a reminder
            </button>
          </div>
        ) : (
          groupedReminders.map(([dateKey, dayReminders]) => (
            <div key={dateKey} className="reminder-group">
              <h3 className="group-date">{formatRelativeDate(dateKey)}</h3>
              <div className="reminder-list">
                {dayReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`reminder-card ${
                      reminder.isCompleted ? "completed" : ""
                    }`}
                  >
                    <div
                      className="reminder-checkbox"
                      onClick={() => handleToggleComplete(reminder.id)}
                    >
                      {reminder.isCompleted ? "✓" : ""}
                    </div>
                    <div className="reminder-content">
                      <div className="reminder-title">{reminder.title}</div>
                      {reminder.description && (
                        <div className="reminder-description">
                          {reminder.description}
                        </div>
                      )}
                      <div className="reminder-meta">
                        <span className="reminder-time">
                          🕐 {format(reminder.dueDate, "h:mm a")}
                        </span>
                        <span
                          className="reminder-priority"
                          style={{
                            backgroundColor: getPriorityColor(reminder.priority),
                          }}
                        >
                          {reminder.priority}
                        </span>
                        {reminder.tags && reminder.tags.length > 0 && (
                          <div className="reminder-tags">
                            {reminder.tags.map((tag, idx) => (
                              <span key={idx} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      title="Delete reminder"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Reminder Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Reminder</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newReminder.title}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, title: e.target.value })
                }
                placeholder="What do you need to remember?"
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                value={newReminder.description}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, description: e.target.value })
                }
                placeholder="Add more details..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newReminder.dueDate}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Due Time</label>
                <input
                  type="time"
                  value={newReminder.dueTime}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, dueTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={newReminder.priority}
                onChange={(e) =>
                  setNewReminder({
                    ...newReminder,
                    priority: e.target.value as Reminder["priority"],
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                value={newReminder.tags}
                onChange={(e) =>
                  setNewReminder({ ...newReminder, tags: e.target.value })
                }
                placeholder="work, personal, important..."
              />
            </div>
            <div className="form-group">
              <label>Notify before (minutes)</label>
              <select
                value={newReminder.notifyBefore}
                onChange={(e) =>
                  setNewReminder({
                    ...newReminder,
                    notifyBefore: parseInt(e.target.value),
                  })
                }
              >
                <option value="0">At due time</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">1 day</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleCreateReminder}
                disabled={!newReminder.title}
              >
                Create Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
