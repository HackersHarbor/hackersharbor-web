
import type {
    DatasetColumn,
    DatasetSummary,
  } from "../../types/dataset";
  import { isMissingValue } from "../../utils/csv-utils";
  
  export class DatasetProfilingService {
    static profile(
      columns: DatasetColumn[],
      rows: Record<string, unknown>[],
      memoryBytes?: number,
    ): {
      columns: DatasetColumn[];
      summary: DatasetSummary;
    } {
      const profiledColumns = columns.map((column) => {
        const values = rows.map((row) => row[column.name]);
        const uniqueValues = new Set(
          values
            .filter((value) => !isMissingValue(value))
            .map((value) => `${typeof value}:${String(value)}`),
        );
  
        return {
          ...column,
          nullable: values.some(isMissingValue),
          missingCount: values.filter(isMissingValue).length,
          uniqueCount: uniqueValues.size,
        };
      });
  
      const seenRows = new Set<string>();
      let duplicateRows = 0;
  
      for (const row of rows) {
        const signature = JSON.stringify(
          columns.map((column) => row[column.name] ?? null),
        );
  
        if (seenRows.has(signature)) {
          duplicateRows += 1;
        } else {
          seenRows.add(signature);
        }
      }
  
      const missingCells = profiledColumns.reduce(
        (total, column) => total + (column.missingCount ?? 0),
        0,
      );
  
      return {
        columns: profiledColumns,
        summary: {
          rowCount: rows.length,
          columnCount: columns.length,
          missingCells,
          duplicateRows,
          memoryBytes,
        },
      };
    }
  }
  