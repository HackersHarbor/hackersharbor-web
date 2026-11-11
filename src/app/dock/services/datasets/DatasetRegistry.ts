import type {
  DatasetId,
  DatasetPreview,
  DockDataset,
} from "../../types/dataset";

import type { DatasetSchema } from "../../features/explorer/engine/types";
import { DatasetProfilingService } from "./DatasetProfilingService";

export type DatasetSchemaStatus = "suggested" | "confirmed";

export interface RegisteredDataset {
  metadata: DockDataset;
  rows: Record<string, unknown>[];
  /**
   * Quality-engine schema kept separately from DockDataset metadata so the
   * existing dataset contract and consumers remain backward-compatible.
   */
  schema?: DatasetSchema;
  /** Inferred schemas remain suggestions until the user confirms them. */
  schemaStatus?: DatasetSchemaStatus;
}

interface PersistedRegistry {
  version: 1;
  datasets: RegisteredDataset[];
  originalRows: Array<{
    id: DatasetId;
    rows: Record<string, unknown>[];
  }>;
}

type Listener = () => void;

const STORAGE_KEY = "hackersharbor:dock:datasets:v1";

function copyRows(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  return rows.map((row) => ({ ...row }));
}

function copySchema(schema: DatasetSchema): DatasetSchema {
  return {
    columns: schema.columns.map((column) => ({
      ...column,
      ...(column.allowedValues
        ? { allowedValues: [...column.allowedValues] }
        : {}),
    })),
    ...(schema.primaryKey
      ? { primaryKey: [...schema.primaryKey] }
      : {}),
  };
}

class DatasetRegistry {
  private datasets = new Map<DatasetId, RegisteredDataset>();
  private originalRows = new Map<
    DatasetId,
    Record<string, unknown>[]
  >();
  private listeners = new Set<Listener>();
  private hydrated = false;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private persist(): void {
    if (!this.hydrated || typeof window === "undefined") {
      return;
    }

    try {
      const state: PersistedRegistry = {
        version: 1,
        datasets: Array.from(this.datasets.values()),
        originalRows: Array.from(this.originalRows.entries()).map(
          ([id, rows]) => ({ id, rows }),
        ),
      };

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state),
      );
    } catch (error) {
      // Storage can be unavailable or full. Keep the in-memory
      // dataset functional even if persistence cannot be completed.
      console.warn(
        "[Dock] Could not persist datasets to browser storage.",
        error,
      );
    }
  }

  /**
   * Load saved datasets once, on the client.
   * Call this before importing or transforming datasets.
   */
  hydrateFromStorage(): void {
    if (this.hydrated || typeof window === "undefined") {
      return;
    }

    this.hydrated = true;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) return;

      const state: unknown = JSON.parse(raw);

      if (
        !state ||
        typeof state !== "object" ||
        !("version" in state) ||
        state.version !== 1 ||
        !("datasets" in state) ||
        !Array.isArray(state.datasets) ||
        !("originalRows" in state) ||
        !Array.isArray(state.originalRows)
      ) {
        console.warn(
          "[Dock] Saved dataset storage has an unsupported format.",
        );
        return;
      }

      const saved = state as PersistedRegistry;

      for (const item of saved.datasets) {
        if (
          !item ||
          !item.metadata ||
          typeof item.metadata.id !== "string" ||
          !Array.isArray(item.metadata.columns) ||
          !Array.isArray(item.rows)
        ) {
          continue;
        }

        const rows = copyRows(item.rows);

        const profile = DatasetProfilingService.profile(
          item.metadata.columns,
          rows,
          item.metadata.summary?.memoryBytes,
        );

        const schema = item.schema
          ? copySchema(item.schema)
          : undefined;

        this.datasets.set(item.metadata.id, {
          metadata: {
            ...item.metadata,
            columns: profile.columns,
            summary: profile.summary,
            status: "ready",
          },
          rows,
          ...(schema ? { schema } : {}),
          ...(schema
            ? { schemaStatus: item.schemaStatus ?? "suggested" }
            : {}),
        });
      }

      for (const item of saved.originalRows) {
        if (
          item &&
          typeof item.id === "string" &&
          Array.isArray(item.rows) &&
          this.datasets.has(item.id)
        ) {
          this.originalRows.set(item.id, copyRows(item.rows));
        }
      }

      // Older saved entries without an original snapshot fall back
      // to their restored current rows.
      for (const [id, dataset] of this.datasets) {
        if (!this.originalRows.has(id)) {
          this.originalRows.set(id, copyRows(dataset.rows));
        }
      }
    } catch (error) {
      console.warn(
        "[Dock] Could not restore saved datasets.",
        error,
      );
    } finally {
      this.notify();
    }
  }

  getAll(): DockDataset[] {
    return Array.from(this.datasets.values()).map(
      ({ metadata }) => metadata,
    );
  }

  getById(id: DatasetId): DockDataset | undefined {
    return this.datasets.get(id)?.metadata;
  }

  rename(id: DatasetId, nextName: string): void {
    const registered = this.datasets.get(id);

    if (!registered) {
      throw new Error("Dataset not found.");
    }

    const normalizedName = nextName.trim();

    if (!normalizedName) {
      throw new Error("Dataset name cannot be empty.");
    }

    this.datasets.set(id, {
      ...registered,
      metadata: {
        ...registered.metadata,
        name: normalizedName,
      },
    });

    this.persist();
    this.notify();
  }

  getRows(id: DatasetId): Record<string, unknown>[] {
    return this.datasets.get(id)?.rows ?? [];
  }

  getRegistered(id: DatasetId): RegisteredDataset | undefined {
    return this.datasets.get(id);
  }

  getSchema(id: DatasetId): DatasetSchema | undefined {
    const schema = this.datasets.get(id)?.schema;
    return schema ? copySchema(schema) : undefined;
  }

  setSchema(
    id: DatasetId,
    schema: DatasetSchema,
    status: DatasetSchemaStatus = "suggested",
  ): void {
    const registered = this.datasets.get(id);

    if (!registered) {
      throw new Error("Dataset not found.");
    }

    this.datasets.set(id, {
      ...registered,
      schema: copySchema(schema),
      schemaStatus: status,
    });

    this.persist();
    this.notify();
  }

  register(dataset: RegisteredDataset): void {
    const id = dataset.metadata.id;
    const rows = copyRows(dataset.rows);

    const profile = DatasetProfilingService.profile(
      dataset.metadata.columns,
      rows,
      dataset.metadata.summary?.memoryBytes,
    );

    const schema = dataset.schema
      ? copySchema(dataset.schema)
      : undefined;

    this.datasets.set(id, {
      metadata: {
        ...dataset.metadata,
        columns: profile.columns,
        summary: profile.summary,
      },
      rows,
      ...(schema ? { schema } : {}),
      ...(schema
        ? { schemaStatus: dataset.schemaStatus ?? "suggested" }
        : {}),
    });

    this.originalRows.set(id, copyRows(rows));

    this.persist();
    this.notify();
  }

  replaceRows(
    id: DatasetId,
    rows: Record<string, unknown>[],
  ): void {
    const registered = this.datasets.get(id);

    if (!registered) {
      throw new Error("Dataset not found.");
    }

    const nextRows = copyRows(rows);

    const profile = DatasetProfilingService.profile(
      registered.metadata.columns,
      nextRows,
      registered.metadata.summary?.memoryBytes,
    );

    this.datasets.set(id, {
      ...registered,
      metadata: {
        ...registered.metadata,
        columns: profile.columns,
        summary: profile.summary,
      },
      rows: nextRows,
    });

    this.persist();
    this.notify();
  }

  getOriginalRows(
    id: DatasetId,
  ): Record<string, unknown>[] | undefined {
    const original = this.originalRows.get(id);
    return original ? copyRows(original) : undefined;
  }

  hasOriginalRows(id: DatasetId): boolean {
    return this.originalRows.has(id);
  }

  restoreOriginal(id: DatasetId): void {
    const original = this.originalRows.get(id);

    if (!original) {
      throw new Error("Original dataset rows are not available.");
    }

    this.replaceRows(id, original);
  }

  remove(id: DatasetId): void {
    const removed = this.datasets.delete(id);

    this.originalRows.delete(id);

    if (removed) {
      this.persist();
      this.notify();
    }
  }

  clear(): void {
    if (
      this.datasets.size === 0 &&
      this.originalRows.size === 0
    ) {
      return;
    }

    this.datasets.clear();
    this.originalRows.clear();

    this.persist();
    this.notify();
  }

  preview(
    id: DatasetId,
    offset = 0,
    limit = 50,
  ): DatasetPreview | null {
    const registered = this.datasets.get(id);

    if (!registered) return null;

    const start = Math.max(0, Math.floor(offset));
    const pageSize = Math.max(1, Math.min(500, Math.floor(limit)));
    const totalRows = registered.rows.length;

    return {
      datasetId: id,
      columns: registered.metadata.columns,
      rows: copyRows(
        registered.rows.slice(start, start + pageSize),
      ),
      offset: start,
      totalRows,
      truncated: start + pageSize < totalRows,
    };
  }
}

export const datasetRegistry = new DatasetRegistry();
