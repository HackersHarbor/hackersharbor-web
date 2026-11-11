
export type MetricProvenance =
  | "computed"
  | "measured"
  | "imported";

export interface AnalyticsMetric {
  id: string;
  label: string;
  value: number | string | null;
  unit?: string;
  provenance: MetricProvenance;
  calculatedAt?: string;
  datasetIds: string[];
}

export interface AnalysisRecord {
  id: string;
  title: string;
  domain:
    | "exploration"
    | "statistics"
    | "machine-learning"
    | "deep-learning"
    | "ai-evaluation";
  status: "running" | "completed" | "failed" | "cancelled";
  startedAt: string;
  completedAt?: string;
  datasetIds: string[];
  error?: string;
}

export interface AnalyticsDashboardData {
  metrics: AnalyticsMetric[];
  recentAnalyses: AnalysisRecord[];
  generatedAt: string;
}
