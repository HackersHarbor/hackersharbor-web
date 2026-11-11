import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
  Severity,
} from "../types";

type UniqueConstraint = {
  columns: string[];
  name: string;
  severity: Severity;
};

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function stableValue(value: unknown): string {
  if (value instanceof Date) {
    return `date:${value.toISOString()}`;
  }

  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "object") {
    try {
      return `${typeof value}:${JSON.stringify(value)}`;
    } catch {
      return `${typeof value}:${String(value)}`;
    }
  }

  return `${typeof value}:${String(value)}`;
}

const severityRank: Record<Severity, number> = {
  info: 0,
  warning: 1,
  high: 2,
  critical: 3,
};

export class UniquenessDetector implements DataQualityDetector {
  readonly id = "column-uniqueness";
  readonly name = "Column Uniqueness Detector";
  readonly dimension = "uniqueness" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema, rules, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    const constraints: UniqueConstraint[] = [];

    for (const definition of schema?.columns ?? []) {
      if (definition.unique && columns.includes(definition.name)) {
        constraints.push({
          columns: [definition.name],
          name: `Unique column: ${definition.name}`,
          severity: "high",
        });
      }
    }

    for (const rule of rules ?? []) {
      if (!rule.enabled || rule.kind !== "unique") continue;

      const available = rule.columns.filter((column) =>
        columns.includes(column),
      );
      const missing = rule.columns.filter(
        (column) => !columns.includes(column),
      );

      if (missing.length > 0) {
        warnings.push(
          `Unique rule "${rule.name}" references missing columns: ${missing.join(", ")}`,
        );
      }

      if (available.length === 0) {
        warnings.push(
          `Unique rule "${rule.name}" skipped because none of its columns are available.`,
        );
        continue;
      }

      if (available.length !== rule.columns.length) continue;

      constraints.push({
        columns: [...new Set(available)],
        name: rule.name,
        severity: rule.severity,
      });
    }

    // Merge equivalent constraints so a rule cannot be hidden by a schema
    // constraint with the same columns but a lower severity.
    const mergedConstraints = new Map<string, UniqueConstraint>();

    for (const constraint of constraints) {
      const key = JSON.stringify(constraint.columns.slice().sort());
      const existing = mergedConstraints.get(key);

      if (!existing) {
        mergedConstraints.set(key, constraint);
        continue;
      }

      mergedConstraints.set(key, {
        columns: existing.columns,
        name:
          existing.name === constraint.name
            ? existing.name
            : `${existing.name}; ${constraint.name}`,
        severity:
          severityRank[constraint.severity] > severityRank[existing.severity]
            ? constraint.severity
            : existing.severity,
      });
    }

    for (const [constraintKey, constraint] of mergedConstraints) {
      if (signal?.aborted) {
        warnings.push(
          "Uniqueness scan stopped because cancellation was requested.",
        );
        break;
      }

      const groups = new Map<string, number[]>();
      let cancelledDuringScan = false;

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelledDuringScan = true;
          break;
        }

        const row = rows[rowIndex];
        const values = constraint.columns.map((column) => row[column]);

        // Missing values are handled by completeness checks.
        if (values.some(isMissing)) continue;

        const key = JSON.stringify(
          constraint.columns.map((column, index) => [
            column,
            stableValue(values[index]),
          ]),
        );

        const indexes = groups.get(key);
        if (indexes) indexes.push(rowIndex);
        else groups.set(key, [rowIndex]);
      }

      if (cancelledDuringScan) {
        warnings.push(
          "Uniqueness scan stopped because cancellation was requested.",
        );
        break;
      }

      const duplicates = [...groups.values()].filter(
        (indexes) => indexes.length > 1,
      );

      if (duplicates.length === 0) continue;

      const affectedRows = [
        ...new Set(duplicates.flatMap((indexes) => indexes.slice(1))),
      ].sort((a, b) => a - b);

      // Examples point to the later, affected occurrences rather than the
      // first occurrence, which is retained as the comparison reference.
      const examples = duplicates
        .flatMap((indexes) =>
          indexes.slice(1).map((rowIndex) => ({
            rowIndex,
            firstRowIndex: indexes[0],
          })),
        )
        .slice(0, 5)
        .map(({ rowIndex, firstRowIndex }) => {
          const displayValue = constraint.columns
            .map(
              (column) =>
                `${column}=${String(rows[rowIndex]?.[column])}`,
            )
            .join(", ");

          return {
            rowIndex,
            column: constraint.columns.join(", "),
            before: displayValue,
            reason: `Duplicate key also occurs in row ${firstRowIndex + 1}.`,
          };
        });

      const issue: QualityIssue = {
        id: `unique-constraint-${constraintKey}`,
        detectorId: this.id,
        title: `Uniqueness violation: ${constraint.columns.join(", ")}`,
        description:
          `${duplicates.length} value group(s) violate "${constraint.name}".`,
        dimension: "uniqueness",
        severity: constraint.severity,
        status: "open",
        columns: constraint.columns,
        rowIndexes: affectedRows,
        affectedCount: affectedRows.length,
        affectedCountUnit: "rows",
        evidence: [
          `Constraint: ${constraint.name}`,
          `Columns: ${constraint.columns.join(", ")}`,
          `Duplicate groups: ${duplicates.length}`,
          `Later-occurrence rows affected: ${affectedRows.length}`,
        ],
        examples,
        actions: [
          {
            id: `review-unique-${constraintKey}`,
            label: "Review duplicate values",
            description:
              "Compare records sharing these values before deciding how to resolve the conflict.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        metadata: {
          constraintName: constraint.name,
          duplicateGroupCount: duplicates.length,
        },
        detectedAt: Date.now(),
      };

      issues.push(issue);
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

export const uniquenessDetector = new UniquenessDetector();
