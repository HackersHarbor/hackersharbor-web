import type {
  DataColumnType,
  DatasetColumn,
  DockDataset,
} from "../../types/dataset";
import { createId } from "../../utils/id";
import {
  convertCSVValue,
  inferColumnType,
  parseCSV,
} from "../../utils/csv-utils";
import { DatasetProfilingService } from "./DatasetProfilingService";
import { datasetRegistry } from "./DatasetRegistry";
import type {
  DatasetImportResult,
  IDatasetService,
} from "./IDatasetService";
import type {
  ColumnDataType,
  ColumnSchema,
  DatasetSchema,
} from "../../features/explorer/engine/types";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

export class DatasetImportService implements IDatasetService {
  async importFiles(files: File[]): Promise<DatasetImportResult[]> {
    if (files.length === 0) {
      throw new Error("Select at least one CSV file.");
    }

    const results: DatasetImportResult[] = [];

    for (const file of files) {
      results.push(await this.importFile(file));
    }

    return results;
  }

  private async importFile(file: File): Promise<DatasetImportResult> {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      throw new Error(`${file.name}: only CSV files are supported.`);
    }

    if (file.size === 0) {
      throw new Error(`${file.name}: the file is empty.`);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`${file.name}: files must be smaller than 100 MB.`);
    }

    const content = await file.text();
    const parsed = parseCSV(content);

    if (parsed.headers.length === 0) {
      throw new Error(`${file.name}: no columns were found.`);
    }

    const columnTypes = parsed.headers.map((_, index) =>
      inferColumnType(parsed.rows.map((row) => row[index])),
    );

    const columns: DatasetColumn[] = parsed.headers.map((name, index) => ({
      name,
      type: columnTypes[index],
      nullable: false,
    }));

    const rows = parsed.rows.map((values) => {
      const row: Record<string, unknown> = {};

      parsed.headers.forEach((header, index) => {
        row[header] = convertCSVValue(
          values[index],
          columnTypes[index] as DataColumnType,
        );
      });

      return row;
    });

    const profile = DatasetProfilingService.profile(
      columns,
      rows,
      file.size,
    );

    const id = createId();
    const importedAt = new Date().toISOString();

    const dataset: DockDataset = {
      id,
      name: file.name.replace(/\.csv$/i, ""),
      source: "csv",
      fileName: file.name,
      tableName: makeTableName(file.name),
      columns: profile.columns,
      summary: profile.summary,
      importedAt,
      status: "ready",
    };

    const schema = inferDatasetSchema(parsed.headers, columnTypes, rows);

    datasetRegistry.register({
      metadata: dataset,
      rows,
      schema,
      schemaStatus: "suggested",
    });

    return {
      dataset,
      importedRows: rows.length,
    };
  }

  getAll() {
    return datasetRegistry.getAll();
  }

  getById(id: string) {
    return datasetRegistry.getById(id);
  }

  getPreview(id: string, offset = 0, limit = 50) {
    return datasetRegistry.preview(id, offset, limit);
  }

  remove(id: string) {
    datasetRegistry.remove(id);
  }
}

/**
 * Creates a first-pass schema from the imported values.
 *
 * The inferred schema is deliberately stored as "suggested". It describes
 * what the data appears to contain; it does not silently create business
 * validation rules such as allowed ranges or required fields.
 */
function inferDatasetSchema(
  headers: string[],
  inferredTypes: DataColumnType[],
  rows: Record<string, unknown>[],
): DatasetSchema {
  const columns: ColumnSchema[] = headers.map((name, index) => {
    const values = rows.map((row) => row[name]);
    const nonEmptyValues = values.filter(
      (value) => value !== null && value !== undefined && value !== "",
    );

    return {
      name,
      type: inferEngineColumnType(inferredTypes[index], nonEmptyValues),
      nullable: nonEmptyValues.length !== values.length,
    };
  });

  const primaryKeyCandidate = findPrimaryKeyCandidate(headers, rows);

  return {
    columns,
    ...(primaryKeyCandidate ? { primaryKey: [primaryKeyCandidate] } : {}),
  };
}

function inferEngineColumnType(
  inferredType: DataColumnType,
  values: unknown[],
): ColumnDataType {
  const normalizedType = String(inferredType).trim().toLowerCase();

  if (normalizedType.includes("bool") || normalizedType === "bit") {
    return "boolean";
  }

  if (
    normalizedType.includes("datetime") ||
    normalizedType.includes("timestamp")
  ) {
    return "datetime";
  }

  if (normalizedType === "date" || normalizedType.includes("date")) {
    return "date";
  }

  if (
    normalizedType.includes("int") ||
    normalizedType.includes("number") ||
    normalizedType.includes("float") ||
    normalizedType.includes("double") ||
    normalizedType.includes("decimal") ||
    normalizedType.includes("numeric")
  ) {
    const allIntegers =
      values.length > 0 &&
      values.every((value) => {
        const numericValue =
          typeof value === "number" ? value : Number(String(value).trim());

        return Number.isFinite(numericValue) && Number.isInteger(numericValue);
      });

    return allIntegers ? "integer" : "number";
  }

  if (
    normalizedType.includes("string") ||
    normalizedType.includes("text") ||
    normalizedType.includes("varchar") ||
    normalizedType.includes("char")
  ) {
    return "string";
  }

  if (values.length > 0 && values.every((value) => typeof value === "boolean")) {
    return "boolean";
  }

  if (values.length > 0 && values.every((value) => value instanceof Date)) {
    return "datetime";
  }

  if (
    values.length > 0 &&
    values.every(
      (value) => typeof value === "number" && Number.isFinite(value),
    )
  ) {
    return values.every((value) => Number.isInteger(value as number))
      ? "integer"
      : "number";
  }

  return "string";
}

/**
 * Identifies a likely key only when the column name looks key-like and its
 * observed values are complete and unique. This remains a suggestion until
 * the user confirms the schema.
 */
function findPrimaryKeyCandidate(
  headers: string[],
  rows: Record<string, unknown>[],
): string | undefined {
  if (rows.length === 0) {
    return undefined;
  }

  const candidates = headers.filter((header) => {
    const normalized = header.trim().toLowerCase();

    return (
      normalized === "id" ||
      normalized.endsWith("_id") ||
      normalized.endsWith("id") ||
      normalized === "key" ||
      normalized.endsWith("_key")
    );
  });

  candidates.sort((left, right) => {
    const leftName = left.trim().toLowerCase();
    const rightName = right.trim().toLowerCase();

    if (leftName === "id" && rightName !== "id") return -1;
    if (rightName === "id" && leftName !== "id") return 1;
    return headers.indexOf(left) - headers.indexOf(right);
  });

  for (const candidate of candidates) {
    const values = rows.map((row) => row[candidate]);
    const hasMissingValue = values.some(
      (value) => value === null || value === undefined || value === "",
    );

    if (hasMissingValue) {
      continue;
    }

    const uniqueValues = new Set(
      values.map((value) => `${typeof value}:${String(value)}`),
    );

    if (uniqueValues.size === values.length) {
      return candidate;
    }
  }

  return undefined;
}

function makeTableName(fileName: string): string {
  const base = fileName
    .replace(/\.csv$/i, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^(\d)/, "_$1")
    .replace(/^_+|_+$/g, "");

  return base || "dataset";
}

export const datasetImportService = new DatasetImportService();
