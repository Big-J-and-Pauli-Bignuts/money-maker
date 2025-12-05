import type { NLPIntent, NLPEntity } from "../types";

/**
 * Natural Language Processing Service
 * Provides intent recognition and entity extraction for natural language input
 */
export class NLPService {
  /**
   * Intent patterns for matching user input
   */
  private intentPatterns: { intent: string; patterns: RegExp[]; keywords: string[] }[] = [
    {
      intent: "create_event",
      patterns: [
        /schedule\s+(?:a\s+)?(?:meeting|event|appointment)/i,
        /create\s+(?:a\s+)?(?:meeting|event|appointment)/i,
        /set\s+up\s+(?:a\s+)?(?:meeting|event|appointment)/i,
        /add\s+(?:a\s+)?(?:meeting|event|appointment)/i,
        /book\s+(?:a\s+)?(?:meeting|event|appointment)/i,
      ],
      keywords: ["schedule", "create", "set up", "add", "book", "meeting", "event", "appointment"],
    },
    {
      intent: "view_calendar",
      patterns: [
        /show\s+(?:my\s+)?(?:calendar|schedule|events)/i,
        /what(?:'s|\s+is)\s+(?:on\s+)?(?:my\s+)?(?:calendar|schedule)/i,
        /(?:view|see|check)\s+(?:my\s+)?(?:calendar|schedule|events)/i,
        /(?:what|which)\s+(?:meetings|events)\s+(?:do\s+I\s+have|are\s+scheduled)/i,
      ],
      keywords: ["show", "view", "see", "check", "calendar", "schedule", "events", "meetings"],
    },
    {
      intent: "create_reminder",
      patterns: [
        /remind\s+me\s+(?:to|about)/i,
        /set\s+(?:a\s+)?reminder/i,
        /create\s+(?:a\s+)?reminder/i,
        /add\s+(?:a\s+)?reminder/i,
        /don'?t\s+let\s+me\s+forget/i,
      ],
      keywords: ["remind", "reminder", "don't forget", "remember"],
    },
    {
      intent: "view_reminders",
      patterns: [
        /show\s+(?:my\s+)?reminders/i,
        /what\s+(?:are\s+)?(?:my\s+)?reminders/i,
        /(?:view|see|check)\s+(?:my\s+)?reminders/i,
        /list\s+(?:my\s+)?reminders/i,
      ],
      keywords: ["reminders", "to-do", "tasks"],
    },
    {
      intent: "search_sharepoint",
      patterns: [
        /(?:find|search|look\s+for)\s+(?:files?|documents?)\s+(?:in|on)\s+sharepoint/i,
        /search\s+sharepoint\s+for/i,
        /find\s+in\s+sharepoint/i,
        /(?:get|retrieve)\s+(?:files?|documents?)\s+from\s+sharepoint/i,
      ],
      keywords: ["sharepoint", "files", "documents", "search", "find"],
    },
    {
      intent: "query_dataverse",
      patterns: [
        /(?:get|retrieve|fetch|query)\s+(?:data|records)\s+from\s+dataverse/i,
        /search\s+dataverse/i,
        /find\s+(?:in\s+)?dataverse/i,
        /(?:show|list)\s+(?:my\s+)?(?:contacts?|accounts?|leads?)/i,
      ],
      keywords: ["dataverse", "data", "records", "contacts", "accounts", "leads"],
    },
    {
      intent: "help",
      patterns: [
        /help/i,
        /what\s+can\s+you\s+do/i,
        /how\s+do\s+I/i,
        /what\s+commands/i,
      ],
      keywords: ["help", "assist", "support", "guide"],
    },
  ];

  /**
   * Entity extractors for different types
   */
  private entityExtractors: {
    type: string;
    patterns: RegExp[];
    extractor?: (match: RegExpMatchArray) => string;
  }[] = [
    {
      type: "date",
      patterns: [
        /(?:on\s+)?(?:(?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))/gi,
        /(?:on\s+)?(?:tomorrow|today|tonight)/gi,
        /(?:on\s+)?(?:\d{1,2}[/\u002D]\d{1,2}(?:[/\u002D]\d{2,4})?)/gi,
        /(?:on\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?/gi,
        /(?:in\s+)?(?:\d+)\s+(?:days?|weeks?|months?)/gi,
      ],
    },
    {
      type: "time",
      patterns: [
        /(?:at\s+)?(?:\d{1,2}:\d{2}\s*(?:am|pm)?)/gi,
        /(?:at\s+)?(?:\d{1,2}\s*(?:am|pm))/gi,
        /(?:at\s+)?(?:noon|midnight|morning|afternoon|evening)/gi,
      ],
    },
    {
      type: "duration",
      patterns: [
        /(?:for\s+)?(?:\d+)\s+(?:minutes?|mins?|hours?|hrs?)/gi,
        /(?:\d+(?:\.\d+)?)\s*(?:h|hr|hour)s?/gi,
      ],
    },
    {
      type: "person",
      patterns: [
        /with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
        /invite\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      ],
    },
    {
      type: "location",
      patterns: [
        /(?:at|in)\s+(?:the\s+)?([A-Z][A-Za-z0-9\s]+(?:room|office|building|hall)?)/g,
        /(?:location|place):\s*([A-Za-z0-9\s]+)/gi,
      ],
    },
    {
      type: "priority",
      patterns: [
        /(?:priority|importance):\s*(low|medium|high|urgent)/gi,
        /(low|medium|high|urgent)\s+priority/gi,
      ],
    },
  ];

  /**
   * Process natural language input and extract intent and entities
   */
  processInput(text: string): NLPIntent {
    const intent = this.detectIntent(text);
    const entities = this.extractEntities(text);

    return {
      intent: intent.name,
      confidence: intent.confidence,
      entities,
      originalText: text,
    };
  }

  /**
   * Detect the intent from the input text
   */
  private detectIntent(text: string): { name: string; confidence: number } {
    let bestMatch = { name: "unknown", confidence: 0 };

    for (const intentDef of this.intentPatterns) {
      // Check pattern matches
      for (const pattern of intentDef.patterns) {
        if (pattern.test(text)) {
          const confidence = 0.9;
          if (confidence > bestMatch.confidence) {
            bestMatch = { name: intentDef.intent, confidence };
          }
          break;
        }
      }

      // Check keyword matches
      if (bestMatch.name !== intentDef.intent) {
        const textLower = text.toLowerCase();
        const matchedKeywords = intentDef.keywords.filter((kw) =>
          textLower.includes(kw.toLowerCase())
        );
        if (matchedKeywords.length > 0) {
          const confidence = Math.min(0.8, 0.3 + matchedKeywords.length * 0.15);
          if (confidence > bestMatch.confidence) {
            bestMatch = { name: intentDef.intent, confidence };
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Extract entities from the input text
   */
  private extractEntities(text: string): NLPEntity[] {
    const entities: NLPEntity[] = [];

    for (const extractor of this.entityExtractors) {
      for (const pattern of extractor.patterns) {
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(text)) !== null) {
          const value = extractor.extractor
            ? extractor.extractor(match)
            : match[1] || match[0];

          // Avoid duplicate entities
          const matchIndex = match.index;
          const isDuplicate = entities.some(
            (e) =>
              e.type === extractor.type &&
              e.startIndex === matchIndex &&
              e.value === value
          );

          if (!isDuplicate) {
            entities.push({
              type: extractor.type,
              value: value.trim(),
              startIndex: match.index,
              endIndex: match.index + match[0].length,
            });
          }
        }
      }
    }

    // Sort entities by start index
    return entities.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Parse a date string into a Date object
   */
  parseDate(dateString: string): Date | null {
    const today = new Date();
    const lowerDate = dateString.toLowerCase().trim();

    // Handle relative dates
    if (lowerDate === "today" || lowerDate === "tonight") {
      return today;
    }
    if (lowerDate === "tomorrow") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // Handle day names
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < days.length; i++) {
      if (lowerDate.includes(days[i])) {
        const currentDay = today.getDay();
        let daysUntil = i - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        if (lowerDate.includes("next")) daysUntil += 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntil);
        return targetDate;
      }
    }

    // Handle relative time expressions
    const relativeMatch = lowerDate.match(/in\s+(\d+)\s+(days?|weeks?|months?)/);
    if (relativeMatch) {
      const amount = parseInt(relativeMatch[1], 10);
      const unit = relativeMatch[2].toLowerCase();
      const targetDate = new Date(today);

      if (unit.startsWith("day")) {
        targetDate.setDate(today.getDate() + amount);
      } else if (unit.startsWith("week")) {
        targetDate.setDate(today.getDate() + amount * 7);
      } else if (unit.startsWith("month")) {
        targetDate.setMonth(today.getMonth() + amount);
      }
      return targetDate;
    }

    // Try parsing as a standard date
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  /**
   * Parse a time string into hours and minutes
   */
  parseTime(timeString: string): { hours: number; minutes: number } | null {
    const lowerTime = timeString.toLowerCase().trim();

    // Handle named times
    const namedTimes: Record<string, { hours: number; minutes: number }> = {
      noon: { hours: 12, minutes: 0 },
      midnight: { hours: 0, minutes: 0 },
      morning: { hours: 9, minutes: 0 },
      afternoon: { hours: 14, minutes: 0 },
      evening: { hours: 18, minutes: 0 },
    };

    if (namedTimes[lowerTime]) {
      return namedTimes[lowerTime];
    }

    // Parse time formats like "3pm", "3:30pm", "15:30"
    const timeMatch = lowerTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const period = timeMatch[3];

      if (period === "pm" && hours < 12) hours += 12;
      if (period === "am" && hours === 12) hours = 0;

      return { hours, minutes };
    }

    return null;
  }

  /**
   * Get help text for available commands
   */
  getHelpText(): string {
    return `
**Available Commands:**

📅 **Calendar Management**
- "Schedule a meeting with [name] on [date] at [time]"
- "Show my calendar for today"
- "What meetings do I have this week?"

⏰ **Reminders**
- "Remind me to [task] at [time]"
- "Set a reminder for [date]"
- "Show my reminders"

📁 **SharePoint**
- "Find documents in SharePoint about [topic]"
- "Search SharePoint for [query]"

💾 **Dataverse**
- "Get contacts from Dataverse"
- "Query accounts from Dataverse"
- "Show my leads"

❓ **Help**
- "Help" - Show this help text
- "What can you do?" - List capabilities
    `.trim();
  }
}

export const nlpService = new NLPService();
