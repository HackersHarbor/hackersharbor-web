
import type { CellId, NotebookCell } from "./cell";
import type { DatasetId } from "./dataset";
import type { ProjectId } from "./project";

export type NotebookId = string;

export interface DockNotebook {
  id: NotebookId;
  projectId: ProjectId;
  name: string;
  description: string;
  cells: NotebookCell[];
  datasetIds: DatasetId[];
  createdAt: string;
  updatedAt: string;
  revision: number;
}

export interface NotebookSnapshot {
  notebook: DockNotebook;
  savedAt: string;
  revision: number;
}

export interface NotebookShare {
  id: string;
  notebookId: NotebookId;
  url: string;
  createdAt: string;
  expiresAt?: string;
  permission: "view" | "edit";
}

export interface NotebookCellMove {
  cellId: CellId;
  targetIndex: number;
}

export interface NotebookExport {
  format: "json" | "ipynb";
  fileName: string;
  content: string;
}
