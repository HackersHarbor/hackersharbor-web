import type { ShipLog } from "../types/shipLog";

export type CreateShipLogInput = {
  type: ShipLog["type"];
  title: string;
  description: string;
  content: string;
  tags: string[];
};

export interface IShipLogService {
  getFeatured(): ShipLog[];
  getDataScience(): ShipLog[];
  getSoftwareEngineering(): ShipLog[];
  getRecentlyPublished(): ShipLog[];
  getTrending(): ShipLog[];
  search(query: string): ShipLog[];
  create(input: CreateShipLogInput): ShipLog;
}