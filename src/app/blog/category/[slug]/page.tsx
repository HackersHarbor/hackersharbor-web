
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import ArticleCard from "@/components/blog/ArticleCard";

import { createSupabasePublicClient } from "@/lib/blog/supabase-public";
import type { ArticleSummary } from "@/features/blog/domain/types";

import styles from "./category-page.module.css";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

// Generate SEO metadata for each category.
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;

  const supabase = createSupabasePublicClient();

  const { data: category, error } = await supabase
    .from("journal_categories")
    .select("name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !category) {
    return {
      title: "Category Not Found | HackersHarbor Journal",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${category.name} | HackersHarbor Journal`;

  const description =
    category.description?.trim() ||
    `Explore articles, practical insights, and technical perspectives about ${category.name}.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

  const canonicalUrl = siteUrl
    ? `${siteUrl}/blog/category/${category.slug}`
    : undefined;

  return {
    title,
    description,

    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,

    openGraph: {
      title,
      description,
      type: "website",
      siteName: "HackersHarbor Journal",
      url: canonicalUrl,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  const supabase = createSupabasePublicClient();

  // 1. Find the requested category.
  const {
    data: category,
    error: categoryError,
  } = await supabase
    .from("journal_categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  if (categoryError) {
    console.error("Journal category loading error:", categoryError);
    throw new Error("Unable to load this journal category.");
  }

  if (!category) {
    notFound();
  }

  // 2. Find articles associated with this category.
  const {
    data: articleCategoryRows,
    error: articleCategoryError,
  } = await supabase
    .from("journal_article_categories")
    .select("article_id")
    .eq("category_id", category.id);

  if (articleCategoryError) {
    console.error(
      "Journal article-category loading error:",
      articleCategoryError
    );
    throw new Error("Unable to load category articles.");
  }

  const articleIds = [
    ...new Set(
      (articleCategoryRows ?? []).map((row) => row.article_id)
    ),
  ];

  // 3. Fetch only published articles.
  let publishedArticles: any[] = [];

  if (articleIds.length > 0) {
    const {
      data: articleRows,
      error: articlesError,
    } = await supabase
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
          published_at,
          created_at
        `
      )
      .in("id", articleIds)
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    if (articlesError) {
      console.error("Journal articles loading error:", articlesError);
      throw new Error("Unable to load published articles.");
    }

    publishedArticles = articleRows ?? [];
  }

  // 4. Load category relationships for the published articles.
  const publishedArticleIds = publishedArticles.map(
    (article) => article.id
  );

  let articleCategoryLinks: {
    article_id: string;
    category_id: string;
  }[] = [];

  if (publishedArticleIds.length > 0) {
    const {
      data: links,
      error: linksError,
    } = await supabase
      .from("journal_article_categories")
      .select("article_id, category_id")
      .in("article_id", publishedArticleIds);

    if (linksError) {
      console.error("Article category mapping error:", linksError);
      throw new Error("Unable to load article categories.");
    }

    articleCategoryLinks = links ?? [];
  }

  // 5. Load all categories for article cards and topic navigation.
  const {
    data: allCategories,
    error: allCategoriesError,
  } = await supabase
    .from("journal_categories")
    .select("id, name, slug, description")
    .order("name", { ascending: true });

  if (allCategoriesError) {
    console.error("Journal categories loading error:", allCategoriesError);
    throw new Error("Unable to load journal categories.");
  }

  const categoryMap = new Map(
    (allCategories ?? []).map((item) => [
      item.id,
      {
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description ?? "",
      },
    ])
  );

  // 6. Convert Supabase records into the existing ArticleSummary format.
  const articles: ArticleSummary[] = publishedArticles.map((article) => {
    const articleCategories = articleCategoryLinks
      .filter((link) => link.article_id === article.id)
      .map((link) => categoryMap.get(link.category_id))
      .filter(
        (item): item is NonNullable<typeof item> => item !== undefined
      );

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt ?? "",
      coverImage: article.cover_image_url ?? null,

      author: {
        id: article.author_id,
        name: "HackersHarbor Editorial",
        slug: "hackersharbor-editorial",
        bio: null,
        avatarUrl: null,
      },

      categories: articleCategories,
      readingTime: Number(article.reading_time ?? 1),
      publishedAt: article.published_at ?? article.created_at,
      featured: article.featured ?? false,
    };
  });

  const otherCategories = (allCategories ?? []).filter(
    (item) => item.slug !== category.slug
  );

  const categoryDescription =
    category.description?.trim() ||
    `Explore articles, practical insights, and technical perspectives about ${category.name}.`;

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
              {categoryDescription}
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
            {otherCategories.map((item) => (
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
