import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
  Severity,
} from "../types";

type ParsedDate = {
  timestamp: number;
  format: string;
};

type DateFinding = {
  column: string;
  rowIndex: number;
  value: unknown;
  reason: string;
  severity: Severity;
  constraintKey: string;
  findingType: "invalid-date" | "ambiguous-date" | "date-boundary" | "mixed-format";
};

type DateParseResult =
  | { kind: "parsed"; value: ParsedDate }
  | { kind: "ambiguous"; formats: string[] }
  | { kind: "invalid" };

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function validCalendarDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
): number | null {
  if (
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  const date = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond),
  );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second
  ) {
    return null;
  }

  return date.getTime();
}

function parseStringDate(value: string): DateParseResult {
  const input = value.trim();

  // ISO calendar dates and ISO datetimes are deterministic.
  const isoMatch = input.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:?\d{2})?)?$/,
  );

  if (isoMatch) {
    const [, yearText, monthText, dayText, hourText, minuteText, secondText, msText] =
      isoMatch;
    const timestamp = validCalendarDate(
      Number(yearText),
      Number(monthText),
      Number(dayText),
      Number(hourText ?? 0),
      Number(minuteText ?? 0),
      Number(secondText ?? 0),
      Number((msText ?? "").padEnd(3, "0") || 0),
    );

    if (timestamp === null) return { kind: "invalid" };

    const hasTime = hourText !== undefined;
    const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input);
    if (hasZone) {
      const nativeTimestamp = Date.parse(input);
      if (!Number.isFinite(nativeTimestamp)) return { kind: "invalid" };
      return {
        kind: "parsed",
        value: {
          timestamp: nativeTimestamp,
          format: hasTime ? "iso-datetime-with-zone" : "iso-date",
        },
      };
    }

    return {
      kind: "parsed",
      value: {
        timestamp,
        format: hasTime ? "iso-datetime" : "iso-date",
      },
    };
  }

  // Slash and dot-separated numeric dates are only accepted when their
  // day/month order is unambiguous. Values such as 04/05/2025 need review.
  const numericMatch = input.match(
    /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );

  if (numericMatch) {
    const [, firstText, secondText, yearText, hourText, minuteText, secondTimeText] =
      numericMatch;
    const first = Number(firstText);
    const second = Number(secondText);
    let day: number;
    let month: number;
    let format: string;

    if (first > 12 && second <= 12) {
      day = first;
      month = second;
      format = input.includes("/") ? "dmy-slash" : "dmy-dot";
    } else if (second > 12 && first <= 12) {
      month = first;
      day = second;
      format = input.includes("/") ? "mdy-slash" : "mdy-dot";
    } else if (first <= 12 && second <= 12) {
      return {
        kind: "ambiguous",
        formats: input.includes("/")
          ? ["dmy-slash", "mdy-slash"]
          : ["dmy-dot", "mdy-dot"],
      };
    } else {
      return { kind: "invalid" };
    }

    const timestamp = validCalendarDate(
      Number(yearText),
      month,
      day,
      Number(hourText ?? 0),
      Number(minuteText ?? 0),
      Number(secondTimeText ?? 0),
    );

    if (timestamp === null) return { kind: "invalid" };

    return {
      kind: "parsed",
      value: {
        timestamp,
        format: hourText === undefined ? format : `${format}-datetime`,
      },
    };
  }

  // Month-name formats are deterministic when the runtime recognizes them.
  // Require a month name to avoid relying on permissive parsing of arbitrary text.
  if (/[a-z]/i.test(input)) {
    const hasMonthName =
      /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
        input,
      );

    if (hasMonthName) {
      const timestamp = Date.parse(input);
      if (Number.isFinite(timestamp)) {
        return {
          kind: "parsed",
          value: {
            timestamp,
            format: /:\d{2}/.test(input)
              ? "month-name-datetime"
              : "month-name-date",
          },
        };
      }
    }
  }

  return { kind: "invalid" };
}

function parseDate(
  value: unknown,
  allowNumericTimestamp: boolean,
): DateParseResult {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp)
      ? {
          kind: "parsed",
          value: { timestamp, format: "date-object" },
        }
      : { kind: "invalid" };
  }

  if (typeof value === "number") {
    if (!allowNumericTimestamp || !Number.isFinite(value)) {
      return { kind: "invalid" };
    }

    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp)
      ? {
          kind: "parsed",
          value: { timestamp, format: "numeric-timestamp-ms" },
        }
      : { kind: "invalid" };
  }

  if (typeof value === "string" && value.trim() !== "") {
    return parseStringDate(value);
  }

  return { kind: "invalid" };
}

function highestSeverity(findings: DateFinding[]): Severity {
  if (findings.some((finding) => finding.severity === "critical")) {
    return "critical";
  }
  if (findings.some((finding) => finding.severity === "high")) {
    return "high";
  }
  if (findings.some((finding) => finding.severity === "warning")) {
    return "warning";
  }
  return "info";
}

function createIssue(
  findings: DateFinding[],
  issueIndex: number,
): QualityIssue {
  const first = findings[0];
  const rowIndexes = [...new Set(findings.map((finding) => finding.rowIndex))];
  const isAmbiguous = first.findingType === "ambiguous-date";
  const isMixed = first.findingType === "mixed-format";
  const isInvalid = first.findingType === "invalid-date";

  return {
    id: `date-time-${first.findingType}-${first.column}-${issueIndex + 1}`,
    detectorId: "date-time-validation",
    title: isInvalid
      ? `Invalid dates in "${first.column}"`
      : isAmbiguous
        ? `Ambiguous date values in "${first.column}"`
        : isMixed
          ? `Mixed date formats in "${first.column}"`
          : `Date constraint violation in "${first.column}"`,
    description: first.reason,
    severity: highestSeverity(findings),
    dimension: "validity",
    status: isAmbiguous || isMixed ? "needs-review" : "open",
    columns: [first.column],
    rowIndexes,
    affectedCount: findings.length,
    affectedCountUnit: "cells",
    examples: findings.slice(0, 5).map((finding) => ({
      rowIndex: finding.rowIndex,
      column: finding.column,
      before: finding.value,
      reason: finding.reason,
    })),
    evidence: [
      `Column: ${first.column}`,
      `Affected cells: ${findings.length}`,
      `Finding: ${first.reason}`,
      ...findings
        .slice(0, 5)
        .map(
          (finding) =>
            `Row ${finding.rowIndex + 1}: ${String(finding.value)}`,
        ),
    ],
    actions: [
      {
        id: `review-date-${first.column}-${issueIndex + 1}`,
        label: "Review date values",
        description:
          "Inspect the original values and confirm the intended date format before changing data.",
        kind: "review-rows",
        risk: "safe",
        enabled: true,
      },
      ...(isInvalid
        ? [
            {
              id: `plan-date-conversion-${first.column}-${issueIndex + 1}`,
              label: "Plan date conversion",
              description:
                "Prepare a date-conversion plan for review; this detector does not modify values.",
              kind: "convert-date" as const,
              risk: "review" as const,
              enabled: true,
            },
          ]
        : []),
    ],
    metadata: {
      findingType: first.findingType,
      constraintKeys: [...new Set(findings.map((finding) => finding.constraintKey))],
    },
    detectedAt: Date.now(),
  };
}

export class DateTimeDetector implements DataQualityDetector {
  readonly id = "date-time-validation";
  readonly name = "Date and Time Detector";
  readonly description =
    "Validates declared date columns, identifies ambiguous and mixed date formats, and checks explicitly configured date boundaries.";
  readonly dimension = "validity" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema, rules, signal } = context;
    const warnings: string[] = [];
    const findings: DateFinding[] = [];
    const schemaColumns = new Map(
      (schema?.columns ?? []).map((column) => [column.name, column]),
    );

    const explicitlyDeclaredDateColumns = new Set(
      columns.filter((column) => {
        const declaredType = schemaColumns.get(column)?.type;
        return declaredType === "date" || declaredType === "datetime";
      }),
    );

    for (const rule of rules ?? []) {
      if (!rule.enabled || rule.kind !== "type") continue;
      const expectedType = String(rule.options.type ?? "").toLowerCase();
      if (expectedType !== "date" && expectedType !== "datetime") continue;
      rule.columns.forEach((column) => {
        if (columns.includes(column)) {
          explicitlyDeclaredDateColumns.add(column);
        }
      });
    }

    // Also inspect string-like columns for a strong, repeated date signal.
    // This is a review suggestion only; it does not change the schema.
    const candidateDateColumns = new Set<string>();
    for (const column of columns) {
      if (explicitlyDeclaredDateColumns.has(column)) continue;
      if (schemaColumns.get(column)?.type !== undefined &&
          schemaColumns.get(column)?.type !== "string" &&
          schemaColumns.get(column)?.type !== "unknown") {
        continue;
      }

      let nonMissingCount = 0;
      let parsedCount = 0;
      let dateLikeCount = 0;

      for (const row of rows) {
        if (signal?.aborted) break;
        const value = row[column];
        if (isMissing(value)) continue;
        nonMissingCount += 1;
        if (typeof value !== "string") continue;

        const parsed = parseStringDate(value);
        if (parsed.kind === "parsed") {
          parsedCount += 1;
          dateLikeCount += 1;
        } else if (
          parsed.kind === "ambiguous" ||
          /^\s*\d{1,4}[/. -]\d{1,2}[/. -]\d{2,4}/.test(value)
        ) {
          dateLikeCount += 1;
        }
      }

      if (
        nonMissingCount >= 2 &&
        dateLikeCount >= 2 &&
        dateLikeCount / nonMissingCount >= 0.7 &&
        parsedCount / nonMissingCount >= 0.5
      ) {
        candidateDateColumns.add(column);
      }
    }

    const dateColumns = new Set([
      ...explicitlyDeclaredDateColumns,
      ...candidateDateColumns,
    ]);

    for (const column of dateColumns) {
      if (signal?.aborted) {
        warnings.push(
          "Date validation stopped because cancellation was requested.",
        );
        break;
      }

      const isDeclaredDate = explicitlyDeclaredDateColumns.has(column);
      const allowNumericTimestamp = isDeclaredDate;
      const columnSchema = schemaColumns.get(column);
      const enabledRules = (rules ?? []).filter(
        (rule) =>
          rule.enabled &&
          rule.columns.includes(column) &&
          (rule.kind === "range" || rule.kind === "type"),
      );

      const minDate =
        typeof columnSchema?.min === "number" &&
        Number.isFinite(columnSchema.min)
          ? columnSchema.min
          : null;
      const maxDate =
        typeof columnSchema?.max === "number" &&
        Number.isFinite(columnSchema.max)
          ? columnSchema.max
          : null;

      const formatRows = new Map<string, number[]>();
      const invalidFindings: DateFinding[] = [];
      const ambiguousFindings: DateFinding[] = [];
      const boundaryFindings: DateFinding[] = [];

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        if (signal?.aborted) break;

        const value = rows[rowIndex]?.[column];
        if (isMissing(value)) continue;

        const parsed = parseDate(value, allowNumericTimestamp);

        if (parsed.kind === "invalid") {
          // For a candidate column, a non-date value is not automatically
          // called invalid. It is simply evidence against the date suggestion.
          if (isDeclaredDate) {
            invalidFindings.push({
              column,
              rowIndex,
              value,
              reason: "Value cannot be parsed as a valid date or datetime.",
              severity: "high",
              constraintKey: "invalid-date",
              findingType: "invalid-date",
            });
          }
          continue;
        }

        if (parsed.kind === "ambiguous") {
          ambiguousFindings.push({
            column,
            rowIndex,
            value,
            reason:
              "Date value has more than one plausible day/month interpretation; confirm the source format before conversion.",
            severity: "warning",
            constraintKey: "ambiguous-date",
            findingType: "ambiguous-date",
          });
          continue;
        }

        const formatRowsForValue = formatRows.get(parsed.value.format);
        if (formatRowsForValue) {
          formatRowsForValue.push(rowIndex);
        } else {
          formatRows.set(parsed.value.format, [rowIndex]);
        }

        const timestamp = parsed.value.timestamp;

        if (minDate !== null && timestamp < minDate) {
          boundaryFindings.push({
            column,
            rowIndex,
            value,
            reason: `Date is earlier than the configured minimum (${new Date(minDate).toISOString()}).`,
            severity: "warning",
            constraintKey: `minimum:${minDate}`,
            findingType: "date-boundary",
          });
        }

        if (maxDate !== null && timestamp > maxDate) {
          boundaryFindings.push({
            column,
            rowIndex,
            value,
            reason: `Date is later than the configured maximum (${new Date(maxDate).toISOString()}).`,
            severity: "warning",
            constraintKey: `maximum:${maxDate}`,
            findingType: "date-boundary",
          });
        }

        for (const rule of enabledRules) {
          if (rule.kind !== "range") continue;

          const optionMin = rule.options.min;
          const optionMax = rule.options.max;
          const ruleMin =
            typeof optionMin === "string" || typeof optionMin === "number"
              ? parseDate(optionMin, true)
              : { kind: "invalid" as const };
          const ruleMax =
            typeof optionMax === "string" || typeof optionMax === "number"
              ? parseDate(optionMax, true)
              : { kind: "invalid" as const };

          if (
            ruleMin.kind === "parsed" &&
            timestamp < ruleMin.value.timestamp
          ) {
            boundaryFindings.push({
              column,
              rowIndex,
              value,
              reason: `Date violates validation rule "${rule.name}": value is before the allowed minimum.`,
              severity: rule.severity,
              constraintKey: `rule-minimum:${rule.id}`,
              findingType: "date-boundary",
            });
          }

          if (
            ruleMax.kind === "parsed" &&
            timestamp > ruleMax.value.timestamp
          ) {
            boundaryFindings.push({
              column,
              rowIndex,
              value,
              reason: `Date violates validation rule "${rule.name}": value is after the allowed maximum.`,
              severity: rule.severity,
              constraintKey: `rule-maximum:${rule.id}`,
              findingType: "date-boundary",
            });
          }
        }
      }

      const groupedFormatEntries = [...formatRows.entries()].filter(
        ([, rowIndexes]) => rowIndexes.length > 0,
      );

      if (groupedFormatEntries.length > 1) {
        const mixedRows = groupedFormatEntries.flatMap(([, indexes]) => indexes);
        const formatSummary = groupedFormatEntries
          .map(([format, indexes]) => `${format}: ${indexes.length} values`)
          .join("; ");

        findings.push({
          column,
          rowIndex: mixedRows[0] ?? 0,
          value: rows[mixedRows[0]]?.[column],
          reason: `This column contains multiple recognized date formats (${formatSummary}). Confirm whether the formats are intentional before standardizing them.`,
          severity: "warning",
          constraintKey: "mixed-date-formats",
          findingType: "mixed-format",
        });
      }

      findings.push(
        ...invalidFindings,
        ...ambiguousFindings,
        ...boundaryFindings,
      );
    }

    if (signal?.aborted) {
      warnings.push(
        "Date validation stopped because cancellation was requested.",
      );
    }

    const groupedFindings = new Map<string, DateFinding[]>();
    for (const finding of findings) {
      const key = `${finding.column}|${finding.findingType}|${finding.reason}`;
      const group = groupedFindings.get(key);
      if (group) {
        group.push(finding);
      } else {
        groupedFindings.set(key, [finding]);
      }
    }

    const issues = [...groupedFindings.values()].map((group, index) =>
      createIssue(group, index),
    );

    if (candidateDateColumns.size > 0) {
      warnings.push(
        `Date-like values were detected in ${candidateDateColumns.size} column(s) without a confirmed date type. These are review suggestions, not schema changes.`,
      );
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: dateColumns.size,
      durationMs: Date.now() - startedAt,
      warnings,
    };
  }
}

export const dateTimeDetector = new DateTimeDetector();
