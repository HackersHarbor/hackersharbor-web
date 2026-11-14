
import type { Metadata } from "next";
import Link from "next/link";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogHero from "@/components/blog/BlogHero";
import ArticleCard from "@/components/blog/ArticleCard";
import BlogFooter from "@/components/blog/BlogFooter";
import BlogNewsletterForm from "@/components/blog/BlogNewsletterForm";

import { createSupabasePublicClient } from "@/lib/blog/supabase-public";

import type {
  ArticleSummary,
  BlogAuthor,
  BlogCategory,
} from "@/features/blog/domain/types";

import styles from "./blog.module.css";

interface JournalCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface JournalArticleRecord {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  reading_time: number | null;
  featured: boolean | null;
  views_count: number | null;
  published_at: string | null;
  created_at: string;
}

interface ArticleCategoryRecord {
  article_id: string;
  category_id: string;
}

interface JournalProfileRecord {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface SupabaseQueryError {
  message?: string;
  details?: string | null;
  hint?: string | null;
  code?: string;
  status?: number;
  statusCode?: string;
}

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "HackersHarbor Blog | Engineering & Technology",
  description:
    "Explore engineering, programming, data, artificial intelligence and technology insights from HackersHarbor.",

  alternates: siteUrl
    ? {
        canonical: `${siteUrl}/blog`,
      }
    : undefined,

  openGraph: {
    title: "HackersHarbor Blog | Engineering & Technology",
    description:
      "Explore engineering, programming, data, artificial intelligence and technology insights from HackersHarbor.",
    type: "website",
    siteName: "HackersHarbor Journal",
    url: siteUrl ? `${siteUrl}/blog` : undefined,
  },

  twitter: {
    card: "summary_large_image",
    title: "HackersHarbor Blog | Engineering & Technology",
    description:
      "Explore engineering, programming, data, artificial intelligence and technology insights from HackersHarbor.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

function logSupabaseError(
  label: string,
  error: SupabaseQueryError | null
) {
  if (!error) return;

  console.error(label, {
    message: error.message ?? "No error message provided",
    code: error.code ?? "No error code provided",
    details: error.details ?? null,
    hint: error.hint ?? null,
    status: error.status ?? null,
    statusCode: error.statusCode ?? null,
  });
}

export default async function BlogPage() {
  const supabase = createSupabasePublicClient();

  // 1. Load published articles and all categories.
  const [
    { data: articleData, error: articlesError },
    { data: categoryData, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("journal_articles")
      .select(
        `
          id,
          author_id,
          title,
          slug,
          excerpt,
          cover_image_url,
          reading_time,
          featured,
          views_count,
          published_at,
          created_at
        `
      )
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(50),

    supabase
      .from("journal_categories")
      .select("id, name, slug, description")
      .order("name", { ascending: true }),
  ]);

  if (articlesError) {
    logSupabaseError(
      "Journal homepage articles loading error:",
      articlesError
    );

    throw new Error(
      `Unable to load journal articles: ${
        articlesError.message ?? "Unknown Supabase query error"
      }`
    );
  }

  if (categoriesError) {
    logSupabaseError(
      "Journal homepage categories loading error:",
      categoriesError
    );

    throw new Error(
      `Unable to load journal categories: ${
        categoriesError.message ?? "Unknown Supabase query error"
      }`
    );
  }

  const publishedArticles = (
    articleData ?? []
  ) as JournalArticleRecord[];

  const allCategories = (
    categoryData ?? []
  ) as JournalCategoryRecord[];

  // 2. Load article-category relationships.
  const articleIds = publishedArticles.map((article) => article.id);

  let articleCategoryLinks: ArticleCategoryRecord[] = [];

  if (articleIds.length > 0) {
    const {
      data: linkData,
      error: linksError,
    } = await supabase
      .from("journal_article_categories")
      .select("article_id, category_id")
      .in("article_id", articleIds);

    if (linksError) {
      logSupabaseError(
        "Homepage article-category mapping error:",
        linksError
      );

      throw new Error(
        `Unable to load article category relationships: ${
          linksError.message ?? "Unknown Supabase query error"
        }`
      );
    }

    articleCategoryLinks = (
      linkData ?? []
    ) as ArticleCategoryRecord[];
  }

  // 3. Prepare the category lookup map.
  const categoryMap = new Map<string, BlogCategory>(
    allCategories.map((item) => [
      item.id,
      {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? "",
      },
    ])
  );

  // 4. Load author profiles.
  const authorIds = [
    ...new Set(
      publishedArticles.map((article) => article.author_id)
    ),
  ];

  const authorMap = new Map<string, BlogAuthor>();

  if (authorIds.length > 0) {
    const {
      data: profileData,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .in("id", authorIds);

    if (profilesError) {
      logSupabaseError(
        "Homepage author profiles loading error:",
        profilesError
      );
    } else {
      const profiles = (
        profileData ?? []
      ) as JournalProfileRecord[];

      for (const profile of profiles) {
        const authorName =
          profile.display_name?.trim() ||
          profile.username?.trim() ||
          "HackersHarbor Editorial";

        const authorSlug =
          profile.username?.trim() ||
          "hackersharbor-editorial";

        authorMap.set(profile.id, {
          id: profile.id,
          name: authorName,
          slug: authorSlug,
          bio: profile.bio ?? null,
          avatarUrl: profile.avatar_url ?? null,
        });
      }
    }
  }

  // 5. Convert Supabase records into ArticleSummary objects.
  const articles: ArticleSummary[] = publishedArticles.map(
    (article) => {
      const articleCategories = articleCategoryLinks
        .filter((link) => link.article_id === article.id)
        .map((link) => categoryMap.get(link.category_id))
        .filter(
          (item): item is BlogCategory => item !== undefined
        );

      const author: BlogAuthor =
        authorMap.get(article.author_id) ?? {
          id: article.author_id,
          name: "HackersHarbor Editorial",
          slug: "hackersharbor-editorial",
          bio: null,
          avatarUrl: null,
        };

      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt ?? "",
        coverImage: article.cover_image_url ?? null,
        author,
        categories: articleCategories,
        readingTime: Math.max(
          1,
          Number(article.reading_time ?? 1)
        ),
        publishedAt:
          article.published_at ?? article.created_at,
        featured: article.featured ?? false,
      };
    }
  );

  // 6. Select the featured article.
  const featuredArticle =
    articles.find((article) => article.featured) ??
    articles[0] ??
    null;

  // 7. Select the most-viewed articles for the Trending section.
  // The featured article is excluded to avoid showing it twice.
  const articleSummaryMap = new Map(
    articles.map((article) => [article.id, article])
  );

  const trendingArticles = publishedArticles
    .filter(
      (article) =>
        article.id !== featuredArticle?.id &&
        Number(article.views_count ?? 0) > 0
    )
    .sort((a, b) => {
      const viewDifference =
        Number(b.views_count ?? 0) -
        Number(a.views_count ?? 0);

      if (viewDifference !== 0) {
        return viewDifference;
      }

      return (
        new Date(b.published_at ?? b.created_at).getTime() -
        new Date(a.published_at ?? a.created_at).getTime()
      );
    })
    .slice(0, 3)
    .map((article) => articleSummaryMap.get(article.id))
    .filter(
      (article): article is ArticleSummary =>
        article !== undefined
    );

  // 8. Prepare the latest articles without duplicating
  // the featured or trending articles.
  const excludedArticleIds = new Set([
    ...(featuredArticle ? [featuredArticle.id] : []),
    ...trendingArticles.map((article) => article.id),
  ]);

  const latestArticles = articles.filter(
    (article) => !excludedArticleIds.has(article.id)
  );

  // 9. Render the homepage.
  return (
    <div className={styles.blogPage}>
      <BlogHeader />

      <main>
        {featuredArticle && (
          <BlogHero article={featuredArticle} />
        )}

        {/* Category navigation */}
        <section className={styles.categorySection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                Explore by interest
              </span>

              <h2>Find your next idea.</h2>
            </div>

            <span className={styles.sectionDescription}>
              Explore topics across technology and engineering.
            </span>
          </div>

          <nav
            className={styles.categoryList}
            aria-label="Article categories"
          >
            <Link
              href="/blog"
              className={styles.categoryActive}
            >
              All
            </Link>

            {allCategories.map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className={styles.categoryLink}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </section>

        {/* Trending articles */}
        {trendingArticles.length > 0 && (
          <section
            id="trending"
            className={styles.latestSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionEyebrow}>
                  Trending
                </span>

                <h2>Popular with readers.</h2>
              </div>

              <span className={styles.sectionDescription}>
                The articles getting the most attention.
              </span>
            </div>

            <div className={styles.articleGrid}>
              {trendingArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}

        {/* Latest articles */}
        <section
          id="latest"
          className={styles.latestSection}
        >
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                The latest
              </span>

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
              {articles.length === 0
                ? "New articles are coming soon."
                : "More articles are coming soon."}
            </p>
          )}
        </section>

        {/* Newsletter subscription */}
        <section className={styles.newsletterSection}>
          <div className={styles.newsletterBody}>
            <h2>
              Good ideas deserve a place in your inbox.
            </h2>

            <p>
              Discover new engineering perspectives and
              practical technology insights from HackersHarbor.
            </p>
          </div>

          <div className={styles.newsletterAction}>
            <BlogNewsletterForm />
          </div>
        </section>
      </main>

      <BlogFooter />
    </div>
  );
}
