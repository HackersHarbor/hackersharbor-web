export type ShipLogType =
  | "notebook"
  | "project"
  | "tutorial"
  | "discussion"
  | "experiment"
  | "code-snippet";

export type ShipLogCommunity =
  | "data-science"
  | "software-engineering";

export type ShipLog = {
  id: string;
  type: ShipLogType;
  title: string;
  description: string;
  content: string;
  author: string;
  authorInitial: string;
  publishedLabel: string;
  communities: ShipLogCommunity[];
  tags: string[];
  signals: number;
  replies: number;
  views: string;
};