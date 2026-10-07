"use client";

import {
  BarChart3,
  Bookmark,
  Brain,
  Boxes,
  Code2,
  Database,
  FlaskConical,
  Gauge,
  Globe2,
  Home,
  Layers3,
  LineChart,
  MessageSquare,
  Network,
  Search,
  Server,
  Settings2,
  TrendingUp,
} from "lucide-react";

import styles from "../styles/ship-logs.module.css";

const discover = [
  ["All Logs", Home],
  ["Trending", TrendingUp],
  ["Recent", Gauge],
  ["Most Discussed", MessageSquare],
  ["Most Viewed", LineChart],
  ["Following", Network],
  ["Saved", Bookmark],
] as const;

const communities = [
  ["Data Science", BarChart3],
  ["Machine Learning", Brain],
  ["Deep Learning", Layers3],
  ["Data Analysis", LineChart],
  ["Data Engineering", Database],
  ["NLP", Search],
  ["Computer Vision", Globe2],
  ["MLOps", FlaskConical],
  ["Statistics", Gauge],
  ["Software Engineering", Code2],
  ["Web Development", Globe2],
  ["DevOps", Settings2],
  ["Cloud", Server],
  ["System Design", Boxes],
] as const;

export default function ShipLogsSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeading}>
        Discover
      </div>

      <nav className={styles.sidebarNav}>
        {discover.map(([label, Icon], index) => (
          <button
            key={label}
            className={`${styles.sidebarItem} ${
              index === 0
                ? styles.sidebarItemActive
                : ""
            }`}
            type="button"
          >
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarDivider} />

      <div className={styles.sidebarHeading}>
        Communities
      </div>

      <nav className={styles.sidebarNav}>
        {communities.map(([label, Icon]) => (
          <button
            key={label}
            className={styles.sidebarItem}
            type="button"
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}