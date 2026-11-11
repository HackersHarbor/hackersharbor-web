export type NavigatorRole = "user" | "assistant";

export type NavigatorPlan = "free" | "pro";

export interface NavigatorMessage {
  id: string;
  role: NavigatorRole;
  content: string;
  createdAt?: string;
}

export interface NavigatorPageContext {
  pathname?: string;
  pageTitle?: string;
  workspace?: string;
  datasetName?: string;
}

export interface NavigatorRequest {
  messages: NavigatorMessage[];
  context?: NavigatorPageContext;
}

export interface NavigatorUsage {
  plan: NavigatorPlan;
  used: number;
  limit: number;
  remaining: number;
  resetAt?: string;
}

export interface NavigatorConversation {
  id: string;
  title: string;
  messages: NavigatorMessage[];
  updatedAt: string;
}

export interface NavigatorError {
  code: string;
  message: string;
}

export interface AIProvider {
  streamText(
    request: NavigatorRequest,
    signal: AbortSignal
  ): AsyncIterable<string>;
}

export interface SubscriptionProvider {
  getUserPlan(userId: string): Promise<NavigatorPlan>;
}
