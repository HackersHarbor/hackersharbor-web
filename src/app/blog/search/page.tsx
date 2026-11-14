
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, ArrowUpRight } from "lucide-react";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import ArticleCard from "@/components/blog/ArticleCard";

import { DEMO_ARTICLES } from "@/lib/blog/demo-data";

import styles from "./search-page.module.css";

export default function BlogSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    if (!normalizedQuery) {
      return DEMO_ARTICLES;
    }

    return DEMO_ARTICLES.filter((article) => {
      const searchableContent = [
        article.title,
        article.excerpt,
        article.author.name,
        ...article.categories.map((category) => category.name),
        ...article.categories.map((category) => category.slug),
      ]
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  function clearSearch() {
    setSearchQuery("");
  }

  return (
    <main className={styles.page}>
      <BlogHeader />

      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label="Breadcrumb"
        >
          <Link href="/blog">Discover</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Search</span>
        </nav>

        <header className={styles.searchHeader}>
          <span className={styles.eyebrow}>
            HACKERSHARBOR JOURNAL
          </span>

          <h1>Find something worth exploring.</h1>

          <p>
            Search the Journal for programming insights, data
            engineering, technology, and practical knowledge.
          </p>

          <div className={styles.searchBox}>
            <Search
              size={21}
              className={styles.searchIcon}
              aria-hidden="true"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search articles, authors, or categories..."
              aria-label="Search Journal articles"
              autoComplete="off"
            />

            {searchQuery && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className={styles.searchHint}>
            <span>
              {normalizedQuery
                ? `Searching for "${searchQuery.trim()}"`
                : "Explore all published articles"}
            </span>

            <span className={styles.resultCount}>
              {filteredArticles.length}{" "}
              {filteredArticles.length === 1
                ? "result"
                : "results"}
            </span>
          </div>
        </header>

        <section className={styles.resultsSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                JOURNAL COLLECTION
              </span>

              <h2>
                {normalizedQuery
                  ? "Search results"
                  : "All articles"}
              </h2>
            </div>

            {normalizedQuery && (
              <button
                type="button"
                className={styles.resetButton}
                onClick={clearSearch}
              >
                Clear search
                <X size={14} />
              </button>
            )}
          </div>

          {filteredArticles.length > 0 ? (
            <div className={styles.articleGrid}>
              {filteredArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Search size={23} />
              </div>

              <h3>No matching articles found</h3>

              <p>
                We couldn't find any articles matching{" "}
                <strong>"{searchQuery.trim()}"</strong>.
                Try another keyword, author name, or category.
              </p>

              <button
                type="button"
                onClick={clearSearch}
              >
                View all articles
                <ArrowUpRight size={15} />
              </button>
            </div>
          )}
        </section>

        <section className={styles.exploreSection}>
          <div>
            <span className={styles.sectionEyebrow}>
              EXPLORE THE JOURNAL
            </span>

            <h2>Prefer browsing by subject?</h2>

            <p>
              Explore our topic directory to discover areas
              of technology and engineering.
            </p>
          </div>

          <Link href="/blog/topics">
            Browse all topics
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      <BlogFooter />
    </main>
  );
}
