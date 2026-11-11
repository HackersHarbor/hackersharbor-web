"use client";

import { Compass } from "lucide-react";

import styles from "./navigator.module.css";

interface NavigatorLauncherProps {
  onClick: () => void;
}

export function NavigatorLauncher({
  onClick,
}: NavigatorLauncherProps) {
  return (
    <button
      type="button"
      className={styles.launcher}
      onClick={onClick}
      aria-label="Open The Navigator assistant"
      title="The Navigator"
    >
      <span className={styles.launcherGlow} />
      <Compass size={23} strokeWidth={1.8} />
      <span className={styles.launcherLabel}>Navigator</span>
    </button>
  );
}
