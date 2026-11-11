"use client";

import { useState } from "react";

import {
  MessageCircle,
  Send,
} from "lucide-react";

import type { KrakenReply } from "../types/reply";

import styles from "../styles/ship-logs.module.css";

type KrakenRepliesProps = {
  initialReplies?: KrakenReply[];
  onReplyCountChange?: (count: number) => void;
};

export default function KrakenReplies({
  initialReplies = [],
  onReplyCountChange,
}: KrakenRepliesProps) {
  const [replies, setReplies] =
    useState<KrakenReply[]>(initialReplies);

  const [replyText, setReplyText] =
    useState("");

  const canReply =
    replyText.trim().length > 0;

  const handleSubmit = () => {
    const content = replyText.trim();

    if (!content) {
      return;
    }

    const newReply: KrakenReply = {
      id: `reply-${Date.now()}`,
      author: "You",
      authorInitial: "P",
      content,
      publishedLabel: "Just now",
    };

    const newCount = replies.length + 1;

    setReplies((currentReplies) => [
      ...currentReplies,
      newReply,
    ]);

    onReplyCountChange?.(newCount);

    setReplyText("");
  };

  return (
    <section className={styles.repliesSection}>
      <header className={styles.repliesHeader}>
        <div>
          <span className={styles.repliesEyebrow}>
            DISCUSSION
          </span>

          <h2>
            Replies
            <span>{replies.length}</span>
          </h2>

          <p>
            Share your thoughts, questions, or
            technical insights about this Ship Log.
          </p>
        </div>

        <MessageCircle size={19} />
      </header>

      <div className={styles.replyComposer}>
        <div className={styles.replyComposerAvatar}>
          P
        </div>

        <div className={styles.replyComposerBody}>
          <textarea
            value={replyText}
            onChange={(event) =>
              setReplyText(event.target.value)
            }
            placeholder="Write a reply..."
            rows={4}
            aria-label="Write a reply"
          />

          <div className={styles.replyComposerFooter}>
            <span>
              Keep the discussion useful and
              respectful.
            </span>

            <button
              type="button"
              disabled={!canReply}
              onClick={handleSubmit}
            >
              <Send size={14} />
              Post Reply
            </button>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className={styles.replyList}>
          {replies.map((reply) => (
            <article
              key={reply.id}
              className={styles.replyCard}
            >
              <div className={styles.replyAvatar}>
                {reply.authorInitial}
              </div>

              <div className={styles.replyContent}>
                <header className={styles.replyMeta}>
                  <strong>
                    {reply.author}
                  </strong>

                  <span>
                    {reply.publishedLabel}
                  </span>
                </header>

                <p>{reply.content}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {replies.length === 0 && (
        <div className={styles.emptyReplies}>
          <MessageCircle size={20} />

          <strong>
            No replies yet
          </strong>

          <span>
            Start the discussion by sharing
            your thoughts.
          </span>
        </div>
      )}
    </section>
  );
}
