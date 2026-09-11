import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";
import type { IExecutionService } from "./IExecutionService";
import { normalizeLanguage } from "./LanguageRegistry";

export class UnsupportedExecutionService
  implements IExecutionService
{
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    const language = normalizeLanguage(request.language);

    return {
      output:
        `${language} execution is not connected yet. ` +
        "This language requires a secure backend sandbox.",
      exitCode: 1,
      durationMs: 0,
      mode: "unsupported",
      error: `No execution runtime configured for ${language}.`,
    };
  }
}
