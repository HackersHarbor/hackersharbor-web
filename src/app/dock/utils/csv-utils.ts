
import type { DataColumnType } from "../types/dataset";

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

export function parseCSV(content: string): ParsedCSV {
  const text = content.replace(/^\uFEFF/, "");

  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;

      record.push(field);

      if (record.some((value) => value.trim() !== "")) {
        records.push(record);
      }

      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) {
    throw new Error("The CSV contains an unterminated quoted field.");
  }

  record.push(field);

  if (record.some((value) => value.trim() !== "")) {
    records.push(record);
  }

  if (records.length === 0) {
    throw new Error("The CSV file is empty.");
  }

  const rawHeaders = records[0].map((header) => header.trim());

  if (rawHeaders.some((header) => !header)) {
    throw new Error("Every CSV column must have a non-empty header.");
  }

  const headers = makeUniqueHeaders(rawHeaders);
  const rows = records.slice(1);

  const invalidRow = rows.findIndex((row) => row.length !== headers.length);

  if (invalidRow !== -1) {
    throw new Error(
      `Row ${invalidRow + 2} contains ${rows[invalidRow].length} fields; ` +
        `${headers.length} were expected.`,
    );
  }

  return { headers, rows };
}

function makeUniqueHeaders(headers: string[]): string[] {
  const used = new Set<string>();

  return headers.map((header) => {
    let candidate = header;
    let suffix = 2;

    while (used.has(candidate.toLowerCase())) {
      candidate = `${header}_${suffix}`;
      suffix += 1;
    }

    used.add(candidate.toLowerCase());
    return candidate;
  });
}

export function inferColumnType(values: string[]): DataColumnType {
  const populated = values
    .map((value) => value.trim())
    .filter((value) => value !== "");

  if (populated.length === 0) return "null";

  if (
    populated.every((value) => /^(true|false)$/i.test(value))
  ) {
    return "boolean";
  }

  if (
    populated.every((value) => /^[-+]?\d+$/.test(value))
  ) {
    return "integer";
  }

  if (
    populated.every(
      (value) =>
        /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value) &&
        Number.isFinite(Number(value)),
    )
  ) {
    return "float";
  }

  if (
    populated.every((value) => isDateOnly(value))
  ) {
    return "date";
  }

  if (
    populated.every((value) => isDateTime(value))
  ) {
    return "datetime";
  }

  return "string";
}

function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function isDateTime(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

export function isMissingValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

export function convertCSVValue(
  value: string,
  type: DataColumnType,
): unknown {
  if (isMissingValue(value)) return null;

  switch (type) {
    case "integer": {
      const number = Number(value);
      return Number.isSafeInteger(number) ? number : value;
    }

    case "float": {
      const number = Number(value);
      return Number.isFinite(number) ? number : value;
    }

    case "boolean":
      if (/^true$/i.test(value)) return true;
      if (/^false$/i.test(value)) return false;
      return value;

    default:
      return value;
  }
}
