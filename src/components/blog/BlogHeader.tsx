
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

import styles from "./blog-components.module.css";

const BLOG_CATEGORIES = [
  {
    name: "Programming",
    slug: "programming",
  },
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
  },
  {
    name: "Data Engineering",
    slug: "data-engineering",
  },
  {
    name: "Python",
    slug: "python",
  },
  {
    name: "SQL",
    slug: "sql",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
  },
  {
    name: "Web Development",
    slug: "web-development",
  },
];

export default function BlogHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/blog" className={styles.brand}>
          <span className={styles.brandMark}>H</span>

          <span className={styles.brandName}>
            HACKERS<span>HARBOR</span>
            <small>ENGINEERING & TECHNOLOGY</small>
          </span>
        </Link>

        <nav
          className={styles.navigation}
          aria-label="Main navigation"
        >
          <Link href="/blog" className={styles.navActive}>
            Discover
          </Link>

          {BLOG_CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug}`}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <Link
            href="/blog/search"
            className={styles.searchButton}
            aria-label="Search articles"
          >
            <Search size={17} aria-hidden="true" />
          </Link>

          <Link
            href="/blog/studio"
            className={styles.writeButton}
          >
            Write an article
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
