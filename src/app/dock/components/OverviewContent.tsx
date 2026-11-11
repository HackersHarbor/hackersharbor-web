"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  FileCode2,
  FileSpreadsheet,
  HardDrive,
  Search,
  Upload,
  X,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useDatasets } from "../hooks/useDatasets";
import { useDatasetImport } from "../hooks/useDatasetImport";
import { datasetRegistry } from "../services/datasets/DatasetRegistry";
import type { StudioSection } from "../types/navigation";
import styles from "./overview.module.css";
type OverviewContentProps = {
  onNavigate: (section: StudioSection) => void;
};
type DatasetLike = {
  id: string;
  name: string;
  fileName?: string;
  importedAt?: number | string;
  columns?: unknown[];
};
type RecentDataset = {
  dataset: DatasetLike;
  displayName: string;
  rows: Record<string, unknown>[];
  originalRowCount: number;
  columns: number;
  rowCount: number;
  openedAt: number;
  quality: number;
};
const SAMPLE_CSV = `order_id,region,category,units,revenue
1001,North,Hardware,4,480
1002,South,Software,2,720
1003,West,Hardware,7,840
1004,East,Services,3,510
1005,North,Software,5,1800
1006,South,Services,2,340
1007,West,Hardware,6,720
1008,East,Software,4,1440
1009,North,Services,8,1360
1010,South,Hardware,3,360
1011,West,Software,6,2160
1012,East,Services,5,850`;
const LAST_OPENED_KEY = "dock.overview.lastOpened.v1";
const OPENED_MAP_KEY = "dock.overview.openedMap.v1";
function readOpenedMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(OPENED_MAP_KEY);
    const value = raw ? JSON.parse(raw) : {};
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}
function toTimestamp(value?: number | string): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatRelativeTime(timestamp?: number | string) {
  const timestampMs =
    typeof timestamp === "number"
      ? timestamp
      : typeof timestamp === "string"
        ? Date.parse(timestamp)
        : Number.NaN;
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) return "Not opened yet";
  const minutes = Math.max(0, Math.floor((Date.now() - timestampMs) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const date = new Date(timestampMs);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  if (hours < 24 * 7) return `${Math.floor(hours / 24)} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function getOriginalRowCount(id: string, fallback: number): number {
  try {
    const rows = datasetRegistry.getOriginalRows(id);
    return Array.isArray(rows) ? rows.length : fallback;
  } catch {
    return fallback;
  }
}
function getDatasetRows(id: string): Record<string, unknown>[] {
  try {
    const rows = datasetRegistry.getRows(id);
    return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}
function assessQuality(rows: Record<string, unknown>[], columns: number): number {
  if (!rows.length || !columns) return 0;
  let missing = 0;
  let cells = 0;
  const signatures = new Set<string>();
  let duplicateRows = 0;
  for (const row of rows) {
    const values = Object.values(row);
    cells += columns;
    for (let i = 0; i < columns; i += 1) {
      const value = values[i];
      if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
        missing += 1;
      }
    }
    const signature = JSON.stringify(values);
    if (signatures.has(signature)) duplicateRows += 1;
    else signatures.add(signature);
  }
  const missingRate = cells ? missing / cells : 0;
  const duplicateRate = rows.length ? duplicateRows / rows.length : 0;
  return Math.max(0, Math.min(100, Math.round(100 - missingRate * 65 - duplicateRate * 35)));
}
export default function OverviewContent({ onNavigate }: OverviewContentProps) {
  const { datasets, removeDataset } = useDatasets();
  const { importFiles, isImporting, error, clearError } = useDatasetImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sampleError, setSampleError] = useState("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [storage, setStorage] = useState<{ usage?: number; quota?: number } | null>(null);
  const [openedMap, setOpenedMap] = useState<Record<string, number>>({});
  const [lastOpenedId, setLastOpenedId] = useState("");
  const [now, setNow] = useState(Date.now());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    try {
      setOpenedMap(readOpenedMap());
      setLastOpenedId(localStorage.getItem(LAST_OPENED_KEY) ?? "");
    } catch {
      // Local storage may be disabled in private browsing.
    }
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      void navigator.storage.estimate()
        .then((estimate) => setStorage({ usage: estimate.usage, quota: estimate.quota }))
        .catch(() => setStorage(null));
    }
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);
  const recentDatasets = useMemo<RecentDataset[]>(() => {
    const mapped = (datasets as DatasetLike[])
      .map((dataset) => {
        const rows = getDatasetRows(dataset.id);
        const columns = Array.isArray(dataset.columns) && dataset.columns.length
          ? dataset.columns.length
          : rows.length ? Object.keys(rows[0] ?? {}).length : 0;
        return {
          dataset,
          displayName: dataset.name,
          rows,
          originalRowCount: getOriginalRowCount(dataset.id, rows.length),
          columns,
          rowCount: rows.length,
          openedAt: openedMap[dataset.id] ?? 0,
          quality: assessQuality(rows, columns),
        };
      })
      .sort((a, b) => b.openedAt - a.openedAt || (toTimestamp(b.dataset.importedAt) - toTimestamp(a.dataset.importedAt)));
    // Keep same-named imports distinct in the Overview, even if the registry
    // stores a normalized table name for each one.
    const totals = new Map<string, number>();
    for (const item of mapped) {
      const key = item.dataset.name.trim().toLocaleLowerCase();
      totals.set(key, (totals.get(key) ?? 0) + 1);
    }
    const seen = new Map<string, number>();
    return mapped.map((item) => {
      const original = item.dataset.name;
      const key = original.trim().toLocaleLowerCase();
      if ((totals.get(key) ?? 0) < 2 || /\s\(\d+\)$/.test(original)) return item;
      const index = (seen.get(key) ?? 0) + 1;
      seen.set(key, index);
      return { ...item, displayName: index === 1 ? original : `${original} (${index})` };
    });
  }, [datasets, openedMap, now]);
  const isFirstVisit = datasets.length === 0;
  const showSearch = recentDatasets.length >= 8;
  const filteredDatasets = recentDatasets.filter(({ dataset, displayName }) =>
    !showSearch || !search.trim() || displayName.toLowerCase().includes(search.trim().toLowerCase()) ||
    (dataset.fileName ?? "").toLowerCase().includes(search.trim().toLowerCase())
  );
  const visibleDatasets = showAll ? filteredDatasets : filteredDatasets.slice(0, 8);
  const lastDataset = recentDatasets.find(({ dataset }) => dataset.id === lastOpenedId) ?? recentDatasets[0];
  const storageUsage = storage?.usage;
  const storageQuota = storage?.quota;
  const storagePercent = storageUsage && storageQuota ? Math.min(100, (storageUsage / storageQuota) * 100) : 0;
  function markOpened(dataset: DatasetLike) {
    const timestamp = Date.now();
    const next = { ...openedMap, [dataset.id]: timestamp };
    setOpenedMap(next);
    setLastOpenedId(dataset.id);
    try {
      localStorage.setItem(OPENED_MAP_KEY, JSON.stringify(next));
      localStorage.setItem(LAST_OPENED_KEY, dataset.id);
    } catch {
      // Keep the in-memory behavior even if persistence is unavailable.
    }
    onNavigate("explorer");
  }
  function beginRename(dataset: DatasetLike, displayName: string) {
    setActionError("");
    setRenamingId(dataset.id);
    setRenameValue(displayName);
  }
  function saveRename(dataset: DatasetLike) {
    const nextName = renameValue.trim();
    if (!nextName) {
      setActionError("Dataset name cannot be empty.");
      return;
    }
    try {
      datasetRegistry.rename(dataset.id, nextName);
      setRenamingId(null);
      setRenameValue("");
      setActionError("");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not rename dataset.");
    }
  }
  function deleteDataset(dataset: DatasetLike, displayName: string) {
    const confirmed = window.confirm(`Delete “${displayName}”? This removes the dataset and its saved original rows from Dock. This action cannot be undone.`);
    if (!confirmed) return;
    removeDataset(dataset.id);
    const next = { ...openedMap };
    delete next[dataset.id];
    setOpenedMap(next);
    const nextLastOpened = lastOpenedId === dataset.id ? "" : lastOpenedId;
    setLastOpenedId(nextLastOpened);
    try {
      localStorage.setItem(OPENED_MAP_KEY, JSON.stringify(next));
      if (nextLastOpened) localStorage.setItem(LAST_OPENED_KEY, nextLastOpened);
      else localStorage.removeItem(LAST_OPENED_KEY);
    } catch {
      // Keep the in-memory state correct when localStorage is unavailable.
    }
  }
  async function importSelectedFiles(files: FileList | File[]) {
    const fileArray = Array.from(files).filter((file) =>
      file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv"
    );
    if (!fileArray.length) {
      setSampleError("Choose a CSV file to import.");
      return;
    }
    setSampleError("");
    clearError();
    try {
      await importFiles(fileArray);
    } catch (cause) {
      setSampleError(cause instanceof Error ? cause.message : "The file could not be imported.");
    }
  }
  async function loadSample() {
    setSampleError("");
    clearError();
    const file = new File([SAMPLE_CSV], "dock_sales_sample.csv", { type: "text/csv" });
    try {
      await importFiles([file]);
    } catch (cause) {
      setSampleError(cause instanceof Error ? cause.message : "The sample dataset could not be imported.");
    }
  }
  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (event.dataTransfer.files.length) void importSelectedFiles(event.dataTransfer.files);
  }
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Overview</h1>
          <p>{isFirstVisit ? "Start by adding a dataset." : "Pick up where you left off."}</p>
        </div>
      </header>
      <nav className={styles.quickActions} aria-label="Quick actions">
        <button className={styles.primaryAction} type="button" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
          <Upload size={15} /> {isImporting ? "Importing…" : "Upload dataset"}
        </button>
        <button className={styles.secondaryAction} type="button" onClick={() => onNavigate("explorer")}>
          <Code2 size={15} /> New SQL query
        </button>
        <button className={styles.secondaryAction} type="button" onClick={() => onNavigate("notebooks")}>
          <FileCode2 size={15} /> New Python notebook
        </button>
        <button className={styles.secondaryAction} type="button" onClick={() => void loadSample()} disabled={isImporting}>
          <Database size={15} /> Try a sample dataset
        </button>
        <input
          ref={fileInputRef}
          className={styles.hiddenInput}
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={(event) => {
            if (event.target.files?.length) void importSelectedFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
      </nav>
      {(error || sampleError) && (
        <div className={styles.errorBanner} role="alert">
          <span>{sampleError || error}</span>
          <button type="button" onClick={() => { clearError(); setSampleError(""); }} aria-label="Dismiss error"><X size={14} /></button>
        </div>
      )}
      {isFirstVisit ? (
        <div className={styles.firstVisitGrid}>
          <section
            className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
            onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragActive(false);
            }}
            onDrop={handleDrop}
          >
            <div className={styles.dropIcon}><FileSpreadsheet size={25} /></div>
            <h2>Drop a CSV to begin</h2>
            <p>Import a local CSV and start inspecting rows, columns, and data quality.</p>
            <div className={styles.dropActions}>
              <button className={styles.primaryAction} type="button" onClick={() => fileInputRef.current?.click()}>
                <Upload size={15} /> Browse files
              </button>
              <button className={styles.secondaryAction} type="button" onClick={() => void loadSample()} disabled={isImporting}>
                <Database size={15} /> Try sample dataset
              </button>
            </div>
            <small>CSV files · Data stays in this browser</small>
          </section>
          <WorkspaceStatus datasetCount={0} storageUsage={storageUsage} storageQuota={storageQuota} storagePercent={storagePercent} />
        </div>
      ) : (
        <>
          {lastDataset && (
            <section className={styles.continueCard}>
              <div className={styles.continueIcon}><Clock3 size={17} /></div>
              <div className={styles.continueCopy}>
                <strong>Continue · {lastDataset.displayName}</strong>
                <span>Opened {formatRelativeTime(lastDataset.openedAt || lastDataset.dataset.importedAt)} · {lastDataset.rowCount.toLocaleString()} rows × {lastDataset.columns} columns</span>
              </div>
              <button className={styles.resumeButton} type="button" onClick={() => markOpened(lastDataset.dataset)}>
                Resume <ArrowRight size={14} />
              </button>
            </section>
          )}
          <div className={styles.mainGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Recent work</h2>
                </div>
                {showSearch && (
                  <label className={styles.searchBox}>
                    <Search size={14} />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find work" aria-label="Find recent work" />
                  </label>
                )}
              </div>
              {actionError && <div className={styles.errorBanner} role="alert"><span>{actionError}</span><button type="button" onClick={() => setActionError("")} aria-label="Dismiss error"><X size={14} /></button></div>}
              <div className={styles.tableWrap}>
                <table className={styles.recentTable}>
                  <thead>
                    <tr><th>Name</th><th>Size</th><th>Quality</th><th>Last opened</th><th><span className={styles.srOnly}>Dataset actions</span></th></tr>
                  </thead>
                  <tbody>
                    {visibleDatasets.map(({ dataset, displayName, rowCount, originalRowCount, columns, openedAt, quality }) => (
                      <tr key={dataset.id} onDoubleClick={() => markOpened(dataset)}>
                        <td>
                          <span className={styles.datasetName}>
                            <span className={styles.fileIcon} aria-hidden="true"><FileSpreadsheet size={14} /></span>
                            {renamingId === dataset.id ? (
                              <span className={styles.renameEditor}>
                                <input autoFocus value={renameValue} aria-label={`New name for ${displayName}`} onChange={(event) => setRenameValue(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveRename(dataset); if (event.key === "Escape") setRenamingId(null); }} />
                                <button type="button" className={styles.actionText} onClick={() => saveRename(dataset)}>Save</button>
                                <button type="button" className={styles.actionText} onClick={() => setRenamingId(null)}>Cancel</button>
                              </span>
                            ) : (
                              <span className={styles.datasetLabel} title={dataset.fileName || dataset.name}>{displayName}</span>
                            )}
                            {originalRowCount > rowCount && (
                              <span className={styles.cleanedTag} title={`${originalRowCount} → ${rowCount} rows`}>
                                Cleaned
                              </span>
                            )}
                          </span>
                        </td>
                        <td>{rowCount.toLocaleString()} rows × {columns} cols</td>
                        <td>
                          <span className={`${styles.qualityChip} ${quality >= 85 ? styles.qualityGood : quality >= 60 ? styles.qualityFair : styles.qualityPoor}`} title="Calculated from missing cells and duplicate rows">
                            {quality}/100
                          </span>
                        </td>
                        <td>{formatRelativeTime(openedAt || dataset.importedAt)}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <button className={styles.rowAction} type="button" onClick={() => markOpened(dataset)} aria-label={`Open ${displayName}`} title="Open"><ExternalLink size={13} /><span>Open</span></button>
                            <button className={styles.rowAction} type="button" onClick={() => beginRename(dataset, displayName)} aria-label={`Rename ${displayName}`} title="Rename"><Pencil size={13} /><span>Rename</span></button>
                            <button className={`${styles.rowAction} ${styles.deleteAction}`} type="button" onClick={() => deleteDataset(dataset, displayName)} aria-label={`Delete ${displayName}`} title="Delete"><Trash2 size={13} /><span>Delete</span></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {visibleDatasets.length === 0 && (
                      <tr><td colSpan={5} className={styles.noResults}>No recent work matches “{search}”.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredDatasets.length > 8 && (
                <button className={styles.viewAll} type="button" onClick={() => setShowAll((value) => !value)}>
                  {showAll ? "Show fewer" : `View all ${filteredDatasets.length} datasets`} <ChevronRight size={14} />
                </button>
              )}
            </section>
            <WorkspaceStatus datasetCount={datasets.length} storageUsage={storageUsage} storageQuota={storageQuota} storagePercent={storagePercent} />
          </div>
        </>
      )}
      <section className={styles.toolkit}>
        <div className={styles.toolkitHeader}>
          <div><h2>Analytics tools</h2></div>
          <span className={styles.comingSoon}>Coming soon</span>
        </div>
        <div className={styles.toolkitRow}>
          <ToolkitItem title="Statistics" />
          <ToolkitItem title="Machine learning" />
          <ToolkitItem title="Deep learning" />
          <ToolkitItem title="AI evaluation" />
        </div>
      </section>
    </div>
  );
}
function WorkspaceStatus({
  datasetCount,
  storageUsage,
  storageQuota,
  storagePercent,
}: {
  datasetCount: number;
  storageUsage?: number;
  storageQuota?: number;
  storagePercent: number;
}) {
  const storageSupported = typeof navigator !== "undefined" && !!navigator.storage?.estimate;
  const formatBytes = (bytes?: number) => {
    if (bytes === undefined) return "Unavailable";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const formatQuota = (bytes?: number) => {
    if (bytes === undefined || !Number.isFinite(bytes)) return "Storage estimate unavailable";
    const gigabyte = 1024 ** 3;
    if (bytes >= gigabyte) return `of ${Math.round(bytes / gigabyte)} GB`;
    return `of ${formatBytes(bytes)}`;
  };
  return (
    <aside className={styles.statusPanel}>
      <div className={styles.panelHeader}>
        <div><h2>Workspace status</h2><p>Runtime starts when you use it</p></div>
        <Activity size={16} />
      </div>
      <div className={styles.statusLine}>
        <span className={styles.statusDot} />
        <span>SQL engine</span>
        <strong className={styles.statusUnknown}>Starts on first query</strong>
      </div>
      <div className={styles.statusLine}>
        <span className={styles.statusDot} />
        <span>Python engine</span>
        <strong className={styles.statusUnknown}>Starts on first run</strong>
      </div>
      <div className={styles.statusDivider} />
      <div className={styles.metricLine}><span>Datasets</span><strong>{datasetCount}</strong></div>
      <div className={styles.metricLine}><span>Browser storage used</span><strong>{storageSupported ? formatBytes(storageUsage) : "Unavailable"}</strong></div>
      <div className={styles.storageTrack} aria-label={`Storage usage ${storagePercent.toFixed(3)}%`}><span data-used={storageUsage && storageUsage > 0 ? "true" : "false"} style={{ width: `${storagePercent}%` }} /></div>
      <div className={styles.storageFoot}>
        <span>{storageSupported && storageQuota ? formatQuota(storageQuota) : "Storage estimate unavailable"}</span>
      </div>
      {!storageSupported && <p className={styles.storageWarning}>Browser storage estimates are unavailable. Persistence may be limited in this browsing session.</p>}
      <p className={styles.privacyNote}><HardDrive size={13} /> Your data stays on this device.</p>
    </aside>
  );
}
function ToolkitItem({ title }: { title: string }) {
  return (
    <button className={styles.toolkitItem} type="button" disabled aria-disabled="true">
      <span>{title}</span><span className={styles.toolkitPending}>Coming soon</span>
    </button>
  );
}
