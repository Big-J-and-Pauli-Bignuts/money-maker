import React, { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../../types";
import { chatService } from "../../services";
import "./Chat.css";

/**
 * AI Chat Component for natural language interactions
 */
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = chatService.getHistory();
    if (history.length === 0) {
      // Add welcome message
      const welcomeMessage = chatService.addSystemMessage(
        `👋 Hello! I'm your AI assistant. I can help you with:

📅 **Calendar** - Schedule meetings, view your calendar
⏰ **Reminders** - Create and manage reminders
📁 **SharePoint** - Search for documents
💾 **Dataverse** - Query your data

Type your request in natural language, or type "help" for more options.`
      );
      return [welcomeMessage];
    }
    return history;
  });
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userInput = inputValue.trim();
    setInputValue("");
    setIsProcessing(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: userInput,
      role: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading_${Date.now()}`,
      content: "Thinking...",
      role: "assistant",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Process the message
      const response = await chatService.processUserMessage(userInput);

      // Replace loading message with actual response
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isLoading);
        // Don't add the user message again since chatService adds it
        const lastUserMessage = filtered[filtered.length - 1];
        if (lastUserMessage?.role === "user" && lastUserMessage?.content === userInput) {
          return [...filtered, response];
        }
        return [...filtered, response];
      });
    } catch (error) {
      console.error("Error processing message:", error);
      // Replace loading message with error message
      setMessages((prev) =>
        prev.map((m) =>
          m.isLoading
            ? {
                ...m,
                content: "Sorry, I encountered an error. Please try again.",
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clearing chat
  const handleClearChat = () => {
    chatService.clearHistory();
    const welcomeMessage = chatService.addSystemMessage(
      `👋 Hello! I'm your AI assistant. I can help you with:

📅 **Calendar** - Schedule meetings, view your calendar
⏰ **Reminders** - Create and manage reminders
📁 **SharePoint** - Search for documents
💾 **Dataverse** - Query your data

Type your request in natural language, or type "help" for more options.`
    );
    setMessages([welcomeMessage]);
  };

  // Quick actions
  const quickActions = [
    { label: "📅 Show my calendar", action: "Show my calendar for today" },
    { label: "⏰ Create reminder", action: "Remind me to check emails at 3pm" },
    { label: "📁 Search SharePoint", action: "Search SharePoint for project documents" },
    { label: "❓ Help", action: "Help" },
  ];

  // Handle quick action
  const handleQuickAction = (action: string) => {
    setInputValue(action);
    // Focus input and trigger send
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Format message content with markdown-like formatting
  const formatContent = (content: string): React.ReactNode => {
    const lines = content.split("\n");
    return lines.map((line, index) => {
      // Bold text
      let formattedLine: React.ReactNode = line;

      // Process bold markers
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      if (parts.length > 1) {
        formattedLine = parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      }

      return (
        <React.Fragment key={index}>
          {formattedLine}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="chat-title">
          <h1>💬 AI Assistant</h1>
          <span className="status-badge">Online</span>
        </div>
        <button className="clear-btn" onClick={handleClearChat} title="Clear chat">
          🗑️ Clear
        </button>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role} ${message.isLoading ? "loading" : ""}`}
            >
              <div className="message-avatar">
                {message.role === "user" ? "👤" : message.role === "system" ? "🤖" : "🤖"}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.isLoading ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    formatContent(message.content)
                  )}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.map((qa, index) => (
            <button
              key={index}
              className="quick-action-btn"
              onClick={() => handleQuickAction(qa.action)}
            >
              {qa.label}
            </button>
          ))}
        </div>

        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message... (e.g., 'Schedule a meeting tomorrow at 2pm')"
            disabled={isProcessing}
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
          >
            {isProcessing ? "..." : "→"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
