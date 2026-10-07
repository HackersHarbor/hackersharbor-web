"use client";

import { useState } from "react";

import {
  ArrowRight,
  Bookmark,
  Eye,
  MessageCircle,
  Plus,
  Sparkles,
  ThumbsUp,
} from "lucide-react";

import type { ReactNode } from "react";

import ShipLogDetail from "./ShipLogDetail";

import { useShipLogs } from "../hooks/useShipLogs";
import { contentTypes } from "../constants/navigation";

import {
  peopleToLearnFrom,
  trendingTopics,
} from "../data/shipLogs";

import type {
  ShipLog,
  ShipLogType,
} from "../types/shipLog";

import styles from "../styles/ship-logs.module.css";

type ShipLogsContentProps = {
  query: string;
  activeType: string;
  onTypeChange: (value: string) => void;
  onCreateLog: () => void;
  createdLogs: ShipLog[];
};

const typeLabels: Record<
  ShipLogType,
  string
> = {
  notebook: "Notebook",
  project: "Project",
  tutorial: "Tutorial",
  discussion: "Discussion",
  experiment: "Experiment",
  "code-snippet": "Code Snippet",
};

const typeLetters: Record<
  ShipLogType,
  string
> = {
  notebook: "N",
  project: "P",
  tutorial: "T",
  discussion: "D",
  experiment: "E",
  "code-snippet": "C",
};

const typeClassNames: Record<
  ShipLogType,
  string
> = {
  notebook: styles.typeNotebook,
  project: styles.typeProject,
  tutorial: styles.typeTutorial,
  discussion: styles.typeDiscussion,
  experiment: styles.typeExperiment,
  "code-snippet":
    styles.typeCodeSnippet,
};

function LogCard({
  log,
  compact = false,
  onOpen,
}: {
  log: ShipLog;
  compact?: boolean;
  onOpen?: (log: ShipLog) => void;
}) {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (
      onOpen &&
      (event.key === "Enter" ||
        event.key === " ")
    ) {
      event.preventDefault();
      onOpen(log);
    }
  };

  return (
    <article
      className={`${styles.logCard} ${
        compact ? styles.logCardCompact : ""
      }`}
      onClick={() => onOpen?.(log)}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`${styles.typeIcon} ${
          typeClassNames[log.type]
        }`}
      >
        {typeLetters[log.type]}
      </div>

      <div className={styles.logMain}>
        <div className={styles.logType}>
          {typeLabels[log.type]}
        </div>

        <h3>{log.title}</h3>

        <p>{log.description}</p>

        <div className={styles.logMeta}>
          <span
            className={styles.authorAvatar}
          >
            {log.authorInitial}
          </span>

          <strong>{log.author}</strong>

          <span>·</span>

          <span>{log.publishedLabel}</span>

          {log.tags
            .slice(0, compact ? 3 : 5)
            .map((tag) => (
              <span
                className={styles.tag}
                key={tag}
              >
                {tag}
              </span>
            ))}
        </div>
      </div>

      <div className={styles.logStats}>
        <button
          type="button"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <ThumbsUp size={15} />
          {log.signals}
        </button>

        <button
          type="button"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <MessageCircle size={15} />
          {log.replies}
        </button>

        <button
          type="button"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <Eye size={15} />
          {log.views}
        </button>

        <button
          type="button"
          aria-label={`Save ${log.title}`}
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <Bookmark size={16} />
        </button>
      </div>
    </article>
  );
}

function Section({
  title,
  description,
  logs,
  icon,
  onOpen,
}: {
  title: string;
  description: string;
  logs: ShipLog[];
  icon: ReactNode;
  onOpen: (log: ShipLog) => void;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <div
            className={
              styles.sectionTitleRow
            }
          >
            {icon}
            <h2>{title}</h2>
          </div>

          <p>{description}</p>
        </div>

        <button
          type="button"
          className={styles.seeAll}
        >
          See all
          <ArrowRight size={15} />
        </button>
      </div>

      <div className={styles.cardGrid}>
        {logs.map((log) => (
          <LogCard
            key={log.id}
            log={log}
            compact
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

function filterByType(
  logs: ShipLog[],
  activeType: string,
): ShipLog[] {
  if (activeType === "All Logs") {
    return logs;
  }

  const typeMap: Record<
    string,
    ShipLogType
  > = {
    Notebooks: "notebook",
    Projects: "project",
    Tutorials: "tutorial",
    Discussions: "discussion",
    Experiments: "experiment",
    "Code Snippets": "code-snippet",
  };

  const selectedType =
    typeMap[activeType];

  if (!selectedType) {
    return logs;
  }

  return logs.filter(
    (log) => log.type === selectedType,
  );
}

export default function ShipLogsContent({
  query,
  activeType,
  onTypeChange,
  onCreateLog,
  createdLogs,
}: ShipLogsContentProps) {
  const [selectedLog, setSelectedLog] =
    useState<ShipLog | null>(null);

  const data = useShipLogs(query);

  const allLogs = [
    ...createdLogs,
    ...data.featured,
    ...data.dataScience,
    ...data.softwareEngineering,
    ...data.recent,
  ];

  const filteredLogs = filterByType(
    allLogs,
    activeType,
  );

  if (selectedLog) {
    return (
      <ShipLogDetail
        log={selectedLog}
        onBack={() =>
          setSelectedLog(null)
        }
      />
    );
  }

  return (
    <section className={styles.content}>
      <div className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>
            SHIP LOGS
          </span>

          <h1>
            Build. Share. Learn. Together.
          </h1>

          <p>
            Notebooks, projects, tutorials and
            technical knowledge from the data
            science and software engineering
            community.
          </p>
        </div>

        <div className={styles.heroActions}>
          <div className={styles.stat}>
            <strong>12.4K</strong>
            <span>Logs</span>
          </div>

          <div className={styles.stat}>
            <strong>3.2K</strong>
            <span>Authors</span>
          </div>

          <div className={styles.stat}>
            <strong>48K</strong>
            <span>Discussions</span>
          </div>

          <button
            className={styles.createButton}
            type="button"
            onClick={onCreateLog}
          >
            <Plus size={17} />
            Create Log
          </button>
        </div>
      </div>

      <div className={styles.contentToolbar}>
        <div className={styles.typeTabs}>
          {contentTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={
                activeType === type
                  ? styles.typeTabActive
                  : styles.typeTab
              }
              onClick={() =>
                onTypeChange(type)
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {query ? (
        <section className={styles.section}>
          <div
            className={styles.sectionHeader}
          >
            <div>
              <div
                className={
                  styles.sectionTitleRow
                }
              >
                <Sparkles size={18} />
                <h2>Search Results</h2>
              </div>

              <p>
                Matching Ship Logs across the
                community.
              </p>
            </div>
          </div>

          <div className={styles.verticalList}>
            {data.searchResults.length >
            0 ? (
              data.searchResults.map(
                (log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                    onOpen={setSelectedLog}
                  />
                ),
              )
            ) : (
              <div
                className={
                  styles.emptyState
                }
              >
                No logs matched your search.
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {activeType !== "All Logs" ? (
            <section
              className={styles.section}
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <div>
                  <div
                    className={
                      styles.sectionTitleRow
                    }
                  >
                    <Sparkles size={18} />
                    <h2>{activeType}</h2>
                  </div>

                  <p>
                    Ship Logs matching the
                    selected content type.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.verticalList
                }
              >
                {filteredLogs.length >
                0 ? (
                  filteredLogs.map(
                    (log) => (
                      <LogCard
                        key={log.id}
                        log={log}
                        onOpen={
                          setSelectedLog
                        }
                      />
                    ),
                  )
                ) : (
                  <div
                    className={
                      styles.emptyState
                    }
                  >
                    No logs are available for
                    this content type yet.
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              <Section
                title="Featured Logs"
                description="Hand-picked technical work from the community."
                logs={data.featured}
                icon={
                  <Sparkles size={18} />
                }
                onOpen={setSelectedLog}
              />

              <Section
                title="Data Science"
                description="Machine learning, data analysis, deep learning, NLP and more."
                logs={data.dataScience}
                icon={
                  <span
                    className={
                      styles.sectionGlyph
                    }
                  >
                    ▥
                  </span>
                }
                onOpen={setSelectedLog}
              />

              <Section
                title="Software Engineering"
                description="Web development, system design, DevOps, cloud, databases and more."
                logs={
                  data.softwareEngineering
                }
                icon={
                  <span
                    className={
                      styles.sectionGlyph
                    }
                  >
                    ‹›
                  </span>
                }
                onOpen={setSelectedLog}
              />

              <Section
                title="Recently Published"
                description="The latest work from the community."
                logs={data.recent}
                icon={
                  <span
                    className={
                      styles.sectionGlyph
                    }
                  >
                    ◷
                  </span>
                }
                onOpen={setSelectedLog}
              />

              <section
                className={
                  styles.bottomDiscovery
                }
              >
                <div
                  className={
                    styles.discoveryPanel
                  }
                >
                  <div
                    className={
                      styles.panelHeader
                    }
                  >
                    <div>
                      <h2>
                        Trending This Week
                      </h2>

                      <p>
                        Topics developers and
                        data scientists are
                        exploring.
                      </p>
                    </div>

                    <button
                      type="button"
                      className={
                        styles.seeAll
                      }
                    >
                      See all
                      <ArrowRight
                        size={15}
                      />
                    </button>
                  </div>

                  <div
                    className={
                      styles.topicList
                    }
                  >
                    {trendingTopics.map(
                      (topic, index) => (
                        <div
                          className={
                            styles.topicRow
                          }
                          key={topic.label}
                        >
                          <span
                            className={
                              styles.rank
                            }
                          >
                            {index + 1}
                          </span>

                          <span>
                            {topic.label}
                          </span>

                          <strong>
                            {topic.count}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div
                  className={
                    styles.discoveryPanel
                  }
                >
                  <div
                    className={
                      styles.panelHeader
                    }
                  >
                    <div>
                      <h2>
                        People to Learn From
                      </h2>

                      <p>
                        Authors publishing
                        useful technical work.
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      styles.authorList
                    }
                  >
                    {peopleToLearnFrom.map(
                      (author) => (
                        <div
                          className={
                            styles.authorRow
                          }
                          key={author.name}
                        >
                          <span
                            className={
                              styles.largeAvatar
                            }
                          >
                            {author.initial}
                          </span>

                          <div>
                            <strong>
                              {author.name}
                            </strong>

                            <span>
                              {author.specialty}
                            </span>
                          </div>

                          <small>
                            {author.logs} logs
                          </small>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </section>
  );
}