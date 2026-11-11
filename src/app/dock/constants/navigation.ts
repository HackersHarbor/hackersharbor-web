
import type { NavigationItem } from "../types";

export const DOCK_NAVIGATION: NavigationItem[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Workspace overview and analytics",
    icon: "layout-dashboard",
    group: "workspace",
  },
  {
    id: "explorer",
    label: "Data Explorer",
    description: "Import and inspect datasets",
    icon: "database",
    group: "workspace",
  },
  {
    id: "notebooks",
    label: "Notebooks",
    description: "Python and SQL notebooks",
    icon: "notebook",
    group: "workspace",
  },
  {
    id: "statistics",
    label: "Statistics",
    description: "Statistical analysis",
    icon: "chart-no-axes-combined",
    group: "analytics",
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    description: "Model training and evaluation",
    icon: "brain-circuit",
    group: "analytics",
  },
  {
    id: "deep-learning",
    label: "Deep Learning",
    description: "Training and experiment tracking",
    icon: "network",
    group: "analytics",
  },
  {
    id: "ai-evaluation",
    label: "AI Evaluation",
    description: "Benchmarks and model comparisons",
    icon: "scan-search",
    group: "analytics",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Workspace preferences",
    icon: "settings",
    group: "preferences",
  },
];
