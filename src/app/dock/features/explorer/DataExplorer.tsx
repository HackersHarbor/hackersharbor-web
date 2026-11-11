"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import * as duckdb from "@duckdb/duckdb-wasm";

import {
  Folder,
  CalendarDays,
  Check,
  ShieldCheck,
  Workflow,
  PanelLeftClose,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
} from "lucide-react";

import type { PyodideInterface } from "pyodide";

import { useDatasets } from "../../hooks/useDatasets";

import { useDatasetImport } from "../../hooks/useDatasetImport";

import { datasetImportService } from "../../services/datasets/DatasetImportService";

import { datasetRegistry } from "../../services/datasets/DatasetRegistry";

import type { DockDataset } from "../../types/dataset";

import DatasetUpload from "./DatasetUpload";

import DatasetPreview from "./DatasetPreview";

import SchemaPanel from "./SchemaPanel";

import DataQualityPanel, { type QualityAction } from "./DataQualityPanel";

import MissingValuesPanel from "./MissingValuesPanel";

import DuplicateRowsPanel from "./DuplicateRowsPanel";

import TransformationPipelinePanel from "./TransformationPipelinePanel";
import SmartCleaningWorkbench from "./SmartCleaningWorkbench";

import styles from "./data-explorer.module.css";

// Load Pyodide from its browser distribution instead of bundling its internal
// dynamic imports through Next.js/Turbopack.
const PYODIDE_VERSION = "0.29.3";
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
    __dockPyodideScriptPromise?: Promise<void>;
  }
}

function loadPyodideFromCdn(): Promise<PyodideInterface> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Python can only be initialized in the browser."));
  }

  const startRuntime = () => {
    if (!window.loadPyodide) {
      throw new Error("Pyodide loaded, but its browser loader was not found.");
    }
    return window.loadPyodide({ indexURL: PYODIDE_BASE_URL });
  };

  if (window.loadPyodide) {
    return Promise.resolve().then(startRuntime);
  }

  if (!window.__dockPyodideScriptPromise) {
    window.__dockPyodideScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-dock-pyodide="true"]',
      );
      const script = existing ?? document.createElement("script");

      const fail = () => {
        window.__dockPyodideScriptPromise = undefined;
        reject(new Error(
          "Could not load Pyodide from jsDelivr. Check your internet connection or CDN access.",
        ));
      };

      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", fail, { once: true });

      if (!existing) {
        script.src = `${PYODIDE_BASE_URL}pyodide.js`;
        script.async = true;
        script.dataset.dockPyodide = "true";
        document.head.appendChild(script);
      } else if (window.loadPyodide) {
        resolve();
      }
    });
  }

  return window.__dockPyodideScriptPromise.then(startRuntime);
}


type WorkspaceKind =

  | "sql"

  | "python"

  | "dataset"

  | "quality"

  | "clean"

  | "pipeline"

  | "schema";

type WorkspaceTab = {

  id: string;

  kind: WorkspaceKind;

  title: string;

  datasetId?: string;

  tool?: QualityAction;

};

type ResultRow = Record<string, unknown>;

type WorkspaceResult = {

  resultRows: ResultRow[];

  resultColumns: string[];

  resultMode: "table" | "output";

  resultView: "table" | "chart";

  output: string;

  engineError: string;

  elapsedMs: number | null;

};

const EMPTY_WORKSPACE_RESULT: WorkspaceResult = {

  resultRows: [],

  resultColumns: [],

  resultMode: "table",

  resultView: "table",

  output: "",

  engineError: "",

  elapsedMs: null,

};

const DEFAULT_SQL = `-- Query an imported dataset
SELECT *
FROM {{table}}
LIMIT 100;`;

const EMPTY_SQL_STARTER = `-- Upload a dataset to start querying
-- Select a dataset in Explorer to populate this query.`;

const DEFAULT_PYTHON = `# The selected dataset is available as data.

# Imported datasets are available through datasets.

import json

print(f"Rows: {len(data)}")

print(f"Columns: {list(data[0].keys()) if data else []}")

if data:

    missing = {

        column: sum(

            row.get(column) is None or row.get(column) == ""

            for row in data

        )

        for column in data[0]

    }

    print("Missing values:", missing)

`;

function sqlName(name: string): string {

  return (

    (name || "dataset")

      .replace(/[^a-zA-Z0-9_]/g, "_")

      .replace(/^[^a-zA-Z_]+/, "table") || "dataset"

  );

}

function sqlIdentifier(name: string): string {

  return `"${name.replace(/"/g, '""')}"`;

}


function datasetTableBase(dataset: DockDataset): string {
  const sourceName = (dataset.fileName || dataset.name).replace(/\.csv$/i, "");
  return sqlName(sourceName.replace(/\s+\(\d+\)$/, ""));
}

function getDatasetTableName(
  dataset: DockDataset,
  allDatasets: DockDataset[],
): string {
  const targetIndex = allDatasets.findIndex((item) => item.id === dataset.id);
  const preceding = targetIndex < 0 ? [] : allDatasets.slice(0, targetIndex);
  const used = new Set<string>();

  for (const item of preceding) {
    const base = datasetTableBase(item);
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${suffix}`;
      suffix += 1;
    }
    used.add(candidate);
  }

  const base = datasetTableBase(dataset);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }
  return candidate;
}


// Use the BigInt constructor instead of bigint literals so this file also
// compiles when the TypeScript target is below ES2020.
const BIGINT_MIN = BigInt("-9223372036854775808");
const BIGINT_MAX = BigInt("9223372036854775807");
const HUGEINT_MIN = BigInt("-170141183460469231731687303715884105728");
const HUGEINT_MAX = BigInt("170141183460469231731687303715884105727");

function integerDuckType(rows: Record<string, unknown>[], columnName: string): string {
  let needsHugeInt = false;

  for (const row of rows) {
    const value = row[columnName];
    if (value === null || value === undefined || value === "") continue;

    const text = typeof value === "bigint" ? value.toString() : String(value).trim();
    if (!/^[+-]?\d+$/.test(text)) return "VARCHAR";

    try {
      const integer = BigInt(text);
      if (integer < HUGEINT_MIN || integer > HUGEINT_MAX) return "VARCHAR";
      if (integer < BIGINT_MIN || integer > BIGINT_MAX) needsHugeInt = true;
    } catch {
      return "VARCHAR";
    }
  }

  return needsHugeInt ? "HUGEINT" : "BIGINT";
}

function duckDbColumnType(
  column: DockDataset["columns"][number],
  rows: Record<string, unknown>[],
): string {
  switch (column.type) {
    case "integer":
      return integerDuckType(rows, column.name);
    case "float":
      return "DOUBLE";
    case "boolean":
      return "BOOLEAN";
    case "date":
      return "DATE";
    case "datetime":
      return "TIMESTAMP";
    case "string":
    case "null":
    case "unknown":
    default:
      return "VARCHAR";
  }
}

async function createDatasetTable(
  connection: duckdb.AsyncDuckDBConnection,
  dataset: DockDataset,
  tableName: string,
  fileName: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  if (dataset.columns.length === 0) {
    throw new Error(`Dataset "${dataset.name}" has no columns to register.`);
  }

  const definitions = dataset.columns.map((column) => {
    const name = sqlIdentifier(column.name);
    const type = duckDbColumnType(column, rows);
    return `${name} ${type}`;
  });

  // Define the physical schema first. Do not let CREATE TABLE AS SELECT or
  // read_json_auto infer the destination column types.
  await connection.query(
    `CREATE TABLE ${sqlIdentifier(tableName)} (${definitions.join(", ")})`,
  );

  if (rows.length === 0) return;

  const source = `read_json_auto('${fileName.replace(/'/g, "''")}')`;
  const projection = dataset.columns.map((column) => {
    const name = sqlIdentifier(column.name);
    const type = duckDbColumnType(column, rows);
    return `TRY_CAST(${name} AS ${type}) AS ${name}`;
  }).join(", ");

  await connection.query(
    `INSERT INTO ${sqlIdentifier(tableName)} SELECT ${projection} FROM ${source}`,
  );
}

function displayValue(value: unknown): string {

  if (value === null || value === undefined) {

    return "NULL";

  }

  if (value instanceof Date) {

    return value.toISOString();

  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "object") {

    // Apache Arrow represents some wide SQL integers (for example HUGEINT)
    // as Decimal scalar objects. Their toJSON() method returns the scalar
    // text, but JSON.stringify() wraps that text in another JSON string,
    // producing visible escaped quotes such as "\\\"29\\\"".
    // Prefer a scalar's primitive JSON representation when it is a string;
    // retain JSON formatting for arrays and ordinary structured objects.
    try {
      const toJSON = (value as { toJSON?: () => unknown }).toJSON;
      if (typeof toJSON === "function") {
        const jsonValue = toJSON.call(value);
        if (typeof jsonValue === "string") {
          // Some Arrow decimal scalars return a JSON-encoded string
          // (for example, the text '"29"') rather than the bare scalar
          // text. Decode that wrapper only when it matches the scalar's
          // own string representation, so ordinary text values are kept.
          try {
            let decoded: unknown = jsonValue;

            // Arrow decimal scalars may expose nested JSON string wrappers.
            // Unwrap only valid JSON string layers; ordinary text is left
            // untouched because JSON.parse() will reject unquoted text.
            for (let depth = 0; depth < 3 && typeof decoded === "string"; depth += 1) {
              const next: unknown = JSON.parse(decoded);
              if (typeof next !== "string" || next === decoded) {
                decoded = next;
                break;
              }
              decoded = next;
            }

            if (typeof decoded === "string" || typeof decoded === "number" || typeof decoded === "bigint") {
              return String(decoded);
            }
          } catch {
            // The scalar returned ordinary, non-JSON text.
          }

          return jsonValue;
        }
      }

      return JSON.stringify(value);
    } catch {
      return String(value);
    }

  }

  return String(value);

}

function errorMessage(error: unknown): string {

  return error instanceof Error ? error.message : String(error);

}

function normalizedDatasetName(name: string): string {
  return name.replace(/\.[^.]+$/, "").trim().toLocaleLowerCase();
}

function datasetContentSignature(datasetId: string, columns: DockDataset["columns"]): string {
  const rows = datasetRegistry.getRows(datasetId) ?? [];
  const columnNames = columns.map((column) => typeof column === "string" ? column : column.name);
  return JSON.stringify({ columns: columnNames, rows: rows.map((row) => columnNames.map((column) => row[column] ?? null)) });
}

function formatNumericValue(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 12 }).format(value);
  }
  if (typeof value === "string" && value.trim() !== "" && /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i.test(value.trim())) {
    const number = Number(value);
    if (Number.isFinite(number)) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 12 }).format(number);
  }
  return displayValue(value);
}

function formatChartValue(value: unknown, aggregation: "sum" | "average" | "count" | "min" | "max" | "median"): string {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return displayValue(value);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: aggregation === "average" || aggregation === "median" ? 2 : 2,
  }).format(number);
}

export default function DataExplorer() {

  const { datasets, removeDataset } = useDatasets();

  const {

    importFiles,

    isImporting,

    error: importError,

    clearError,

  } = useDatasetImport();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [previewVersion, setPreviewVersion] = useState(0);

  // Preserve the imported/original rows once so cleaning can be reversed.
  const [originalRowsById, setOriginalRowsById] = useState<Record<string, ResultRow[]>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = window.localStorage.getItem("dock-data-explorer-original-rows-v1");
      return saved ? JSON.parse(saved) as Record<string, ResultRow[]> : {};
    } catch {
      return {};
    }
  });

  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    { id: "sql-main", kind: "sql", title: "Query 1" },
    { id: "python-main", kind: "python", title: "Python 1" },
  ]);

  const [activeTabId, setActiveTabId] = useState("sql-main");

  const activeTabIdRef = useRef("sql-main");

  activeTabIdRef.current = activeTabId;

  const [sqlText, setSqlText] = useState<Record<string, string>>({

    "sql-main": DEFAULT_SQL,

  });

  const [pythonText, setPythonText] = useState<Record<string, string>>({
    "python-main": DEFAULT_PYTHON,
  });

  // Each workspace owns its own results, output, errors and execution time.

  const [workspaceResults, setWorkspaceResults] = useState<

    Record<string, WorkspaceResult>

  >({

    "sql-main": { ...EMPTY_WORKSPACE_RESULT },
    "python-main": { ...EMPTY_WORKSPACE_RESULT },

  });

  const [rowLimit, setRowLimit] = useState("100");

  // These values represent the currently visible workspace's result panel.

  const [resultRows, setResultRows] = useState<ResultRow[]>([]);

  const [resultColumns, setResultColumns] = useState<string[]>([]);

  const [resultMode, setResultMode] = useState<"table" | "output">("table");

  const [resultView, setResultView] = useState<"table" | "chart">("table");

  const [output, setOutput] = useState("");

  const [engineError, setEngineError] = useState("");

  const [isRunning, setIsRunning] = useState(false);

  const [isEngineReady, setIsEngineReady] = useState(false);

  const [pythonReady, setPythonReady] = useState(false);

  const [sqlEngineError, setSqlEngineError] = useState("");

  const [pythonEngineError, setPythonEngineError] = useState("");

  // Remember the selected dataset workspace view independently for each dataset.
  // A dataset with no saved preference always opens on Preview.
  const [datasetViewTabs, setDatasetViewTabs] = useState<Record<string, "preview" | "schema" | "quality" | "smart-clean">>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = window.localStorage.getItem("dock-data-explorer-dataset-views-v1");
      return saved ? JSON.parse(saved) as Record<string, "preview" | "schema" | "quality" | "smart-clean"> : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("dock-data-explorer-dataset-views-v1", JSON.stringify(datasetViewTabs));
    } catch {
      // Storage may be unavailable; per-dataset view selection still works in this session.
    }
  }, [datasetViewTabs]);

  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const [explorerSearch, setExplorerSearch] = useState("");

  // Display-name aliases are kept separately from dataset IDs/table names so
  // renaming never breaks SQL registrations, saved notebooks, or row storage.
  const [datasetNameOverrides, setDatasetNameOverrides] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = window.localStorage.getItem("dock-data-explorer-name-overrides-v1");
      return saved ? JSON.parse(saved) as Record<string, string> : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("dock-data-explorer-name-overrides-v1", JSON.stringify(datasetNameOverrides));
    } catch {
      // Storage may be unavailable; the current session still keeps the names.
    }
  }, [datasetNameOverrides]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({

    datasets: true,

    workspace: true,

  });

  const [showExplorer, setShowExplorer] = useState(true);

  const [showNewMenu, setShowNewMenu] = useState(false);

  const [isUploadCompact, setIsUploadCompact] = useState(false);
  const [isExplorerDragActive, setIsExplorerDragActive] = useState(false);

  const explorerRef = useRef<HTMLElement | null>(null);

  const uploadDockRef = useRef<HTMLDivElement | null>(null);

  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  const tabElementRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [chartColumn, setChartColumn] = useState("");

  const [chartValueColumn, setChartValueColumn] = useState("");
  const [chartType, setChartType] = useState<"bar" | "column" | "line" | "pie">("column");
  const [chartAggregation, setChartAggregation] = useState<"sum" | "average" | "count" | "min" | "max" | "median">("average");
  const [chartSort, setChartSort] = useState<"value-desc" | "value-asc" | "label-asc" | "label-desc">("value-desc");
  const [chartTopN, setChartTopN] = useState("10");
  const [resultsHeight, setResultsHeight] = useState(34);
  const resultsPanelRef = useRef<HTMLElement | null>(null);

  const startResultsResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const panel = resultsPanelRef.current;
      const container = panel?.parentElement;
      if (!panel || !container) return;

      const startY = event.clientY;
      const startHeight = panel.getBoundingClientRect().height;
      const containerHeight = container.getBoundingClientRect().height;
      if (containerHeight <= 0) return;

      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";

      const onPointerMove = (moveEvent: PointerEvent) => {
        const nextHeight = startHeight + (startY - moveEvent.clientY);
        const nextPercent = (nextHeight / containerHeight) * 100;
        setResultsHeight(Math.min(88, Math.max(12, nextPercent)));
      };

      const stopResize = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", stopResize);
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopResize, { once: true });
    },
    [],
  );

  const duckRef = useRef<duckdb.AsyncDuckDB | null>(null);

  const connectionRef = useRef<duckdb.AsyncDuckDBConnection | null>(null);

  const sqlInitPromiseRef = useRef<Promise<duckdb.AsyncDuckDBConnection> | null>(null);

  // SQL must wait until the currently imported/cleaned datasets have been registered.
  const datasetRegistrationRef = useRef<Promise<void>>(Promise.resolve());

  const registeredRowsRef = useRef<Map<string, unknown[]>>(new Map());

  const pyodideRef = useRef<PyodideInterface | null>(null);

  const pythonInitPromiseRef = useRef<Promise<PyodideInterface> | null>(null);

  const datasetsRef = useRef(datasets);
  datasetsRef.current = datasets;

  const selectedDataset = useMemo(

    () => datasets.find((dataset) => dataset.id === selectedId) ?? null,

    [datasets, selectedId],

  );

  useEffect(() => {
    let changed = false;
    setOriginalRowsById((current) => {
      const next = { ...current };
      for (const dataset of datasets) {
        if (Object.prototype.hasOwnProperty.call(next, dataset.id)) continue;
        const rows = datasetRegistry.getRows(dataset.id);
        if (Array.isArray(rows)) {
          next[dataset.id] = rows.map((row) => ({ ...row }));
          changed = true;
        }
      }
      if (changed && typeof window !== "undefined") {
        try { window.localStorage.setItem("dock-data-explorer-original-rows-v1", JSON.stringify(next)); } catch { /* Storage may be unavailable for large datasets. */ }
      }
      return changed ? next : current;
    });
  }, [datasets]);

  // Compare original/current rows once per dataset revision, not every time
  // a row badge or toolbar asks whether a dataset has been cleaned.
  const datasetCleanStates = useMemo(() => {
    const states = new Map<string, { originalCount: number; currentCount: number }>();

    for (const dataset of datasets) {
      const original = originalRowsById[dataset.id];
      if (!original) continue;

      const current = datasetRegistry.getRows(dataset.id) ?? [];
      const same =
        original.length === current.length &&
        original.every((row, index) => JSON.stringify(row) === JSON.stringify(current[index]));

      if (!same) {
        states.set(dataset.id, {
          originalCount: original.length,
          currentCount: current.length,
        });
      }
    }

    return states;
  }, [datasets, originalRowsById, previewVersion]);

  const getDatasetCleanState = useCallback(
    (datasetId: string) => datasetCleanStates.get(datasetId) ?? null,
    [datasetCleanStates],
  );

  const restoreOriginalDataset = useCallback((datasetId: string) => {
    const original = originalRowsById[datasetId];
    if (!original) return;
    datasetRegistry.replaceRows(datasetId, original.map((row) => ({ ...row })));
    setPreviewVersion((version) => version + 1);
  }, [originalRowsById]);

  const allRows = useMemo(

    () => (selectedId ? datasetRegistry.getRows(selectedId) : []),

    [selectedId, previewVersion, datasets],

  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  useEffect(() => {
    const tabElement = tabElementRefs.current[activeTabId];
    if (tabElement) tabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeTabId, tabs.length]);

  const tabDataset = activeTab?.datasetId

    ? datasets.find((dataset) => dataset.id === activeTab.datasetId) ?? null

    : selectedDataset;

  const datasetViewTab = tabDataset ? (datasetViewTabs[tabDataset.id] ?? "preview") : "preview";

  const setDatasetViewTab = useCallback((view: "preview" | "schema" | "quality" | "smart-clean") => {
    if (!tabDataset) return;
    setDatasetViewTabs((current) => ({ ...current, [tabDataset.id]: view }));
  }, [tabDataset?.id]);

  const filteredDatasets = useMemo(() => {
    const query = explorerSearch.trim().toLowerCase();
    if (!query) return datasets;

    return datasets.filter((dataset) =>
      `${datasetNameOverrides[dataset.id] ?? dataset.name} ${dataset.name} ${dataset.tableName} ${dataset.columns
        .map((column) => column.name)
        .join(" ")}`
        .toLowerCase()
        .includes(query),
    );
  }, [datasets, explorerSearch, datasetNameOverrides]);

  // Keep same-name imports instead of silently deleting data; label them with suffixes.
  const datasetDisplayNames = useMemo(() => {
    const seen = new Map<string, number>();
    const labels = new Map<string, string>();
    for (const dataset of datasets) {
      const baseName = (datasetNameOverrides[dataset.id] ?? dataset.name).trim() || "Dataset";
      const key = baseName.toLocaleLowerCase();
      const occurrence = (seen.get(key) ?? 0) + 1;
      seen.set(key, occurrence);
      labels.set(dataset.id, occurrence === 1 ? baseName : `${baseName} (${occurrence})`);
    }
    return labels;
  }, [datasets, datasetNameOverrides]);

  const preview = useMemo(

    () =>

      selectedId

        ? datasetImportService.getPreview(selectedId, 0, 500)

        : null,

    [selectedId, previewVersion, datasets],

  );

  const tabPreview = useMemo(() => {
    const datasetId = tabDataset?.id;
    return datasetId
      ? datasetImportService.getPreview(datasetId, 0, 500)
      : null;
  }, [tabDataset?.id, previewVersion, datasets]);

  useEffect(() => {

    if (datasets.length === 0) {

      setSelectedId(null);

      return;

    }

    if (!selectedId || !datasets.some((dataset) => dataset.id === selectedId)) {

      setSelectedId(datasets[0].id);

    }

  }, [datasets, selectedId]);

  // Start DuckDB only when the user first runs SQL. This avoids loading the
  // worker, WASM module, and database connection during the initial page render.
  const ensureSqlRuntime = async (): Promise<duckdb.AsyncDuckDBConnection> => {
    if (connectionRef.current) return connectionRef.current;

    if (!sqlInitPromiseRef.current) {
      sqlInitPromiseRef.current = (async () => {
        let db: duckdb.AsyncDuckDB | null = null;
        let connection: duckdb.AsyncDuckDBConnection | null = null;

        try {
          const bundles = duckdb.getJsDelivrBundles();
          const bundle = await duckdb.selectBundle(bundles);
          if (!bundle.mainWorker || !bundle.mainModule) {
            throw new Error("A compatible DuckDB worker bundle was not found.");
          }

          const workerBootstrap = new Blob(
            [`importScripts(${JSON.stringify(bundle.mainWorker)});`],
            { type: "text/javascript" },
          );
          const workerUrl = URL.createObjectURL(workerBootstrap);
          const worker = new Worker(workerUrl);
          URL.revokeObjectURL(workerUrl);

          db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
          await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
          connection = await db.connect();

          // Register the current datasets once during first startup.
          for (const dataset of datasetsRef.current) {
            const rows = datasetRegistry.getRows(dataset.id) ?? [];
            const tableName = getDatasetTableName(dataset, datasetsRef.current);
            const fileName = `dock_${sqlName(dataset.id)}.json`;
            await db.registerFileText(fileName, JSON.stringify(rows));
            await connection.query(`DROP TABLE IF EXISTS ${sqlIdentifier(tableName)}`);

            await createDatasetTable(
              connection,
              dataset,
              tableName,
              fileName,
              rows,
            );
            registeredRowsRef.current.set(dataset.id, rows);
          }

          duckRef.current = db;
          connectionRef.current = connection;
          setSqlEngineError("");
          setIsEngineReady(true);
          return connection;
        } catch (error) {
          if (connection) await connection.close().catch(() => undefined);
          if (db) await db.terminate().catch(() => undefined);
          const message = `SQL initialization failed: ${errorMessage(error)}`;
          setSqlEngineError(message);
          setEngineError(message);
          throw new Error(message);
        }
      })();
    }

    try {
      return await sqlInitPromiseRef.current;
    } catch (error) {
      sqlInitPromiseRef.current = null;
      throw error;
    }
  };

  // Prepare SQL automatically. The Run control stays disabled until DuckDB is ready.
  useEffect(() => {
    void ensureSqlRuntime().catch(() => {
      // ensureSqlRuntime already publishes the initialization error in the UI.
    });
    // Initialize once for this mounted Explorer instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pyodide is intentionally initialized on demand, when the user first runs Python.
  // This keeps the initial Dock page load lighter and avoids competing with DuckDB startup.

  // Register imported datasets as DuckDB tables.

  useEffect(() => {

    const connection = connectionRef.current;

    const db = duckRef.current;

    if (!connection || !db || !isEngineReady) return;

    let cancelled = false;

    async function registerDatasets() {

      const currentIds = new Set(datasets.map((dataset) => dataset.id));
      for (const registeredId of registeredRowsRef.current.keys()) {
        if (!currentIds.has(registeredId)) registeredRowsRef.current.delete(registeredId);
      }

      for (const dataset of datasets) {

        if (cancelled) return;

        const rows = datasetRegistry.getRows(dataset.id) ?? [];

        if (registeredRowsRef.current.get(dataset.id) === rows) continue;

        const tableName = getDatasetTableName(dataset, datasetsRef.current);

        const fileName = `dock_${sqlName(dataset.id)}.json`;

        try {

          await db!.registerFileText(fileName, JSON.stringify(rows));

          await connection!.query(

            `DROP TABLE IF EXISTS ${sqlIdentifier(tableName)}`,

          );

          await createDatasetTable(
            connection!,
            dataset,
            tableName,
            fileName,
            rows,
          );

          registeredRowsRef.current.set(dataset.id, rows);

        } catch (error) {

          if (!cancelled) {

            setEngineError(

              `Could not register ${dataset.name} in SQL: ${errorMessage(error)}`,

            );

          }

        }

      }

    }

    const registration = registerDatasets();
    datasetRegistrationRef.current = registration;

    return () => {

      cancelled = true;

    };

  }, [datasets, previewVersion, isEngineReady]);

  const saveWorkspaceResult = useCallback(

    (tabId: string, result: WorkspaceResult) => {

      setWorkspaceResults((current) => ({

        ...current,

        [tabId]: result,

      }));

    },

    [],

  );

  const activateWorkspace = useCallback(

    (tabId: string) => {

      activeTabIdRef.current = tabId;

      setActiveTabId(tabId);

      const targetTab = tabs.find((tab) => tab.id === tabId);

      if (targetTab?.datasetId) {

        setSelectedId(targetTab.datasetId);

      }

      const result =

        workspaceResults[tabId] ?? { ...EMPTY_WORKSPACE_RESULT };

      setResultRows(result.resultRows);

      setResultColumns(result.resultColumns);

      setResultMode(result.resultMode);

      setResultView(result.resultView);

      setOutput(result.output);

      setEngineError(result.engineError);

      setElapsedMs(result.elapsedMs);

    },

    [tabs, workspaceResults],

  );

  const openTab = useCallback(

    (tab: WorkspaceTab) => {

      setTabs((current) => {

        if (current.some((existing) => existing.id === tab.id)) {

          return current;

        }

        return [...current, tab];

      });

      activateWorkspace(tab.id);

      if (tab.datasetId) {

        setSelectedId(tab.datasetId);

      }

    },

    [activateWorkspace],

  );

  const renameDataset = useCallback((dataset: DockDataset) => {
    const currentName = datasetNameOverrides[dataset.id] ?? dataset.name;
    const requested = window.prompt("Rename dataset", currentName);
    if (requested === null) return;
    const nextName = requested.trim();
    if (!nextName) {
      window.alert("Dataset name cannot be empty.");
      return;
    }
    if (nextName.length > 100) {
      window.alert("Dataset names must be 100 characters or fewer.");
      return;
    }
    setDatasetNameOverrides((current) => ({ ...current, [dataset.id]: nextName }));
  }, [datasetNameOverrides]);

  const openDataset = useCallback(

    (dataset: DockDataset) => {

      setSelectedId(dataset.id);

      openTab({

        id: `dataset-${dataset.id}`,

        kind: "dataset",

        title: dataset.name,

        datasetId: dataset.id,

      });

    },

    [openTab],

  );

  const openTool = useCallback(

    (tool: QualityAction) => {

      openTab({

        id: `clean-${tool}-${selectedId ?? "none"}`,

        kind: "clean",

        title: tool === "missing-values" ? "Missing values" : "Duplicate rows",

        datasetId: selectedId ?? undefined,

        tool,

      });

    },

    [openTab, selectedId],

  );

  const closeTab = (id: string) => {

    const closingIndex = tabs.findIndex((tab) => tab.id === id);

    const remaining = tabs.filter((tab) => tab.id !== id);

    const nextTabs = remaining.length

      ? remaining

      : [{ id: "sql-main", kind: "sql" as const, title: "Query 1" }];

    setTabs(nextTabs);

    if (activeTabIdRef.current === id) {

      const replacement = nextTabs[Math.max(0, closingIndex - 1)] ?? nextTabs[0];

      const result =

        workspaceResults[replacement.id] ?? { ...EMPTY_WORKSPACE_RESULT };

      activeTabIdRef.current = replacement.id;

      setActiveTabId(replacement.id);

      setResultRows(result.resultRows);

      setResultColumns(result.resultColumns);

      setResultMode(result.resultMode);

      setResultView(result.resultView);

      setOutput(result.output);

      setEngineError(result.engineError);

      setElapsedMs(result.elapsedMs);

      if (replacement.datasetId) {

        setSelectedId(replacement.datasetId);

      }

    }

    setWorkspaceResults((current) => {

      const next = { ...current };

      delete next[id];

      if (!next["sql-main"] && nextTabs.some((tab) => tab.id === "sql-main")) {

        next["sql-main"] = { ...EMPTY_WORKSPACE_RESULT };

      }

      return next;

    });

    setSqlText((current) => {

      const next = { ...current };

      delete next[id];

      return next;

    });

    setPythonText((current) => {

      const next = { ...current };

      delete next[id];

      return next;

    });

  };

  const handleImport = async (files: File[]) => {
    try {
      const results = await importFiles(files);
      if (results.length === 0) return;

      const newlyImported = results.map((result) => result.dataset);
      const existingDatasets = datasets.filter(
        (dataset) => !newlyImported.some((added) => added.id === dataset.id),
      );
      const replacements = new Set<string>();

      for (const added of newlyImported) {
        const addedName = normalizedDatasetName(added.name);
        const addedSignature = datasetContentSignature(added.id, added.columns);
        const matches = existingDatasets.filter((existing) => {
          if (normalizedDatasetName(existing.name) === addedName) return true;
          return addedSignature === datasetContentSignature(existing.id, existing.columns);
        });
        if (matches.length === 0) continue;

        const matchNames = matches.map((dataset) => dataset.name).join(", ");
        const replace = window.confirm(
          `An existing dataset matches "${added.name}" (${matchNames}).\n\n` +
          `Replace existing, or keep both?\n\n` +
          `OK = Replace existing dataset(s)\nCancel = Keep both`,
        );
        if (replace) matches.forEach((dataset) => replacements.add(dataset.id));
      }

      // Remove previous copies only after the replacement has imported successfully.
      replacements.forEach((id) => removeDataset(id));

      const dataset = newlyImported[newlyImported.length - 1];
      setSelectedId(dataset.id);
      openDataset(dataset);
      setPreviewVersion((version) => version + 1);
      setEngineError("");
    } catch {
      // The import hook exposes the user-facing import error.
    }
  };

  const refreshDataset = () => {
    setPreviewVersion((version) => version + 1);
  };

  // Keep every dataset view and execution engine in sync after a row mutation.
  const handleDatasetRowsChanged = (
    datasetId: string,
    nextRows: ResultRow[],
  ) => {
    datasetRegistry.replaceRows(datasetId, nextRows);
    refreshDataset();
  };

  const exportCleanedCsv = () => {

    if (!tabDataset) return;

    const rows = datasetRegistry.getRows(tabDataset.id) ?? [];

    const columns = tabDataset.columns.map((column) =>
      typeof column === "string" ? column : column.name,
    );

    const escapeCsv = (value: unknown) => {
      const text = value == null ? "" : String(value);
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const csv = [
      columns.map(escapeCsv).join(","),
      ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (tabDataset.name || "dataset")
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "dataset";

    link.href = url;
    link.download = `${safeName}-cleaned.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

  };

  const createQuery = () => {

    const number = tabs.filter((tab) => tab.kind === "sql").length + 1;

    const id = `sql-${Date.now()}`;

    setSqlText((current) => ({

      ...current,

      [id]: DEFAULT_SQL,

    }));

    setWorkspaceResults((current) => ({

      ...current,

      [id]: { ...EMPTY_WORKSPACE_RESULT },

    }));

    openTab({

      id,

      kind: "sql",

      title: `Query ${number}`,

      datasetId: selectedId ?? undefined,

    });

  };

  const createNotebook = () => {

    const id = `python-${Date.now()}`;

    const number = tabs.filter((tab) => tab.kind === "python").length + 1;

    setPythonText((current) => ({

      ...current,

      [id]: DEFAULT_PYTHON,

    }));

    setWorkspaceResults((current) => ({

      ...current,

      [id]: { ...EMPTY_WORKSPACE_RESULT },

    }));

    openTab({

      id,

      kind: "python",

      title: `Python ${number}`,

      datasetId: selectedId ?? undefined,

    });

  };

  const toggleTree = (key: string) => {

    setExpanded((current) => ({

      ...current,

      [key]: !current[key],

    }));

  };

  const editorDataset = tabDataset ?? selectedDataset;

  const editorValue =
    activeTab?.kind === "python"
      ? pythonText[activeTab.id] ?? DEFAULT_PYTHON
      : editorDataset
        ? (sqlText[activeTab?.id ?? "sql-main"] ?? DEFAULT_SQL).replace(
            /{{table}}/g,
            sqlIdentifier(
              getDatasetTableName(editorDataset, datasets),
            ),
          )
        : EMPTY_SQL_STARTER;

  const onEditorChange = (value: string) => {

    if (!activeTab) return;

    if (activeTab.kind === "python") {

      setPythonText((current) => ({

        ...current,

        [activeTab.id]: value,

      }));

    } else {

      setSqlText((current) => ({

        ...current,

        [activeTab.id]: value,

      }));

    }

  };

  const lineCount = Math.max(1, editorValue.split("\n").length);

  const columns = useMemo(
    () => resultColumns.length ? resultColumns : Object.keys(resultRows[0] ?? {}),
    [resultColumns, resultRows],
  );

  // Memoize result metadata so switching Results / Output / Chart does not
  // rescan every row and column for large SQL result sets.
  const numericColumns = useMemo(
    () => columns.filter((column) =>
      resultRows.some((row) =>
        row[column] !== null &&
        row[column] !== undefined &&
        row[column] !== "" &&
        (typeof row[column] === "number" || Number.isFinite(Number(row[column]))),
      ),
    ),
    [columns, resultRows],
  );

  const defaultValueColumn = useMemo(() => (
    numericColumns.find((column) => {
      const name = column.trim().toLowerCase().replace(/[\\s_-]+/g, "");
      if (name === "id" || name.endsWith("id") || name === "uuid" || name.endsWith("key")) return false;
      const values = resultRows
        .map((row) => row[column])
        .filter((value) => value !== null && value !== undefined && value !== "");
      return values.length > 0 && new Set(values.map((value) => String(value))).size < resultRows.length;
    }) ?? numericColumns.find((column) => !/(^|[_\\s-])id($|[_\\s-])/i.test(column))
  ), [numericColumns, resultRows]);

  const previousChartRowsRef = useRef<ResultRow[] | null>(null);

  useEffect(() => {
    if (!resultRows.length || !columns.length) return;

    // Use Average as the default for each newly produced result set. Preserve
    // the user's chosen aggregation while they adjust chart controls for the
    // same result set.
    const isNewResultSet = previousChartRowsRef.current !== resultRows;
    if (isNewResultSet) {
      previousChartRowsRef.current = resultRows;
      setChartAggregation(defaultValueColumn ? "average" : "count");
    }

    if (!chartColumn || !columns.includes(chartColumn)) {
      const normalizedName = (column: string) => column.trim().toLowerCase().replace(/[\s_-]+/g, "");
      const preferredCategoryNames = ["department", "category", "segment", "group", "team", "region", "division", "type", "class"];
      const preferredCategory = columns.find((column) => preferredCategoryNames.includes(normalizedName(column)) && !numericColumns.includes(column));
      const repeatedCategorical = columns.find((column) => {
        if (numericColumns.includes(column)) return false;
        const normalized = normalizedName(column);
        if (["id", "uuid", "name", "firstname", "lastname", "fullname", "email"].includes(normalized) || normalized.endsWith("id")) return false;
        const values = resultRows.map((row) => displayValue(row[column]));
        return new Set(values).size < values.length;
      });
      const nonUniqueName = columns.find((column) => {
        if (numericColumns.includes(column)) return false;
        const values = resultRows.map((row) => displayValue(row[column]));
        return new Set(values).size < values.length;
      });
      const category = preferredCategory ?? repeatedCategorical ?? nonUniqueName ?? columns.find((column) => !numericColumns.includes(column)) ?? columns[0];
      setChartColumn(category ?? "");
    }
    if (!chartValueColumn || !numericColumns.includes(chartValueColumn)) {
      setChartValueColumn(defaultValueColumn ?? "");
      setChartAggregation(defaultValueColumn ? "average" : "count");
    }
  }, [resultRows, columns, numericColumns, chartColumn, chartValueColumn, defaultValueColumn]);

  const chartData = useMemo(() => {
    if (!chartColumn || !resultRows.length) return [];

    type ChartBucket = {
      label: string;
      count: number;
      sum: number;
      min: number;
      max: number;
      numericCount: number;
      values?: number[];
    };

    const needsMedian = chartAggregation === "median";
    const buckets = new Map<string, ChartBucket>();

    for (const row of resultRows) {
      const label = displayValue(row[chartColumn]);
      let bucket = buckets.get(label);
      if (!bucket) {
        bucket = {
          label,
          count: 0,
          sum: 0,
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
          numericCount: 0,
          ...(needsMedian ? { values: [] as number[] } : {}),
        };
        buckets.set(label, bucket);
      }

      bucket.count += 1;
      if (chartValueColumn) {
        const raw = row[chartValueColumn];
        const numeric = typeof raw === "number" ? raw : Number(raw);
        if (raw !== null && raw !== undefined && raw !== "" && Number.isFinite(numeric)) {
          bucket.sum += numeric;
          bucket.numericCount += 1;
          bucket.min = Math.min(bucket.min, numeric);
          bucket.max = Math.max(bucket.max, numeric);
          if (needsMedian) bucket.values!.push(numeric);
        }
      }
    }

    let grouped = Array.from(buckets.values(), (bucket) => {
      let value = bucket.count;
      if (chartAggregation === "sum") value = bucket.sum;
      else if (chartAggregation === "average") {
        value = bucket.numericCount ? bucket.sum / bucket.numericCount : 0;
      } else if (chartAggregation === "min") value = bucket.min === Number.POSITIVE_INFINITY ? 0 : bucket.min;
      else if (chartAggregation === "max") value = bucket.max === Number.NEGATIVE_INFINITY ? 0 : bucket.max;
      else if (chartAggregation === "median") {
        const values = bucket.values ?? [];
        values.sort((a, b) => a - b);
        const middle = Math.floor(values.length / 2);
        value = values.length
          ? (values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2)
          : 0;
      }
      return { label: bucket.label, value, count: bucket.count };
    });

    if (chartSort === "value-desc") grouped.sort((a, b) => b.value - a.value);
    else if (chartSort === "value-asc") grouped.sort((a, b) => a.value - b.value);
    else if (chartSort === "label-asc") grouped.sort((a, b) => a.label.localeCompare(b.label));
    else grouped.sort((a, b) => b.label.localeCompare(a.label));

    const limit = Math.max(1, Math.min(100, Number(chartTopN) || 10));
    if (grouped.length > limit) {
      const visible = grouped.slice(0, limit);
      const remainder = grouped.slice(limit);
      visible.push({
        label: "Other",
        value: remainder.reduce((sum, item) => sum + item.value, 0),
        count: remainder.reduce((sum, item) => sum + item.count, 0),
      });
      grouped = visible;
    }
    return grouped;
  }, [chartColumn, chartValueColumn, chartAggregation, chartSort, chartTopN, resultRows]);

  const exportChartPng = useCallback(() => {
    if (!chartData.length) return;
    const width = 1200;
    const height = 700;
    const margin = { top: 70, right: 45, bottom: 130, left: 105 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const maxValue = Math.max(1, ...chartData.map((item) => item.value));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#17191c";
    context.fillRect(0, 0, width, height);
    context.font = "600 22px Arial";
    context.fillStyle = "#f3f4f6";
    context.fillText(`${chartValueColumn || "Rows"} by ${chartColumn}`, margin.left, 38);
    context.font = "14px Arial";
    context.strokeStyle = "#383d43";
    context.fillStyle = "#b8c0ca";
    for (let tick = 0; tick <= 5; tick += 1) {
      const value = maxValue * tick / 5;
      const y = margin.top + plotHeight - plotHeight * tick / 5;
      context.beginPath(); context.moveTo(margin.left, y); context.lineTo(width - margin.right, y); context.stroke();
      context.textAlign = "right"; context.fillText(formatChartValue(value, chartAggregation), margin.left - 12, y + 5);
    }
    const slot = plotWidth / chartData.length;
    const barWidth = Math.min(56, slot * 0.62);
    chartData.forEach((item, index) => {
      const barHeight = Math.max(0, item.value / maxValue * plotHeight);
      const x = margin.left + index * slot + (slot - barWidth) / 2;
      const y = margin.top + plotHeight - barHeight;
      context.fillStyle = "#29b77a"; context.fillRect(x, y, barWidth, barHeight);
      context.fillStyle = "#f3f4f6"; context.textAlign = "center";
      context.fillText(formatChartValue(item.value, chartAggregation), x + barWidth / 2, Math.max(margin.top + 14, y - 8));
      context.save(); context.translate(x + barWidth / 2, margin.top + plotHeight + 18); context.rotate(-Math.PI / 4);
      context.fillStyle = "#c7cdd5"; context.textAlign = "right"; context.fillText(item.label.slice(0, 32), 0, 0); context.restore();
    });
    context.save(); context.translate(28, margin.top + plotHeight / 2); context.rotate(-Math.PI / 2);
    context.fillStyle = "#d1d5db"; context.textAlign = "center"; context.fillText(`${chartAggregation === "average" ? "Average" : chartAggregation[0].toUpperCase() + chartAggregation.slice(1)} ${chartValueColumn || "rows"}`, 0, 0); context.restore();
    context.fillStyle = "#d1d5db"; context.textAlign = "center"; context.fillText(chartColumn, margin.left + plotWidth / 2, height - 18);
    const link = document.createElement("a");
    link.download = `dock-chart-${(chartColumn || "chart").replace(/[^a-z0-9-_]+/gi, "-")}.png`;
    link.href = canvas.toDataURL("image/png"); link.click();
  }, [chartData, chartColumn, chartValueColumn, chartAggregation]);

  const runSql = async () => {

    const tabId = activeTabIdRef.current;

    setIsRunning(true);
    setEngineError("");

    let connection: duckdb.AsyncDuckDBConnection;
    try {
      connection = await ensureSqlRuntime();
      await datasetRegistrationRef.current;
    } catch (error) {
      const message = errorMessage(error);
      setEngineError(message);
      saveWorkspaceResult(tabId, {
        ...(workspaceResults[tabId] ?? EMPTY_WORKSPACE_RESULT),
        engineError: message,
      });
      setIsRunning(false);
      return;
    }

    const tab = tabs.find((item) => item.id === tabId);

    const dataset = tab?.datasetId

      ? datasets.find((item) => item.id === tab.datasetId) ?? selectedDataset

      : selectedDataset;

    const tableName = sqlName(

      dataset ? getDatasetTableName(dataset, datasets) : "dataset",

    );

    const sourceSql = sqlText[tabId] ?? DEFAULT_SQL;
    if (/{{table}}/i.test(sourceSql) && !dataset) {
      const message = "Import a dataset and select it in Explorer before running this query, or replace {{table}} with an existing SQL table name.";
      setEngineError(message);
      saveWorkspaceResult(tabId, {
        ...(workspaceResults[tabId] ?? EMPTY_WORKSPACE_RESULT),
        engineError: message,
      });
      setIsRunning(false);
      return;
    }

    const query = sourceSql.replace(
      /{{table}}/g,
      sqlIdentifier(tableName),
    );


    setEngineError("");

    let elapsed = 0;
    try {
      // Registration and table synchronization are not part of query duration.
      await datasetRegistrationRef.current;

      const queryStart = performance.now();
      const result = await connection.query(query);
      elapsed = Math.round(performance.now() - queryStart);

      const resultFields = result.schema.fields;

      // Read cells from their typed Arrow vectors instead of StructRow.toJSON().
      // toJSON() serializes certain DuckDB/Arrow integer scalars into quoted
      // JSON strings (for example, a HUGEINT can become the string \"29\").
      // Vector.get() returns the typed scalar directly, preserving numeric
      // values and avoiding JSON-escape artifacts for every SQL result column.
      const resultVectors = resultFields.map((_, fieldIndex) =>
        result.getChildAt(fieldIndex),
      );
      const rows = Array.from({ length: result.numRows }, (_, rowIndex) => {
        const value: Record<string, unknown> = {};

        resultFields.forEach((field, fieldIndex) => {
          const vector = resultVectors[fieldIndex];
          value[field.name] = vector ? vector.get(rowIndex) ?? null : null;
        });

        return value as ResultRow;
      });

      const resultFieldNames = resultFields.map((field) => field.name);

      const nextResult: WorkspaceResult = {

        resultRows: rows.slice(0, Math.max(1, Number(rowLimit) || 100)),

        resultColumns: resultFieldNames,

        resultMode: "table",

        resultView: "table",

        output: `${rows.length} row(s) returned.`,

        engineError: "",

        elapsedMs: elapsed,

      };

      saveWorkspaceResult(tabId, nextResult);

      if (activeTabIdRef.current === tabId) {

        setResultRows(nextResult.resultRows);

        setResultColumns(nextResult.resultColumns);

        setResultMode(nextResult.resultMode);

        setResultView(nextResult.resultView);

        setOutput(nextResult.output);

        setEngineError("");

        setElapsedMs(nextResult.elapsedMs);

      }

    } catch (error) {

      const message = errorMessage(error);

      const nextResult: WorkspaceResult = {

        ...(workspaceResults[tabId] ?? EMPTY_WORKSPACE_RESULT),

        engineError: message,

        elapsedMs: elapsed,

      };

      saveWorkspaceResult(tabId, nextResult);

      if (activeTabIdRef.current === tabId) {

        setEngineError(message);

        setElapsedMs(nextResult.elapsedMs);

      }

    } finally {

      setIsRunning(false);

    }

  };

  const ensurePythonRuntime = async (): Promise<PyodideInterface> => {
    if (pyodideRef.current) return pyodideRef.current;

    if (!pythonInitPromiseRef.current) {
      pythonInitPromiseRef.current = loadPyodideFromCdn();
    }

    try {
      const py = await pythonInitPromiseRef.current;
      pyodideRef.current = py;
      setPythonEngineError("");
      setPythonReady(true);
      return py;
    } catch (error) {
      pythonInitPromiseRef.current = null;
      const message = `Python initialization failed: ${errorMessage(error)}`;
      setPythonEngineError(message);
      throw new Error(message);
    }
  };

  const runPython = async () => {

    const tabId = activeTabIdRef.current;

    setIsRunning(true);
    setEngineError("");

    let py: PyodideInterface;
    try {
      py = await ensurePythonRuntime();
    } catch (error) {
      const message = errorMessage(error);
      setEngineError(message);
      saveWorkspaceResult(tabId, {
        ...(workspaceResults[tabId] ?? EMPTY_WORKSPACE_RESULT),
        engineError: message,
      });
      setIsRunning(false);
      return;
    }

    const tab = tabs.find((item) => item.id === tabId);

    const datasetId = tab?.datasetId ?? selectedId;

    const rows = datasetId ? datasetRegistry.getRows(datasetId) : [];

    const allData = Object.fromEntries(

      datasets.map((dataset) => [

        getDatasetTableName(dataset, datasets),

        datasetRegistry.getRows(dataset.id),

      ]),

    );

    setIsRunning(true);

    setEngineError("");

    const start = performance.now();

    let capturedOutput = "";

    try {

      py.setStdout({

        batched: (message: string) => {

          capturedOutput += `${message}\n`;

        },

      });

      py.setStderr({

        batched: (message: string) => {

          capturedOutput += `${message}\n`;

        },

      });

      py.globals.set("datasets_json", JSON.stringify(allData));

      py.globals.set("data_json", JSON.stringify(rows));

      await py.runPythonAsync(`

import json

datasets = json.loads(datasets_json)

data = json.loads(data_json)

rows = data

`);

      await py.runPythonAsync(pythonText[tabId] ?? DEFAULT_PYTHON);

      const nextResult: WorkspaceResult = {

        resultRows: [],

        resultColumns: [],

        resultMode: "output",

        resultView: "table",

        output:

          capturedOutput.trim() ||

          "Python completed successfully. Use print() to display output.",

        engineError: "",

        elapsedMs: Math.round(performance.now() - start),

      };

      saveWorkspaceResult(tabId, nextResult);

      if (activeTabIdRef.current === tabId) {

        setResultRows([]);

        setResultColumns([]);

        setResultMode(nextResult.resultMode);

        setResultView(nextResult.resultView);

        setOutput(nextResult.output);

        setEngineError("");

        setElapsedMs(nextResult.elapsedMs);

      }

    } catch (error) {

      const message = errorMessage(error);

      const nextResult: WorkspaceResult = {

        ...(workspaceResults[tabId] ?? EMPTY_WORKSPACE_RESULT),

        engineError: message,

        elapsedMs: Math.round(performance.now() - start),

      };

      saveWorkspaceResult(tabId, nextResult);

      if (activeTabIdRef.current === tabId) {

        setEngineError(message);

        setElapsedMs(nextResult.elapsedMs);

      }

    } finally {

      setIsRunning(false);

    }

  };

  const runActiveEditor = () => {

    if (isRunning) return;

    if (activeTab?.kind === "python") {

      void runPython();

    } else if (activeTab?.kind === "sql") {

      void runSql();

    }

  };

  return (

    <main className={styles.workspace}>

      <div className={styles.toolbar}>

        <div className={styles.toolbarBrand}>

          <strong>Dock</strong>

          <span className={styles.toolbarBrandDivider} />

          <span>Data Explorer</span>

        </div>

        {activeTab?.kind === "sql" && (
        <div className={`${styles.toolbarGroup} ${styles.sqlLimitGroup}`} title="Maximum rows returned by SQL queries">

          <span className={styles.toolbarLabel}>SQL rows</span>

          <select

            className={styles.limitSelect}

            value={rowLimit}

            onChange={(event) => setRowLimit(event.target.value)}

            aria-label="Maximum rows returned by SQL queries"
            title="SQL query result limit; Python output is not limited by this setting"

          >

            <option value="50">50</option>

            <option value="100">100</option>

            <option value="250">250</option>

            <option value="500">500</option>

            <option value="1000">1000</option>

          </select>

        </div>
        )}


        {(activeTab?.kind === "sql" || activeTab?.kind === "python") && (
          <div className={`${styles.toolbarGroup} ${styles.toolbarRunActions}`}>

          <button

            className={`${styles.toolbarButton} ${styles.runButton}`}

            onClick={runActiveEditor}

            disabled={isRunning || (activeTab?.kind === "sql" && !isEngineReady)}

            type="button"

            aria-busy={activeTab?.kind === "sql" && !isEngineReady}

            title={sqlEngineError || undefined}

          >

            Run

          </button>

          <div className={styles.newMenuWrap}>

            <button

              className={`${styles.toolbarButton} ${styles.newMenuTrigger}`}

              onClick={() => setShowNewMenu((open) => !open)}

              type="button"

              aria-haspopup="menu"

              aria-expanded={showNewMenu}

            >

              New

            </button>

            {showNewMenu && (

              <div className={styles.newMenu} role="menu" aria-label="Create new workspace item">

                <button

                  type="button"

                  role="menuitem"

                  onClick={() => { setShowNewMenu(false); createQuery(); }}

                >

                  <span>SQL query</span>

                </button>

                <button

                  type="button"

                  role="menuitem"

                  onClick={() => { setShowNewMenu(false); createNotebook(); }}

                >

                  <span>Python notebook</span>

                </button>


              </div>

            )}

          </div>

          </div>
        )}

        {activeTab?.kind === "dataset" && (
          <div className={styles.toolbarGroup}>
            <button
              className={styles.quietButton}
              onClick={refreshDataset}
              type="button"
              title="Refresh the current dataset preview"
            >
              Refresh preview
            </button>
            <button
              className={styles.toolbarButton}
              onClick={exportCleanedCsv}
              type="button"
              disabled={!tabDataset}
              title="Export the current dataset as a cleaned CSV file"
            >
              Export cleaned CSV
            </button>
            {tabDataset && getDatasetCleanState(tabDataset.id) && (
              <button
                className={styles.quietButton}
                onClick={() => restoreOriginalDataset(tabDataset.id)}
                type="button"
                title={`Restore original rows (${getDatasetCleanState(tabDataset.id)!.originalCount} to ${getDatasetCleanState(tabDataset.id)!.currentCount} rows)`}
              > Restore original
              </button>
            )}
          </div>
        )}


      </div>

      <div className={styles.body}>

        <aside className={styles.rail} aria-label="Tool rail — hover or focus an icon for its tooltip">

          <button

            className={`${styles.railButton} ${showExplorer ? styles.railActive : ""}`}

            onClick={() => setShowExplorer((value) => !value)}

            type="button"

            aria-label={showExplorer ? "Hide explorer panel" : "Show explorer panel"}

            title={showExplorer ? "Explorer panel — hide dataset browser" : "Explorer panel — show dataset browser"}

          >

            <PanelLeftClose size={16} aria-hidden="true" />

          </button>

          <button

            className={`${styles.railButton} ${activeTab?.kind === "quality" ? styles.railActive : ""}`}

            onClick={() =>

              openTab({

                id: `quality-${selectedId ?? "none"}`,

                kind: "quality",

                title: "Quality",

                datasetId: selectedId ?? undefined,

              })

            }

            type="button"

            aria-label="Data quality"

            title="Data quality — inspect missing values and duplicates"

          >

            <ShieldCheck size={16} aria-hidden="true" />

          </button>

          <button

            className={`${styles.railButton} ${activeTab?.kind === "pipeline" ? styles.railActive : ""}`}

            onClick={() =>

              openTab({

                id: `pipeline-${selectedId ?? "none"}`,

                kind: "pipeline",

                title: "Pipeline",

                datasetId: selectedId ?? undefined,

              })

            }

            type="button"

            aria-label="Transformation pipeline"

            title="Transformation pipeline — inspect cleaning steps"

          >

            <Workflow size={16} aria-hidden="true" />

          </button>

          <span className={styles.railSpacer} />

        </aside>

        {(

          <aside
            className={`${styles.explorer} ${
              !showExplorer ? styles.explorerCollapsed : ""
            } ${isExplorerDragActive && showExplorer ? styles.explorerDragActive : ""}`}
            aria-hidden={!showExplorer}
            ref={explorerRef}
            onDragOver={(event) => {
              if (!event.dataTransfer.types.includes("Files")) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setIsExplorerDragActive(true);
            }}
            onDragLeave={(event) => {
              const nextTarget = event.relatedTarget;
              if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
                return;
              }
              setIsExplorerDragActive(false);
            }}
            onDrop={(event) => {
              if (!event.dataTransfer.types.includes("Files")) return;
              event.preventDefault();
              setIsExplorerDragActive(false);

              // DatasetUpload already handles drops directly on its own dropzone.
              // Only handle drops elsewhere in the Explorer here to avoid importing twice.
              const target = event.target;
              if (target instanceof Element && target.closest(".dock-dropzone")) {
                return;
              }

              const droppedFiles = Array.from(event.dataTransfer.files);
              if (droppedFiles.length > 0) {
                void handleImport(droppedFiles);
              }
            }}
          >

            <div className={styles.panelHeading}>

              <span>EXPLORER</span>

              <span>{datasets.length} dataset{datasets.length === 1 ? "" : "s"}</span>

            </div>

            <label className={styles.searchWrap}>

              

              <input

                value={explorerSearch}

                onChange={(event) => setExplorerSearch(event.target.value)}

                placeholder="Search datasets..."

                aria-label="Filter datasets"

              />

            </label>

            <div className={styles.tree}>

              <button

                className={styles.treeHeading}

                onClick={() => toggleTree("datasets")}

                type="button"

                aria-expanded={expanded.datasets}

              >

                {expanded.datasets ? (

                  <ChevronDown size={13} aria-hidden="true" />

                ) : (

                  <ChevronRight size={13} aria-hidden="true" />

                )}

                <Folder size={13} aria-hidden="true" />

                <span className={styles.sectionLabel}>Datasets</span>

                <span className={styles.sectionCount}>{datasets.length}</span>

              </button>

              {expanded.datasets && (

                <div className={styles.treeChildren}>

                  {filteredDatasets.map((dataset) => (

                    <div key={dataset.id} className={styles.datasetNode}>

                      <button

                        className={`${styles.treeItem} ${

                          selectedId === dataset.id ? styles.treeSelected : ""

                        }`}

                        onClick={() => openDataset(dataset)}

                        type="button"

                        title={datasetDisplayNames.get(dataset.id) ?? dataset.name}

                      >

                        <span>{datasetDisplayNames.get(dataset.id) ?? dataset.name}</span>

                        <span
                          className={styles.rowCount}
                          title={`${(datasetRegistry.getRows(dataset.id) ?? []).length.toLocaleString()} rows`}
                        >
                          {(datasetRegistry.getRows(dataset.id) ?? []).length.toLocaleString()} rows
                        </span>
                        {getDatasetCleanState(dataset.id) && (
                          <span
                            className={styles.cleanedDot}
                            title={`${getDatasetCleanState(dataset.id)!.originalCount.toLocaleString()} to ${getDatasetCleanState(dataset.id)!.currentCount.toLocaleString()} rows`}
                            aria-label="Cleaned dataset"
                          >Cleaned</span>
                        )}

                      </button>

                      <button
                        className={styles.renameDatasetButton}
                        type="button"
                        title={`Rename ${datasetDisplayNames.get(dataset.id) ?? dataset.name}`}
                        aria-label={`Rename dataset ${datasetDisplayNames.get(dataset.id) ?? dataset.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          renameDataset(dataset);
                        }}
                      >
                        <Pencil size={12} aria-hidden="true" />
                      </button>

                      <button
                        className={styles.removeDatasetButton}
                        type="button"
                        title={`Remove ${datasetDisplayNames.get(dataset.id) ?? dataset.name} from Explorer`}
                        aria-label={`Remove dataset ${datasetDisplayNames.get(dataset.id) ?? dataset.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          const displayName = datasetDisplayNames.get(dataset.id) ?? dataset.name;
                          if (!window.confirm(`Remove dataset \"${displayName}\" from Dock Data Explorer? This cannot be undone unless you import the file again.`)) return;
                          removeDataset(dataset.id);
                          setDatasetNameOverrides((current) => {
                            if (!(dataset.id in current)) return current;
                            const next = { ...current };
                            delete next[dataset.id];
                            return next;
                          });
                          setOriginalRowsById((current) => {
                            const next = { ...current };
                            delete next[dataset.id];
                            try { window.localStorage.setItem("dock-data-explorer-original-rows-v1", JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
                            return next;
                          });
                          setTabs((current) => {
                            const next = current.filter((tab) => tab.datasetId !== dataset.id);
                            if (next.length === 0) next.push({ id: "sql-main", kind: "sql", title: "Query 1" });
                            if (!next.some((tab) => tab.id === activeTabIdRef.current)) {
                              setActiveTabId(next[0].id);
                              activeTabIdRef.current = next[0].id;
                            }
                            return next;
                          });
                          if (selectedId === dataset.id) setSelectedId(null);
                          setPreviewVersion((version) => version + 1);
                        }}
                      >
                        <X size={12} aria-hidden="true" />
                      </button>

                      {selectedId === dataset.id && (

                        <div className={styles.columnsTree}>

                          {dataset.columns.slice(0, 30).map((column) => (

                            <div className={styles.columnNode} key={column.name} title={`${column.name} · ${column.type || "empty"}`}>
                              <span className={styles.columnName}>{column.name}</span>
                              {(() => {
                                const rawType = String(column.type ?? "").trim();
                                const normalizedType = rawType.toLowerCase();
                                const isEmpty = !normalizedType || normalizedType === "null" || normalizedType === "undefined";
                                const isDate = /date|time/.test(normalizedType);
                                const isBoolean = /bool/.test(normalizedType);
                                const isNumeric = /int|float|double|decimal|numeric|number|real/.test(normalizedType);
                                const glyph = isEmpty ? "empty" : isDate ? "date" : isBoolean ? "bool" : isNumeric ? "123" : "Abc";
                                const label = isEmpty ? "empty" : rawType;
                                return (
                                  <span className={styles.typeLabel} title={label} aria-label={`Column type: ${label}`}>
                                    {isDate ? <CalendarDays size={12} strokeWidth={1.7} aria-hidden="true" /> : isBoolean ? <Check size={12} strokeWidth={1.8} aria-hidden="true" /> : glyph}
                                  </span>
                                );
                              })()}
                            </div>

                          ))}

                        </div>

                      )}

                    </div>

                  ))}

                  {filteredDatasets.length === 0 && (

                    <div className={styles.treeEmpty}>

                      {datasets.length ? (
                        "No matching datasets."
                      ) : (
                        <button
                          className={styles.emptyUploadAction}
                          type="button"
                          onClick={() => {
                            uploadDockRef.current
                              ?.querySelector<HTMLButtonElement>(".dock-action-secondary")
                              ?.click();
                          }}
                          disabled={isImporting}
                        >
                          Upload a CSV to get started
                        </button>
                      )}

                    </div>

                  )}

                </div>

              )}

              <div className={styles.treeSection}>

                <button

                  className={styles.treeHeading}

                  onClick={() => toggleTree("workspace")}

                  type="button"

                  aria-expanded={expanded.workspace}

                >

                  {expanded.workspace ? (

                    <ChevronDown size={13} aria-hidden="true" />

                  ) : (

                    <ChevronRight size={13} aria-hidden="true" />

                  )}

                  <span className={styles.sectionLabel}>Workspace</span>

                </button>

                {expanded.workspace && (

                  <div className={styles.workspaceItems}>

                    <button

                      className={styles.treeItem}

                      onClick={() =>

                        openTab({

                          id: `pipeline-${selectedId ?? "none"}`,

                          kind: "pipeline",

                          title: "Pipeline",

                          datasetId: selectedId ?? undefined,

                        })

                      }

                      type="button"

                    >

                      <span>Pipeline</span>

                    </button>

                    <button

                      className={styles.treeItem}

                      onClick={() =>

                        openTab({

                          id: `quality-${selectedId ?? "none"}`,

                          kind: "quality",

                          title: "Quality",

                          datasetId: selectedId ?? undefined,

                        })

                      }

                      type="button"

                    >

                      <span>Quality</span>

                    </button>

                    <button

                      className={styles.treeItem}

                      onClick={createNotebook}

                      type="button"

                    >

                      <span>Notebooks</span>

                    </button>

                    <button

                      className={styles.treeItem}

                      onClick={createQuery}

                      type="button"

                    >

                      <span>Saved queries</span>

                    </button>

                  </div>

                )}

              </div>

            </div>

            <div

              className={`${styles.uploadDock} ${

                isUploadCompact ? styles.uploadDockCompact : ""

              }`}

              ref={uploadDockRef}

            >

              <div className={styles.fullUpload}>

  <DatasetUpload

    onImport={handleImport}

    isImporting={isImporting}

    error={importError}

    onClearError={clearError}

  />

</div>

              <button

                className={styles.compactUpload}

                type="button"

                onClick={() => {

                  uploadDockRef.current

                    ?.querySelector<HTMLButtonElement>(".dock-action-secondary")

                    ?.click();

                }}

                disabled={isImporting}

              >

                <span>Upload</span>

              </button>

            </div>

            {importError && (

              <div className={styles.inlineError}>

                <span>{importError}</span>

                <button onClick={clearError} type="button">

                  Dismiss

                </button>

              </div>

            )}

          </aside>

        )}

        <section className={styles.mainPane}>

          <div className={styles.tabBar}>
            <button className={styles.tabScrollButton} type="button" aria-label="Scroll tabs left" title="Scroll tabs left" onClick={() => tabsContainerRef.current?.scrollBy({ left: -220, behavior: "smooth" })}>
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
            <div ref={tabsContainerRef} className={styles.tabs} role="tablist" aria-label="Workspace tabs" onWheel={(event) => {
              if (tabsContainerRef.current && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                tabsContainerRef.current.scrollLeft += event.deltaY;
              }
            }}>

            {tabs.map((tab) => {

              const active = activeTabId === tab.id;

              return (

                <div

                  key={tab.id}
                  ref={(element) => { tabElementRefs.current[tab.id] = element; }}
                  data-tab-id={tab.id}
                  title={tab.kind === "dataset" && tab.datasetId ? (datasetDisplayNames.get(tab.datasetId) ?? tab.title) : tab.title}
                  role="tab"

                  aria-selected={active}

                  tabIndex={active ? 0 : -1}

                  className={`${styles.tab} ${active ? styles.activeTab : ""}`}

                  onClick={() => activateWorkspace(tab.id)}

                  onKeyDown={(event) => {

                    if (event.key === "Enter" || event.key === " ") {

                      event.preventDefault();

                      activateWorkspace(tab.id);

                    }

                  }}

                >

                  {(tab.kind === "sql" || tab.kind === "python" || tab.kind === "quality") && (
                    <span className={`${styles.tabTypeIcon} ${tab.kind === "python" ? styles.pythonTabIcon : styles.sqlTabIcon}`} aria-hidden="true">
                      {tab.kind === "quality" ? (
                        <ShieldCheck size={14} strokeWidth={1.8} />
                      ) : tab.kind === "sql" ? (
                        <svg viewBox="0 0 20 16" width="16" height="13" focusable="false">
                          <path d="M2 3.2C2 1.98 5.58 1 10 1s8 0.98 8 2.2v9.6c0 1.22-3.58 2.2-8 2.2s-8-.98-8-2.2V3.2Z" fill="none" stroke="currentColor" strokeWidth="1.35" />
                          <path d="M2 3.2c0 1.22 3.58 2.2 8 2.2s8-.98 8-2.2" fill="none" stroke="currentColor" strokeWidth="1.15" />
                          <text x="10" y="10.2" textAnchor="middle" fontSize="5.1" fontWeight="700" fill="currentColor">SQL</text>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="15" height="15" focusable="false">
                          <path d="M12 2.5c-5.2 0-5.8.5-5.8 3.5v2.2h6.1v1.2H4.8c-2.7 0-3.3 1.8-3.3 4.8s.7 4.5 3.3 4.5h1.9v-2.6c0-2.1 1.2-3.5 3.5-3.5h5.5c1.8 0 3.2-1.4 3.2-3.2V6c0-2.1-1.8-3.5-4-3.5H12Z" fill="#3776AB" />
                          <path d="M12 21.5c5.2 0 5.8-.5 5.8-3.5v-2.2h-6.1v-1.2h7.5c2.7 0 3.3-1.8 3.3-4.8s-.7-4.5-3.3-4.5h-1.9v2.6c0 2.1-1.2 3.5-3.5 3.5H8.3c-1.8 0-3.2 1.4-3.2 3.2V18c0 2.1 1.8 3.5 4 3.5H12Z" fill="#FFD43B" />
                          <circle cx="9.1" cy="5.1" r=".9" fill="#fff" />
                          <circle cx="14.9" cy="18.9" r=".9" fill="#fff" />
                        </svg>
                      )}
                    </span>
                  )}
                  <span className={styles.tabTitle}>{tab.kind === "dataset" && tab.datasetId ? (datasetDisplayNames.get(tab.datasetId) ?? tab.title) : tab.title}</span>
                  {tab.kind === "dataset" && tab.datasetId && getDatasetCleanState(tab.datasetId) && (
                    <span
                      className={styles.cleanedMarker}
                      title={`${getDatasetCleanState(tab.datasetId)!.originalCount.toLocaleString()} to ${getDatasetCleanState(tab.datasetId)!.currentCount.toLocaleString()} rows`}
                      aria-label={`Cleaned dataset: ${getDatasetCleanState(tab.datasetId)!.originalCount} to ${getDatasetCleanState(tab.datasetId)!.currentCount} rows`}
                    >Cleaned</span>
                  )}

                  <button

                    className={styles.tabClose}

                    title={`Close ${tab.title}`}

                    aria-label={`Close ${tab.title}`}

                    onClick={(event) => {

                      event.stopPropagation();

                      closeTab(tab.id);

                    }}

                    type="button"

                  >

                    <X size={13} aria-hidden="true" />

                  </button>

                </div>

              );

            })}

            </div>
            <button className={styles.tabScrollButton} type="button" aria-label="Scroll tabs right" title="Scroll tabs right" onClick={() => tabsContainerRef.current?.scrollBy({ left: 220, behavior: "smooth" })}>
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.workspaceContent}>

            {(activeTab?.kind === "sql" || activeTab?.kind === "python") && (

              <>

                <div className={styles.editorHeader}>

                  <div className={styles.editorTitle}>

                    <strong>

                      {activeTab.kind === "python" ? "Python editor" : "SQL editor"}

                    </strong>

                    <span className={styles.editorHint}>
                      {tabDataset
                        ? `Dataset: ${datasetDisplayNames.get(tabDataset.id) ?? tabDataset.name}`
                        : "Select a dataset to run this query"}
                    </span>

                  </div>

                  <div className={styles.editorTools}>

                    <span>{lineCount} lines</span>

                    <span>{activeTab.kind === "python" ? "Python" : "SQL"}</span>

                  </div>

                </div>

                <div className={styles.editorArea}>

                  <div className={styles.lineNumbers} aria-hidden="true">

                    {Array.from({ length: lineCount }, (_, index) => (

                      <span key={index}>{index + 1}</span>

                    ))}

                  </div>

                  <textarea

                    className={styles.codeEditor}

                    value={editorValue}

                    onChange={(event) => onEditorChange(event.target.value)}

                    spellCheck={false}

                    autoCapitalize="off"

                    autoComplete="off"

                    autoCorrect="off"

                    aria-label={`${activeTab.kind} code editor`}

                    onKeyDown={(event) => {

                      // Shift+Enter runs the active SQL query or Python script.
                      // Ctrl/Cmd+Enter remains supported as an additional shortcut.
                      if (event.key === "Enter" && (event.shiftKey || event.ctrlKey || event.metaKey)) {

                        event.preventDefault();

                        runActiveEditor();

                      }

                    }}

                  />

                </div>

              </>

            )}

            {activeTab?.kind === "dataset" && (

              <div className={styles.panelContent}>

                <div className={styles.sectionTitle}>
                  <div><h2>{tabDataset ? (datasetDisplayNames.get(tabDataset.id) ?? tabDataset.name) : "Dataset"}</h2></div>
                </div>
                <div className={styles.datasetSubtabs} role="tablist" aria-label="Dataset views">
                  <button type="button" role="tab" aria-selected={datasetViewTab === "preview"} className={datasetViewTab === "preview" ? styles.datasetSubtabActive : styles.datasetSubtab} onClick={() => setDatasetViewTab("preview")}>Preview</button>
                  <button type="button" role="tab" aria-selected={datasetViewTab === "schema"} className={datasetViewTab === "schema" ? styles.datasetSubtabActive : styles.datasetSubtab} onClick={() => setDatasetViewTab("schema")}>Schema</button>
                  <button type="button" role="tab" aria-selected={datasetViewTab === "quality"} className={datasetViewTab === "quality" ? styles.datasetSubtabActive : styles.datasetSubtab} onClick={() => setDatasetViewTab("quality")}>Quality</button>
                  <button type="button" role="tab" aria-selected={datasetViewTab === "smart-clean"} className={datasetViewTab === "smart-clean" ? styles.datasetSubtabActive : styles.datasetSubtab} onClick={() => setDatasetViewTab("smart-clean")}>Smart cleaning</button>
                </div>
                {datasetViewTab === "preview" && (
                  <DatasetPreview
                    key={`${tabDataset?.id ?? "no-dataset"}-${previewVersion}`}
                    preview={tabPreview}
                    rows={tabDataset?.id ? datasetRegistry.getRows(tabDataset.id) ?? [] : []}
                    isLoading={false}
                  />
                )}
                {datasetViewTab === "schema" && (
                  <SchemaPanel
                    key={`${tabDataset?.id ?? "no-dataset"}-${previewVersion}`}
                    dataset={tabDataset}
                  />
                )}
                {datasetViewTab === "quality" && (
                  <DataQualityPanel
                    key={`${tabDataset?.id ?? "no-dataset"}-${previewVersion}`}
                    dataset={tabDataset}
                    onNavigateToTool={openTool}
                  />
                )}
                {datasetViewTab === "smart-clean" && tabDataset && (
                  <SmartCleaningWorkbench
                    datasetId={tabDataset.id}
                    columns={tabDataset.columns.map((column) =>
                      typeof column === "string" ? column : column.name
                    )}
                    rows={datasetRegistry.getRows(tabDataset.id) ?? []}
                    onRowsChange={(nextRows) =>
                      handleDatasetRowsChanged(tabDataset.id, nextRows)
                    }
                  />
                )}

              </div>

            )}

            {activeTab?.kind === "quality" && (

              <div className={styles.panelContent}>

                <div className={styles.sectionTitle}>

                  <div>

                    <h2>Data quality</h2>

                    <p>Inspect quality issues in the selected dataset.</p>

                  </div>

                </div>

                <DataQualityPanel
                  key={`${tabDataset?.id ?? "no-dataset"}-${previewVersion}`}
                  dataset={tabDataset}
                  onNavigateToTool={openTool}
                />

              </div>

            )}

            {activeTab?.kind === "clean" && (

              <div className={styles.panelContent}>

                {activeTab.tool === "missing-values" ? (

                  <MissingValuesPanel dataset={tabDataset} onDatasetChanged={refreshDataset} />

                ) : (

                  <DuplicateRowsPanel dataset={tabDataset} onDatasetChanged={refreshDataset} />

                )}

              </div>

            )}

            {activeTab?.kind === "pipeline" && (

              <div className={styles.panelContent}>

                <TransformationPipelinePanel dataset={tabDataset} onDatasetChanged={refreshDataset} />

              </div>

            )}

            {activeTab?.kind === "schema" && (

              <div className={styles.panelContent}>

                <SchemaPanel
                  key={`${tabDataset?.id ?? "no-dataset"}-${previewVersion}`}
                  dataset={tabDataset}
                />

              </div>

            )}

            {activeTab?.kind !== "sql" &&

              activeTab?.kind !== "python" &&

              activeTab?.kind !== "dataset" &&

              activeTab?.kind !== "quality" &&

              activeTab?.kind !== "clean" &&

              activeTab?.kind !== "pipeline" &&

              activeTab?.kind !== "schema" && (

                <div className={styles.emptyResults}>

                  <strong>Select a workspace</strong>

                  <span>Open a dataset, SQL query, or Python notebook to begin.</span>

                </div>

              )}

            {(activeTab?.kind === "sql" || activeTab?.kind === "python") && (

            <section
              ref={resultsPanelRef}
              className={styles.results}
              style={{ flexBasis: `${resultsHeight}%` }}
            >
              <div
                className={styles.resultsResizeHandle}
                onPointerDown={startResultsResize}
                role="separator"
                aria-label="Resize results panel"
                aria-orientation="horizontal"
                aria-valuemin={12}
                aria-valuemax={88}
                aria-valuenow={Math.round(resultsHeight)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setResultsHeight((height) => Math.min(88, height + 3));
                  } else if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setResultsHeight((height) => Math.max(12, height - 3));
                  }
                }}
                title="Drag to resize results panel; use arrow keys when focused"
              >
                <span />
              </div>

              <div className={styles.resultsHeader}>

                <div className={styles.resultTabs}>

                  <button

                    className={resultMode === "table" && resultView !== "chart" ? styles.resultTabActive : styles.resultTab}

                    onClick={() => { setResultMode("table"); setResultView("table"); }}

                    type="button"

                  >

                    Results

                  </button>

                  <button

                    className={resultMode === "output" ? styles.resultTabActive : styles.resultTab}

                    onClick={() => setResultMode("output")}

                    type="button"

                  >

                    Output

                  </button>

                  <button

                    className={resultMode !== "output" && resultView === "chart" ? styles.resultTabActive : styles.resultTab}

                    onClick={() => { setResultMode("table"); setResultView("chart"); }}

                    type="button"

                  >

                    Chart

                  </button>

                </div>

                <div className={styles.resultActions}>

                  {resultMode === "table" && resultView !== "chart" && (
                    <span className={styles.resultSummary}>
                      {resultRows.length.toLocaleString()} rows
                      {elapsedMs !== null ? ` \u00b7 ${elapsedMs.toLocaleString()} ms` : " \u00b7 Not run"}
                    </span>
                  )}
                  {resultMode === "output" && elapsedMs !== null && (
                    <span className={styles.resultSummary}>{elapsedMs.toLocaleString()} ms</span>
                  )}
                  {resultMode === "table" && resultView === "chart" && (
                    <span className={styles.resultSummary}>
                      {resultRows.length.toLocaleString()} rows
                      {elapsedMs !== null ? ` \u00b7 ${elapsedMs.toLocaleString()} ms` : " \u00b7 Not run"}
                    </span>
                  )}

                  <button

                    className={styles.resultViewButton}

                    onClick={() => {

                      setResultRows([]);

                      setResultColumns([]);

                      setOutput("");

                      setEngineError("");

                      setElapsedMs(null);

                      saveWorkspaceResult(activeTabId, {

                        ...EMPTY_WORKSPACE_RESULT,

                      });

                    }}

                    type="button"

                  >

                    Clear

                  </button>

                </div>

              </div>

              {engineError && (

                <div className={styles.errorOutput}>

                  <pre>{engineError}</pre>

                  <button onClick={() => setEngineError("")} type="button" aria-label="Dismiss error">

                    <X size={14} aria-hidden="true" />

                  </button>

                </div>

              )}

              <pre className={styles.consoleOutput} hidden={resultMode !== "output"}>
                {output || "No output yet. Run your code to see output here."}
              </pre>

                <div className={styles.chartPanel} hidden={resultMode === "output" || resultView !== "chart"}>
                  <div className={styles.chartControls}>
                    <label>Category
                      <select value={chartColumn} onChange={(event) => setChartColumn(event.target.value)}>
                        <option value="">Select a column</option>
                        {columns.map((column) => <option key={column} value={column}>{column}</option>)}
                      </select>
                    </label>
                    <label>Value
                      <select value={chartValueColumn} onChange={(event) => {
                        const value = event.target.value;
                        setChartValueColumn(value);
                        setChartAggregation(value ? "average" : "count");
                      }}>
                        <option value="">Count rows (no numeric value)</option>
                        {numericColumns.map((column) => <option key={column} value={column}>{column}</option>)}
                      </select>
                    </label>
                    <label>Aggregation
                      <select value={chartAggregation} onChange={(event) => setChartAggregation(event.target.value as typeof chartAggregation)}>
                        <option value="sum" disabled={!chartValueColumn}>Sum</option><option value="average" disabled={!chartValueColumn}>Average</option>
                        <option value="count">Count</option><option value="min" disabled={!chartValueColumn}>Min</option>
                        <option value="max" disabled={!chartValueColumn}>Max</option><option value="median" disabled={!chartValueColumn}>Median</option>
                      </select>
                    </label>
                    <label>Chart type
                      <select value={chartType} onChange={(event) => setChartType(event.target.value as typeof chartType)}>
                        <option value="bar">Horizontal bars</option><option value="column">Vertical bars</option>
                        <option value="line">Line</option><option value="pie">Pie</option>
                      </select>
                    </label>
                    <label>Sort
                      <select value={chartSort} onChange={(event) => setChartSort(event.target.value as typeof chartSort)}>
                        <option value="value-desc">Value: high to low</option><option value="value-asc">Value: low to high</option>
                        <option value="label-asc">Label: A to Z</option><option value="label-desc">Label: Z to A</option>
                      </select>
                    </label>
                    <label>Top N
                      <select value={chartTopN} onChange={(event) => setChartTopN(event.target.value)}>
                        <option value="5">5 + Other</option><option value="10">10 + Other</option>
                        <option value="20">20 + Other</option><option value="30">30 + Other</option><option value="100">All (up to 100)</option>
                      </select>
                    </label>
                    <button className={styles.chartExportButton} type="button" onClick={exportChartPng} disabled={!chartData.length}>Export PNG</button>
                  </div>
                  {chartColumn && chartData.length ? (
                    chartType === "pie" ? (
                      <div className={styles.pieLayout}>
                        <div className={styles.pieChart} style={{ background: `conic-gradient(${chartData.map((item, index) => {
                          const total = chartData.reduce((sum, entry) => sum + Math.max(0, entry.value), 0) || 1;
                          const start = chartData.slice(0, index).reduce((sum, entry) => sum + Math.max(0, entry.value), 0) / total * 100;
                          const end = start + Math.max(0, item.value) / total * 100;
                          const colors = ["#29b77a", "#4da3ff", "#d6a85f", "#b78cff", "#e879a9", "#61c4c7", "#f08060", "#a3c96b"];
                          return `${colors[index % colors.length]} ${start}% ${end}%`;
                        }).join(", ")})` }} />
                        <div className={styles.pieLegend}>
                          {chartData.map((item, index) => <div className={styles.pieLegendItem} key={`${item.label}-${index}`} title={`${chartColumn}: ${item.label} \u00b7 ${chartAggregation}: ${formatChartValue(item.value, chartAggregation)}`}>
                            <i style={{ background: ["#29b77a", "#4da3ff", "#d6a85f", "#b78cff", "#e879a9", "#61c4c7", "#f08060", "#a3c96b"][index % 8] }} />
                            <span title={item.label}>{item.label}</span><b>{formatChartValue(item.value, chartAggregation)}</b>
                          </div>)}
                        </div>
                      </div>
                    ) : chartType === "column" ? (
                      <div className={styles.chartPlot} role="img" aria-label={`${chartAggregation} ${chartValueColumn || "rows"} by ${chartColumn}`}>
                        <div className={styles.chartYAxisTitle}>{chartAggregation === "average" ? "Average" : chartAggregation[0].toUpperCase() + chartAggregation.slice(1)} {chartValueColumn || "rows"}</div>
                        <div className={styles.chartYAxisTicks} aria-hidden="true">
                          {[5, 4, 3, 2, 1, 0].map((tick) => <span key={tick}>{formatChartValue(Math.max(1, ...chartData.map((item) => item.value)) * tick / 5, chartAggregation)}</span>)}
                        </div>
                        <div className={styles.chartPlotMain}>
                          <div className={styles.chartGrid} aria-hidden="true">{[0,1,2,3,4,5].map((tick) => <i key={tick} />)}</div>
                          <div className={styles.columnChart}>
                            {chartData.map((item, index) => {
                              const max = Math.max(1, ...chartData.map((entry) => entry.value));
                              const height = Math.max(item.value > 0 ? 1 : 0, item.value / max * 100);
                              return <div className={styles.columnChartItem} key={`${item.label}-${index}`} title={`${chartColumn}: ${item.label}
${chartAggregation} ${chartValueColumn || "rows"}: ${formatChartValue(item.value, chartAggregation)}
Rows: ${item.count}`}>
                                <b>{formatChartValue(item.value, chartAggregation)}</b><div className={styles.columnChartTrack}><i style={{ height: `${height}%` }} /></div>
                                <span title={item.label}>{item.label}</span>
                              </div>;
                            })}
                          </div>
                        </div>
                        <div className={styles.chartXAxisTitle}>{chartColumn}</div>
                      </div>
                    ) : chartType === "line" ? (
                      <div className={styles.lineChartWrap}>
                        <svg className={styles.lineChart} viewBox="0 0 800 260" role="img" aria-label={`Line chart of ${chartValueColumn || "row count"} by ${chartColumn}`} preserveAspectRatio="none">
                          {[0, 1, 2, 3, 4, 5].map((tick) => <g key={tick}><line x1="58" x2="785" y1={20 + tick * 40} y2={20 + tick * 40} className={styles.chartGridLine} /><text x="50" y={24 + tick * 40} textAnchor="end" className={styles.chartAxisText}>{formatChartValue(Math.max(1, ...chartData.map((entry) => entry.value)) * (5-tick) / 5, chartAggregation)}</text></g>)}
                          <polyline className={styles.chartLine} points={chartData.map((item, index) => {
                            const max = Math.max(1, ...chartData.map((entry) => entry.value));
                            const x = chartData.length <= 1 ? 420 : 62 + index * (720 / (chartData.length - 1));
                            return `${x},${220 - item.value / max * 190}`;
                          }).join(" ")} />
                          {chartData.map((item, index) => {
                            const max = Math.max(1, ...chartData.map((entry) => entry.value));
                            const x = chartData.length <= 1 ? 420 : 62 + index * (720 / (chartData.length - 1));
                            return <circle key={`${item.label}-${index}`} cx={x} cy={220 - item.value / max * 190} r="4" className={styles.chartPoint}><title>{`${chartColumn}: ${item.label}; ${chartAggregation}: ${formatChartValue(item.value, chartAggregation)}`}</title></circle>;
                          })}
                        </svg>
                        <div className={styles.lineLabels}>{chartData.map((item, index) => <span key={`${item.label}-${index}`} title={item.label}>{item.label}</span>)}</div>
                        <div className={styles.chartXAxisTitle}>{chartColumn}</div>
                      </div>
                    ) : (
                      <div className={styles.chartBars}>
                        {chartData.map((item, index) => {
                          const max = Math.max(1, ...chartData.map((entry) => Math.abs(entry.value)));
                          const width = Math.max(0, Math.abs(item.value) / max * 100);
                          return <div className={styles.chartBarRow} key={`${item.label}-${index}`} title={`${chartColumn}: ${item.label}; ${chartAggregation} ${chartValueColumn || "rows"}: ${formatChartValue(item.value, chartAggregation)}; Rows: ${item.count}`}>
                            <span title={item.label}>{item.label}</span><div><i style={{ width: `${width}%` }} /></div><b>{formatChartValue(item.value, chartAggregation)}</b>
                          </div>;
                        })}
                      </div>
                    )
                  ) : <div className={styles.chartEmpty}>Run a query with rows, then choose a category to build a chart.</div>}
                </div>

                <div className={styles.tableViewport} hidden={resultMode === "output" || resultView === "chart"}>

                  <table className={styles.resultTable}>

                    <thead>

                      <tr>

                        {columns.map((column) => (

                          <th key={column}>{column}</th>

                        ))}

                      </tr>

                    </thead>

                    <tbody>

                      {resultRows.map((row, index) => (

                        <tr key={index}>

                          {columns.map((column) => (

                            <td key={column} title={displayValue(row[column])}>

                              {displayValue(row[column])}

                            </td>

                          ))}

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

                <div className={styles.emptyResults} hidden={resultMode === "output" || resultView === "chart" || resultRows.length > 0}>

                  <strong>No results yet</strong>

                  <span>Run a SQL query or Python notebook to display results.</span>

                </div>

            </section>

            )}

          </div>

        </section>

      </div>

      <footer className={styles.statusbar}>
        <div className={styles.statusLeft}>
          <span className={styles.statusDot} />
          <span>{isRunning ? "Executing" : "Ready"}</span>
          <div className={styles.statusEngineGroup} aria-label="Execution engine status">
            <div className={`${styles.engineStatus} ${sqlEngineError ? styles.error : isEngineReady ? styles.ready : ""}`} title={sqlEngineError || (isEngineReady ? "SQL engine ready" : "SQL engine is loading")}>
              <span />
              <span className={styles.engineStatusLabel}>SQL {sqlEngineError ? "error" : isEngineReady ? "ready" : "loading"}</span>
            </div>
            <span className={styles.statusEngineSeparator}>&middot;</span>
            <div className={`${styles.engineStatus} ${pythonEngineError ? styles.error : pythonReady ? styles.ready : ""}`} title={pythonEngineError || (pythonReady ? "Python engine ready" : "Python loads when you first run a notebook")}>
              <span />
              <span className={styles.engineStatusLabel}>Python {pythonEngineError ? "error" : pythonReady ? "ready" : "on demand"}</span>
            </div>
          </div>
        </div>
        <div className={styles.statusRight}>
          <span>Dataset {allRows.length.toLocaleString()} &times; {(selectedDataset?.columns.length ?? 0).toLocaleString()}</span>
          <span>Result {resultRows.length.toLocaleString()} rows</span>
        </div>
      </footer>

    </main>

  );

}


