import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";
import type { IExecutionService } from "./IExecutionService";

export class CssExecutionService
  implements IExecutionService
{
  async execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult> {
    return {
      output: "CSS preview generated.",
      exitCode: 0,
      durationMs: 0,
      mode: "preview",
      previewHtml: `
        <html>
          <head>
            <style>${request.source}</style>
          </head>
          <body>
            <div class="preview-root">
              CSS preview
            </div>
          </body>
        </html>
      `,
    };
  }
}
