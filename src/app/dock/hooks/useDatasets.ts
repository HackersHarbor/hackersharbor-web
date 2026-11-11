
"use client";

import { useCallback, useEffect, useState } from "react";
import type { DockDataset } from "../types/dataset";
import { datasetRegistry } from "../services/datasets/DatasetRegistry";

export function useDatasets() {
  const [datasets, setDatasets] = useState<DockDataset[]>(() =>
    datasetRegistry.getAll(),
  );

  useEffect(() => {
    const refresh = () => {
      setDatasets(datasetRegistry.getAll());
    };

    const unsubscribe = datasetRegistry.subscribe(refresh);

    datasetRegistry.hydrateFromStorage();
    refresh();

    return unsubscribe;
  }, []);

  const removeDataset = useCallback((id: string) => {
    datasetRegistry.remove(id);
  }, []);

  const clearDatasets = useCallback(() => {
    datasetRegistry.clear();
  }, []);

  return {
    datasets,
    removeDataset,
    clearDatasets,
  };
}
