/**
 * Shared contracts for the HackersHarbor Dock Studio data-quality engine.
 * Detectors report findings; transformations are applied separately.
 */

export type DataRow = Record<string, unknown>;

export type Severity = "critical" | "high" | "warning" | "info";

export type QualityDimension =
  | "completeness"
  | "validity"
  | "uniqueness"
  | "consistency"
  | "accuracy"
  | "integrity"
  | "timeliness"
  | "schema"
  | "distribution";

export type RiskLevel = "safe" | "review" | "destructive";

export type IssueStatus =
  | "open"
  | "ignored"
  | "resolved"
  | "needs-review";

export type IssueActionKind =
  | "trim-whitespace"
  | "normalize-empty"
  | "convert-placeholder"
  | "standardize-category"
  | "convert-number"
  | "convert-date"
  | "remove-duplicates"
  | "replace-missing"
  | "remove-rows"
  | "rename-column"
  | "drop-column"
  | "review-rows"
  | "define-rule"
  | "ignore";

export interface IssueAction {
  id: string;
  label: string;
  kind: IssueActionKind;
  risk: RiskLevel;
  enabled: boolean;
  description?: string;
}

export interface IssueExample {
  rowIndex: number;
  rowId?: string;
  column: string;
  before: unknown;
  after?: unknown;
  reason?: string;
}

export interface QualityIssue {
  /** Stable identifier for this finding type and affected target. */
  id: string;

  /** Detector that produced this finding. */
  detectorId: string;

  /** Short label shown in the issue card. */
  title: string;

  /** Explanation of the finding and why it matters. */
  description: string;

  dimension: QualityDimension;
  severity: Severity;
  status: IssueStatus;

  /** Affected column names. Empty means the issue is dataset-wide. */
  columns: string[];

  /** Zero-based row indexes in the current dataset snapshot. */
  rowIndexes: number[];

  /** Number of affected cells, rows, or entities as described by the issue. */
  affectedCount: number;
  affectedCountUnit: "cells" | "rows" | "values" | "columns" | "entities";

  /** Evidence should explain why this issue was detected. */
  evidence: string[];

  /** A small, bounded sample for the Before/After preview. */
  examples: IssueExample[];

  /** Only actions explicitly provided by the detector or engine are offered. */
  actions: IssueAction[];

  /** Optional detector-specific metadata for previews and remediation. */
  metadata?: Record<string, unknown>;

  detectedAt: number;
}

export interface DetectorContext {
  datasetId: string;
  columns: string[];
  rows: DataRow[];

  /** Optional declared schema and validation configuration. */
  schema?: DatasetSchema;
  rules?: ValidationRule[];

  /** Optional cancellation signal for long-running scans. */
  signal?: AbortSignal;
}

export interface DetectorResult {
  detectorId: string;
  issues: QualityIssue[];
  scannedRows: number;
  scannedColumns: number;
  durationMs: number;
  warnings: string[];
}

export interface DataQualityDetector {
  readonly id: string;
  readonly name: string;
  readonly dimension: QualityDimension;

  detect(context: DetectorContext): DetectorResult;
}

export type ColumnDataType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "datetime"
  | "unknown";

export interface ColumnSchema {
  name: string;
  type: ColumnDataType;
  nullable?: boolean;
  unique?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  allowedValues?: unknown[];
}

export interface DatasetSchema {
  columns: ColumnSchema[];
  primaryKey?: string[];
}

export type ValidationRuleKind =
  | "not-null"
  | "unique"
  | "type"
  | "range"
  | "allowed-values"
  | "regex"
  | "column-comparison"
  | "foreign-key"
  | "custom";

export interface ValidationRule {
  id: string;
  name: string;
  description?: string;
  kind: ValidationRuleKind;
  enabled: boolean;
  severity: Severity;
  columns: string[];

  /** Rule-specific options; each evaluator validates its own options. */
  options: Record<string, unknown>;
}

export interface TransformationPreview {
  rowIndex: number;
  column: string;
  before: unknown;
  after: unknown;
}

export interface TransformationPlan {
  id: string;
  datasetId: string;
  issueId: string;
  label: string;
  risk: RiskLevel;

  /** Number of proposed cell changes. */
  changeCount: number;

  /** Bounded sample; do not store an entire large dataset here. */
  preview: TransformationPreview[];

  /** Explicitly states whether confirmation is required. */
  requiresConfirmation: boolean;

  /** Optional parameters chosen by the user. */
  parameters: Record<string, unknown>;
}

export interface TransformationResult {
  planId: string;
  rows: DataRow[];
  changedCells: number;
  changedRows: number;
  skippedRows: number;
  warnings: string[];
}

export interface CleaningHistoryEntry {
  id: string;
  datasetId: string;
  timestamp: number;
  action: string;
  issueId?: string;
  description: string;
  changedRows: number;
  changedCells: number;
  reversible: boolean;
}

export interface QualityDimensionScore {
  dimension: QualityDimension;
  score: number | null;
  applicable: boolean;
  evaluatedChecks: number;
  failedChecks: number;
  explanation: string;
}

export interface QualitySummary {
  score: number | null;
  dimensions: QualityDimensionScore[];
  openIssues: number;
  criticalIssues: number;
  highIssues: number;
  affectedRows: number;
  affectedCells: number;
  safeFixCount: number;
  scannedRows: number;
  scannedColumns: number;
  scannedAt: number | null;
  warnings: string[];
}

export interface EngineScanOptions {
  enabledDetectorIds?: string[];
  includeInfo?: boolean;
  maxExamplesPerIssue?: number;
  signal?: AbortSignal;
}

export interface EngineScanResult {
  datasetId: string;
  issues: QualityIssue[];
  summary: QualitySummary;
  detectorResults: DetectorResult[];
  durationMs: number;
  scannedAt: number;
}
