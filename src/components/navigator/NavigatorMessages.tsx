"use client";

import { useEffect, useRef } from "react";
import type { NavigatorMessage } from "@/types/navigator";

import { NavigatorMessageItem } from "./NavigatorMessage";
import { NavigatorTyping } from "./NavigatorTyping";

import styles from "./navigator.module.css";

interface NavigatorMessagesProps {
  messages: NavigatorMessage[];
  isLoading: boolean;
  error: string | null;
  onSuggestion: (content: string) => Promise<void>;
}

const suggestions = [
  "Help me understand the current page.",
  "Help me debug a coding problem.",
  "Explain how I can improve my project.",
];

export function NavigatorMessages({
  messages,
  isLoading,
  error,
  onSuggestion,
}: NavigatorMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading, error]);

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.messagesViewport}>
      <div className={styles.messagesContent}>
        {isEmpty ? (
          <div className={styles.welcome}>

            <div className={styles.welcomeEyebrow}>
              HACKERSHARBOR INTELLIGENCE
            </div>

            <h2 className={styles.welcomeTitle}>
              Where would you like to go?
            </h2>

            <p className={styles.welcomeDescription}>
              Ask about your code, your workspace, your learning
              journey or the page you're currently exploring.
            </p>

            <div className={styles.suggestions}>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={styles.suggestion}
                  onClick={() => void onSuggestion(suggestion)}
                  disabled={isLoading}
                >
                  <span>{suggestion}</span>
                  <span className={styles.suggestionArrow}>↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((message) => (
              <NavigatorMessageItem
                key={message.id}
                message={message}
              />
            ))}
          </div>
        )}

        {isLoading && (
          <NavigatorTyping />
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            <span className={styles.errorMark}>!</span>
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

