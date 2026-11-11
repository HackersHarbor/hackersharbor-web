
export type CellId = string;

export type CellType = "python" | "sql" | "markdown";

export type CellExecutionStatus =
  | "idle"
  | "queued"
  | "running"
  | "success"
  | "error"
  | "cancelled";

export interface CellOutputTable {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
}

export type CellOutput =
  | {
      id: string;
      type: "text";
      content: string;
    }
  | {
      id: string;
      type: "table";
      content: CellOutputTable;
    }
  | {
      id: string;
      type: "image";
      mimeType: string;
      data: string;
    }
  | {
      id: string;
      type: "chart";
      chartType: string;
      specification: Record<string, unknown>;
    }
  | {
      id: string;
      type: "error";
      message: string;
      traceback?: string;
    };

export interface NotebookCell {
  id: CellId;
  type: CellType;
  source: string;
  outputs: CellOutput[];
  executionStatus: CellExecutionStatus;
  executionCount: number | null;
  executionDurationMs?: number;
  createdAt: string;
  updatedAt: string;
  collapsed: boolean;
}
