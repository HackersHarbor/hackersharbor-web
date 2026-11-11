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
import KrakenDetail from "./KrakenDetail";
import { useKraken } from "../hooks/useKraken";
import { contentTypes } from "../constants/navigation";
import {
  peopleToLearnFrom,
  trendingTopics,
} from "../data/kraken";
import type {
  KrakenEntry,
  KrakenContentType,
} from "../types/kraken";
import styles from "../styles/ship-logs.module.css";
type KrakenContentProps = {
  query: string;
  activeType: string;
  onTypeChange: (value: string) => void;
  onCreateLog: () => void;
  createdLogs: KrakenEntry[];
};
const typeLabels: Record<KrakenContentType, string> = {
  dataset: "Dataset",
  challenge: "Challenge",
};
const typeLetters: Record<KrakenContentType, string> = {
  dataset: "D",
  challenge: "C",
};
const typeClassNames: Record<KrakenContentType, string> = {
  dataset: styles.typeNotebook,
  challenge: styles.typeProject,
};
function LogCard({
  log,
  compact = false,
  onOpen,
}: {
  log: KrakenEntry;
  compact?: boolean;
  onOpen?: (log: KrakenEntry) => void;
}) {
  const [isSaved, setIsSaved] = useState(false);

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
        <div className={styles.entryFacts} aria-label="Entry details">
          <span className={styles.difficultyBadge} data-difficulty={log.difficulty}>
            {log.difficulty}
          </span>
          {log.type === "dataset" ? (
            <>
              <span className={styles.factPill}>{log.format}</span>
              <span className={styles.factPill}>{log.size}</span>
              <span className={styles.factPill}>
                {log.recordCount.toLocaleString()} records
              </span>
            </>
          ) : (
            <>
              <span className={styles.factPill}>{log.taskType.replaceAll("-", " ")}</span>
              {log.evaluationMetric ? (
                <span className={styles.factPill}>Metric: {log.evaluationMetric}</span>
              ) : null}
            </>
          )}
        </div>
        {log.type === "dataset" ? (
          <div className={styles.trustNote}>
            <span className={styles.sampleIndicator} aria-hidden="true" />
            <span>
              {log.source?.toLowerCase().includes("sample")
                ? "Sample listing"
                : log.source
                  ? `Source: ${log.source}`
                  : "Source details unavailable"}
            </span>
            <span aria-hidden="true">·</span>
            <span>License not specified</span>
          </div>
        ) : null}
        <div className={styles.logMeta}>
          <span className={styles.authorAvatar} aria-hidden="true">
            {log.authorInitial}
          </span>
          <strong>{log.author}</strong>
          <span aria-hidden="true">·</span>
          <span>{log.publishedLabel}</span>
        </div>
        <div className={styles.logTags} aria-label="Tags">
          {log.tags.slice(0, compact ? 3 : 5).map((tag) => (
            <span className={styles.tag} key={tag}>
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
          aria-pressed={isSaved}
          onClick={(event) => {
            event.stopPropagation();
            setIsSaved((saved) => !saved);
          }}
        >
          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
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
  logs: KrakenEntry[];
  icon: ReactNode;
  onOpen: (log: KrakenEntry) => void;
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
  logs: KrakenEntry[],
  activeType: string,
): KrakenEntry[] {
  if (activeType === "All Datasets & Challenges") return logs;
  const typeMap: Record<string, KrakenContentType> = {
    Datasets: "dataset",
    Challenges: "challenge",
  };
  const selectedType = typeMap[activeType];
  if (!selectedType) return logs;
  return logs.filter((log) => log.type === selectedType);
}
export default function KrakenContent({
  query,
  activeType,
  onTypeChange,
  onCreateLog,
  createdLogs,
}: KrakenContentProps) {
  const [selectedLog, setSelectedLog] =
    useState<KrakenEntry | null>(null);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const data = useKraken(query);
  const allLogs = [
    ...createdLogs,
    ...data.featured,
    ...data.dataScience,
    ...data.softwareEngineering,
    ...data.recent,
  ];
  const uniqueEntries = Array.from(
    new Map(allLogs.map((entry) => [entry.id, entry])).values(),
  );
  const contributorCount = new Set(uniqueEntries.map((entry) => entry.author)).size;
  const discussionCount = uniqueEntries.reduce((total, entry) => total + entry.replies, 0);
  const filteredLogs = filterByType(
    allLogs,
    activeType,
  );
  if (selectedLog) {
    return (
      <KrakenDetail
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
  <h1 className={styles.krakenTitle}>
    <span className={styles.krakenTitleAccent}>
      Kraken
    </span>
  </h1>
  <span className={styles.eyebrow}>
    HACKERSHARBOR / DATA LAB
  </span>
  <p>
    Crack the data. Discover the unknown. Explore datasets,
    take on challenges, build models, and share discoveries.
  </p>
</div>
  <div className={styles.heroActions}>
    <div className={styles.stat}>
      <strong>{uniqueEntries.length.toLocaleString()}</strong>
      <span>Datasets &amp; Challenges</span>
    </div>
    <div className={styles.stat}>
      <strong>{contributorCount.toLocaleString()}</strong>
      <span>Contributors</span>
    </div>
    <div className={styles.stat}>
      <strong>{discussionCount.toLocaleString()}</strong>
      <span>Replies</span>
    </div>
    <button
      className={styles.createButton}
      type="button"
      onClick={onCreateLog}
    >
      <Plus size={17} />
      Publish
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
                Matching datasets and challenges across the
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
                <strong>No matching datasets or challenges</strong>
                <span>Try a different title, topic, tag, or author.</span>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {activeType !== "All Datasets & Challenges" ? (
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
                    Datasets and challenges matching the
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
                    <strong>No entries in this view yet</strong>
                    <span>Try another content type or publish the first entry.</span>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              <Section
                title="Featured Datasets & Challenges"
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
                    ◆
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
                          <div className={styles.authorInfo}>
                            <strong>{author.name}</strong>
                            <span>{author.specialty}</span>
                            <small>{author.logs} contributions</small>
                          </div>
                          <button
                            type="button"
                            className={
                              followedAuthors.includes(author.name)
                                ? styles.followButtonActive
                                : styles.followButton
                            }
                            aria-pressed={followedAuthors.includes(author.name)}
                            onClick={() => {
                              setFollowedAuthors((current) =>
                                current.includes(author.name)
                                  ? current.filter((name) => name !== author.name)
                                  : [...current, author.name],
                              );
                            }}
                          >
                            {followedAuthors.includes(author.name) ? "Following" : "Follow"}
                          </button>
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
