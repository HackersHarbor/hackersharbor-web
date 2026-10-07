"use client";

import { useState } from "react";

import CreateLogEditor from "./CreateLogEditor";

import { ShipLogService } from "../services/ShipLogService";

import {
  BookOpen,
  Code2,
  FlaskConical,
  FolderKanban,
  MessageSquare,
  Play,
  X,
} from "lucide-react";

import styles from "../styles/ship-logs.module.css";

import type { ShipLog } from "../types/shipLog";

type CreateLogModalProps = {
  onClose: () => void;
  onCreated: (log: ShipLog) => void;
};

const logTypes = [
  {
    value: "notebook",
    label: "Notebook",
    description:
      "Share analysis, experiments and findings.",
    icon: BookOpen,
  },
  {
    value: "project",
    label: "Project",
    description:
      "Document something you are building.",
    icon: FolderKanban,
  },
  {
    value: "tutorial",
    label: "Tutorial",
    description:
      "Teach a concept or technical workflow.",
    icon: Play,
  },
  {
    value: "discussion",
    label: "Discussion",
    description:
      "Start a technical conversation.",
    icon: MessageSquare,
  },
  {
    value: "experiment",
    label: "Experiment",
    description:
      "Share an experiment and what you learned.",
    icon: FlaskConical,
  },
  {
    value: "code-snippet",
    label: "Code Snippet",
    description:
      "Share a useful piece of code.",
    icon: Code2,
  },
] as const;

type LogType = (typeof logTypes)[number]["value"];

type CreateLogStep = "details" | "editor";

const shipLogService = new ShipLogService();

export default function CreateLogModal({
  onClose,
  onCreated,
}: CreateLogModalProps) {
  const [step, setStep] =
    useState<CreateLogStep>("details");

  const [selectedType, setSelectedType] =
    useState<LogType | null>(null);

  const [title, setTitle] = useState("");

  const [description, setDescription] =
    useState("");

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
          title={title}
          description={description}
          onBack={() => setStep("details")}
          onPublish={(content, tags) => {
            const createdLog = shipLogService.create({
                type: selectedType,
                title,
                description,
                content,
                tags,
              });
              
              onCreated(createdLog);
              
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
        aria-labelledby="create-log-title"
      >
        <header className={styles.modalHeader}>
          <div>
            <span className={styles.modalEyebrow}>
              CREATE
            </span>

            <h2 id="create-log-title">
              Start a Ship Log
            </h2>

            <p>
              Share something useful with the
              HackersHarbor community.
            </p>
          </div>

          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close create log"
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
              {logTypes.map((logType) => {
                const Icon = logType.icon;

                const isSelected =
                  selectedType === logType.value;

                return (
                  <button
                    key={logType.value}
                    type="button"
                    className={`${styles.logTypeOption} ${
                      isSelected
                        ? styles.logTypeOptionSelected
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedType(
                        logType.value,
                      );
                    }}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={
                        styles.logTypeOptionIcon
                      }
                    >
                      <Icon size={17} />
                    </span>

                    <span>
                      <strong>
                        {logType.label}
                      </strong>

                      <small>
                        {logType.description}
                      </small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.modalField}>
            <label htmlFor="ship-log-title">
              Title
            </label>

            <input
              id="ship-log-title"
              className={styles.modalInput}
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Give your Ship Log a clear title"
            />
          </div>

          <div className={styles.modalField}>
            <label htmlFor="ship-log-description">
              Description
            </label>

            <textarea
              id="ship-log-description"
              className={styles.modalTextarea}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Briefly explain what this Ship Log is about..."
              rows={4}
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