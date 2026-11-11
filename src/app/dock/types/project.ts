
export type ProjectId = string;

export interface DockProject {
  id: ProjectId;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspacePreferences {
  theme: "dark" | "light" | "system";
  activeProjectId: ProjectId | null;
  sidebarCollapsed: boolean;
  autosaveEnabled: boolean;
}
