import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import styles from "./blog-components.module.css";

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

        <nav className={styles.navigation} aria-label="Main navigation">
          <Link href="/blog" className={styles.navActive}>
            Discover
          </Link>
          <Link href="/blog/category/programming">Programming</Link>
          <Link href="/blog/category/data-engineering">
            Data Engineering
          </Link>
          <Link href="/blog/category/artificial-intelligence">
            AI & Research
          </Link>
        </nav>

        <div className={styles.headerActions}>
          <Link
            href="/blog/search"
            className={styles.searchButton}
            aria-label="Search articles"
          >
            <Search size={17} />
          </Link>
          <Link href="/blog/studio" className={styles.writeButton}>
            Write an article <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
