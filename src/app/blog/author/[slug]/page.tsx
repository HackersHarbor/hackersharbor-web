
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import ArticleCard from "@/components/blog/ArticleCard";

import { DEMO_ARTICLES } from "@/lib/blog/demo-data";
import type { BlogAuthor } from "@/features/blog/domain/types";

import styles from "./author-page.module.css";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

function getAuthors(): BlogAuthor[] {
  const authors = new Map<string, BlogAuthor>();

  for (const article of DEMO_ARTICLES) {
    const author = article.author;

    if (!authors.has(author.slug)) {
      authors.set(author.slug, author);
    } else {
      const existing = authors.get(author.slug)!;

      if (!existing.bio && author.bio) {
        authors.set(author.slug, {
          ...existing,
          bio: author.bio,
        });
      }
    }
  }

  return Array.from(authors.values());
}

export function generateStaticParams() {
  return getAuthors().map((author) => ({
    slug: author.slug,
  }));
}

export default async function AuthorPage({
  params,
}: AuthorPageProps) {
  const { slug } = await params;

  const author = getAuthors().find(
    (item) => item.slug === slug
  );

  if (!author) {
    notFound();
  }

  const articles = DEMO_ARTICLES.filter(
    (article) => article.author.slug === author.slug
  ).sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() -
      new Date(a.publishedAt).getTime()
  );

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
          <span>Authors</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{author.name}</span>
        </nav>

        <header className={styles.authorHeader}>
          <div className={styles.authorIdentity}>
            <div className={styles.avatar}>
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt={`${author.name} profile`}
                />
              ) : (
                <span>
                  {author.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>

            <div className={styles.authorDetails}>
              <span className={styles.eyebrow}>
                HACKERSHARBOR JOURNAL / AUTHOR
              </span>

              <h1>{author.name}</h1>

              <p className={styles.bio}>
                {author.bio ||
                  "Contributor to the HackersHarbor Journal, sharing technical knowledge, practical insights, and engineering perspectives."}
              </p>

              <div className={styles.authorStats}>
                <span>
                  {articles.length.toString().padStart(2, "0")}
                </span>

                <span>
                  {articles.length === 1
                    ? "PUBLISHED ARTICLE"
                    : "PUBLISHED ARTICLES"}
                </span>
              </div>
            </div>
          </div>

          <div
            className={styles.headerDecoration}
            aria-hidden="true"
          >
            <span className={styles.decorationCircle} />
            <span className={styles.decorationLine} />
            <span className={styles.decorationText}>
              KNOWLEDGE / RESEARCH / ENGINEERING
            </span>
          </div>
        </header>

        <section className={styles.articlesSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                AUTHOR COLLECTION
              </span>

              <h2>Articles by {author.name}</h2>

              <p>
                Explore the articles and insights published by
                this contributor.
              </p>
            </div>

            <Link href="/blog" className={styles.backLink}>
              All articles
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
              <h3>No published articles yet</h3>

              <p>
                Articles from this author will appear here
                when they are published.
              </p>

              <Link href="/blog">
                Explore the Journal
              </Link>
            </div>
          )}
        </section>

        <section className={styles.exploreSection}>
          <div>
            <span className={styles.sectionEyebrow}>
              KEEP EXPLORING
            </span>

            <h2>Discover more from the Journal</h2>

            <p>
              Explore more technical articles, research,
              programming insights, and engineering ideas.
            </p>
          </div>

          <Link href="/blog">
            Explore all articles
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </div>

      <BlogFooter />
    </main>
  );
}
