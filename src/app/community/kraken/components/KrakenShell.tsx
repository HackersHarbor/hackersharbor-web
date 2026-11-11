"use client";

import { useState } from "react";

import KrakenHeader from "./KrakenHeader";
import KrakenSidebar from "./KrakenSidebar";
import KrakenContent from "./KrakenContent";
import CreateLogModal from "./CreateLogModal";

import type { KrakenEntry } from "../types/kraken";

import styles from "../styles/ship-logs.module.css";

export default function KrakenEntrysShell() {
  const [query, setQuery] = useState("");

  const [activeType, setActiveType] = useState(
    "All Datasets & Challenges",
  );

  const [isCreateLogOpen, setIsCreateLogOpen] =
    useState(false);

  const [createdLogs, setCreatedLogs] = useState<
    KrakenEntry[]
  >([]);

  const handleCreated = (entry: KrakenEntry) => {
    setCreatedLogs((currentEntries) => [
      entry,
      ...currentEntries,
    ]);

    setIsCreateLogOpen(false);
    setActiveType("All Datasets & Challenges");
  };

  return (
    <main className={styles.page}>
      <KrakenHeader
        query={query}
        onQueryChange={setQuery}
      />

      <div className={styles.body}>
        <KrakenSidebar />

        <KrakenContent
          query={query}
          activeType={activeType}
          onTypeChange={setActiveType}
          onCreateLog={() => setIsCreateLogOpen(true)}
          createdLogs={createdLogs}
        />
      </div>

      {isCreateLogOpen && (
        <CreateLogModal
          onClose={() => setIsCreateLogOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </main>
  );
}