"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  ArrowLeft,
  Bookmark,
  Eye,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

import ShipLogReplies from "./ShipLogReplies";

import type { ShipLog } from "../types/shipLog";

import styles from "../styles/ship-logs.module.css";

type ShipLogDetailProps = {
  log: ShipLog;
  onBack: () => void;
};

const typeLabels: Record<
  ShipLog["type"],
  string
> = {
  notebook: "Notebook",
  project: "Project",
  tutorial: "Tutorial",
  discussion: "Discussion",
  experiment: "Experiment",
  "code-snippet": "Code Snippet",
};

export default function ShipLogDetail({
  log,
  onBack,
}: ShipLogDetailProps) {
  const [signals, setSignals] = useState(
    log.signals,
  );

  const [hasSignaled, setHasSignaled] =
    useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [replyCount, setReplyCount] =
    useState(log.replies);

  const handleSignal = () => {
    if (hasSignaled) {
      setSignals((current) =>
        Math.max(0, current - 1),
      );

      setHasSignaled(false);

      return;
    }

    setSignals((current) => current + 1);
    setHasSignaled(true);
  };

  const handleSave = () => {
    setIsSaved((current) => !current);
  };

  return (
    <section className={styles.detailPage}>
      <button
        type="button"
        className={styles.detailBackButton}
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to Ship Logs
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

              <span>
                Published {log.publishedLabel}
              </span>
            </div>
          </div>
        </header>

        <div className={styles.detailStats}>
          <button
            type="button"
            onClick={handleSignal}
            aria-pressed={hasSignaled}
            className={
              hasSignaled
                ? styles.detailSignalActive
                : ""
            }
          >
            <ThumbsUp size={16} />

            {signals}

            <span>
              {hasSignaled
                ? "Signaled"
                : "Signals"}
            </span>
          </button>

          <button type="button">
            <MessageCircle size={16} />

            {replyCount}

            <span>Replies</span>
          </button>

          <button type="button">
            <Eye size={16} />

            {log.views}

            <span>Views</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            aria-label={
              isSaved
                ? "Remove Ship Log from saved"
                : "Save Ship Log"
            }
            aria-pressed={isSaved}
            className={
              isSaved
                ? styles.detailSaveActive
                : ""
            }
          >
            <Bookmark
              size={16}
              fill={
                isSaved
                  ? "currentColor"
                  : "none"
              }
            />

            <span>
              {isSaved ? "Saved" : "Save"}
            </span>
          </button>
        </div>

        <div className={styles.detailBody}>
          <div className={styles.detailContent}>
            <ReactMarkdown>
              {log.content}
            </ReactMarkdown>
          </div>

          {log.tags.length > 0 && (
            <div className={styles.detailTags}>
              {log.tags.map((tag) => (
                <span key={tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <ShipLogReplies
            onReplyCountChange={setReplyCount}
          />
        </div>
      </article>
    </section>
  );
}