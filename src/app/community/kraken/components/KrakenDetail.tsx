
"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Database,
  Eye,
  FileSpreadsheet,
  Info,
  MessageCircle,
  ShieldAlert,
  ThumbsUp,
  Upload,
} from "lucide-react";

import KrakenReplies from "./KrakenReplies";
import type { KrakenEntry } from "../types/kraken";
import { createDatasetTransfer } from "@/lib/dataset-transfer";
import styles from "../styles/ship-logs.module.css";

type KrakenDetailProps = {
  log: KrakenEntry;
  onBack: () => void;
};

type DatasetPreview = {
  columns: string[];
  rows: string[][];
};

const typeLabels: Record<KrakenEntry["type"], string> = {
  dataset: "Dataset",
  challenge: "Challenge",
};

function formatDomain(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isVerifiedSource(log: KrakenEntry) {
  return Boolean(
    log.source &&
      !log.source.toLowerCase().includes("sample") &&
      /^https?:\/\//i.test(log.source)
  );
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === "," && !insideQuotes) {
      values.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

function parseCSVPreview(csv: string): DatasetPreview {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error("CSV has no data rows.");
  }

  const columns = parseCSVLine(lines[0]);
  const rows = lines.slice(1, 6).map(parseCSVLine);

  if (
    columns.length === 0 ||
    rows.some((row) => row.length !== columns.length)
  ) {
    throw new Error("Unexpected CSV structure.");
  }

  return { columns, rows };
}

export default function KrakenDetail({
  log,
  onBack,
}: KrakenDetailProps) {
  const [signals, setSignals] = useState(log.signals);
  const [hasSignaled, setHasSignaled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [replyCount, setReplyCount] = useState(log.replies);

  const [datasetPreview, setDatasetPreview] =
    useState<DatasetPreview | null>(null);

  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const datasetInputRef = useRef<HTMLInputElement>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  useEffect(() => {
    if (log.id !== "iris-flower-measurements") {
      setDatasetPreview(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPreview() {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const response = await fetch("/datasets/iris.csv");

        if (!response.ok) {
          throw new Error("Dataset request failed.");
        }

        const csv = await response.text();
        const preview = parseCSVPreview(csv);

        if (!cancelled) {
          setDatasetPreview(preview);
        }
      } catch {
        if (!cancelled) {
          setPreviewError(
            "Could not load the preview. Check the Iris CSV file."
          );
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [log.id]);

  const verifiedSource = isVerifiedSource(log);

  const handleSignal = () => {
    if (hasSignaled) {
      setSignals((current) => Math.max(0, current - 1));
      setHasSignaled(false);
      return;
    }

    setSignals((current) => current + 1);
    setHasSignaled(true);
  };

  const handleSave = () => {
    setIsSaved((current) => !current);
  };

  async function handleDatasetFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);

    // Allow the same files to be selected again later.
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const invalidFiles = selectedFiles.filter(
      (file) => !file.name.toLowerCase().endsWith(".csv")
    );

    if (invalidFiles.length > 0) {
      setTransferError(
        `CSV files only. Unsupported: ${invalidFiles
          .map((file) => file.name)
          .join(", ")}`
      );
      return;
    }

    const emptyFiles = selectedFiles.filter((file) => file.size === 0);

    if (emptyFiles.length > 0) {
      setTransferError(
        `These files are empty: ${emptyFiles
          .map((file) => file.name)
          .join(", ")}`
      );
      return;
    }

    setTransferLoading(true);
    setTransferError(null);

    try {
      const datasets = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          content: await file.text(),
          size: file.size,
          type: file.type || "text/csv",
        }))
      );

      const transferId = await createDatasetTransfer(datasets);

      window.location.href =
        `/dock?transfer=${encodeURIComponent(transferId)}`;
    } catch (error) {
      setTransferError(
        error instanceof Error
          ? error.message
          : "Unable to transfer the selected datasets."
      );
    } finally {
      setTransferLoading(false);
    }
  }

  return (
    <section className={styles.detailPage}>
      <button
        type="button"
        className={styles.detailBackButton}
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to Kraken
      </button>

      <article className={styles.detailCard}>
        <header className={styles.detailHeader}>
          <div className={styles.detailType}>
            {typeLabels[log.type]}
          </div>

          <h1>{log.title}</h1>

          <p className={styles.detailDescription}>
            {log.description}
          </p>

          <div className={styles.detailAuthor}>
            <span className={styles.detailAvatar}>
              {log.authorInitial}
            </span>

            <div>
              <strong>{log.author}</strong>
              <span>Published {log.publishedLabel}</span>
            </div>
          </div>
        </header>

        <div className={styles.detailStats}>
          <button
            type="button"
            onClick={handleSignal}
            aria-pressed={hasSignaled}
            className={
              hasSignaled ? styles.detailSignalActive : ""
            }
          >
            <ThumbsUp size={16} />
            {signals}
            <span>{hasSignaled ? "Signaled" : "Signals"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("kraken-replies")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <MessageCircle size={16} />
            {replyCount}
            <span>Replies</span>
          </button>

          <button
            type="button"
            aria-label={`${log.views} views`}
          >
            <Eye size={16} />
            {log.views}
            <span>Views</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            aria-label={
              isSaved
                ? "Remove Kraken entry from saved"
                : "Save Kraken entry"
            }
            aria-pressed={isSaved}
            className={
              isSaved ? styles.detailSaveActive : ""
            }
          >
            <Bookmark
              size={16}
              fill={isSaved ? "currentColor" : "none"}
            />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>
        </div>

        <div className={styles.detailBody}>
          {log.type === "dataset" && (
            <section
              className={styles.datasetWorkspace}
              aria-labelledby="dataset-overview-title"
            >
              <div className={styles.datasetSectionHeading}>
                <div>
                  <span className={styles.datasetEyebrow}>
                    DATASET OVERVIEW
                  </span>

                  <h2 id="dataset-overview-title">
                    Explore this dataset
                  </h2>

                  <p>
                    Review the available metadata before working
                    with the data in The Dock.
                  </p>
                </div>

                <div className={styles.datasetIcon}>
                  <Database size={22} />
                </div>
              </div>

              <div className={styles.datasetFacts}>
                <div className={styles.datasetFact}>
                  <span>Format</span>
                  <strong>{log.format}</strong>
                </div>

                <div className={styles.datasetFact}>
                  <span>Reported records</span>
                  <strong>
                    {log.recordCount.toLocaleString()}
                  </strong>
                </div>

                <div className={styles.datasetFact}>
                  <span>Reported size</span>
                  <strong>{log.size}</strong>
                </div>

                <div className={styles.datasetFact}>
                  <span>Difficulty</span>
                  <strong>
                    {formatDomain(log.difficulty)}
                  </strong>
                </div>

                <div className={styles.datasetFact}>
                  <span>Domain</span>
                  <strong>{formatDomain(log.domain)}</strong>
                </div>

                <div className={styles.datasetFact}>
                  <span>Task type</span>
                  <strong>{formatDomain(log.taskType)}</strong>
                </div>
              </div>

              <div
                className={
                  verifiedSource
                    ? styles.datasetSourceVerified
                    : styles.datasetSourceNotice
                }
                role="status"
              >
                {verifiedSource ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <ShieldAlert size={18} />
                )}

                <div>
                  <strong>
                    {verifiedSource
                      ? "Source link available"
                      : "Sample listing — source not verified"}
                  </strong>

                  <p>
                    {verifiedSource
                      ? "A source URL is available. Confirm its license and file format before using the data."
                      : "The current entry contains descriptive metadata only. A downloadable file, confirmed schema, and license have not been provided."}
                  </p>

                  {log.source && (
                    <span className={styles.datasetSourceName}>
                      Listed source: {log.source}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.datasetPreview}>
                <div className={styles.datasetPreviewHeader}>
                  <div className={styles.datasetPreviewTitle}>
                    <FileSpreadsheet size={18} />

                    <div>
                      <strong>Data preview</strong>
                      <span>Schema and sample rows</span>
                    </div>
                  </div>

                  <span className={styles.datasetPreviewFormat}>
                    {log.format}
                  </span>
                </div>

                {previewLoading ? (
                  <div className={styles.datasetPreviewEmpty}>
                    <p>Loading dataset preview...</p>
                  </div>
                ) : previewError ? (
                  <div
                    className={styles.datasetPreviewEmpty}
                    role="alert"
                  >
                    <div
                      className={styles.datasetPreviewEmptyIcon}
                    >
                      <Info size={22} />
                    </div>

                    <h3>Preview unavailable</h3>
                    <p>{previewError}</p>
                  </div>
                ) : datasetPreview ? (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                        fontSize: "13px",
                      }}
                    >
                      <thead>
                        <tr>
                          {datasetPreview.columns.map((column) => (
                            <th
                              key={column}
                              style={{
                                padding: "12px",
                                borderBottom:
                                  "1px solid var(--border, #334155)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {datasetPreview.rows.map((row, rowIndex) => (
                          <tr
                            key={`${rowIndex}-${row.join("-")}`}
                          >
                            {row.map((value, columnIndex) => (
                              <td
                                key={`${rowIndex}-${columnIndex}`}
                                style={{
                                  padding: "12px",
                                  borderBottom:
                                    "1px solid var(--border, #334155)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <p
                      style={{
                        padding: "12px",
                        fontSize: "12px",
                      }}
                    >
                      Showing the first 5 records from the actual
                      CSV.
                    </p>
                  </div>
                ) : (
                  <div className={styles.datasetPreviewEmpty}>
                    <div
                      className={styles.datasetPreviewEmptyIcon}
                    >
                      <Info size={22} />
                    </div>

                    <h3>Preview not available yet</h3>
                    <p>
                      This dataset has no preview connected yet.
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.datasetDockAction}>
                <div>
                  <strong>Continue in The Dock</strong>
                  <p>
                    Import one or more CSV files and analyze them
                    using Python and SQL in your notebook.
                  </p>
                </div>

                <input
                  ref={datasetInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  multiple
                  hidden
                  onChange={handleDatasetFiles}
                />

                <button
                  type="button"
                  disabled={transferLoading}
                  title="Select one or more CSV datasets"
                  onClick={() => {
                    setTransferError(null);
                    datasetInputRef.current?.click();
                  }}
                >
                  <Upload size={16} />
                  {transferLoading
                    ? "Preparing datasets..."
                    : "Choose CSVs for Dock"}
                </button>
              </div>

              {transferError && (
                <p
                  role="alert"
                  className={styles.datasetActionNote}
                >
                  {transferError}
                </p>
              )}
            </section>
          )}

          <div className={styles.detailContent}>
            <ReactMarkdown>{log.content}</ReactMarkdown>
          </div>

          {log.tags.length > 0 && (
            <div className={styles.detailTags}>
              {log.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}

          <div id="kraken-replies">
            <KrakenReplies
              onReplyCountChange={setReplyCount}
            />
          </div>
        </div>
      </article>
    </section>
  );
}
