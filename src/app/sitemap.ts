
import type { MetadataRoute } from "next";

import { createSupabasePublicClient } from "@/lib/blog/supabase-public";

export const revalidate = 3600;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : null);

function getSiteUrl() {
  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be configured to generate the sitemap."
    );
  }

  return siteUrl;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const supabase = createSupabasePublicClient();

  // Public static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog/topics`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/practice`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/voyage`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community/kraken`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Fetch published Journal articles
  const { data: articles, error: articlesError } = await supabase
    .from("journal_articles")
    .select("id, slug, published_at, updated_at")
    .eq("status", "published")
    .not("published_at", "is", null);

  if (articlesError) {
    throw new Error(
      `Unable to fetch published Journal articles: ${articlesError.message}`
    );
  }

  const publishedArticles = articles ?? [];

  const articleRoutes: MetadataRoute.Sitemap = publishedArticles.map(
    (article) => ({
      url: `${baseUrl}/blog/${encodeURIComponent(article.slug)}`,
      lastModified: article.updated_at ?? article.published_at ?? undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  // Fetch category relationships for published articles only
  const publishedArticleIds = publishedArticles.map(
    (article) => article.id
  );

  let categoryRoutes: MetadataRoute.Sitemap = [];

  if (publishedArticleIds.length > 0) {
    const { data: relationships, error: relationshipsError } =
      await supabase
        .from("journal_article_categories")
        .select("category_id")
        .in("article_id", publishedArticleIds);

    if (relationshipsError) {
      throw new Error(
        `Unable to fetch Journal category relationships: ${relationshipsError.message}`
      );
    }

    const categoryIds = [
      ...new Set(
        (relationships ?? []).map((relationship) => relationship.category_id)
      ),
    ];

    if (categoryIds.length > 0) {
      const { data: categories, error: categoriesError } = await supabase
        .from("journal_categories")
        .select("id, slug")
        .in("id", categoryIds);

      if (categoriesError) {
        throw new Error(
          `Unable to fetch Journal categories: ${categoriesError.message}`
        );
      }

      categoryRoutes = (categories ?? []).map((category) => ({
        url: `${baseUrl}/blog/category/${encodeURIComponent(category.slug)}`,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  }

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...categoryRoutes,
  ];
}
