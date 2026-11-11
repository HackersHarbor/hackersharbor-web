
import type {
    DatasetId,
    DatasetPreview,
    DockDataset,
  } from "../../types/dataset";
  
  export interface DatasetImportResult {
    dataset: DockDataset;
    importedRows: number;
  }
  
  export interface IDatasetService {
    importFiles(files: File[]): Promise<DatasetImportResult[]>;
    getAll(): DockDataset[];
    getById(id: DatasetId): DockDataset | undefined;
    getPreview(
      id: DatasetId,
      offset?: number,
      limit?: number,
    ): DatasetPreview | null;
    remove(id: DatasetId): void;
  }
  