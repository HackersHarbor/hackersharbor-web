"use client";

import type { Message } from "../types/message";

import { MessageCard } from "./MessageCard";

interface MessageFeedProps {
  messages: Message[];
  loading?: boolean;
  error?: string | null;
  onReply?: (message: Message) => void;
  onMore?: (message: Message) => void;
}

export function MessageFeed({
  messages,
  loading = false,
  error = null,
  onReply,
  onMore,
}: MessageFeedProps) {
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="
            rounded-xl
            border
            border-white/[0.07]
            bg-white/[0.025]
            px-4
            py-3
            text-[11px]
            text-white/35
            backdrop-blur-2xl
          "
        >
          Loading messages...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-5">
        <div
          className="
            rounded-xl
            border
            border-red-300/[0.12]
            bg-red-300/[0.035]
            px-4
            py-3
            text-[11px]
            text-red-200/65
            shadow-[0_15px_40px_rgba(0,0,0,.18)]
            backdrop-blur-2xl
          "
        >
          {error}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-5">
        <div
          className="
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.02]
            px-8
            py-7
            text-center
            shadow-[0_20px_50px_rgba(0,0,0,.16)]
            backdrop-blur-2xl
          "
        >
          <p className="text-[11px] text-white/40">
            No messages yet.
          </p>

          <p className="mt-1 text-[9px] text-white/22">
            Start the conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        h-full
        min-h-0
        overflow-y-auto
        px-1
        py-2
        scrollbar-thin
        scrollbar-track-transparent
        scrollbar-thumb-white/10
      "
    >
      <div className="space-y-2 px-1.5">
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            onReply={onReply}
            onMore={onMore}
          />
        ))}
      </div>
    </div>
  );
}