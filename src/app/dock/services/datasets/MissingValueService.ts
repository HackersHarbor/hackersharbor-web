import type {

  DatasetColumn,

  DatasetId,

} from "../../types/dataset";

import { isMissingValue } from "../../utils/csv-utils";

import { datasetRegistry } from "./DatasetRegistry";

export type MissingValueStrategy =

  | "fixed"

  | "mean"

  | "median"

  | "mode";

export interface MissingValueOptions {

  column: string;

  strategy: MissingValueStrategy;

  fixedValue?: unknown;

}

export interface MissingValuePreview {

  datasetId: DatasetId;

  column: string;

  strategy: MissingValueStrategy;

  missingCount: number;

  replacementValue: unknown;

  previewRows: Record<string, unknown>[];

}

export interface MissingValueResult {

  datasetId: DatasetId;

  column: string;

  strategy: MissingValueStrategy;

  replacementValue: unknown;

  replacedCount: number;

}

export type MissingRowsRemovalScope =

  | "selected-column"

  | "any-column";

export interface MissingRowsRemovalOptions {

  scope: MissingRowsRemovalScope;

  column: string | null;

}

export interface MissingRowsRemovalPreview {

  datasetId: DatasetId;

  scope: MissingRowsRemovalScope;

  column: string | null;

  totalRows: number;

  affectedCount: number;

  previewRows: Record<string, unknown>[];

}

export interface MissingRowsRemovalResult {

  datasetId: DatasetId;

  scope: MissingRowsRemovalScope;

  column: string | null;

  removedCount: number;

  remainingCount: number;

}

export type TransformationOperation =

| "replace-missing-values"

| "remove-duplicate-rows"

| "remove-missing-rows"

| "clean-blank-values"

| "trim-whitespace"

| "normalize-category-case"

| "convert-numeric-text"

| "clear-negative-age";

export interface TransformationHistoryEntry {

  id: string;

  datasetId: DatasetId;

  operation: TransformationOperation;

  column: string;

  strategy: MissingValueStrategy;

  replacementValue: unknown;

  replacedCount: number;

  timestamp: string;

}

interface HistoryRecord {

  entry: TransformationHistoryEntry;

  previousRows: Record<string, unknown>[];

  nextRows: Record<string, unknown>[];

}

interface PersistedTransformationState {

  version: 1;

  datasetId: DatasetId;

  history: HistoryRecord[];

  redoHistory: HistoryRecord[];

}

const HISTORY_STORAGE_PREFIX =

  "hackersharbor:dock:transformations:v1:";

function historyStorageKey(datasetId: DatasetId): string {

  return `${HISTORY_STORAGE_PREFIX}${encodeURIComponent(datasetId)}`;

}

function copyRows(

  rows: Record<string, unknown>[],

): Record<string, unknown>[] {

  return rows.map((row) => ({ ...row }));

}

export class MissingValueService {

  private history = new Map<DatasetId, HistoryRecord[]>();

  private redoHistory = new Map<DatasetId, HistoryRecord[]>();

  private loadedHistory = new Set<DatasetId>();

  private loadHistory(datasetId: DatasetId): void {

    if (

      this.loadedHistory.has(datasetId) ||

      typeof window === "undefined"

    ) {

      return;

    }

    this.loadedHistory.add(datasetId);

    try {

      const raw = window.localStorage.getItem(

        historyStorageKey(datasetId),

      );

      if (!raw) return;

      const parsed: unknown = JSON.parse(raw);

      if (

        !parsed ||

        typeof parsed !== "object" ||

        !("version" in parsed) ||

        parsed.version !== 1 ||

        !("datasetId" in parsed) ||

        parsed.datasetId !== datasetId ||

        !("history" in parsed) ||

        !Array.isArray(parsed.history) ||

        !("redoHistory" in parsed) ||

        !Array.isArray(parsed.redoHistory)

      ) {

        return;

      }

      const saved = parsed as PersistedTransformationState;

      const isValidRecord = (

        value: unknown,

      ): value is HistoryRecord => {

        if (!value || typeof value !== "object") return false;

        const record = value as Partial<HistoryRecord>;

        const entry = record.entry;

        return (

          !!entry &&

          typeof entry.id === "string" &&

          entry.datasetId === datasetId &&

          (

            entry.operation === "replace-missing-values" ||

            entry.operation === "clean-blank-values" ||

entry.operation === "trim-whitespace" ||

entry.operation === "normalize-category-case" ||

entry.operation === "convert-numeric-text" ||

            entry.operation === "remove-duplicate-rows" ||

            entry.operation === "remove-missing-rows" ||
            entry.operation === "clear-negative-age"

          ) &&

          typeof entry.column === "string" &&

          Array.isArray(record.previousRows) &&

          Array.isArray(record.nextRows)

        );

      };

      this.history.set(

        datasetId,

        saved.history.filter(isValidRecord),

      );

      this.redoHistory.set(

        datasetId,

        saved.redoHistory.filter(isValidRecord),

      );

    } catch (error) {

      console.warn(

        "[Dock] Could not restore transformation history.",

        error,

      );

    }

  }

  private persistHistory(datasetId: DatasetId): void {

    if (typeof window === "undefined") return;

    try {

      const state: PersistedTransformationState = {

        version: 1,

        datasetId,

        history: this.history.get(datasetId) ?? [],

        redoHistory: this.redoHistory.get(datasetId) ?? [],

      };

      window.localStorage.setItem(

        historyStorageKey(datasetId),

        JSON.stringify(state),

      );

    } catch (error) {

      console.warn(

        "[Dock] Could not persist transformation history.",

        error,

      );

    }

  }

  private clearPersistedHistory(datasetId: DatasetId): void {

    this.history.delete(datasetId);

    this.redoHistory.delete(datasetId);

    this.loadedHistory.add(datasetId);

    if (typeof window === "undefined") return;

    try {

      window.localStorage.removeItem(historyStorageKey(datasetId));

    } catch (error) {

      console.warn(

        "[Dock] Could not clear saved transformation history.",

        error,

      );

    }

  }

  preview(

    datasetId: DatasetId,

    options: MissingValueOptions,

    previewLimit = 10,

  ): MissingValuePreview {

    this.loadHistory(datasetId);

    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) {

      throw new Error("Dataset not found.");

    }

    const column = this.findColumn(

      registered.metadata.columns,

      options.column,

    );

    const replacementValue = this.getReplacementValue(

      registered.rows,

      column,

      options,

    );

    const missingRows = registered.rows.filter((row) =>

      isMissingValue(row[options.column]),

    );

    return {

      datasetId,

      column: options.column,

      strategy: options.strategy,

      missingCount: missingRows.length,

      replacementValue,

      previewRows: missingRows

        .slice(0, Math.max(1, previewLimit))

        .map((row) => ({

          ...row,

          [options.column]: replacementValue,

        })),

    };

  }

  apply(

    datasetId: DatasetId,

    options: MissingValueOptions,

  ): MissingValueResult {

    this.loadHistory(datasetId);

    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) {

      throw new Error("Dataset not found.");

    }

    const column = this.findColumn(

      registered.metadata.columns,

      options.column,

    );

    const replacementValue = this.getReplacementValue(

      registered.rows,

      column,

      options,

    );

    const replacedCount = registered.rows.filter((row) =>

      isMissingValue(row[options.column]),

    ).length;

    if (replacedCount === 0) {

      return {

        datasetId,

        column: options.column,

        strategy: options.strategy,

        replacementValue,

        replacedCount: 0,

      };

    }

    const previousRows = copyRows(registered.rows);

    const nextRows = registered.rows.map((row) =>

      isMissingValue(row[options.column])

        ? { ...row, [options.column]: replacementValue }

        : { ...row },

    );

    datasetRegistry.replaceRows(datasetId, nextRows);

    const entry: TransformationHistoryEntry = {

      id: this.createHistoryId(),

      datasetId,

      operation: "replace-missing-values",

      column: options.column,

      strategy: options.strategy,

      replacementValue,

      replacedCount,

      timestamp: new Date().toISOString(),

    };

    this.recordTransformation(datasetId, {

      entry,

      previousRows,

      nextRows: copyRows(nextRows),

    });

    return {

      datasetId,

      column: options.column,

      strategy: options.strategy,

      replacementValue,

      replacedCount,

    };

  }

  applyRowsTransformation(

    datasetId: DatasetId,

    options: {

      operation: "remove-duplicate-rows";

      column: string;

      nextRows: Record<string, unknown>[];

      affectedCount: number;

    },

  ): TransformationHistoryEntry {

    this.loadHistory(datasetId);

    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) {

      throw new Error("Dataset not found.");

    }

    if (options.affectedCount <= 0) {

      throw new Error("There are no duplicate rows to remove.");

    }

    if (options.nextRows.length >= registered.rows.length) {

      throw new Error("The transformation did not remove any rows.");

    }

    if (

      registered.rows.length - options.nextRows.length !==

      options.affectedCount

    ) {

      throw new Error(

        "The duplicate-removal count does not match the resulting dataset.",

      );

    }

    const previousRows = copyRows(registered.rows);

    const nextRows = copyRows(options.nextRows);

    datasetRegistry.replaceRows(datasetId, nextRows);

    const entry: TransformationHistoryEntry = {

      id: this.createHistoryId(),

      datasetId,

      operation: options.operation,

      column: options.column,

      strategy: "fixed",

      replacementValue: null,

      replacedCount: options.affectedCount,

      timestamp: new Date().toISOString(),

    };

    this.recordTransformation(datasetId, {

      entry,

      previousRows,

      nextRows: copyRows(nextRows),

    });

    return { ...entry };

  }

  /**
   * Applies a data-quality cleanup while preserving the same persistent
   * Undo/Redo history used by the existing missing-value operations.
   * `nextRows` should be the complete transformed dataset, not just changed rows.
   */
  applyQualityTransformation(
    datasetId: DatasetId,
    options: {
      operation:
        | "clean-blank-values"
        | "trim-whitespace"
        | "normalize-category-case"
        | "convert-numeric-text"
        | "clear-negative-age";
      column: string;
      nextRows: Record<string, unknown>[];
      affectedCount: number;
      replacementValue?: unknown;
    },
  ): TransformationHistoryEntry {
    this.loadHistory(datasetId);

    const registered = datasetRegistry.getRegistered(datasetId);
    if (!registered) {
      throw new Error("Dataset not found.");
    }

    const validColumn = registered.metadata.columns.some(
      (column) => column.name === options.column,
    );
    if (!validColumn) {
      throw new Error(`Column "${options.column}" was not found.`);
    }

    if (options.affectedCount <= 0) {
      throw new Error("The quality transformation has no affected values.");
    }

    if (options.nextRows.length !== registered.rows.length) {
      throw new Error(
        "A quality cleanup must preserve the row count. Use the row-removal transformation for operations that delete rows.",
      );
    }

    const previousRows = copyRows(registered.rows);
    const nextRows = copyRows(options.nextRows);

    datasetRegistry.replaceRows(datasetId, nextRows);

    const entry: TransformationHistoryEntry = {
      id: this.createHistoryId(),
      datasetId,
      operation: options.operation,
      column: options.column,
      strategy: "fixed",
      replacementValue: options.replacementValue ?? null,
      replacedCount: options.affectedCount,
      timestamp: new Date().toISOString(),
    };

    this.recordTransformation(datasetId, {
      entry,
      previousRows,
      nextRows: copyRows(nextRows),
    });

    return { ...entry };
  }

  previewMissingRows(

    datasetId: DatasetId,

    options: MissingRowsRemovalOptions,

    previewLimit = 5,

  ): MissingRowsRemovalPreview {

    this.loadHistory(datasetId);

    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) throw new Error("Dataset not found.");

    if (

      options.scope === "selected-column" &&

      (!options.column ||

        !registered.metadata.columns.some(

          (column) => column.name === options.column,

        ))

    ) {

      throw new Error("Select a valid column.");

    }

    const shouldRemove = (row: Record<string, unknown>): boolean => {

      if (options.scope === "selected-column") {

        return isMissingValue(row[options.column!]);

      }

      return registered.metadata.columns.some((column) =>

        isMissingValue(row[column.name]),

      );

    };

    const matchingRows = registered.rows.filter(shouldRemove);

    return {

      datasetId,

      scope: options.scope,

      column: options.scope === "selected-column" ? options.column : null,

      totalRows: registered.rows.length,

      affectedCount: matchingRows.length,

      previewRows: matchingRows

        .slice(0, Math.max(1, previewLimit))

        .map((row) => ({ ...row })),

    };

  }

  removeMissingRows(

    datasetId: DatasetId,

    options: MissingRowsRemovalOptions,

  ): MissingRowsRemovalResult {

    this.loadHistory(datasetId);

    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) throw new Error("Dataset not found.");

    if (

      options.scope === "selected-column" &&

      (!options.column ||

        !registered.metadata.columns.some(

          (column) => column.name === options.column,

        ))

    ) {

      throw new Error("Select a valid column.");

    }

    const shouldRemove = (row: Record<string, unknown>): boolean => {

      if (options.scope === "selected-column") {

        return isMissingValue(row[options.column!]);

      }

      return registered.metadata.columns.some((column) =>

        isMissingValue(row[column.name]),

      );

    };

    const previousRows = copyRows(registered.rows);

    const nextRows = registered.rows

      .filter((row) => !shouldRemove(row))

      .map((row) => ({ ...row }));

    const removedCount = previousRows.length - nextRows.length;

    if (removedCount === 0) {

      throw new Error("There are no rows with missing values to remove.");

    }

    datasetRegistry.replaceRows(datasetId, nextRows);

    const entry: TransformationHistoryEntry = {

      id: this.createHistoryId(),

      datasetId,

      operation: "remove-missing-rows",

      column:

        options.scope === "selected-column"

          ? options.column!

          : "(any column)",

      strategy: "fixed",

      replacementValue: null,

      replacedCount: removedCount,

      timestamp: new Date().toISOString(),

    };

    this.recordTransformation(datasetId, {

      entry,

      previousRows,

      nextRows: copyRows(nextRows),

    });

    return {

      datasetId,

      scope: options.scope,

      column: options.scope === "selected-column" ? options.column : null,

      removedCount,

      remainingCount: nextRows.length,

    };

  }

  private recordTransformation(

    datasetId: DatasetId,

    record: HistoryRecord,

  ): void {

    const datasetHistory = this.history.get(datasetId) ?? [];

    datasetHistory.push(record);

    this.history.set(datasetId, datasetHistory);

    // A new operation after Undo creates a new history branch.

    this.redoHistory.delete(datasetId);

    this.persistHistory(datasetId);

  }

  getHistory(datasetId: DatasetId): TransformationHistoryEntry[] {

    this.loadHistory(datasetId);

    return (this.history.get(datasetId) ?? [])

      .map((record) => ({ ...record.entry }))

      .reverse();

  }

  canUndo(datasetId: DatasetId): boolean {

    this.loadHistory(datasetId);

    return (this.history.get(datasetId)?.length ?? 0) > 0;

  }

  canRedo(datasetId: DatasetId): boolean {

    this.loadHistory(datasetId);

    return (this.redoHistory.get(datasetId)?.length ?? 0) > 0;

  }

  undoLast(datasetId: DatasetId): TransformationHistoryEntry {

    this.loadHistory(datasetId);

    const datasetHistory = this.history.get(datasetId);

    const latest = datasetHistory?.[datasetHistory.length - 1];

    if (!latest) {

      throw new Error("There are no transformations to undo.");

    }

    if (!datasetRegistry.getRegistered(datasetId)) {

      throw new Error("Dataset not found.");

    }

    datasetRegistry.replaceRows(

      datasetId,

      copyRows(latest.previousRows),

    );

    datasetHistory!.pop();

    if (datasetHistory!.length === 0) {

      this.history.delete(datasetId);

    }

    const redoStack = this.redoHistory.get(datasetId) ?? [];

    redoStack.push(latest);

    this.redoHistory.set(datasetId, redoStack);

    this.persistHistory(datasetId);

    return { ...latest.entry };

  }

  redoLast(datasetId: DatasetId): TransformationHistoryEntry {

    this.loadHistory(datasetId);

    const redoStack = this.redoHistory.get(datasetId);

    const record = redoStack?.[redoStack.length - 1];

    if (!record) {

      throw new Error("There are no transformations to redo.");

    }

    if (!datasetRegistry.getRegistered(datasetId)) {

      throw new Error("Dataset not found.");

    }

    datasetRegistry.replaceRows(

      datasetId,

      copyRows(record.nextRows),

    );

    redoStack!.pop();

    if (redoStack!.length === 0) {

      this.redoHistory.delete(datasetId);

    }

    const datasetHistory = this.history.get(datasetId) ?? [];

    datasetHistory.push(record);

    this.history.set(datasetId, datasetHistory);

    this.persistHistory(datasetId);

    return { ...record.entry };

  }

  restoreOriginal(datasetId: DatasetId): void {

    datasetRegistry.restoreOriginal(datasetId);

    this.clearPersistedHistory(datasetId);

  }

  getMissingCounts(

    datasetId: DatasetId,

  ): Array<{ column: string; missingCount: number }> {

    const registered = datasetRegistry.getRegistered(datasetId);

    if (!registered) {

      throw new Error("Dataset not found.");

    }

    return registered.metadata.columns.map((column) => ({

      column: column.name,

      missingCount: registered.rows.filter((row) =>

        isMissingValue(row[column.name]),

      ).length,

    }));

  }

  private findColumn(

    columns: DatasetColumn[],

    name: string,

  ): DatasetColumn {

    const column = columns.find((item) => item.name === name);

    if (!column) {

      throw new Error(`Column "${name}" was not found.`);

    }

    return column;

  }

  private getReplacementValue(

    rows: Record<string, unknown>[],

    column: DatasetColumn,

    options: MissingValueOptions,

  ): unknown {

    const values = rows

      .map((row) => row[column.name])

      .filter((value) => !isMissingValue(value));

    switch (options.strategy) {

      case "fixed":

        return this.convertFixedValue(options.fixedValue, column);

      case "mean": {

        const numbers = this.getNumericValues(values, column);

        if (numbers.length === 0) {

          throw new Error(

            "Mean replacement requires existing numeric values.",

          );

        }

        return (

          numbers.reduce((sum, value) => sum + value, 0) /

          numbers.length

        );

      }

      case "median": {

        const numbers = this.getNumericValues(values, column);

        if (numbers.length === 0) {

          throw new Error(

            "Median replacement requires existing numeric values.",

          );

        }

        numbers.sort((a, b) => a - b);

        const middle = Math.floor(numbers.length / 2);

        return numbers.length % 2 === 0

          ? (numbers[middle - 1] + numbers[middle]) / 2

          : numbers[middle];

      }

      case "mode": {

        if (values.length === 0) {

          throw new Error(

            "Most frequent replacement requires at least one non-missing value.",

          );

        }

        const frequencies = new Map<

          string,

          { value: unknown; count: number }

        >();

        for (const value of values) {

          const key =

            value instanceof Date

              ? `date:${value.toISOString()}`

              : `${typeof value}:${String(value)}`;

          const existing = frequencies.get(key);

          if (existing) {

            existing.count += 1;

          } else {

            frequencies.set(key, { value, count: 1 });

          }

        }

        let mostFrequent:

          | { value: unknown; count: number }

          | undefined;

        for (const item of frequencies.values()) {

          if (!mostFrequent || item.count > mostFrequent.count) {

            mostFrequent = item;

          }

        }

        return mostFrequent!.value;

      }

    }

  }

  private convertFixedValue(

    input: unknown,

    column: DatasetColumn,

  ): unknown {

    if (input === undefined || input === null) {

      throw new Error("Enter a replacement value.");

    }

    const raw = String(input).trim();

    if (raw === "") {

      throw new Error("Enter a replacement value.");

    }

    switch (column.type) {

      case "string":

        return String(input);

      case "integer": {

        if (!/^[+-]?\d+$/.test(raw)) {

          throw new Error(

            `Enter a whole number for "${column.name}".`,

          );

        }

        const value = Number(raw);

        if (!Number.isSafeInteger(value)) {

          throw new Error(

            `"${column.name}" requires a safe integer.`,

          );

        }

        return value;

      }

      case "float": {

        const value = Number(raw);

        if (!Number.isFinite(value)) {

          throw new Error(

            `Enter a valid number for "${column.name}".`,

          );

        }

        return value;

      }

      case "boolean": {

        const normalized = raw.toLowerCase();

        if (normalized === "true") return true;

        if (normalized === "false") return false;

        throw new Error(

          `Enter true or false for "${column.name}".`,

        );

      }

      case "date": {

        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);

        if (!match) {

          throw new Error(

            `Enter a date in YYYY-MM-DD format for "${column.name}".`,

          );

        }

        const year = Number(match[1]);

        const month = Number(match[2]);

        const day = Number(match[3]);

        const date = new Date(Date.UTC(year, month - 1, day));

        if (

          date.getUTCFullYear() !== year ||

          date.getUTCMonth() !== month - 1 ||

          date.getUTCDate() !== day

        ) {

          throw new Error(

            `Enter a valid calendar date for "${column.name}".`,

          );

        }

        return raw;

      }

      case "datetime": {

        const timestamp = Date.parse(raw);

        if (!Number.isFinite(timestamp)) {

          throw new Error(

            `Enter a valid date and time for "${column.name}".`,

          );

        }

        return new Date(timestamp).toISOString();

      }

      case "null":

      case "unknown":

        throw new Error(

          `Fixed-value replacement is not supported for the "${column.type}" type.`,

        );

    }

  }

  private getNumericValues(

    values: unknown[],

    column: DatasetColumn,

  ): number[] {

    if (

      column.type !== "integer" &&

      column.type !== "float"

    ) {

      throw new Error(

        `Mean and median are only available for numeric columns. "${column.name}" is ${column.type}.`,

      );

    }

    return values.filter(

      (value): value is number =>

        typeof value === "number" && Number.isFinite(value),

    );

  }

  private createHistoryId(): string {

    if (

      typeof crypto !== "undefined" &&

      typeof crypto.randomUUID === "function"

    ) {

      return crypto.randomUUID();

    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  }

}

export const missingValueService = new MissingValueService();

