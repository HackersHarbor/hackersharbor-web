"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { IThreadService } from "../services/IThreadService";

interface UseThreadReplyCountsResult {
  replyCounts: Record<string, number>;
  loading: boolean;
  error: string | null;

  refreshCount: (
    parentMessageId: string,
  ) => Promise<void>;
}

export function useThreadReplyCounts(
  messageIds: string[],
  threadService: IThreadService,
): UseThreadReplyCountsResult {
  const [replyCounts, setReplyCounts] =
    useState<Record<string, number>>({});

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadCounts = useCallback(
    async () => {
      if (messageIds.length === 0) {
        setReplyCounts({});
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          messageIds.map(async (messageId) => {
            const count =
              await threadService.getReplyCount(
                messageId,
              );

            return [messageId, count] as const;
          }),
        );

        setReplyCounts(
          Object.fromEntries(results),
        );
      } catch {
        setError(
          "Unable to load thread reply counts.",
        );
      } finally {
        setLoading(false);
      }
    },
    [messageIds, threadService],
  );

  useEffect(() => {
    void loadCounts();
  }, [loadCounts]);

  const refreshCount = useCallback(
    async (parentMessageId: string) => {
      try {
        setError(null);

        const count =
          await threadService.getReplyCount(
            parentMessageId,
          );

        setReplyCounts(
          (currentCounts) => ({
            ...currentCounts,
            [parentMessageId]: count,
          }),
        );
      } catch {
        setError(
          "Unable to refresh thread reply count.",
        );
      }
    },
    [threadService],
  );

  return {
    replyCounts,
    loading,
    error,
    refreshCount,
  };
}