import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";

import { normalizeLanguage } from "./LanguageRegistry";

export class ExecutionService {
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    const language = normalizeLanguage(request.language);

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          source: request.source,
        }),
        signal: controller.signal,
      });

      let result: ExecutionResult;

      try {
        result = (await response.json()) as ExecutionResult;
      } catch {
        throw new Error("The execution server returned invalid data.");
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.output ||
            "Execution failed.",
        );
      }

      return {
        output: result.output || "",
        exitCode: result.exitCode ?? 0,
        durationMs: result.durationMs,
        mode: result.mode ?? "runtime",
        error: result.error,
        previewHtml: result.previewHtml,
      };
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "Execution timed out after 15 seconds.",
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Execution failed.");
    } finally {
      window.clearTimeout(timeoutId);
    }
  }
}

export const executionService = new ExecutionService();