import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { ArticleSummary } from "@/features/blog/domain/types";
import { formatArticleDate } from "@/lib/blog/utils";
import styles from "./blog-components.module.css";

interface ArticleCardProps {
  article: ArticleSummary;
  index?: number;
}

export default function ArticleCard({
  article,
  index = 0,
}: ArticleCardProps) {
  const category = article.categories[0];

  return (
    <article className={styles.articleCard}>
      <Link
        href={`/blog/${article.slug}`}
        className={styles.articleImage}
        aria-label={`Read ${article.title}`}
      >
        <div className={styles.articleImagePattern}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>H / H</span>
        </div>
        <span className={styles.imageArrow}>
          <ArrowUpRight size={19} />
        </span>
      </Link>

      <div className={styles.articleDetails}>
        <div className={styles.articleCategory}>
          {category?.name ?? "Technology"}
        </div>

        <h3>
          <Link href={`/blog/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        <p className={styles.articleExcerpt}>{article.excerpt}</p>

        <div className={styles.articleFooter}>
          <span>{article.author?.name ?? "HackersHarbor"}</span>
          <span className={styles.articleReading}>
            <Clock3 size={13} />
            {article.readingTime} min
          </span>
          <span>{formatArticleDate(article.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}
