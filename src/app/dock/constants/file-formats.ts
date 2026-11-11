
export const SUPPORTED_DATASET_FORMATS = [
    ".csv",
    ".json",
    ".parquet",
  ] as const;
  
  export const SUPPORTED_NOTEBOOK_FORMATS = [
    ".json",
    ".ipynb",
  ] as const;
  
  export const MIME_TYPES: Record<string, string> = {
    ".csv": "text/csv",
    ".json": "application/json",
    ".parquet": "application/vnd.apache.parquet",
    ".ipynb": "application/x-ipynb+json",
  };
  