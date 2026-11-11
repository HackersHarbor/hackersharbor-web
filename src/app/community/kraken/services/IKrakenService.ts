
import type {
  KrakenContentType,
  KrakenEntry,
  KrakenDomain,
  KrakenDatasetFormat,
  KrakenDifficulty,
  KrakenTaskType,
} from "../types/kraken";

export type CreateKrakenEntryInput = {
  type: KrakenContentType;
  title: string;
  description: string;
  content: string;
  tags: string[];
  domain?: KrakenDomain;
  format?: KrakenDatasetFormat;
  recordCount?: number;
  size?: string;
  difficulty?: KrakenDifficulty;
  taskType?: KrakenTaskType;
  evaluationMetric?: string;
  source?: string;
};

export interface IKrakenService {
  getFeatured(): KrakenEntry[];
  getDataScience(): KrakenEntry[];
  getSoftwareEngineering(): KrakenEntry[];
  getRecentlyPublished(): KrakenEntry[];
  getTrending(): KrakenEntry[];
  search(query: string): KrakenEntry[];
  create(input: CreateKrakenEntryInput): KrakenEntry;
}
