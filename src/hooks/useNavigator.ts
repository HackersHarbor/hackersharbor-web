"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  NavigatorMessage,
  NavigatorPageContext,
} from "@/types/navigator";

import { ConversationService } from "@/services/navigator/ConversationService";

interface UseNavigatorOptions {
  context?: NavigatorPageContext;
}

interface UseNavigatorReturn {
  messages: NavigatorMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  stopGeneration: () => void;
  setContext: (context: NavigatorPageContext) => void;
}

interface NavigatorApiError {
  error?: {
    code?: string;
    message?: string;
  };
}

export function useNavigator(
  options: UseNavigatorOptions = {}
): UseNavigatorReturn {
  const [messages, setMessages] = useState<NavigatorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContextState] = useState<NavigatorPageContext>(
    options.context ?? {}
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const setContext = useCallback(
    (nextContext: NavigatorPageContext) => {
      setContextState(nextContext);
    },
    []
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    if (mountedRef.current) {
      setIsLoading(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent || isLoading) {
        return;
      }

      if (trimmedContent.length > 8000) {
        setError("Your message is too long. Please shorten it.");
        return;
      }

      const userMessage = ConversationService.createMessage(
        "user",
        trimmedContent
      );

      const assistantMessage = ConversationService.createMessage(
        "assistant",
        ""
      );

      const nextMessages = [
        ...messages,
        userMessage,
        assistantMessage,
      ];

      setMessages(nextMessages);
      setError(null);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/navigator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              ...messages,
              userMessage,
            ].map(({ id, role, content: messageContent }) => ({
              id,
              role,
              content: messageContent,
            })),
            context,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(
            () => null
          ) as NavigatorApiError | null;

          throw new Error(
            data?.error?.message ??
            "Navigator could not process your request."
          );
        }

        if (!response.body) {
          throw new Error(
            "The response stream is unavailable."
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          assistantContent += decoder.decode(
            value,
            { stream: true }
          );

          if (mountedRef.current) {
            setMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === assistantMessage.id
                  ? {
                      ...message,
                      content: assistantContent,
                    }
                  : message
              )
            );
          }
        }

        assistantContent += decoder.decode();

        if (mountedRef.current && assistantContent) {
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: assistantContent,
                  }
                : message
            )
          );
        }

        if (mountedRef.current && !assistantContent.trim()) {
          setError("Navigator returned an empty response. Please try again.");

          setMessages((currentMessages) =>
            currentMessages.filter(
              (message) => message.id !== assistantMessage.id
            )
          );
        }
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
          // A deliberate stop is not an application error.
        } else if (mountedRef.current) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Something went wrong. Please try again."
          );

          setMessages((currentMessages) =>
            currentMessages.filter(
              (message) =>
                message.id !== assistantMessage.id ||
                Boolean(message.content.trim())
            )
          );
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [context, isLoading, messages]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    stopGeneration,
    setContext,
  };
}
