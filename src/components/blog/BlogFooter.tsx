import Link from "next/link";
import styles from "./blog-components.module.css";

export default function BlogFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div>
          <Link href="/blog" className={styles.footerBrand}>
            HACKERS<span>HARBOR</span>
          </Link>
          <p>
            Knowledge, engineering and ideas for people
            building what comes next.
          </p>
        </div>

        <div className={styles.footerLinks}>
          <div>
            <strong>EXPLORE</strong>
            <Link href="/blog">Discover</Link>
            <Link href="/blog/search">Search articles</Link>
          </div>
          <div>
            <strong>CONTRIBUTE</strong>
            <Link href="/blog/studio">Blog Studio</Link>
            <Link href="/blog">Editorial</Link>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>© {new Date().getFullYear()} HackersHarbor</span>
        <span>Built for curious minds and ambitious builders.</span>
      </div>
    </footer>
  );
}
