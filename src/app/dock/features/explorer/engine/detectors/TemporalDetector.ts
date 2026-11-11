import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
  Severity,
} from "../types";

interface TemporalFinding {
  rowIndex: number;
  columns: string[];
  values: Record<string, unknown>;
  reason: string;
  severity: Severity;
}

const MAX_EXAMPLES = 5;
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000;

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function parseTimestamp(value: unknown): number | null {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const timestamp = Date.parse(value.trim());
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isTemporalColumn(
  name: string,
  declaredType: string | undefined,
): boolean {
  if (declaredType === "date" || declaredType === "datetime") {
    return true;
  }

  const normalized = normalizeName(name);

  return (
    /date|datetime|timestamp|time/.test(normalized) ||
    /^(created|updated|modified|deleted|published|completed|started)at$/.test(
      normalized,
    ) ||
    /^(birth|start|end|due|expiry|expiration)date$/.test(normalized)
  );
}

function isHistoricalColumn(name: string): boolean {
  const normalized = normalizeName(name);

  return new Set([
    "dateofbirth",
    "birthdate",
    "createdat",
    "createddate",
    "creationdate",
    "updatedat",
    "updateddate",
    "modifiedat",
    "modifieddate",
    "deletedat",
    "deleteddate",
    "completedat",
    "completeddate",
    "publishedat",
    "publisheddate",
    "startedat",
    "starteddate",
  ]).has(normalized);
}

function findColumn(
  columns: string[],
  candidates: string[],
): string | undefined {
  const lookup = new Map(
    columns.map((column) => [normalizeName(column), column]),
  );

  for (const candidate of candidates) {
    const match = lookup.get(normalizeName(candidate));
    if (match) return match;
  }

  return undefined;
}

function severityRank(severity: Severity): number {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "warning":
      return 2;
    default:
      return 1;
  }
}

function strongestSeverity(findings: TemporalFinding[]): Severity {
  return findings.reduce<Severity>(
    (current, finding) =>
      severityRank(finding.severity) > severityRank(current)
        ? finding.severity
        : current,
    "info",
  );
}

function createIssue(
  detectorId: string,
  id: string,
  title: string,
  description: string,
  findings: TemporalFinding[],
): QualityIssue {
  const rowIndexes = [...new Set(findings.map((item) => item.rowIndex))];
  const columns = [...new Set(findings.flatMap((item) => item.columns))];

  return {
    id,
    detectorId,
    title,
    description,
    dimension: "timeliness",
    severity: strongestSeverity(findings),
    status: "open",
    columns,
    rowIndexes,
    affectedCount: rowIndexes.length,
    affectedCountUnit: "rows",
    evidence: [
      `${findings.length} temporal finding(s) detected.`,
      ...[...new Set(findings.map((item) => item.reason))].slice(0, 5),
    ],
    examples: findings.slice(0, MAX_EXAMPLES).map((item) => {
      const column = item.columns[0] ?? "";

      return {
        rowIndex: item.rowIndex,
        column,
        before: item.values[column] ?? null,
        reason: item.reason,
      };
    }),
    actions: [
      {
        id: `${id}-review`,
        label: "Review affected rows",
        kind: "review-rows",
        risk: "safe",
        enabled: true,
        description: "Inspect the original values before making changes.",
      },
    ],
    metadata: {
      findingCount: findings.length,
      affectedRows: rowIndexes.length,
    },
    detectedAt: Date.now(),
  };
}

export class TemporalDetector implements DataQualityDetector {
  readonly id = "temporal-consistency";
  readonly name = "Temporal Consistency Detector";
  readonly dimension = "timeliness" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];
    const grouped = new Map<string, TemporalFinding[]>();

    const schemaTypes = new Map(
      (schema?.columns ?? []).map((column) => [
        column.name,
        column.type,
      ]),
    );

    const temporalColumns = columns.filter((column) =>
      isTemporalColumn(column, schemaTypes.get(column)),
    );

    const addFinding = (
      key: string,
      finding: TemporalFinding,
    ): void => {
      const existing = grouped.get(key);

      if (existing) {
        existing.push(finding);
      } else {
        grouped.set(key, [finding]);
      }
    };

    const now = Date.now();

    for (const column of temporalColumns) {
      if (signal?.aborted) break;
      if (!isHistoricalColumn(column)) continue;

      rows.forEach((row, rowIndex) => {
        if (signal?.aborted || isMissing(row[column])) return;

        const timestamp = parseTimestamp(row[column]);
        if (
          timestamp === null ||
          timestamp <= now + FUTURE_TOLERANCE_MS
        ) {
          return;
        }

        addFinding(`future:${column}`, {
          rowIndex,
          columns: [column],
          values: { [column]: row[column] },
          reason: `The value in "${column}" is more than 24 hours in the future.`,
          severity: "warning",
        });
      });
    }

    const datePairs = [
      {
        start: ["start_date", "start_datetime", "start_time", "started_at"],
        end: ["end_date", "end_datetime", "end_time", "ended_at"],
        label: "start and end",
      },
      {
        start: ["created_at", "created_date", "creation_date"],
        end: ["updated_at", "updated_date", "modified_at"],
        label: "creation and update",
      },
      {
        start: ["check_in", "check_in_date", "check_in_time"],
        end: ["check_out", "check_out_date", "check_out_time"],
        label: "check-in and check-out",
      },
      {
        start: ["valid_from", "effective_from", "effective_start_date"],
        end: ["valid_to", "effective_to", "effective_end_date"],
        label: "validity period",
      },
    ];

    for (const pair of datePairs) {
      if (signal?.aborted) break;

      const startColumn = findColumn(columns, pair.start);
      const endColumn = findColumn(columns, pair.end);

      if (!startColumn || !endColumn || startColumn === endColumn) {
        continue;
      }

      rows.forEach((row, rowIndex) => {
        if (signal?.aborted) return;

        const startValue = row[startColumn];
        const endValue = row[endColumn];

        if (isMissing(startValue) || isMissing(endValue)) return;

        const startTimestamp = parseTimestamp(startValue);
        const endTimestamp = parseTimestamp(endValue);

        if (
          startTimestamp === null ||
          endTimestamp === null ||
          endTimestamp >= startTimestamp
        ) {
          return;
        }

        addFinding(`ordering:${startColumn}:${endColumn}`, {
          rowIndex,
          columns: [startColumn, endColumn],
          values: {
            [startColumn]: startValue,
            [endColumn]: endValue,
          },
          reason:
            `The ${pair.label} ordering is inconsistent: ` +
            `"${endColumn}" is earlier than "${startColumn}".`,
          severity: "high",
        });
      });
    }

    if (signal?.aborted) {
      warnings.push(
        "Temporal analysis stopped because cancellation was requested.",
      );
    }

    for (const [key, findings] of grouped) {
      if (findings.length === 0) continue;

      const isFuture = key.startsWith("future:");
      const first = findings[0];
      const id = isFuture
        ? `future-temporal-${first.columns[0]}`
        : `temporal-order-${first.columns.join("-")}`;

      issues.push(
        createIssue(
          this.id,
          id,
          isFuture
            ? `Unexpected future values in "${first.columns[0]}"`
            : `Inconsistent temporal ordering: ${first.columns.join(" / ")}`,
          isFuture
            ? `Historical timestamp values in "${first.columns[0]}" occur in the future.`
            : first.reason,
          findings,
        ),
      );
    }

    return {
      detectorId: this.id,
      issues,
      scannedRows: rows.length,
      scannedColumns: temporalColumns.length,
      durationMs: Date.now() - startedAt,
      warnings,
    };
  }
}

export const temporalDetector = new TemporalDetector();
