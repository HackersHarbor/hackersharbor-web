
import type { DatasetId } from "../../types/dataset";
import { datasetRegistry } from "./DatasetRegistry";
import { missingValueService } from "./MissingValueService";

export interface DuplicateRowsPreview {
  datasetId: DatasetId;
  totalRows: number;
  uniqueRows: number;
  duplicateRows: number;
  previewRows: Record<string, unknown>[];
}

export interface RemoveDuplicatesResult {
  datasetId: DatasetId;
  removedCount: number;
}

function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function createRowSignature(
  row: Record<string, unknown>,
  columns: string[],
): string {
  return JSON.stringify(
    columns.map((column) => normalizeValue(row[column])),
  );
}

export class DuplicateRowsService {
  /**
   * Inspect the dataset and identify duplicate rows.
   * The first occurrence of each row is retained.
   */
  preview(datasetId: DatasetId): DuplicateRowsPreview {
    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) {
      throw new Error("Dataset not found.");
    }

    const columns = registered.metadata.columns.map(
      (column) => column.name,
    );

    const seen = new Set<string>();
    const previewRows: Record<string, unknown>[] = [];

    let uniqueRows = 0;
    let duplicateRows = 0;

    for (const row of registered.rows) {
      const signature = createRowSignature(row, columns);

      if (seen.has(signature)) {
        duplicateRows += 1;

        if (previewRows.length < 5) {
          previewRows.push({ ...row });
        }
      } else {
        seen.add(signature);
        uniqueRows += 1;
      }
    }

    return {
      datasetId,
      totalRows: registered.rows.length,
      uniqueRows,
      duplicateRows,
      previewRows,
    };
  }

  /**
   * Remove duplicate rows across all dataset columns.
   * The first occurrence is retained.
   * The transformation is recorded for Undo and Redo.
   */
  remove(datasetId: DatasetId): RemoveDuplicatesResult {
    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) {
      throw new Error("Dataset not found.");
    }

    const columns = registered.metadata.columns.map(
      (column) => column.name,
    );

    const seen = new Set<string>();
    const nextRows: Record<string, unknown>[] = [];

    for (const row of registered.rows) {
      const signature = createRowSignature(row, columns);

      if (!seen.has(signature)) {
        seen.add(signature);
        nextRows.push({ ...row });
      }
    }

    const removedCount = registered.rows.length - nextRows.length;

    if (removedCount === 0) {
      return {
        datasetId,
        removedCount: 0,
      };
    }

    missingValueService.applyRowsTransformation(datasetId, {
      operation: "remove-duplicate-rows",
      column: "All columns",
      nextRows,
      affectedCount: removedCount,
    });

    return {
      datasetId,
      removedCount,
    };
  }
}

export const duplicateRowsService = new DuplicateRowsService();
