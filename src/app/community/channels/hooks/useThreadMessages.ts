"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { Message } from "../types/message";
import type { IThreadService } from "../services/IThreadService";

interface UseThreadMessagesResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendReply: (content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export function useThreadMessages(
  parentMessageId: string | null,
  threadService: IThreadService,
): UseThreadMessagesResult {
  const [messages, setMessages] = useState<
    Message[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!parentMessageId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await threadService.getReplies(
          parentMessageId,
        );

      setMessages(result);
    } catch {
      setMessages([]);
      setError(
        "Unable to load thread replies.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    parentMessageId,
    threadService,
  ]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const sendReply = useCallback(
    async (content: string) => {
      const trimmedContent =
        content.trim();

      if (
        !parentMessageId ||
        !trimmedContent
      ) {
        return;
      }

      try {
        setError(null);

        const reply =
          await threadService.sendReply(
            parentMessageId,
            trimmedContent,
          );

        setMessages(
          (currentMessages) => [
            ...currentMessages,
            reply,
          ],
        );
      } catch {
        setError(
          "Unable to send reply.",
        );

        throw new Error(
          "Unable to send reply.",
        );
      }
    },
    [
      parentMessageId,
      threadService,
    ],
  );

  return {
    messages,
    loading,
    error,
    sendReply,
    refreshMessages: loadMessages,
  };
}