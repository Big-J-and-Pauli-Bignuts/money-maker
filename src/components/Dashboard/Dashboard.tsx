import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { reminderService } from "../../services";
import type { Reminder, Alert } from "../../types";
import "./Dashboard.css";

/**
 * Dashboard Component - Main landing page with overview of all features
 */
const Dashboard: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  
  // Initialize state with values from the service directly
  const [reminders, setReminders] = useState<Reminder[]>(() => 
    reminderService.getTodaysReminders()
  );
  const [alerts, setAlerts] = useState<Alert[]>(() => 
    reminderService.getUnreadAlerts()
  );

  // Function to refresh data when needed
  const refreshData = useCallback(() => {
    setReminders(reminderService.getTodaysReminders());
    setAlerts(reminderService.getUnreadAlerts());
  }, []);

  // Set up a refresh interval to keep data up to date
  useEffect(() => {
    const interval = setInterval(refreshData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [refreshData]);

  // Get current time greeting
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get user's first name
  const getUserName = (): string => {
    if (isAuthenticated && accounts[0]?.name) {
      return accounts[0].name.split(" ")[0];
    }
    return "there";
  };

  // Quick actions for the dashboard
  const quickActions = [
    { icon: "📅", label: "View Calendar", path: "/calendar", color: "#00d4ff" },
    { icon: "⏰", label: "Reminders", path: "/reminders", color: "#7c3aed" },
    { icon: "💬", label: "AI Chat", path: "/chat", color: "#22c55e" },
    { icon: "📁", label: "SharePoint", path: "/sharepoint", color: "#f97316" },
    { icon: "💾", label: "Dataverse", path: "/dataverse", color: "#ec4899" },
  ];

  // Sample upcoming events
  const upcomingEvents = [
    {
      id: "1",
      title: "Team Standup",
      time: "9:00 AM",
      location: "Teams",
      color: "#00d4ff",
    },
    {
      id: "2",
      title: "Project Review",
      time: "2:00 PM",
      location: "Conference Room A",
      color: "#7c3aed",
    },
    {
      id: "3",
      title: "Client Call",
      time: "4:30 PM",
      location: "Zoom",
      color: "#22c55e",
    },
  ];

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>
            {getGreeting()}, {getUserName()}! 👋
          </h1>
          <p className="date">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        {!isAuthenticated && (
          <div className="auth-notice">
            <span>Sign in to access all features</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="quick-action-card"
              style={{ borderColor: action.color }}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Today's Events */}
        <div className="dashboard-card events-card">
          <div className="card-header">
            <h3>📅 Today's Schedule</h3>
            <Link to="/calendar" className="view-all">
              View all →
            </Link>
          </div>
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="event-item"
                style={{ borderLeftColor: event.color }}
              >
                <div className="event-time">{event.time}</div>
                <div className="event-details">
                  <div className="event-title">{event.title}</div>
                  <div className="event-location">📍 {event.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Reminders */}
        <div className="dashboard-card reminders-card">
          <div className="card-header">
            <h3>⏰ Today's Reminders</h3>
            <Link to="/reminders" className="view-all">
              View all →
            </Link>
          </div>
          <div className="reminders-list">
            {reminders.length === 0 ? (
              <div className="empty-state">
                <p>No reminders for today</p>
                <Link to="/reminders" className="add-link">
                  + Add reminder
                </Link>
              </div>
            ) : (
              reminders.slice(0, 4).map((reminder) => (
                <div key={reminder.id} className="reminder-item">
                  <div
                    className={`reminder-checkbox ${
                      reminder.isCompleted ? "completed" : ""
                    }`}
                  >
                    {reminder.isCompleted && "✓"}
                  </div>
                  <div className="reminder-content">
                    <div className="reminder-title">{reminder.title}</div>
                    <div className="reminder-time">
                      {format(reminder.dueDate, "h:mm a")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3>🔔 Alerts</h3>
            {alerts.length > 0 && (
              <span className="alert-badge">{alerts.length}</span>
            )}
          </div>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="empty-state">
                <p>No new alerts</p>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">
                    {alert.type === "info"
                      ? "ℹ️"
                      : alert.type === "warning"
                      ? "⚠️"
                      : alert.type === "error"
                      ? "❌"
                      : "✅"}
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Assistant */}
        <div className="dashboard-card ai-card">
          <div className="card-header">
            <h3>💬 AI Assistant</h3>
          </div>
          <div className="ai-content">
            <p>Need help with something? Ask the AI assistant!</p>
            <div className="ai-suggestions">
              <Link to="/chat" className="suggestion">
                "Schedule a meeting for tomorrow"
              </Link>
              <Link to="/chat" className="suggestion">
                "Show my calendar"
              </Link>
              <Link to="/chat" className="suggestion">
                "Create a reminder"
              </Link>
            </div>
            <Link to="/chat" className="start-chat-btn">
              Start Chatting →
            </Link>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="features-section">
        <h2>Power Apps Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h4>Calendar Management</h4>
            <p>
              View, create, and manage your calendar events. Sync with Microsoft
              Outlook for seamless integration.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏰</div>
            <h4>Smart Reminders</h4>
            <p>
              Set reminders with natural language. Get notified at the right time
              with browser notifications.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h4>NLP Processing</h4>
            <p>
              Use natural language to interact with the system. Schedule meetings,
              create reminders, and more.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h4>AI Chat Interface</h4>
            <p>
              Chat with an AI assistant to accomplish tasks quickly. Get help with
              any operation using conversational UI.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h4>Dataverse Access</h4>
            <p>
              Query and manage your Dataverse data directly. View contacts,
              accounts, leads, and more.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📁</div>
            <h4>SharePoint Integration</h4>
            <p>
              Browse and search your SharePoint content. Access files based on
              your permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
