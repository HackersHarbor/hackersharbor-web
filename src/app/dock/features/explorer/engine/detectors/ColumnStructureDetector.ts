import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

/**
 * Stable, type-aware serialization for comparing distinct values.
 * Object keys are sorted so equivalent records are not treated as different
 * solely because their properties were inserted in a different order.
 */
function stableValueKey(
  value: unknown,
  ancestors: Set<object> = new Set<object>(),
): string {
  if (value === null) return "null:";
  if (value === undefined) return "undefined:";

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp)
      ? `date:${value.toISOString()}`
      : "date:invalid";
  }

  switch (typeof value) {
    case "string":
      return `string:${JSON.stringify(value)}`;

    case "number":
      if (Number.isNaN(value)) return "number:NaN";
      if (value === Infinity) return "number:Infinity";
      if (value === -Infinity) return "number:-Infinity";
      if (Object.is(value, -0)) return "number:-0";
      return `number:${String(value)}`;

    case "boolean":
      return `boolean:${value}`;

    case "bigint":
      return `bigint:${String(value)}`;

    case "symbol":
      return `symbol:${String(value.description ?? "")}`;

    case "function":
      return `function:${String(value)}`;

    case "object": {
      const objectValue = value as object;

      if (ancestors.has(objectValue)) {
        return "object:[Circular]";
      }

      ancestors.add(objectValue);

      let result: string;

      if (Array.isArray(value)) {
        result = `array:[${value
          .map((item) => stableValueKey(item, ancestors))
          .join(",")}]`;
      } else {
        const record = value as Record<string, unknown>;
        const entries = Object.keys(record)
          .sort()
          .map(
            (key) =>
              `${JSON.stringify(key)}:${stableValueKey(record[key], ancestors)}`,
          );

        result = `object:{${entries.join(",")}}`;
      }

      ancestors.delete(objectValue);
      return result;
    }

    default:
      return `unknown:${String(value)}`;
  }
}

function displayValue(value: unknown): string {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime())
      ? value.toISOString()
      : "Invalid Date";
  }

  if (typeof value === "string") return value;

  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return String(value);
  }
}

export class ColumnStructureDetector implements DataQualityDetector {
  readonly id = "column-structure";
  readonly name = "Column Structure Detector";
  readonly description =
    "Identifies entirely empty columns and columns with only one distinct usable value.";
  readonly dimension = "distribution" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    let cancelled = false;

    for (const column of columns) {
      if (signal?.aborted) {
        cancelled = true;
        break;
      }

      let usableCount = 0;
      let firstUsableIndex = -1;
      let firstUsableValue: unknown;
      let firstUsableKey: string | undefined;
      let hasMultipleValues = false;
      const distinctKeys = new Set<string>();
      const usableRowIndexes: number[] = [];
      const missingRowIndexes: number[] = [];

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelled = true;
          break;
        }

        const value = rows[rowIndex]?.[column];

        if (isMissing(value)) {
          missingRowIndexes.push(rowIndex);
          continue;
        }

        usableCount += 1;
        usableRowIndexes.push(rowIndex);

        if (firstUsableIndex === -1) {
          firstUsableIndex = rowIndex;
          firstUsableValue = value;
          firstUsableKey = stableValueKey(value);
          distinctKeys.add(firstUsableKey);
          continue;
        }

        const valueKey = stableValueKey(value);
        distinctKeys.add(valueKey);

        if (valueKey !== firstUsableKey) {
          hasMultipleValues = true;
        }
      }

      if (cancelled) break;
      if (rows.length === 0) continue;

      if (usableCount === 0) {
        const issue: QualityIssue = {
          id: `column-entirely-empty-${encodeURIComponent(column)}`,
          detectorId: this.id,
          title: `Column "${column}" contains no usable values`,
          description:
            "Every row in this column is null, undefined, or an empty string.",
          severity: "high",
          dimension: "completeness",
          status: "open",
          columns: [column],
          rowIndexes: missingRowIndexes,
          affectedCount: missingRowIndexes.length,
          affectedCountUnit: "rows",
          examples: missingRowIndexes.slice(0, 5).map((rowIndex) => ({
            rowIndex,
            column,
            before: rows[rowIndex]?.[column],
            value: rows[rowIndex]?.[column],
            displayValue: "(empty)",
          })),
          evidence: [
            `${rows.length} row(s) scanned.`,
            "No usable values were found.",
          ],
          actions: [
            {
              id: `review-empty-column-${encodeURIComponent(column)}`,
              label: "Review empty column",
              description:
                "Inspect the column before deciding whether to populate or remove it.",
              kind: "review-rows",
              risk: "safe",
              enabled: true,
            },
          ],
          detectedAt: Date.now(),
        };

        issues.push(issue);
        continue;
      }

      if (!hasMultipleValues && distinctKeys.size === 1 && rows.length > 1) {
        const issue: QualityIssue = {
          id: `constant-column-${encodeURIComponent(column)}`,
          detectorId: this.id,
          title: `Column "${column}" has a single distinct value`,
          description:
            `All ${usableCount} usable value(s) are identical. ` +
            "This column may provide little analytical value.",
          severity: "info",
          dimension: "distribution",
          status: "open",
          columns: [column],
          rowIndexes: usableRowIndexes,
          affectedCount: usableCount,
          affectedCountUnit: "cells",
          examples: [
            {
              rowIndex: firstUsableIndex,
              column,
              before: displayValue(firstUsableValue),
              value: displayValue(firstUsableValue),
              displayValue: displayValue(firstUsableValue),
            },
          ],
          evidence: [
            `${distinctKeys.size} distinct usable value.`,
            `${usableCount} usable cell(s) out of ${rows.length} row(s).`,
            `${missingRowIndexes.length} missing cell(s).`,
          ],
          actions: [
            {
              id: `review-constant-column-${encodeURIComponent(column)}`,
              label: "Review column usefulness",
              description:
                "Confirm whether this constant column is meaningful for the dataset.",
              kind: "review-rows",
              risk: "safe",
              enabled: true,
            },
          ],
          detectedAt: Date.now(),
        };

        issues.push(issue);
      }
    }

    if (columns.length === 0 && rows.length > 0) {
      warnings.push("Rows exist, but the dataset has no declared columns.");
    }

    if (cancelled || signal?.aborted) {
      warnings.push(
        "Column structure scan stopped because cancellation was requested.",
      );
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: columns.length,
      durationMs: Math.max(0, Date.now() - startedAt),
      warnings: [...new Set(warnings)],
    };
  }
}

export const columnStructureDetector = new ColumnStructureDetector();
