"use client";

import type { Message } from "../types/message";
import type { Channel } from "../types/channel";

import { MessageFeed } from "./MessageFeed";
import { MessageComposer } from "./MessageComposer";
import { ChannelToolbar } from "./ChannelToolbar";
import { MessageFilters } from "./MessageFilters";

interface MainChannelProps {
  channel: Channel;
  messages: Message[];
  loading: boolean;
  error: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onReply: (message: Message) => void;
}

export function MainChannel({
  channel,
  messages,
  loading,
  error,
  onSendMessage,
  onReply,
}: MainChannelProps) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      {/* =========================================================
          CHANNEL TOOLBAR
          ========================================================= */}

      <ChannelToolbar
        channel={channel}
        onSearch={() => {
          /*
           * Reserved for message search.
           */
        }}
        onPinned={() => {
          /*
           * Reserved for pinned messages.
           */
        }}
        onNotifications={() => {
          /*
           * Reserved for channel notifications.
           */
        }}
        onMore={() => {
          /*
           * Reserved for channel actions.
           */
        }}
      />

      {/* =========================================================
          MESSAGE FILTERS
          ========================================================= */}

      <div className="shrink-0 border-b border-white/[0.055] bg-white/[0.008] px-5 py-2">
        <MessageFilters />
      </div>

      {/* =========================================================
          ERROR
          ========================================================= */}

      {error && (
        <div className="shrink-0 border-b border-red-400/10 bg-red-400/[0.035] px-6 py-2">
          <p className="text-[10px] text-red-300/70">
            {error}
          </p>
        </div>
      )}

      {/* =========================================================
          MESSAGE FEED
          ========================================================= */}

      <div className="min-h-0 flex-1">
        <MessageFeed
          messages={messages}
          loading={loading}
          onReply={onReply}
        />
      </div>

      {/* =========================================================
          MESSAGE COMPOSER
          ========================================================= */}

      <div className="shrink-0">
        <MessageComposer
          onSend={onSendMessage}
        />
      </div>
    </section>
  );
}