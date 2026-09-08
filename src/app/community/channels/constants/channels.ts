import type { Channel } from "../types/channel";

export const CHANNELS: Channel[] = [
  {
    id: "general",
    name: "general",
    description: "General community discussion",
    icon: "hash",
    online: true,
    unreadCount: 3,
  },
  {
    id: "python",
    name: "python",
    description: "Python programming",
    icon: "code",
    online: true,
    unreadCount: 0,
  },
  {
    id: "sql",
    name: "sql",
    description: "SQL and databases",
    icon: "database",
    online: true,
    unreadCount: 0,
  },
  {
    id: "dsa",
    name: "dsa",
    description: "Data structures and algorithms",
    icon: "git-fork",
    online: true,
    unreadCount: 0,
  },
];