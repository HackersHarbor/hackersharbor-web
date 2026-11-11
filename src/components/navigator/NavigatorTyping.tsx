"use client";

import styles from "./navigator.module.css";

export function NavigatorTyping() {
  return (
    <div
      className={styles.typingRow}
      role="status"
      aria-label="The Navigator is responding"
    >
      <div className={styles.messageAvatar}>N</div>

      <div className={styles.typingBubble}>
        <span className={styles.typingLabel}>
          The Navigator is thinking
        </span>

        <span className={styles.typingDots}>
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
