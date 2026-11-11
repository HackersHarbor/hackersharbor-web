
export type DatasetId = string;

export type DatasetSource =
  | "csv"
  | "json"
  | "parquet"
  | "sql"
  | "transfer";

export type DataColumnType =
  | "string"
  | "integer"
  | "float"
  | "boolean"
  | "date"
  | "datetime"
  | "null"
  | "unknown";

export interface DatasetColumn {
  name: string;
  type: DataColumnType;
  nullable: boolean;
  uniqueCount?: number;
  missingCount?: number;
}

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  missingCells: number;
  duplicateRows: number;
  memoryBytes?: number;
}

export interface DockDataset {
  id: DatasetId;
  name: string;
  source: DatasetSource;
  fileName?: string;
  tableName: string;
  columns: DatasetColumn[];
  summary?: DatasetSummary;
  importedAt: string;
  status: "importing" | "ready" | "error";
  error?: string;
}

export interface DatasetPreview {
  datasetId: DatasetId;
  columns: DatasetColumn[];
  rows: Record<string, unknown>[];
  offset: number;
  totalRows: number;
  truncated: boolean;
}

export interface DatasetImportProgress {
  fileName: string;
  loadedBytes: number;
  totalBytes: number;
  status:
    | "pending"
    | "reading"
    | "registering"
    | "completed"
    | "failed";
  error?: string;
}
