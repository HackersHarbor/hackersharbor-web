
import type {
  DockNotebook,
  NotebookCell,
  WorkspacePreferences,
} from "../types";

export const DEFAULT_PREFERENCES: WorkspacePreferences = {
  theme: "dark",
  activeProjectId: null,
  sidebarCollapsed: false,
  autosaveEnabled: true,
};

export function createDefaultCell(
  id: string,
  type: NotebookCell["type"] = "python",
): NotebookCell {
  const now = new Date().toISOString();

  return {
    id,
    type,
    source: "",
    outputs: [],
    executionStatus: "idle",
    executionCount: null,
    createdAt: now,
    updatedAt: now,
    collapsed: false,
  };
}

export function createDefaultNotebook(
  id: string,
  projectId: string,
): DockNotebook {
  const now = new Date().toISOString();

  return {
    id,
    projectId,
    name: "Untitled notebook",
    description: "",
    cells: [],
    datasetIds: [],
    createdAt: now,
    updatedAt: now,
    revision: 0,
  };
}
