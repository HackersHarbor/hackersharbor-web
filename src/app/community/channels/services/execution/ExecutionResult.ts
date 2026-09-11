import type { ExecutionResult } from "./ExecutionTypes";

export function createExecutionResult(
  result: Partial<ExecutionResult> = {},
): ExecutionResult {
  return {
    output: "",
    exitCode: 0,
    durationMs: 0,
    mode: "runtime",
    ...result,
  };
}
