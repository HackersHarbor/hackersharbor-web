"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload, X } from "lucide-react";

type DatasetUploadProps = {
  isImporting: boolean;
  onImport: (files: File[]) => Promise<void>;
  error: string | null;
  onClearError: () => void;
};

export default function DatasetUpload({
  isImporting,
  onImport,
  error,
  onClearError,
}: DatasetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  function addFiles(files: FileList | File[]) {
    const csvFiles = Array.from(files).filter((file) =>
      file.name.toLowerCase().endsWith(".csv"),
    );

    if (csvFiles.length === 0) {
      onClearError();
      return;
    }

    setPendingFiles((current) => {
      const combined = [...current];

      for (const file of csvFiles) {
        const alreadyAdded = combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        );

        if (!alreadyAdded) {
          combined.push(file);
        }
      }

      return combined;
    });

    onClearError();
  }

  async function handleImport() {
    if (pendingFiles.length === 0 || isImporting) return;

    await onImport(pendingFiles);
    setPendingFiles([]);
  }

  return (
    <section className="dock-explorer-upload">
      <div
        className={`dock-dropzone${isDragging ? " is-dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (
            !event.currentTarget.contains(
              event.relatedTarget as Node | null,
            )
          ) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <div className="dock-drop-icon">
          <Upload size={22} aria-hidden="true" />
        </div>

        <div className="dock-drop-copy">
          <strong>Bring your data into Dock</strong>
          <span>
            Drop CSV files here, or choose files from your computer.
          </span>
          <small>
            CSV files · Multiple files supported · Up to 100 MB per file
          </small>
        </div>

        <button
          type="button"
          className="dock-action-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={isImporting}
        >
          Browse files
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) {
              addFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />
      </div>

      {pendingFiles.length > 0 && (
        <div className="dock-pending-files">
          <div className="dock-pending-heading">
            <span>{pendingFiles.length} file(s) selected</span>
            <button
              type="button"
              className="dock-text-button"
              onClick={() => setPendingFiles([])}
              disabled={isImporting}
            >
              Clear selection
            </button>
          </div>

          {pendingFiles.map((file) => (
            <div
              className="dock-pending-file"
              key={`${file.name}-${file.size}-${file.lastModified}`}
            >
              <FileSpreadsheet size={16} aria-hidden="true" />
              <span>{file.name}</span>
              <small>{formatBytes(file.size)}</small>
              <button
                type="button"
                className="dock-mini-icon"
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  setPendingFiles((current) =>
                    current.filter((item) => item !== file),
                  )
                }
                disabled={isImporting}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="dock-action-primary"
            onClick={() => void handleImport()}
            disabled={isImporting}
          >
            {isImporting
              ? "Importing datasets…"
              : "Import selected datasets"}
          </button>
        </div>
      )}

      {error && (
        <div className="dock-error-message" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="dock-mini-icon"
            onClick={onClearError}
            aria-label="Dismiss import error"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
