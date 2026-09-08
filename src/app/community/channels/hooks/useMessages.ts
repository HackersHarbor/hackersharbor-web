"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { Message } from "../types/message";
import type { IMessageService } from "../services/IMessageService";

interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export function useMessages(
  channelId: string,
  messageService: IMessageService,
): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>(
    [],
  );

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await messageService.getMessages(channelId);

      setMessages(result);
    } catch {
      setError("Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [channelId, messageService]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return;
      }

      try {
        setError(null);

        const newMessage =
          await messageService.sendMessage(
            channelId,
            trimmedContent,
          );

        setMessages((currentMessages) => [
          ...currentMessages,
          newMessage,
        ]);
      } catch {
        setError("Unable to send message.");
        throw new Error("Unable to send message.");
      }
    },
    [channelId, messageService],
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages: loadMessages,
  };
}