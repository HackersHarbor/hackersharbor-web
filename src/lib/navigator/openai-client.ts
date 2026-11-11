import OpenAI from "openai";

import { navigatorConfig } from "./navigator-config";

let openAIClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (openAIClient) {
    return openAIClient;
  }

  openAIClient = new OpenAI({
    apiKey: navigatorConfig.apiKey,
    timeout: 60_000,
    maxRetries: 2,
  });

  return openAIClient;
}
