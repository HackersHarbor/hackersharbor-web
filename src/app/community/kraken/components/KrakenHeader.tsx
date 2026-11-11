"use client";

import {
  Anchor,
  Bell,
  ChevronDown,
  Filter,
  Search,
  Sun,
} from "lucide-react";

import styles from "../styles/ship-logs.module.css";

type KrakenHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export default function KrakenHeader({
  query,
  onQueryChange,
}: KrakenHeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <div
          className={styles.brandMark}
          aria-label="Kraken Data Lab"
          title="Kraken Data Lab"
        >
          <Anchor size={20} strokeWidth={1.7} />
        </div>

        <div className={styles.brandText}>
  <span className={styles.brandName}>
    Hackers<span className={styles.brandHarbor}>Harbor</span>
  </span>
  <small className={styles.brandSubtitle}>
    KRAKEN / DATA LAB
  </small>
</div>
      </div>

      <div className={styles.globalSearch}>
        <Search size={17} aria-hidden="true" />

        <input
          type="search"
          value={query}
          onChange={(event) =>
            onQueryChange(event.target.value)
          }
          placeholder="Search datasets, challenges, models, topics..."
          aria-label="Search Kraken datasets and challenges"
        />
      </div>

      <button
        className={styles.filterButton}
        type="button"
        aria-label="Filter datasets and challenges"
      >
        <Filter size={16} aria-hidden="true" />
        Filters
      </button>

      <div className={styles.topActions}>
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          aria-label="Theme"
          title="Change theme"
        >
          <Sun size={18} />
        </button>

        <button
          className={styles.avatar}
          type="button"
          aria-label="Open profile menu"
        >
          P
          <ChevronDown size={13} />
        </button>
      </div>
    </header>
  );
}