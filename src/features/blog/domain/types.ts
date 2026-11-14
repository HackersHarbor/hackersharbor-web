export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  author: BlogAuthor;
  categories: BlogCategory[];
  readingTime: number;
  publishedAt: string;
  featured: boolean;
}


export interface BlogTopicCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface BlogTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  categorySlugs: string[];
  keywords: string[];
}
