
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import ArticleCard from "@/components/blog/ArticleCard";

import { DEMO_ARTICLES } from "@/lib/blog/demo-data";
import {
  BLOG_TOPICS,
  getCategoriesForTopic,
} from "@/lib/blog/topics";

import styles from "./topic-page.module.css";

interface TopicPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_TOPICS.map((topic) => ({
    slug: topic.slug,
  }));
}

export default async function TopicPage({
  params,
}: TopicPageProps) {
  const { slug } = await params;

  const topic = BLOG_TOPICS.find(
    (item) => item.slug === slug
  );

  if (!topic) {
    notFound();
  }

  const categories = getCategoriesForTopic(topic);

  const relatedArticles = DEMO_ARTICLES.filter((article) => {
    const articleCategorySlugs = article.categories.map(
      (category) => category.slug
    );

    const matchesTopic = articleCategorySlugs.includes(topic.slug);

    const matchesCategory = articleCategorySlugs.some((categorySlug) =>
      topic.categorySlugs.includes(categorySlug)
    );

    return matchesTopic || matchesCategory;
  });

  return (
    <main className={styles.page}>
      <BlogHeader />

      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/blog">Discover</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog/topics">Topics</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{topic.name}</span>
        </nav>

        <header className={styles.topicHeader}>
          <div className={styles.headerContent}>
            <span className={styles.eyebrow}>
              HACKERSHARBOR JOURNAL / TOPIC
            </span>

            <h1>{topic.name}</h1>

            <p className={styles.description}>
              {topic.description}
            </p>

            <div className={styles.topicMeta}>
              <span>
                {categories.length}{" "}
                {categories.length === 1
                  ? "subject area"
                  : "subject areas"}
              </span>

              <span aria-hidden="true">·</span>

              <span>
                {relatedArticles.length}{" "}
                {relatedArticles.length === 1
                  ? "related article"
                  : "related articles"}
              </span>
            </div>
          </div>

          <div
            className={styles.headerDecoration}
            aria-hidden="true"
          >
            <span className={styles.decorationCircle} />
            <span className={styles.decorationLine} />
            <span className={styles.decorationText}>
              EXPLORE / LEARN / BUILD
            </span>
          </div>
        </header>

        <section className={styles.subjectSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                RELATED SUBJECT AREAS
              </span>
              <h2>Explore connected fields</h2>
            </div>
          </div>

          <div className={styles.subjectList}>
            {categories.map((category) => (
              <div
                key={category.id}
                className={styles.subjectItem}
              >
                <span className={styles.subjectName}>
                  {category.name}
                </span>
                <span className={styles.subjectDescription}>
                  {category.description}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.articlesSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                JOURNAL COLLECTION
              </span>
              <h2>Articles about {topic.name}</h2>
            </div>

            <Link
              href="/blog"
              className={styles.backLink}
            >
              All articles
            </Link>
          </div>

          {relatedArticles.length > 0 ? (
            <div className={styles.articleGrid}>
              {relatedArticles.map((article, index) => (
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

              <h3>Articles are coming soon</h3>

              <p>
                We haven't published an article specifically
                related to {topic.name} yet. Check back as the
                Journal grows.
              </p>

              <Link href="/blog">
                Explore all articles
              </Link>
            </div>
          )}
        </section>

        <section className={styles.directoryLink}>
          <div>
            <span className={styles.sectionEyebrow}>
              KEEP EXPLORING
            </span>
            <h2>Discover another subject</h2>
            <p>
              Browse the full HackersHarbor knowledge directory
              and find another topic to explore.
            </p>
          </div>

          <Link href="/blog/topics">
            Explore all topics
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>

      <BlogFooter />
    </main>
  );
}
