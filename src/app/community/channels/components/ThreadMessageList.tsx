"use client";

import type { Message } from "../types/message";

import { ThreadMessage } from "./ThreadMessage";

interface ThreadMessageListProps {
  messages: Message[];
}

export function ThreadMessageList({
  messages,
}: ThreadMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-5">
        <div className="text-center">
          <div className="text-xl opacity-35">
            💬
          </div>

          <p className="mt-2 text-[10px] text-white/35">
            No replies yet.
          </p>

          <p className="mt-1 text-[9px] text-white/20">
            Start the conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="divide-y divide-white/[0.045]">
        {messages.map((message) => (
          <ThreadMessage
            key={message.id}
            message={message}
          />
        ))}
      </div>
    </div>
  );
}