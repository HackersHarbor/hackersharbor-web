"use client";

import { useEffect, useState, type CSSProperties } from "react";

import {

  AlertTriangle,

  CheckCircle2,

  ChevronRight,

  Database,

  ShieldCheck,

} from "lucide-react";

import type { DockDataset } from "../../types/dataset";

import { datasetRegistry } from "../../services/datasets/DatasetRegistry";

import { dataQualityEngine } from "./engine/DataQualityEngine";

import { registerDefaultDetectors } from "./engine/registerDefaultDetectors";

import type {
  ColumnDataType,
  ColumnSchema,
  DatasetSchema,
  EngineScanResult,
} from "./engine/types";

import ColumnQualityInspection from "../../components/ColumnQualityInspection";

export type QualityAction = "missing-values" | "duplicate-rows";

type QualityTab = "Overview" | "Issues" | "Columns";

type DataQualityPanelProps = {

  dataset: DockDataset | null;

  onNavigateToTool?: (tool: QualityAction) => void;

};

const styles: Record<string, CSSProperties> = {

  panel: {

    minWidth: 0,

    overflow: "hidden",

    color: "var(--foreground, #f5f5f5)",

    background: "#262626",

    border: "1px solid #414141",

    borderRadius: 10,

  },

  header: {

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 12,

    padding: "11px 13px",

    borderBottom: "1px solid #414141",

  },

  headerTitle: {

    margin: 0,

    fontSize: 13,

    fontWeight: 650,

    letterSpacing: "-0.02em",

  },

  muted: {

    margin: "3px 0 0",

    color: "#a3a3a3",

    fontSize: 10,

    lineHeight: 1.45,

  },

  headerIcon: {

    color: "#d4d4d4",

    flexShrink: 0,

  },

  tabs: {

    display: "grid",

    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",

    gap: 4,

    padding: "8px 10px 0",

  },

  tab: {

    minWidth: 0,

    border: "1px solid transparent",

    borderRadius: 6,

    padding: "7px 8px",

    fontSize: 11,

    fontWeight: 550,

    color: "#a3a3a3",

    background: "transparent",

    cursor: "pointer",

  },

  activeTab: {

    color: "#f5f5f5",

    background: "#353535",

    borderColor: "#505050",

  },

  content: {

    padding: 10,

    minWidth: 0,

  },

  metrics: {

    display: "grid",

    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",

    gap: 7,

  },

  metric: {

    minWidth: 0,

    padding: "9px 9px 8px",

    border: "1px solid #414141",

    borderRadius: 7,

    background: "#2b2b2b",

  },

  metricLabel: {

    display: "block",

    color: "#a3a3a3",

    fontSize: 9,

    lineHeight: 1.4,

    marginBottom: 5,

    overflowWrap: "anywhere",

  },

  metricValue: {

    display: "block",

    color: "#f5f5f5",

    fontSize: 17,

    fontWeight: 650,

    lineHeight: 1.15,

    letterSpacing: "-0.03em",

    fontVariantNumeric: "tabular-nums",

  },

  metricDetail: {

    display: "block",

    color: "#a3a3a3",

    fontSize: 9,

    marginTop: 4,

    lineHeight: 1.35,

  },

  scoreCard: {

    marginTop: 8,

    padding: "10px 11px",

    border: "1px solid #414141",

    borderRadius: 7,

    background: "#2b2b2b",

  },

  scoreHeader: {

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: 10,

    marginBottom: 8,

  },

  scoreTitle: {

    margin: 0,

    fontSize: 11,

    fontWeight: 600,

  },

  scoreValue: {

    fontSize: 18,

    fontWeight: 700,

    letterSpacing: "-0.04em",

    whiteSpace: "nowrap",

    fontVariantNumeric: "tabular-nums",

  },

  progressTrack: {

    height: 5,

    width: "100%",

    overflow: "hidden",

    borderRadius: 999,

    background: "#454545",

  },

  progressFill: {

    height: "100%",

    borderRadius: 999,

    background: "#d4d4d4",

    transition: "width 180ms ease",

  },

  scoreFooter: {

    display: "flex",

    justifyContent: "space-between",

    alignItems: "center",

    gap: 8,

    flexWrap: "wrap",

    marginTop: 7,

    color: "#a3a3a3",

    fontSize: 10,

  },

  schemaAction: {
    border: "1px solid #648b6c",
    borderRadius: 6,
    padding: "6px 9px",
    color: "#c5e2ca",
    background: "rgba(74, 125, 86, 0.16)",
    fontSize: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  sectionTitle: {

    margin: "0 0 7px",

    fontSize: 11,

    fontWeight: 600,

  },

  issueList: {

    border: "1px solid #414141",

    borderRadius: 7,

    overflow: "hidden",

  },

  issueRow: {

    width: "100%",

    display: "flex",

    alignItems: "center",

    gap: 8,

    padding: "9px 10px",

    border: 0,

    borderBottom: "1px solid #3b3b3b",

    color: "#f5f5f5",

    textAlign: "left",

    background: "transparent",

    cursor: "pointer",

  },

  issueLabel: {

    display: "block",

    fontSize: 11,

    lineHeight: 1.4,

  },

  issueCount: {

    flexShrink: 0,

    fontSize: 11,

    fontWeight: 650,

    fontVariantNumeric: "tabular-nums",

  },

  issueHint: {

    display: "block",

    color: "#a3a3a3",

    fontSize: 9,

    marginTop: 2,

  },

  status: {

    color: "#a3a3a3",

    fontSize: 9,

    border: "1px solid #505050",

    borderRadius: 999,

    padding: "3px 6px",

    whiteSpace: "nowrap",

  },

  note: {

    display: "flex",

    alignItems: "flex-start",

    gap: 7,

    marginTop: 8,

    padding: "8px 9px",

    border: "1px solid #414141",

    borderRadius: 7,

    background: "rgba(255,255,255,0.018)",

  },

  noteText: {

    margin: 0,

    color: "#a3a3a3",

    fontSize: 10,

    lineHeight: 1.5,

  },

  empty: {

    display: "flex",

    alignItems: "center",

    gap: 9,

    padding: 14,

    color: "#a3a3a3",

    fontSize: 11,

    lineHeight: 1.5,

  },

};

function Metric({

  label,

  value,

  detail,

}: {

  label: string;

  value: string;

  detail?: string;

}) {

  return (

    <div style={styles.metric}>

      <span style={styles.metricLabel}>{label}</span>

      <strong style={styles.metricValue}>{value}</strong>

      {detail ? (

        <small style={styles.metricDetail}>{detail}</small>

      ) : null}

    </div>

  );

}

function IssueRow({

  label,

  detail,

  value,

  onClick,

  last = false,

}: {

  label: string;

  detail: string;

  value: string;

  onClick: () => void;

  last?: boolean;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      style={{

        ...styles.issueRow,

        ...(last ? { borderBottom: 0 } : {}),

      }}

      onMouseEnter={(event) => {

        event.currentTarget.style.background =

          "rgba(255,255,255,0.045)";

      }}

      onMouseLeave={(event) => {

        event.currentTarget.style.background = "transparent";

      }}

    >

      <span style={{ flex: 1, minWidth: 0 }}>

        <span style={styles.issueLabel}>{label}</span>

        <span style={styles.issueHint}>{detail}</span>

      </span>

      <strong style={styles.issueCount}>{value}</strong>

      <ChevronRight

        size={13}

        aria-hidden="true"

        color="#a3a3a3"

      />

    </button>

  );

}

function inferSchemaFromRows(
  columns: string[],
  rows: Record<string, unknown>[],
): DatasetSchema {
  const columnSchemas: ColumnSchema[] = columns.map((name) => {
    const values = rows
      .map((row) => row[name])
      .filter((value) => value !== null && value !== undefined && value !== "");

    let type: ColumnDataType = "string";

    if (values.length > 0 && values.every((value) => typeof value === "boolean")) {
      type = "boolean";
    } else if (
      values.length > 0 &&
      values.every((value) => typeof value === "number" && Number.isFinite(value))
    ) {
      type = values.every((value) => Number.isInteger(value as number))
        ? "integer"
        : "number";
    } else if (
      values.length > 0 &&
      values.every((value) => typeof value === "string" && !Number.isNaN(Date.parse(value)))
    ) {
      type = "date";
    }

    return {
      name,
      type,
      nullable: values.length !== rows.length,
    };
  });

  const keyCandidate = columns.find((column) => {
    const normalized = column.trim().toLowerCase();
    if (
      normalized !== "id" &&
      !normalized.endsWith("_id") &&
      !normalized.endsWith("key")
    ) {
      return false;
    }

    const values = rows.map((row) => row[column]);
    return (
      values.length > 0 &&
      values.every((value) => value !== null && value !== undefined && value !== "") &&
      new Set(values.map((value) => String(value))).size === values.length
    );
  });

  return {
    columns: columnSchemas,
    ...(keyCandidate ? { primaryKey: [keyCandidate] } : {}),
  };
}

function formatQualityWarning(warning: string): string {
  const normalized = warning.toLowerCase();

  if (normalized.includes("schema") && normalized.includes("not")) {
    return "Some schema-based checks were skipped because this dataset does not yet have a confirmed schema.";
  }

  if (normalized.includes("referential") && normalized.includes("skip")) {
    return "Relationship checks were skipped because no reference keys have been confirmed.";
  }

  if (normalized.includes("range") && normalized.includes("skip")) {
    return "Range checks were skipped because no allowed value ranges have been confirmed.";
  }

  if (normalized.includes("type") && normalized.includes("skip")) {
    return "Type checks were skipped because expected column types are not available.";
  }

  return warning;
}

export default function DataQualityPanel({

  dataset,

  onNavigateToTool,

}: DataQualityPanelProps) {

  const [expandedIssueId, setExpandedIssueId] =

    useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<QualityTab>("Overview");

  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "high" | "warning" | "info">("all");

  const [dimensionFilter, setDimensionFilter] = useState<string>("all");

  const [engineScanResult, setEngineScanResult] =

    useState<EngineScanResult | null>(null);

  const [engineScanError, setEngineScanError] =

    useState<string | null>(null);

  // Re-run the quality scan whenever the shared dataset registry changes.

  const [registryVersion, setRegistryVersion] = useState(0);

  useEffect(() => {

    return datasetRegistry.subscribe(() => {

      setRegistryVersion((version) => version + 1);

    });

  }, []);

  useEffect(() => {

    if (!dataset) {

      setEngineScanResult(null);

      setEngineScanError(null);

      return;

    }

    let cancelled = false;

    try {

      registerDefaultDetectors();

      const columns = dataset.columns.map((column) =>

        typeof column === "string" ? column : column.name

      );

      const rows = datasetRegistry.getRows(dataset.id) ?? [];
      const schema = datasetRegistry.getSchema(dataset.id);

      const result = dataQualityEngine.scan({

        datasetId: dataset.id,

        columns,

        rows,

        schema,

      });

      if (!cancelled) {

        setEngineScanResult(result);

        setEngineScanError(null);

      }

    } catch (error) {

      if (!cancelled) {

        setEngineScanResult(null);

        setEngineScanError(

          error instanceof Error

            ? error.message

            : "The data-quality scan failed."

        );

      }

    }

    return () => {

      cancelled = true;

    };

  }, [dataset, registryVersion]);

  const handleNavigateToTool = (tool: QualityAction) => {

    if (typeof onNavigateToTool === "function") {

      onNavigateToTool(tool);

      return;

    }

    console.error(

      `[DataQualityPanel] Cannot open "${tool}" because the parent did not provide onNavigateToTool.`,

    );

  };

  if (!dataset?.summary) {

    return (

      <section style={styles.panel}>

        <div style={styles.header}>

          <div>

            <h3 style={styles.headerTitle}>Data quality</h3>

            <p style={styles.muted}>Dataset health checks</p>

          </div>

          <Database size={16} aria-hidden="true" />

        </div>

        <div style={styles.empty}>

          <Database size={17} aria-hidden="true" />

          <span>

            Import a dataset to calculate data quality.

          </span>

        </div>

      </section>

    );

  }

  // Read current rows from the registry instead of relying on the imported

  // dataset summary, which may be stale after cleaning operations.

  const columnNames = dataset.columns.map((column) =>

    typeof column === "string" ? column : column.name

  );

  const rows = datasetRegistry.getRows(dataset.id) ?? [];
  const registeredDataset = datasetRegistry.getRegistered(dataset.id);
  const datasetSchema = registeredDataset?.schema;
  const schemaStatus = registeredDataset?.schemaStatus;

  const handleAutoDetectSchema = () => {
    const inferredSchema = inferSchemaFromRows(columnNames, rows);
    datasetRegistry.setSchema(dataset.id, inferredSchema, "suggested");
  };

  const rowCount = rows.length;

  const columnCount = columnNames.length;

  const missingCells = rows.reduce((total, row) =>

    total + columnNames.filter((column) => {

      const value = row[column];

      return value === null || value === undefined ||

        (typeof value === "string" && value.trim() === "");

    }).length, 0

  );

  const seenRows = new Set<string>();

  let duplicateRows = 0;

  for (const row of rows) {

    const signature = JSON.stringify(columnNames.map((column) => row[column] ?? null));

    if (seenRows.has(signature)) duplicateRows += 1;

    else seenRows.add(signature);

  }

  const summary = { rowCount, columnCount, missingCells, duplicateRows };

  const totalCells = rowCount * columnCount;

  const missingPercent = totalCells > 0 ? (missingCells / totalCells) * 100 : 0;

  const duplicatePercent = rowCount > 0 ? (duplicateRows / rowCount) * 100 : 0;

  const columnsWithMissing = columnNames.filter((column) =>

    rows.some((row) => {

      const value = row[column];

      return value === null || value === undefined ||

        (typeof value === "string" && value.trim() === "");

    })

  ).length;

  // Use the shared engine summary directly. The engine intentionally returns

  // a null score until a defensible scoring model is implemented.

  const qualitySummary = engineScanResult?.summary ?? null;

  // Coverage counts only detector results the scorer considers genuinely
  // evaluated. The denominator includes every detector attempted in this scan,
  // including checks skipped because their required configuration is absent.
  const evaluatedCheckCount = qualitySummary?.dimensions.reduce(
    (total, dimension) => total + dimension.evaluatedChecks,
    0,
  ) ?? 0;
  const totalCheckCount = engineScanResult?.detectorResults.length ?? 0;
  const skippedCheckCount = Math.max(0, totalCheckCount - evaluatedCheckCount);

  // Count active findings only, matching the engine summary's open-issue

  // semantics. Ignored and resolved findings remain visible in the Issues tab.

  const engineIssues = engineScanResult?.issues ?? [];

  const activeEngineIssues = engineIssues.filter(

    (issue) => issue.status !== "ignored" && issue.status !== "resolved",

  );

  const severityCounts = activeEngineIssues.reduce(

    (counts, issue) => {

      if (issue.severity === "critical") {

        counts.critical += 1;

      } else if (issue.severity === "high") {

        counts.high += 1;

      } else if (issue.severity === "warning") {

        counts.warning += 1;

      } else if (issue.severity === "info") {

        counts.info += 1;

      }

      return counts;

    },

    { critical: 0, high: 0, warning: 0, info: 0 },

  );

  const openIssueCount = qualitySummary?.openIssues ?? activeEngineIssues.length;

  const availableDimensions = Array.from(

    new Set((engineScanResult?.issues ?? []).map((issue) => String(issue.dimension ?? "Other"))),

  ).sort((a, b) => a.localeCompare(b));

  const filteredEngineIssues = (engineScanResult?.issues ?? []).filter((issue) => {

    const severity = String(issue.severity).toLowerCase();

    const matchesSeverity =

      severityFilter === "all" ||

      (severityFilter === "warning" ? severity === "warning" || severity === "medium" :

        severityFilter === "info" ? severity === "info" || severity === "low" :

          severity === severityFilter);

    const matchesDimension = dimensionFilter === "all" || String(issue.dimension ?? "Other") === dimensionFilter;

    return matchesSeverity && matchesDimension;

  });

  const score = qualitySummary?.score ?? null;

  const qualityTier =

    score === null

      ? "Not evaluated"

      : score >= 95

        ? "Excellent"

        : score >= 85

          ? "Strong"

          : score >= 70

            ? "Fair"

            : "Needs review";

  const isHealthy = qualitySummary !== null && qualitySummary.openIssues === 0;

  const tabNames: QualityTab[] = [

    "Overview",

    "Issues",

    "Columns",

  ];

  return (

    <section style={styles.panel}>

      <div style={styles.header}>

        <div>

          <h3 style={styles.headerTitle}>Data quality</h3>

          <p style={styles.muted}>

            Compact dataset profile and diagnostics

          </p>

        </div>

        <ShieldCheck

          size={16}

          style={styles.headerIcon}

          aria-hidden="true"

        />

      </div>

      <div

        role="tablist"

        aria-label="Data quality sections"

        style={styles.tabs}

      >

        {tabNames.map((tab) => {

          const selected = activeTab === tab;

          return (

            <button

              key={tab}

              type="button"

              role="tab"

              aria-selected={selected}

              onClick={() => setActiveTab(tab)}

              style={{

                ...styles.tab,

                ...(selected ? styles.activeTab : {}),

              }}

            >

              {tab}

            </button>

          );

        })}

      </div>

      <div style={styles.content}>

        {activeTab === "Overview" && (

          <>

            <div

              className="dock-quality-compact-metrics"

              style={styles.metrics}

            >

              <Metric

                label="Rows"

                value={summary.rowCount.toLocaleString()}

              />

              <Metric

                label="Columns"

                value={summary.columnCount.toLocaleString()}

              />

              <Metric

                label="Missing cells"

                value={summary.missingCells.toLocaleString()}

                detail={`${missingPercent.toFixed(1)}% of cells`}

              />

              <Metric

                label="Duplicate rows"

                value={summary.duplicateRows.toLocaleString()}

                detail={`${duplicatePercent.toFixed(1)}% of rows`}

              />

            </div>

            <div style={{ ...styles.scoreCard, marginTop: 8 }}>
              <div style={styles.scoreHeader}>
                <div>
                  <h4 style={styles.scoreTitle}>Dataset schema</h4>
                  <p style={styles.muted}>
                    {datasetSchema
                      ? schemaStatus === "confirmed"
                        ? "Confirmed schema · checks can use these definitions"
                        : "Suggested schema · review before treating constraints as rules"
                      : "Score not evaluated. Range, type and key checks need a schema."}
                  </p>
                </div>
                <span style={styles.status}>
                  {datasetSchema
                    ? schemaStatus === "confirmed" ? "Confirmed" : "Suggested"
                    : "Missing"}
                </span>
              </div>
              {!datasetSchema && (
                <button
                  type="button"
                  style={styles.schemaAction}
                  onClick={handleAutoDetectSchema}
                >
                  Auto-detect schema
                </button>
              )}
              {datasetSchema && (
                <p style={styles.noteText}>
                  {datasetSchema.columns.length.toLocaleString()} columns detected
                  {datasetSchema.primaryKey?.length
                    ? ` · Key candidate: ${datasetSchema.primaryKey.join(", ")}`
                    : " · No likely key identified"}
                </p>
              )}
            </div>
            <div style={styles.scoreCard}>

              <div style={styles.scoreHeader}>

                <div>

                  <h4

                    style={styles.scoreTitle}

                    title="The score reflects the checks that could be evaluated with the available dataset information."

                  >

                    Quality score

                  </h4>

                  <p style={styles.muted}>

                    {qualitySummary === null
                      ? "Waiting for the quality scan."
                      : totalCheckCount === 0
                        ? "No detector checks were registered for this scan."
                        : `Based on ${evaluatedCheckCount} of ${totalCheckCount} checks${skippedCheckCount > 0 ? ` · ${skippedCheckCount} skipped` : ""}.`}

                  </p>

                </div>

                <strong style={styles.scoreValue}>

                  {score ?? "—"}

                  <span

                    style={{

                      color: "#a3a3a3",

                      fontSize: 11,

                      fontWeight: 500,

                    }}

                  >

                    /100

                  </span>

                </strong>

              </div>

              <div

                style={styles.progressTrack}

                role="progressbar"

                aria-label="Data quality score"

                aria-valuemin={0}

                aria-valuemax={100}

                aria-valuenow={score ?? 0}

              >

                <div

                  style={{

                    ...styles.progressFill,

                    width: `${score ?? 0}%`,

                  }}

                />

              </div>

              <div style={styles.scoreFooter}>

                <span

                  style={{

                    color: "#e5e5e5",

                    fontWeight: 600,

                  }}

                >

                  {qualityTier}

                </span>

                <span>

                  {totalCells.toLocaleString()} total cells

                </span>

              </div>

            </div>

            <div style={{ ...styles.scoreCard, marginTop: 8 }}>

              <div style={styles.scoreHeader}>

                <h4 style={styles.scoreTitle}>Engine findings</h4>

                <span style={styles.status}>

                  {engineScanError

                    ? "Scan failed"

                    : engineScanResult

                      ? `${openIssueCount.toLocaleString()} open`

                      : "Scanning"}

                </span>

              </div>

              {engineScanError ? (

                <p style={styles.noteText} role="alert">

                  {engineScanError}

                </p>

              ) : engineScanResult ? (

                <div style={styles.metrics}>

                  <Metric

                    label="Critical"

                    value={severityCounts.critical.toLocaleString()}

                  />

                  <Metric

                    label="High"

                    value={severityCounts.high.toLocaleString()}

                  />

                  <Metric

                    label="Warning"

                    value={severityCounts.warning.toLocaleString()}

                  />

                  <Metric

                    label="Info"

                    value={severityCounts.info.toLocaleString()}

                  />

                </div>

              ) : (

                <p style={styles.noteText}>

                  The shared quality engine is scanning this dataset.

                </p>

              )}

            </div>

            <div style={styles.note}>

              {isHealthy ? (

                <CheckCircle2

                  size={14}

                  color="#d4d4d4"

                  aria-hidden="true"

                />

              ) : (

                <AlertTriangle

                  size={14}

                  color="#d4d4d4"

                  aria-hidden="true"

                />

              )}

              <p style={styles.noteText}>

                {qualitySummary === null

                  ? "Quality scan is running or unavailable."

                  : isHealthy

                    ? "No active quality issues were detected."

                    : "Review active quality findings before analysis. Select Issues for evidence and cleaning actions."}

              </p>

            </div>

          </>

        )}

        {activeTab === "Issues" && (

          <>

            <div

              style={{

                ...styles.scoreFooter,

                margin: "0 1px 8px",

              }}

            >

              <span style={styles.sectionTitle}>

                Engine findings

              </span>

              <span style={styles.status}>

                {engineScanResult

                  ? `${engineScanResult.issues.length} findings`

                  : engineScanError

                    ? "Scan failed"

                    : "Scanning unavailable"}

              </span>

            </div>

            {engineScanError && (

              <div style={styles.note} role="alert">

                <AlertTriangle size={14} aria-hidden="true" />

                <p style={styles.noteText}>{engineScanError}</p>

              </div>

            )}

            {engineScanResult && (

              <>

                <div style={styles.metrics}>

                  <Metric

                    label="Open issues"

                    value={(qualitySummary?.openIssues ?? 0).toLocaleString()}

                  />

                  <Metric

                    label="Critical"

                    value={(qualitySummary?.criticalIssues ?? 0).toLocaleString()}

                  />

                  <Metric

                    label="High severity"

                    value={(qualitySummary?.highIssues ?? 0).toLocaleString()}

                  />

                  <Metric

                    label="Affected rows"

                    value={(qualitySummary?.affectedRows ?? 0).toLocaleString()}

                  />

                </div>

                <p style={{ ...styles.muted, margin: "8px 1px" }}>

                  Scanned {qualitySummary?.scannedRows.toLocaleString() ?? "0"} rows

                  across {qualitySummary?.scannedColumns.toLocaleString() ?? "0"} columns

                  in {engineScanResult.durationMs} ms.

                </p>

                {engineScanResult.issues.length === 0 ? (

                  <div style={styles.empty}>

                    No issues were reported by the engine.

                  </div>

                ) : (

                  <>

                    <div style={{ display: "flex", flexDirection: "column", gap: 9, margin: "10px 1px 8px" }}>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

                        <span style={{ ...styles.muted, minWidth: 105 }}>Severity</span>

                        <div role="group" aria-label="Filter issues by severity" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>

                          {([["all", "All"], ["critical", "Critical"], ["high", "High"], ["warning", "Warning"], ["info", "Info"]] as const).map(([value, label]) => (

                            <button key={value} type="button" aria-pressed={severityFilter === value} onClick={() => setSeverityFilter(value)} style={{

                              border: severityFilter === value ? "1px solid #6b9f78" : "1px solid #525252",

                              borderRadius: 6, padding: "5px 9px",

                              background: severityFilter === value ? "rgba(74, 125, 86, 0.2)" : "#303030",

                              color: severityFilter === value ? "#b8dfc0" : "#d4d4d4",

                              fontSize: 10, fontWeight: 600, cursor: "pointer",

                            }}>{label}</button>

                          ))}

                        </div>

                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

                        <span style={{ ...styles.muted, minWidth: 105 }}>Quality dimension</span>

                        <div role="group" aria-label="Filter issues by quality dimension" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>

                          <button type="button" aria-pressed={dimensionFilter === "all"} onClick={() => setDimensionFilter("all")} style={{

                            border: dimensionFilter === "all" ? "1px solid #6b9f78" : "1px solid #525252",

                            borderRadius: 6, padding: "5px 9px", background: dimensionFilter === "all" ? "rgba(74, 125, 86, 0.2)" : "#303030",

                            color: dimensionFilter === "all" ? "#b8dfc0" : "#d4d4d4", fontSize: 10, fontWeight: 600, cursor: "pointer",

                          }}>All</button>

                          {availableDimensions.map((dimension) => (

                            <button key={dimension} type="button" aria-pressed={dimensionFilter === dimension} onClick={() => setDimensionFilter(dimension)} style={{

                              border: dimensionFilter === dimension ? "1px solid #6b9f78" : "1px solid #525252",

                              borderRadius: 6, padding: "5px 9px", background: dimensionFilter === dimension ? "rgba(74, 125, 86, 0.2)" : "#303030",

                              color: dimensionFilter === dimension ? "#b8dfc0" : "#d4d4d4", fontSize: 10, fontWeight: 600, cursor: "pointer",

                            }}>{dimension}</button>

                          ))}

                        </div>

                      </div>

                    </div>

                    <p style={{ ...styles.muted, margin: "0 1px 7px" }}>Showing {filteredEngineIssues.length.toLocaleString()} of {engineScanResult.issues.length.toLocaleString()} findings · {severityFilter === "all" ? "All severities" : severityFilter} · {dimensionFilter === "all" ? "All dimensions" : dimensionFilter}</p>

                    {filteredEngineIssues.length === 0 ? (

                      <div style={styles.empty}>No findings match the selected severity and dimension filters.</div>

                    ) : (

                      <div style={styles.issueList}>

                        {filteredEngineIssues.map((issue, index) => {

                      const expanded = expandedIssueId === `${issue.detectorId}:${issue.id}`;

                      const issueKey = `${issue.detectorId}:${issue.id}`;

                      // Some detectors provide curated examples while others only

                      // provide row indexes. Build a small, read-only fallback sample

                      // from the current registry rows so every finding is inspectable.

                      const issueSampleColumns = (issue.columns?.length ? issue.columns : columnNames).slice(0, 4);

                      const issueSampleRows = [...new Set(issue.rowIndexes ?? [])]

                        .filter((rowIndex) => Number.isInteger(rowIndex) && rowIndex >= 0 && rowIndex < rows.length)

                        .slice(0, 5)

                        .map((rowIndex) => ({ rowIndex, row: rows[rowIndex] }));

                      return (

                        <div

                          key={issueKey}

                          style={{

                            borderBottom:

                              index === filteredEngineIssues.length - 1

                                ? 0

                                : "1px solid #3b3b3b",

                          }}

                        >

                          <button

                            type="button"

                            aria-expanded={expanded}

                            onClick={() =>

                              setExpandedIssueId(expanded ? null : issueKey)

                            }

                            style={{

                              ...styles.issueRow,

                              borderBottom: 0,

                              width: "100%",

                              textAlign: "left",

                            }}

                          >

                            <span style={{ flex: 1, minWidth: 0 }}>

                              <span style={styles.issueLabel}>

                                {issue.title}

                              </span>

                              <span style={styles.issueHint}>

                                {issue.description}

                              </span>

                              <span style={styles.issueHint}>

                                {issue.severity.toUpperCase()} · {issue.dimension}

                                {issue.columns.length

                                  ? ` · ${issue.columns.join(", ")}`

                                  : ""}

                              </span>

                            </span>

                            <strong style={styles.issueCount}>

                              {issue.affectedCount.toLocaleString()}

                            </strong>

                            <ChevronRight

                              size={13}

                              aria-hidden="true"

                              color="#a3a3a3"

                              style={{

                                transform: expanded ? "rotate(90deg)" : "none",

                                transition: "transform 150ms ease",

                              }}

                            />

                          </button>

                          {expanded && (

                            <div style={{ padding: "0 10px 12px" }}>

                              <p style={styles.sectionTitle}>Evidence</p>

                              {issue.evidence.length > 0 ? (

                                issue.evidence.map((item, evidenceIndex) => (

                                  <p

                                    key={`${evidenceIndex}:${item}`}

                                    style={{ ...styles.noteText, marginBottom: 5 }}

                                  >

                                    {item}

                                  </p>

                                ))

                              ) : (

                                <p style={styles.noteText}>

                                  No additional evidence was provided.

                                </p>

                              )}

                              {issueSampleRows.length > 0 && (

                                <div style={{ marginTop: 12 }}>

                                  <p style={styles.sectionTitle}>Affected row samples</p>

                                  <p style={{ ...styles.issueHint, marginBottom: 7 }}>Showing up to {issueSampleRows.length} of {issue.rowIndexes.length.toLocaleString()} affected row references</p>

                                  {issueSampleRows.map(({ rowIndex, row }) => (

                                    <div key={`row-sample-${rowIndex}`} style={{ padding: "7px 8px", marginBottom: 5, border: "1px solid #414141", borderRadius: 6, background: "#2b2b2b" }}>

                                      <p style={styles.issueHint}>Row {rowIndex + 1}</p>

                                      <div style={{ display: "grid", gridTemplateColumns: "minmax(80px, 0.8fr) minmax(0, 1.2fr)", gap: "4px 10px", marginTop: 5 }}>

                                        {issueSampleColumns.map((column) => {

                                          const value = row?.[column];

                                          const displayValue = value === null || value === undefined ? "(empty)" : String(value);

                                          return (

                                            <div key={`${rowIndex}-${column}`} style={{ display: "contents" }}>

                                              <span style={{ ...styles.issueHint, overflowWrap: "anywhere" }}>{column}</span>

                                              <span style={{ ...styles.noteText, overflowWrap: "anywhere" }}>{displayValue.length > 180 ? `${displayValue.slice(0, 177)}…` : displayValue}</span>

                                            </div>

                                          );

                                        })}

                                      </div>

                                    </div>

                                  ))}

                                </div>

                              )}

                              {issue.examples.length > 0 && (

                                <div style={{ marginTop: 12 }}>

                                  <p style={styles.sectionTitle}>

                                    Sample values

                                  </p>

                                  {issue.examples.map((example, exampleIndex) => (

                                    <div

                                      key={`${exampleIndex}:${example.rowIndex}:${example.column}`}

                                      style={{

                                        padding: "7px 8px",

                                        marginBottom: 5,

                                        border: "1px solid #414141",

                                        borderRadius: 6,

                                        background: "#2b2b2b",

                                      }}

                                    >

                                      <p style={styles.issueHint}>

                                        Row {example.rowIndex + 1} · {example.column}

                                      </p>

                                      <p style={{ ...styles.noteText, marginTop: 4 }}>

                                        Before: {String(example.before ?? "null")}

                                      </p>

                                      {example.after !== undefined && (

                                        <p style={{ ...styles.noteText, marginTop: 3 }}>

                                          After: {String(example.after)}

                                        </p>

                                      )}

                                      {example.reason && (

                                        <p style={{ ...styles.noteText, marginTop: 3 }}>

                                          {example.reason}

                                        </p>

                                      )}

                                    </div>

                                  ))}

                                </div>

                              )}

                              <div style={{ marginTop: 12 }}>

                                <p style={styles.sectionTitle}>

                                  Available actions

                                </p>

                                {issue.actions.length > 0 ? (

                                  issue.actions.map((action) => (

                                    <div

                                      key={action.id}

                                      style={{

                                        padding: "7px 8px",

                                        marginBottom: 5,

                                        border: "1px solid #414141",

                                        borderRadius: 6,

                                      }}

                                    >

                                      <p style={styles.issueLabel}>

                                        {action.label}

                                      </p>

                                      {action.description && (

                                        <p style={{ ...styles.issueHint, whiteSpace: "normal" }}>

                                          {action.description}

                                        </p>

                                      )}

                                      <p style={styles.issueHint}>

                                        Risk: {action.risk} · {action.enabled ? "Available" : "Disabled"}

                                      </p>

                                    </div>

                                  ))

                                ) : (

                                  <p style={styles.noteText}>

                                    No remediation actions were provided by this detector.

                                  </p>

                                )}

                              </div>

                            </div>

                          )}

                        </div>

                      );

                        })}

                      </div>

                    )}

                  </>

                )}

                {engineScanResult.summary.warnings.length > 0 && (

                  <div style={styles.note}>

                    <AlertTriangle size={14} aria-hidden="true" />

                    <div style={{ minWidth: 0 }}>

                      <p style={styles.noteText}>

                        {engineScanResult.summary.warnings.length} scan note(s)

                      </p>

                      {engineScanResult.summary.warnings.map((warning, index) => (

                        <p key={`${index}:${warning}`} style={styles.issueHint}>

                          {formatQualityWarning(warning)}

                        </p>

                      ))}

                    </div>

                  </div>

                )}

              </>

            )}

            <div

              style={{

                ...styles.scoreFooter,

                margin: "16px 1px 8px",

              }}

            >

              <span style={styles.sectionTitle}>

                Existing cleaning shortcuts

              </span>

              <span style={styles.status}>

                Dataset overview

              </span>

            </div>

            <div style={styles.issueList}>

              <IssueRow

                label="Columns with missing values"

                detail="Open missing-value management"

                value={columnsWithMissing.toLocaleString()}

                onClick={() => handleNavigateToTool("missing-values")}

              />

              <IssueRow

                label="Missing cells"

                detail="Inspect and replace missing values"

                value={summary.missingCells.toLocaleString()}

                onClick={() => handleNavigateToTool("missing-values")}

              />

              <IssueRow

                label="Duplicate records"

                detail="Review and remove duplicate rows"

                value={summary.duplicateRows.toLocaleString()}

                onClick={() => handleNavigateToTool("duplicate-rows")}

                last

              />

            </div>

          </>

        )}

        {activeTab === "Columns" && (

          <div style={{ margin: "0 -10px -10px" }}>

            <ColumnQualityInspection

              key={dataset.id}

              dataset={dataset}

              onNavigateToTool={handleNavigateToTool}

            />

          </div>

        )}

      </div>

      <p

        style={{

          margin: 0,

          padding: "8px 11px",

          borderTop: "1px solid #414141",

          color: "#8f8f8f",

          fontSize: 9,

          lineHeight: 1.45,

        }}

      >

        Quality score and active issue counts are calculated by the shared

        Dock quality engine. A score is not a guarantee that every value is

        accurate or suitable for every analysis.

      </p>

      <style>{`

        @media (max-width: 520px) {

          .dock-quality-compact-metrics {

            grid-template-columns: repeat(2, minmax(0, 1fr));

          }

        }

        @media (prefers-reduced-motion: reduce) {

          * {

            transition-duration: 0.01ms !important;

          }

        }

      `}</style>

    </section>

  );

}
