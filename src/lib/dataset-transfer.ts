"use client";

export type DatasetTransferFile = {
  name: string;
  content: string;
  size: number;
  type: string;
};

type DatasetTransferPayload = {
  id: string;
  createdAt: number;
  datasets: DatasetTransferFile[];
};

const STORAGE_PREFIX = "hackersharbor:dataset-transfer:";
const MAX_TRANSFER_AGE_MS = 30 * 60 * 1000;

function createTransferId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function validateDatasets(
  datasets: DatasetTransferFile[]
): void {
  if (!Array.isArray(datasets) || datasets.length === 0) {
    throw new Error("Select at least one CSV dataset to transfer.");
  }

  for (const dataset of datasets) {
    if (
      !dataset ||
      typeof dataset.name !== "string" ||
      !dataset.name.toLowerCase().endsWith(".csv") ||
      typeof dataset.content !== "string" ||
      typeof dataset.size !== "number" ||
      !Number.isFinite(dataset.size) ||
      dataset.size <= 0 ||
      typeof dataset.type !== "string"
    ) {
      throw new Error("One or more selected datasets are invalid.");
    }

    if (dataset.content.length === 0) {
      throw new Error(`The dataset "${dataset.name}" is empty.`);
    }
  }
}

/**
 * Stores CSV contents in sessionStorage and returns an opaque transfer ID.
 * The dataset contents are not placed in the URL.
 */
export async function createDatasetTransfer(
  datasets: DatasetTransferFile[]
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Dataset transfer is only available in the browser.");
  }

  validateDatasets(datasets);

  const id = createTransferId();

  const payload: DatasetTransferPayload = {
    id,
    createdAt: Date.now(),
    datasets: datasets.map((dataset) => ({ ...dataset })),
  };

  try {
    window.sessionStorage.setItem(
      `${STORAGE_PREFIX}${id}`,
      JSON.stringify(payload)
    );
  } catch {
    throw new Error(
      "Could not store the selected datasets in this browser session. " +
        "The files may exceed available browser storage."
    );
  }

  return id;
}

/**
 * Retrieves a transfer created in this browser tab's session.
 * A transfer is removed after it is read or expires.
 */
export async function consumeDatasetTransfer(
  id: string
): Promise<DatasetTransferFile[] | null> {
  if (typeof window === "undefined" || !id) {
    return null;
  }

  const key = `${STORAGE_PREFIX}${id}`;
  const stored = window.sessionStorage.getItem(key);

  if (!stored) {
    return null;
  }

  // Treat transfer IDs as one-time tokens.
  window.sessionStorage.removeItem(key);

  try {
    const payload = JSON.parse(stored) as DatasetTransferPayload;

    if (
      payload.id !== id ||
      !Number.isFinite(payload.createdAt) ||
      Date.now() - payload.createdAt > MAX_TRANSFER_AGE_MS ||
      !Array.isArray(payload.datasets)
    ) {
      return null;
    }

    validateDatasets(payload.datasets);

    return payload.datasets.map((dataset) => ({ ...dataset }));
  } catch {
    return null;
  }
}
