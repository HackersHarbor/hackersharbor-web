import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";
import type { IExecutionService } from "./IExecutionService";

export class JsonExecutionService
  implements IExecutionService
{
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    const startedAt = performance.now();

    try {
      const parsed = JSON.parse(request.source);

      return {
        output: JSON.stringify(parsed, null, 2),
        exitCode: 0,
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        mode: "runtime",
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      return {
        output: message,
        exitCode: 1,
        durationMs: Math.round(
          performance.now() - startedAt,
        ),
        mode: "runtime",
        error: message,
      };
    }
  }
}
