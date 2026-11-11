"use client";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Search, ArrowRight } from "lucide-react";
import type { DockDataset } from "../types/dataset";
import { datasetRegistry } from "../services/datasets/DatasetRegistry";
import { isMissingValue } from "../utils/csv-utils";
type ColumnQualityInspectionProps = {
   dataset: DockDataset;
   onNavigateToTool: (tool: "missing-values" | "duplicate-rows") => void;
};
type FrequencyItem = { key: string; label: string; count: number };
const panel: React.CSSProperties = {
   minWidth: 0,
   margin: "0 8px 8px",
   border: "1px solid var(--border, #393939)",
   borderRadius: 8,
   overflow: "hidden",
   background: "rgba(255,255,255,0.018)",
   color: "var(--foreground, #e5e7eb)",
};
const muted: React.CSSProperties = { color: "#a3a3a3", fontSize: 10, lineHeight: 1.45 };
const compactStat: React.CSSProperties = {
   minWidth: 0, padding: "8px 9px", border: "1px solid var(--border, #393939)",
   borderRadius: 6, background: "rgba(255,255,255,0.018)",
};
function valueKey(value: unknown): string {
   if (value instanceof Date) return `date:${value.toISOString()}`;
   if (typeof value === "number" && Number.isNaN(value)) return "number:NaN";
   if (typeof value === "object" && value !== null) {
      try { return `object:${JSON.stringify(value)}`; } catch { return `object:${String(value)}`; }
   }
   return `${typeof value}:${String(value)}`;
}
function formatValue(value: unknown): string {
   if (value === null) return "null";
   if (value === undefined) return "undefined";
   if (typeof value === "string") return value.length > 56 ? `${value.slice(0, 53)}…` : value;
   if (typeof value === "object") {
      try {
         const result = JSON.stringify(value);
         if (typeof result !== "string") return String(value);
         return result.length > 56 ? `${result.slice(0, 53)}…` : result;
      } catch { return String(value); }
   }
   return String(value);
}
function Stat({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
   return (
      <div style={compactStat}>
         <div style={{ ...muted, marginBottom: 4 }}>{label}</div>
         <strong style={{ display: "block", color: warning ? "#f5f5f5" : "#ffffff", fontSize: 15, fontWeight: 650, letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>
            {value}
         </strong>
      </div>
   );
}
export default function ColumnQualityInspection({ dataset, onNavigateToTool }: ColumnQualityInspectionProps) {
   const columns = dataset.columns ?? [];
   const [selectedColumnName, setSelectedColumnName] = useState(() => columns[0]?.name ?? "");
   const [searchQuery, setSearchQuery] = useState("");

   // Reset column-specific controls when the inspected dataset changes.
   useEffect(() => {
      setSelectedColumnName(dataset.columns?.[0]?.name ?? "");
      setSearchQuery("");
   }, [dataset.id]);

   const rows = datasetRegistry.getRows(dataset.id) ?? [];
   const filteredColumns = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      return columns.filter((column) => column.name.toLowerCase().includes(query));
   }, [columns, searchQuery]);
   const selectedColumn = columns.find((column) => column.name === selectedColumnName) ?? columns[0] ?? null;
   const inspection = useMemo(() => {
      if (!selectedColumn) return null;
      const frequencies = new Map<string, FrequencyItem>();
      let missingCount = 0;
      for (const row of rows) {
         const value = row[selectedColumn.name];
         if (isMissingValue(value)) { missingCount += 1; continue; }
         const key = valueKey(value);
         const existing = frequencies.get(key);
         if (existing) existing.count += 1;
         else frequencies.set(key, { key, label: formatValue(value), count: 1 });
      }
      const allFrequencies = [...frequencies.values()].sort((a, b) => b.count - a.count);
      const repeatedOccurrences = allFrequencies.reduce((total, item) => total + Math.max(0, item.count - 1), 0);
      return {
         rowCount: rows.length,
         missingCount,
         missingPercent: rows.length ? (missingCount / rows.length) * 100 : 0,
         distinctCount: allFrequencies.length,
         repeatedOccurrences,
         frequencyItems: allFrequencies.slice(0, 5),
         nonMissingCount: rows.length - missingCount,
      };
   }, [rows, selectedColumn]);
   if (!columns.length) {
      return (
         <section style={panel}>
            <div style={{ padding: 12 }}>
               <strong style={{ fontSize: 12 }}>Column inspection</strong>
               <p style={muted}>This dataset has no columns to inspect.</p>
            </div>
         </section>
      );
   }
   return (
      <section style={panel} aria-label="Column quality inspection">
         <div style={{ padding: "10px 11px", borderBottom: "1px solid var(--border, #393939)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
               <strong style={{ fontSize: 12, fontWeight: 650 }}>Column inspection</strong>
               <span style={muted}>{columns.length} columns</span>
            </div>
            <p style={{ ...muted, margin: "3px 0 0" }}>Choose a column to inspect its profile.</p>
         </div>
         <div style={{ padding: 9 }}>
            <label htmlFor={`column-quality-search-${dataset.id}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", border: "1px solid var(--border, #393939)", borderRadius: 6, marginBottom: 7 }}>
               <Search size={13} aria-hidden="true" color="#a3a3a3" />
               <input
                  id={`column-quality-search-${dataset.id}`}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search columns…"
                  style={{ width: "100%", minWidth: 0, border: 0, outline: 0, background: "transparent", color: "inherit", fontSize: 11 }}
               />
            </label>
            <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 9 }}>
               <select
                  aria-label="Select column to inspect"
                  value={selectedColumn?.name ?? ""}
                  onChange={(event) => setSelectedColumnName(event.target.value)}
                  style={{ flex: 1, minWidth: 0, padding: "7px 8px", border: "1px solid var(--border, #393939)", borderRadius: 6, background: "#292929", color: "#f5f5f5", fontSize: 11 }}
               >
                  {filteredColumns.length === 0 && <option value="">No matching columns</option>}
                  {filteredColumns.map((column) => (
                     <option key={column.name} value={column.name}>{column.name}{(column.missingCount ?? 0) > 0 ? " · missing values" : ""}</option>
                  ))}
               </select>
               {selectedColumn && (
                  <span title={(selectedColumn.missingCount ?? 0) > 0 ? "Column has missing values" : "No missing values reported"} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#d4d4d4", fontSize: 10, whiteSpace: "nowrap" }}>
                     {(selectedColumn.missingCount ?? 0) > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
                     {(selectedColumn.missingCount ?? 0) > 0 ? "Review" : "OK"}
                  </span>
               )}
            </div>
            {!selectedColumn || !inspection ? (
               <p style={muted}>No columns match your search.</p>
            ) : (
               <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 7 }}>
                     <strong title={selectedColumn.name} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>{selectedColumn.name}</strong>
                     <span style={{ ...muted, flexShrink: 0 }}>Type: {selectedColumn.type ?? "Unknown"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
                     <Stat label="Rows" value={inspection.rowCount.toLocaleString()} />
                     <Stat label="Missing" value={inspection.missingCount.toLocaleString()} warning={inspection.missingCount > 0} />
                     <Stat label="Missing %" value={`${inspection.missingPercent.toFixed(1)}%`} warning={inspection.missingCount > 0} />
                     <Stat label="Distinct" value={inspection.distinctCount.toLocaleString()} />
                     <Stat label="Repeated" value={inspection.repeatedOccurrences.toLocaleString()} warning={inspection.repeatedOccurrences > 0} />
                     <Stat label="Non-missing" value={inspection.nonMissingCount.toLocaleString()} />
                  </div>
                  <div style={{ marginTop: 9, border: "1px solid var(--border, #393939)", borderRadius: 6, overflow: "hidden" }}>
                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 9px", background: "rgba(255,255,255,0.025)", borderBottom: "1px solid var(--border, #393939)" }}>
                        <strong style={{ fontSize: 10 }}>Most frequent values</strong>
                        <span style={muted}>Top 5</span>
                     </div>
                     {inspection.frequencyItems.length === 0 ? (
                        <p style={{ ...muted, margin: 0, padding: 9 }}>No non-missing values.</p>
                     ) : inspection.frequencyItems.map((item, index) => (
                        <div key={item.key} style={{ display: "grid", gridTemplateColumns: "16px minmax(0, 1fr) auto", alignItems: "center", gap: 7, padding: "6px 9px", borderBottom: index === inspection.frequencyItems.length - 1 ? 0 : "1px solid rgba(255,255,255,0.06)" }}>
                           <span style={{ color: "#8f8f8f", fontSize: 9 }}>{index + 1}</span>
                           <span title={item.label} style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 10 }}>{item.label || "(empty string)"}</span>
                           <strong style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}>{item.count.toLocaleString()}</strong>
                        </div>
                     ))}
                  </div>
                  {inspection.missingCount > 0 && (
                     <button type="button" onClick={() => onNavigateToTool("missing-values")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 8, padding: "8px 9px", border: "1px solid var(--border, #393939)", borderRadius: 6, background: "rgba(255,255,255,0.025)", color: "#f5f5f5", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                        Open missing-value management <ArrowRight size={13} aria-hidden="true" />
                     </button>
                  )}
               </>
            )}
         </div>
      </section>
   );
}
