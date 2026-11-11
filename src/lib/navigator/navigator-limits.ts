import type {
  NavigatorPlan,
} from "@/types/navigator";

export interface NavigatorPlanLimits {
  dailyLimit: number;
}

export const NAVIGATOR_PLAN_LIMITS: Record<
  NavigatorPlan,
  NavigatorPlanLimits
> = {
  free: {
    dailyLimit: 20,
  },

  pro: {
    dailyLimit: 200,
  },
};

export function getNavigatorDailyLimit(
  plan: NavigatorPlan
): number {
  return NAVIGATOR_PLAN_LIMITS[plan].dailyLimit;
}

export function getNextNavigatorReset(): string {
  const now = new Date();

  const nextReset = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1
    )
  );

  return nextReset.toISOString();
}

export function getNavigatorUsagePeriod(): string {
  const now = new Date();

  return [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("-");
}
