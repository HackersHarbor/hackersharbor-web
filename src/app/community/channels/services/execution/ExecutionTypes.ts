export type ExecutionMode =
  | "runtime"
  | "preview"
  | "unsupported";

export interface ExecutionRequest {
  language: string;
  source: string;
}

export interface ExecutionResult {
  output: string;
  exitCode: number;
  durationMs?: number;
  mode?: ExecutionMode;
  error?: string;
  previewHtml?: string;
}

export interface IExecutionService {
  execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult>;
}