"use client";

import { useState } from "react";

import {
  ArrowLeft,
  Eye,
  FileText,
  Hash,
  Send,
} from "lucide-react";

import styles from "../styles/ship-logs.module.css";

import type { ShipLogType } from "../types/shipLog";

type CreateLogEditorProps = {
  logType: ShipLogType;
  title: string;
  description: string;
  onBack: () => void;
  onPublish: (content: string, tags: string[]) => void;
};

export default function CreateLogEditor({
  logType,
  title,
  description,
  onBack,
  onPublish,
}: CreateLogEditorProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const parsedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const canPublish =
    content.trim().length > 0;

  const handlePublish = () => {
    if (!canPublish) {
      return;
    }

    onPublish(content.trim(), parsedTags);
  };

  return (
    <section
      className={styles.createModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-log-editor-title"
    >
      <header className={styles.modalHeader}>
        <div>
          <span className={styles.modalEyebrow}>
            STEP 2 · EDITOR
          </span>

          <h2 id="create-log-editor-title">
            Build Your Ship Log
          </h2>

          <p>
            Add the technical content, tags and
            details your readers need.
          </p>
        </div>

        <button
          type="button"
          className={styles.modalClose}
          onClick={onBack}
          aria-label="Back to log details"
        >
          <ArrowLeft size={18} />
        </button>
      </header>

      <div className={styles.modalBody}>
        <div className={styles.modalField}>
          <label>Title</label>

          <div className={styles.editorReadOnlyField}>
            <FileText size={15} />

            <span>
              {title || "Untitled Ship Log"}
            </span>
          </div>
        </div>

        <div className={styles.modalField}>
          <label>Description</label>

          <div
            className={
              styles.editorReadOnlyDescription
            }
          >
            {description ||
              "No description provided."}
          </div>
        </div>

        <div className={styles.modalField}>
          <label htmlFor="ship-log-content">
            Content
          </label>

          <textarea
            id="ship-log-content"
            className={styles.editorContent}
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            placeholder={`Start writing your ${logType}...`}
            rows={10}
          />
        </div>

        <div className={styles.modalField}>
          <label htmlFor="ship-log-tags">
            Tags
          </label>

          <div className={styles.editorInputWithIcon}>
            <Hash size={15} />

            <input
              id="ship-log-tags"
              className={styles.modalInput}
              value={tags}
              onChange={(event) =>
                setTags(event.target.value)
              }
              placeholder="Python, Machine Learning, APIs"
            />
          </div>

          <small className={styles.editorHint}>
            Separate multiple tags with commas.
          </small>
        </div>

        <div className={styles.editorPreview}>
          <div
            className={styles.editorPreviewHeader}
          >
            <div>
              <span
                className={styles.modalEyebrow}
              >
                PREVIEW
              </span>

              <strong>
                How your Ship Log will appear
              </strong>
            </div>

            <Eye size={17} />
          </div>

          <div
            className={styles.editorPreviewCard}
          >
            <span
              className={styles.editorPreviewType}
            >
              {logType}
            </span>

            <h3>
              {title || "Your Ship Log title"}
            </h3>

            <p>
              {description ||
                "Your Ship Log description will appear here."}
            </p>

            {content.trim() && (
              <div
                className={
                  styles.editorPreviewContent
                }
              >
                {content}
              </div>
            )}

            {parsedTags.length > 0 && (
              <div
                className={
                  styles.editorPreviewTags
                }
              >
                {parsedTags.map((tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className={styles.modalFooter}>
        <button
          type="button"
          className={styles.modalCancel}
          onClick={onBack}
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <button
          type="button"
          className={styles.modalPublish}
          disabled={!canPublish}
          onClick={handlePublish}
        >
          <Send size={15} />
          Publish Log
        </button>
      </footer>
    </section>
  );
}