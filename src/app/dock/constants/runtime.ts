
export const RUNTIME_DEFAULTS = {
    python: {
      preferredRuntime: "browser",
      timeoutMs: 30_000,
      initializationTimeoutMs: 60_000,
    },
    sql: {
      timeoutMs: 30_000,
      maxPreviewRows: 500,
    },
    backend: {
      enabled: false,
      timeoutMs: 120_000,
    },
  } as const;
  
  export const DATASET_LIMITS = {
    maxFileSizeBytes: 100 * 1024 * 1024,
    maxPreviewRows: 100,
    maxResultRows: 10_000,
    maxColumns: 2_000,
  } as const;
  
  export const NOTEBOOK_DEFAULTS = {
    name: "Untitled notebook",
    autosaveDelayMs: 1_000,
    maxRecoverySnapshots: 10,
  } as const;
  