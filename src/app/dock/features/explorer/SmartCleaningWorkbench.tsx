"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { dataQualityEngine } from "./engine/DataQualityEngine";
import { registerDefaultDetectors } from "./engine/registerDefaultDetectors";
import { datasetRegistry } from "../../services/datasets/DatasetRegistry";
import type { QualityIssue, Severity } from "./engine/types";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type DataRow = Record<string, unknown>;
type IssueKind = "missing" | "duplicates" | "whitespace" | "empty" | "case" | "numeric" | "negative-age" | "date" | "placeholder" | "currency" | "boolean" | "conflicting-key" | "outlier" | "constant-empty" | "messy-column";
type DateOrder = "DMY" | "MDY";

type CleaningIssue = {
  id: IssueKind;
  title: string;
  description: string;
  column: string;
  count: number;
  severity: "warning" | "info";
  fixLabel: string;
  safeDateCount?: number;
  ambiguousDateCount?: number;
};

type Props = {
  datasetId: string;
  columns: string[];
  rows: DataRow[];
  onRowsChange: (rows: DataRow[]) => void;
};

const palette = {
  surface: "#202020",
  surfaceRaised: "#262626",
  surfaceHover: "#2d2d2d",
  border: "#3d3d3d",
  text: "#f5f5f5",
  muted: "#a3a3a3",
  subtle: "#858585",
  green: "#42c98b",
  greenSurface: "rgba(66,201,139,0.10)",
  amber: "#d8b16e",
};

const base: Record<string, CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    minWidth: 0,
    minHeight: 0,
    boxSizing: "border-box",
    padding: 14,
    overflow: "auto",
    color: palette.text,
    background: "transparent",
    fontSize: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "2px 0 12px",
    borderBottom: `1px solid ${palette.border}`,
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: palette.green,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.11em",
    textTransform: "uppercase",
  },
  heading: {
    margin: "5px 0 3px",
    color: palette.text,
    fontSize: 16,
    lineHeight: 1.25,
    fontWeight: 650,
    letterSpacing: "-0.025em",
  },
  description: {
    margin: 0,
    color: palette.muted,
    fontSize: 11,
    lineHeight: 1.5,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(55px, auto))",
    gap: 7,
    flexShrink: 0,
  },
  stat: {
    minWidth: 62,
    padding: "7px 9px",
    border: `1px solid ${palette.border}`,
    borderRadius: 6,
    background: palette.surfaceRaised,
  },
  statLabel: {
    display: "block",
    color: palette.muted,
    fontSize: 9,
    whiteSpace: "nowrap",
  },
  statValue: {
    display: "block",
    marginTop: 3,
    color: palette.text,
    fontSize: 15,
    lineHeight: 1.2,
    fontWeight: 650,
    fontVariantNumeric: "tabular-nums",
  },
  status: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: "10px 11px",
    border: `1px solid ${palette.border}`,
    borderRadius: 7,
    background: palette.surfaceRaised,
  },
  statusTitle: {
    margin: 0,
    color: palette.text,
    fontSize: 11,
    fontWeight: 650,
    lineHeight: 1.45,
  },
  statusText: {
    margin: "3px 0 0",
    color: palette.muted,
    fontSize: 10,
    lineHeight: 1.5,
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 7,
  },
  listTitle: {
    margin: 0,
    color: palette.text,
    fontSize: 11,
    fontWeight: 650,
  },
  countPill: {
    padding: "3px 7px",
    border: `1px solid ${palette.border}`,
    borderRadius: 999,
    color: palette.muted,
    fontSize: 9,
    whiteSpace: "nowrap",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  },
  issue: {
    overflow: "hidden",
    border: `1px solid ${palette.border}`,
    borderRadius: 7,
    background: palette.surfaceRaised,
  },
  issueButton: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    width: "100%",
    minWidth: 0,
    minHeight: 45,
    padding: "8px 10px",
    border: 0,
    color: palette.text,
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
  },
  severity: {
    display: "grid",
    placeItems: "center",
    width: 25,
    height: 25,
    flex: "0 0 25px",
    border: `1px solid ${palette.border}`,
    borderRadius: 6,
    color: palette.amber,
    background: "rgba(216,177,110,0.07)",
  },
  issueTitle: {
    display: "block",
    color: palette.text,
    fontSize: 11,
    lineHeight: 1.35,
    fontWeight: 600,
  },
  issueMeta: {
    display: "block",
    marginTop: 3,
    color: palette.muted,
    fontSize: 9,
    lineHeight: 1.35,
    overflowWrap: "anywhere",
  },
  issueBody: {
    padding: "9px 12px 11px 44px",
    borderTop: `1px solid ${palette.border}`,
  },
  bodyText: {
    margin: "0 0 8px",
    color: palette.muted,
    fontSize: 10,
    lineHeight: 1.55,
  },
  caution: {
    margin: "0 0 9px",
    padding: "7px 8px",
    borderLeft: `2px solid ${palette.amber}`,
    color: "#d9c49e",
    background: "rgba(216,177,110,0.06)",
    fontSize: 10,
    lineHeight: 1.5,
  },
  noticeWarning: {
    border: "1px solid rgba(217, 164, 65, 0.42)",
    color: palette.amber,
    background: "rgba(217, 164, 65, 0.08)",
  },
  disabledFixButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  fixButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 29,
    padding: "0 10px",
    border: "1px solid rgba(66,201,139,0.45)",
    borderRadius: 5,
    color: "#c8f4df",
    background: palette.greenSurface,
    fontSize: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "9px 10px",
    border: "1px solid rgba(66,201,139,0.35)",
    borderRadius: 6,
    color: "#c8f4df",
    background: palette.greenSurface,
    fontSize: 10,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 8,
    borderTop: `1px solid ${palette.border}`,
    color: palette.subtle,
    fontSize: 9,
    lineHeight: 1.45,
  },
};

const missing = (value: unknown) =>
  value === null || value === undefined ||
  (typeof value === "string" && value.trim() === "");

function isNumericText(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "" &&
    /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value.trim());
}

function isDateLike(value: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) return false;
  const text = value.trim();
  return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(text) ||
    /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(text) ||
    /^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}$/.test(text) ||
    /^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}$/.test(text);
}

/** Parse only dates whose order is explicit. Ambiguous numeric dates are never guessed. */
function parseUnambiguousDate(value: string): string | null {
  const text = value.trim();
  let year: number;
  let month: number;
  let day: number;
  let match: RegExpMatchArray | null;

  match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) {
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  } else {
    // A named month makes the day/month order explicit.
    match = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
    if (match) {
      day = Number(match[1]);
      year = Number(match[3]);
      month = monthNumber(match[2]);
    } else {
      match = text.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
      if (!match) return null;
      month = monthNumber(match[1]);
      day = Number(match[2]);
      year = Number(match[3]);
    }
  }

  if (!month || month < 1 || month > 12 || day < 1 || day > 31 || year < 1000 || year > 9999) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function monthNumber(name: string): number {
  const normalized = name.toLocaleLowerCase();
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  return months.findIndex((month) => month.startsWith(normalized)) + 1;
}

/** Parse numeric dates only after the user explicitly chooses day/month order. */
function parseNumericDateWithOrder(value: string, order: DateOrder): string | null {
  const text = value.trim();
  const match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (!match) return null;
  const first = Number(match[1]);
  const second = Number(match[2]);
  const year = Number(match[3]);
  const day = order === "DMY" ? first : second;
  const month = order === "DMY" ? second : first;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function isAmbiguousNumericDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(value.trim());
}

function detectIssues(columns: string[], rows: DataRow[]): CleaningIssue[] {
  const issues: CleaningIssue[] = [];

  for (const column of columns) {
    const values = rows.map((row) => row[column]);
    const strings = values.filter(
      (value): value is string => typeof value === "string" && value.trim() !== "",
    );

    const missingCount = values.filter(missing).length;
    if (missingCount > 0) issues.push({
      id: "missing", title: "Missing values", column,
      description: "This column contains null, undefined, or blank values. Missing values are counted separately from formatting issues; choose an appropriate replacement or imputation strategy before filling them.",
      count: missingCount, severity: "warning", fixLabel: "Normalize blank strings",
    });

    const whitespaceCount = strings.filter((value) => value !== value.trim()).length;
    if (whitespaceCount) issues.push({
      id: "whitespace", title: "Extra whitespace", column,
      description: "Leading or trailing spaces can make matching values look different.",
      count: whitespaceCount, severity: "info", fixLabel: "Trim values",
    });

    const emptyCount = values.filter(
      (value) => typeof value === "string" && value.trim() === "",
    ).length;
    if (emptyCount) issues.push({
      id: "empty", title: "Empty strings", column,
      description: "Blank text is not always treated as a true missing value.",
      count: emptyCount, severity: "warning", fixLabel: "Convert blanks to NULL",
    });

    const caseGroups = new Map<string, Set<string>>();
    for (const value of strings) {
      const normalized = value.trim().toLocaleLowerCase();
      if (!caseGroups.has(normalized)) caseGroups.set(normalized, new Set());
      caseGroups.get(normalized)!.add(value.trim());
    }
    const inconsistent = [...caseGroups.values()].filter((group) => group.size > 1).length;
    if (inconsistent) issues.push({
      id: "case", title: "Inconsistent letter case", column,
      description: "Values such as Sales and sales may be the same category written differently.",
      count: inconsistent, severity: "info", fixLabel: "Normalize case",
    });

    const nonMissing = values.filter((value) => !missing(value));
    const numericTextCount = nonMissing.filter(isNumericText).length;
    const nonNumericCount = nonMissing.filter(
      (value) => typeof value !== "number" && !isNumericText(value),
    ).length;
    if (numericTextCount > 0 && nonNumericCount === 0 && numericTextCount === nonMissing.length) {
      issues.push({
        id: "numeric", title: "Numbers stored as text", column,
        description: "These values look numeric but are strings, which can break calculations and sorting.",
        count: numericTextCount, severity: "warning", fixLabel: "Convert to numbers",
      });
    }

    if (/age|years?[_ ]?old/i.test(column)) {
      const negativeCount = values.filter(
        (value) => (typeof value === "number" || isNumericText(value)) && Number(value) < 0,
      ).length;
      if (negativeCount) issues.push({
        id: "negative-age", title: "Impossible negative age", column,
        description: "Negative ages are likely data-entry errors. Review them before changing or removing values.",
        count: negativeCount, severity: "warning", fixLabel: "Set invalid ages to NULL",
      });
    }

    const dateValues = strings.filter(isDateLike);
    const ambiguousDateCount = dateValues.filter((value) =>
      /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(value.trim())
    ).length;
    const safeDateCount = dateValues.filter((value) => {
      const parsed = parseUnambiguousDate(value);
      return parsed !== null && value.trim() !== parsed;
    }).length;
    const dateFormats = new Set(dateValues.map((value) => {
      const text = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return "standard-iso";
      if (/^\d{4}[-/]/.test(text)) return "year-first-nonstandard";
      if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(text)) return "ambiguous-numeric";
      if (/^\d{1,2}\s+[A-Za-z]/.test(text)) return "day-named-month";
      return "named-month-day";
    }));
    // Keep the issue visible only for values that still need attention: safe
    // non-ISO dates can be standardized, while ambiguous numeric dates need review.
    const unresolvedDateCount = safeDateCount + ambiguousDateCount;
    if (unresolvedDateCount > 0 && (dateFormats.size > 1 || ambiguousDateCount > 0 || safeDateCount > 0)) {
      const description = ambiguousDateCount > 0
        ? `${ambiguousDateCount} numeric date${ambiguousDateCount === 1 ? " is" : "s are"} ambiguous and require${ambiguousDateCount === 1 ? "s" : ""} manual review${safeDateCount > 0 ? `; ${safeDateCount} other date${safeDateCount === 1 ? " can" : "s can"} be standardized safely` : ""}.`
        : `${safeDateCount} recognizable date${safeDateCount === 1 ? " needs" : "s need"} standardization to YYYY-MM-DD.`;
      issues.push({
        id: "date", title: ambiguousDateCount > 0 && safeDateCount === 0 ? "Ambiguous numeric dates" : "Mixed date formats", column,
        description,
        count: unresolvedDateCount,
        severity: "warning",
        fixLabel: safeDateCount > 0 ? "Standardize recognizable dates" : "Review ambiguous dates",
        safeDateCount,
        ambiguousDateCount,
      });
    }
  }

  // Placeholder tokens are often mistaken for real values and should be standardized to NULL.
  const placeholderTokens = new Set(["n/a", "na", "n.a.", "unknown", "unk", "-", "--", "?", "not applicable", "null", "none"]);
  for (const column of columns) {
    const values = rows.map((row) => row[column]);
    const placeholderCount = values.filter((value) => typeof value === "string" && placeholderTokens.has(value.trim().toLocaleLowerCase())).length;
    if (placeholderCount > 0) issues.push({
      id: "placeholder", title: "Placeholder text", column,
      description: "Values such as N/A, unknown, a dash, or ? may represent missing data. Convert them to NULL only when that meaning is correct for this column.",
      count: placeholderCount, severity: "warning", fixLabel: "Convert placeholders to NULL",
    });

    const present = values.filter((value) => !missing(value));
    const currencyText = present.filter((value) => typeof value === "string" && /^\s*[$€£₹]?\s*-?\d[\d,]*(?:\.\d+)?\s*[$€£₹]?\s*$/.test(value.trim()));
    const hasCurrencyMarkers = currencyText.some((value) => typeof value === "string" && /[$€£₹,]/.test(value));
    if (currencyText.length > 0 && currencyText.length === present.length && hasCurrencyMarkers) issues.push({
      id: "currency", title: "Currency / formatted numbers stored as text", column,
      description: "Currency symbols and thousands separators prevent numeric calculations. Preview the conversion before applying it; currency symbols are removed but values are not converted between currencies.",
      count: currencyText.length, severity: "warning", fixLabel: "Convert formatted numbers",
    });

    const normalizedBoolean = (value: unknown): boolean | null => {
      if (typeof value !== "string") return null;
      const token = value.trim().toLocaleLowerCase();
      if (["yes", "y", "true", "1"].includes(token)) return true;
      if (["no", "n", "false", "0"].includes(token)) return false;
      return null;
    };
    const booleanTokens = present.filter((value) => typeof value === "boolean" || normalizedBoolean(value) !== null);
    if (booleanTokens.length > 0 && booleanTokens.length === present.length && present.some((value) => typeof value === "string")) issues.push({
      id: "boolean", title: "Yes/no stored as text", column,
      description: "Recognizable yes/no, Y/N, true/false, or 1/0 values can be converted to boolean values. Values outside these forms are not guessed.",
      count: booleanTokens.length, severity: "info", fixLabel: "Convert to true/false",
    });

    if (present.length > 1 && present.every((value) => Object.is(value, present[0]))) {
      issues.push({ id: "constant-empty", title: "Constant column", column,
        description: `Every populated value in this column is the same (${String(present[0])}). It may be redundant, but review downstream dependencies before removing it.`,
        count: present.length, severity: "info", fixLabel: "Review constant column" });
    }

    if (values.every((value) => missing(value))) {
      issues.push({ id: "constant-empty", title: "Empty column", column,
        description: "Every value in this column is missing. Review whether the column should be retained before dropping it.",
        count: values.length, severity: "warning", fixLabel: "Review empty column" });
    }

    if (/[\s$%()[\]{}]/.test(column) || /[^a-zA-Z0-9_]/.test(column)) {
      issues.push({ id: "messy-column", title: "Messy column name", column,
        description: "Spaces or symbols can require quoting in SQL and make column references harder to maintain. A SQL-safe name could be suggested, but renaming requires updating the dataset schema as well as its rows.",
        count: 1, severity: "info", fixLabel: "Review column name" });
    }
  }

  // Detect duplicate identifiers that point to conflicting records; this is not the same as an exact duplicate row.
  const keyColumn = columns.find((column) => /^(id|.*_id|.*id|key)$/i.test(column));
  if (keyColumn) {
    const keyRows = new Map<string, DataRow[]>();
    for (const row of rows) {
      const key = row[keyColumn];
      if (missing(key)) continue;
      const token = String(key).trim();
      if (!keyRows.has(token)) keyRows.set(token, []);
      keyRows.get(token)!.push(row);
    }
    const conflicts = [...keyRows.entries()].filter(([, group]) => new Set(group.map((row) => JSON.stringify(columns.filter((column) => column !== keyColumn).map((column) => row[column] ?? null)))).size > 1);
    if (conflicts.length) issues.push({
      id: "conflicting-key", title: "Conflicting key", column: keyColumn,
      description: `${conflicts.length} identifier${conflicts.length === 1 ? " is" : "s are"} shared by different records. These are not safe to merge automatically; inspect the rows and decide which identifier or record is correct.`,
      count: conflicts.length, severity: "warning", fixLabel: "Review conflicting keys",
    });
  }

  // Flag numeric outliers with a conservative IQR fence; never modify them automatically.
  for (const column of columns) {
    const numeric = rows.map((row) => row[column]).filter((value): value is number => typeof value === "number" && Number.isFinite(value)).sort((a, b) => a - b);
    if (numeric.length < 8) continue;
    const quantile = (q: number) => numeric[Math.min(numeric.length - 1, Math.floor((numeric.length - 1) * q))];
    const q1 = quantile(0.25), q3 = quantile(0.75), iqr = q3 - q1;
    if (iqr <= 0) continue;
    const low = q1 - 1.5 * iqr, high = q3 + 1.5 * iqr;
    const outliers = numeric.filter((value) => value < low || value > high);
    if (outliers.length) issues.push({
      id: "outlier", title: "Possible outlier", column,
      description: `${outliers.length} numeric value${outliers.length === 1 ? " falls" : "s fall"} outside the 1.5×IQR fences (${low.toLocaleString()} to ${high.toLocaleString()}). This is a statistical signal, not proof of an error; keep, cap, or remove only after review.`,
      count: outliers.length, severity: "info", fixLabel: "Review outliers",
    });
  }

  // Count duplicate records by comparing values in the selected dataset columns.
  // Keep the first occurrence and report each additional matching row as a duplicate.
  const seenRows = new Set<string>();
  let duplicateCount = 0;
  for (const row of rows) {
    const signature = JSON.stringify(columns.map((column) => row[column] ?? null));
    if (seenRows.has(signature)) duplicateCount += 1;
    else seenRows.add(signature);
  }
  if (duplicateCount > 0) issues.push({
    id: "duplicates", title: "Duplicate rows", column: "All columns",
    description: "Rows with identical values across the selected columns were found. Removing duplicates keeps the first occurrence and removes later matching rows. Review the dataset first if repeated records can be meaningful.",
    count: duplicateCount, severity: "warning", fixLabel: "Remove duplicate rows",
  });

  return issues;
}

// Reuse the shared engine's severity for matching findings while retaining
// the existing local fallback for cleaning-only detections.
const ENGINE_DETECTORS_BY_CLEANING_ISSUE: Record<IssueKind, string[]> = {
  missing: ["missing-values"],
  duplicates: ["duplicate-rows"],
  whitespace: ["whitespace"],
  empty: ["placeholder-values", "missing-values", "column-structure"],
  case: ["category-consistency"],
  numeric: ["type-mismatch"],
  "negative-age": ["range-validation"],
  date: ["date-time-validation"],
  placeholder: ["placeholder-values"],
  currency: ["type-mismatch"],
  boolean: ["allowed-values"],
  "conflicting-key": ["cross-column-consistency", "referential-integrity"],
  outlier: ["numeric-outliers"],
  "constant-empty": ["column-structure"],
  "messy-column": ["schema-validation", "column-structure"],
};

function issueSeverity(
  issue: CleaningIssue,
  rowCount: number,
  engineIssues: QualityIssue[] = [],
): "High" | "Medium" | "Low" {
  const detectorIds = ENGINE_DETECTORS_BY_CLEANING_ISSUE[issue.id];
  const matching = engineIssues.filter((finding) =>
    detectorIds.includes(finding.detectorId) &&
    (issue.column === "All columns" || finding.columns.length === 0 || finding.columns.includes(issue.column)),
  );

  if (matching.length > 0) {
    const rank: Record<Severity, number> = { info: 0, warning: 1, high: 2, critical: 3 };
    const strongest = matching.reduce(
      (current, finding) => rank[finding.severity] > rank[current] ? finding.severity : current,
      matching[0].severity,
    );
    return strongest === "critical" || strongest === "high"
      ? "High"
      : strongest === "warning" ? "Medium" : "Low";
  }

  const rowShare = rowCount > 0 ? issue.count / rowCount : 0;
  if (issue.id === "conflicting-key" || issue.id === "negative-age" || issue.id === "empty") return "High";
  if ((issue.id === "missing" || issue.id === "duplicates") && rowShare >= 0.2) return "High";
  if (issue.id === "outlier" || issue.id === "case") return "Low";
  return "Medium";
}

export default function SmartCleaningWorkbench({
  datasetId,
  columns,
  rows,
  onRowsChange,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageIsWarning, setMessageIsWarning] = useState(false);
  const [dateResolutionColumn, setDateResolutionColumn] = useState<string | null>(null);
  const [dateOrder, setDateOrder] = useState<DateOrder>("DMY");
  const [missingReplacementByColumn, setMissingReplacementByColumn] = useState<Record<string, string>>({});
  const [missingFillPreview, setMissingFillPreview] = useState<{
    column: string;
    rawReplacement: string;
    replacement: unknown;
  } | null>(null);
  const [scanVersion, setScanVersion] = useState(0);
  const [undoSnapshot, setUndoSnapshot] = useState<{ rows: DataRow[]; label: string } | null>(null);
  const [appliedChanges, setAppliedChanges] = useState<Array<{ id: number; label: string; changed: number; at: string }>>([]);
  const [safeFixPreview, setSafeFixPreview] = useState<{ rows: DataRow[]; changed: number } | null>(null);

  useEffect(() => {
    setUndoSnapshot(null);
    setAppliedChanges([]);
    setSafeFixPreview(null);
    setMissingFillPreview(null);
    setExpanded(null);
  }, [datasetId]);

  // Schema edits made in the Schema panel update the shared registry.
  // Subscribe so an already-open cleaning workbench immediately rescans
  // with the latest suggested or confirmed schema.
  useEffect(() => {
    return datasetRegistry.subscribe(() => {
      setScanVersion((version) => version + 1);
    });
  }, [datasetId]);

  function commitRows(nextRows: DataRow[], label: string, changed: number) {
    // Keep one-step undo local to this workbench; the parent remains the source of truth.
    onRowsChange(nextRows);
    setUndoSnapshot({ rows, label });
    setAppliedChanges((current) => [
      { id: Date.now(), label, changed, at: new Date().toLocaleTimeString() },
      ...current,
    ].slice(0, 12));
    setSafeFixPreview(null);
  }

  function undoLastChange() {
    if (!undoSnapshot) return;
    try {
      onRowsChange(undoSnapshot.rows);
      setMessageIsWarning(false);
      setMessage(`Undid the most recent change: ${undoSnapshot.label}.`);
      setAppliedChanges((current) => current.slice(1));
      setUndoSnapshot(null);
      setSafeFixPreview(null);
      setExpanded(null);
      setScanVersion((version) => version + 1);
    } catch (error) {
      setMessageIsWarning(true);
      setMessage(`Could not undo the last change: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Run the shared Dock quality engine. Its summary is the authoritative
  // source for issue counts, dimension evaluations, and the overall score.
  // The local detector list remains in place for existing cleaning actions
  // and previews.
  const engineScan = useMemo(() => {
    registerDefaultDetectors();
    return dataQualityEngine.scan({
      datasetId,
      columns,
      rows,
      schema: datasetRegistry.getSchema(datasetId),
    });
  }, [datasetId, columns, rows, scanVersion]);

  const sharedQuality = engineScan.summary;
  const evaluatedCheckCount = sharedQuality.dimensions.reduce(
    (total, dimension) => total + dimension.evaluatedChecks,
    0,
  );
  const totalCheckCount = engineScan.detectorResults.length;
  const skippedCheckCount = Math.max(0, totalCheckCount - evaluatedCheckCount);

  const issues = useMemo(() => detectIssues(columns, rows), [columns, rows, scanVersion]);
  const safeIssues = useMemo(
    () => issues.filter((issue) => issue.id === "whitespace" || issue.id === "empty"),
    [issues],
  );
  const totalAffected = useMemo(() => {
    const affected = new Set<string>();
    for (const issue of issues) affected.add(`${issue.id}:${issue.column}`);
    return affected.size;
  }, [issues]);
  const severityCounts = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    for (const issue of issues) counts[issueSeverity(issue, rows.length, engineScan.issues)] += 1;
    return counts;
  }, [issues, rows.length, engineScan.issues]);
  const qualityScore = sharedQuality.score;
  const qualityLabel =
    qualityScore === null
      ? "Not evaluated"
      : qualityScore >= 85
        ? "Good"
        : qualityScore >= 70
          ? "Fair"
          : "Needs attention";

  useEffect(() => {
    if (expanded && !issues.some((issue) => `${issue.id}:${issue.column}` === expanded)) {
      setExpanded(null);
    }
  }, [expanded, issues]);

  function fillMissingValues(issue: CleaningIssue) {
    const rawReplacement = missingReplacementByColumn[issue.column] ?? "";
    if (rawReplacement.trim() === "") {
      setMessageIsWarning(true);
      setMessage(`Enter a replacement value for "${issue.column}" before filling missing cells.`);
      setMissingFillPreview(null);
      return;
    }

    const existingValues = rows
      .map((row) => row[issue.column])
      .filter((value) => !missing(value));
    const looksNumericColumn =
      /salary|age|count|amount|price|score|income|number|quantity|years?/i.test(issue.column) ||
      (existingValues.length > 0 &&
        existingValues.every((value) =>
          typeof value === "number" ||
          (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))),
        ));
    const trimmedReplacement = rawReplacement.trim();
    const replacement: unknown =
      looksNumericColumn && Number.isFinite(Number(trimmedReplacement))
        ? Number(trimmedReplacement)
        : rawReplacement;

    const previewIsCurrent =
      missingFillPreview?.column === issue.column &&
      missingFillPreview.rawReplacement === rawReplacement &&
      Object.is(missingFillPreview.replacement, replacement);

    // First click prepares a preview. A second click confirms the exact value.
    if (!previewIsCurrent) {
      setMissingFillPreview({ column: issue.column, rawReplacement, replacement });
      setMessageIsWarning(false);
      setMessage(`Preview ready for "${issue.column}". Review the affected rows and proposed value, then confirm the fill.`);
      return;
    }

    let filled = 0;
    const nextRows = rows.map((row) => {
      if (!missing(row[issue.column])) return row;
      filled += 1;
      return { ...row, [issue.column]: replacement };
    });

    if (filled === 0) {
      setMessageIsWarning(true);
      setMessage(`No missing cells remain in "${issue.column}". Re-scan to refresh the issue list.`);
      setMissingFillPreview(null);
      return;
    }

    try {
      commitRows(nextRows, `Filled missing values in ${issue.column}`, filled);
      setMessageIsWarning(false);
      setMessage(`Filled ${filled} missing cell${filled === 1 ? "" : "s"} in "${issue.column}" with ${JSON.stringify(replacement)}.`);
      setMissingFillPreview(null);
      setExpanded(null);
    } catch (error) {
      setMessageIsWarning(true);
      setMessage(`The replacement was prepared, but the dataset update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  function applyFix(issue: CleaningIssue) {
    let changed = 0;
    let skippedAmbiguousDates = 0;

    if (issue.id === "duplicates") {
      const seen = new Set<string>();
      const nextRows = rows.filter((row) => {
        const signature = JSON.stringify(columns.map((column) => row[column] ?? null));
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });
      const removed = rows.length - nextRows.length;
      if (removed > 0) {
        commitRows(nextRows, "Removed duplicate rows", removed);
        setExpanded(null);
        setMessageIsWarning(false);
        setMessage(`Removed ${removed} duplicate row${removed === 1 ? "" : "s"}. The first occurrence of each row was kept.`);
      } else {
        setMessageIsWarning(true);
        setMessage("No duplicate rows were removed. The dataset may have changed; scan again to refresh the results.");
      }
      return;
    }

    if (issue.id === "missing") {
      // This action is column-scoped: the card describes this column, so only
      // blank strings in this column are normalized. NULL/undefined are kept.
      const nextRows = rows.map((row) => {
        const value = row[issue.column];
        if (typeof value === "string" && value.trim() === "") {
          changed += 1;
          return { ...row, [issue.column]: null };
        }
        return row;
      });

      if (changed > 0) {
        try {
          commitRows(nextRows, `Normalized blank strings in ${issue.column}`, changed);
          setExpanded(null);
          setMissingFillPreview(null);
          setMessageIsWarning(false);
          setMessage(`Converted ${changed} blank string${changed === 1 ? "" : "s"} in "${issue.column}" to NULL. Existing NULL/undefined values were left unchanged.`);
        } catch (error) {
          setMessageIsWarning(true);
          setMessage(`Found ${changed} blank string${changed === 1 ? "" : "s"} in "${issue.column}", but updating the dataset failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        setMessageIsWarning(true);
        setMessage(`No blank strings exist in "${issue.column}". Use the replacement field above to preview and fill its NULL/undefined values.`);
      }
      return;
    }

    if (["conflicting-key", "outlier", "constant-empty", "messy-column"].includes(issue.id)) {
      setMessageIsWarning(false);
      setMessage(`${issue.title} is a review finding. No data was changed; inspect the affected records or schema before deciding what to do.`);
      return;
    }

    // For casing conflicts, select the most common existing spelling per normalized group.
    // This avoids forcing every category in the column into title case.
    const canonicalByNormalizedValue = new Map<string, string>();
    if (issue.id === "case") {
      const groups = new Map<string, Map<string, number>>();
      for (const row of rows) {
        const value = row[issue.column];
        if (typeof value !== "string" || !value.trim()) continue;
        const trimmed = value.trim();
        const normalized = trimmed.toLocaleLowerCase();
        if (!groups.has(normalized)) groups.set(normalized, new Map());
        const variants = groups.get(normalized)!;
        variants.set(trimmed, (variants.get(trimmed) ?? 0) + 1);
      }
      for (const [normalized, variants] of groups) {
        if (variants.size < 2) continue;
        const canonical = [...variants.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        if (canonical) canonicalByNormalizedValue.set(normalized, canonical);
      }
    }

    const nextRows = rows.map((row) => {
      const value = row[issue.column];
      let nextValue = value;

      if (issue.id === "whitespace" && typeof value === "string") {
        nextValue = value.trim();
      } else if (issue.id === "empty" && typeof value === "string" && value.trim() === "") {
        nextValue = null;
      } else if (issue.id === "case" && typeof value === "string" && value.trim() !== "") {
        const trimmed = value.trim();
        const canonical = canonicalByNormalizedValue.get(trimmed.toLocaleLowerCase());
        if (canonical) nextValue = canonical;
      } else if (issue.id === "numeric" && isNumericText(value)) {
        const numericValue = Number(String(value).trim());
        if (Number.isFinite(numericValue)) nextValue = numericValue;
      } else if (issue.id === "currency" && typeof value === "string") {
        const cleaned = value.trim().replace(/[$€£₹,\s]/g, "");
        const numericValue = Number(cleaned);
        if (cleaned !== "" && Number.isFinite(numericValue)) nextValue = numericValue;
      } else if (issue.id === "boolean" && typeof value === "string") {
        const token = value.trim().toLocaleLowerCase();
        if (["yes", "y", "true", "1"].includes(token)) nextValue = true;
        else if (["no", "n", "false", "0"].includes(token)) nextValue = false;
      } else if (issue.id === "placeholder" && typeof value === "string" && ["n/a", "na", "n.a.", "unknown", "unk", "-", "--", "?", "not applicable", "null", "none"].includes(value.trim().toLocaleLowerCase())) {
        nextValue = null;
      } else if (issue.id === "negative-age" && (typeof value === "number" || isNumericText(value)) && Number(value) < 0) {
        nextValue = null;
      } else if (issue.id === "date" && typeof value === "string" && isDateLike(value)) {
        const normalizedDate = parseUnambiguousDate(value);
        if (normalizedDate) nextValue = normalizedDate;
        else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(value.trim())) skippedAmbiguousDates += 1;
      }

      if (!Object.is(nextValue, value)) changed += 1;
      return Object.is(nextValue, value) ? row : { ...row, [issue.column]: nextValue };
    });

    if (changed > 0) {
      try {
        commitRows(nextRows, `${issue.title} in ${issue.column}`, changed);
      } catch (error) {
        setMessageIsWarning(true);
        setMessage(`The cleaning action ran, but the dataset update failed: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
      setExpanded(null);
      setMessageIsWarning(skippedAmbiguousDates > 0);
      const actionLabel = issue.id === "whitespace" ? "Trimmed" :
        issue.id === "empty" ? "Converted" :
        issue.id === "case" ? "Normalized" :
        issue.id === "numeric" || issue.id === "currency" ? "Converted" :
        issue.id === "boolean" ? "Converted" :
        issue.id === "placeholder" ? "Converted placeholders to NULL in" :
        issue.id === "negative-age" ? "Set invalid ages to NULL in" : "Standardized";
      setMessage(
        `${actionLabel} ${changed} value${changed === 1 ? "" : "s"} in "${issue.column}".` +
        (skippedAmbiguousDates ? ` Left ${skippedAmbiguousDates} ambiguous numeric date${skippedAmbiguousDates === 1 ? "" : "s"} unchanged for manual review.` : ""),
      );
    } else if (issue.id === "date" && skippedAmbiguousDates > 0) {
      setMessageIsWarning(true);
      setMessage(`No dates were changed in "${issue.column}". All remaining numeric dates are ambiguous; choose the intended day/month order before converting.`);
    } else {
      setMessageIsWarning(true);
      setMessage(`No values changed for "${issue.column}". The values may already be normalized or need manual review.`);
    }
  }

  function applyDateResolution(issue: CleaningIssue) {
    let converted = 0;
    let skipped = 0;
    const nextRows = rows.map((row) => {
      const value = row[issue.column];
      if (typeof value !== "string" || !isDateLike(value)) return row;
      const normalized = parseUnambiguousDate(value) ??
        (isAmbiguousNumericDate(value) ? parseNumericDateWithOrder(value, dateOrder) : null);
      if (!normalized) {
        skipped += 1;
        return row;
      }
      if (normalized === value.trim()) return row;
      converted += 1;
      return { ...row, [issue.column]: normalized };
    });

    if (converted > 0) {
      try {
        commitRows(nextRows, `Standardized dates in ${issue.column}`, converted);
      } catch (error) {
        setMessageIsWarning(true);
        setMessage(`Date conversion ran, but the dataset update failed: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
      setDateResolutionColumn(null);
      setExpanded(null);
      setMessageIsWarning(skipped > 0);
      setMessage(`Standardized ${converted} date value${converted === 1 ? "" : "s"} in "${issue.column}" using ${dateOrder === "DMY" ? "DD/MM/YYYY (day first)" : "MM/DD/YYYY (month first)"}.` +
        (skipped ? ` Left ${skipped} invalid or unsupported date value${skipped === 1 ? "" : "s"} unchanged.` : ""));
    } else {
      setMessageIsWarning(true);
      setMessage(`No dates were changed in "${issue.column}". The values may be invalid or use a format this tool cannot safely parse.`);
    }
  }

  function previewDate(value: string): string {
    return parseUnambiguousDate(value) ??
      (isAmbiguousNumericDate(value) ? parseNumericDateWithOrder(value, dateOrder) : null) ??
      "Will remain unchanged";
  }

  if (!columns.length) {
    return (
      <section style={base.root} aria-label="Smart cleaning">
        <header style={base.header}>
          <div>
            <div style={base.eyebrow}><Sparkles size={13} /> Data cleaning</div>
            <h2 style={base.heading}>Smart cleaning</h2>
            <p style={base.description}>Scan and clean common data-quality issues.</p>
          </div>
        </header>
        <div style={base.status}>
          <AlertTriangle size={16} color={palette.muted} />
          <div>
            <p style={base.statusTitle}>No dataset selected</p>
            <p style={base.statusText}>Import or select a dataset to scan its columns.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={base.root} aria-label="Smart cleaning workbench">
      <header style={base.header}>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <div style={base.eyebrow}><Sparkles size={13} /> Data cleaning</div>
          <h2 style={base.heading}>Clean</h2>
          <p style={base.description}>Review detected issues, inspect proposed changes, and apply fixes deliberately.</p>
          <p style={{ ...base.description, marginTop: 5, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", overflowWrap: "anywhere" }}>{datasetId}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7 }}>
          <div style={base.stats} aria-label="Dataset scan summary">
          <div style={base.stat}>
            <span style={base.statLabel}>Detected issues</span>
            <strong style={base.statValue}>{issues.length.toLocaleString()}</strong>
          </div>
          <div style={base.stat}>
            <span style={base.statLabel}>Rows</span>
            <strong style={base.statValue}>{rows.length.toLocaleString()}</strong>
          </div>
          <div style={base.stat}>
            <span style={base.statLabel}>Columns</span>
            <strong style={base.statValue}>{columns.length.toLocaleString()}</strong>
          </div>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setScanVersion((v) => v + 1); setMessage(""); setExpanded(null); }} style={{ ...base.fixButton, border: `1px solid ${palette.border}`, color: palette.text, background: palette.surfaceRaised }}>
              <ChevronDown size={13} style={{ transform: "rotate(180deg)" }} /> Re-scan
            </button>
            <button type="button" disabled={safeIssues.length === 0} onClick={() => {
              if (safeFixPreview) {
                try {
                  commitRows(safeFixPreview.rows, "Applied all safe formatting fixes", safeFixPreview.changed);
                  setMessageIsWarning(false);
                  setMessage(`Applied ${safeFixPreview.changed} safe formatting fix${safeFixPreview.changed === 1 ? "" : "es"}. Whitespace was trimmed and blank strings were converted to NULL.`);
                  setExpanded(null);
                } catch (error) {
                  setMessageIsWarning(true);
                  setMessage(`Could not apply safe fixes: ${error instanceof Error ? error.message : String(error)}`);
                }
                return;
              }
              let changed = 0;
              const nextRows = rows.map((row) => {
                let nextRow = row;
                for (const issue of safeIssues) {
                  const value = row[issue.column];
                  let nextValue = value;
                  if (issue.id === "whitespace" && typeof value === "string") nextValue = value.trim();
                  if (issue.id === "empty" && typeof value === "string" && value.trim() === "") nextValue = null;
                  if (!Object.is(nextValue, value)) { if (nextRow === row) nextRow = { ...row }; nextRow[issue.column] = nextValue; changed += 1; }
                }
                return nextRow;
              });
              if (!changed) { setMessageIsWarning(true); setMessage("No safe formatting changes remain. Re-scan to refresh the issue list."); return; }
              setSafeFixPreview({ rows: nextRows, changed });
              setMessageIsWarning(false);
              setMessage(`Preview ready: ${changed} cell${changed === 1 ? "" : "s"} will change. Confirm to apply, or cancel to leave the dataset untouched.`);
            }} style={{ ...base.fixButton, opacity: safeIssues.length === 0 ? 0.45 : 1, cursor: safeIssues.length === 0 ? "not-allowed" : "pointer" }}>
              <CheckCircle2 size={13} /> {safeFixPreview ? `Confirm ${safeFixPreview.changed} fixes` : `Preview all safe fixes (${safeIssues.length})`}
            </button>
            {undoSnapshot && <button type="button" onClick={undoLastChange} style={{ ...base.fixButton, border: `1px solid ${palette.border}`, color: palette.text, background: "transparent" }}>Undo last change</button>}
          </div>
        </div>
      </header>

      {safeFixPreview && (
        <div style={{ border: `1px solid ${palette.green}`, borderRadius: 6, padding: 10, background: palette.greenSurface }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ color: palette.text, fontSize: 11 }}>Safe-fix preview · {safeFixPreview.changed.toLocaleString()} cells will change</strong>
            <button type="button" onClick={() => { setSafeFixPreview(null); setMessage("Safe-fix preview cancelled. No data was changed."); }} style={{ ...base.fixButton, border: `1px solid ${palette.border}`, color: palette.muted, background: "transparent" }}>Cancel preview</button>
          </div>
          <p style={{ ...base.bodyText, margin: "6px 0 0" }}>Whitespace-only padding will be trimmed and blank strings converted to NULL. Review the affected issue cards before confirming.</p>
        </div>
      )}
      {appliedChanges.length > 0 && (
        <div style={{ border: `1px solid ${palette.border}`, borderRadius: 6, padding: 9, background: palette.surfaceRaised }}>
          <div style={{ color: palette.text, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Applied changes</div>
          <div style={{ display: "grid", gap: 5 }}>
            {appliedChanges.map((entry) => (
              <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, color: palette.muted, fontSize: 9 }}>
                <span>{entry.label}</span><span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{entry.changed.toLocaleString()} · {entry.at}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...base.status, padding: "8px 10px", fontSize: 10 }}>
        <AlertTriangle size={13} color={palette.muted} style={{ flexShrink: 0, marginTop: 1 }} />
        <span style={{ color: palette.muted }}>Nothing changes until you apply a fix. Review previews and ambiguous values before confirming; changes update the active dataset.</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 14px", padding: "8px 10px", border: `1px solid ${palette.border}`, borderRadius: 6, background: palette.surfaceRaised }} aria-label="Quality summary">
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, paddingRight: 12, borderRight: `1px solid ${palette.border}` }}>
          <strong style={{ color: palette.text, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>{qualityScore === null ? "—" : `${qualityScore}/100`}</strong>
          <span style={{ color: qualityScore === null ? palette.muted : qualityScore >= 85 ? palette.green : qualityScore >= 70 ? palette.amber : "#d98c85", fontSize: 10, fontWeight: 650 }}>{qualityLabel}</span>
        </div>
        {(["High", "Medium", "Low"] as const).map((severity) => {
          const color = severity === "High" ? "#d98c85" : severity === "Medium" ? palette.amber : palette.muted;
          return <span key={severity} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: palette.muted, fontSize: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
            <strong style={{ color, fontVariantNumeric: "tabular-nums" }}>{severityCounts[severity]}</strong> {severity}
          </span>;
        })}
        <span style={{ marginLeft: "auto", color: palette.muted, fontSize: 10, fontVariantNumeric: "tabular-nums" }}>{issues.length} total</span>
      </div>
      <div style={{ padding: "0 2px", color: palette.muted, fontSize: 10 }} aria-label="Quality check coverage">
        {totalCheckCount === 0
          ? "No detector checks were registered for this scan."
          : `Based on ${evaluatedCheckCount} of ${totalCheckCount} checks${skippedCheckCount > 0 ? ` · ${skippedCheckCount} skipped` : ""}.`}
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", padding: "0 2px", color: palette.muted, fontSize: 10 }}
        aria-label="Quality dimension breakdown"
      >
        {(["completeness", "validity", "uniqueness", "consistency"] as const).map((dimension) => {
          const result = sharedQuality.dimensions.find((item) => item.dimension === dimension);
          const label = dimension[0].toUpperCase() + dimension.slice(1);
          return (
            <span key={dimension}>
              {label}: <strong style={{ color: palette.text, fontVariantNumeric: "tabular-nums" }}>
                {result?.score === null || result?.score === undefined ? "N/E" : `${result.score}/100`}
              </strong>
            </span>
          );
        })}
      </div>

      {message && (
        <div style={{ ...base.notice, ...(messageIsWarning ? base.noticeWarning : {}) }} role="status">
          {messageIsWarning
            ? <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            : <Check size={14} style={{ flexShrink: 0, marginTop: 1 }} />}
          <span>{message}</span>
        </div>
      )}

      {issues.length === 0 ? (
        <div style={base.status}>
          <CheckCircle2 size={17} color={palette.green} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ minWidth: 0 }}>
            <p style={base.statusTitle}>No common issues detected</p>
            <p style={base.statusText}>
              This scan found no obvious whitespace, blank, type, case, age, or date-format problems. It does not guarantee that the dataset is correct.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div style={base.listHeader}>
            <h3 style={base.listTitle}>Detected issues</h3>
            <span style={base.countPill}>{issues.length} to review · {totalAffected} column checks</span>
          </div>
          <div style={base.list}>
            {issues.map((issue) => {
              const key = `${issue.id}:${issue.column}`;
              const isOpen = expanded === key;
              return (
                <article style={base.issue} key={key}>
                  <button
                    type="button"
                    style={base.issueButton}
                    onClick={() => setExpanded(isOpen ? null : key)}
                    aria-expanded={isOpen}
                    onMouseEnter={(event) => { event.currentTarget.style.background = palette.surfaceHover; }}
                    onMouseLeave={(event) => { event.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", minWidth: 48, height: 20, padding: "0 6px", border: `1px solid ${issueSeverity(issue, rows.length, engineScan.issues) === "High" ? "rgba(217,140,133,0.45)" : issueSeverity(issue, rows.length, engineScan.issues) === "Medium" ? "rgba(216,177,110,0.45)" : palette.border}`, borderRadius: 4, color: issueSeverity(issue, rows.length, engineScan.issues) === "High" ? "#d98c85" : issueSeverity(issue, rows.length, engineScan.issues) === "Medium" ? palette.amber : palette.muted, background: issueSeverity(issue, rows.length, engineScan.issues) === "High" ? "rgba(217,140,133,0.08)" : issueSeverity(issue, rows.length, engineScan.issues) === "Medium" ? "rgba(216,177,110,0.07)" : "rgba(163,163,163,0.06)", fontSize: 9, fontWeight: 700 }}>
                      {issueSeverity(issue, rows.length, engineScan.issues)}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={base.issueTitle}>{issue.title}</span>
                      <span style={base.issueMeta}>
                        {issue.column} · {issue.count.toLocaleString()} {issue.id === "case" ? "conflicting value groups" : issue.id === "duplicates" ? "duplicate rows" : issue.id === "missing" ? "missing values" : "affected values"}
                      </span>
                    </span>
                    {isOpen ? <ChevronDown size={14} color={palette.muted} /> : <ChevronRight size={14} color={palette.muted} />}
                  </button>
                  {isOpen && (
                    <div style={base.issueBody}>
                      <p style={base.bodyText}>{issue.description}</p>
                      {issue.id !== "missing" && issue.id !== "duplicates" && issue.id !== "date" && (() => {
                        const previewRows = rows.map((row, index) => ({ row, index, value: row[issue.column] })).filter(({ value }) => {
                          if (issue.id === "whitespace") return typeof value === "string" && value !== value.trim();
                          if (issue.id === "empty") return typeof value === "string" && value.trim() === "";
                          if (issue.id === "case") return typeof value === "string" && value.trim() !== "";
                          if (issue.id === "numeric") return isNumericText(value);
                          if (issue.id === "negative-age") return (typeof value === "number" || isNumericText(value)) && Number(value) < 0;
                          if (issue.id === "placeholder") return typeof value === "string" && ["n/a", "na", "n.a.", "unknown", "unk", "-", "--", "?", "not applicable", "null", "none"].includes(value.trim().toLowerCase());
                          if (issue.id === "currency") return typeof value === "string" && /^\s*[$€£₹]?\s*-?\d[\d,]*(?:\.\d+)?\s*[$€£₹]?\s*$/.test(value.trim()) && /[$€£₹,]/.test(value);
                          if (issue.id === "boolean") return typeof value === "string" && ["yes", "y", "true", "1", "no", "n", "false", "0"].includes(value.trim().toLowerCase());
                          if (issue.id === "date") return typeof value === "string" && isDateLike(value);
                          return false;
                        }).slice(0, 5);
                        if (!previewRows.length) return null;
                        return <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 7, margin: "0 0 10px" }}>
                          <div style={{ border: `1px solid ${palette.border}`, borderRadius: 5, overflow: "hidden", minWidth: 0 }}>
                            <div style={{ padding: "5px 8px", background: palette.surface, color: palette.muted, fontSize: 9, borderBottom: `1px solid ${palette.border}` }}>Before</div>
                            {previewRows.map(({ value, index }) => <div key={`before-${index}`} style={{ padding: "5px 8px", borderBottom: `1px solid ${palette.border}`, color: "#d98c85", fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", overflowWrap: "anywhere" }}>{value === null || value === undefined ? "NULL" : JSON.stringify(value)}</div>)}
                          </div>
                          <div style={{ border: `1px solid ${palette.border}`, borderRadius: 5, overflow: "hidden", minWidth: 0 }}>
                            <div style={{ padding: "5px 8px", background: palette.surface, color: palette.muted, fontSize: 9, borderBottom: `1px solid ${palette.border}` }}>After · proposed</div>
                            {previewRows.map(({ value, index }) => {
                              let next: unknown = value;
                              if (issue.id === "whitespace" && typeof value === "string") next = value.trim();
                              else if (issue.id === "empty") next = null;
                              else if (issue.id === "numeric" && isNumericText(value)) next = Number(String(value).trim());
                              else if (issue.id === "currency" && typeof value === "string") { const cleaned = value.trim().replace(/[$€£₹,\s]/g, ""); const parsed = Number(cleaned); if (cleaned && Number.isFinite(parsed)) next = parsed; }
                              else if (issue.id === "boolean" && typeof value === "string") { const token = value.trim().toLowerCase(); if (["yes", "y", "true", "1"].includes(token)) next = true; else if (["no", "n", "false", "0"].includes(token)) next = false; }
                              else if (issue.id === "placeholder" && typeof value === "string" && ["n/a", "na", "n.a.", "unknown", "unk", "-", "--", "?", "not applicable", "null", "none"].includes(value.trim().toLowerCase())) next = null;
                              else if (issue.id === "negative-age") next = null;
                              return <div key={`after-${index}`} style={{ padding: "5px 8px", borderBottom: `1px solid ${palette.border}`, color: "#7fd8ad", fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", overflowWrap: "anywhere" }}>{next === null || next === undefined ? "NULL" : JSON.stringify(next)}</div>;
                            })}
                          </div>
                        </div>;
                      })()}
                      {issue.id === "case" && (
                        <p style={base.caution}>Only conflicting case variants are normalized to the most common existing spelling. Other categories are preserved.</p>
                      )}
                      {issue.id === "date" && (
                        <>
                          <p style={base.caution}>
                            Numeric dates can mean different days depending on their order. Choose the intended format, inspect the preview, and explicitly confirm before changing any values.
                          </p>
                          {dateResolutionColumn === issue.column && (
                            <div style={{ display: "grid", gap: 9, padding: 10, marginBottom: 9, border: `1px solid ${palette.border}`, borderRadius: 6, background: palette.surface }}>
                              <strong style={{ fontSize: 10 }}>Choose numeric date interpretation</strong>
                              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, color: palette.text, fontSize: 10, lineHeight: 1.5, cursor: "pointer" }}>
                                <input type="radio" name={`date-order-${issue.column}`} checked={dateOrder === "DMY"} onChange={() => setDateOrder("DMY")} />
                                <span><strong>DD/MM/YYYY — day first</strong><br /><span style={{ color: palette.muted }}>03/04/2025 → 2025-04-03 (3 April)</span></span>
                              </label>
                              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, color: palette.text, fontSize: 10, lineHeight: 1.5, cursor: "pointer" }}>
                                <input type="radio" name={`date-order-${issue.column}`} checked={dateOrder === "MDY"} onChange={() => setDateOrder("MDY")} />
                                <span><strong>MM/DD/YYYY — month first</strong><br /><span style={{ color: palette.muted }}>03/04/2025 → 2025-03-04 (March 4)</span></span>
                              </label>
                              <div style={{ border: `1px solid ${palette.border}`, borderRadius: 5, overflow: "hidden" }}>
                                <div style={{ padding: "6px 8px", color: palette.muted, fontSize: 9, borderBottom: `1px solid ${palette.border}` }}>Preview · no changes applied yet</div>
                                {rows.filter((row) => typeof row[issue.column] === "string" && isDateLike(row[issue.column])).slice(0, 5).map((row, index) => {
                                  const original = String(row[issue.column]);
                                  return <div key={`${original}-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, padding: "6px 8px", borderBottom: index < Math.min(4, rows.filter((item) => typeof item[issue.column] === "string" && isDateLike(item[issue.column])).length - 1) ? `1px solid ${palette.border}` : 0, fontSize: 10 }}><span style={{ color: palette.muted, overflowWrap: "anywhere" }}>{original}</span><span style={{ color: previewDate(original) === "Will remain unchanged" ? palette.amber : palette.text, overflowWrap: "anywhere" }}>{previewDate(original)}</span></div>;
                                })}
                              </div>
                              <p style={{ ...base.bodyText, margin: 0 }}>Only valid dates are converted. Invalid or unsupported values remain unchanged. Confirm only if the selected order matches your source data.</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                                <button type="button" style={base.fixButton} onClick={() => applyDateResolution(issue)}><Check size={13} /> Confirm and convert dates</button>
                                <button type="button" style={{ ...base.fixButton, border: `1px solid ${palette.border}`, color: palette.muted, background: "transparent" }} onClick={() => setDateResolutionColumn(null)}>Cancel</button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {issue.id === "negative-age" && (
                        <p style={base.caution}>Invalid ages are set to missing, not deleted. Review them before continuing.</p>
                      )}
                      {issue.id === "missing" && (
                        <>
                          <p style={base.caution}>This count includes NULL, undefined, and blank strings. Enter a replacement to preview the affected rows; click again to confirm. The separate normalization action only converts blank strings to NULL and does not fill existing NULL or undefined values.</p>
                          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 7, alignItems: "center", marginBottom: 8 }}>
                            <input
                              type="text"
                              value={missingReplacementByColumn[issue.column] ?? ""}
                              onChange={(event) => {
                                setMissingReplacementByColumn((current) => ({ ...current, [issue.column]: event.target.value }));
                                setMissingFillPreview(null);
                              }}
                              placeholder={/salary|age|count|amount|price|score|income|number|quantity|years?/i.test(issue.column) ? "Replacement value (e.g. 0)" : "Replacement value (e.g. Unknown)"}
                              aria-label={`Replacement value for ${issue.column}`}
                              style={{ minWidth: 0, width: "100%", height: 30, boxSizing: "border-box", padding: "0 9px", border: `1px solid ${palette.border}`, borderRadius: 5, color: palette.text, background: palette.surface, fontSize: 10 }}
                            />
                            <button
                              type="button"
                              style={{ ...base.fixButton, whiteSpace: "nowrap" }}
                              onClick={(event) => { event.preventDefault(); event.stopPropagation(); fillMissingValues(issue); }}
                              aria-label={`Fill missing values in ${issue.column}`}
                            >
                              <Check size={13} /> {
                                missingFillPreview?.column === issue.column &&
                                missingFillPreview.rawReplacement === (missingReplacementByColumn[issue.column] ?? "")
                                  ? "Confirm fill"
                                  : "Preview replacement"
                              }
                            </button>
                          </div>
                          {missingFillPreview?.column === issue.column &&
                            missingFillPreview.rawReplacement === (missingReplacementByColumn[issue.column] ?? "") && (
                              <div style={{ marginBottom: 10, border: `1px solid ${palette.border}`, borderRadius: 5, overflow: "hidden" }}>
                                <div style={{ padding: "6px 8px", background: palette.surface, color: palette.muted, fontSize: 9, borderBottom: `1px solid ${palette.border}` }}>
                                  Preview · no changes applied yet · proposed value: {JSON.stringify(missingFillPreview.replacement)}
                                </div>
                                {rows
                                  .map((row, index) => ({ row, index, value: row[issue.column] }))
                                  .filter(({ value }) => missing(value))
                                  .slice(0, 5)
                                  .map(({ index, value }) => (
                                    <div key={`missing-preview-${issue.column}-${index}`} style={{ display: "grid", gridTemplateColumns: "minmax(72px, auto) minmax(0, 1fr) minmax(0, 1fr)", gap: 8, padding: "6px 8px", borderBottom: `1px solid ${palette.border}`, fontSize: 10 }}>
                                      <span style={{ color: palette.muted }}>Row {index + 1}</span>
                                      <span style={{ color: "#d98c85", overflowWrap: "anywhere" }}>{value === null ? "NULL" : value === undefined ? "undefined" : JSON.stringify(value)}</span>
                                      <span style={{ color: "#7fd8ad", overflowWrap: "anywhere" }}>{JSON.stringify(missingFillPreview.replacement)}</span>
                                    </div>
                                  ))}
                                {rows.filter((row) => missing(row[issue.column])).length > 5 && (
                                  <div style={{ padding: "6px 8px", color: palette.muted, fontSize: 9 }}>
                                    Showing the first 5 affected rows. All missing cells in this column will be updated after confirmation.
                                  </div>
                                )}
                              </div>
                            )}
                        </>
                      )}
                      {issue.id === "duplicates" && (
                        <p style={base.caution}>This removes exact duplicates across all selected columns and keeps the first occurrence. Repeated rows may be legitimate in some datasets.</p>
                      )}
                      {issue.id === "date" ? (
                        dateResolutionColumn === issue.column ? null : (
                          <button type="button" style={base.fixButton} onClick={() => setDateResolutionColumn(issue.column)}>
                            <WandSparkles size={13} /> Review and choose date format
                          </button>
                        )
                      ) : issue.id === "missing" ? (
                        rows.some((row) => {
                          const value = row[issue.column];
                          return typeof value === "string" && value.trim() === "";
                        }) ? (
                          <button
                            type="button"
                            style={{ ...base.fixButton, position: "relative", zIndex: 2, pointerEvents: "auto" }}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              applyFix(issue);
                            }}
                            aria-label={`Normalize blank strings in ${issue.column}`}
                          >
                            <WandSparkles size={13} /> Normalize blank strings in this column
                          </button>
                        ) : null
                      ) : (
                        <button
                          type="button"
                          style={{ ...base.fixButton, position: "relative", zIndex: 2, pointerEvents: "auto" }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            applyFix(issue);
                          }}
                          aria-label={`${issue.fixLabel} in ${issue.column}`}
                        >
                          <WandSparkles size={13} /> {issue.fixLabel}
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      <footer style={base.footer}>
        <span>Sorted by severity · {rows.length.toLocaleString()} rows scanned · {issues.length} findings</span>
        <span>Safe formatting fixes can be applied directly; outliers, keys, and schema changes always require review.</span>
      </footer>

      <style>{`
        @media (max-width: 720px) {
          .smart-clean-header { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </section>
  );
}
