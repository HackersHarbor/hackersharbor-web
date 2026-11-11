import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

type DuplicateGroup = {
  key: string;
  rowIndexes: number[];
};

function stableValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (value instanceof Date) {
    return Number.isFinite(value.getTime())
      ? `date:${value.toISOString()}`
      : "date:invalid";
  }

  if (typeof value === "number") {
    if (Number.isNaN(value)) return "number:NaN";
    if (value === Number.POSITIVE_INFINITY) return "number:+Infinity";
    if (value === Number.NEGATIVE_INFINITY) return "number:-Infinity";
    if (Object.is(value, -0)) return "number:-0";
    return `number:${value}`;
  }

  if (typeof value === "string") return `string:${JSON.stringify(value)}`;
  if (typeof value === "boolean") return `boolean:${value}`;
  if (typeof value === "bigint") return `bigint:${value.toString()}`;

  if (Array.isArray(value)) {
    return `array:[${value.map((item) => stableValue(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    try {
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record).sort();
      return `object:{${keys
        .map(
          (key) =>
            `${JSON.stringify(key)}:${stableValue(record[key])}`,
        )
        .join(",")}}`;
    } catch {
      return `object:${String(value)}`;
    }
  }

  return `${typeof value}:${String(value)}`;
}

function createGroupMap(
  rows: DetectorContext["rows"],
  keyColumns: string[],
  signal?: AbortSignal,
): { groups: DuplicateGroup[]; cancelled: boolean } {
  const groups = new Map<string, number[]>();
  let cancelled = false;

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    if (signal?.aborted) {
      cancelled = true;
      break;
    }

    const row = rows[rowIndex];
    const key = JSON.stringify(
      keyColumns.map((column) => stableValue(row[column])),
    );

    const indexes = groups.get(key);
    if (indexes) {
      indexes.push(rowIndex);
    } else {
      groups.set(key, [rowIndex]);
    }
  }

  return {
    groups: [...groups.entries()]
      .filter(([, indexes]) => indexes.length > 1)
      .map(([key, rowIndexes]) => ({ key, rowIndexes })),
    cancelled,
  };
}

function createDuplicateIssue(args: {
  id: string;
  title: string;
  description: string;
  columns: string[];
  rowIndexes: number[];
  rows: DetectorContext["rows"];
  affectedCount: number;
  evidence: string[];
  allowRemoval: boolean;
}): QualityIssue {
  const {
    id,
    title,
    description,
    columns,
    rowIndexes,
    rows,
    affectedCount,
    evidence,
    allowRemoval,
  } = args;

  const firstRowIndex = rowIndexes[0];
  const exampleColumn = columns[0] ?? "(entire row)";

  const examples = rowIndexes.slice(0, 5).map((rowIndex) => ({
    rowIndex,
    column: exampleColumn,
    before:
      exampleColumn === "(entire row)"
        ? rows[rowIndex]
        : rows[rowIndex]?.[exampleColumn],
    reason:
      rowIndex === firstRowIndex
        ? "First occurrence in this matching group."
        : "Matches the values in this group.",
  }));

  const actions: QualityIssue["actions"] = [
    {
      id: `review-${id}`,
      label: "Review matching rows",
      description: "Inspect the records before deciding what action to take.",
      kind: "review-rows",
      risk: "safe",
      enabled: true,
    },
  ];

  if (allowRemoval) {
    actions.push({
      id: `remove-${id}`,
      label: "Remove duplicate rows",
      description:
        "Keep the first occurrence and remove later exact duplicate rows.",
      kind: "remove-duplicates",
      risk: "destructive",
      enabled: true,
    });
  }

  return {
    id,
    detectorId: "duplicate-rows",
    title,
    description,
    severity: "warning",
    dimension: "uniqueness",
    status: "open",
    columns,
    rowIndexes,
    affectedCount,
    affectedCountUnit: "rows",
    examples,
    evidence,
    actions,
    detectedAt: Date.now(),
  };
}

export class DuplicateDetector implements DataQualityDetector {
  readonly id = "duplicate-rows";
  readonly name = "Duplicate Row Detector";
  readonly description =
    "Finds exact duplicate rows and potential conflicts in declared key columns.";
  readonly dimension = "uniqueness" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema, signal } = context;
    const warnings: string[] = [];
    const issues: QualityIssue[] = [];

    if (columns.length === 0) {
      return {
        detectorId: this.id,
        issues: [],
        scannedRows: rows.length,
        scannedColumns: 0,
        durationMs: Date.now() - startedAt,
        warnings: [
          "Duplicate scan skipped: no columns were supplied for comparison.",
        ],
      };
    }

    // Exact duplicate detection compares every supplied dataset column.
    // Values are serialized with type information so, for example, the
    // number 1 is not treated as identical to the text value "1".
    const exactResult = createGroupMap(rows, columns, signal);

    exactResult.groups.forEach((group, groupIndex) => {
      const firstRowIndex = group.rowIndexes[0];
      const duplicateRowIndexes = group.rowIndexes.slice(1);

      issues.push(
        createDuplicateIssue({
          id: `duplicate-group-${groupIndex + 1}`,
          title: `Duplicate row group ${groupIndex + 1}`,
          description:
            `${group.rowIndexes.length} rows contain identical values across ` +
            `${columns.length} compared columns.`,
          columns,
          rowIndexes: group.rowIndexes,
          rows,
          affectedCount: duplicateRowIndexes.length,
          evidence: [
            `${group.rowIndexes.length} identical rows`,
            `First occurrence: row ${firstRowIndex + 1}`,
            `Potential duplicate rows: ${duplicateRowIndexes
              .map((index) => index + 1)
              .join(", ")}`,
          ],
          allowRemoval: true,
        }),
      );
    });

    if (exactResult.cancelled) {
      warnings.push(
        "Duplicate scan stopped because cancellation was requested.",
      );
    }

    // A primary-key declaration can be an inferred suggestion rather than a
    // user-confirmed constraint. Therefore, key collisions are reported as
    // potential conflicts and never receive an automatic removal action.
    const primaryKeyColumns = (schema?.primaryKey ?? []).filter(
      (column) => columns.includes(column),
    );

    const allPrimaryKeyColumnsAvailable =
      primaryKeyColumns.length > 0 &&
      primaryKeyColumns.length === (schema?.primaryKey?.length ?? 0);

    if (allPrimaryKeyColumnsAvailable && !signal?.aborted) {
      const keyResult = createGroupMap(rows, primaryKeyColumns, signal);

      const exactRowKeys = new Set(
        exactResult.groups.map((group) => group.key),
      );

      // Only key groups with differing full-row content are key conflicts.
      // Exact duplicate rows are already reported by the exact-row check.
      const conflictGroups = keyResult.groups.filter((group) => {
        const fullRowKeys = new Set(
          group.rowIndexes.map((rowIndex) =>
            JSON.stringify(
              columns.map((column) =>
                stableValue(rows[rowIndex]?.[column]),
              ),
            ),
          ),
        );

        return fullRowKeys.size > 1;
      });

      conflictGroups.forEach((group, groupIndex) => {
        const keyValues = primaryKeyColumns.map((column) => ({
          column,
          value: rows[group.rowIndexes[0]]?.[column],
        }));

        const keyDescription = keyValues
          .map(({ column, value }) => `${column}=${String(value)}`)
          .join(", ");

        issues.push(
          createDuplicateIssue({
            id: `potential-key-conflict-${groupIndex + 1}`,
            title: "Potential primary-key conflict",
            description:
              `${group.rowIndexes.length} rows share the same value across ` +
              `the declared key column${primaryKeyColumns.length === 1 ? "" : "s"} ` +
              `(${keyDescription}) but contain different row data. Review the key definition and records.`,
            columns: [...new Set([...primaryKeyColumns, ...columns])],
            rowIndexes: group.rowIndexes,
            rows,
            affectedCount: group.rowIndexes.length,
            evidence: [
              `Key columns: ${primaryKeyColumns.join(", ")}`,
              `Shared key values: ${keyDescription}`,
              `${group.rowIndexes.length} records share this key`,
              "The records contain different values outside the key columns.",
              "This is a potential conflict; the key declaration may still be a suggestion.",
            ],
            allowRemoval: false,
          }),
        );
      });

      if (keyResult.cancelled) {
        warnings.push(
          "Primary-key conflict scan stopped because cancellation was requested.",
        );
      }
    } else if (
      schema?.primaryKey &&
      schema.primaryKey.length > 0 &&
      !allPrimaryKeyColumnsAvailable
    ) {
      warnings.push(
        "Primary-key conflict scan skipped: one or more declared key columns are not included in the scanned columns.",
      );
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

export const duplicateDetector = new DuplicateDetector();
