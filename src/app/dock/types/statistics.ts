
export interface NumericSummary {
    count: number;
    missing: number;
    mean: number | null;
    median: number | null;
    standardDeviation: number | null;
    variance: number | null;
    minimum: number | null;
    maximum: number | null;
    q1: number | null;
    q3: number | null;
  }
  
  export interface CorrelationResult {
    columns: string[];
    matrix: (number | null)[][];
    method: "pearson" | "spearman" | "kendall";
    sampleSize: number;
  }
  
  export interface ConfidenceInterval {
    estimate: number;
    lowerBound: number;
    upperBound: number;
    confidenceLevel: number;
    sampleSize: number;
    method: string;
  }
  
  export interface HypothesisTestResult {
    statistic: number;
    pValue: number;
    degreesOfFreedom?: number;
    alpha: number;
    rejectNull: boolean;
    method: string;
    sampleSize: number;
    assumptions: string[];
    warnings: string[];
  }
  
  export interface DistributionSummary {
    column: string;
    bins: { start: number; end: number; count: number }[];
    sampleSize: number;
    missingCount: number;
  }
  