"use client";

import type { NavigatorMessage } from "@/types/navigator";

import { NavigatorHeader } from "./NavigatorHeader";
import { NavigatorMessages } from "./NavigatorMessages";
import { NavigatorInput } from "./NavigatorInput";

import styles from "./navigator.module.css";

interface NavigatorPanelProps {
  messages: NavigatorMessage[];
  isLoading: boolean;
  error: string | null;
  pageTitle: string;
  onClose: () => void;
  onSend: (content: string) => Promise<void>;
  onStop: () => void;
  onClear: () => void;
}

export function NavigatorPanel({
  messages,
  isLoading,
  error,
  pageTitle,
  onClose,
  onSend,
  onStop,
  onClear,
}: NavigatorPanelProps) {
  return (
    <section
      className={styles.panel}
      role="dialog"
      aria-label="The Navigator assistant"
      aria-modal="false"
    >
      <NavigatorHeader
        pageTitle={pageTitle}
        onClose={onClose}
        onClear={onClear}
      />

      <NavigatorMessages
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSuggestion={onSend}
      />

      <NavigatorInput
        isLoading={isLoading}
        onSend={onSend}
        onStop={onStop}
      />
    </section>
  );
}
