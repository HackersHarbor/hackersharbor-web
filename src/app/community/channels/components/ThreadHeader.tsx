"use client";

import {
  MessageCircle,
  MoreHorizontal,
  X,
} from "lucide-react";

interface ThreadHeaderProps {
  title?: string;
  replyCount?: number;
  onClose?: () => void;
  onMore?: () => void;
}

export function ThreadHeader({
  title = "Thread",
  replyCount = 0,
  onClose,
  onMore,
}: ThreadHeaderProps) {
  return (
    <header className="relative flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#11151a]/[0.34] px-4 backdrop-blur-2xl">
      {/* Subtle header highlight */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]"
      />

      {/* =======================================================
          TITLE
          ======================================================= */}

      <div className="flex min-w-0 items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.045] text-white/45 shadow-[0_5px_18px_rgba(0,0,0,.12)]">
          <MessageCircle
            size={15}
            strokeWidth={1.7}
          />

          {/* Tiny accent indicator */}

          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#d5b86d]/75 shadow-[0_0_8px_rgba(213,184,109,.3)]"
          />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-[12px] font-semibold tracking-[-0.01em] text-white/85">
            {title}
          </h2>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[9px] text-white/28">
              {replyCount}{" "}
              {replyCount === 1
                ? "reply"
                : "replies"}
            </span>

            <span
              aria-hidden="true"
              className="h-0.5 w-0.5 rounded-full bg-white/20"
            />

            <span className="text-[9px] text-white/20">
              Thread
            </span>
          </div>
        </div>
      </div>

      {/* =======================================================
          ACTIONS
          ======================================================= */}

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Thread options"
          title="Thread options"
          onClick={onMore}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/28 transition-all duration-150 hover:border-white/[0.07] hover:bg-white/[0.055] hover:text-white/70"
        >
          <MoreHorizontal size={15} />
        </button>

        <button
          type="button"
          aria-label="Close thread"
          title="Close thread"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-white/28 transition-all duration-150 hover:border-white/[0.07] hover:bg-white/[0.055] hover:text-white/75"
        >
          <X size={15} />
        </button>
      </div>
    </header>
  );
}