"use client";

import { useState } from "react";

import ShipLogsHeader from "./ShipLogsHeader";
import ShipLogsSidebar from "./ShipLogsSidebar";
import ShipLogsContent from "./ShipLogsContent";
import CreateLogModal from "./CreateLogModal";

import type { ShipLog } from "../types/shipLog";

import styles from "../styles/ship-logs.module.css";

export default function ShipLogsShell() {
  const [query, setQuery] = useState("");

  const [activeType, setActiveType] =
    useState("All Logs");

  const [isCreateLogOpen, setIsCreateLogOpen] =
    useState(false);

  const [createdLogs, setCreatedLogs] =
    useState<ShipLog[]>([]);

  const handleCreated = (log: ShipLog) => {
    setCreatedLogs((currentLogs) => [
      log,
      ...currentLogs,
    ]);
  };

  return (
    <main className={styles.page}>
      <ShipLogsHeader
        query={query}
        onQueryChange={setQuery}
      />

      <div className={styles.body}>
        <ShipLogsSidebar />

        <ShipLogsContent
          query={query}
          activeType={activeType}
          onTypeChange={setActiveType}
          onCreateLog={() =>
            setIsCreateLogOpen(true)
          }
          createdLogs={createdLogs}
        />
      </div>

      {isCreateLogOpen && (
        <CreateLogModal
          onClose={() =>
            setIsCreateLogOpen(false)
          }
          onCreated={handleCreated}
        />
      )}
    </main>
  );
}