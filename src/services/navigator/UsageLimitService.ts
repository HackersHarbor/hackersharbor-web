import type {
  NavigatorPlan,
  NavigatorUsage,
  SubscriptionProvider,
} from "@/types/navigator";

import {
  getNavigatorDailyLimit,
  getNavigatorUsagePeriod,
  getNextNavigatorReset,
} from "@/lib/navigator/navigator-limits";

import { NavigatorException } from "@/lib/navigator/navigator-errors";

/**
 * Temporary subscription provider.
 * Users default to Free until a real subscription source is connected.
 */
class DefaultSubscriptionProvider implements SubscriptionProvider {
  async getUserPlan(_userId: string): Promise<NavigatorPlan> {
    return "free";
  }
}

interface UsageRecord {
  used: number;
  period: string;
}

/**
 * Tracks and enforces daily Navigator message limits.
 *
 * NOTE:
 * This in-memory implementation is suitable for initial development.
 * Production deployments should use persistent database or Redis storage.
 */
export class UsageLimitService {
  private readonly subscriptionProvider: SubscriptionProvider;
  private readonly usage = new Map<string, UsageRecord>();

  constructor(
    subscriptionProvider: SubscriptionProvider =
      new DefaultSubscriptionProvider()
  ) {
    this.subscriptionProvider = subscriptionProvider;
  }

  private getUsageKey(userId: string, period: string): string {
    return `${userId}:${period}`;
  }

  private getRecord(userId: string): UsageRecord {
    const period = getNavigatorUsagePeriod();
    const key = this.getUsageKey(userId, period);

    let record = this.usage.get(key);

    if (!record || record.period !== period) {
      record = {
        used: 0,
        period,
      };

      this.usage.set(key, record);
    }

    return record;
  }

  async getUsage(userId: string): Promise<NavigatorUsage> {
    const plan = await this.subscriptionProvider.getUserPlan(userId);
    const limit = getNavigatorDailyLimit(plan);
    const record = this.getRecord(userId);

    return {
      plan,
      used: record.used,
      limit,
      remaining: Math.max(0, limit - record.used),
      resetAt: getNextNavigatorReset(),
    };
  }

  async assertCanUse(userId: string): Promise<NavigatorUsage> {
    const currentUsage = await this.getUsage(userId);

    if (currentUsage.remaining <= 0) {
      throw new NavigatorException(
        "RATE_LIMITED",
        `You have reached your daily limit of ${currentUsage.limit} messages. Your limit resets at ${currentUsage.resetAt}.`,
        429
      );
    }

    return currentUsage;
  }

  async consume(userId: string): Promise<NavigatorUsage> {
    const currentUsage = await this.assertCanUse(userId);
    const record = this.getRecord(userId);

    record.used += 1;

    return {
      ...currentUsage,
      used: record.used,
      remaining: Math.max(0, currentUsage.limit - record.used),
    };
  }
}
