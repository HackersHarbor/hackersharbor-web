import type {
  CleaningHistoryEntry,
  DataRow,
  IssueActionKind,
  RiskLevel,
  TransformationPlan,
  TransformationPreview,
  TransformationResult,
} from "../types";

export interface TransformationRequest {
  datasetId: string;
  issueId: string;
  label: string;
  risk: RiskLevel;
  action: IssueActionKind;
  rows: DataRow[];
  columns?: string[];
  parameters?: Record<string, unknown>;
  previewLimit?: number;
}

export interface TransformationApplyOptions {
  confirmed?: boolean;
}

const MISSING = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

const hasOwn = (object: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, key);

const stringify = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

function transformValue(
  value: unknown,
  action: IssueActionKind,
  parameters: Record<string, unknown>,
): { supported: boolean; changed: boolean; value: unknown; warning?: string } {
  switch (action) {
    case "trim-whitespace": {
      if (typeof value !== "string") {
        return { supported: true, changed: false, value };
      }
      const next = value.trim();
      return { supported: true, changed: next !== value, value: next };
    }

    case "normalize-empty": {
      if (typeof value === "string" && value.trim() === "") {
        return { supported: true, changed: true, value: null };
      }
      return { supported: true, changed: false, value };
    }

    case "convert-placeholder": {
      const placeholders = parameters.placeholders;
      const replacement = hasOwn(parameters, "replacement")
        ? parameters.replacement
        : null;

      if (!Array.isArray(placeholders)) {
        return {
          supported: false,
          changed: false,
          value,
          warning: "convert-placeholder requires a placeholders array.",
        };
      }

      const matched = placeholders.some(
        (placeholder) =>
          typeof placeholder === "string" &&
          typeof value === "string" &&
          placeholder.trim().toLowerCase() === value.trim().toLowerCase(),
      );

      return matched
        ? { supported: true, changed: true, value: replacement }
        : { supported: true, changed: false, value };
    }

    case "standardize-category": {
      const mapping = parameters.mapping;

      if (
        mapping === null ||
        typeof mapping !== "object" ||
        Array.isArray(mapping)
      ) {
        return {
          supported: false,
          changed: false,
          value,
          warning: "standardize-category requires a mapping object.",
        };
      }

      if (typeof value !== "string") {
        return { supported: true, changed: false, value };
      }

      const entries = Object.entries(mapping as Record<string, unknown>);
      const match = entries.find(
        ([key]) => key.toLowerCase() === value.trim().toLowerCase(),
      );

      if (!match) {
        return { supported: true, changed: false, value };
      }

      return {
        supported: true,
        changed: match[1] !== value,
        value: match[1],
      };
    }

    case "convert-number": {
      if (MISSING(value)) {
        return { supported: true, changed: false, value };
      }

      if (typeof value === "number" && Number.isFinite(value)) {
        return { supported: true, changed: false, value };
      }

      if (typeof value !== "string" || value.trim() === "") {
        return {
          supported: true,
          changed: false,
          value,
          warning: `Cannot safely convert ${stringify(value)} to a number.`,
        };
      }

      const parsed = Number(value.trim());

      if (!Number.isFinite(parsed)) {
        return {
          supported: true,
          changed: false,
          value,
          warning: `Cannot safely convert "${value}" to a number.`,
        };
      }

      return { supported: true, changed: true, value: parsed };
    }

    case "convert-date": {
      if (MISSING(value) || value instanceof Date) {
        return { supported: true, changed: false, value };
      }

      if (typeof value !== "string" && typeof value !== "number") {
        return {
          supported: true,
          changed: false,
          value,
          warning: `Cannot safely convert ${stringify(value)} to a date.`,
        };
      }

      const parsed = new Date(value);

      if (Number.isNaN(parsed.getTime())) {
        return {
          supported: true,
          changed: false,
          value,
          warning: `Cannot parse ${stringify(value)} as a date.`,
        };
      }

      return {
        supported: true,
        changed: true,
        value: parsed.toISOString(),
      };
    }

    case "replace-missing": {
      if (!hasOwn(parameters, "replacement")) {
        return {
          supported: false,
          changed: false,
          value,
          warning: "replace-missing requires a replacement parameter.",
        };
      }

      return MISSING(value)
        ? { supported: true, changed: true, value: parameters.replacement }
        : { supported: true, changed: false, value };
    }

    default:
      return {
        supported: false,
        changed: false,
        value,
        warning: `Action "${action}" is a row or schema operation and cannot be applied as a cell transformation.`,
      };
  }
}

export class TransformationService {
  private readonly history: CleaningHistoryEntry[] = [];

  plan(request: TransformationRequest): TransformationPlan {
    const parameters = { ...(request.parameters ?? {}) };
    const columns = request.columns?.length
      ? [...new Set(request.columns)]
      : [];

    const previewLimit = Math.max(
      0,
      Math.min(100, Math.floor(request.previewLimit ?? 10)),
    );

    const preview: TransformationPreview[] = [];
    let changeCount = 0;

    for (let rowIndex = 0; rowIndex < request.rows.length; rowIndex += 1) {
      const row = request.rows[rowIndex];

      for (const column of columns) {
        if (!hasOwn(row, column)) continue;

        const result = transformValue(
          row[column],
          request.action,
          parameters,
        );

        if (result.changed) {
          changeCount += 1;

          if (preview.length < previewLimit) {
            preview.push({
              rowIndex,
              column,
              before: row[column],
              after: result.value,
            });
          }
        }
      }
    }

    return {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      datasetId: request.datasetId,
      issueId: request.issueId,
      label: request.label,
      risk: request.risk,
      changeCount,
      preview,
      requiresConfirmation: request.risk !== "safe",
      parameters: {
        ...parameters,
        action: request.action,
        columns,
      },
    };
  }

  apply(
    plan: TransformationPlan,
    rows: DataRow[],
    options: TransformationApplyOptions = {},
  ): TransformationResult {
    const warnings: string[] = [];

    if (plan.requiresConfirmation && options.confirmed !== true) {
      return {
        planId: plan.id,
        rows: rows.map((row) => ({ ...row })),
        changedCells: 0,
        changedRows: 0,
        skippedRows: rows.length,
        warnings: ["Confirmation is required before this plan can be applied."],
      };
    }

    const action = plan.parameters.action;

    if (
      typeof action !== "string" ||
      ![
        "trim-whitespace",
        "normalize-empty",
        "convert-placeholder",
        "standardize-category",
        "convert-number",
        "convert-date",
        "replace-missing",
      ].includes(action)
    ) {
      return {
        planId: plan.id,
        rows: rows.map((row) => ({ ...row })),
        changedCells: 0,
        changedRows: 0,
        skippedRows: rows.length,
        warnings: [`Unsupported transformation action: ${String(action)}.`],
      };
    }

    const columns = plan.parameters.columns;

    if (!Array.isArray(columns) || !columns.every(
      (column): column is string => typeof column === "string",
    )) {
      return {
        planId: plan.id,
        rows: rows.map((row) => ({ ...row })),
        changedCells: 0,
        changedRows: 0,
        skippedRows: rows.length,
        warnings: ["The transformation plan has an invalid columns parameter."],
      };
    }

    const parameters = { ...plan.parameters };
    delete parameters.action;
    delete parameters.columns;

    let changedCells = 0;
    let changedRows = 0;
    let skippedRows = 0;

    const output = rows.map((row) => {
      let nextRow: DataRow | null = null;
      let rowChanged = false;

      for (const column of columns) {
        if (!hasOwn(row, column)) continue;

        const result = transformValue(
          row[column],
          action as IssueActionKind,
          parameters,
        );

        if (result.warning) warnings.push(result.warning);

        if (!result.supported || !result.changed) continue;

        if (!nextRow) nextRow = { ...row };

        nextRow[column] = result.value;
        changedCells += 1;
        rowChanged = true;
      }

      if (rowChanged) {
        changedRows += 1;
        return nextRow as DataRow;
      }

      skippedRows += 1;
      return { ...row };
    });

    return {
      planId: plan.id,
      rows: output,
      changedCells,
      changedRows,
      skippedRows,
      warnings: [...new Set(warnings)],
    };
  }

  recordHistory(
    entry: Omit<CleaningHistoryEntry, "id" | "timestamp">,
  ): CleaningHistoryEntry {
    const recorded: CleaningHistoryEntry = {
      ...entry,
      id: `clean-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };

    this.history.push(recorded);
    return { ...recorded };
  }

  getHistory(datasetId?: string): CleaningHistoryEntry[] {
    return this.history
      .filter((entry) => !datasetId || entry.datasetId === datasetId)
      .map((entry) => ({ ...entry }));
  }

  clearHistory(datasetId?: string): void {
    if (!datasetId) {
      this.history.length = 0;
      return;
    }

    for (let index = this.history.length - 1; index >= 0; index -= 1) {
      if (this.history[index].datasetId === datasetId) {
        this.history.splice(index, 1);
      }
    }
  }
}

export const transformationService = new TransformationService();
