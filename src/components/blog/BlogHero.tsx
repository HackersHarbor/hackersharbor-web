import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import type { ArticleSummary } from "@/features/blog/domain/types";
import { formatArticleDate } from "@/lib/blog/utils";
import styles from "./blog-components.module.css";

interface BlogHeroProps {
  article: ArticleSummary;
}

export default function BlogHero({ article }: BlogHeroProps) {
  const category = article.categories[0];

  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>
          <span className={styles.statusDot} />
          THE HACKERSHARBOR JOURNAL
        </span>

        <h1>
          Ideas that move
          <br />
          <span>technology forward.</span>
        </h1>

        <p className={styles.heroDescription}>
          Thoughtful perspectives, practical engineering knowledge
          and ideas shaping the next generation of technology.
        </p>

        <div className={styles.heroActions}>
          <Link href={`/blog/${article.slug}`} className={styles.primaryButton}>
            Explore featured story <ArrowRight size={17} />
          </Link>
          <Link href="#latest" className={styles.secondaryButton}>
            Browse articles
          </Link>
        </div>
      </div>

      <div className={styles.featuredVisual}>
        <div className={styles.visualGrid} />
        <div className={styles.visualContent}>
          <span className={styles.visualLabel}>FEATURED STORY</span>
          <div className={styles.visualSymbol}>{"{ }"}</div>
          <div className={styles.visualBottom}>
            <span>ENGINEERING / TECHNOLOGY</span>
            <span>HH — 001</span>
          </div>
        </div>
      </div>

      <div className={styles.heroMeta}>
        <span>FEATURED ARTICLE</span>
        <span>{category?.name ?? "Technology"}</span>
        <span><Clock3 size={13} /> {article.readingTime} min read</span>
        <span>{formatArticleDate(article.publishedAt)}</span>
      </div>
    </section>
  );
}
