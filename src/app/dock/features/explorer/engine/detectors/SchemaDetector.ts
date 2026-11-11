import type {
  DataQualityDetector,
  DetectorContext,
  DetectorResult,
  QualityIssue,
} from "../types";

export class SchemaDetector implements DataQualityDetector {
  readonly id = "schema-validation";
  readonly name = "Schema Detector";
  readonly description =
    "Compares dataset columns against the declared schema and primary key.";
  readonly dimension = "schema" as const;

  detect(context: DetectorContext): DetectorResult {
    const startedAt = Date.now();
    const { rows, columns, schema } = context;
    const issues: QualityIssue[] = [];
    const warnings: string[] = [];

    if (!schema) {
      return {
        detectorId: this.id,
        issues: [],
        scannedRows: rows.length,
        scannedColumns: columns.length,
        durationMs: Date.now() - startedAt,
        warnings: [
          "Schema scan skipped: no declared dataset schema was supplied.",
        ],
      };
    }

    const actualColumns = new Set(columns);
    const declaredColumns = new Set(
      schema.columns.map((column) => column.name),
    );

    const addIssue = (
      id: string,
      title: string,
      description: string,
      affectedColumns: string[],
      evidence: string[],
      severity: "critical" | "high" | "warning" | "info" = "warning",
    ) => {
      const examples = affectedColumns.slice(0, 5).map((column) => ({
        rowIndex: 0,
        column,
        before: actualColumns.has(column) ? column : undefined,
        reason: actualColumns.has(column)
          ? "Column exists in the dataset."
          : "Column is referenced by the schema but is absent from the dataset.",
      }));

      const issue: QualityIssue = {
        id,
        detectorId: this.id,
        title,
        description,
        severity,
        dimension: "schema",
        status: "open",
        columns: affectedColumns,
        rowIndexes: [],
        affectedCount: affectedColumns.length,
        affectedCountUnit: "columns",
        examples,
        evidence,
        actions: [
          {
            id: `review-${id}`,
            label: "Review schema",
            description:
              "Review the declared schema and dataset columns before changing the structure.",
            kind: "review-rows",
            risk: "safe",
            enabled: true,
          },
        ],
        detectedAt: Date.now(),
      };

      issues.push(issue);
    };

    const missingRequired = schema.columns
      .filter(
        (column) => column.required && !actualColumns.has(column.name),
      )
      .map((column) => column.name);

    if (missingRequired.length > 0) {
      addIssue(
        "schema-missing-required-columns",
        "Required columns are missing",
        `${missingRequired.length} required schema columns are absent from the dataset.`,
        missingRequired,
        missingRequired.map((column) => `Missing required column: ${column}`),
        "high",
      );
    }

    const missingDeclared = schema.columns
      .filter((column) => !actualColumns.has(column.name))
      .map((column) => column.name);

    if (missingDeclared.length > 0) {
      addIssue(
        "schema-missing-declared-columns",
        "Declared columns are absent",
        `${missingDeclared.length} columns in the schema are absent from the scanned dataset.`,
        missingDeclared,
        missingDeclared.map((column) => `Declared but absent: ${column}`),
      );
    }

    const unexpectedColumns = columns.filter(
      (column) => !declaredColumns.has(column),
    );

    if (unexpectedColumns.length > 0) {
      addIssue(
        "schema-unexpected-columns",
        "Unexpected dataset columns",
        `${unexpectedColumns.length} dataset columns are not defined in the declared schema.`,
        unexpectedColumns,
        unexpectedColumns.map((column) => `Not declared in schema: ${column}`),
      );
    }

    const missingPrimaryKey = (schema.primaryKey ?? []).filter(
      (column) => !actualColumns.has(column),
    );

    if (missingPrimaryKey.length > 0) {
      addIssue(
        "schema-missing-primary-key-columns",
        "Primary-key columns are missing",
        `${missingPrimaryKey.length} declared primary-key columns are absent from the dataset.`,
        missingPrimaryKey,
        missingPrimaryKey.map((column) => `Missing primary-key column: ${column}`),
        "critical",
      );
    }

    if (
      missingDeclared.length === 0 &&
      unexpectedColumns.length === 0 &&
      missingPrimaryKey.length === 0
    ) {
      warnings.push("Dataset columns match the declared schema.");
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

export const schemaDetector = new SchemaDetector();
