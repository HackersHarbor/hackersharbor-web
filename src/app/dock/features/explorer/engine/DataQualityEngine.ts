import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  EngineScanOptions,
  EngineScanResult,
  IssueStatus,
  QualityDimension,
  QualityDimensionScore,
  QualityIssue,
  QualitySummary,
} from "./types";

const DIMENSIONS: QualityDimension[] = [
  "completeness",
  "validity",
  "uniqueness",
  "consistency",
  "accuracy",
  "integrity",
  "timeliness",
  "schema",
  "distribution",
];

const DEFAULT_MAX_EXAMPLES = 5;

export class DataQualityEngine {
  private readonly detectors = new Map<string, DataQualityDetector>();

  register(detector: DataQualityDetector): void {
    if (!detector.id.trim()) {
      throw new Error("A detector must have a non-empty ID.");
    }

    if (this.detectors.has(detector.id)) {
      throw new Error(`Detector "${detector.id}" is already registered.`);
    }

    this.detectors.set(detector.id, detector);
  }

  registerMany(detectors: DataQualityDetector[]): void {
    // Validate the full batch before mutating the registry.
    const batchIds = new Set<string>();

    for (const detector of detectors) {
      if (!detector.id.trim()) {
        throw new Error("A detector must have a non-empty ID.");
      }

      if (this.detectors.has(detector.id) || batchIds.has(detector.id)) {
        throw new Error(`Duplicate detector ID "${detector.id}".`);
      }

      batchIds.add(detector.id);
    }

    for (const detector of detectors) {
      this.detectors.set(detector.id, detector);
    }
  }

  unregister(detectorId: string): boolean {
    return this.detectors.delete(detectorId);
  }

  listDetectors(): Array<{
    id: string;
    name: string;
    dimension: QualityDimension;
  }> {
    return Array.from(this.detectors.values()).map((detector) => ({
      id: detector.id,
      name: detector.name,
      dimension: detector.dimension,
    }));
  }

  scan(
    context: DetectorContext,
    options: EngineScanOptions = {},
  ): EngineScanResult {
    const startedAt = Date.now();
    const scannedAt = startedAt;
    const maxExamples = Math.max(
      0,
      Math.floor(options.maxExamplesPerIssue ?? DEFAULT_MAX_EXAMPLES),
    );

    const enabledIds = options.enabledDetectorIds
      ? new Set(options.enabledDetectorIds)
      : null;

    const detectorResults: DetectorResult[] = [];
    const warnings: string[] = [];
    const issues: QualityIssue[] = [];

    const detectors = Array.from(this.detectors.values()).filter(
      (detector) => !enabledIds || enabledIds.has(detector.id),
    );

    for (const detector of detectors) {
      if (options.signal?.aborted || context.signal?.aborted) {
        throw new DOMException("Data-quality scan cancelled.", "AbortError");
      }

      const detectorStartedAt = Date.now();

      try {
        const result = detector.detect({
          ...context,
          signal: options.signal ?? context.signal,
        });

        if (result.detectorId !== detector.id) {
          throw new Error(
            `Detector "${detector.id}" returned result ID "${result.detectorId}".`,
          );
        }

        const normalizedResult: DetectorResult = {
          ...result,
          durationMs: Math.max(0, Date.now() - detectorStartedAt),
          issues: result.issues
            .filter(
              (issue) =>
                options.includeInfo !== false || issue.severity !== "info",
            )
            .map((issue) => this.normalizeIssue(issue, detector.id, maxExamples)),
          warnings: [...result.warnings],
        };

        detectorResults.push(normalizedResult);
        issues.push(...normalizedResult.issues);

        for (const warning of normalizedResult.warnings) {
          warnings.push(`${detector.name}: ${warning}`);
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          throw error;
        }

        const message =
          error instanceof Error ? error.message : "Unknown detector error";

        warnings.push(`Detector "${detector.name}" failed: ${message}`);
      }
    }

    if (options.signal?.aborted || context.signal?.aborted) {
      throw new DOMException("Data-quality scan cancelled.", "AbortError");
    }

    const uniqueIssues = this.deduplicateIssues(issues);
    const summary = this.createSummary(
      context.rows.length,
      context.columns.length,
      detectorResults,
      uniqueIssues,
      scannedAt,
      warnings,
    );

    return {
      datasetId: context.datasetId,
      issues: uniqueIssues,
      summary,
      detectorResults,
      durationMs: Math.max(0, Date.now() - startedAt),
      scannedAt,
    };
  }

  private normalizeIssue(
    issue: QualityIssue,
    detectorId: string,
    maxExamples: number,
  ): QualityIssue {
    return {
      ...issue,
      detectorId,
      status: issue.status ?? ("open" as IssueStatus),
      columns: [...new Set(issue.columns ?? [])],
      rowIndexes: [...new Set(issue.rowIndexes ?? [])].filter(
        (index) => Number.isInteger(index) && index >= 0,
      ),
      evidence: issue.evidence ?? [],
      examples: (issue.examples ?? []).slice(0, maxExamples),
      actions: issue.actions ?? [],
      detectedAt: issue.detectedAt || Date.now(),
    };
  }

  private deduplicateIssues(issues: QualityIssue[]): QualityIssue[] {
    const seen = new Map<string, QualityIssue>();

    for (const issue of issues) {
      const key = `${issue.detectorId}:${issue.id}`;

      if (!seen.has(key)) {
        seen.set(key, issue);
        continue;
      }

      // Avoid duplicating the same detector/issue pair in the final list.
      // Detectors should emit one consolidated issue per target.
      const existing = seen.get(key)!;

      seen.set(key, {
        ...existing,
        rowIndexes: [
          ...new Set([...existing.rowIndexes, ...issue.rowIndexes]),
        ],
        evidence: [...new Set([...existing.evidence, ...issue.evidence])],
        columns: [...new Set([...existing.columns, ...issue.columns])],
        examples: [...existing.examples, ...issue.examples].slice(0, 10),
      });
    }

    return Array.from(seen.values()).sort((a, b) => {
      const severityOrder = {
        critical: 0,
        high: 1,
        warning: 2,
        info: 3,
      };

      return (
        severityOrder[a.severity] - severityOrder[b.severity] ||
        a.title.localeCompare(b.title)
      );
    });
  }

  private createSummary(
    rowCount: number,
    columnCount: number,
    detectorResults: DetectorResult[],
    issues: QualityIssue[],
    scannedAt: number,
    warnings: string[],
  ): QualitySummary {
    const affectedRows = new Set<number>();
    const affectedCells = new Set<string>();

    for (const issue of issues) {
      for (const rowIndex of issue.rowIndexes) {
        if (rowIndex < rowCount) {
          affectedRows.add(rowIndex);

          for (const column of issue.columns) {
            affectedCells.add(`${rowIndex}:${column}`);
          }
        }
      }
    }

    const activeIssues = issues.filter(
      (issue) => issue.status !== "ignored" && issue.status !== "resolved",
    );

    const dimensions: QualityDimensionScore[] = DIMENSIONS.map((dimension) => {
      const matchingDetectors = detectorResults.filter((result) => {
        const detector = this.detectors.get(result.detectorId);
        return detector?.dimension === dimension;
      });

      const failedIssues = activeIssues.filter(
        (issue) => issue.dimension === dimension,
      );

      const applicable = matchingDetectors.length > 0;

      return {
        dimension,
        score: null,
        applicable,
        evaluatedChecks: matchingDetectors.length,
        failedChecks: failedIssues.length,
        explanation: applicable
          ? "Detection ran, but a score requires explicit rule coverage and weighting."
          : "Not evaluated in this scan; this dimension is not assumed to pass.",
      };
    });

    const safeFixIds = new Set<string>();

    for (const issue of activeIssues) {
      for (const action of issue.actions) {
        if (action.enabled && action.risk === "safe") {
          safeFixIds.add(`${issue.detectorId}:${issue.id}:${action.id}`);
        }
      }
    }

    return {
      // Intentionally null until a defensible scoring model is implemented.
      score: null,
      dimensions,
      openIssues: activeIssues.length,
      criticalIssues: activeIssues.filter(
        (issue) => issue.severity === "critical",
      ).length,
      highIssues: activeIssues.filter((issue) => issue.severity === "high")
        .length,
      affectedRows: affectedRows.size,
      affectedCells: affectedCells.size,
      safeFixCount: safeFixIds.size,
      scannedRows: rowCount,
      scannedColumns: columnCount,
      scannedAt,
      warnings: [...warnings],
    };
  }
}

export const dataQualityEngine = new DataQualityEngine();
