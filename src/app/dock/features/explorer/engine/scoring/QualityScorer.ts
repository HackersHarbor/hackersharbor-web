import type {
  DetectorResult,
  QualityDimension,
  QualityDimensionScore,
  QualityIssue,
  QualitySummary,
  Severity,
} from "./types";

export interface QualityScoringOptions {
  scannedRows: number;
  scannedColumns: number;
  scannedAt?: number | null;
  warnings?: string[];
  safeFixCount?: number;
}

const DIMENSIONS: QualityDimension[] = [
  "completeness", "validity", "uniqueness", "consistency", "accuracy",
  "integrity", "timeliness", "schema", "distribution",
];

const HEADLINE_WEIGHTS: Partial<Record<QualityDimension, number>> = {
  completeness: 0.3,
  validity: 0.3,
  uniqueness: 0.2,
  consistency: 0.2,
};

const SEVERITY_FACTOR: Record<Severity, number> = {
  critical: 1,
  high: 0.75,
  warning: 0.45,
  info: 0,
};

// Keep these IDs aligned with registerDefaultDetectors.ts and the detector
// implementations. RuleEvaluator is handled separately because its issues
// can belong to several dimensions.
const DETECTORS_BY_DIMENSION: Record<QualityDimension, string[]> = {
  completeness: [
    "missing-values",
    "placeholder-values",
    "column-structure",
  ],
  validity: [
    "type-mismatch",
    "range-validation",
    "allowed-values",
    "regex-pattern",
    "date-time-validation",
  ],
  uniqueness: ["duplicate-rows", "column-uniqueness"],
  consistency: [
    "category-consistency",
    "cross-column-consistency",
    "whitespace",
  ],
  // No built-in detector currently declares the accuracy dimension.
  accuracy: [],
  integrity: ["foreign-key", "referential-integrity"],
  timeliness: ["temporal-consistency"],
  schema: ["schema-validation"],
  distribution: ["distribution-drift", "numeric-outliers"],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isActive(issue: QualityIssue): boolean {
  return issue.status === "open" || issue.status === "needs-review";
}

const SEVERITY_RANK: Record<Severity, number> = {
  info: 0, warning: 1, high: 2, critical: 3,
};

function issueKey(issue: QualityIssue): string {
  const columns = [...new Set(
    issue.columns.map((column) => column.trim().toLowerCase()),
  )].sort().join(",");
  const rows = [...new Set(issue.rowIndexes)].sort((a, b) => a - b).join(",");
  const aggregate = rows.length
    ? ""
    : `${issue.affectedCountUnit}:${Math.max(0, issue.affectedCount)}`;
  return [
    issue.dimension,
    issue.title.trim().toLowerCase(),
    columns,
    rows,
    aggregate,
  ].join("|");
}

function uniqueActiveIssues(issues: QualityIssue[]): QualityIssue[] {
  const unique = new Map<string, QualityIssue>();
  for (const issue of issues) {
    if (!isActive(issue) || issue.severity === "info") continue;
    const key = issueKey(issue);
    const existing = unique.get(key);
    if (!existing) {
      unique.set(key, issue);
    } else if (SEVERITY_RANK[issue.severity] > SEVERITY_RANK[existing.severity]) {
      unique.set(key, { ...existing, severity: issue.severity });
    }
  }
  return [...unique.values()];
}

function resultCanCountForDimension(
  result: DetectorResult,
  dimension: QualityDimension,
): boolean {
  // A real finding proves that at least part of this dimension's check ran.
  if (result.issues.some((issue) => issue.dimension === dimension)) return true;
  // Several detectors return an empty result when their required configuration
  // is absent. Such a result must not be interpreted as a passing check.
  return !result.warnings.some((warning) => /\bskipped\b/i.test(warning));
}

function detectorApplies(
  dimension: QualityDimension,
  detectorResults: DetectorResult[],
): DetectorResult[] {
  const knownIds = DETECTORS_BY_DIMENSION[dimension];
  return detectorResults.filter((result) => {
    const isKnown = knownIds.includes(result.detectorId);
    const isDimensionSpecificRule = result.detectorId === "rule-evaluator" &&
      result.issues.some((issue) => issue.dimension === dimension);
    return (isKnown || isDimensionSpecificRule) &&
      resultCanCountForDimension(result, dimension);
  });
}

function scoreImpact(
  issues: QualityIssue[],
  scannedRows: number,
  scannedColumns: number,
): number {
  const denominator = Math.max(1, scannedRows * scannedColumns);
  const affectedCells = new Map<string, number>();
  let aggregateImpact = 0;

  for (const issue of issues) {
    const factor = SEVERITY_FACTOR[issue.severity];
    if (factor <= 0) continue;

    // Duplicate rowIndexes include the retained first occurrence.
    if (issue.detectorId === "duplicate-rows" && issue.affectedCountUnit === "rows") {
      for (const rowIndex of issue.rowIndexes.slice(1)) {
        if (rowIndex < 0 || rowIndex >= scannedRows) continue;
        const columns = issue.columns.length ? issue.columns : ["__dataset__"];
        for (const column of columns) {
          const key = `${rowIndex}:${column}`;
          affectedCells.set(key, Math.max(affectedCells.get(key) ?? 0, factor));
        }
      }
      continue;
    }

    if (issue.rowIndexes.length > 0 && issue.columns.length > 0) {
      for (const rowIndex of issue.rowIndexes) {
        if (rowIndex < 0 || rowIndex >= scannedRows) continue;
        for (const column of issue.columns) {
          const key = `${rowIndex}:${column}`;
          affectedCells.set(key, Math.max(affectedCells.get(key) ?? 0, factor));
        }
      }
      continue;
    }

    const affected = Math.max(0, issue.affectedCount);
    const estimatedCells = issue.affectedCountUnit === "rows"
      ? affected * Math.max(1, issue.columns.length)
      : affected;
    const issueImpact = clamp(estimatedCells / denominator, 0, 1) * factor;
    aggregateImpact = Math.max(aggregateImpact, issueImpact);
  }

  let totalImpact = 0;
  for (const impact of affectedCells.values()) totalImpact += impact;
  return clamp(totalImpact / denominator + aggregateImpact, 0, 1);
}

function scoreDimension(
  dimension: QualityDimension,
  allActiveIssues: QualityIssue[],
  scannedRows: number,
  scannedColumns: number,
  detectorResults: DetectorResult[],
): QualityDimensionScore {
  const applicableDetectors = detectorApplies(dimension, detectorResults);
  const applicable = applicableDetectors.length > 0;

  if (!applicable) {
    return {
      dimension,
      score: null,
      applicable: false,
      evaluatedChecks: 0,
      failedChecks: 0,
      explanation:
        "Not evaluated in this scan; required schema or validation configuration may be missing.",
    };
  }

  // Only score findings emitted by detectors that actually ran for this
  // dimension. A stale or unrelated issue cannot make a skipped check count.
  const applicableIds = new Set(applicableDetectors.map((result) => result.detectorId));
  const dimensionIssues = allActiveIssues.filter(
    (issue) => issue.dimension === dimension && applicableIds.has(issue.detectorId),
  );
  const impact = scoreImpact(dimensionIssues, scannedRows, scannedColumns);
  const score = Math.round(clamp((1 - impact) * 100, 0, 100));

  return {
    dimension,
    score,
    applicable: true,
    evaluatedChecks: applicableDetectors.length,
    failedChecks: dimensionIssues.length,
    explanation: dimensionIssues.length > 0
      ? `${dimensionIssues.length} active finding group(s) contributed to this score.`
      : "Applicable detectors ran without reporting findings.",
  };
}

export class QualityScorer {
  score(
    issues: QualityIssue[],
    options: QualityScoringOptions,
    detectorResults: DetectorResult[] = [],
  ): QualitySummary {
    const scannedRows = Math.max(0, Math.floor(options.scannedRows));
    const scannedColumns = Math.max(0, Math.floor(options.scannedColumns));
    const activeIssues = uniqueActiveIssues(issues);

    const dimensions = DIMENSIONS.map((dimension) => scoreDimension(
      dimension,
      activeIssues,
      scannedRows,
      scannedColumns,
      detectorResults,
    ));

    const headlineDimensions = dimensions.filter((item) =>
      item.applicable && item.score !== null &&
      HEADLINE_WEIGHTS[item.dimension] !== undefined,
    );
    const totalWeight = headlineDimensions.reduce(
      (total, item) => total + (HEADLINE_WEIGHTS[item.dimension] ?? 0),
      0,
    );
    const overallScore = totalWeight > 0
      ? Math.round(headlineDimensions.reduce(
          (total, item) => total +
            (item.score ?? 0) * (HEADLINE_WEIGHTS[item.dimension] ?? 0),
          0,
        ) / totalWeight)
      : null;

    const affectedRows = new Set<number>();
    const affectedCells = new Set<string>();
    for (const issue of activeIssues) {
      const metricRows = issue.detectorId === "duplicate-rows" &&
        issue.affectedCountUnit === "rows"
        ? issue.rowIndexes.slice(1)
        : issue.rowIndexes;
      for (const rowIndex of metricRows) {
        if (rowIndex >= 0 && rowIndex < scannedRows) affectedRows.add(rowIndex);
      }
      if (metricRows.length && issue.columns.length) {
        for (const rowIndex of metricRows) {
          if (rowIndex < 0 || rowIndex >= scannedRows) continue;
          for (const column of issue.columns) affectedCells.add(`${rowIndex}:${column}`);
        }
      }
    }

    const countedAffectedCells = activeIssues.reduce(
      (total, issue) => total +
        (issue.affectedCountUnit === "cells" && issue.rowIndexes.length === 0
          ? Math.max(0, issue.affectedCount)
          : 0),
      affectedCells.size,
    );

    return {
      score: overallScore,
      dimensions,
      openIssues: activeIssues.length,
      criticalIssues: activeIssues.filter((issue) => issue.severity === "critical").length,
      highIssues: activeIssues.filter((issue) => issue.severity === "high").length,
      affectedRows: affectedRows.size,
      affectedCells: countedAffectedCells,
      safeFixCount: Math.max(0, options.safeFixCount ?? 0),
      scannedRows,
      scannedColumns,
      scannedAt: options.scannedAt ?? Date.now(),
      warnings: [...new Set(options.warnings ?? [])],
    };
  }
}

export const qualityScorer = new QualityScorer();
