
"use client";

import { useCallback, useState } from "react";
import type { DatasetImportResult } from "../services/datasets/IDatasetService";
import { datasetImportService } from "../services/datasets/DatasetImportService";

export function useDatasetImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importFiles = useCallback(
    async (files: File[]): Promise<DatasetImportResult[]> => {
      setIsImporting(true);
      setError(null);

      try {
        return await datasetImportService.importFiles(files);
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "The selected datasets could not be imported.";

        setError(message);
        throw cause;
      } finally {
        setIsImporting(false);
      }
    },
    [],
  );

  return {
    importFiles,
    isImporting,
    error,
    clearError: () => setError(null),
  };
}
