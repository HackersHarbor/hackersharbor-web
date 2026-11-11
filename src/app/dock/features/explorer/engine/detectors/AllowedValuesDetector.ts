import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
  Severity,
} from "../types";

type InvalidValue = {
  rowIndex: number;
  column: string;
  value: unknown;
  allowedValues: unknown[];
  source: string;
  severity: Severity;
};

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function valuesMatch(left: unknown, right: unknown): boolean {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  return typeof left === typeof right && Object.is(left, right);
}

function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

const severityRank: Record<Severity, number> = {
  info: 0,
  warning: 1,
  high: 2,
  critical: 3,
};

export class AllowedValuesDetector implements DataQualityDetector {
  readonly id = "allowed-values";
  readonly name = "Allowed Values Detector";
  readonly dimension = "validity" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema, rules, signal } = context;
    const findings: InvalidValue[] = [];
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    const schemaColumns = new Map(
      (schema?.columns ?? []).map((column) => [column.name, column]),
    );

    for (const column of columns) {
      if (signal?.aborted) {
        warnings.push(
          "Allowed-value scan stopped because cancellation was requested.",
        );
        break;
      }

      const schemaDefinition = schemaColumns.get(column);
      const ruleDefinitions = (rules ?? []).filter(
        (rule) =>
          rule.enabled &&
          rule.kind === "allowed-values" &&
          rule.columns.includes(column),
      );

      const constraints: {
        values: unknown[];
        source: string;
        severity: Severity;
      }[] = [];

      if (schemaDefinition?.allowedValues?.length) {
        constraints.push({
          values: schemaDefinition.allowedValues,
          source: "Column schema",
          severity: "high",
        });
      }

      for (const rule of ruleDefinitions) {
        const configured = rule.options.values;

        if (!Array.isArray(configured) || configured.length === 0) {
          warnings.push(
            `Allowed-values rule "${rule.name}" for "${column}" has no non-empty options.values array.`,
          );
          continue;
        }

        constraints.push({
          values: configured,
          source: `Validation rule: ${rule.name}`,
          severity: rule.severity,
        });
      }

      for (const constraint of constraints) {
        let cancelledDuringScan = false;

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
          if (signal?.aborted) {
            cancelledDuringScan = true;
            break;
          }

          const value = rows[rowIndex][column];

          // Missing values are handled by the completeness detectors.
          if (isMissing(value)) continue;

          const allowed = constraint.values.some((candidate) =>
            valuesMatch(value, candidate),
          );

          if (!allowed) {
            findings.push({
              rowIndex,
              column,
              value,
              allowedValues: constraint.values,
              source: constraint.source,
              severity: constraint.severity,
            });
          }
        }

        if (cancelledDuringScan) {
          warnings.push(
            "Allowed-value scan stopped because cancellation was requested.",
          );
          break;
        }
      }

      if (signal?.aborted) break;
    }

    const grouped = new Map<string, InvalidValue[]>();

    for (const finding of findings) {
      const key = JSON.stringify([
        finding.column,
        finding.source,
        finding.allowedValues.map(describeValue),
      ]);

      const group = grouped.get(key);

      if (group) group.push(finding);
      else grouped.set(key, [finding]);
    }

    for (const [key, group] of grouped) {
      const first = group[0];

      const severity: Severity = group.some(
        (item) => item.severity === "critical",
      )
        ? "critical"
        : group.some((item) => item.severity === "high")
          ? "high"
          : group.some((item) => item.severity === "warning")
            ? "warning"
            : "info";

      const uniqueSuffix = key;

      issues.push({
        id: `disallowed-values-${uniqueSuffix}`,
        detectorId: this.id,
        title: `Values outside the allowed set in "${first.column}"`,
        description:
          `${group.length} cells contain values not permitted by ${first.source.toLowerCase()}.`,
        dimension: "validity",
        severity,
        status: "open",
        columns: [first.column],
        rowIndexes: [...new Set(group.map((item) => item.rowIndex))],
        affectedCount: group.length,
        affectedCountUnit: "cells",
        evidence: [
          `Constraint source: ${first.source}`,
          `Allowed values: ${first.allowedValues.map(describeValue).join(", ")}`,
          `Distinct invalid values: ${new Set(group.map((item) => describeValue(item.value))).size}`,
        ],
        examples: group.slice(0, 5).map((item) => ({
          rowIndex: item.rowIndex,
          column: item.column,
          before: item.value,
          reason:
            `Value is not in the allowed set defined by ${item.source}.`,
        })),
        actions: [
          {
            id: `review-allowed-values-${first.column}`,
            label: "Review invalid values",
            description:
              "Compare the observed values with the configured allowed set before making changes.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        metadata: {
          constraintSource: first.source,
          allowedValues: first.allowedValues,
          invalidValues: [
            ...new Set(group.map((item) => describeValue(item.value))),
          ].slice(0, 20),
        },
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

export const allowedValuesDetector = new AllowedValuesDetector();
