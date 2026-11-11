import Link from "next/link";
import { notFound } from "next/navigation";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import ArticleCard from "@/components/blog/ArticleCard";

import {
  DEMO_ARTICLES,
  DEMO_CATEGORIES,
} from "@/lib/blog/demo-data";

import styles from "./category-page.module.css";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEMO_CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const category = DEMO_CATEGORIES.find(
    (item) => item.slug === slug
  );

  if (!category) {
    notFound();
  }

  const articles = DEMO_ARTICLES.filter((article) =>
    article.categories.some(
      (item) => item.slug === category.slug
    )
  );

  return (
    <main className={styles.page}>
      <BlogHeader />

      <section className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label="Breadcrumb"
        >
          <Link href="/blog">Blog</Link>
          <span aria-hidden="true">/</span>
          <span>{category.name}</span>
        </nav>

        <header className={styles.categoryHeader}>
          <div className={styles.headerContent}>
            <span className={styles.eyebrow}>
              HACKERSHARBOR JOURNAL
            </span>

            <h1>{category.name}</h1>

            <p className={styles.description}>
              {category.description ||
                `Explore articles, practical insights, and technical perspectives about ${category.name}.`}
            </p>

            <div className={styles.categoryStats}>
              <span className={styles.count}>
                {articles.length.toString().padStart(2, "0")}
              </span>

              <span className={styles.countLabel}>
                {articles.length === 1 ? "ARTICLE" : "ARTICLES"}
              </span>
            </div>
          </div>

          <div className={styles.headerDecoration} aria-hidden="true">
            <span className={styles.decorationCircle} />
            <span className={styles.decorationLine} />
            <span className={styles.decorationText}>
              EXPLORE / LEARN / BUILD
            </span>
          </div>
        </header>

        <section className={styles.articlesSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                CATEGORY COLLECTION
              </span>
              <h2>Articles in {category.name}</h2>
            </div>

            <Link href="/blog" className={styles.backLink}>
              ← All articles
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className={styles.articleGrid}>
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyMark}>—</span>
              <h3>No articles in this category yet</h3>
              <p>
                New articles will appear here when they are
                published in this category.
              </p>
              <Link href="/blog">
                Explore all articles →
              </Link>
            </div>
          )}
        </section>

        <section className={styles.exploreSection}>
          <div>
            <span className={styles.sectionEyebrow}>
              DISCOVER MORE
            </span>
            <h2>Explore other topics</h2>
            <p>
              Browse the other areas of the HackersHarbor journal.
            </p>
          </div>

          <div className={styles.categoryLinks}>
            {DEMO_CATEGORIES
              .filter((item) => item.slug !== category.slug)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/category/${item.slug}`}
                  className={styles.categoryLink}
                >
                  <span>{item.name}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              ))}
          </div>
        </section>
      </section>

      <BlogFooter />
    </main>
  );
}
