"use client";

import {
  Bell,
  ChevronDown,
  Filter,
  Search,
  Sun,
} from "lucide-react";

import styles from "../styles/ship-logs.module.css";

type ShipLogsHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export default function ShipLogsHeader({
  query,
  onQueryChange,
}: ShipLogsHeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>
          ⚓
        </div>

        <span>
          Hackers
          <span>Harbor</span>
        </span>
      </div>

      <div className={styles.globalSearch}>
        <Search size={17} />

        <input
          value={query}
          onChange={(event) =>
            onQueryChange(event.target.value)
          }
          placeholder="Search logs, notebooks, projects, topics..."
          aria-label="Search Ship Logs"
        />
      </div>

      <button
        className={styles.filterButton}
        type="button"
      >
        <Filter size={16} />
        Filters
      </button>

      <div className={styles.topActions}>
        <button
          type="button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          aria-label="Theme"
        >
          <Sun size={18} />
        </button>

        <button
          className={styles.avatar}
          type="button"
        >
          P
          <ChevronDown size={13} />
        </button>
      </div>
    </header>
  );
}