import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

const DEFAULT_PLACEHOLDERS = new Set([
  "n/a",
  "na",
  "n.a.",
  "not applicable",
  "not available",
  "not provided",
  "unknown",
  "undefined",
  "null",
  "none",
  "nil",
  "missing",
  "not known",
  "-",
  "--",
  "—",
  "?",
]);

type PlaceholderFinding = {
  rowIndex: number;
  column: string;
  value: string;
  normalizedValue: string;
};

export class PlaceholderDetector implements DataQualityDetector {
  readonly id = "placeholder-values";
  readonly name = "Placeholder Value Detector";
  readonly description =
    "Finds text values commonly used to represent missing or unavailable data.";
  readonly dimension = "completeness" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, signal } = context;
    const findingsByValue = new Map<string, PlaceholderFinding[]>();
    const warnings: string[] = [];
    let cancelled = false;

    for (const column of columns) {
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelled = true;
          break;
        }

        const value = rows[rowIndex][column];

        // Inspect strings only. Genuine null and undefined values are handled
        // by MissingValueDetector.
        if (typeof value !== "string") continue;

        const normalizedValue = value.trim().toLowerCase();

        if (!DEFAULT_PLACEHOLDERS.has(normalizedValue)) continue;

        const findings = findingsByValue.get(normalizedValue) ?? [];

        findings.push({
          rowIndex,
          column,
          value,
          normalizedValue,
        });

        findingsByValue.set(normalizedValue, findings);
      }

      if (cancelled) break;
    }

    if (cancelled) {
      warnings.push(
        "Placeholder scan stopped because cancellation was requested.",
      );
    }

    const issues: QualityIssue[] = [];

    for (const [normalizedValue, findings] of findingsByValue) {
      const affectedColumns = [
        ...new Set(findings.map((finding) => finding.column)),
      ];

      const rowIndexes = [
        ...new Set(findings.map((finding) => finding.rowIndex)),
      ].sort((a, b) => a - b);

      const displayValue = JSON.stringify(findings[0].value);

      const examples = findings.slice(0, 5).map((finding) => ({
        rowIndex: finding.rowIndex,
        column: finding.column,
        before: finding.value,
        reason:
          `The text matches the placeholder token "${normalizedValue}" after trimming and case normalization.`,
      }));

      issues.push({
        id: `placeholder-${encodeURIComponent(normalizedValue)}`,
        detectorId: this.id,
        title: `Potential placeholder value: ${displayValue}`,
        description:
          `${findings.length} cells contain "${normalizedValue}", ` +
          "which may represent missing or unavailable information.",
        severity: "warning",
        dimension: "completeness",
        status: "needs-review",
        columns: affectedColumns,
        rowIndexes,
        affectedCount: findings.length,
        affectedCountUnit: "cells",
        examples,
        evidence: [
          `Matched placeholder token: ${displayValue}`,
          `${findings.length} affected cells`,
          `${affectedColumns.length} affected columns`,
          "The value may be legitimate in this dataset; review before replacing it.",
        ],
        actions: [
          {
            id: `review-placeholder-${encodeURIComponent(normalizedValue)}`,
            label: "Review matching values",
            description:
              "Inspect affected cells before deciding whether the token means missing data.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
          {
            id: `replace-placeholder-${encodeURIComponent(normalizedValue)}`,
            label: "Replace placeholder",
            description:
              "Replace matching values only after confirming their meaning.",
            kind: "replace-missing",
            risk: "review",
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

export const placeholderDetector = new PlaceholderDetector();
