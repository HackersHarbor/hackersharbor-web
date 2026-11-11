import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
  Severity,
} from "../types";

type ForeignKeyFinding = {
  rowIndex: number;
  column: string;
  value: unknown;
  ruleName: string;
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

export class ForeignKeyDetector implements DataQualityDetector {
  readonly id = "foreign-key";
  readonly name = "Foreign Key Detector";
  readonly dimension = "integrity" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, rules, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    const foreignKeyRules = (rules ?? []).filter(
      (rule) => rule.enabled && rule.kind === "foreign-key",
    );

    for (const rule of foreignKeyRules) {
      if (signal?.aborted) {
        warnings.push(
          "Foreign-key scan stopped because cancellation was requested.",
        );
        break;
      }

      if (rule.columns.length !== 1) {
        warnings.push(
          `Foreign-key rule "${rule.name}" must specify exactly one local column.`,
        );
        continue;
      }

      const column = rule.columns[0];

      if (!columns.includes(column)) {
        warnings.push(
          `Foreign-key rule "${rule.name}" references missing local column "${column}".`,
        );
        continue;
      }

      const referenceValues = rule.options.referenceValues;

      if (!Array.isArray(referenceValues)) {
        warnings.push(
          `Foreign-key rule "${rule.name}" requires an options.referenceValues array.`,
        );
        continue;
      }

      const referenceSet = new Set(referenceValues.map(stableValue));
      const findings: ForeignKeyFinding[] = [];
      let cancelledDuringScan = false;

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelledDuringScan = true;
          break;
        }

        const value = rows[rowIndex][column];

        // Missing foreign keys are handled by completeness checks.
        if (isMissing(value)) continue;

        if (!referenceSet.has(stableValue(value))) {
          findings.push({
            rowIndex,
            column,
            value,
            ruleName: rule.name,
            severity: rule.severity,
          });
        }
      }

      if (cancelledDuringScan) {
        warnings.push(
          `Foreign-key scan for rule "${rule.name}" stopped because cancellation was requested.`,
        );
        break;
      }

      if (findings.length === 0) continue;

      const severity: Severity = findings.some(
        (finding) => finding.severity === "critical",
      )
        ? "critical"
        : findings.some((finding) => finding.severity === "high")
          ? "high"
          : findings.some((finding) => finding.severity === "warning")
            ? "warning"
            : "info";

      const issue: QualityIssue = {
        id: `foreign-key-violation-${rule.id}`,
        detectorId: this.id,
        title: `Unmatched references in "${column}"`,
        description:
          `${findings.length} values in "${column}" do not exist in the configured reference set.`,
        dimension: "integrity",
        severity,
        status: "open",
        columns: [column],
        rowIndexes: findings.map((finding) => finding.rowIndex),
        affectedCount: findings.length,
        affectedCountUnit: "cells",
        evidence: [
          `Validation rule: ${rule.name}`,
          `Local column: ${column}`,
          `Configured reference values: ${referenceValues.length}`,
          `Unmatched values: ${findings.length}`,
        ],
        examples: findings.slice(0, 5).map((finding) => ({
          rowIndex: finding.rowIndex,
          column: finding.column,
          before: finding.value,
          reason:
            `Value does not exist in the reference set defined by "${finding.ruleName}".`,
        })),
        actions: [
          {
            id: `review-foreign-key-${rule.id}`,
            label: "Review unmatched references",
            description:
              "Check the reference data and the local value before deciding how to resolve the relationship.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        metadata: {
          ruleId: rule.id,
          ruleName: rule.name,
          referenceCount: referenceValues.length,
          unmatchedValues: [
            ...new Set(findings.map((finding) => stableValue(finding.value))),
          ].slice(0, 20),
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

export const foreignKeyDetector = new ForeignKeyDetector();
