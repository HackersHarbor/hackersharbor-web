import Link from "next/link";
import { notFound } from "next/navigation";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import ArticleReadingContent from "@/components/blog/ArticleReadingContent";
import { DEMO_ARTICLES } from "@/lib/blog/demo-data";
import { ARTICLE_CONTENT } from "@/lib/blog/article-content";
import { formatArticleDate } from "@/lib/blog/utils";
import styles from "./article-page.module.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEMO_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  const article = DEMO_ARTICLES.find(
    (item) => item.slug === slug
  );

  const content = ARTICLE_CONTENT[slug];

  if (!article || !content) {
    notFound();
  }

  const relatedArticles = DEMO_ARTICLES
    .filter((item) => item.slug !== article.slug)
    .slice(0, 3);

  const primaryCategory = article.categories[0];

  return (
    <main className={styles.page}>
      <BlogHeader />

      <div className={styles.readingShell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/blog">Blog</Link>
          <span aria-hidden="true">/</span>
          <span>{article.title}</span>
        </nav>

        <header className={styles.articleHeader}>
          {primaryCategory && (
            <Link
              className={styles.category}
              href={`/blog/category/${primaryCategory.slug}`}
            >
              {primaryCategory.name}
            </Link>
          )}

          <h1>{article.title}</h1>
          <p className={styles.excerpt}>{article.excerpt}</p>

          <div className={styles.metadata}>
            <div className={styles.author}>
              {article.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.avatar}
                  src={article.author.avatarUrl}
                  alt=""
                />
              ) : (
                <span className={styles.avatarFallback}>
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
              )}

              <div className={styles.authorDetails}>
                <Link href={`/blog/author/${article.author.slug}`}>
                  {article.author.name}
                </Link>
                <span>Author</span>
              </div>
            </div>

            <span className={styles.metadataDivider} />

            <div className={styles.articleStats}>
              <span>{formatArticleDate(article.publishedAt)}</span>
              <span>{article.readingTime} min read</span>
            </div>
          </div>
        </header>

        <div
          className={styles.cover}
          role="img"
          aria-label={`Cover artwork for ${article.title}`}
        >
          <div className={styles.coverPattern} />
          <span className={styles.coverLabel}>HACKERSHARBOR / JOURNAL</span>
          <span className={styles.coverInitial}>
            {article.title.charAt(0)}
          </span>
        </div>

        <div className={styles.articleLayout}>
          <aside className={styles.articleAside}>
            <span className={styles.asideLabel}>IN THIS ARTICLE</span>
            <span className={styles.asideRule} />
            <span className={styles.asideReadingTime}>
              {article.readingTime} minute read
            </span>
            <Link href="/blog" className={styles.backLink}>
              ← Back to all articles
            </Link>
          </aside>

          <article className={styles.articleBody}>
            <ArticleReadingContent content={content} />

            <div className={styles.articleEnd}>
              <span />
              <span>End of article</span>
              <span />
            </div>

            <section className={styles.authorBio}>
              {article.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.author.avatarUrl}
                  alt=""
                  className={styles.bioAvatar}
                />
              ) : (
                <span className={styles.bioAvatarFallback}>
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
              )}

              <div>
                <span className={styles.bioLabel}>WRITTEN BY</span>
                <h2>{article.author.name}</h2>
                <p>
                  {article.author.bio ||
                    "Contributor at HackersHarbor."}
                </p>
              </div>
            </section>
          </article>
        </div>

        <section className={styles.related}>
          <div className={styles.relatedHeading}>
            <div>
              <span className={styles.sectionEyebrow}>KEEP EXPLORING</span>
              <h2>More from the journal</h2>
            </div>
            <Link href="/blog">View all articles →</Link>
          </div>

          <div className={styles.relatedGrid}>
            {relatedArticles.map((related) => (
              <Link
                key={related.id}
                href={`/blog/${related.slug}`}
                className={styles.relatedCard}
              >
                <span className={styles.relatedCategory}>
                  {related.categories[0]?.name || "Article"}
                </span>
                <h3>{related.title}</h3>
                <p>{related.excerpt}</p>
                <span className={styles.relatedMeta}>
                  {related.readingTime} min read
                  <span aria-hidden="true"> ↗</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <BlogFooter />
    </main>
  );
}
