import type { ArticleSummary } from "@/features/blog/domain/types";

export const DEMO_ARTICLES: ArticleSummary[] = [
  {
    id: "demo-1",
    title: "The Future of Data Engineering: Beyond Traditional Pipelines",
    slug: "future-of-data-engineering",
    excerpt: "Explore how modern data architectures, distributed systems and intelligent workflows are transforming the way organizations process information.",
    coverImage: null,
    author: {
      id: "author-1",
      name: "HackersHarbor Editorial",
      slug: "hackersharbor-editorial",
      bio: "Technology and engineering publication.",
      avatarUrl: null,
    },
    categories: [
      {
        id: "category-1",
        name: "Data Engineering",
        slug: "data-engineering",
        description: "Modern data systems and infrastructure.",
      },
    ],
    readingTime: 8,
    publishedAt: "2026-11-10T09:00:00.000Z",
    featured: true,
  },
  {
    id: "demo-2",
    title: "Writing Better Python for Real-World Data Workflows",
    slug: "better-python-data-workflows",
    excerpt: "Practical approaches to writing maintainable, efficient and reliable Python code for complex data projects.",
    coverImage: null,
    author: {
      id: "author-1",
      name: "HackersHarbor Editorial",
      slug: "hackersharbor-editorial",
      bio: null,
      avatarUrl: null,
    },
    categories: [
      {
        id: "category-2",
        name: "Python",
        slug: "python",
        description: "Python programming.",
      },
    ],
    readingTime: 6,
    publishedAt: "2026-11-09T09:00:00.000Z",
    featured: false,
  },
  {
    id: "demo-3",
    title: "Understanding Modern SQL Query Optimization",
    slug: "modern-sql-query-optimization",
    excerpt: "Learn how query planning, indexing and execution strategies influence database performance.",
    coverImage: null,
    author: {
      id: "author-1",
      name: "HackersHarbor Editorial",
      slug: "hackersharbor-editorial",
      bio: null,
      avatarUrl: null,
    },
    categories: [
      {
        id: "category-3",
        name: "SQL",
        slug: "sql",
        description: "Database engineering.",
      },
    ],
    readingTime: 7,
    publishedAt: "2026-11-08T09:00:00.000Z",
    featured: false,
  },
  {
    id: "demo-4",
    title: "Building Reliable Applications with TypeScript",
    slug: "reliable-typescript-applications",
    excerpt: "A practical look at strong typing, modular architecture and maintainable application design.",
    coverImage: null,
    author: {
      id: "author-1",
      name: "HackersHarbor Editorial",
      slug: "hackersharbor-editorial",
      bio: null,
      avatarUrl: null,
    },
    categories: [
      {
        id: "category-4",
        name: "Programming",
        slug: "programming",
        description: "Software development.",
      },
    ],
    readingTime: 5,
    publishedAt: "2026-11-07T09:00:00.000Z",
    featured: false,
  },
];

export const DEMO_CATEGORIES = [
  { name: "All articles", slug: "" },
  { name: "Programming", slug: "programming" },
  { name: "Artificial Intelligence", slug: "artificial-intelligence" },
  { name: "Data Engineering", slug: "data-engineering" },
  { name: "Python", slug: "python" },
  { name: "SQL", slug: "sql" },
  { name: "Cybersecurity", slug: "cybersecurity" },
  { name: "Web Development", slug: "web-development" },
];
