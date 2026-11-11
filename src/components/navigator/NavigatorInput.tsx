"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";

import styles from "./navigator.module.css";

interface NavigatorInputProps {
  isLoading: boolean;
  onSend: (content: string) => Promise<void>;
  onStop: () => void;
}

export function NavigatorInput({
  isLoading,
  onSend,
  onStop,
}: NavigatorInputProps) {
  const [value, setValue] = useState("");

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const message = value.trim();

    if (!message || isLoading) {
      return;
    }

    setValue("");
    await onSend(message);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <div className={styles.inputArea}>
      <form
        className={styles.inputForm}
        onSubmit={(event) => void submit(event)}
      >
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask The Navigator anything..."
          rows={2}
          maxLength={8000}
          aria-label="Message The Navigator"
          disabled={isLoading}
        />

        <div className={styles.inputToolbar}>
          <span className={styles.inputHint}>
            Enter to send · Shift + Enter for a new line
          </span>

          {isLoading ? (
            <button
              type="button"
              className={styles.stopButton}
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop response"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!value.trim()}
              aria-label="Send message"
              title="Send message"
            >
              <ArrowUp size={19} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </form>

      <p className={styles.disclaimer}>
        The Navigator can make mistakes. Verify important information and code.
      </p>
    </div>
  );
}
