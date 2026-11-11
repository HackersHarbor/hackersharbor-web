
import type { CellId, CellOutput, CellType } from "./cell";
import type { DatasetId } from "./dataset";

export type RuntimeKind = "browser" | "backend";

export type RuntimeStatus =
  | "disconnected"
  | "initializing"
  | "ready"
  | "busy"
  | "error"
  | "stopped";

export interface ExecutionRequest {
  cellId: CellId;
  cellType: CellType;
  source: string;
  datasetIds: DatasetId[];
  timeoutMs?: number;
}

export interface ExecutionResult {
  cellId: CellId;
  status: "success" | "error" | "cancelled";
  outputs: CellOutput[];
  executionCount: number | null;
  durationMs: number;
  error?: {
    name: string;
    message: string;
    traceback?: string;
  };
}

export interface RuntimeCapabilities {
  persistentState: boolean;
  supportedCellTypes: CellType[];
  supportsCancellation: boolean;
  supportsPackageInstallation: boolean;
  maxExecutionTimeMs: number;
}

export interface RuntimeInformation {
  kind: RuntimeKind;
  status: RuntimeStatus;
  version?: string;
  capabilities: RuntimeCapabilities;
}
