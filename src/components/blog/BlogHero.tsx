
import type { CSSProperties } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";

import type { ArticleSummary } from "@/features/blog/domain/types";
import { formatArticleDate } from "@/lib/blog/utils";

import styles from "./blog-hero.module.css";

interface BlogHeroProps {
  article: ArticleSummary;
}

/* Category accents for the HackersHarbor Journal. */
const CATEGORY_STYLE: Record<
  string,
  { color: string; glyph: string }
> = {
  python: { color: "#D99A00", glyph: "py" },
  sql: { color: "#0F9A9A", glyph: "SQL" },
  "artificial intelligence": {
    color: "#557C65",
    glyph: "AI",
  },
  "data engineering": {
    color: "#26734D",
    glyph: "ETL",
  },
  programming: {
    color: "#E0662B",
    glyph: "{ }",
  },
  cybersecurity: {
    color: "#E5484D",
    glyph: "sec",
  },
  "web development": {
    color: "#2E9E5B",
    glyph: "</>",
  },
};

const FALLBACK = {
  color: "#26734D",
  glyph: "{ }",
};

export default function BlogHero({
  article,
}: BlogHeroProps) {
  const category = article.categories[0];

  const look =
    CATEGORY_STYLE[category?.name?.toLowerCase() ?? ""] ??
    FALLBACK;

  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.journalName}>
          The HackersHarbor Journal
        </span>

        <h1 className={styles.heroTitle}>
          Practical data engineering and AI, written by people who build it.
        </h1>

        <p className={styles.heroDescription}>
          Explore hands-on engineering insights, practical tutorials,
          and real-world perspectives on data, software development,
          cybersecurity, and artificial intelligence.
        </p>

        <div className={styles.heroActions}>
          <Link
            href={`/blog/${article.slug}`}
            className={styles.primaryButton}
          >
            Read the featured story
          </Link>

          <Link
            href="#latest"
            className={styles.secondaryButton}
          >
            Browse articles
          </Link>
        </div>
      </div>

      <Link
        href={`/blog/${article.slug}`}
        className={styles.featuredCard}
        style={
          { "--cat": look.color } as CSSProperties
        }
      >
        <div className={styles.cover}>
          {article.coverImage ? (
            <img
              className={styles.coverImage}
              src={article.coverImage}
              alt={`Cover for ${article.title}`}
            />
          ) : (
            <>
              <div
                className={styles.coverGrid}
                aria-hidden="true"
              />

              <span className={styles.coverGlyph}>
                {look.glyph}
              </span>
            </>
          )}
        </div>

        <div className={styles.featuredBody}>
          <span className={styles.featuredCategory}>
            {category?.name ?? "Technology"}
          </span>

          <h2 className={styles.featuredTitle}>
            {article.title}
          </h2>

          {article.excerpt ? (
            <p className={styles.featuredExcerpt}>
              {article.excerpt}
            </p>
          ) : null}

          <div className={styles.featuredMeta}>
            <span>
              <Clock3
                size={14}
                aria-hidden="true"
              />
              {article.readingTime} min read
            </span>

            <span>
              {formatArticleDate(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
