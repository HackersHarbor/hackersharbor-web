import type {
  NavigatorMessage,
} from "@/types/navigator";

export class ConversationService {
  static createMessage(
    role: NavigatorMessage["role"],
    content: string
  ): NavigatorMessage {
    return {
      id: crypto.randomUUID(),
      role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
  }

  static appendMessage(
    messages: NavigatorMessage[],
    message: NavigatorMessage,
    maximumMessages = 20
  ): NavigatorMessage[] {
    return [
      ...messages,
      message,
    ].slice(-maximumMessages);
  }

  static getRecentMessages(
    messages: NavigatorMessage[],
    maximumMessages = 20
  ): NavigatorMessage[] {
    return messages
      .slice(-maximumMessages)
      .map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      }));
  }

  static createTitle(
    firstMessage: string,
    maximumLength = 55
  ): string {
    const normalized = firstMessage
      .replace(/\s+/g, " ")
      .trim();

    if (!normalized) {
      return "New conversation";
    }

    if (normalized.length <= maximumLength) {
      return normalized;
    }

    return `${normalized.slice(0, maximumLength - 3).trim()}...`;
  }

  static validateConversation(
    messages: NavigatorMessage[]
  ): boolean {
    if (!Array.isArray(messages)) {
      return false;
    }

    return messages.every(
      (message) =>
        typeof message.id === "string" &&
        (message.role === "user" ||
          message.role === "assistant") &&
        typeof message.content === "string"
    );
  }
}
