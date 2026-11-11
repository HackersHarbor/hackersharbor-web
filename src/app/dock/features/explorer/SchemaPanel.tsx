"use client";
import { useEffect, useMemo, useState } from "react";
import { Columns3, Search, X, Check, RotateCcw } from "lucide-react";
import { datasetRegistry } from "../../services/datasets/DatasetRegistry";
import type { ColumnDataType, ColumnSchema, DatasetSchema } from "./engine/types";
import type {
  DatasetColumn,
  DatasetPreview as DatasetPreviewData,
  DockDataset,
} from "../../types/dataset";
type SchemaPanelProps = {
  dataset: DockDataset | null;
  preview?: DatasetPreviewData | null;
};
type SortKey = "name" | "type" | "missing" | "unique";
type SortDirection = "asc" | "desc";
type ColumnProfile = {
  missingCount: number;
  uniqueCount: number;
  example: unknown;
  numericValues: number[];
  minimum: number | null;
  maximum: number | null;
  mean: number | null;
  median: number | null;
  topValues: Array<{ value: string; count: number }>;
  displayType: string;
  category: boolean;
  date: boolean;
  empty: boolean;
};
function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}
function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumSignificantDigits: 4,
  }).format(value);
}
function formatValue(value: unknown): string {
  if (isMissing(value)) return "Missing";
  if (typeof value === "number") {
    return Number.isFinite(value) ? formatNumber(value) : String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const numeric = Number(trimmed);
    if (trimmed !== "" && Number.isFinite(numeric) && /^[-+]?(?:\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(trimmed)) {
      return formatNumber(numeric);
    }
    return trimmed;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
function displayColumnName(name: string): string {
  return name.replace(/^_+/, "").replace(/_+/g, " ").trim() || name;
}
function formatDateExample(value: unknown): string | null {
  const timestamp = parseDateValue(value);
  if (timestamp === null) {
    return null;
  }
  return new Date(timestamp).toISOString().slice(0, 10);
}
function parseDateValue(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  // Explicitly support common US-style dates such as 2/2/2012.
  const slashDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashDate) {
    const month = Number(slashDate[1]);
    const day = Number(slashDate[2]);
    const year = Number(slashDate[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return date.getTime();
    }
    return null;
  }
  // Support ISO dates and common date-time strings.
  if (!/^\d{4}-\d{2}-\d{2}(?:$|[T ])/.test(text)) return null;
  const timestamp = Date.parse(text);
  return Number.isNaN(timestamp) ? null : timestamp;
}
function looksLikeDate(values: unknown[]): boolean {
  const populated = values.filter((value) => !isMissing(value));
  if (populated.length === 0) return false;
  const dateCount = populated.filter(
    (value) => parseDateValue(value) !== null,
  ).length;
  return dateCount / populated.length >= 0.8;
}
function medianOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}
function buildColumnProfile(
  column: DatasetColumn,
  dataset: DockDataset,
  preview: DatasetPreviewData | null | undefined,
): ColumnProfile {
  const previewMatches = preview?.datasetId === dataset.id;
  const rows = previewMatches ? preview?.rows ?? [] : [];
  const values = rows.map((row) => row[column.name]);
  const populated = values.filter((value) => !isMissing(value));
  const distinctValues = new Set(
    populated.map((value) => `${typeof value}:${String(value)}`),
  );
  const uniqueCount = column.uniqueCount ?? distinctValues.size;
  const rowCount = dataset.summary?.rowCount ?? preview?.totalRows ?? 0;
  const category =
    column.type === "string" &&
    uniqueCount > 1 &&
    rowCount > 0 &&
    uniqueCount / rowCount <= 0.25;
  const date =
    column.type === "date" ||
    column.type === "datetime" ||
    (column.type === "string" && looksLikeDate(populated));
  const numericValues = populated
    .map((value) => {
      if (typeof value === "number") return value;
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      return Number.NaN;
    })
    .filter(Number.isFinite);
  const isNumeric =
    column.type === "integer" ||
    column.type === "float" ||
    (column.type === "string" &&
      !date &&
      !category &&
      populated.length > 0 &&
      numericValues.length / populated.length >= 0.8);
  const minimum =
    isNumeric && numericValues.length > 0
      ? Math.min(...numericValues)
      : null;
  const maximum =
    isNumeric && numericValues.length > 0
      ? Math.max(...numericValues)
      : null;
  const mean =
    isNumeric && numericValues.length > 0
      ? numericValues.reduce((sum, value) => sum + value, 0) /
        numericValues.length
      : null;
  const median = isNumeric ? medianOf(numericValues) : null;
  const frequencies = new Map<string, number>();
  for (const value of populated) {
    const label = formatValue(value);
    frequencies.set(label, (frequencies.get(label) ?? 0) + 1);
  }
  const topValues = [...frequencies.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, 8);
  let displayType = column.type;
  if (date) {
    displayType = populated.some(
      (value) =>
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}[T ]/.test(value.trim()),
    )
      ? "datetime"
      : "date";
  } else if (category) {
    displayType = "string";
  } else if (isNumeric && column.type === "string") {
    displayType = "float";
  }
  return {
    missingCount:
      column.missingCount ??
      values.filter(isMissing).length,
    uniqueCount,
    example: populated[0],
    numericValues: isNumeric ? numericValues : [],
    minimum,
    maximum,
    mean,
    median,
    topValues,
    displayType,
    category,
    date,
    empty: rowCount > 0 && (
      (column.missingCount !== undefined && column.missingCount >= rowCount) ||
      (values.length >= rowCount && values.every(isMissing))
    ),
  };
}
function MissingBar({
  count,
  percent,
  scale,
}: {
  count: number;
  percent: number;
  scale: number;
}) {
  const width =
  count === 0
    ? 0
    : scale > 0
      ? Math.max(3, (percent / scale) * 100)
      : 0;
  return (
    <div className="dock-schema-missing-cell">
      <div className="dock-schema-missing-values">
        <span style={{ color: "#ffffff" }}>
          {count.toLocaleString()} · {percent.toFixed(1)}%
        </span>
      </div>
      <span
        className="dock-schema-missing-track"
        aria-hidden="true"
        style={{
          display: "block",
          height: 5,
          overflow: "hidden",
          borderRadius: 999,
          background: "#414141",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${Math.min(100, width)}%`,
            borderRadius: 999,
            background: "#ffffff",
          }}
        />
      </span>
    </div>
  );
}
const SCHEMA_TYPES: ColumnDataType[] = [
  "string",
  "number",
  "integer",
  "boolean",
  "date",
  "datetime",
  "unknown",
];

function inferSchemaType(column: DatasetColumn, rows: Record<string, unknown>[]): ColumnDataType {
  const values = rows.map((row) => row[column.name]).filter((value) => !isMissing(value));
  if (column.type === "boolean") return "boolean";
  if (column.type === "date") return "date";
  if (column.type === "datetime") return "datetime";
  if (column.type === "integer") return "integer";
  if (column.type === "float" || column.type === "number") return "number";
  if (values.length === 0) return "unknown";
  const booleanCount = values.filter((value) =>
    typeof value === "boolean" || (typeof value === "string" && /^(true|false|yes|no)$/i.test(value.trim()))
  ).length;
  if (booleanCount / values.length >= 0.9) return "boolean";
  const dateCount = values.filter((value) => parseDateValue(value) !== null).length;
  if (dateCount / values.length >= 0.8) {
    return values.some((value) => typeof value === "string" && /[T ]\d{2}:\d{2}/.test(value))
      ? "datetime"
      : "date";
  }
  const numeric = values.map((value) => Number(value));
  if (numeric.every(Number.isFinite)) {
    return numeric.every(Number.isInteger) ? "integer" : "number";
  }
  return "string";
}

function createSchemaSuggestion(
  dataset: DockDataset,
  preview: DatasetPreviewData | null | undefined,
): DatasetSchema {
  const rows = preview?.datasetId === dataset.id ? preview.rows : [];
  const columns: ColumnSchema[] = dataset.columns.map((column) => ({
    name: column.name,
    type: inferSchemaType(column, rows),
    nullable: rows.length > 0 && rows.some((row) => isMissing(row[column.name])),
  }));
  const keyCandidates = columns.filter((column) => {
    const name = column.name.toLowerCase();
    const keyLike = name === "id" || name.endsWith("_id") || name.endsWith("id") ||
      name === "key" || name.endsWith("_key");
    if (!keyLike || rows.length === 0) return false;
    const values = rows.map((row) => row[column.name]);
    return values.every((value) => !isMissing(value)) &&
      new Set(values.map((value) => `${typeof value}:${String(value)}`)).size === values.length;
  });
  const preferred = keyCandidates.find((column) => column.name.toLowerCase() === "id") ?? keyCandidates[0];
  return { columns, ...(preferred ? { primaryKey: [preferred.name] } : {}) };
}

export default function SchemaPanel({ dataset, preview }: SchemaPanelProps) {
  const [query, setQuery] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("missing");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedColumnName, setSelectedColumnName] = useState<string | null>(null);
  const [schemaDraft, setSchemaDraft] = useState<DatasetSchema | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<"suggested" | "confirmed" | null>(null);
  const [schemaMessage, setSchemaMessage] = useState("");

  useEffect(() => {
    if (!dataset) {
      setSchemaDraft(null);
      setSchemaStatus(null);
      return;
    }
    const registered = datasetRegistry.getRegistered(dataset.id);
    setSchemaDraft(registered?.schema ? {
      columns: registered.schema.columns.map((column) => ({ ...column })),
      ...(registered.schema.primaryKey ? { primaryKey: [...registered.schema.primaryKey] } : {}),
    } : createSchemaSuggestion(dataset, preview));
    setSchemaStatus(registered?.schemaStatus ?? (registered?.schema ? "suggested" : null));
    setSchemaMessage("");
  // The selected dataset is the reset boundary; avoid overwriting in-progress edits on preview refreshes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset?.id]);
  // Reset schema view controls when the selected dataset changes.
  useEffect(() => {
    setQuery("");
    setMissingOnly(false);
    setSortKey("missing");
    setSortDirection("desc");
    setSelectedColumnName(null);
  }, [dataset?.id]);
  const profiles = useMemo(() => {
    if (!dataset) return new Map<string, ColumnProfile>();
    return new Map(
      dataset.columns.map((column) => [
        column.name,
        buildColumnProfile(column, dataset, preview),
      ]),
    );
  }, [dataset, preview]);
  const totalRows = dataset?.summary?.rowCount ?? preview?.totalRows ?? 0;
  const missingPercentages = useMemo(() => {
    if (!dataset || totalRows <= 0) return [];
    return dataset.columns.map((column) => {
      const missingCount = profiles.get(column.name)?.missingCount ?? 0;
      return (missingCount / totalRows) * 100;
    });
  }, [dataset, profiles, totalRows]);
  const worstMissingPercent = Math.max(0, ...missingPercentages);
  const filteredColumns = useMemo(() => {
    if (!dataset) return [];
    const normalizedQuery = query.trim().toLowerCase();
    const result = dataset.columns.filter((column) => {
      const profile = profiles.get(column.name);
      const matchesQuery =
        !normalizedQuery ||
        column.name.toLowerCase().includes(normalizedQuery) ||
        displayColumnName(column.name).toLowerCase().includes(normalizedQuery) ||
        (profile?.displayType ?? column.type).toLowerCase().includes(normalizedQuery);
      return matchesQuery && (!missingOnly || (profile?.missingCount ?? 0) > 0);
    });
    result.sort((a, b) => {
      const left = profiles.get(a.name);
      const right = profiles.get(b.name);
      let comparison = 0;
      switch (sortKey) {
        case "name":
          comparison = displayColumnName(a.name).localeCompare(displayColumnName(b.name));
          break;
        case "type":
          comparison = (left?.displayType ?? a.type).localeCompare(right?.displayType ?? b.type);
          break;
        case "missing":
          comparison = (left?.missingCount ?? 0) - (right?.missingCount ?? 0);
          break;
        case "unique":
          comparison = (left?.uniqueCount ?? 0) - (right?.uniqueCount ?? 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return result;
  }, [dataset, missingOnly, profiles, query, sortDirection, sortKey]);
  const selectedColumn =
    dataset?.columns.find((column) => column.name === selectedColumnName) ?? null;
  const selectedProfile =
    selectedColumn ? profiles.get(selectedColumn.name) ?? null : null;

  const updateSchemaColumn = (columnName: string, updates: Partial<ColumnSchema>) => {
    setSchemaDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        columns: current.columns.map((column) =>
          column.name === columnName ? { ...column, ...updates } : column,
        ),
      };
    });
    setSchemaStatus("suggested");
    setSchemaMessage("Unsaved schema changes");
  };

  const setPrimaryKey = (columnName: string, checked: boolean) => {
    setSchemaDraft((current) => {
      if (!current) return current;
      const primaryKey = checked
        ? [columnName]
        : (current.primaryKey ?? []).filter((name) => name !== columnName);
      return { ...current, primaryKey: primaryKey.length ? primaryKey : undefined };
    });
    setSchemaStatus("suggested");
    setSchemaMessage("Unsaved schema changes");
  };

  const saveSchema = (confirmed: boolean) => {
    if (!dataset || !schemaDraft) return;
    datasetRegistry.setSchema(dataset.id, schemaDraft, confirmed ? "confirmed" : "suggested");
    setSchemaStatus(confirmed ? "confirmed" : "suggested");
    setSchemaMessage(confirmed ? "Schema confirmed and saved." : "Schema suggestion saved.");
  };

  const resetSchemaSuggestion = () => {
    if (!dataset) return;
    const suggestion = createSchemaSuggestion(dataset, preview);
    setSchemaDraft(suggestion);
    setSchemaStatus("suggested");
    datasetRegistry.setSchema(dataset.id, suggestion, "suggested");
    setSchemaMessage("Auto-detected suggestions restored.");
  };
  function changeSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection(key === "name" || key === "type" ? "asc" : "desc");
    }
  }
  function sortLabel(key: SortKey, label: string) {
    return (
      <button type="button" onClick={() => changeSort(key)}>
        {label}
        {sortKey === key ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
      </button>
    );
  }
  if (!dataset) {
    return (
      <section className="dock-side-panel dock-schema-preview">
        <div className="dock-side-panel-heading">
          <div>
            <h3>Schema</h3>
            <p>Dataset structure</p>
          </div>
          <Columns3 size={16} aria-hidden="true" />
        </div>
        <div className="dock-panel-empty">
          <Columns3 size={18} aria-hidden="true" />
          <span>Select a dataset to inspect its schema.</span>
        </div>
      </section>
    );
  }
  return (
    <section className="dock-side-panel dock-schema-preview">
      <div className="dock-side-panel-heading">
        <div>
          <h3>Schema</h3>
          <p>
            {dataset.columns.length.toLocaleString()} columns
            {totalRows > 0 ? ` · ${totalRows.toLocaleString()} rows` : ""}
          </p>
        </div>
        <Columns3 size={16} aria-hidden="true" />
      </div>
      <section
        aria-label="Schema review and confirmation"
        style={{
          margin: "10px 0",
          padding: "10px 12px",
          border: "1px solid var(--dock-border, #454545)",
          borderRadius: 6,
          background: "var(--dock-panel-subtle, rgba(127,127,127,0.06))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <strong style={{ fontSize: 12 }}>Schema review</strong>
            <div style={{ marginTop: 3, fontSize: 11, color: "var(--dock-muted, #999)" }}>
              Review inferred types and key candidates. Suggestions do not create range or required-value rules.
            </div>
          </div>
          <span
            role="status"
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              color: schemaStatus === "confirmed" ? "#77c99a" : "#d7b56d",
            }}
          >
            {schemaStatus === "confirmed" ? "Confirmed" : "Suggested"}
          </span>
        </div>
        {schemaDraft ? (
          <div style={{ maxHeight: 220, overflow: "auto", marginTop: 8 }}>
            {dataset.columns.map((column) => {
              const schemaColumn = schemaDraft.columns.find((item) => item.name === column.name);
              if (!schemaColumn) return null;
              const isPrimaryKey = (schemaDraft.primaryKey ?? []).includes(column.name);
              return (
                <div
                  key={column.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(100px, 1fr) minmax(100px, 140px) minmax(112px, auto)",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 0",
                    borderTop: "1px solid var(--dock-border, #454545)",
                  }}
                >
                  <span title={column.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>
                    {displayColumnName(column.name)}
                  </span>
                  <select
                    aria-label={`Schema type for ${column.name}`}
                    value={schemaColumn.type}
                    onChange={(event) => updateSchemaColumn(column.name, { type: event.target.value as ColumnDataType })}
                    style={{ minWidth: 0, width: "100%", fontSize: 11, padding: "4px 6px" }}
                  >
                    {SCHEMA_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", fontSize: 10 }}>
                      <input
                        type="checkbox"
                        checked={isPrimaryKey}
                        onChange={(event) => setPrimaryKey(column.name, event.target.checked)}
                      />
                      Key
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", fontSize: 10 }}>
                      <input
                        type="checkbox"
                        checked={schemaColumn.nullable !== false}
                        onChange={(event) => updateSchemaColumn(column.name, { nullable: event.target.checked })}
                      />
                      Nullable
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 11 }}>No schema suggestion is available yet.</p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 9 }}>
          <button type="button" onClick={resetSchemaSuggestion} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <RotateCcw size={12} /> Auto-detect
          </button>
          <button type="button" onClick={() => saveSchema(false)} disabled={!schemaDraft} style={{ fontSize: 11 }}>
            Save suggestion
          </button>
          <button type="button" onClick={() => saveSchema(true)} disabled={!schemaDraft} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <Check size={12} /> Confirm schema
          </button>
          {schemaMessage ? <span role="status" style={{ fontSize: 10, color: "var(--dock-muted, #999)" }}>{schemaMessage}</span> : null}
        </div>
      </section>
      <div className="dock-schema-controls">
        <label className="dock-schema-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter columns or types..."
            aria-label="Filter schema columns"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear filter">
              <X size={13} aria-hidden="true" />
            </button>
          ) : null}
        </label>
        <label className="dock-schema-missing-toggle">
          <input
            type="checkbox"
            checked={missingOnly}
            onChange={(event) => setMissingOnly(event.target.checked)}
          />
          <span>Show only columns with missing values</span>
        </label>
        <div className="dock-schema-result-count">
          Showing {filteredColumns.length} of {dataset.columns.length} columns
        </div>
      </div>
      <div className="dock-schema-table-scroll">
        <table className="dock-data-table dock-schema-table">
          <thead>
            <tr>
              <th className="dock-schema-index-heading">#</th>
              <th>{sortLabel("name", "Column")}</th>
              <th>{sortLabel("type", "Type")}</th>
              <th>{sortLabel("missing", "Missing")}</th>
              <th>{sortLabel("unique", "Unique")}</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            {filteredColumns.map((column) => {
              const profile = profiles.get(column.name);
              const missingCount = profile?.missingCount ?? 0;
              const missingPercent = totalRows > 0 ? (missingCount / totalRows) * 100 : 0;
              const allUnique =
              (column.type === "string" || column.type === "integer") &&
                totalRows > 0 &&
                (profile?.uniqueCount ?? 0) === totalRows &&
                missingCount === 0;
              return (
                <tr
                  key={column.name}
                  className={selectedColumnName === column.name ? "is-selected" : ""}
                  onClick={() => setSelectedColumnName(column.name)}
                  tabIndex={0}
                  aria-selected={selectedColumnName === column.name}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedColumnName(column.name);
                    }
                  }}
                  title={`Open profile for ${column.name}`}
                >
                  <td className="dock-schema-index-cell">
                    {String(dataset.columns.indexOf(column) + 1).padStart(2, "0")}
                  </td>
                  <td className="dock-schema-column-name" title={column.name}>
                    <span>{displayColumnName(column.name)}</span>
                    {profile?.empty ? (
                      <span
                        className="dock-schema-type is-empty"
                        title="Every row in this column is missing or blank"
                        style={{ color: "#ffffff", background: "#303030", border: "1px solid #666666", marginLeft: 6 }}
                      >
                        Empty column
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className={`dock-schema-type is-${profile?.displayType ?? column.type}`} style={{ color: "#ffffff", background: "#303030", border: "1px solid #484848" }}>
                      {profile?.displayType ?? column.type}
                    </span>
                    {profile && profile.displayType !== column.type ? (
                      <span title={`Inferred from loaded preview values; stored type is ${column.type}`} style={{ display: "block", marginTop: 3, color: "#b8b8b8", fontSize: 10 }}>
                        Inferred
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <MissingBar
                      count={missingCount}
                      percent={missingPercent}
                      scale={worstMissingPercent}
                    />
                  </td>
                  <td className="dock-schema-number-cell">
                    <span>{profile?.uniqueCount.toLocaleString() ?? "—"}</span>
                    {allUnique ? (
                      <span className="dock-schema-unique-badge" title="Every row has a distinct value" style={{ color: "#ffffff", background: "#303030", border: "1px solid #484848" }}>
                        All unique
                      </span>
                    ) : null}
                  </td>
                  <td
  className="dock-schema-example"
  title={
    profile?.date
      ? formatDateExample(profile.example) ?? formatValue(profile.example)
      : formatValue(profile?.example)
  }
>
  {profile?.example === undefined
    ? "—"
    : profile.date
      ? formatDateExample(profile.example) ?? formatValue(profile.example)
      : formatValue(profile.example)}
</td>
                </tr>
              );
            })}
            {filteredColumns.length === 0 ? (
              <tr>
                <td colSpan={6} className="dock-no-results">
                  No columns match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {selectedColumn && selectedProfile ? (
        <aside className="dock-schema-profile" aria-label="Column profile">
          <div className="dock-schema-profile-heading">
            <div>
              <span>Column profile</span>
              <strong>{displayColumnName(selectedColumn.name)}</strong>
              <small>
                Original field: <code>{selectedColumn.name}</code>
              </small>
            </div>
            <button
              type="button"
              onClick={() => setSelectedColumnName(null)}
              aria-label="Close column profile"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          {selectedProfile.empty ? (
            <div className="dock-schema-profile-note" role="status">
              Empty column: every row in the dataset is missing or blank for this field.
            </div>
          ) : null}
          <div className="dock-schema-profile-metrics">
            <div><span>Detected type</span><strong>{selectedProfile.displayType}</strong></div>
            <div><span>Missing</span><strong>{selectedProfile.missingCount.toLocaleString()}</strong></div>
            <div><span>Unique</span><strong>{selectedProfile.uniqueCount.toLocaleString()}</strong></div>
            <div>
              <span>Example</span>
              <strong className="dock-schema-profile-example">
                {selectedProfile.example === undefined ? "No populated preview value" : formatValue(selectedProfile.example)}
              </strong>
            </div>
          </div>
          {selectedProfile.numericValues.length > 0 ? (
            <>
              <div className="dock-schema-numeric-profile">
                <div><span>Minimum</span><strong>{formatNumber(selectedProfile.minimum!)}</strong></div>
                <div><span>Mean</span><strong>{formatNumber(selectedProfile.mean!)}</strong></div>
                <div><span>Median</span><strong>{formatNumber(selectedProfile.median!)}</strong></div>
                <div><span>Maximum</span><strong>{formatNumber(selectedProfile.maximum!)}</strong></div>
                <small>
                  Calculated from {selectedProfile.numericValues.length.toLocaleString()} numeric
                  values in the loaded preview. These statistics may not represent the full dataset.
                </small>
              </div>
              <PreviewHistogram values={selectedProfile.numericValues} />
            </>
          ) : selectedProfile.date ? (
            <div className="dock-schema-profile-note">
              Date values detected. Time-based analysis can use the detected date type; the stored
              dataset values have not been modified.
            </div>
          ) : selectedProfile.category ? (
            <div className="dock-schema-top-values">
              <h4>Top values in preview</h4>
              {selectedProfile.topValues.map((item) => (
                <div className="dock-schema-top-value" key={item.value}>
                  <span title={item.value}>{item.value}</span>
                  <strong>{item.count.toLocaleString()}</strong>
                </div>
              ))}
              {selectedProfile.topValues.length === 0 ? <p>No populated values in preview.</p> : null}
            </div>
          ) : (
            <div className="dock-schema-profile-note">
              No numeric distribution or category breakdown is available for this column.
            </div>
          )}
        </aside>
      ) : (
        <div className="dock-schema-hint">Select a column row to open its profile.</div>
      )}
    </section>
  );
}
function PreviewHistogram({ values }: { values: number[] }) {
  const bins = useMemo(() => {
    if (values.length === 0) return [];
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const binCount = 12;
    const counts = Array.from({ length: binCount }, () => 0);
    if (minimum === maximum) {
      counts[0] = values.length;
      return counts;
    }
    for (const value of values) {
      const index = Math.min(
        binCount - 1,
        Math.floor(((value - minimum) / (maximum - minimum)) * binCount),
      );
      counts[index] += 1;
    }
    return counts;
  }, [values]);
  const maximumCount = Math.max(1, ...bins);
  if (bins.length === 0) return null;
  return (
    <div className="dock-schema-histogram" aria-label="Numeric value histogram">
      <div className="dock-schema-histogram-bars">
        {bins.map((count, index) => (
          <span
            key={index}
            title={`${count} ${count === 1 ? "value" : "values"}`}
            style={{
              height: `${Math.max(3, (count / maximumCount) * 100)}%`,
              background: "#ffffff",
              borderRadius: 2,
            }}
          />
        ))}
      </div>
      <div className="dock-schema-histogram-caption">
        <span>{formatNumber(Math.min(...values))}</span>
        <span>Distribution · preview</span>
        <span>{formatNumber(Math.max(...values))}</span>
      </div>
    </div>
  );
}
