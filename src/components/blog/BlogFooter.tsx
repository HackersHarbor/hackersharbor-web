
import Link from "next/link";
import styles from "./blog-components.module.css";

export default function BlogFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerIntro}>
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
            <strong>QUICK LINKS</strong>
            <Link href="/blog">Discover</Link>
            <Link href="/blog/search">Search articles</Link>
            <Link href="/blog/topics">Topics</Link>
          </div>

          <div>
            <strong>CONTRIBUTE</strong>
            <Link href="/blog/studio">Blog Studio</Link>
            <Link href="/blog">Editorial</Link>
          </div>
        </div>

        <div className={styles.footerContact}>
          <strong>GET IN TOUCH</strong>

          <p>
            Have an idea to share? Visit Blog Studio
            and contribute to the HackersHarbor community.
          </p>

          <Link href="/blog/studio">
            Start contributing
          </Link>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <span>
          © {new Date().getFullYear()} HackersHarbor
        </span>

        <span>
          Built for curious minds and ambitious builders.
        </span>
      </div>
    </footer>
  );
}
