import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
  Severity,
} from "../types";

type ComparisonFinding = {
  rowIndex: number;
  columns: string[];
  values: unknown[];
  ruleId: string;
  ruleName: string;
  operator: string;
  severity: Severity;
};

type ComparisonResult = boolean | null;

const SUPPORTED_OPERATORS = new Set([
  "equals",
  "===",
  "not-equals",
  "!==",
  "greater-than",
  ">",
  "greater-than-or-equal",
  ">=",
  "less-than",
  "<",
  "less-than-or-equal",
  "<=",
]);

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function getComparableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  return null;
}

function compareValues(
  left: unknown,
  right: unknown,
  operator: string,
): ComparisonResult {
  switch (operator) {
    case "equals":
    case "===":
      if (left instanceof Date && right instanceof Date) {
        return (
          Number.isFinite(left.getTime()) &&
          Number.isFinite(right.getTime()) &&
          left.getTime() === right.getTime()
        );
      }
      return Object.is(left, right);

    case "not-equals":
    case "!==": {
      const equality = compareValues(left, right, "equals");
      return equality === null ? null : !equality;
    }

    case "greater-than":
    case ">":
    case "greater-than-or-equal":
    case ">=":
    case "less-than":
    case "<":
    case "less-than-or-equal":
    case "<=": {
      const leftNumber = getComparableNumber(left);
      const rightNumber = getComparableNumber(right);

      if (leftNumber === null || rightNumber === null) {
        return null;
      }

      switch (operator) {
        case "greater-than":
        case ">":
          return leftNumber > rightNumber;
        case "greater-than-or-equal":
        case ">=":
          return leftNumber >= rightNumber;
        case "less-than":
        case "<":
          return leftNumber < rightNumber;
        case "less-than-or-equal":
        case "<=":
          return leftNumber <= rightNumber;
        default:
          return null;
      }
    }

    default:
      return null;
  }
}

function highestSeverity(findings: ComparisonFinding[]): Severity {
  if (findings.some((item) => item.severity === "critical")) return "critical";
  if (findings.some((item) => item.severity === "high")) return "high";
  if (findings.some((item) => item.severity === "warning")) return "warning";
  return "info";
}

function safeValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime())
      ? value.toISOString()
      : "Invalid Date";
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return String(value);
  }
}

export class CrossColumnConsistencyDetector
  implements DataQualityDetector
{
  readonly id = "cross-column-consistency";
  readonly name = "Cross-Column Consistency Detector";
  readonly description =
    "Evaluates explicit comparisons between related columns using dataset-specific validation rules.";
  readonly dimension = "consistency" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, rules, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    const findings: ComparisonFinding[] = [];
    let cancelled = false;

    const comparisonRules = (rules ?? []).filter(
      (rule) =>
        rule.enabled &&
        rule.kind === "column-comparison" &&
        rule.columns.length >= 2,
    );

    for (const rule of comparisonRules) {
      if (signal?.aborted) {
        cancelled = true;
        break;
      }

      const leftColumn = rule.columns[0];
      const rightColumn = rule.columns[1];

      if (rule.columns.length > 2) {
        warnings.push(
          `Comparison rule "${rule.name}" lists more than two columns. Only the first two (${leftColumn}, ${rightColumn}) are compared.`,
        );
      }

      if (
        !columns.includes(leftColumn) ||
        !columns.includes(rightColumn)
      ) {
        warnings.push(
          `Comparison rule "${rule.name}" references unavailable columns.`,
        );
        continue;
      }

      const operator = rule.options.operator;

      if (
        typeof operator !== "string" ||
        !SUPPORTED_OPERATORS.has(operator)
      ) {
        warnings.push(
          `Comparison rule "${rule.name}" has an unsupported or missing operator. Supported operators: equals, not-equals, greater-than, greater-than-or-equal, less-than, less-than-or-equal, and their symbolic equivalents.`,
        );
        continue;
      }

      let incompatibleValues = false;

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) {
          cancelled = true;
          break;
        }

        const row = rows[rowIndex];
        const left = row?.[leftColumn];
        const right = row?.[rightColumn];

        // Completeness is evaluated by the missing-value checks. Do not
        // report a cross-column contradiction when either side is absent.
        if (isMissing(left) || isMissing(right)) continue;

        const comparison = compareValues(left, right, operator);

        if (comparison === null) {
          incompatibleValues = true;
          continue;
        }

        // A configured comparison rule describes a condition that must hold.
        if (!comparison) {
          findings.push({
            rowIndex,
            columns: [leftColumn, rightColumn],
            values: [left, right],
            ruleId: rule.id,
            ruleName: rule.name,
            operator,
            severity: rule.severity,
          });
        }
      }

      if (incompatibleValues) {
        warnings.push(
          `Comparison rule "${rule.name}" could not evaluate some non-missing values because their types are incompatible with operator "${operator}". Relational operators require finite numbers or valid Date objects; equality operators compare values without coercing types.`,
        );
      }

      if (cancelled) break;
    }

    const grouped = new Map<string, ComparisonFinding[]>();

    for (const finding of findings) {
      const key = [
        finding.ruleId,
        finding.columns.join(","),
        finding.operator,
      ].join("|");

      const group = grouped.get(key);
      if (group) {
        group.push(finding);
      } else {
        grouped.set(key, [finding]);
      }
    }

    for (const [key, group] of grouped) {
      const first = group[0];
      const severity = highestSeverity(group);
      const rowIndexes = [
        ...new Set(group.map((item) => item.rowIndex)),
      ].sort((a, b) => a - b);

      const examples = group.slice(0, 5).map((item) => ({
        rowIndex: item.rowIndex,
        column: item.columns.join(", "),
        before: item.values.map(safeValue).join(" | "),
        reason:
          `Rule "${item.ruleName}" expected ` +
          `${item.columns[0]} ${item.operator} ${item.columns[1]}.`,
      }));

      const issue: QualityIssue = {
        id: `cross-column-${encodeURIComponent(first.ruleId)}`,
        detectorId: this.id,
        title: `Cross-column inconsistency: ${first.ruleName}`,
        description:
          `${group.length} row(s) violate the configured comparison between ` +
          `${first.columns.join(" and ")}.`,
        dimension: "consistency",
        severity,
        status: "open",
        columns: first.columns,
        rowIndexes,
        affectedCount: rowIndexes.length,
        affectedCountUnit: "rows",
        evidence: [
          `Validation rule: ${first.ruleName}`,
          `Comparison: ${first.columns[0]} ${first.operator} ${first.columns[1]}`,
          `Violating rows: ${rowIndexes.length}`,
          `Finding group: ${key}`,
        ],
        examples,
        actions: [
          {
            id: `review-cross-column-${encodeURIComponent(first.ruleId)}`,
            label: "Review inconsistent rows",
            description:
              "Inspect both column values and confirm the intended business rule before correcting records.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        metadata: {
          ruleId: first.ruleId,
          ruleName: first.ruleName,
          operator: first.operator,
        },
        detectedAt: Date.now(),
      };

      issues.push(issue);
    }

    if (cancelled || signal?.aborted) {
      warnings.push(
        "Cross-column scan stopped because cancellation was requested.",
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

export const crossColumnConsistencyDetector =
  new CrossColumnConsistencyDetector();
