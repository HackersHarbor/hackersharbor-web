import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

type RangeFinding = {
  rowIndex: number;
  value: number;
  reason: string;
};

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

/**
 * Reads a plain numeric value without changing the source row.
 * Currency and percentage strings are deliberately not parsed here because
 * their units and formatting conventions need separate review.
 */
function parseRangeValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export class RangeDetector implements DataQualityDetector {
  readonly id = "range-validation";
  readonly name = "Range Detector";
  readonly description =
    "Detects numeric values outside explicitly declared minimum and maximum bounds.";
  readonly dimension = "validity" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    if (!schema) {
      return {
        detectorId: this.id,
        issues: [],
        scannedRows: rows.length,
        scannedColumns: 0,
        durationMs: Date.now() - startedAt,
        warnings: [
          "Range scan skipped: no declared dataset schema was supplied.",
          "No range limits were inferred. Add and confirm minimum or maximum bounds to enable this check.",
        ],
      };
    }

    const schemaByName = new Map(
      schema.columns.map((column) => [column.name, column]),
    );

    const boundedColumns: string[] = [];

    for (const column of columns) {
      const definition = schemaByName.get(column);
      if (!definition) continue;

      const hasMinimum = typeof definition.min === "number";
      const hasMaximum = typeof definition.max === "number";

      if (!hasMinimum && !hasMaximum) continue;

      if (
        (hasMinimum && !Number.isFinite(definition.min)) ||
        (hasMaximum && !Number.isFinite(definition.max))
      ) {
        warnings.push(
          `Range scan skipped for "${column}": the declared minimum or maximum is not finite.`,
        );
        continue;
      }

      if (
        hasMinimum &&
        hasMaximum &&
        (definition.min as number) > (definition.max as number)
      ) {
        warnings.push(
          `Range scan skipped for "${column}": the declared minimum is greater than the declared maximum.`,
        );
        continue;
      }

      if (definition.type !== "number" && definition.type !== "integer") {
        warnings.push(
          `Range scan skipped for "${column}": bounds are present, but its declared type is "${definition.type}" rather than number or integer.`,
        );
        continue;
      }

      boundedColumns.push(column);
    }

    if (boundedColumns.length === 0 && warnings.length === 0) {
      warnings.push(
        "Range scan skipped: no scanned numeric columns have declared minimum or maximum bounds.",
      );
    }

    for (const column of boundedColumns) {
      const definition = schemaByName.get(column);
      if (!definition) continue;

      const findings: RangeFinding[] = [];

      rows.forEach((row, rowIndex) => {
        const rawValue = row[column];

        // Missing values are handled by the completeness detector.
        if (isMissing(rawValue)) return;

        const value = parseRangeValue(rawValue);

        // Non-numeric values are handled by type validation, not range checks.
        if (value === null) return;

        const reasons: string[] = [];

        if (
          typeof definition.min === "number" &&
          value < definition.min
        ) {
          reasons.push(`below minimum ${definition.min}`);
        }

        if (
          typeof definition.max === "number" &&
          value > definition.max
        ) {
          reasons.push(`above maximum ${definition.max}`);
        }

        if (reasons.length > 0) {
          findings.push({
            rowIndex,
            value,
            reason: reasons.join(" and "),
          });
        }
      });

      if (findings.length === 0) continue;

      const examples = findings.slice(0, 5).map((finding) => ({
        rowIndex: finding.rowIndex,
        column,
        before: rows[finding.rowIndex]?.[column],
        reason: `${finding.value} is ${finding.reason}`,
      }));

      issues.push({
        id: `range-${column}`,
        detectorId: this.id,
        title: `Values outside the allowed range in "${column}"`,
        description:
          `${findings.length} numeric values fall outside the declared bounds.`,
        severity: "warning",
        dimension: "validity",
        status: "open",
        columns: [column],
        rowIndexes: findings.map((finding) => finding.rowIndex),
        affectedCount: findings.length,
        affectedCountUnit: "cells",
        examples,
        evidence: [
          `Minimum: ${definition.min ?? "not defined"}`,
          `Maximum: ${definition.max ?? "not defined"}`,
          `${findings.length} out-of-range values`,
          ...findings.slice(0, 3).map(
            (finding) =>
              `Row ${finding.rowIndex + 1}: ${finding.value} is ${finding.reason}`,
          ),
        ],
        actions: [
          {
            id: `review-range-${column}`,
            label: "Review out-of-range values",
            description:
              "Inspect the values and confirmed bounds before making corrections.",
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
      scannedColumns: boundedColumns.length,
      durationMs: Date.now() - startedAt,
      warnings,
    };
  }
}

export const rangeDetector = new RangeDetector();
