import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityDimension,
  QualityIssue,
  Severity,
  ValidationRule,
} from "../types";

type RuleEvaluation = {
  failed: boolean;
  reason?: string;
  configurationError?: boolean;
  rowIndexes: number[];
  examples: QualityIssue["examples"];
  affectedCount: number;
  affectedCountUnit: QualityIssue["affectedCountUnit"];
  cancelled?: boolean;
};

type ComparisonResult = boolean | null;

const MISSING = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const asNumber = (value: unknown): number | null => {
  if (isFiniteNumber(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return null;

  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeType = (value: unknown): string => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "invalid-date" : "date";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? "integer" : "number";
  }

  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") return "string";
  return value === null || value === undefined ? "missing" : "unknown";
};

function isValidDateValue(value: unknown): boolean {
  if (value instanceof Date) return Number.isFinite(value.getTime());

  if (typeof value !== "string" || value.trim() === "") return false;

  const text = value.trim();

  // Require an explicit year-first or unambiguous month-name representation.
  // This avoids silently accepting ambiguous values such as 04/05/2025.
  const yearFirst =
    /^\d{4}-\d{2}-\d{2}(?:[Tt ][0-9:.+-]+(?:[Zz]|[+-]\d{2}:?\d{2})?)?$/.test(
      text,
    );

  const monthName =
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text);

  if (!yearFirst && !monthName) return false;

  const timestamp = Date.parse(text);
  if (!Number.isFinite(timestamp)) return false;

  if (yearFirst) {
    const datePart = text.slice(0, 10);
    const [year, month, day] = datePart.split("-").map(Number);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return false;
    }
  }

  return true;
}

const matchesType = (value: unknown, expected: unknown): boolean => {
  if (MISSING(value)) return true;
  if (typeof expected !== "string") return false;

  const type = expected.trim().toLowerCase();
  const actual = normalizeType(value);

  switch (type) {
    case "string":
      return actual === "string";
    case "number":
      return asNumber(value) !== null;
    case "integer": {
      const number = asNumber(value);
      return number !== null && Number.isInteger(number);
    }
    case "boolean":
      return actual === "boolean";
    case "date":
    case "datetime":
      return isValidDateValue(value);
    default:
      return false;
  }
};

/**
 * Deterministic, type-aware value serialization used for uniqueness,
 * allowed-value and foreign-key checks.
 */
function stableValueKey(
  value: unknown,
  ancestors: Set<object> = new Set<object>(),
): string {
  if (value === null) return "null:";
  if (value === undefined) return "undefined:";

  if (value instanceof Date) {
    return Number.isFinite(value.getTime())
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
      if (ancestors.has(objectValue)) return "object:[Circular]";

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

const compareValues = (
  left: unknown,
  operator: unknown,
  right: unknown,
): ComparisonResult => {
  if (typeof operator !== "string") return null;

  const op = operator.trim().toLowerCase();
  const a = asNumber(left);
  const b = asNumber(right);

  switch (op) {
    case "equals":
    case "equal":
    case "===":
      return stableValueKey(left) === stableValueKey(right);

    case "not-equals":
    case "not_equals":
    case "!=":
    case "!==":
      return stableValueKey(left) !== stableValueKey(right);

    case "greater-than":
    case "greater_than":
    case ">":
      return a !== null && b !== null ? a > b : null;

    case "greater-than-or-equal":
    case "greater_than_or_equal":
    case ">=":
      return a !== null && b !== null ? a >= b : null;

    case "less-than":
    case "less_than":
    case "<":
      return a !== null && b !== null ? a < b : null;

    case "less-than-or-equal":
    case "less_than_or_equal":
    case "<=":
      return a !== null && b !== null ? a <= b : null;

    default:
      return null;
  }
};

function isComparisonOperator(operator: unknown): boolean {
  if (typeof operator !== "string") return false;
  return [
    "equals",
    "equal",
    "===",
    "not-equals",
    "not_equals",
    "!=",
    "!==",
    "greater-than",
    "greater_than",
    ">",
    "greater-than-or-equal",
    "greater_than_or_equal",
    ">=",
    "less-than",
    "less_than",
    "<",
    "less-than-or-equal",
    "less_than_or_equal",
    "<=",
  ].includes(operator.trim().toLowerCase());
}

function createEvaluation(
  rowIndexes: number[],
  examples: QualityIssue["examples"],
  affectedCount: number,
  affectedCountUnit: QualityIssue["affectedCountUnit"],
  reason?: string,
): RuleEvaluation {
  return {
    failed: affectedCount > 0,
    reason,
    rowIndexes,
    examples,
    affectedCount,
    affectedCountUnit,
  };
}

function configurationFailure(
  reason: string,
  affectedCountUnit: QualityIssue["affectedCountUnit"] = "rows",
): RuleEvaluation {
  return {
    failed: false,
    reason,
    configurationError: true,
    rowIndexes: [],
    examples: [],
    affectedCount: 0,
    affectedCountUnit,
  };
}

function evaluateRule(
  rule: ValidationRule,
  context: DetectorContext,
): RuleEvaluation {
  const { rows, signal } = context;
  const column = rule.columns[0];
  const options = rule.options ?? {};
  const rowIndexes: number[] = [];
  const examples: QualityIssue["examples"] = [];
  let affectedCount = 0;
  let affectedCountUnit: QualityIssue["affectedCountUnit"] = "rows";

  const addFailure = (
    rowIndex: number,
    columnName: string,
    value: unknown,
    reason: string,
  ) => {
    rowIndexes.push(rowIndex);
    affectedCount += 1;

    if (examples.length < 5) {
      examples.push({
        rowIndex,
        column: columnName,
        before: value,
        reason,
      });
    }
  };

  const fail = (reason: string): RuleEvaluation =>
    configurationFailure(reason, affectedCountUnit);

  if (rule.kind !== "custom" && rule.columns.length === 0) {
    return fail("The rule requires at least one column.");
  }

  for (const name of rule.columns) {
    if (!context.columns.includes(name)) {
      return fail(`Configured column "${name}" does not exist.`);
    }
  }

  const wasCancelled = (): boolean => Boolean(signal?.aborted);

  switch (rule.kind) {
    case "not-null": {
      affectedCountUnit = "cells";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "cells"), cancelled: true };

        const value = rows[i]?.[column];
        if (MISSING(value)) {
          addFailure(i, column, value, "Required value is missing.");
        }
      }
      break;
    }

    case "unique": {
      affectedCountUnit = "values";
      const firstSeen = new Map<string, number>();

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "values"), cancelled: true };

        const value = rows[i]?.[column];
        if (MISSING(value)) continue;

        const key = stableValueKey(value);

        if (firstSeen.has(key)) {
          addFailure(i, column, value, "Value duplicates an earlier row.");
        } else {
          firstSeen.set(key, i);
        }
      }
      break;
    }

    case "type": {
      const expected = options.expectedType ?? options.type;

      if (typeof expected !== "string" || !expected.trim()) {
        return fail(
          "The type rule requires options.expectedType or options.type.",
        );
      }

      const supportedTypes = [
        "string",
        "number",
        "integer",
        "boolean",
        "date",
        "datetime",
      ];

      if (!supportedTypes.includes(expected.trim().toLowerCase())) {
        return fail(`Unsupported expected type "${expected}".`);
      }

      affectedCountUnit = "cells";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "cells"), cancelled: true };

        const value = rows[i]?.[column];
        if (!MISSING(value) && !matchesType(value, expected)) {
          addFailure(i, column, value, `Expected type "${expected}".`);
        }
      }
      break;
    }

    case "range": {
      const min = options.min;
      const max = options.max;

      if (min === undefined && max === undefined) {
        return fail("The range rule requires a min or max option.");
      }

      const lower = min === undefined ? null : asNumber(min);
      const upper = max === undefined ? null : asNumber(max);

      if (
        (min !== undefined && lower === null) ||
        (max !== undefined && upper === null) ||
        (lower !== null && upper !== null && lower > upper)
      ) {
        return fail("Range bounds must be valid numbers with min <= max.");
      }

      affectedCountUnit = "cells";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "cells"), cancelled: true };

        const value = rows[i]?.[column];
        if (MISSING(value)) continue;

        const number = asNumber(value);

        if (number === null) {
          addFailure(i, column, value, "Value is not numeric.");
        } else if (
          (lower !== null && number < lower) ||
          (upper !== null && number > upper)
        ) {
          addFailure(
            i,
            column,
            value,
            "Value falls outside the configured range.",
          );
        }
      }
      break;
    }

    case "allowed-values": {
      const allowed =
        options.allowedValues ??
        context.schema?.columns.find((item) => item.name === column)
          ?.allowedValues;

      if (!Array.isArray(allowed) || allowed.length === 0) {
        return fail("The rule requires a non-empty allowedValues array.");
      }

      const allowedKeys = new Set(allowed.map((item) => stableValueKey(item)));
      affectedCountUnit = "cells";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "cells"), cancelled: true };

        const value = rows[i]?.[column];

        if (!MISSING(value) && !allowedKeys.has(stableValueKey(value))) {
          addFailure(
            i,
            column,
            value,
            "Value is not in the allowed-values list.",
          );
        }
      }
      break;
    }

    case "regex": {
      if (typeof options.pattern !== "string" || !options.pattern) {
        return fail("The regex rule requires a non-empty pattern string.");
      }

      let expression: RegExp;

      try {
        expression = new RegExp(
          options.pattern,
          typeof options.flags === "string" ? options.flags : "",
        );
      } catch (error) {
        return fail(
          `Invalid regular expression: ${
            error instanceof Error ? error.message : "unknown error"
          }`,
        );
      }

      affectedCountUnit = "cells";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "cells"), cancelled: true };

        const value = rows[i]?.[column];
        if (MISSING(value)) continue;

        expression.lastIndex = 0;

        if (typeof value !== "string" || !expression.test(value)) {
          addFailure(
            i,
            column,
            value,
            "Value does not match the configured pattern.",
          );
        }
      }
      break;
    }

    case "column-comparison": {
      if (rule.columns.length < 2) {
        return fail("Column comparison requires at least two columns.");
      }

      const operator = options.operator;

      if (!isComparisonOperator(operator)) {
        return fail(
          `Unsupported or missing column-comparison operator "${String(operator)}".`,
        );
      }

      const rightColumn = rule.columns[1];
      let incompatibleValues = 0;
      affectedCountUnit = "rows";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "rows"), cancelled: true };

        const leftValue = rows[i]?.[column];
        const rightValue = rows[i]?.[rightColumn];

        if (MISSING(leftValue) || MISSING(rightValue)) continue;

        const result = compareValues(leftValue, operator, rightValue);

        if (result === null) {
          incompatibleValues += 1;
          continue;
        }

        if (!result) {
          addFailure(
            i,
            column,
            leftValue,
            `${column} ${operator} ${rightColumn} condition failed.`,
          );
        }
      }

      if (incompatibleValues > 0) {
        return configurationFailure(
          `Column comparison could not evaluate ${incompatibleValues} non-missing row(s) because the values were incompatible with operator "${operator}".`,
          "rows",
        );
      }
      break;
    }

    case "foreign-key": {
      const referenceValues = options.referenceValues;

      if (!Array.isArray(referenceValues)) {
        return fail("Foreign-key rules require options.referenceValues.");
      }

      const referenceKeys = new Set(
        referenceValues.map((item) => stableValueKey(item)),
      );
      affectedCountUnit = "values";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "values"), cancelled: true };

        const value = rows[i]?.[column];

        if (!MISSING(value) && !referenceKeys.has(stableValueKey(value))) {
          addFailure(
            i,
            column,
            value,
            "Value was not found in the reference values.",
          );
        }
      }
      break;
    }

    case "custom": {
      const targetColumn =
        typeof options.column === "string" ? options.column : column;

      if (!targetColumn || !context.columns.includes(targetColumn)) {
        return fail("Custom rules require a valid options.column or rule column.");
      }

      const operator = options.operator;
      const expected = options.value;

      if (typeof operator !== "string" || expected === undefined) {
        return fail(
          "Supported custom rules require options.operator and options.value.",
        );
      }

      if (!isComparisonOperator(operator)) {
        return fail(`Unsupported custom-rule operator "${operator}".`);
      }

      affectedCountUnit = "cells";

      for (let i = 0; i < rows.length; i += 1) {
        if (wasCancelled()) return { ...createEvaluation([], [], 0, "cells"), cancelled: true };

        const value = rows[i]?.[targetColumn];
        if (MISSING(value)) continue;

        const result = compareValues(value, operator, expected);

        if (result === null) {
          return configurationFailure(
            `Custom rule could not evaluate a non-missing value with operator "${operator}" because the values were incompatible.`,
            "cells",
          );
        }

        if (!result) {
          addFailure(i, targetColumn, value, "Custom rule condition failed.");
        }
      }
      break;
    }

    default: {
      const exhaustive: never = rule.kind;
      return fail(`Unsupported validation rule: ${String(exhaustive)}.`);
    }
  }

  return createEvaluation(
    rowIndexes,
    examples,
    affectedCount,
    affectedCountUnit,
    affectedCount > 0
      ? `${affectedCount} value(s) failed the "${rule.name}" rule.`
      : undefined,
  );
}

function dimensionForRule(kind: ValidationRule["kind"]): QualityDimension {
  switch (kind) {
    case "not-null":
      return "completeness";
    case "unique":
      return "uniqueness";
    case "foreign-key":
      return "integrity";
    case "column-comparison":
      return "consistency";
    case "range":
    case "type":
    case "allowed-values":
    case "regex":
    case "custom":
      return "validity";
  }
}

function isValidSeverity(value: unknown): value is Severity {
  return (
    value === "critical" ||
    value === "high" ||
    value === "warning" ||
    value === "info"
  );
}

export class RuleEvaluator implements DataQualityDetector {
  readonly id = "rule-evaluator";
  readonly name = "Validation rule evaluator";
  readonly dimension: QualityDimension = "validity";

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    const rules = (context.rules ?? []).filter((rule) => rule.enabled);
    let cancelled = false;

    for (const rule of rules) {
      if (context.signal?.aborted) {
        cancelled = true;
        break;
      }

      if (!isValidSeverity(rule.severity)) {
        warnings.push(
          `Rule "${rule.name}" was skipped because its severity is invalid.`,
        );
        continue;
      }

      let evaluation: RuleEvaluation;

      try {
        evaluation = evaluateRule(rule, context);
      } catch (error) {
        warnings.push(
          `Rule "${rule.name}" failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
        continue;
      }

      if (evaluation.cancelled || context.signal?.aborted) {
        cancelled = true;
        break;
      }

      if (evaluation.configurationError) {
        warnings.push(
          `Rule "${rule.name}": ${evaluation.reason ?? "Invalid rule configuration."}`,
        );
        continue;
      }

      if (!evaluation.failed) continue;

      issues.push({
        id: `rule:${encodeURIComponent(rule.id)}`,
        detectorId: this.id,
        title: rule.name,
        description:
          rule.description ??
          evaluation.reason ??
          `Validation rule "${rule.name}" failed.`,
        dimension: dimensionForRule(rule.kind),
        severity: rule.severity,
        status: "open",
        columns: [...rule.columns],
        rowIndexes: [...new Set(evaluation.rowIndexes)],
        affectedCount: evaluation.affectedCount,
        affectedCountUnit: evaluation.affectedCountUnit,
        evidence: [
          `Rule kind: ${rule.kind}.`,
          evaluation.reason ?? "One or more values failed validation.",
        ],
        examples: evaluation.examples,
        actions: [],
        metadata: {
          ruleId: rule.id,
          ruleKind: rule.kind,
        },
        detectedAt: Date.now(),
      });
    }

    if (cancelled || context.signal?.aborted) {
      warnings.push("Rule evaluation stopped because cancellation was requested.");
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: context.rows.length,
      scannedColumns: context.columns.length,
      durationMs: Math.max(0, Date.now() - startedAt),
      warnings: [...new Set(warnings)],
    };
  }
}

export const ruleEvaluator = new RuleEvaluator();
