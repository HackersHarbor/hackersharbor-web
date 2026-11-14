
import Link from "next/link";
import { ArrowUpRight, Clock3, CalendarDays } from "lucide-react";

import type { ArticleSummary } from "@/features/blog/domain/types";
import { formatArticleDate } from "@/lib/blog/utils";

import styles from "./blog-components.module.css";

interface ArticleCardProps {
  article: ArticleSummary;
  index?: number;
}

const CATEGORY_MARKS: Record<string, string> = {
  python: "Py",
  sql: "SQL",
  ai: "AI",
  "artificial-intelligence": "AI",
  "data-engineering": "DE",
  programming: "{ }",
  cybersecurity: "CS",
  "web-development": "</>",
};

function getAuthorInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function ArticleCard({
  article,
}: ArticleCardProps) {
  const category = article.categories[0];
  const categorySlug = category?.slug ?? "technology";
  const categoryName = category?.name ?? "Technology";

  const categoryMark =
    CATEGORY_MARKS[categorySlug] ?? "H";

  const authorName =
    article.author?.name ?? "HackersHarbor";

  const authorAvatar = article.author?.avatarUrl;

  return (
    <article
      className={styles.articleCard}
      data-category={categorySlug}
    >
      <Link
        href={`/blog/${article.slug}`}
        className={styles.articleImage}
        aria-label={`Read ${article.title}`}
      >
        <div className={styles.articleImagePattern}>
          <span className={styles.categoryMark}>
            {categoryMark}
          </span>

          <span className={styles.categoryCoverLabel}>
            {categoryName}
          </span>
        </div>

        <span className={styles.imageArrow} aria-hidden="true">
          <ArrowUpRight size={19} />
        </span>
      </Link>

      <div className={styles.articleDetails}>
        <span className={styles.articleCategory}>
          {categoryName}
        </span>

        <h3>
          <Link href={`/blog/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        <p className={styles.articleExcerpt}>
          {article.excerpt}
        </p>

        <div className={styles.articleFooter}>
          <div className={styles.articleAuthor}>
            {authorAvatar ? (
              <img
                className={styles.authorAvatar}
                src={authorAvatar}
                alt=""
                aria-hidden="true"
              />
            ) : (
              <span
                className={styles.authorInitials}
                aria-hidden="true"
              >
                {getAuthorInitials(authorName)}
              </span>
            )}

            <span className={styles.authorName}>
              {authorName}
            </span>
          </div>

          <div className={styles.articleMeta}>
            <span className={styles.articleReading}>
              <Clock3 size={13} aria-hidden="true" />
              {article.readingTime} min read
            </span>

            <span className={styles.articleDate}>
              <CalendarDays size={13} aria-hidden="true" />
              {formatArticleDate(article.publishedAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
