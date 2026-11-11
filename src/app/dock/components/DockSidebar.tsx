
"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  FileCode2,
  Folder,
  LayoutDashboard,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  X,
} from "lucide-react";

import type { StudioSection } from "../types/navigation";
import styles from "./dock-sidebar.module.css";

type DockSidebarProps = {
  activeSection: StudioSection;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate: (section: StudioSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  datasetsCount?: number;
  notebooksCount?: number;
  accountName?: string;
  accountInitials?: string;
};

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  section?: StudioSection;
  count?: number;
  soon?: boolean;
};

const workspaceItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, section: "overview" },
  { label: "Data Explorer", icon: Table2, section: "explorer" },
  { label: "Datasets", icon: Folder, count: 0 },
  { label: "Notebooks", icon: FileCode2, section: "notebooks", count: 0 },
];

const analyticsItems: NavItem[] = [
  { label: "Statistics", icon: BarChart3, section: "statistics", soon: true },
  {
    label: "Machine Learning",
    icon: Sparkles,
    section: "machine-learning",
    soon: true,
  },
  {
    label: "Deep Learning",
    icon: Layers,
    section: "deep-learning",
    soon: true,
  },
  {
    label: "AI Evaluation",
    icon: ShieldCheck,
    section: "ai-evaluation",
    soon: true,
  },
];

export default function DockSidebar({
  activeSection,
  collapsed,
  onToggleCollapsed,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  datasetsCount = 0,
  notebooksCount = 0,
  accountName = "Personal account",
  accountInitials = "H",
}: DockSidebarProps) {
  const [soonMessage, setSoonMessage] = useState("");

  useEffect(() => {
    if (!soonMessage) return;

    const timeout = window.setTimeout(() => setSoonMessage(""), 1800);

    return () => window.clearTimeout(timeout);
  }, [soonMessage]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseMobile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

  function renderItem(item: NavItem) {
    const Icon = item.icon;
    const isActive = item.section === activeSection;

    const count =
      item.label === "Datasets"
        ? datasetsCount
        : item.label === "Notebooks"
          ? notebooksCount
          : item.count;

    if (item.soon) {
      return (
        <button
          key={item.label}
          type="button"
          className={`${styles.navItem} ${styles.soonItem}`}
          title={collapsed ? `${item.label} — Coming soon` : undefined}
          aria-label={`${item.label}, coming soon`}
          onClick={() => setSoonMessage(`${item.label}: Coming soon`)}
        >
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />

          {!collapsed && (
            <>
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.soonPill}>Soon</span>
            </>
          )}
        </button>
      );
    }

    if (!item.section) {
      return (
        <button
          key={item.label}
          type="button"
          className={styles.navItem}
          title={collapsed ? item.label : undefined}
          onClick={() =>
            setSoonMessage(
              item.label === "Datasets"
                ? "Datasets list is not connected yet"
                : "Documentation is not connected yet",
            )
          }
        >
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />

          {!collapsed && (
            <>
              <span className={styles.navLabel}>{item.label}</span>

              {item.label === "Datasets" && (
                <span className={styles.navCount}>{datasetsCount}</span>
              )}
            </>
          )}
        </button>
      );
    }

    return (
      <button
        key={item.label}
        type="button"
        className={`${styles.navItem} ${
          isActive ? styles.navItemActive : ""
        }`}
        title={collapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          onNavigate(item.section!);
          onCloseMobile();
        }}
      >
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />

        {!collapsed && (
          <>
            <span className={styles.navLabel}>{item.label}</span>

            {typeof count === "number" && (
              <span className={styles.navCount}>{count}</span>
            )}
          </>
        )}
      </button>
    );
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className={styles.mobileBackdrop}
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          collapsed ? styles.collapsed : ""
        } ${mobileOpen ? styles.mobileOpen : ""}`}
        aria-label="Dock navigation"
      >
        <div className={styles.sidebarHeader}>
  <button
    type="button"
    className={styles.collapseButton}
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>

          <button
            type="button"
            className={styles.mobileClose}
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Only the middle navigation scrolls. */}
        <nav className={styles.navigation}>
          <div className={styles.navGroup}>
            {!collapsed && (
              <div className={styles.groupLabel}>WORKSPACE</div>
            )}

            {workspaceItems.map(renderItem)}
          </div>

          <div className={styles.navGroup}>
            {!collapsed && (
              <div className={styles.groupLabel}>ANALYTICS</div>
            )}

            {analyticsItems.map(renderItem)}
          </div>
        </nav>

        {/* Pinned bottom navigation. */}
        <div className={styles.bottomGroup}>
          {renderItem({
            label: "Documentation",
            icon: BookOpen,
          })}

          {renderItem({
            label: "Settings",
            icon: Settings,
            section: "settings",
          })}
        </div>

        {/* Pinned account row. */}
        <div className={styles.accountRow} title={accountName}>
          <span className={styles.accountAvatar}>
            {accountInitials.slice(0, 2).toUpperCase()}
          </span>

          {!collapsed && (
            <>
              <span className={styles.accountName}>{accountName}</span>

              <span className={styles.accountMenu} aria-hidden="true">
                ···
              </span>
            </>
          )}
        </div>

        {soonMessage && (
          <div role="status" className={styles.toast}>
            {soonMessage}
          </div>
        )}
      </aside>
    </>
  );
}
