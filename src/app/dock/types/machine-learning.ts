
export type MLTaskType =
  | "classification"
  | "regression"
  | "clustering";

export interface ClassificationMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  logLoss?: number;
  sampleCount: number;
}

export interface RegressionMetrics {
  meanAbsoluteError?: number;
  meanSquaredError?: number;
  rootMeanSquaredError?: number;
  rSquared?: number;
  sampleCount: number;
}

export interface ConfusionMatrixResult {
  labels: (string | number)[];
  matrix: number[][];
  sampleCount: number;
}

export interface RocCurveResult {
  falsePositiveRates: number[];
  truePositiveRates: number[];
  thresholds: number[];
  auc?: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  method: string;
}

export interface ModelEvaluation {
  id: string;
  modelName: string;
  taskType: MLTaskType;
  datasetId: string;
  metrics: ClassificationMetrics | RegressionMetrics;
  evaluatedAt: string;
}
