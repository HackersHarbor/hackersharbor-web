"use client";

import { Compass, Minimize2, Plus } from "lucide-react";

import styles from "./navigator.module.css";

interface NavigatorHeaderProps {
  pageTitle: string;
  onClose: () => void;
  onClear: () => void;
}

export function NavigatorHeader({
  pageTitle,
  onClose,
  onClear,
}: NavigatorHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerIdentity}>
        <div className={styles.headerIcon}>
          <Compass size={21} strokeWidth={1.8} />
        </div>

        <div className={styles.headerText}>
          <div className={styles.headerTitle}>
            The Navigator
          </div>

          <div className={styles.headerSubtitle}>
            Your HackersHarbor AI assistant
          </div>
        </div>
      </div>

      <div className={styles.headerActions}>
        <span className={styles.contextLabel} title={pageTitle}>
          {pageTitle}
        </span>

        <button
          type="button"
          className={styles.iconButton}
          onClick={onClear}
          aria-label="Start a new conversation"
          title="New conversation"
        >
          <Plus size={18} />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={onClose}
          aria-label="Minimize Navigator"
          title="Minimize"
        >
          <Minimize2 size={17} />
        </button>
      </div>
    </header>
  );
}

