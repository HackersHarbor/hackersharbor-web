import {
  dataScienceLogs,
  featuredLogs,
  recentLogs,
  softwareEngineeringLogs,
} from "../data/shipLogs";

import type { ShipLog } from "../types/shipLog";
import type {
  CreateShipLogInput,
  IShipLogService,
} from "./IShipLogService";

export class ShipLogService
  implements IShipLogService
{
  getFeatured(): ShipLog[] {
    return featuredLogs;
  }

  getDataScience(): ShipLog[] {
    return dataScienceLogs;
  }

  getSoftwareEngineering(): ShipLog[] {
    return softwareEngineeringLogs;
  }

  getRecentlyPublished(): ShipLog[] {
    return recentLogs;
  }

  getTrending(): ShipLog[] {
    return [
      ...featuredLogs,
      ...dataScienceLogs,
      ...softwareEngineeringLogs,
    ]
      .sort(
        (a, b) =>
          b.signals - a.signals,
      )
      .slice(0, 4);
  }

  search(query: string): ShipLog[] {
    const normalized =
      query.trim().toLowerCase();

    const all = [
      ...featuredLogs,
      ...dataScienceLogs,
      ...softwareEngineeringLogs,
      ...recentLogs,
    ];

    if (!normalized) {
      return all;
    }

    return all.filter((log) =>
      [
        log.title,
        log.description,
        log.content,
        log.author,
        ...log.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }

  create(
    input: CreateShipLogInput,
  ): ShipLog {
    const newLog: ShipLog = {
      id: `ship-log-${Date.now()}`,
      type: input.type,
      title: input.title.trim(),
      description:
        input.description.trim(),
      content: input.content.trim(),
      author: "You",
      authorInitial: "P",
      publishedLabel: "Just now",
      communities: [
        "software-engineering",
      ],
      tags: input.tags
        .map((tag) => tag.trim())
        .filter(Boolean),
      signals: 0,
      replies: 0,
      views: "0",
    };

    return newLog;
  }
}