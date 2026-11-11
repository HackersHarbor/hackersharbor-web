import type {
  NavigatorMessage,
  NavigatorPageContext,
  NavigatorRequest,
} from "@/types/navigator";

import { navigatorConfig } from "./navigator-config";

const allowedContextFields = [
  "pathname",
  "pageTitle",
  "workspace",
  "datasetName",
] as const;

function cleanContext(value: unknown): NavigatorPageContext | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const result: NavigatorPageContext = {};

  for (const field of allowedContextFields) {
    const entry = source[field];

    if (typeof entry === "string") {
      result[field] = entry.trim().slice(0, 300);
    }
  }

  return result;
}

export function validateNavigatorRequest(
  value: unknown
): NavigatorRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const body = value as Record<string, unknown>;

  if (!Array.isArray(body.messages)) {
    return null;
  }

  if (
    body.messages.length === 0 ||
    body.messages.length > navigatorConfig.maxMessages
  ) {
    return null;
  }

  let totalLength = 0;

  const messages: NavigatorMessage[] = [];

  for (const item of body.messages) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return null;
    }

    const message = item as Record<string, unknown>;

    if (
      message.role !== "user" &&
      message.role !== "assistant"
    ) {
      return null;
    }

    if (
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > navigatorConfig.maxMessageLength
    ) {
      return null;
    }

    if (
      message.id !== undefined &&
      (typeof message.id !== "string" || message.id.length > 100)
    ) {
      return null;
    }

    totalLength += message.content.length;

    messages.push({
      id:
        typeof message.id === "string" && message.id.trim()
          ? message.id
          : crypto.randomUUID(),
      role: message.role,
      content: message.content.trim(),
    });
  }

  if (
    totalLength > navigatorConfig.maxRequestLength ||
    messages[messages.length - 1].role !== "user"
  ) {
    return null;
  }

  return {
    messages,
    context: cleanContext(body.context),
  };
}
