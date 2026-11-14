
"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import styles from "./article-reading-experience.module.css";

interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface ArticleReadingExperienceProps {
  children: ReactNode;
  readingTime: number;
}

function createHeadingId(text: string, index: number): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || `article-section-${index + 1}`;
}

export default function ArticleReadingExperience({
  children,
  readingTime,
}: ArticleReadingExperienceProps) {
  const articleRef = useRef<HTMLDivElement>(null);

  const [headings, setHeadings] = useState<ArticleHeading[]>([]);
  const [activeHeading, setActiveHeading] = useState("");
  const [progress, setProgress] = useState(0);

  // Calculate reading progress.
  const updateProgress = useCallback(() => {
    const article = articleRef.current;

    if (!article) return;

    const rect = article.getBoundingClientRect();
    const articleTop = window.scrollY + rect.top;
    const articleHeight = article.offsetHeight;
    const availableScroll = articleHeight - window.innerHeight;

    if (availableScroll <= 0) {
      setProgress(window.scrollY >= articleTop ? 100 : 0);
      return;
    }

    const currentProgress =
      ((window.scrollY - articleTop) / availableScroll) * 100;

    setProgress(Math.min(100, Math.max(0, currentProgress)));
  }, []);

  // Extract headings from the Markdown content only.
  useEffect(() => {
    const article = articleRef.current;

    if (!article) return;

    // The first div inside articleBody is rendered by
    // ArticleReadingContent. This excludes articleEnd and authorBio.
    const content = article.querySelector<HTMLElement>(
      ":scope > article > div"
    );

    if (!content) return;

    const elements = Array.from(
      content.querySelectorAll<HTMLElement>("h2, h3")
    );

    const usedIds = new Set<string>();

    const extractedHeadings: ArticleHeading[] = elements.map(
      (element, index) => {
        const text = element.textContent?.trim() || "";
        const baseId = createHeadingId(text, index);

        let id = baseId;
        let suffix = 2;

        while (usedIds.has(id)) {
          id = `${baseId}-${suffix}`;
          suffix += 1;
        }

        usedIds.add(id);

        element.id = id;

        return {
          id,
          text,
          level: Number(element.tagName.substring(1)) as 2 | 3,
        };
      }
    );

    setHeadings(extractedHeadings);

    if (extractedHeadings.length > 0) {
      setActiveHeading(extractedHeadings[0].id);
    } else {
      setActiveHeading("");
    }

    // Track the currently visible article heading.
    let observer: IntersectionObserver | null = null;

    if (
      elements.length > 0 &&
      typeof IntersectionObserver !== "undefined"
    ) {
      observer = new IntersectionObserver(
        (entries) => {
          const visibleHeadings = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (a, b) =>
                a.boundingClientRect.top -
                b.boundingClientRect.top
            );

          if (visibleHeadings.length > 0) {
            setActiveHeading(visibleHeadings[0].target.id);
          }
        },
        {
          rootMargin: "-15% 0px -70% 0px",
          threshold: 0,
        }
      );

      elements.forEach((element) => {
        observer?.observe(element);
      });
    }

    // Initialize reading progress.
    updateProgress();

    window.addEventListener("scroll", updateProgress, {
      passive: true,
    });

    window.addEventListener("resize", updateProgress);

    return () => {
      observer?.disconnect();

      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  // Navigate to a selected article section.
  const navigateToHeading = useCallback((id: string) => {
    const article = articleRef.current;

    if (!article) return;

    const target = article.querySelector<HTMLElement>(
      `#${CSS.escape(id)}`
    );

    if (!target) return;

    target.scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth",
      block: "start",
    });

    setActiveHeading(id);
  }, []);

  return (
    <div className={styles.experience}>
      {/* Reading progress indicator */}
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className={styles.progressBar}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className={styles.layout}>
        {/* Article table of contents */}
        <aside
          className={styles.toc}
          aria-label="Article table of contents"
        >
          <div className={styles.tocHeader}>
            <span className={styles.tocTitle}>
              ON THIS PAGE
            </span>

            <span className={styles.progressLabel}>
              {Math.round(progress)}% read
            </span>
          </div>

          {headings.length > 0 ? (
            <nav aria-label="Article sections">
              <ul className={styles.tocList}>
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    className={
                      heading.level === 3
                        ? styles.tocSubItem
                        : styles.tocItem
                    }
                  >
                    <button
                      type="button"
                      className={`${styles.tocLink} ${
                        activeHeading === heading.id
                          ? styles.active
                          : ""
                      }`}
                      aria-current={
                        activeHeading === heading.id
                          ? "location"
                          : undefined
                      }
                      onClick={() =>
                        navigateToHeading(heading.id)
                      }
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <p className={styles.tocEmpty}>
              No article sections available.
            </p>
          )}

          {/* Sidebar footer */}
          <div className={styles.sidebarFooter}>
            <span className={styles.readingTime}>
              {readingTime} minute read
            </span>

            <Link
              href="/blog"
              className={styles.backLink}
            >
              ← Back to all articles
            </Link>
          </div>
        </aside>

        {/* Article content */}
        <div
          ref={articleRef}
          className={styles.article}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
