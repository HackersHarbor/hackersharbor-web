
import type { DockNotebook } from "../types";

export interface NotebookValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateNotebook(
  value: unknown,
): NotebookValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== "object") {
    return {
      valid: false,
      errors: ["Notebook data must be an object."],
    };
  }

  const notebook = value as Partial<DockNotebook>;

  if (typeof notebook.id !== "string" || !notebook.id) {
    errors.push("Notebook ID is missing.");
  }

  if (
    typeof notebook.projectId !== "string" ||
    !notebook.projectId
  ) {
    errors.push("Notebook project ID is missing.");
  }

  if (typeof notebook.name !== "string" || !notebook.name.trim()) {
    errors.push("Notebook name is required.");
  }

  if (!Array.isArray(notebook.cells)) {
    errors.push("Notebook cells must be an array.");
  } else {
    const ids = new Set<string>();

    notebook.cells.forEach((cell, index) => {
      if (!cell || typeof cell !== "object") {
        errors.push(`Cell ${index + 1} is invalid.`);
        return;
      }

      if (!cell.id || typeof cell.id !== "string") {
        errors.push(`Cell ${index + 1} has no valid ID.`);
      } else if (ids.has(cell.id)) {
        errors.push(`Duplicate cell ID: ${cell.id}.`);
      } else {
        ids.add(cell.id);
      }

      if (
        !["python", "sql", "markdown"].includes(cell.type)
      ) {
        errors.push(`Cell ${index + 1} has an unsupported type.`);
      }

      if (typeof cell.source !== "string") {
        errors.push(`Cell ${index + 1} source must be text.`);
      }
    });
  }

  if (!Array.isArray(notebook.datasetIds)) {
    errors.push("Notebook dataset IDs must be an array.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
