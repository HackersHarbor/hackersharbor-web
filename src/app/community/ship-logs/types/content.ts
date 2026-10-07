import type { ShipLog } from "./shipLog";

export type CommunityTopic = {
  label: string;
  count: string;
};

export type Author = {
  name: string;
  initial: string;
  specialty: string;
  logs: number;
};

export type ShipLogSection = {
  id: string;
  title: string;
  description?: string;
  logs: ShipLog[];
};