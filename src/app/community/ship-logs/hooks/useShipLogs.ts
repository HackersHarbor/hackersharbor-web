"use client";

import { useMemo } from "react";

import { ShipLogService } from "../services/ShipLogService";

const service = new ShipLogService();

export function useShipLogs(query: string) {
  return useMemo(
    () => ({
      featured: service.getFeatured(),
      dataScience: service.getDataScience(),
      softwareEngineering:
        service.getSoftwareEngineering(),
      recent: service.getRecentlyPublished(),
      trending: service.getTrending(),
      searchResults: service.search(query),
    }),
    [query],
  );
}