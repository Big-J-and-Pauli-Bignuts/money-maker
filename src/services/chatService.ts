import type { ChatMessage } from "../types";
import { nlpService } from "./nlpService";

/**
 * Chat Service for AI-powered conversations
 * Integrates with NLP service to understand and respond to user queries
 */
export class ChatService {
  private conversationHistory: ChatMessage[] = [];

  /**
   * Generate a unique ID for messages
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear the conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Add a system message to the conversation
   */
  addSystemMessage(content: string): ChatMessage {
    const message: ChatMessage = {
      id: this.generateId(),
      content,
      role: "system",
      timestamp: new Date(),
    };
    this.conversationHistory.push(message);
    return message;
  }

  /**
   * Process user input and generate a response
   */
  async processUserMessage(input: string): Promise<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    this.conversationHistory.push(userMessage);

    // Process the input with NLP service
    const nlpResult = nlpService.processInput(input);

    // Generate response based on intent
    const response = await this.generateResponse(nlpResult);

    // Add assistant message to history
    const assistantMessage: ChatMessage = {
      id: this.generateId(),
      content: response,
      role: "assistant",
      timestamp: new Date(),
    };
    this.conversationHistory.push(assistantMessage);

    return assistantMessage;
  }

  /**
   * Generate a response based on the NLP result
   */
  private async generateResponse(nlpResult: ReturnType<typeof nlpService.processInput>): Promise<string> {
    const { intent, confidence, entities, originalText } = nlpResult;

    // Low confidence - ask for clarification
    if (confidence < 0.5 && intent !== "unknown") {
      return `I think you might be asking about ${intent.replace(/_/g, " ")}, but I'm not entirely sure. Could you please rephrase your request?`;
    }

    switch (intent) {
      case "create_event":
        return this.handleCreateEvent(entities);

      case "view_calendar":
        return this.handleViewCalendar(entities);

      case "create_reminder":
        return this.handleCreateReminder(entities, originalText);

      case "view_reminders":
        return this.handleViewReminders();

      case "search_sharepoint":
        return this.handleSearchSharePoint(entities, originalText);

      case "query_dataverse":
        return this.handleQueryDataverse(entities, originalText);

      case "help":
        return nlpService.getHelpText();

      default:
        return this.handleUnknownIntent(originalText);
    }
  }

  /**
   * Handle create event intent
   */
  private handleCreateEvent(entities: ReturnType<typeof nlpService.processInput>["entities"]): string {
    const dateEntity = entities.find((e) => e.type === "date");
    const timeEntity = entities.find((e) => e.type === "time");
    const personEntity = entities.find((e) => e.type === "person");
    const locationEntity = entities.find((e) => e.type === "location");

    let response = "📅 I'll help you create an event.\n\n";

    if (dateEntity) {
      response += `**Date:** ${dateEntity.value}\n`;
    } else {
      response += "**Date:** Please specify a date\n";
    }

    if (timeEntity) {
      response += `**Time:** ${timeEntity.value}\n`;
    } else {
      response += "**Time:** Please specify a time\n";
    }

    if (personEntity) {
      response += `**With:** ${personEntity.value}\n`;
    }

    if (locationEntity) {
      response += `**Location:** ${locationEntity.value}\n`;
    }

    response += "\n*To confirm this event, please use the Calendar page to finalize the details.*";

    return response;
  }

  /**
   * Handle view calendar intent
   */
  private handleViewCalendar(entities: ReturnType<typeof nlpService.processInput>["entities"]): string {
    const dateEntity = entities.find((e) => e.type === "date");

    let response = "📅 **Your Calendar**\n\n";

    if (dateEntity) {
      response += `Showing events for: ${dateEntity.value}\n\n`;
    } else {
      response += "Showing today's events:\n\n";
    }

    response += "*Navigate to the Calendar page to view and manage your events.*";

    return response;
  }

  /**
   * Handle create reminder intent
   */
  private handleCreateReminder(entities: ReturnType<typeof nlpService.processInput>["entities"], originalText: string): string {
    const dateEntity = entities.find((e) => e.type === "date");
    const timeEntity = entities.find((e) => e.type === "time");
    const priorityEntity = entities.find((e) => e.type === "priority");

    // Extract the task from the original text
    const taskMatch = originalText.match(/remind\s+me\s+(?:to|about)\s+(.+?)(?:\s+(?:on|at|by)|$)/i);
    const task = taskMatch ? taskMatch[1] : "your task";

    let response = "⏰ I'll create a reminder for you.\n\n";
    response += `**Task:** ${task}\n`;

    if (dateEntity) {
      response += `**Due:** ${dateEntity.value}`;
      if (timeEntity) {
        response += ` at ${timeEntity.value}`;
      }
      response += "\n";
    }

    if (priorityEntity) {
      response += `**Priority:** ${priorityEntity.value}\n`;
    }

    response += "\n*Navigate to the Reminders page to view and manage your reminders.*";

    return response;
  }

  /**
   * Handle view reminders intent
   */
  private handleViewReminders(): string {
    return "⏰ **Your Reminders**\n\n*Navigate to the Reminders page to view all your reminders and tasks.*";
  }

  /**
   * Handle search SharePoint intent
   */
  private handleSearchSharePoint(_entities: ReturnType<typeof nlpService.processInput>["entities"], originalText: string): string {
    // Extract search query
    const queryMatch = originalText.match(/(?:find|search|look\s+for)\s+(?:files?|documents?)?\s*(?:in\s+sharepoint\s+)?(?:for\s+)?(.+)/i);
    const query = queryMatch ? queryMatch[1] : "your query";

    let response = "📁 **SharePoint Search**\n\n";
    response += `Searching for: "${query}"\n\n`;
    response += "*To access SharePoint content, please ensure you are authenticated and have the appropriate permissions.*";

    return response;
  }

  /**
   * Handle query Dataverse intent
   */
  private handleQueryDataverse(entities: ReturnType<typeof nlpService.processInput>["entities"], originalText: string): string {
    // Detect entity type from text
    let entityType = "records";
    if (originalText.toLowerCase().includes("contact")) entityType = "contacts";
    else if (originalText.toLowerCase().includes("account")) entityType = "accounts";
    else if (originalText.toLowerCase().includes("lead")) entityType = "leads";

    let response = "💾 **Dataverse Query**\n\n";
    response += `Querying: ${entityType}\n`;

    const relevantEntities = entities.filter((e) => e.type === "person" || e.type === "location");
    if (relevantEntities.length > 0) {
      response += "Filters:\n";
      relevantEntities.forEach((e) => {
        response += `- ${e.type}: ${e.value}\n`;
      });
    }

    response += "\n*To access Dataverse data, please ensure you are authenticated and have the appropriate permissions.*";

    return response;
  }

  /**
   * Handle unknown intent
   */
  private handleUnknownIntent(originalText: string): string {
    return `I'm not sure how to help with "${originalText}". 

Here are some things I can help you with:
- 📅 Schedule meetings and view your calendar
- ⏰ Create and manage reminders
- 📁 Search SharePoint for documents
- 💾 Query data from Dataverse

Type "help" for more detailed information about available commands.`;
  }
}

export const chatService = new ChatService();
