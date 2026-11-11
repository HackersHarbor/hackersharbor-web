import type {
  AIProvider,
  NavigatorRequest,
} from "@/types/navigator";

import { getOpenAIClient } from "@/lib/navigator/openai-client";
import { navigatorConfig } from "@/lib/navigator/navigator-config";
import { buildNavigatorInstructions } from "@/lib/navigator/navigator-prompts";

export class OpenAIProvider implements AIProvider {
  async *streamText(
    request: NavigatorRequest,
    signal: AbortSignal
  ): AsyncIterable<string> {
    const client = getOpenAIClient();

    const stream = await client.responses.create(
      {
        model: navigatorConfig.model,

        instructions: buildNavigatorInstructions(
          request.context
        ),

        input: request.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),

        stream: true,
      },
      {
        signal,
      }
    );

    for await (const event of stream) {
      if (signal.aborted) {
        return;
      }

      if (event.type === "response.output_text.delta") {
        yield event.delta;
      }

      if (event.type === "response.failed") {
        throw new Error(
          "The OpenAI response could not be completed."
        );
      }
    }
  }
}
