import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import type { CalendarEvent } from "../../types";
import "./Calendar.css";

/**
 * Calendar Component for viewing and managing calendar events
 */
const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    isAllDay: false,
    location: "",
  });

  // Sample events for demonstration
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Team Standup",
      description: "Daily team sync meeting",
      start: new Date(new Date().setHours(9, 0, 0, 0)),
      end: new Date(new Date().setHours(9, 30, 0, 0)),
      location: "Teams",
      color: "#00d4ff",
    },
    {
      id: "2",
      title: "Project Review",
      description: "Weekly project status review",
      start: new Date(new Date().setHours(14, 0, 0, 0)),
      end: new Date(new Date().setHours(15, 0, 0, 0)),
      location: "Conference Room A",
      color: "#7c3aed",
    },
  ]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Get events for a specific day
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event) => isSameDay(event.start, date));
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  // Handle navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Handle event creation
  const handleCreateEvent = () => {
    if (!selectedDate || !newEvent.title) return;

    const startDateTime = new Date(selectedDate);
    const [startHours, startMinutes] = newEvent.startTime.split(":").map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(selectedDate);
    const [endHours, endMinutes] = newEvent.endTime.split(":").map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      start: startDateTime,
      end: endDateTime,
      location: newEvent.location,
      isAllDay: newEvent.isAllDay,
      color: "#00d4ff",
    };

    setEvents([...events, event]);
    setShowEventModal(false);
    setNewEvent({
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      isAllDay: false,
      location: "",
    });
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>📅 Calendar</h1>
        <div className="calendar-controls">
          <button className="nav-btn" onClick={goToPreviousMonth}>
            ←
          </button>
          <button className="today-btn" onClick={goToToday}>
            Today
          </button>
          <button className="nav-btn" onClick={goToNextMonth}>
            →
          </button>
          <span className="current-month">
            {format(currentDate, "MMMM yyyy")}
          </span>
        </div>
      </div>

      <div className="calendar-content">
        <div className="calendar-grid-container">
          <div className="weekday-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={index}
                  className={`calendar-day ${!isCurrentMonth ? "other-month" : ""} ${
                    isSelected ? "selected" : ""
                  } ${isTodayDate ? "today" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <span className="day-number">{format(day, "d")}</span>
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="event-dot"
                        style={{ backgroundColor: event.color || "#00d4ff" }}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="more-events">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="events-panel">
          <div className="events-panel-header">
            <h2>
              {selectedDate
                ? format(selectedDate, "EEEE, MMMM d, yyyy")
                : "Select a date"}
            </h2>
            {selectedDate && (
              <button
                className="add-event-btn"
                onClick={() => setShowEventModal(true)}
              >
                + Add Event
              </button>
            )}
          </div>

          <div className="events-list">
            {selectedDateEvents.length === 0 ? (
              <div className="no-events">
                <p>No events scheduled for this day.</p>
                {selectedDate && (
                  <button
                    className="create-event-btn"
                    onClick={() => setShowEventModal(true)}
                  >
                    Create an event
                  </button>
                )}
              </div>
            ) : (
              selectedDateEvents.map((event) => (
                <div
                  key={event.id}
                  className="event-card"
                  style={{ borderLeftColor: event.color || "#00d4ff" }}
                >
                  <div className="event-time">
                    {event.isAllDay
                      ? "All day"
                      : `${format(event.start, "h:mm a")} - ${format(
                          event.end,
                          "h:mm a"
                        )}`}
                  </div>
                  <div className="event-title">{event.title}</div>
                  {event.description && (
                    <div className="event-description">{event.description}</div>
                  )}
                  {event.location && (
                    <div className="event-location">📍 {event.location}</div>
                  )}
                  <button
                    className="delete-event-btn"
                    onClick={() => handleDeleteEvent(event.id)}
                    title="Delete event"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Event</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Event title"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                placeholder="Event description"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="Event location"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, startTime: e.target.value })
                  }
                  disabled={newEvent.isAllDay}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, endTime: e.target.value })
                  }
                  disabled={newEvent.isAllDay}
                />
              </div>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={newEvent.isAllDay}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, isAllDay: e.target.checked })
                  }
                />
                All day event
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={handleCreateEvent}
                disabled={!newEvent.title}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
