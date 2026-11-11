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
 * Creates a deterministic, type-aware key representation.
 *
 * This prevents values such as the number 7 and the string "7" from being
 * treated as the same primary-key value, and makes object-valued keys
 * independent of property insertion order.
 */
function stableKeyValue(
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
          .map((item) => stableKeyValue(item, ancestors))
          .join(",")}]`;
      } else {
        const record = value as Record<string, unknown>;
        const entries = Object.keys(record)
          .sort()
          .map(
            (key) =>
              `${JSON.stringify(key)}:${stableKeyValue(record[key], ancestors)}`,
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

function createCompositeKey(
  row: Record<string, unknown>,
  columns: string[],
): string {
  return columns
    .map((column) => stableKeyValue(row[column]))
    .map((part) => `${part.length}:${part}`)
    .join("|");
}

function displayKeyValue(value: unknown): string {
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

export class ReferentialIntegrityDetector implements DataQualityDetector {
  readonly id = "referential-integrity";
  readonly name = "Referential Integrity Detector";
  readonly description =
    "Checks declared primary-key columns for missing and duplicate key values.";
  readonly dimension = "integrity" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    let cancelled = false;

    const primaryKey = [...new Set(schema?.primaryKey ?? [])];

    if (primaryKey.length === 0) {
      return {
        detectorId: this.id,
        issues: [],
        scannedRows: rows.length,
        scannedColumns: columns.length,
        durationMs: Date.now() - startedAt,
        warnings: [
          "Referential integrity scan skipped: no primary key is declared.",
        ],
      };
    }

    const missingKeyColumns = primaryKey.filter(
      (column) => !columns.includes(column),
    );

    if (missingKeyColumns.length > 0) {
      warnings.push(
        `Primary-key columns are absent from the scan: ${missingKeyColumns.join(", ")}.`,
      );
    }

    const availableKeyColumns = primaryKey.filter((column) =>
      columns.includes(column),
    );

    if (availableKeyColumns.length === 0) {
      return {
        detectorId: this.id,
        issues: [],
        scannedRows: rows.length,
        scannedColumns: 0,
        durationMs: Date.now() - startedAt,
        warnings,
      };
    }

    // Missing values can be checked independently for every available key
    // column, including when another part of a composite key is unavailable.
    for (const column of availableKeyColumns) {
      if (signal?.aborted) {
        cancelled = true;
        break;
      }

      const rowIndexes: number[] = [];

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelled = true;
          break;
        }

        if (isMissing(rows[rowIndex]?.[column])) {
          rowIndexes.push(rowIndex);
        }
      }

      if (rowIndexes.length > 0) {
        const examples = rowIndexes.slice(0, 5).map((rowIndex) => ({
          rowIndex,
          column,
          before: rows[rowIndex]?.[column],
          value: rows[rowIndex]?.[column],
          displayValue: "(missing key)",
        }));

        const issue: QualityIssue = {
          id: `missing-primary-key-${encodeURIComponent(column)}`,
          detectorId: this.id,
          title: `Missing primary-key values in "${column}"`,
          description:
            `${rowIndexes.length} row(s) have no usable value for this key column.`,
          severity: "critical",
          dimension: "integrity",
          status: "open",
          columns: [column],
          rowIndexes,
          affectedCount: rowIndexes.length,
          affectedCountUnit: "cells",
          examples,
          evidence: [
            `Primary-key column: ${column}`,
            `${rowIndexes.length} row(s) have missing key values.`,
          ],
          actions: [
            {
              id: `review-missing-key-${encodeURIComponent(column)}`,
              label: "Review missing keys",
              description:
                "Inspect records with missing primary-key values.",
              kind: "review-rows",
              risk: "safe",
              enabled: true,
            },
          ],
          detectedAt: Date.now(),
        };

        issues.push(issue);
      }

      if (cancelled) break;
    }

    // Do not test uniqueness using only part of a composite key. Doing so
    // would create false duplicate-key findings when a declared key column
    // was not included in the scan.
    if (missingKeyColumns.length > 0) {
      warnings.push(
        "Duplicate primary-key validation was skipped because not all declared key columns are available.",
      );
    } else if (!cancelled) {
      const keyGroups = new Map<string, number[]>();

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelled = true;
          break;
        }

        const row = rows[rowIndex];

        // Rows with missing key components are already reported above.
        if (availableKeyColumns.some((column) => isMissing(row?.[column]))) {
          continue;
        }

        const key = createCompositeKey(row, availableKeyColumns);
        const indexes = keyGroups.get(key);

        if (indexes) {
          indexes.push(rowIndex);
        } else {
          keyGroups.set(key, [rowIndex]);
        }
      }

      if (!cancelled) {
        const duplicateGroups = [...keyGroups.values()].filter(
          (indexes) => indexes.length > 1,
        );

        if (duplicateGroups.length > 0) {
          const duplicateRows = [
            ...new Set(
              duplicateGroups.flatMap((indexes) => indexes.slice(1)),
            ),
          ].sort((a, b) => a - b);

          const examples = duplicateGroups.slice(0, 5).map((indexes) => {
            const firstRowIndex = indexes[0];
            const keyValue = availableKeyColumns
              .map((column) =>
                displayKeyValue(rows[firstRowIndex]?.[column]),
              )
              .join(" / ");

            return {
              rowIndex: firstRowIndex,
              column: availableKeyColumns.join(", "),
              before: keyValue,
              value: keyValue,
              displayValue:
                `Key ${keyValue}; rows ${indexes
                  .map((index) => index + 1)
                  .join(", ")}`,
            };
          });

          const issue: QualityIssue = {
            id: "duplicate-primary-key",
            detectorId: this.id,
            title: "Duplicate primary-key values",
            description:
              `${duplicateGroups.length} primary-key combination(s) occur more than once.`,
            severity: "critical",
            dimension: "integrity",
            status: "open",
            columns: availableKeyColumns,
            rowIndexes: duplicateRows,
            affectedCount: duplicateRows.length,
            affectedCountUnit: "rows",
            examples,
            evidence: [
              `Primary-key columns: ${availableKeyColumns.join(", ")}`,
              `${duplicateGroups.length} duplicate key combination(s).`,
              `${duplicateRows.length} later-occurrence row(s) affected.`,
            ],
            actions: [
              {
                id: "review-duplicate-primary-key",
                label: "Review duplicate keys",
                description:
                  "Compare records sharing a key before deciding how to resolve them.",
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
    }

    if (cancelled || signal?.aborted) {
      warnings.push(
        "Referential integrity scan stopped because cancellation was requested.",
      );
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: availableKeyColumns.length,
      durationMs: Math.max(0, Date.now() - startedAt),
      warnings: [...new Set(warnings)],
    };
  }
}

export const referentialIntegrityDetector =
  new ReferentialIntegrityDetector();
