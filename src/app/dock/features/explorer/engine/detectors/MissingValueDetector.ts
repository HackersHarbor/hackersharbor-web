import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

const isMissing = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

export class MissingValueDetector implements DataQualityDetector {
  readonly id = "missing-values";
  readonly name = "Missing Value Detector";
  readonly description =
    "Detects null, undefined, empty, and whitespace-only values.";
  readonly dimension = "completeness" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    for (const column of columns) {
      if (signal?.aborted) {
        warnings.push(
          "Missing-value scan stopped because cancellation was requested.",
        );
        break;
      }

      const rowIndexes: number[] = [];
      let cancelledDuringScan = false;

      for (let index = 0; index < rows.length; index += 1) {
        if (signal?.aborted) {
          cancelledDuringScan = true;
          break;
        }

        if (isMissing(rows[index][column])) {
          rowIndexes.push(index);
        }
      }

      if (cancelledDuringScan) {
        warnings.push(
          "Missing-value scan stopped because cancellation was requested.",
        );
        break;
      }

      if (rowIndexes.length === 0) continue;

      const examples = rowIndexes.slice(0, 5).map((rowIndex) => {
        const before = rows[rowIndex]?.[column];

        return {
          rowIndex,
          column,
          before,
          reason:
            before === null
              ? "The cell contains null."
              : before === undefined
                ? "The cell contains undefined."
                : "The cell contains an empty or whitespace-only string.",
        };
      });

      const missingRate = rowIndexes.length / Math.max(rows.length, 1);

      issues.push({
        id: `missing-${encodeURIComponent(column)}`,
        detectorId: this.id,
        title: `Missing values in "${column}"`,
        description:
          `${rowIndexes.length} of ${rows.length} rows have a missing value.`,
        severity: missingRate >= 0.5 ? "high" : "warning",
        dimension: "completeness",
        status: "open",
        columns: [column],
        rowIndexes,
        affectedCount: rowIndexes.length,
        affectedCountUnit: "cells",
        examples,
        evidence: [
          `${rowIndexes.length} missing cells`,
          `${rows.length} total rows`,
          `Missing rate: ${(missingRate * 100).toFixed(1)}%`,
        ],
        actions: [
          {
            id: `replace-missing-${encodeURIComponent(column)}`,
            label: "Replace missing values",
            description:
              "Choose a replacement value before changing the dataset.",
            kind: "replace-missing",
            risk: "review",
            enabled: true,
          },
          {
            id: `review-missing-${encodeURIComponent(column)}`,
            label: "Review affected rows",
            description: "Inspect rows containing missing values.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        detectedAt: Date.now(),
      });
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: columns.length,
      durationMs: Date.now() - startedAt,
      warnings,
    };
  }
}

export const missingValueDetector = new MissingValueDetector();
