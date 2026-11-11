export type KrakenContentType = "dataset" | "challenge";

export type KrakenDomain =
  | "data-science"
  | "machine-learning"
  | "data-analysis"
  | "data-engineering"
  | "deep-learning"
  | "natural-language-processing"
  | "computer-vision"
  | "mlops"
  | "statistics"
  | "software-engineering"
  | "web-development"
  | "devops"
  | "cloud-computing"
  | "system-design";

export type KrakenDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type KrakenTaskType =
  | "classification"
  | "regression"
  | "clustering"
  | "forecasting"
  | "computer-vision"
  | "natural-language-processing"
  | "exploratory-analysis"
  | "data-engineering"
  | "software-engineering"
  | "web-development"
  | "devops"
  | "cloud-computing"
  | "system-design"
  | "statistics"
  | "mlops";

export type KrakenDatasetFormat =
  | "CSV"
  | "JSON"
  | "Parquet"
  | "JSONL"
  | "SQL"
  | "ZIP";

export type KrakenEntry = {
  id: string;
  type: KrakenContentType;
  title: string;
  description: string;
  content: string;

  author: string;
  authorInitial: string;
  publishedLabel: string;

  domain: KrakenDomain;
  format: KrakenDatasetFormat;
  recordCount: number;
  size: string;
  difficulty: KrakenDifficulty;
  taskType: KrakenTaskType;
  evaluationMetric?: string;
  source?: string;

  communities: string[];
  tags: string[];

  signals: number;
  replies: number;
  views: string;
};