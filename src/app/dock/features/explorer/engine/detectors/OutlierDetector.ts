import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

type NumericValue = {
  rowIndex: number;
  value: number;
};

type OutlierStatistics = {
  method: "IQR" | "modified-z-score" | "dominant-value-fallback";
  q1: number;
  q3: number;
  iqr: number;
  median: number;
  mad: number;
  lowerBound: number;
  upperBound: number;
};

function quantile(sorted: number[], probability: number): number {
  if (sorted.length === 0) return 0;

  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) return sorted[lower];

  const fraction = position - lower;

  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) * fraction
  );
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;

  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function getOutlierStatistics(
  sorted: number[],
): OutlierStatistics | null {
  if (sorted.length < 4) return null;

  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const middle = median(sorted);

  const absoluteDeviations = sorted
    .map((value) => Math.abs(value - middle))
    .sort((a, b) => a - b);
  const mad = median(absoluteDeviations);

  if (iqr > 0) {
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return {
      method: "IQR",
      q1,
      q3,
      iqr,
      median: middle,
      mad,
      lowerBound,
      upperBound,
    };
  }

  // When IQR is zero, a robust modified z-score can still detect unusual
  // observations if the median absolute deviation is non-zero.
  if (mad > 0) {
    // The modified z-score threshold of 3.5 is a common robust screening
    // threshold. Findings remain review suggestions, not error verdicts.
    const robustThreshold = 3.5;
    const scale = 0.6745 / mad;
    const deviations = sorted.map((value) =>
      Math.abs(scale * (value - middle)),
    );

    const flagged = deviations.some(
      (score) => score > robustThreshold,
    );

    if (flagged) {
      const rawLimit = (robustThreshold * mad) / 0.6745;

      return {
        method: "modified-z-score",
        q1,
        q3,
        iqr,
        median: middle,
        mad,
        lowerBound: middle - rawLimit,
        upperBound: middle + rawLimit,
      };
    }

    return {
      method: "modified-z-score",
      q1,
      q3,
      iqr,
      median: middle,
      mad,
      lowerBound: Number.NEGATIVE_INFINITY,
      upperBound: Number.POSITIVE_INFINITY,
    };
  }

  // Both IQR and MAD can be zero when most values are identical. In that
  // specific case, use a conservative dominant-value check rather than
  // silently skipping the column. Require at least 75% of observations to
  // equal the median; minority values are then surfaced for human review.
  const medianCount = sorted.filter((value) => value === middle).length;
  const dominantShare = medianCount / sorted.length;

  if (dominantShare >= 0.75 && medianCount < sorted.length) {
    return {
      method: "dominant-value-fallback",
      q1,
      q3,
      iqr,
      median: middle,
      mad,
      lowerBound: middle,
      upperBound: middle,
    };
  }

  return null;
}

export class OutlierDetector implements DataQualityDetector {
  readonly id = "numeric-outliers";
  readonly name = "Numeric Outlier Detector";
  readonly description =
    "Identifies statistically unusual numeric values using distribution-based methods.";
  readonly dimension = "distribution" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    const declaredTypes = new Map(
      (schema?.columns ?? []).map((column) => [
        column.name,
        column.type,
      ]),
    );

    let scannedNumericColumns = 0;

    for (const column of columns) {
      if (signal?.aborted) {
        warnings.push(
          "Outlier scan stopped because cancellation was requested.",
        );
        break;
      }

      const declaredType = declaredTypes.get(column);

      // Respect an explicitly declared non-numeric type. When no type is
      // declared, inspect the actual values instead of assuming a schema.
      if (
        declaredType !== undefined &&
        declaredType !== "unknown" &&
        declaredType !== "number" &&
        declaredType !== "integer"
      ) {
        continue;
      }

      const numericValues: NumericValue[] = [];

      rows.forEach((row, rowIndex) => {
        const value = row[column];

        if (isMissing(value)) return;

        // Deliberately accept only actual finite numbers here. Numeric text
        // and currency-formatted strings are handled by TypeMismatchDetector
        // so the same cell is not reported as both an outlier and a type hint.
        if (typeof value === "number" && Number.isFinite(value)) {
          numericValues.push({ rowIndex, value });
        }
      });

      if (numericValues.length < 4) continue;

      scannedNumericColumns += 1;

      const sorted = numericValues
        .map((item) => item.value)
        .sort((a, b) => a - b);

      const statistics = getOutlierStatistics(sorted);
      if (!statistics) continue;

      let outliers: NumericValue[];

      if (statistics.method === "dominant-value-fallback") {
        outliers = numericValues.filter(
          (item) => item.value !== statistics.median,
        );
      } else {
        outliers = numericValues.filter(
          (item) =>
            item.value < statistics.lowerBound ||
            item.value > statistics.upperBound,
        );
      }

      if (outliers.length === 0) continue;

      const methodDescription =
        statistics.method === "IQR"
          ? "1.5 × IQR"
          : statistics.method === "modified-z-score"
            ? "modified z-score (threshold 3.5)"
            : "dominant-value fallback (at least 75% of observations equal the median)";

      const examples = outliers.slice(0, 5).map((item) => ({
        rowIndex: item.rowIndex,
        column,
        before: item.value,
        reason:
          statistics.method === "dominant-value-fallback"
            ? `Value differs from the dominant median value ${statistics.median}.`
            : `Value falls outside the calculated ${statistics.method} boundaries [${statistics.lowerBound}, ${statistics.upperBound}].`,
      }));

      const issue: QualityIssue = {
        id: `numeric-outliers-${column}`,
        detectorId: this.id,
        title: `Statistical outliers in "${column}"`,
        description:
          `${outliers.length} numeric values appear unusual relative to ` +
          `the observed distribution (${methodDescription}). These values may be legitimate and should be reviewed.`,
        dimension: "distribution",
        severity: "warning",
        status: "open",
        columns: [column],
        rowIndexes: outliers.map((item) => item.rowIndex),
        affectedCount: outliers.length,
        affectedCountUnit: "cells",
        evidence: [
          `Numeric observations: ${numericValues.length}`,
          `Q1: ${statistics.q1}`,
          `Median: ${statistics.median}`,
          `Q3: ${statistics.q3}`,
          `IQR: ${statistics.iqr}`,
          `MAD: ${statistics.mad}`,
          `Lower boundary: ${statistics.lowerBound}`,
          `Upper boundary: ${statistics.upperBound}`,
          `Method: ${methodDescription}`,
        ],
        examples,
        actions: [
          {
            id: `review-outliers-${column}`,
            label: "Review outliers",
            description:
              "Inspect unusual values in context before deciding whether they are errors.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        metadata: {
          method: statistics.method,
          q1: statistics.q1,
          q3: statistics.q3,
          iqr: statistics.iqr,
          median: statistics.median,
          mad: statistics.mad,
          lowerBound: statistics.lowerBound,
          upperBound: statistics.upperBound,
          observationCount: numericValues.length,
        },
        detectedAt: Date.now(),
      };

      issues.push(issue);
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: scannedNumericColumns,
      durationMs: Date.now() - startedAt,
      warnings,
    };
  }
}

export const outlierDetector = new OutlierDetector();
