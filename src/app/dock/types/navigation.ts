
export type StudioSection =
  | "overview"
  | "explorer"
  | "notebooks"
  | "statistics"
  | "machine-learning"
  | "deep-learning"
  | "ai-evaluation"
  | "settings";

export interface NavigationItem {
  id: StudioSection;
  label: string;
  description: string;
  icon: string;
  group: "workspace" | "analytics" | "preferences";
}
