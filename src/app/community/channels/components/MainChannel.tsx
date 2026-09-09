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
    <section
      className="
        flex
        h-full
        min-h-0
        w-full
        min-w-0
        flex-1
        flex-col
        self-stretch
        overflow-hidden
      "
    >
      {/* =========================================================
          CHANNEL TOOLBAR
          ========================================================= */}

      <div className="shrink-0">
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
      </div>

      {/* =========================================================
          FILTER BAR
          ========================================================= */}

      <div
        className="
          relative
          shrink-0
          border-b
          border-white/[0.055]
          bg-white/[0.012]
          px-5
          py-2
          backdrop-blur-2xl
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            bg-white/[0.025]
          "
        />

        <MessageFilters />
      </div>

      {/* =========================================================
          ERROR
          ========================================================= */}

      {error && (
        <div
          className="
            shrink-0
            border-b
            border-red-400/10
            bg-red-400/[0.035]
            px-6
            py-2
            backdrop-blur-xl
          "
        >
          <p className="text-[10px] text-red-300/70">
            {error}
          </p>
        </div>
      )}

      {/* =========================================================
          MESSAGE FEED

          This is the ONLY flexible area.
          The composer therefore stays pinned to the bottom.
          ========================================================= */}

      <div
        className="
          relative
          min-h-0
          flex-1
          overflow-hidden
        "
      >
        <MessageFeed
          messages={messages}
          loading={loading}
          error={error}
          onReply={onReply}
        />
      </div>

      {/* =========================================================
          MESSAGE COMPOSER

          IMPORTANT:
          No margin-bottom.
          No absolute positioning.
          No extra bottom padding.

          This naturally anchors the composer to the
          bottom edge of the main column.
          ========================================================= */}

      <div
        className="
          relative
          z-20
          mt-auto
          shrink-0
          w-full
          border-t
          border-white/[0.065]
          bg-[#0b1016]/[0.48]
          backdrop-blur-3xl
        "
      >
        <MessageComposer
          onSend={onSendMessage}
        />
      </div>
    </section>
  );
}