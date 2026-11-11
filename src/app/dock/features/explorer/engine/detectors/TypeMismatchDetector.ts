import type {
  ColumnDataType,
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

type ValueSample = {
  rowIndex: number;
  value: unknown;
};

const BOOLEAN_TOKENS = new Set([
  "true",
  "false",
  "yes",
  "no",
  "y",
  "n",
  "t",
  "f",
  "1",
  "0",
]);

const CURRENCY_SYMBOLS = /[$€£¥₹]/;
const NUMERIC_TEXT_PATTERN =
  /^[+-]?(?:(?:\d{1,3}(?:,\d{3})+)|\d+)?(?:\.\d+)?%?$/;

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function normalizedToken(value: unknown): string {
  return String(value).trim().toLowerCase();
}

/**
 * Converts common human-readable numeric representations without changing
 * the source value. This is used for detection only, never for mutation.
 */
function parseNumericRepresentation(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  let candidate = value.trim();
  if (!candidate) return null;

  // Parentheses are a common accounting representation of negative values.
  const accountingNegative =
    candidate.startsWith("(") && candidate.endsWith(")");
  if (accountingNegative) {
    candidate = candidate.slice(1, -1).trim();
  }

  // Currency symbols and grouping separators are presentation, not digits.
  candidate = candidate.replace(/[$€£¥₹,\s]/g, "");
  const isPercent = candidate.endsWith("%");
  if (isPercent) candidate = candidate.slice(0, -1);

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(candidate)) return null;

  const parsed = Number(candidate);
  if (!Number.isFinite(parsed)) return null;

  const signed = accountingNegative ? -Math.abs(parsed) : parsed;
  return isPercent ? signed / 100 : signed;
}

function matchesType(value: unknown, type: ColumnDataType): boolean {
  if (isMissing(value)) return true;

  switch (type) {
    case "string":
      return typeof value === "string";

    case "number":
      return parseNumericRepresentation(value) !== null;

    case "integer": {
      const parsed = parseNumericRepresentation(value);
      return parsed !== null && Number.isInteger(parsed);
    }

    case "boolean":
      if (typeof value === "boolean") return true;
      if (typeof value === "number") return value === 0 || value === 1;
      if (typeof value === "string") {
        return BOOLEAN_TOKENS.has(normalizedToken(value));
      }
      return false;

    case "date":
    case "datetime":
      if (value instanceof Date) {
        return Number.isFinite(value.getTime());
      }

      if (typeof value !== "string" && typeof value !== "number") {
        return false;
      }

      if (typeof value === "string" && value.trim() === "") {
        return false;
      }

      return Number.isFinite(Date.parse(String(value)));

    case "unknown":
      return true;

    default:
      return true;
  }
}

function createIssue(args: {
  id: string;
  title: string;
  description: string;
  column: string;
  severity: "critical" | "high" | "warning" | "info";
  samples: ValueSample[];
  rowCount: number;
  evidence: string[];
  actionLabel: string;
  actionDescription: string;
}): QualityIssue {
  const {
    id,
    title,
    description,
    column,
    severity,
    samples,
    rowCount,
    evidence,
    actionLabel,
    actionDescription,
  } = args;

  return {
    id,
    detectorId: "type-mismatch",
    title,
    description,
    severity,
    dimension: "validity",
    status: "open",
    columns: [column],
    rowIndexes: samples.map((sample) => sample.rowIndex),
    affectedCount: samples.length,
    affectedCountUnit: "cells",
    examples: samples.slice(0, 5).map((sample) => ({
      rowIndex: sample.rowIndex,
      column,
      before: sample.value,
      reason: "Review the stored representation before changing its type.",
    })),
    evidence: [...evidence, `${rowCount} rows scanned`],
    actions: [
      {
        id: `review-${id}`,
        label: actionLabel,
        description: actionDescription,
        kind: "review-rows",
        risk: "safe",
        enabled: true,
      },
    ],
    detectedAt: Date.now(),
  };
}

/**
 * Finds columns whose string values consistently resemble another common
 * data type. These are review suggestions, not automatic schema changes.
 *
 * Conservative safeguards:
 * - Column names are not used to decide a type.
 * - Empty values are excluded from pattern analysis.
 * - Numeric-looking identifiers are not suggested as numeric when values
 *   contain leading zeroes.
 * - A pattern must be consistent across the non-empty values.
 */
function detectStringRepresentations(
  column: string,
  rows: DetectorContext["rows"],
): QualityIssue[] {
  const values: ValueSample[] = [];

  rows.forEach((row, rowIndex) => {
    const value = row[column];
    if (!isMissing(value)) values.push({ rowIndex, value });
  });

  if (values.length < 2) return [];

  const allStrings = values.every(
    (sample) => typeof sample.value === "string",
  );
  if (!allStrings) return [];

  const stringValues = values.map((sample) => String(sample.value).trim());
  const normalizedValues = stringValues.map((value) => value.toLowerCase());
  const uniqueTokens = new Set(normalizedValues);

  if (
    uniqueTokens.size > 0 &&
    [...uniqueTokens].every((token) => BOOLEAN_TOKENS.has(token)) &&
    uniqueTokens.size >= 2
  ) {
    return [
      createIssue({
        id: `type-representation-boolean-${column}`,
        title: `Boolean-like values stored as text in "${column}"`,
        description:
          `${values.length} non-empty values use consistent boolean-like ` +
          "tokens. Review the mapping before converting this column.",
        column,
        severity: "info",
        samples: values,
        rowCount: rows.length,
        evidence: [
          "Observed tokens: " +
            [...uniqueTokens].slice(0, 8).join(", "),
          "Possible logical type: boolean",
          "This is a representation suggestion, not a confirmed schema violation.",
        ],
        actionLabel: "Review boolean values",
        actionDescription:
          "Review the distinct tokens and choose their true/false mapping before conversion.",
      }),
    ];
  }

  const numericValues = values.map((sample) =>
    parseNumericRepresentation(sample.value),
  );
  const allNumeric = numericValues.every((value) => value !== null);

  // Strings made only of digits can be identifiers (e.g. postal codes,
  // account numbers, product codes). Do not suggest conversion for them.
  const hasLeadingZeroIdentifier = stringValues.some((value) =>
    /^[+-]?0\d+$/.test(value),
  );
  const hasNumericFormatting = stringValues.some(
    (value) =>
      CURRENCY_SYMBOLS.test(value) ||
      value.includes(",") ||
      value.includes("%") ||
      /^\(.*\)$/.test(value),
  );

  if (allNumeric && hasNumericFormatting && !hasLeadingZeroIdentifier) {
    const currencyLike = stringValues.some((value) =>
      CURRENCY_SYMBOLS.test(value),
    );
    const percentLike = stringValues.some((value) => value.includes("%"));

    return [
      createIssue({
        id: `type-representation-numeric-${column}`,
        title: `Formatted numeric values stored as text in "${column}"`,
        description:
          `${values.length} non-empty text values consistently resemble ` +
          "formatted numbers. Review locale, currency, and percentage conventions before conversion.",
        column,
        severity: "info",
        samples: values,
        rowCount: rows.length,
        evidence: [
          currencyLike
            ? "Currency symbols are present."
            : "Numeric grouping or percentage formatting is present.",
          percentLike
            ? "Percentage values were observed; confirm whether they should be stored as fractions or whole percentages."
            : "A numeric representation may be appropriate.",
          "This is a representation suggestion, not a confirmed schema violation.",
        ],
        actionLabel: "Review numeric values",
        actionDescription:
          "Inspect formatting and decimal conventions before converting the text values.",
      }),
    ];
  }

  return [];
}

export class TypeMismatchDetector implements DataQualityDetector {
  readonly id = "type-mismatch";
  readonly name = "Type Mismatch Detector";
  readonly description =
    "Checks declared data types and identifies common type-like text representations for review.";
  readonly dimension = "validity" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    const schemaByName = new Map(
      (schema?.columns ?? []).map((column) => [column.name, column]),
    );

    const schemaColumns = columns.filter((name) => schemaByName.has(name));

    if (!schema) {
      warnings.push(
        "Declared-type validation was skipped because no dataset schema was supplied. Value-pattern suggestions are still available.",
      );
    } else if (schemaColumns.length === 0) {
      warnings.push(
        "Declared-type validation was skipped because none of the scanned columns have declared types.",
      );
    }

    for (const column of columns) {
      const columnSchema = schemaByName.get(column);

      // Validate values against a declared schema where one exists.
      if (columnSchema && columnSchema.type !== "unknown") {
        const mismatches: ValueSample[] = [];

        rows.forEach((row, rowIndex) => {
          const value = row[column];

          // Nullability is handled by the completeness detector.
          if (isMissing(value)) return;

          if (!matchesType(value, columnSchema.type)) {
            mismatches.push({ rowIndex, value });
          }
        });

        if (mismatches.length > 0) {
          issues.push(
            createIssue({
              id: `type-mismatch-${column}`,
              title: `Unexpected values in "${column}"`,
              description:
                `${mismatches.length} values do not match the declared ` +
                `${columnSchema.type} type.`,
              column,
              severity: "warning",
              samples: mismatches,
              rowCount: rows.length,
              evidence: [
                `Expected type: ${columnSchema.type}`,
                `${mismatches.length} mismatched values`,
              ],
              actionLabel: "Review mismatched values",
              actionDescription:
                "Inspect the values before deciding how they should be converted.",
            }),
          );
        }
      }

      // Pattern detection is independent of schema and does not mutate it.
      // If a non-string type is already declared, the mismatch finding above
      // is the more useful explanation for values that violate that type.
      if (!columnSchema || columnSchema.type === "string" || columnSchema.type === "unknown") {
        issues.push(...detectStringRepresentations(column, rows));
      }
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: schema ? schemaColumns.length : columns.length,
      durationMs: Date.now() - startedAt,
      warnings,
    };
  }
}

export const typeMismatchDetector = new TypeMismatchDetector();
