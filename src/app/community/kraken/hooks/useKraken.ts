
"use client";

import { useMemo } from "react";

import { KrakenService } from "../services/KrakenService";

const service = new KrakenService();

export function useKraken(query: string) {
  return useMemo(
    () => ({
      featured: service.getFeatured(),
      dataScience: service.getDataScience(),
      softwareEngineering: service.getSoftwareEngineering(),
      recent: service.getRecentlyPublished(),
      trending: service.getTrending(),
      searchResults: service.search(query),
    }),
    [query],
  );
}
