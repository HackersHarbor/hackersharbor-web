
import type { Metadata } from "next";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogFooter from "@/components/blog/BlogFooter";
import TopicDirectoryClient from "@/components/blog/TopicDirectoryClient";
import {
  BLOG_TOPIC_CATEGORIES,
  BLOG_TOPICS,
} from "@/lib/blog/topics";
import styles from "./topic-directory.module.css";

export const metadata: Metadata = {
  title: "Explore Topics | HackersHarbor Journal",
  description:
    "Explore programming, artificial intelligence, data science, analytics, machine learning and technologies across the HackersHarbor Journal.",
};

export default function TopicsPage() {
  return (
    <main className={styles.page}>
      <BlogHeader />

      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <a href="/blog">Discover</a>
          <span>/</span>
          <span>Topics</span>
        </div>

        <section className={styles.intro}>
          <span className={styles.eyebrow}>
            THE KNOWLEDGE DIRECTORY
          </span>

          <h1>
            Explore ideas.
            <br />
            <span>Discover technologies.</span>
          </h1>

          <p>
            Browse the subjects, tools and technologies shaping modern
            computing. From artificial intelligence and data science to
            programming, databases and cloud infrastructure.
          </p>

          <div className={styles.stats}>
            <div>
              <strong>{BLOG_TOPIC_CATEGORIES.length}</strong>
              <span>SUBJECT AREAS</span>
            </div>

            <div className={styles.statDivider} />

            <div>
              <strong>{BLOG_TOPICS.length}</strong>
              <span>TOPICS</span>
            </div>
          </div>
        </section>

        <section
          className={styles.directory}
          aria-label="Browse topics"
        >
          <div className={styles.directoryHeading}>
            <div>
              <span className={styles.sectionEyebrow}>
                BROWSE THE DIRECTORY
              </span>

              <h2>Find your next subject</h2>
            </div>

            <span className={styles.totalCount}>
              {BLOG_TOPICS.length} topics
            </span>
          </div>

          <TopicDirectoryClient
            categories={BLOG_TOPIC_CATEGORIES}
            topics={BLOG_TOPICS}
          />
        </section>
      </div>

      <BlogFooter />
    </main>
  );
}
