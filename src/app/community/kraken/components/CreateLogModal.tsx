
"use client";

import { useState } from "react";
import CreateLogEditor from "./CreateLogEditor";
import { KrakenService } from "../services/KrakenService";
import { Database, Trophy, X } from "lucide-react";
import styles from "../styles/ship-logs.module.css";
import type {
  KrakenEntry,
  KrakenContentType,
} from "../types/kraken";

type CreateLogModalProps = {
  onClose: () => void;
  onCreated: (entry: KrakenEntry) => void;
};

const contentOptions: {
  value: KrakenContentType;
  label: string;
  description: string;
  icon: typeof Database;
}[] = [
  {
    value: "dataset",
    label: "Dataset",
    description:
      "Share a dataset others can explore and learn from.",
    icon: Database,
  },
  {
    value: "challenge",
    label: "Challenge",
    description:
      "Create a data challenge with a clear objective.",
    icon: Trophy,
  },
];

type CreateLogStep = "details" | "editor";

const krakenService = new KrakenService();

export default function CreateLogModal({
  onClose,
  onCreated,
}: CreateLogModalProps) {
  const [step, setStep] =
    useState<CreateLogStep>("details");

  const [selectedType, setSelectedType] =
    useState<KrakenContentType | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const canContinue =
    selectedType !== null &&
    title.trim().length > 0 &&
    description.trim().length > 0;

  if (step === "editor" && selectedType !== null) {
    return (
      <div
        className={styles.modalOverlay}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <CreateLogEditor
          logType={selectedType}
          title={title.trim()}
          description={description.trim()}
          onBack={() => setStep("details")}
          onPublish={(content, tags) => {
            const createdEntry = krakenService.create({
              type: selectedType,
              title: title.trim(),
              description: description.trim(),
              content,
              tags,
            });

            onCreated(createdEntry);
            onClose();
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={styles.modalOverlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={styles.createModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-kraken-title"
      >
        <header className={styles.modalHeader}>
          <div>
            <span className={styles.modalEyebrow}>
              KRAKEN DATA LAB
            </span>

            <h2 id="create-kraken-title">
              Publish to Kraken
            </h2>

            <p>
              Share datasets and challenges with the
              HackersHarbor community.
            </p>
          </div>

          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close publishing dialog"
          >
            <X size={19} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.modalField}>
            <label>
              What are you publishing?
            </label>

            <div className={styles.logTypeGrid}>
              {contentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected =
                  selectedType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.logTypeOption} ${
                      isSelected
                        ? styles.logTypeOptionSelected
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedType(option.value)
                    }
                    aria-pressed={isSelected}
                  >
                    <span
                      className={styles.logTypeOptionIcon}
                    >
                      <Icon size={17} />
                    </span>

                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.modalField}>
            <label htmlFor="kraken-entry-title">
              Title
            </label>

            <input
              id="kraken-entry-title"
              className={styles.modalInput}
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Give your dataset or challenge a clear title"
              maxLength={160}
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="kraken-entry-description">
              Description
            </label>

            <textarea
              id="kraken-entry-description"
              className={styles.modalTextarea}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the dataset or challenge objective..."
              rows={4}
              maxLength={1000}
            />
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <button
            type="button"
            className={styles.modalCancel}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.modalPublish}
            disabled={!canContinue}
            onClick={() => setStep("editor")}
          >
            Continue
          </button>
        </footer>
      </section>
    </div>
  );
}
