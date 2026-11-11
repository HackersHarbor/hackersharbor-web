
import {
  dataScienceLogs,
  featuredLogs,
  recentLogs,
  softwareEngineeringLogs,
} from "../data/kraken";

import type {
  KrakenEntry,
  KrakenDomain,
  KrakenDatasetFormat,
  KrakenDifficulty,
  KrakenTaskType,
} from "../types/kraken";

import type {
  CreateKrakenEntryInput,
  IKrakenService,
} from "./IKrakenService";

export class KrakenService implements IKrakenService {
  getFeatured(): KrakenEntry[] {
    return featuredLogs;
  }

  getDataScience(): KrakenEntry[] {
    return dataScienceLogs;
  }

  getSoftwareEngineering(): KrakenEntry[] {
    return softwareEngineeringLogs;
  }

  getRecentlyPublished(): KrakenEntry[] {
    return recentLogs;
  }

  getTrending(): KrakenEntry[] {
    return [
      ...featuredLogs,
      ...dataScienceLogs,
      ...softwareEngineeringLogs,
    ]
      .sort((a, b) => b.signals - a.signals)
      .slice(0, 4);
  }

  search(query: string): KrakenEntry[] {
    const normalized = query.trim().toLowerCase();

    const all = [
      ...featuredLogs,
      ...dataScienceLogs,
      ...softwareEngineeringLogs,
      ...recentLogs,
    ];

    if (!normalized) {
      return all;
    }

    return all.filter((entry) =>
      [
        entry.title,
        entry.description,
        entry.content,
        entry.author,
        entry.domain,
        entry.format,
        entry.taskType,
        ...entry.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }

  create(input: CreateKrakenEntryInput): KrakenEntry {
    const domain: KrakenDomain = input.domain ?? "data-science";
    const format: KrakenDatasetFormat = input.format ?? "CSV";
    const difficulty: KrakenDifficulty =
      input.difficulty ?? "beginner";
    const taskType: KrakenTaskType =
      input.taskType ?? "exploratory-analysis";

    return {
      id: `kraken-${Date.now()}`,
      type: input.type,
      title: input.title.trim(),
      description: input.description.trim(),
      content: input.content.trim(),
      author: "You",
      authorInitial: "P",
      publishedLabel: "Just now",
      domain,
      format,
      recordCount: input.recordCount ?? 0,
      size: input.size?.trim() || "Not specified",
      difficulty,
      taskType,
      evaluationMetric: input.evaluationMetric?.trim() || undefined,
      source: input.source?.trim() || undefined,
      communities: [domain],
      tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
      signals: 0,
      replies: 0,
      views: "0",
    };
  }
}
