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
  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-white/50" />

          <p className="mt-3 text-[10px] text-white/30">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center px-5">
        <div className="rounded-xl border border-[#c77b7b]/20 bg-[#c77b7b]/[0.06] px-4 py-3 text-[11px] leading-5 text-[#c77b7b]/75 backdrop-blur-xl">
          {error}
        </div>
      </div>
    );
  }

  /* =========================================================
     EMPTY STATE
     ========================================================= */

  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center px-5">
        <div className="text-center">
          <div className="text-2xl opacity-40">
            💬
          </div>

          <p className="mt-2 text-[11px] text-white/40">
            No messages yet.
          </p>

          <p className="mt-1 text-[9px] text-white/25">
            Start the conversation.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     MESSAGE LIST
     ========================================================= */

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <div className="py-2">
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