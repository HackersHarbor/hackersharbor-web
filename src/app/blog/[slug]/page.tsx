
import type { Metadata } from "next";

import Link from "next/link";
import { notFound } from "next/navigation";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import ArticleReadingContent from "@/components/blog/ArticleReadingContent";
import ArticleReadingExperience from "@/components/blog/ArticleReadingExperience";

import { createSupabaseServerClient } from "@/lib/navigator/supabase-server";
import { formatArticleDate } from "@/lib/blog/utils";

import styles from "./article-page.module.css";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

interface JournalCategory {
  id: string;
  name: string;
  slug: string;
}

interface JournalArticle {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  reading_time: number | null;
  featured: boolean | null;
  published_at: string | null;
  created_at: string;
}

interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  readingTime: number;
  categories: JournalCategory[];
}

export const dynamic = "force-dynamic";

// Generate SEO metadata for each published article.
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: article, error } = await supabase
    .from("journal_articles")
    .select("title, slug, excerpt, cover_image_url, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !article) {
    return {
      title: "Article Not Found | HackersHarbor Journal",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${article.title} | HackersHarbor Journal`;

  const description =
    article.excerpt?.trim() ||
    `Read ${article.title} on HackersHarbor Journal. Explore practical engineering, programming, data and technology insights.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/+$/,
    ""
  );

  const canonicalUrl = siteUrl
    ? `${siteUrl}/blog/${article.slug}`
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
      type: "article",
      siteName: "HackersHarbor Journal",
      url: canonicalUrl,

      ...(article.published_at && {
        publishedTime: article.published_at,
      }),

      ...(article.cover_image_url && {
        images: [
          {
            url: article.cover_image_url,
            alt: article.title,
          },
        ],
      }),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      ...(article.cover_image_url && {
        images: [article.cover_image_url],
      }),
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  // Fetch the requested published article.
  const { data: articleData, error: articleError } = await supabase
    .from("journal_articles")
    .select(`
      id,
      author_id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      reading_time,
      featured,
      published_at,
      created_at
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (articleError || !articleData) {
    notFound();
  }

  const article = articleData as JournalArticle;

  // Increment the article's view counter.
  // A counter failure must never prevent the article from loading.
  const { error: viewCountError } = await supabase.rpc(
    "increment_journal_article_views",
    {
      article_slug: article.slug,
    }
  );

  if (viewCountError) {
    console.error("Journal article view counter error:", {
      articleSlug: article.slug,
      message: viewCountError.message,
      code: viewCountError.code,
      details: viewCountError.details,
      hint: viewCountError.hint,
    });
  }

  // Fetch the article's category relationships.
  const { data: categoryRelations } = await supabase
    .from("journal_article_categories")
    .select("category_id")
    .eq("article_id", article.id);

  const categoryIds = (categoryRelations ?? []).map(
    (relation) => relation.category_id
  );

  let categories: JournalCategory[] = [];

  if (categoryIds.length > 0) {
    const { data: categoryData } = await supabase
      .from("journal_categories")
      .select("id, name, slug")
      .in("id", categoryIds);

    categories = (categoryData ?? []) as JournalCategory[];
  }

  // Fetch other published articles for the related articles section.
  const { data: relatedData } = await supabase
    .from("journal_articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      reading_time
    `)
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const relatedRows = relatedData ?? [];

  // Fetch categories for the related articles.
  const relatedIds = relatedRows.map((item) => item.id);

  let relatedCategories: {
    article_id: string;
    category_id: string;
  }[] = [];

  if (relatedIds.length > 0) {
    const { data: relationData } = await supabase
      .from("journal_article_categories")
      .select("article_id, category_id")
      .in("article_id", relatedIds);

    relatedCategories = relationData ?? [];
  }

  const allCategoryIds = [
    ...new Set(
      relatedCategories.map((item) => item.category_id)
    ),
  ];

  let relatedCategoryRecords: JournalCategory[] = [];

  if (allCategoryIds.length > 0) {
    const { data: categoryData } = await supabase
      .from("journal_categories")
      .select("id, name, slug")
      .in("id", allCategoryIds);

    relatedCategoryRecords = (categoryData ??
      []) as JournalCategory[];
  }

  const relatedArticles: ArticleSummary[] = relatedRows.map(
    (item) => {
      const articleCategoryIds = relatedCategories
        .filter((relation) => relation.article_id === item.id)
        .map((relation) => relation.category_id);

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt ?? "",
        readingTime: Number(item.reading_time ?? 1),

        categories: relatedCategoryRecords.filter((category) =>
          articleCategoryIds.includes(category.id)
        ),
      };
    }
  );

  const primaryCategory = categories[0];

  // The current journal schema stores author_id but does not
  // provide author profile fields in journal_articles.
  const author = {
    name: "HackersHarbor Editorial",
    slug: "hackersharbor-editorial",
    bio: "Contributor at HackersHarbor.",
    avatarUrl: null as string | null,
  };

  const readingTime = Number(article.reading_time ?? 1);
  const publishedAt = article.published_at ?? article.created_at;

  // Absolute URLs for search engines.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/+$/,
    ""
  );

  const articleUrl = siteUrl
    ? `${siteUrl}/blog/${article.slug}`
    : undefined;

  const blogUrl = siteUrl
    ? `${siteUrl}/blog`
    : undefined;

  // BlogPosting structured data.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",

    headline: article.title,

    description:
      article.excerpt?.trim() || article.title,

    datePublished: publishedAt,

    ...(articleUrl && {
      url: articleUrl,

      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
    }),

    ...(article.cover_image_url && {
      image: [article.cover_image_url],
    }),

    author: {
      "@type": "Organization",
      name: author.name,
    },

    publisher: {
      "@type": "Organization",
      name: "HackersHarbor",
    },

    articleSection: categories.map(
      (category) => category.name
    ),

    inLanguage: "en",
  };

  // BreadcrumbList structured data.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",

        ...(blogUrl && {
          item: blogUrl,
        }),
      },

      ...(primaryCategory
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: primaryCategory.name,

              ...(siteUrl && {
                item: `${siteUrl}/blog/category/${primaryCategory.slug}`,
              }),
            },

            {
              "@type": "ListItem",
              position: 3,
              name: article.title,

              ...(articleUrl && {
                item: articleUrl,
              }),
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: article.title,

              ...(articleUrl && {
                item: articleUrl,
              }),
            },
          ]),
    ],
  };

  return (
    <main className={styles.page}>
      <BlogHeader />

      {/* Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      <div className={styles.readingShell}>
        <nav
          className={styles.breadcrumb}
          aria-label="Breadcrumb"
        >
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

          <p className={styles.excerpt}>
            {article.excerpt ?? ""}
          </p>

          <div className={styles.metadata}>
            <div className={styles.author}>
              {author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.avatar}
                  src={author.avatarUrl}
                  alt=""
                />
              ) : (
                <span className={styles.avatarFallback}>
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}

              <div className={styles.authorDetails}>
                <Link href={`/blog/author/${author.slug}`}>
                  {author.name}
                </Link>

                <span>Author</span>
              </div>
            </div>

            <span className={styles.metadataDivider} />

            <div className={styles.articleStats}>
              <span>{formatArticleDate(publishedAt)}</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </header>

        <div
          className={styles.cover}
          role="img"
          aria-label={`Cover artwork for ${article.title}`}
        >
          <div className={styles.coverPattern} />

          <span className={styles.coverLabel}>
            HACKERSHARBOR / JOURNAL
          </span>

          <span className={styles.coverInitial}>
            {article.title.charAt(0)}
          </span>
        </div>

        {/* Interactive article reading experience */}
        <ArticleReadingExperience readingTime={readingTime}>
          <article className={styles.articleBody}>
            <ArticleReadingContent content={article.content} />

            <div className={styles.articleEnd}>
              <span />
              <span>End of article</span>
              <span />
            </div>

            <section className={styles.authorBio}>
              {author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.avatarUrl}
                  alt=""
                  className={styles.bioAvatar}
                />
              ) : (
                <span className={styles.bioAvatarFallback}>
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}

              <div>
                <span className={styles.bioLabel}>
                  WRITTEN BY
                </span>

                <h2>{author.name}</h2>

                <p>{author.bio}</p>
              </div>
            </section>
          </article>
        </ArticleReadingExperience>

        <section className={styles.related}>
          <div className={styles.relatedHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                KEEP EXPLORING
              </span>

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
