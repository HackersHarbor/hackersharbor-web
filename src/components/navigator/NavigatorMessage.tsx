"use client";

import ReactMarkdown from "react-markdown";

import type { NavigatorMessage } from "@/types/navigator";

import styles from "./navigator.module.css";

interface NavigatorMessageProps {
  message: NavigatorMessage;
}

export function NavigatorMessageItem({
  message,
}: NavigatorMessageProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={`${styles.messageRow} ${
        isUser ? styles.userMessageRow : styles.assistantMessageRow
      }`}
    >
      {!isUser && (
        <div className={styles.messageAvatar} aria-hidden="true">
          N
        </div>
      )}

      <div
        className={`${styles.messageBubble} ${
          isUser ? styles.userBubble : styles.assistantBubble
        }`}
      >
        {!isUser && (
          <div className={styles.messageAuthor}>
            The Navigator
          </div>
        )}

        <div className={styles.messageBody}>
          {isUser ? (
            <p className={styles.userText}>
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              components={{
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children, className }) => (
                  <code className={className}>
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className={styles.codeBlock}>
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </article>
  );
}
