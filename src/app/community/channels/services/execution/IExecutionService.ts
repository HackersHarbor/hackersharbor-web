import type {
  ExecutionRequest,
  ExecutionResult,
} from "./ExecutionTypes";

export interface IExecutionService {
  execute(
    request: ExecutionRequest,
  ): Promise<ExecutionResult>;
}
