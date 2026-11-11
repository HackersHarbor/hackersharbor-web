import BlogHeader from "@/components/blog/BlogHeader";
import BlogHero from "@/components/blog/BlogHero";
import ArticleCard from "@/components/blog/ArticleCard";
import BlogFooter from "@/components/blog/BlogFooter";
import { DEMO_ARTICLES, DEMO_CATEGORIES } from "@/lib/blog/demo-data";
import styles from "./blog.module.css";

export const metadata = {
  title: "HackersHarbor Blog | Engineering & Technology",
  description:
    "Explore engineering, programming, data, artificial intelligence and technology insights from HackersHarbor.",
};

export default function BlogPage() {
  const featuredArticle =
    DEMO_ARTICLES.find((article) => article.featured) ??
    DEMO_ARTICLES[0];

  const latestArticles = DEMO_ARTICLES.filter(
    (article) => article.id !== featuredArticle.id
  );

  return (
    <div className={styles.blogPage}>
      <BlogHeader />

      <main>
        <BlogHero article={featuredArticle} />

        <section className={styles.categorySection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>EXPLORE BY INTEREST</span>
              <h2>Find your next idea.</h2>
            </div>
            <span className={styles.sectionDescription}>
              Explore topics across technology and engineering.
            </span>
          </div>

          <nav className={styles.categoryList} aria-label="Article categories">
            {DEMO_CATEGORIES.map((category) => (
              <a
                key={category.slug || "all"}
                href={
                  category.slug
                    ? `/blog/category/${category.slug}`
                    : "/blog"
                }
                className={
                  category.slug
                    ? styles.categoryLink
                    : styles.categoryActive
                }
              >
                {category.name}
              </a>
            ))}
          </nav>
        </section>

        <section id="latest" className={styles.latestSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>THE LATEST</span>
              <h2>Fresh perspectives.</h2>
            </div>
            <span className={styles.sectionDescription}>
              Ideas, tutorials and practical knowledge.
            </span>
          </div>

          {latestArticles.length > 0 ? (
            <div className={styles.articleGrid}>
              {latestArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>
              New articles are coming soon.
            </p>
          )}
        </section>

        <section className={styles.newsletterSection}>
          <div>
            <span className={styles.sectionEyebrow}>STAY CURIOUS</span>
            <h2>Good ideas deserve a place in your inbox.</h2>
            <p>
              Discover new engineering perspectives and practical
              technology insights from HackersHarbor.
            </p>
          </div>
          <a href="/blog/search" className={styles.newsletterLink}>
            Explore the journal <span>→</span>
          </a>
        </section>
      </main>

      <BlogFooter />
    </div>
  );
}
