"use client";

import type { Message } from "../types/message";

import { ThreadComposer } from "./ThreadComposer";
import { ThreadHeader } from "./ThreadHeader";
import { ThreadMessageList } from "./ThreadMessageList";
import { MessageCard } from "./MessageCard";

interface ThreadPanelProps {
  parentMessage?: Message | null;
  messages: Message[];
  title?: string;
  loading?: boolean;
  error?: string | null;
  onClose?: () => void;
  onSendReply: (content: string) => Promise<void> | void;
  onMore?: () => void;
}

export function ThreadPanel({
  parentMessage = null,
  messages,
  title = "Thread",
  loading = false,
  error = null,
  onClose,
  onSendReply,
  onMore,
}: ThreadPanelProps) {
  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-white/[0.08] bg-slate-950/35 backdrop-blur-2xl">
      {/* =========================================================
          HEADER
          ========================================================= */}

      <ThreadHeader
        title={title}
        replyCount={messages.length}
        onClose={onClose}
        onMore={onMore}
      />

      {/* =========================================================
          THREAD CONTENT
          ========================================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* =======================================================
            ORIGINAL MESSAGE
            ======================================================= */}

        {parentMessage && (
          <section className="border-b border-white/[0.08]">
            <div className="px-4 pb-2 pt-3">
              <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">
                Original message
              </span>
            </div>

            <MessageCard
              message={parentMessage}
              onReply={undefined}
              onMore={undefined}
            />
          </section>
        )}

        {/* =======================================================
            REPLIES
            ======================================================= */}

        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <span className="text-[10px] text-white/30">
              Loading thread...
            </span>
          </div>
        ) : error ? (
          <div className="px-4 py-5">
            <div className="rounded-xl border border-[#c77b7b]/20 bg-[#c77b7b]/[0.06] px-4 py-3 text-[10px] leading-5 text-[#c77b7b]/75">
              {error}
            </div>
          </div>
        ) : (
          <ThreadMessageList
            messages={messages}
          />
        )}
      </div>

      {/* =========================================================
          REPLY COMPOSER
          ========================================================= */}

      <ThreadComposer
        onSend={onSendReply}
      />
    </aside>
  );
}