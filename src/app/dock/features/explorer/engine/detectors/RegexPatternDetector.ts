import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
  Severity,
} from "../types";

type PatternFinding = {
  rowIndex: number;
  column: string;
  value: unknown;
  ruleName: string;
  pattern: string;
  severity: Severity;
};

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

export class RegexPatternDetector implements DataQualityDetector {
  readonly id = "regex-pattern";
  readonly name = "Regex Pattern Detector";
  readonly dimension = "validity" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, rules, signal } = context;
    const findings: PatternFinding[] = [];
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    const regexRules = (rules ?? []).filter(
      (rule) =>
        rule.enabled &&
        rule.kind === "regex" &&
        rule.columns.length > 0,
    );

    for (const rule of regexRules) {
      if (signal?.aborted) {
        warnings.push(
          "Regex validation stopped because cancellation was requested.",
        );
        break;
      }

      const patternValue = rule.options.pattern;
      const flagsValue = rule.options.flags;

      if (typeof patternValue !== "string" || patternValue.length === 0) {
        warnings.push(
          `Regex rule "${rule.name}" has no valid options.pattern string.`,
        );
        continue;
      }

      const flags = typeof flagsValue === "string" ? flagsValue : "";

      let expression: RegExp;

      try {
        expression = new RegExp(patternValue, flags);
      } catch (error) {
        warnings.push(
          `Regex rule "${rule.name}" has an invalid expression: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        continue;
      }

      const targetColumns = rule.columns.filter((column) =>
        columns.includes(column),
      );

      for (const column of targetColumns) {
        rows.forEach((row, rowIndex) => {
          const value = row[column];

          // Missing values belong to completeness checks, not regex checks.
          if (isMissing(value)) return;

          if (typeof value !== "string") {
            findings.push({
              rowIndex,
              column,
              value,
              ruleName: rule.name,
              pattern: patternValue,
              severity: rule.severity,
            });
            return;
          }

          // Reset state because global and sticky expressions are stateful.
          expression.lastIndex = 0;
          const matches = expression.test(value);
          expression.lastIndex = 0;

          if (!matches) {
            findings.push({
              rowIndex,
              column,
              value,
              ruleName: rule.name,
              pattern: patternValue,
              severity: rule.severity,
            });
          }
        });
      }

      const absentColumns = rule.columns.filter(
        (column) => !columns.includes(column),
      );

      if (absentColumns.length > 0) {
        warnings.push(
          `Regex rule "${rule.name}" references missing columns: ${absentColumns.join(", ")}`,
        );
      }
    }

    const grouped = new Map<string, PatternFinding[]>();

    for (const finding of findings) {
      const key = [
        finding.column,
        finding.ruleName,
        finding.pattern,
      ].join("|");

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

      issues.push({
        id: `regex-violation-${first.column}-${first.ruleName}`,
        detectorId: this.id,
        title: `Pattern violations in "${first.column}"`,
        description:
          `${group.length} values do not satisfy the configured pattern "${first.ruleName}".`,
        dimension: "validity",
        severity,
        status: "open",
        columns: [first.column],
        rowIndexes: [...new Set(group.map((item) => item.rowIndex))],
        affectedCount: group.length,
        affectedCountUnit: "cells",
        evidence: [
          `Validation rule: ${first.ruleName}`,
          `Configured pattern: ${first.pattern}`,
          `Affected cells: ${group.length}`,
          `Finding group: ${key}`,
        ],
        examples: group.slice(0, 5).map((item) => ({
          rowIndex: item.rowIndex,
          column: item.column,
          before: item.value,
          reason:
            `Value does not match the regular expression configured by "${item.ruleName}".`,
        })),
        actions: [
          {
            id: `review-regex-${first.column}`,
            label: "Review pattern violations",
            description:
              "Inspect the values and configured pattern before correcting any records.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        metadata: {
          ruleName: first.ruleName,
          pattern: first.pattern,
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

export const regexPatternDetector = new RegexPatternDetector();
