"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CopyCheck,
  ScanSearch,
  Trash2,
} from "lucide-react";

import type { DockDataset } from "../../types/dataset";
import {
  duplicateRowsService,
  type DuplicateRowsPreview,
} from "../../services/datasets/DuplicateRowsService";
import { datasetRegistry } from "../../services/datasets/DatasetRegistry";

type DuplicateRowsPanelProps = {
  dataset: DockDataset | null;
  onDatasetChanged: () => void;
};

export default function DuplicateRowsPanel({
  dataset,
  onDatasetChanged,
}: DuplicateRowsPanelProps) {
  const [preview, setPreview] =
    useState<DuplicateRowsPreview | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Re-run the duplicate preview whenever the shared dataset registry changes.
  const [registryVersion, setRegistryVersion] = useState(0);

  useEffect(() => {
    return datasetRegistry.subscribe(() => {
      setRegistryVersion((version) => version + 1);
    });
  }, []);

  const inspectDuplicates = useCallback(() => {
    if (!dataset) {
      setPreview(null);
      setError("Select a dataset to inspect duplicate rows.");
      return;
    }

    setIsInspecting(true);
    setError(null);
    setNotice(null);

    try {
      const result = duplicateRowsService.preview(dataset.id);
      setPreview(result);
    } catch (err) {
      setPreview(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to inspect duplicate rows.",
      );
    } finally {
      setIsInspecting(false);
    }
  }, [dataset]);

  useEffect(() => {
    setPreview(null);
    setError(null);
    setNotice(null);

    if (dataset) {
      try {
        setPreview(duplicateRowsService.preview(dataset.id));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to inspect duplicate rows.",
        );
      }
    }
  }, [dataset?.id, registryVersion]);

  const removeDuplicates = useCallback(() => {
    if (!dataset || !preview) {
      setError("Select a dataset and inspect it first.");
      return;
    }

    if (preview.duplicateRows === 0) {
      setNotice("No duplicate rows were found.");
      return;
    }

    const confirmed = window.confirm(
      `Remove ${preview.duplicateRows} duplicate row(s)? ` +
        "The first occurrence of each row will be retained. " +
        "You can undo this transformation using the history controls.",
    );

    if (!confirmed) {
      return;
    }

    setIsRemoving(true);
    setError(null);
    setNotice(null);

    try {
      const result = duplicateRowsService.remove(dataset.id);

      if (result.removedCount === 0) {
        setNotice("No duplicate rows needed to be removed.");
      } else {
        setNotice(
          `Successfully removed ${result.removedCount} duplicate row(s).`,
        );
      }

      setPreview(duplicateRowsService.preview(dataset.id));
      onDatasetChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove duplicate rows.",
      );
    } finally {
      setIsRemoving(false);
    }
  }, [dataset, preview, onDatasetChanged]);

  return (
    <section
      className="dock-missing-panel"
      aria-labelledby="duplicate-rows-heading"
    >
      <div className="dock-missing-panel-heading">
        <div>
          <h2 id="duplicate-rows-heading">Duplicate rows</h2>
          <p>
            Identify repeated records and keep the first occurrence
            of each unique row.
          </p>
        </div>

        <CopyCheck size={21} aria-hidden="true" />
      </div>

      {!dataset ? (
        <p className="dock-missing-message">
          Select a dataset to detect duplicate rows.
        </p>
      ) : (
        <>
          <div className="dock-missing-stat">
            <span>Total rows</span>
            <strong>{preview?.totalRows ?? "—"}</strong>
          </div>

          <div className="dock-missing-stat">
            <span>Unique rows</span>
            <strong>{preview?.uniqueRows ?? "—"}</strong>
          </div>

          <div className="dock-missing-stat">
            <span>Duplicate rows</span>
            <strong>{preview?.duplicateRows ?? "—"}</strong>
          </div>

          <div className="dock-missing-actions">
            <button
              type="button"
              className="dock-action-secondary"
              onClick={inspectDuplicates}
              disabled={isInspecting || isRemoving}
            >
              <ScanSearch size={16} aria-hidden="true" />
              {isInspecting ? "Inspecting..." : "Inspect duplicates"}
            </button>

            <button
              type="button"
              className="dock-action-primary"
              onClick={removeDuplicates}
              disabled={
                isRemoving ||
                isInspecting ||
                !preview ||
                preview.duplicateRows === 0
              }
            >
              <Trash2 size={16} aria-hidden="true" />
              {isRemoving ? "Removing..." : "Remove duplicates"}
            </button>
          </div>

          {preview && preview.previewRows.length > 0 && (
            <div className="dock-missing-preview">
              <div className="dock-missing-preview-heading">
                <h3>Duplicate row samples</h3>
                <span>
                  Showing up to {preview.previewRows.length} rows
                </span>
              </div>

              <div className="dock-missing-preview-list">
                {preview.previewRows.map((row, index) => (
                  <pre key={`${dataset.id}-duplicate-${index}`}>
                    {JSON.stringify(row, null, 2)}
                  </pre>
                ))}
              </div>
            </div>
          )}

          {preview && preview.duplicateRows === 0 && (
            <p className="dock-missing-message">
              No duplicate rows found. Your dataset contains only
              unique rows based on all its columns.
            </p>
          )}
        </>
      )}

      {notice && (
        <p className="dock-missing-message" role="status">
          {notice}
        </p>
      )}

      {error && (
        <p className="dock-missing-message" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
