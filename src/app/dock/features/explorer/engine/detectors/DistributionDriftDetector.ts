import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function valueKey(value: unknown): string {
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

function displayValue(value: string): string {
  return value.length > 100 ? `${value.slice(0, 97)}...` : value;
}

export class DistributionDriftDetector implements DataQualityDetector {
  readonly id = "distribution-drift";
  readonly name = "Distribution Drift Detector";
  readonly dimension = "distribution" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, rules, signal } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    const driftRules = (rules ?? []).filter(
      (rule) => rule.enabled && rule.kind === "custom",
    );

    for (const rule of driftRules) {
      if (signal?.aborted) {
        warnings.push(
          "Distribution drift scan stopped because cancellation was requested.",
        );
        break;
      }

      const columnOption = rule.options.column;
      const column =
        typeof columnOption === "string"
          ? columnOption
          : rule.columns.length === 1
            ? rule.columns[0]
            : undefined;

      if (!column) {
        warnings.push(
          `Distribution rule "${rule.name}" must specify options.column or exactly one rule column.`,
        );
        continue;
      }

      if (!columns.includes(column)) {
        warnings.push(
          `Distribution rule "${rule.name}" references missing column "${column}".`,
        );
        continue;
      }

      const referenceValues = rule.options.referenceValues;

      if (
        !Array.isArray(referenceValues) ||
        referenceValues.length === 0
      ) {
        warnings.push(
          `Distribution rule "${rule.name}" requires a non-empty options.referenceValues array.`,
        );
        continue;
      }

      const configuredThreshold = rule.options.threshold;
      const threshold =
        typeof configuredThreshold === "number" &&
        Number.isFinite(configuredThreshold) &&
        configuredThreshold >= 0 &&
        configuredThreshold <= 1
          ? configuredThreshold
          : 0.2;

      if (
        configuredThreshold !== undefined &&
        (typeof configuredThreshold !== "number" ||
          !Number.isFinite(configuredThreshold) ||
          configuredThreshold < 0 ||
          configuredThreshold > 1)
      ) {
        warnings.push(
          `Distribution rule "${rule.name}" has an invalid threshold; the default 0.2 was used.`,
        );
      }

      const currentValues = rows
        .map((row) => row[column])
        .filter((value) => !isMissing(value));

      const reference = referenceValues.filter(
        (value) => !isMissing(value),
      );

      if (currentValues.length === 0 || reference.length === 0) {
        warnings.push(
          `Distribution rule "${rule.name}" skipped because the current or reference sample has no usable values.`,
        );
        continue;
      }

      const currentCounts = new Map<string, number>();
      const referenceCounts = new Map<string, number>();

      for (const value of currentValues) {
        const key = valueKey(value);
        currentCounts.set(key, (currentCounts.get(key) ?? 0) + 1);
      }

      for (const value of reference) {
        const key = valueKey(value);
        referenceCounts.set(key, (referenceCounts.get(key) ?? 0) + 1);
      }

      const categories = new Set([
        ...currentCounts.keys(),
        ...referenceCounts.keys(),
      ]);

      let distance = 0;

      for (const category of categories) {
        const currentFrequency =
          (currentCounts.get(category) ?? 0) / currentValues.length;
        const referenceFrequency =
          (referenceCounts.get(category) ?? 0) / reference.length;

        distance += Math.abs(currentFrequency - referenceFrequency);
      }

      // Total variation distance ranges from 0 (identical)
      // to 1 (completely disjoint distributions).
      distance /= 2;

      if (distance <= threshold) continue;

      const affectedIndexes = rows
        .map((row, rowIndex) => ({ row, rowIndex }))
        .filter(({ row }) => !isMissing(row[column]))
        .map(({ rowIndex }) => rowIndex);

      const topCategories = [...categories]
        .map((category) => ({
          category,
          current: (currentCounts.get(category) ?? 0) / currentValues.length,
          reference: (referenceCounts.get(category) ?? 0) / reference.length,
        }))
        .sort(
          (a, b) =>
            Math.abs(b.current - b.reference) -
            Math.abs(a.current - a.reference),
        )
        .slice(0, 10);

      const issue: QualityIssue = {
        id: `distribution-drift-${rule.id}`,
        detectorId: this.id,
        title: `Distribution drift in "${column}"`,
        description:
          `The categorical distribution differs from its reference by ${distance.toFixed(3)}, exceeding the configured threshold of ${threshold.toFixed(3)}.`,
        dimension: "distribution",
        severity: rule.severity,
        status: "open",
        columns: [column],
        rowIndexes: affectedIndexes,
        affectedCount: currentValues.length,
        affectedCountUnit: "values",
        evidence: [
          `Validation rule: ${rule.name}`,
          `Current usable observations: ${currentValues.length}`,
          `Reference observations: ${reference.length}`,
          `Total variation distance: ${distance.toFixed(4)}`,
          `Configured threshold: ${threshold.toFixed(4)}`,
        ],
        examples: topCategories.slice(0, 5).map((item) => ({
          rowIndex: affectedIndexes[0] ?? 0,
          column,
          before: displayValue(item.category),
          reason:
            `Current frequency: ${(item.current * 100).toFixed(1)}%; reference frequency: ${(item.reference * 100).toFixed(1)}%.`,
        })),
        actions: [
          {
            id: `review-distribution-${rule.id}`,
            label: "Review distribution drift",
            description:
              "Inspect the reference period and current category frequencies before deciding whether the change is expected.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        metadata: {
          ruleId: rule.id,
          ruleName: rule.name,
          distance,
          threshold,
          currentSampleSize: currentValues.length,
          referenceSampleSize: reference.length,
          topCategories,
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

export const distributionDriftDetector =
  new DistributionDriftDetector();
