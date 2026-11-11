
import type { KrakenEntry } from "./kraken";

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

export type KrakenSection = {
  id: string;
  title: string;
  description?: string;
  logs: KrakenEntry[];
};

