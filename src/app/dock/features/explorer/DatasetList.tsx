
"use client";

import { Database, FileSpreadsheet, Trash2 } from "lucide-react";
import type { DockDataset } from "../../types/dataset";

type DatasetListProps = {
  datasets: DockDataset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
};

export default function DatasetList({
  datasets,
  selectedId,
  onSelect,
  onRemove,
}: DatasetListProps) {
  if (datasets.length === 0) {
    return (
      <div className="dock-empty-list">
        <Database size={22} />
        <strong>No datasets yet</strong>
        <span>Import CSV files to start exploring.</span>
      </div>
    );
  }

  return (
    <div className="dock-dataset-list">
      {datasets.map((dataset) => (
        <div
          key={dataset.id}
          className={`dock-dataset-item ${
            selectedId === dataset.id ? "is-selected" : ""
          }`}
        >
          <button
            type="button"
            className="dock-dataset-select"
            onClick={() => onSelect(dataset.id)}
          >
            <span className="dock-dataset-file-icon">
              <FileSpreadsheet size={17} />
            </span>
            <span className="dock-dataset-name">
              <strong>{dataset.name}</strong>
              <small>
                {dataset.summary?.rowCount.toLocaleString() ?? "—"} rows ·{" "}
                {dataset.columns.length} columns
              </small>
            </span>
          </button>

          <button
            type="button"
            className="dock-mini-icon dock-dataset-remove"
            onClick={() => onRemove(dataset.id)}
            title={`Remove ${dataset.name}`}
            aria-label={`Remove ${dataset.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
