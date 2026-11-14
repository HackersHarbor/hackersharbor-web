
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import type {
  BlogTopic,
  BlogTopicCategory,
} from "@/features/blog/domain/types";
import styles from "./topic-directory.module.css";

interface TopicDirectoryClientProps {
  categories: BlogTopicCategory[];
  topics: BlogTopic[];
}

export default function TopicDirectoryClient({
  categories,
  topics,
}: TopicDirectoryClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTopics = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return topics.filter((topic) => {
      const matchesCategory =
        activeCategory === "all" ||
        topic.categorySlugs.includes(activeCategory);

      const searchableText = [
        topic.name,
        topic.slug,
        topic.description,
        ...topic.keywords,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [topics, search, activeCategory]);

  return (
    <div className={styles.directoryContent}>
      <div className={styles.controls}>
        <label className={styles.searchBox}>
          <Search size={17} aria-hidden="true" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Python, machine learning, databases..."
            aria-label="Search topics"
          />

          {search && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </label>

        <span
          className={styles.resultCount}
          aria-live="polite"
        >
          {filteredTopics.length}{" "}
          {filteredTopics.length === 1 ? "result" : "results"}
        </span>
      </div>

      <div
        className={styles.filters}
        aria-label="Filter by subject area"
      >
        <button
          type="button"
          className={
            activeCategory === "all"
              ? `${styles.filterButton} ${styles.filterActive}`
              : styles.filterButton
          }
          onClick={() => setActiveCategory("all")}
          aria-pressed={activeCategory === "all"}
        >
          All topics
        </button>

        {categories.map((category) => {
          const active = activeCategory === category.slug;

          return (
            <button
              key={category.id}
              type="button"
              className={
                active
                  ? `${styles.filterButton} ${styles.filterActive}`
                  : styles.filterButton
              }
              onClick={() => setActiveCategory(category.slug)}
              aria-pressed={active}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {filteredTopics.length > 0 ? (
        <div className={styles.topicGrid}>
          {filteredTopics.map((topic) => (
            <Link
              href={`/blog/topics/${topic.slug}`}
              key={topic.id}
              className={styles.topicCard}
            >
              <div className={styles.cardTop}>
                <span className={styles.topicType}>
                  TOPIC
                </span>

                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />
              </div>

              <h3>{topic.name}</h3>

              <p>{topic.description}</p>

              <div className={styles.cardBottom}>
                <span>
                  {topic.categorySlugs.length}{" "}
                  {topic.categorySlugs.length === 1
                    ? "subject area"
                    : "subject areas"}
                </span>

                <span className={styles.cardArrow}>
                  Explore topic
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyEyebrow}>
            NO MATCHES FOUND
          </span>

          <h3>We couldn't find that topic.</h3>

          <p>
            Try another search term or select a different subject area.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
