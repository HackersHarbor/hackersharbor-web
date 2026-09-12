import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";

import type { IExecutionService } from "./IExecutionService";

export class HtmlExecutionService implements IExecutionService {
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    return {
      output: "",
      exitCode: 0,
      durationMs: 0,
      mode: "preview",
      previewHtml: request.source,
    };
  }
}