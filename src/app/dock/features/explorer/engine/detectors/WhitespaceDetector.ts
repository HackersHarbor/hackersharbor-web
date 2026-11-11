import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

type WhitespaceFinding = {
  rowIndex: number;
  before: string;
  after: string;
  whitespaceOnly: boolean;
};

export class WhitespaceDetector implements DataQualityDetector {
  readonly id = "whitespace";
  readonly name = "Whitespace Detector";
  readonly description =
    "Detects leading, trailing, and whitespace-only string values.";
  readonly dimension = "consistency" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns } = context;
    const issues: QualityIssue[] = [];

    for (const column of columns) {
      const findings: WhitespaceFinding[] = [];

      rows.forEach((row, rowIndex) => {
        const value = row[column];

        // Only normalize strings. Do not alter numbers, dates, or objects.
        if (typeof value !== "string") return;

        const after = value.trim();

        if (after !== value) {
          findings.push({
            rowIndex,
            before: value,
            after,
            whitespaceOnly: after.length === 0,
          });
        }
      });

      if (findings.length === 0) continue;

      const whitespaceOnlyCount = findings.filter(
        (finding) => finding.whitespaceOnly,
      ).length;

      const examples = findings.slice(0, 5).map((finding) => ({
        rowIndex: finding.rowIndex,
        column,
        before: finding.before,
        after: finding.after,
        reason: finding.whitespaceOnly
          ? "The value contains only whitespace and becomes empty after trimming."
          : "The value contains leading or trailing whitespace.",
      }));

      issues.push({
        id: `whitespace-${column}`,
        detectorId: this.id,
        title: `Whitespace inconsistencies in "${column}"`,
        description:
          `${findings.length} values contain leading or trailing whitespace. ` +
          `${whitespaceOnlyCount} become empty after trimming.`,
        severity: whitespaceOnlyCount > 0 ? "warning" : "info",
        dimension: "consistency",
        status: "open",
        columns: [column],
        rowIndexes: findings.map((finding) => finding.rowIndex),
        affectedCount: findings.length,
        affectedCountUnit: "cells",
        examples,
        evidence: [
          `${findings.length} values need trimming`,
          `${whitespaceOnlyCount} whitespace-only values`,
          `${findings.length - whitespaceOnlyCount} non-empty values can be trimmed`,
        ],
        actions: [
          {
            id: `trim-whitespace-${column}`,
            label: "Trim whitespace",
            description:
              "Remove leading and trailing whitespace from affected string values.",
            kind: "trim-whitespace",
            risk: "safe",
            enabled: true,
          },
          {
            id: `review-whitespace-${column}`,
            label: "Review affected values",
            description:
              "Inspect original values and their proposed trimmed results.",
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
      warnings: [],
    };
  }
}

export const whitespaceDetector = new WhitespaceDetector();
