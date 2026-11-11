import ReactMarkdown from "react-markdown";
import styles from "./article-reading.module.css";

interface ArticleReadingContentProps {
  content: string;
}

export default function ArticleReadingContent({
  content,
}: ArticleReadingContentProps) {
  return (
    <div className={styles.content}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
